# Dent-Art WordPress export

Ez a mappa a `dent-art.WordPress.2026-07-16.xml` exportból bontott, kódolható struktúrát tartalmazza.

## Fontos fájlok

- `index.html`, `theme.css`, `site.css`, `site.js`: designolt statikus Dent-Art weboldalnézet.
- `studio.html`, `styles.css`, `app.js`: tartalomböngésző és export-admin nézet.
- `theme.css`: a WordPress child theme `style.css` alapján.
- `theme-functions.php`: a kapott WordPress `functions.php` paste megőrzött forrása.
- `data/site.json`: összesítés, darabszámok, szerzők, taxonómia statisztikák.
- `data/design.json`: XML-ből kinyert Elementor/global styles/font/menu design meta.
- `data/pages.json`: oldalak tisztított tartalommal és nyers metaadatokkal.
- `data/products.json`: WooCommerce termékek, árak, kategóriák, márkák, képek és variációk.
- `data/posts.json`: bejegyzések.
- `data/media.json`: médiaelemek távoli URL-lel, lokális útvonallal és letöltési státusszal.
- `data/taxonomies.json`: kategóriák, címkék, termékkategóriák, márkák és egyéb taxonómiák.
- `data/raw-items.json`: minden WordPress item teljes, parserrel megtartott adata.
- `content/pages`, `content/posts`, `content/products`: eredeti WordPress HTML-fragmentek külön fájlokban.
- `public/uploads`: letöltött médiafájlok.
- `public/media-download-report.json`: médiamentés riportja.

## Indítás

```bash
python3 -m http.server 4173
```

Utána nyisd meg:

```text
http://127.0.0.1:4173/
```

A tartalomstúdió külön:

```text
http://127.0.0.1:4173/studio.html
```

## Újragenerálás

```bash
python3 tools/wordpress_export_to_site.py dent-art.WordPress.2026-07-16.xml .
python3 tools/download_media.py public/media-manifest.json public/uploads
```

Az exportban 186 médiaelem volt. Ebből 159 fájl letöltődött, 5 már meglévőként lett kihagyva, 22 URL az élő oldalon 404-et adott.
