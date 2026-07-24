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
    pageSearch: "",
  };

  const pageList = document.querySelector("#pageList");
  const pageSearch = document.querySelector("#pageSearch");
  const editorName = document.querySelector("#editorName");
  const pageTitle = document.querySelector("#pageTitle");
  const textFieldList = document.querySelector("#textFieldList");
  const pagePreview = document.querySelector("#pagePreview");
  const savePage = document.querySelector("#savePage");
  const resetPage = document.querySelector("#resetPage");
  const openPage = document.querySelector("#openPage");
  const postForm = document.querySelector("#postForm");
  const postList = document.querySelector("#postList");
  const postEditorTitle = document.querySelector("#postEditorTitle");
  const postSubmitButton = document.querySelector("#postSubmitButton");
  const cancelPostEdit = document.querySelector("#cancelPostEdit");
  const quoteRequestList = document.querySelector("#quoteRequestList");
  const quoteNewBadge = document.querySelector("#quoteNewBadge");
  const quoteNewBadgeInline = document.querySelector("#quoteNewBadgeInline");
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
  const getQuoteRequests = () => storage.get("dentart_quote_requests", []);
  const getSubscribers = () => storage.get("dentart_course_subscribers", []);

  const escapeHtml = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();

  const isCodeLikeText = (value) => {
    const text = normalizeText(value);
    if (!text) return true;
    if (/^\[[^\]]+\]$/.test(text)) return true;
    if (/\[(custom_menu|dentart_|products|woocommerce_|wpforms|elementor-template)/i.test(text)) return true;
    if (/^(function|const|let|var|return|if\s*\(|document\.|window\.|<\?php)/i.test(text)) return true;
    if (/^\{[\s\S]*\}$/.test(text) || /^<[^>]+>$/.test(text)) return true;
    return false;
  };

  const elementLabel = (element) => {
    if (!element) return "Szöveg";
    const tag = element.tagName.toLowerCase();
    if (/^h[1-6]$/.test(tag)) return "Cím";
    if (tag === "li") return "Felsorolás";
    if (tag === "a") return "Gomb vagy link felirata";
    if (tag === "strong" || tag === "b") return "Kiemelt mondat";
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
      if (text && tag !== "script" && tag !== "style" && tag !== "noscript" && !isCodeLikeText(text)) {
        nodes.push(node);
      }
      node = walker.nextNode();
    }
    return nodes;
  };

  const extractTextBlocks = (html) => {
    const root = parseContent(html);
    const nodes = getTextNodes(root);
    if (!nodes.length && normalizeText(html) && !isCodeLikeText(html)) {
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

  const cleanPreviewHtml = (html) => {
    const root = parseContent(html);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const removals = [];
    let node = walker.nextNode();
    while (node) {
      if (isCodeLikeText(node.textContent)) removals.push(node);
      node = walker.nextNode();
    }
    removals.forEach((textNode) => textNode.remove());
    return root.innerHTML.trim();
  };

  const renderPreview = () => {
    const html = cleanPreviewHtml(buildHtmlFromFields());
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
        renderQuoteRequests();
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
    const term = state.pageSearch.toLowerCase();
    const pages = state.pages.filter((page) => (
      `${page.title || ""} ${page.slug || ""}`.toLowerCase().includes(term)
    ));
    pageList.innerHTML = pages.length ? pages.map((page) => `
      <button type="button" data-slug="${page.slug}" class="${state.selected?.slug === page.slug ? "is-active" : ""}">
        ${escapeHtml(page.title || page.slug)}
      </button>
    `).join("") : '<div class="admin-card"><span>Nincs ilyen nevű oldal.</span></div>';
  };

  const renderTextFields = (html) => {
    const blocks = extractTextBlocks(html);
    textFieldList.innerHTML = blocks.length ? blocks.map((block, index) => {
      const rows = Math.min(8, Math.max(2, Math.ceil(block.text.length / 90)));
      return `
        <label class="admin-text-field">
          <span>${index + 1}. ${escapeHtml(block.label)}</span>
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
      <article class="admin-card admin-news-card">
        ${post.image ? `<img src="${escapeHtml(post.image)}" alt="">` : ""}
        <div>
          <strong>${escapeHtml(post.title || "Új hír")}</strong>
          <span>${escapeHtml(post.date || "")}</span>
          <p>${escapeHtml(post.excerpt || "")}</p>
          <div class="admin-card-actions">
            <button type="button" data-edit-post="${post.id}">Szerkesztés</button>
            <button class="admin-secondary-button" type="button" data-delete-post="${post.id}">Törlés</button>
          </div>
        </div>
      </article>
    `).join("") : '<div class="admin-card"><span>Még nincs adminból hozzáadott hír.</span></div>';
  };

  const resetPostEditor = () => {
    postForm.reset();
    postForm.elements.id.value = "";
    postEditorTitle.textContent = "Hír hozzáadása";
    postSubmitButton.textContent = "Hír mentése";
    cancelPostEdit.hidden = true;
  };

  const renderQuoteRequests = () => {
    const requests = getQuoteRequests();
    const hasNew = requests.some((request) => request.status === "new");
    if (quoteNewBadge) quoteNewBadge.hidden = !hasNew;
    if (quoteNewBadgeInline) quoteNewBadgeInline.hidden = !hasNew;
    if (!quoteRequestList) return;
    quoteRequestList.innerHTML = requests.length ? requests.map((request) => `
      <article class="admin-card admin-quote-card ${request.status === "new" ? "is-new" : ""}">
        <div>
          <strong>${escapeHtml(request.name || "Ajánlatkérés")}</strong>
          <span>${escapeHtml(new Date(request.createdAt || Date.now()).toLocaleString("hu-HU"))}</span>
        </div>
        <dl>
          ${(request.fields || []).map((field) => `
            <div>
              <dt>${escapeHtml(field.label || "Adat")}</dt>
              <dd>${escapeHtml(field.value || "")}</dd>
            </div>
          `).join("")}
        </dl>
        <div class="admin-card-actions">
          ${request.status === "new" ? `<button type="button" data-read-request="${request.id}">Megnézve</button>` : ""}
          <button class="admin-secondary-button" type="button" data-delete-request="${request.id}">Törlés</button>
        </div>
      </article>
    `).join("") : '<div class="admin-card"><span>Még nincs beérkezett ajánlatkérés.</span></div>';
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
      quoteRequests: getQuoteRequests(),
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

  pageSearch?.addEventListener("input", (event) => {
    state.pageSearch = event.currentTarget.value.trim();
    renderPageList();
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
    if (data.id) {
      const index = posts.findIndex((post) => String(post.id) === String(data.id));
      if (index >= 0) {
        posts[index] = {
          ...posts[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
      }
    } else {
      posts.unshift({
        ...data,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      });
    }
    storage.set("dentart_blog_posts", posts);
    resetPostEditor();
    renderPosts();
    renderExport();
  });

  postList.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-post]");
    const deleteButton = event.target.closest("[data-delete-post]");
    const posts = getPosts();
    if (editButton) {
      const post = posts.find((item) => String(item.id) === String(editButton.dataset.editPost));
      if (!post) return;
      postForm.elements.id.value = post.id;
      postForm.elements.title.value = post.title || "";
      postForm.elements.date.value = post.date || "";
      postForm.elements.image.value = post.image || "";
      postForm.elements.excerpt.value = post.excerpt || "";
      postEditorTitle.textContent = "Hír szerkesztése";
      postSubmitButton.textContent = "Módosítás mentése";
      cancelPostEdit.hidden = false;
      postForm.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (deleteButton) {
      storage.set("dentart_blog_posts", posts.filter((item) => String(item.id) !== String(deleteButton.dataset.deletePost)));
      resetPostEditor();
      renderPosts();
      renderExport();
    }
  });

  cancelPostEdit?.addEventListener("click", () => {
    resetPostEditor();
  });

  quoteRequestList?.addEventListener("click", (event) => {
    const readButton = event.target.closest("[data-read-request]");
    const deleteButton = event.target.closest("[data-delete-request]");
    const requests = getQuoteRequests();
    if (readButton) {
      storage.set("dentart_quote_requests", requests.map((request) => (
        String(request.id) === String(readButton.dataset.readRequest)
          ? { ...request, status: "read", readAt: new Date().toISOString() }
          : request
      )));
      renderQuoteRequests();
      renderExport();
    }
    if (deleteButton) {
      storage.set("dentart_quote_requests", requests.filter((request) => String(request.id) !== String(deleteButton.dataset.deleteRequest)));
      renderQuoteRequests();
      renderExport();
    }
  });

  exportData.addEventListener("click", () => {
    renderExport();
    exportBox.hidden = false;
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
