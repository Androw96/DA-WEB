const routes = {
  pages: { label: "Oldal", file: "data/pages.json" },
  products: { label: "Termék", file: "data/products.json" },
  posts: { label: "Bejegyzés", file: "data/posts.json" },
  media: { label: "Média", file: "data/media.json" },
  design: { label: "Design", file: "data/design.json" },
};

const state = {
  route: "pages",
  items: [],
  selectedId: null,
  query: "",
};

const list = document.querySelector("#list");
const preview = document.querySelector("#preview");
const searchInput = document.querySelector("#searchInput");

function assetUrl(item) {
  return item?.localPath || (item?.localUrl ? `public/${item.localUrl}` : "") || item?.url || "";
}

async function loadRoute(route) {
  state.route = routes[route] ? route : "pages";
  state.selectedId = null;
  const response = await fetch(routes[state.route].file);
  state.items = await response.json();
  updateNav();
  if (state.route === "design") {
    renderDesign(state.items);
    return;
  }
  renderList();
  renderPreview(state.items[0]);
}

function updateNav() {
  document.querySelectorAll(".nav a").forEach((link) => {
    const route = link.getAttribute("href").replace("#", "");
    link.classList.toggle("active", route === state.route);
  });
}

function searchableText(item) {
  return [
    item.title,
    item.slug,
    item.sku,
    item.brand,
    item.descriptionText,
    item.contentText,
    item.url,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function filteredItems() {
  const query = state.query.trim().toLowerCase();
  if (!query) {
    return state.items;
  }
  return state.items.filter((item) => searchableText(item).includes(query));
}

function itemSubtitle(item) {
  if (state.route === "products") {
    return [item.sku, item.price ? `${item.price} Ft` : "", item.brand].filter(Boolean).join(" / ");
  }
  if (state.route === "media") {
    return item.url || item.attachedFile || "";
  }
  return [item.slug, item.status].filter(Boolean).join(" / ");
}

function renderList() {
  if (state.route === "design") {
    list.innerHTML = "";
    return;
  }

  const items = filteredItems();
  list.innerHTML = "";

  if (!items.length) {
    list.innerHTML = '<div class="item"><strong>Nincs találat</strong><span>Próbálj más keresést.</span></div>';
    return;
  }

  items.forEach((item) => {
    const button = document.createElement("button");
    button.className = `item ${item.id === state.selectedId ? "active" : ""}`;
    button.type = "button";
    button.innerHTML = `<strong>${escapeHtml(item.title || item.slug || item.id)}</strong><span>${escapeHtml(itemSubtitle(item))}</span>`;
    button.addEventListener("click", () => renderPreview(item));
    list.appendChild(button);
  });
}

function renderDesign(design) {
  state.selectedId = null;
  list.innerHTML = `
    <div class="item active">
      <strong>WordPress design export</strong>
      <span>Elementor, menük, fontok, global styles</span>
    </div>
  `;

  const tokens = design.elementorTokens || {};
  const available = design.availableInExport || {};
  preview.innerHTML = `
    <div class="document">
      <header class="document-header">
        <p class="eyebrow">Design</p>
        <h1>Exportált design-adatok</h1>
      </header>
      <div class="rendered-content">
        <p>${escapeHtml(design.notice || "")}</p>
        <div class="design-grid">
          ${statCard("Global styles", available.globalStyles)}
          ${statCard("Navigáció", available.navigationBlocks)}
          ${statCard("Menüpont", available.menuItems)}
          ${statCard("Font family", available.fontFamilies)}
          ${statCard("Font face", available.fontFaces)}
          ${statCard("Elementor layout", available.elementorPagesOrTemplates)}
        </div>
        <h2>Elementor színek</h2>
        <div class="swatches">
          ${(tokens.colors || []).map((color) => `<span class="swatch"><i style="background:${escapeAttr(color)}"></i>${escapeHtml(color)}</span>`).join("") || "<p>Nincs kinyert szín.</p>"}
        </div>
        <h2>Elementor widgetek</h2>
        <p>${escapeHtml((tokens.widgetTypes || []).join(", ") || "Nincs.")}</p>
        <h2>Shortcode-ok</h2>
        <ul>${(tokens.shortcodes || []).map((code) => `<li><code>${escapeHtml(code)}</code></li>`).join("") || "<li>Nincs shortcode.</li>"}</ul>
        <h2>Elementor oldalak / template-ek</h2>
        <ul>${(design.elementorPages || []).map((page) => `<li><strong>${escapeHtml(page.title || page.slug)}</strong> <code>${escapeHtml(page.templateType || page.type)}</code></li>`).join("")}</ul>
        <h2>Menüpontok</h2>
        <ul>${(design.menuItems || []).slice(0, 80).map((item) => `<li>${escapeHtml(item.title || item.slug || item.id)} ${item.url ? `<a href="${escapeAttr(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.url)}</a>` : ""}</li>`).join("")}</ul>
      </div>
    </div>
  `;
}

function statCard(label, value) {
  return `<div class="stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value ?? 0)}</strong></div>`;
}

function renderPreview(item) {
  if (!item) {
    preview.innerHTML = '<div class="empty"><p>Nincs megjeleníthető tartalom.</p></div>';
    return;
  }

  state.selectedId = item.id;
  renderList();

  if (state.route === "media") {
    renderMediaPreview(item);
    return;
  }

  const html = item.contentHtml || item.descriptionHtml || item.shortDescriptionHtml || "";
  preview.innerHTML = `
    <div class="preview-grid">
      <article class="document">
        <header class="document-header">
          <p class="eyebrow">${routes[state.route].label}</p>
          <h1>${escapeHtml(item.title || item.slug)}</h1>
        </header>
        <div class="rendered-content">${html || "<p>Nincs törzstartalom ebben az elemben.</p>"}</div>
      </article>
      ${renderMeta(item)}
    </div>
  `;
}

function renderMediaPreview(item) {
  const imageUrl = assetUrl(item);
  preview.innerHTML = `
    <div class="preview-grid">
      <article class="document">
        <header class="document-header">
          <p class="eyebrow">Média</p>
          <h1>${escapeHtml(item.title || item.slug)}</h1>
        </header>
        <div class="rendered-content">
          <div class="media-grid">
            <div class="media-card">
              ${imageUrl ? `<img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(item.alt || item.title || "")}">` : ""}
              <span>${escapeHtml(item.url || "")}</span>
            </div>
          </div>
        </div>
      </article>
      ${renderMeta(item)}
    </div>
  `;
}

function renderMeta(item) {
  const rows = [
    ["ID", item.id],
    ["Slug", item.slug],
    ["Státusz", item.status],
    ["URL", item.link || item.url],
    ["SKU", item.sku],
    ["Ár", item.price],
    ["Kategória", item.categories?.map((term) => term.name).join(", ")],
    ["Márka", item.brand],
    ["Variációk", item.variations?.length],
  ].filter(([, value]) => value !== undefined && value !== null && value !== "");

  const images = item.images?.length
    ? `<div class="product-images">${item.images
        .map((image) => `<img src="${escapeAttr(assetUrl(image))}" alt="${escapeAttr(image.alt || image.title || "")}">`)
        .join("")}</div>`
    : "";

  return `
    <aside class="meta-panel">
      <h2>Adatok</h2>
      ${rows
        .map(([label, value]) => `<div class="meta-row"><span>${escapeHtml(label)}</span><div>${formatValue(value)}</div></div>`)
        .join("")}
      ${images}
    </aside>
  `;
}

function formatValue(value) {
  if (typeof value === "string" && value.startsWith("http")) {
    return `<a href="${escapeAttr(value)}" target="_blank" rel="noreferrer">${escapeHtml(value)}</a>`;
  }
  return escapeHtml(String(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderList();
});

window.addEventListener("hashchange", () => {
  loadRoute(window.location.hash.replace("#", ""));
});

loadRoute(window.location.hash.replace("#", "") || "pages");
