#!/usr/bin/env python3
import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path


NS = {
    "content": "http://purl.org/rss/1.0/modules/content/",
    "dc": "http://purl.org/dc/elements/1.1/",
    "excerpt": "http://wordpress.org/export/1.2/excerpt/",
    "wp": "http://wordpress.org/export/1.2/",
}

TEXT_FIELDS = {
    "post_id",
    "post_date",
    "post_date_gmt",
    "comment_status",
    "ping_status",
    "post_name",
    "status",
    "post_parent",
    "menu_order",
    "post_type",
    "post_password",
    "is_sticky",
    "attachment_url",
}

PRODUCT_META_KEYS = [
    "_sku",
    "_price",
    "_regular_price",
    "_sale_price",
    "_stock",
    "_stock_status",
    "_manage_stock",
    "_weight",
    "_length",
    "_width",
    "_height",
    "_virtual",
    "_downloadable",
    "_product_version",
    "_thumbnail_id",
    "_product_image_gallery",
]


DESIGN_TYPES = {
    "wp_global_styles",
    "wp_navigation",
    "wp_font_family",
    "wp_font_face",
    "elementor_library",
    "nav_menu_item",
    "acf-field-group",
    "acf-field",
}


class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, data):
        clean = data.strip()
        if clean:
            self.parts.append(clean)

    def text(self):
        return re.sub(r"\s+", " ", " ".join(self.parts)).strip()


def get_text(node, path, default=""):
    found = node.find(path, NS)
    return found.text if found is not None and found.text is not None else default


def child_text(node, tag, default=""):
    found = node.find(tag, NS)
    return found.text if found is not None and found.text is not None else default


def as_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def slugify(value, fallback):
    value = str(value or fallback or "").strip().lower()
    value = re.sub(r"[^\w\s-]", "", value, flags=re.UNICODE)
    value = re.sub(r"[\s_]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or str(fallback)


def html_to_text(html):
    parser = TextExtractor()
    parser.feed(html or "")
    return parser.text()


def parse_json_string(value):
    if not value or not isinstance(value, str):
        return None
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return None


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_authors(channel):
    authors = []
    for author in channel.findall("wp:author", NS):
        authors.append(
            {
                "id": as_int(get_text(author, "wp:author_id")),
                "login": get_text(author, "wp:author_login"),
                "email": get_text(author, "wp:author_email"),
                "displayName": get_text(author, "wp:author_display_name"),
                "firstName": get_text(author, "wp:author_first_name"),
                "lastName": get_text(author, "wp:author_last_name"),
            }
        )
    return authors


def parse_terms(channel):
    terms = defaultdict(list)

    for category in channel.findall("wp:category", NS):
        terms["category"].append(
            {
                "id": as_int(get_text(category, "wp:term_id")),
                "slug": get_text(category, "wp:category_nicename"),
                "parent": get_text(category, "wp:category_parent"),
                "name": get_text(category, "wp:cat_name"),
            }
        )

    for tag in channel.findall("wp:tag", NS):
        terms["post_tag"].append(
            {
                "id": as_int(get_text(tag, "wp:term_id")),
                "slug": get_text(tag, "wp:tag_slug"),
                "name": get_text(tag, "wp:tag_name"),
            }
        )

    for term in channel.findall("wp:term", NS):
        taxonomy = get_text(term, "wp:term_taxonomy") or "term"
        terms[taxonomy].append(
            {
                "id": as_int(get_text(term, "wp:term_id")),
                "slug": get_text(term, "wp:term_slug"),
                "parent": get_text(term, "wp:term_parent"),
                "name": get_text(term, "wp:term_name"),
            }
        )

    return dict(terms)


def parse_item(item):
    post_id = as_int(get_text(item, "wp:post_id"))
    title = child_text(item, "title")
    post_name = get_text(item, "wp:post_name")
    post_type = get_text(item, "wp:post_type")
    slug = slugify(post_name or title, post_id)
    content_html = get_text(item, "content:encoded")

    meta = defaultdict(list)
    meta_rows = []
    for postmeta in item.findall("wp:postmeta", NS):
        key = get_text(postmeta, "wp:meta_key")
        value = get_text(postmeta, "wp:meta_value")
        meta[key].append(value)
        meta_rows.append({"key": key, "value": value})

    compact_meta = {key: values[0] if len(values) == 1 else values for key, values in meta.items()}

    terms = []
    for category in item.findall("category"):
        terms.append(
            {
                "domain": category.attrib.get("domain", ""),
                "slug": category.attrib.get("nicename", ""),
                "name": category.text or "",
            }
        )

    parsed = {
        "id": post_id,
        "title": title,
        "slug": slug,
        "link": child_text(item, "link"),
        "guid": child_text(item, "guid"),
        "author": get_text(item, "dc:creator"),
        "publishedAt": child_text(item, "pubDate"),
        "postDate": get_text(item, "wp:post_date"),
        "postDateGmt": get_text(item, "wp:post_date_gmt"),
        "status": get_text(item, "wp:status"),
        "type": post_type,
        "parentId": as_int(get_text(item, "wp:post_parent")),
        "menuOrder": as_int(get_text(item, "wp:menu_order")),
        "excerpt": get_text(item, "excerpt:encoded"),
        "contentHtml": content_html,
        "contentText": html_to_text(content_html),
        "terms": terms,
        "meta": compact_meta,
        "metaRows": meta_rows,
        "attachmentUrl": get_text(item, "wp:attachment_url"),
    }

    for field in TEXT_FIELDS:
        value = get_text(item, f"wp:{field}")
        if value and field not in {"attachment_url"}:
            parsed[f"wp_{field}"] = value

    return parsed


def primary_term(item, domain):
    for term in item["terms"]:
        if term["domain"] == domain:
            return term["name"]
    return ""


def product_summary(item, media_by_id):
    meta = item["meta"]
    image_ids = []
    if meta.get("_thumbnail_id"):
        image_ids.append(as_int(meta.get("_thumbnail_id")))
    gallery = meta.get("_product_image_gallery", "")
    if gallery:
        image_ids.extend(as_int(value) for value in str(gallery).split(",") if value.strip())

    images = []
    for image_id in image_ids:
        media = media_by_id.get(image_id)
        if media and media.get("url"):
            images.append(media)

    return {
        "id": item["id"],
        "title": item["title"],
        "slug": item["slug"],
        "status": item["status"],
        "link": item["link"],
        "descriptionHtml": item["contentHtml"],
        "descriptionText": item["contentText"],
        "shortDescriptionHtml": item["excerpt"],
        "sku": meta.get("_sku", ""),
        "price": meta.get("_price", ""),
        "regularPrice": meta.get("_regular_price", ""),
        "salePrice": meta.get("_sale_price", ""),
        "stock": meta.get("_stock", ""),
        "stockStatus": meta.get("_stock_status", ""),
        "brand": primary_term(item, "product_brand"),
        "categories": [term for term in item["terms"] if term["domain"] == "product_cat"],
        "tags": [term for term in item["terms"] if term["domain"] == "product_tag"],
        "attributes": {key.replace("attribute_", ""): value for key, value in meta.items() if key.startswith("attribute_")},
        "images": images,
        "meta": {key: meta.get(key, "") for key in PRODUCT_META_KEYS if key in meta},
        "rawMeta": item["meta"],
    }


def page_summary(item, media_by_id):
    meta = item["meta"]
    featured_id = as_int(meta.get("_thumbnail_id"))
    featured = media_by_id.get(featured_id)
    return {
        "id": item["id"],
        "title": item["title"],
        "slug": item["slug"],
        "status": item["status"],
        "link": item["link"],
        "postDate": item["postDate"],
        "publishedAt": item["publishedAt"],
        "parentId": item["parentId"],
        "menuOrder": item["menuOrder"],
        "excerpt": item["excerpt"],
        "contentHtml": item["contentHtml"],
        "contentText": item["contentText"],
        "featuredMedia": featured,
        "terms": item["terms"],
        "rawMeta": item["meta"],
    }


def media_summary(item):
    meta = item["meta"]
    attached_file = meta.get("_wp_attached_file", "")
    local_path = f"public/uploads/{attached_file}" if attached_file else ""
    return {
        "id": item["id"],
        "title": item["title"],
        "slug": item["slug"],
        "url": item["attachmentUrl"],
        "localPath": local_path,
        "localUrl": local_path.removeprefix("public/") if local_path else "",
        "mime": meta.get("_wp_attachment_metadata", ""),
        "alt": meta.get("_wp_attachment_image_alt", ""),
        "attachedFile": attached_file,
        "parentId": item["parentId"],
        "date": item["postDate"],
        "rawMeta": item["meta"],
    }


def collect_elementor_tokens(nodes):
    colors = set()
    fonts = set()
    images = []
    shortcodes = set()
    widget_types = set()

    def walk(value):
        if isinstance(value, dict):
            if value.get("widgetType"):
                widget_types.add(value["widgetType"])
            settings = value.get("settings")
            if isinstance(settings, dict):
                for key, setting in settings.items():
                    if isinstance(setting, str):
                        if re.fullmatch(r"#[0-9a-fA-F]{3,8}", setting):
                            colors.add(setting.upper())
                        if key.endswith("font_family") and setting:
                            fonts.add(setting)
                        if key == "shortcode" and setting:
                            shortcodes.add(setting.strip())
                    if key == "image" and isinstance(setting, dict) and setting.get("url"):
                        images.append(
                            {
                                "url": setting.get("url", ""),
                                "id": setting.get("id", ""),
                                "alt": setting.get("alt", ""),
                            }
                        )
            for child in value.values():
                walk(child)
        elif isinstance(value, list):
            for child in value:
                walk(child)

    walk(nodes)
    return {
        "colors": sorted(colors),
        "fonts": sorted(fonts),
        "images": images,
        "shortcodes": sorted(shortcodes),
        "widgetTypes": sorted(widget_types),
    }


def design_summary(raw_items):
    design_items = [item for item in raw_items if item["type"] in DESIGN_TYPES]
    global_styles = [item for item in raw_items if item["type"] == "wp_global_styles"]
    navigation_blocks = [item for item in raw_items if item["type"] == "wp_navigation"]
    font_families = [item for item in raw_items if item["type"] == "wp_font_family"]
    font_faces = [item for item in raw_items if item["type"] == "wp_font_face"]
    elementor_library = [item for item in raw_items if item["type"] == "elementor_library"]

    menu_items = []
    for item in raw_items:
        if item["type"] != "nav_menu_item":
            continue
        meta = item["meta"]
        menu_items.append(
            {
                "id": item["id"],
                "title": item["title"],
                "slug": item["slug"],
                "parentId": as_int(meta.get("_menu_item_menu_item_parent")),
                "objectId": as_int(meta.get("_menu_item_object_id")),
                "object": meta.get("_menu_item_object", ""),
                "type": meta.get("_menu_item_type", ""),
                "url": meta.get("_menu_item_url", ""),
                "target": meta.get("_menu_item_target", ""),
                "classes": meta.get("_menu_item_classes", ""),
                "order": item["menuOrder"],
                "rawMeta": meta,
            }
        )
    menu_items.sort(key=lambda value: (value["parentId"], value["order"], value["title"]))

    elementor_pages = []
    aggregate = {
        "colors": set(),
        "fonts": set(),
        "images": [],
        "shortcodes": set(),
        "widgetTypes": set(),
    }
    for item in raw_items:
        data = parse_json_string(item["meta"].get("_elementor_data", ""))
        if data is None:
            continue
        tokens = collect_elementor_tokens(data)
        for key in ["colors", "fonts", "shortcodes", "widgetTypes"]:
            aggregate[key].update(tokens[key])
        aggregate["images"].extend(tokens["images"])
        elementor_pages.append(
            {
                "id": item["id"],
                "title": item["title"],
                "slug": item["slug"],
                "type": item["type"],
                "status": item["status"],
                "templateType": item["meta"].get("_elementor_template_type", ""),
                "elementorVersion": item["meta"].get("_elementor_version", ""),
                "pageSettings": item["meta"].get("_elementor_page_settings", ""),
                "tokens": tokens,
                "layout": data,
            }
        )

    return {
        "notice": "WordPress XML exports content and some builder meta, but not the active theme files, plugin CSS, Customizer settings, or the full WordPress database options table.",
        "availableInExport": {
            "globalStyles": len(global_styles),
            "navigationBlocks": len(navigation_blocks),
            "menuItems": len(menu_items),
            "fontFamilies": len(font_families),
            "fontFaces": len(font_faces),
            "elementorPagesOrTemplates": len(elementor_pages),
            "elementorLibraryItems": len(elementor_library),
        },
        "globalStyles": global_styles,
        "navigationBlocks": navigation_blocks,
        "menuItems": menu_items,
        "fontFamilies": font_families,
        "fontFaces": font_faces,
        "elementorLibrary": elementor_library,
        "elementorPages": elementor_pages,
        "elementorTokens": {
            "colors": sorted(aggregate["colors"]),
            "fonts": sorted(aggregate["fonts"]),
            "shortcodes": sorted(aggregate["shortcodes"]),
            "widgetTypes": sorted(aggregate["widgetTypes"]),
            "images": aggregate["images"],
        },
        "rawDesignItems": design_items,
    }


def write_content_files(output_dir, collection_name, items):
    collection_dir = output_dir / "content" / collection_name
    collection_dir.mkdir(parents=True, exist_ok=True)
    for item in items:
        html = item.get("contentHtml") or item.get("descriptionHtml") or ""
        if not html:
            continue
        file_name = f"{item['slug'] or item['id']}.html"
        (collection_dir / file_name).write_text(html, encoding="utf-8")


def main():
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("dent-art.WordPress.2026-07-16.xml")
    output_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(".")

    tree = ET.parse(source)
    channel = tree.getroot().find("channel")
    if channel is None:
        raise SystemExit("No channel found in WordPress export.")

    site = {
        "title": child_text(channel, "title"),
        "url": child_text(channel, "link"),
        "description": child_text(channel, "description"),
        "language": child_text(channel, "language"),
        "publishedAt": child_text(channel, "pubDate"),
        "baseSiteUrl": get_text(channel, "wp:base_site_url"),
        "baseBlogUrl": get_text(channel, "wp:base_blog_url"),
        "wxrVersion": get_text(channel, "wp:wxr_version"),
    }

    authors = parse_authors(channel)
    taxonomies = parse_terms(channel)
    raw_items = [parse_item(item) for item in channel.findall("item")]
    items_by_id = {item["id"]: item for item in raw_items}
    type_counts = defaultdict(int)
    for item in raw_items:
        type_counts[item["type"]] += 1

    media = [media_summary(item) for item in raw_items if item["type"] == "attachment"]
    media_by_id = {item["id"]: item for item in media}

    pages = [page_summary(item, media_by_id) for item in raw_items if item["type"] == "page"]
    posts = [page_summary(item, media_by_id) for item in raw_items if item["type"] == "post"]
    products = [product_summary(item, media_by_id) for item in raw_items if item["type"] == "product"]
    variations = [product_summary(item, media_by_id) for item in raw_items if item["type"] == "product_variation"]

    variations_by_parent = defaultdict(list)
    for variation in variations:
        parent = items_by_id.get(variation["id"], {}).get("parentId")
        variations_by_parent[parent].append(variation)

    for product in products:
        product["variations"] = variations_by_parent.get(product["id"], [])

    pages.sort(key=lambda item: (item["menuOrder"], item["title"]))
    posts.sort(key=lambda item: item["postDate"], reverse=True)
    products.sort(key=lambda item: item["title"])
    media.sort(key=lambda item: item["date"], reverse=True)

    manifest = {
        "site": site,
        "counts": dict(sorted(type_counts.items())),
        "authors": authors,
        "taxonomies": {key: len(value) for key, value in taxonomies.items()},
        "generatedFrom": str(source),
        "notes": [
            "data/raw-items.json contains the full parsed WordPress item payload with all post meta.",
            "content/* keeps original WordPress HTML fragments for direct redesign work.",
            "public/media-manifest.json lists remote media URLs; run tools/download_media.py if local copies are needed.",
        ],
    }

    write_json(output_dir / "data" / "site.json", manifest)
    write_json(output_dir / "data" / "authors.json", authors)
    write_json(output_dir / "data" / "taxonomies.json", taxonomies)
    write_json(output_dir / "data" / "pages.json", pages)
    write_json(output_dir / "data" / "posts.json", posts)
    write_json(output_dir / "data" / "products.json", products)
    write_json(output_dir / "data" / "media.json", media)
    write_json(output_dir / "data" / "design.json", design_summary(raw_items))
    write_json(output_dir / "data" / "raw-items.json", raw_items)
    write_json(output_dir / "public" / "media-manifest.json", media)

    write_content_files(output_dir, "pages", pages)
    write_content_files(output_dir, "posts", posts)
    write_content_files(output_dir, "products", products)

    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
