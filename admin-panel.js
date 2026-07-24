(function () {
  const ADMIN_ACCESS_KEY = "dentart-admin-2026";
  const ADMIN_AUTH_STORAGE_KEY = "dentart_admin_authenticated";

  const storage = {
    get(key, fallback) {
      try {
        return JSON.parse(localStorage.getItem(key) || "null") || fallback;
      } catch (error) {
        return fallback;
      }
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
  };

  const state = {
    pages: [],
    selected: null,
    currentHtml: "",
  };

  const pageList = document.querySelector("#pageList");
  const editorName = document.querySelector("#editorName");
  const pageTitle = document.querySelector("#pageTitle");
  const textFieldList = document.querySelector("#textFieldList");
  const pagePreview = document.querySelector("#pagePreview");
  const savePage = document.querySelector("#savePage");
  const resetPage = document.querySelector("#resetPage");
  const openPage = document.querySelector("#openPage");
  const postForm = document.querySelector("#postForm");
  const postList = document.querySelector("#postList");
  const subscriberList = document.querySelector("#subscriberList");
  const exportData = document.querySelector("#exportData");
  const exportBox = document.querySelector("#exportBox");
  const adminGate = document.querySelector("#adminGate");
  const adminShell = document.querySelector("#adminShell");
  const adminLoginForm = document.querySelector("#adminLoginForm");
  const adminAccessKey = document.querySelector("#adminAccessKey");
  const adminLoginError = document.querySelector("#adminLoginError");

  const getOverrides = () => storage.get("dentart_page_overrides", {});
  const getPosts = () => storage.get("dentart_blog_posts", []);
  const getSubscribers = () => storage.get("dentart_course_subscribers", []);

  const escapeHtml = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();

  const elementLabel = (element) => {
    if (!element) return "Szöveg";
    const tag = element.tagName.toLowerCase();
    if (/^h[1-6]$/.test(tag)) return "Címsor";
    if (tag === "p") return "Bekezdés";
    if (tag === "li") return "Listaelem";
    if (tag === "a") return "Link szöveg";
    if (tag === "strong" || tag === "b") return "Kiemelt szöveg";
    if (tag === "figcaption") return "Képaláírás";
    return "Szöveg";
  };

  const parseContent = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<main>${html || ""}</main>`, "text/html");
    return doc.querySelector("main");
  };

  const getTextNodes = (root) => {
    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const parent = node.parentElement;
      const tag = parent?.tagName?.toLowerCase();
      const text = normalizeText(node.textContent);
      if (text && tag !== "script" && tag !== "style" && tag !== "noscript") {
        nodes.push(node);
      }
      node = walker.nextNode();
    }
    return nodes;
  };

  const extractTextBlocks = (html) => {
    const root = parseContent(html);
    const nodes = getTextNodes(root);
    if (!nodes.length && normalizeText(html)) {
      return [{
        index: 0,
        label: "Fő szöveg",
        text: normalizeText(html),
        plainOnly: true,
      }];
    }
    return nodes.map((node, index) => ({
      index,
      label: elementLabel(node.parentElement),
      text: normalizeText(node.textContent),
      context: normalizeText(node.parentElement?.textContent || "").slice(0, 90),
    }));
  };

  const currentTextFields = () => Array.from(textFieldList.querySelectorAll("[data-text-index]")).map((field) => ({
    index: Number(field.dataset.textIndex),
    value: field.value.trim(),
    plainOnly: field.dataset.plainOnly === "true",
  }));

  const buildHtmlFromFields = () => {
    const fields = currentTextFields();
    if (!fields.length) return "";
    if (fields[0].plainOnly) {
      return fields[0].value
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join("\n");
    }
    const root = parseContent(state.currentHtml);
    const nodes = getTextNodes(root);
    fields.forEach((field) => {
      if (nodes[field.index]) nodes[field.index].textContent = field.value;
    });
    return root.innerHTML.trim();
  };

  const renderPreview = () => {
    const html = buildHtmlFromFields();
    pagePreview.innerHTML = html || '<p class="admin-empty-state">Ezen az oldalon nincs szerkeszthető szöveges tartalom.</p>';
  };

  const showAdmin = () => {
    if (adminGate) adminGate.hidden = true;
    if (adminShell) adminShell.hidden = false;
  };

  const initAdmin = () => {
    fetch("/data/pages.json")
      .then((response) => response.json())
      .then((pages) => {
        state.pages = pages.filter((page) => page.status === "publish");
        selectPage(state.pages.find((page) => page.slug === "fooldal")?.slug || state.pages[0]?.slug);
        renderPosts();
        renderSubscribers();
        renderExport();
      })
      .catch(() => {
        pageList.innerHTML = '<div class="admin-card"><span>Nem sikerült betölteni az oldalakat.</span></div>';
      });
  };

  const pageUrl = (page) => {
    if (!page || page.slug === "fooldal") return "/";
    return `/${page.slug}/`;
  };

  const getPageValue = (page) => {
    const overrides = getOverrides();
    return {
      title: overrides[page.slug]?.title || page.title || "",
      contentHtml: overrides[page.slug]?.contentHtml || page.contentHtml || "",
    };
  };

  const renderPageList = () => {
    pageList.innerHTML = state.pages.map((page) => `
      <button type="button" data-slug="${page.slug}" class="${state.selected?.slug === page.slug ? "is-active" : ""}">
        ${escapeHtml(page.title || page.slug)}
      </button>
    `).join("");
  };

  const renderTextFields = (html) => {
    const blocks = extractTextBlocks(html);
    textFieldList.innerHTML = blocks.length ? blocks.map((block, index) => {
      const rows = Math.min(8, Math.max(2, Math.ceil(block.text.length / 90)));
      return `
        <label class="admin-text-field">
          <span>${index + 1}. ${escapeHtml(block.label)}</span>
          ${block.context && block.context !== block.text ? `<small>${escapeHtml(block.context)}</small>` : ""}
          <textarea data-text-index="${block.index}" data-plain-only="${block.plainOnly ? "true" : "false"}" rows="${rows}">${escapeHtml(block.text)}</textarea>
        </label>
      `;
    }).join("") : '<div class="admin-card"><span>Ezen az oldalon nincs szerkeszthető szöveges tartalom.</span></div>';
    renderPreview();
  };

  const selectPage = (slug) => {
    state.selected = state.pages.find((page) => page.slug === slug) || state.pages[0];
    if (!state.selected) return;
    const value = getPageValue(state.selected);
    state.currentHtml = value.contentHtml;
    editorName.textContent = state.selected.title || state.selected.slug;
    pageTitle.value = value.title;
    openPage.href = pageUrl(state.selected);
    renderPageList();
    renderTextFields(value.contentHtml);
  };

  const renderPosts = () => {
    const posts = getPosts();
    postList.innerHTML = posts.length ? posts.map((post) => `
      <article class="admin-card">
        <strong>${escapeHtml(post.title || "Új hír")}</strong>
        <span>${escapeHtml(post.date || "")}</span>
        <p>${escapeHtml(post.excerpt || "")}</p>
      </article>
    `).join("") : '<div class="admin-card"><span>Még nincs adminból hozzáadott hír.</span></div>';
  };

  const renderSubscribers = () => {
    const subscribers = getSubscribers();
    subscriberList.innerHTML = subscribers.length ? subscribers.map((subscriber) => `
      <article class="admin-card">
        <strong>${escapeHtml(subscriber.name || "Név nélkül")}</strong>
        <span>${escapeHtml(subscriber.email || "")} · ${escapeHtml(subscriber.course || "")}</span>
      </article>
    `).join("") : '<div class="admin-card"><span>Még nincs kurzus érdeklődő.</span></div>';
  };

  const renderExport = () => {
    const payload = {
      pageOverrides: getOverrides(),
      blogPosts: getPosts(),
      courseSubscribers: getSubscribers(),
      exportedAt: new Date().toISOString(),
    };
    exportBox.value = JSON.stringify(payload, null, 2);
  };

  pageList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-slug]");
    if (!button) return;
    selectPage(button.dataset.slug);
  });

  textFieldList.addEventListener("input", () => {
    renderPreview();
  });

  savePage.addEventListener("click", () => {
    if (!state.selected) return;
    const overrides = getOverrides();
    const contentHtml = buildHtmlFromFields();
    overrides[state.selected.slug] = {
      title: pageTitle.value.trim(),
      contentHtml,
      textBlocks: currentTextFields().map((field) => field.value),
      updatedAt: new Date().toISOString(),
    };
    storage.set("dentart_page_overrides", overrides);
    state.currentHtml = contentHtml;
    renderTextFields(contentHtml);
    renderExport();
    savePage.textContent = "Mentve";
    setTimeout(() => {
      savePage.textContent = "Oldal mentése";
    }, 1200);
  });

  resetPage.addEventListener("click", () => {
    if (!state.selected) return;
    const overrides = getOverrides();
    delete overrides[state.selected.slug];
    storage.set("dentart_page_overrides", overrides);
    selectPage(state.selected.slug);
    renderExport();
  });

  postForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(postForm).entries());
    const posts = getPosts();
    posts.unshift({
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    });
    storage.set("dentart_blog_posts", posts);
    postForm.reset();
    renderPosts();
    renderExport();
  });

  exportData.addEventListener("click", () => {
    renderExport();
    exportBox.select();
  });

  adminLoginForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (adminAccessKey.value.trim() !== ADMIN_ACCESS_KEY) {
      adminLoginError.textContent = "Hibás kulcs. Próbáld újra.";
      adminAccessKey.select();
      return;
    }
    sessionStorage.setItem(ADMIN_AUTH_STORAGE_KEY, "true");
    showAdmin();
    initAdmin();
  });

  if (sessionStorage.getItem(ADMIN_AUTH_STORAGE_KEY) === "true") {
    showAdmin();
    initAdmin();
  } else {
    adminAccessKey?.focus();
  }
})();
