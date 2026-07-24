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
  };

  const pageList = document.querySelector("#pageList");
  const editorName = document.querySelector("#editorName");
  const pageTitle = document.querySelector("#pageTitle");
  const pageContent = document.querySelector("#pageContent");
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

  const showAdmin = () => {
    if (adminGate) adminGate.hidden = true;
    if (adminShell) adminShell.hidden = false;
  };

  const initAdmin = () => {
    fetch("/data/pages.json")
      .then((response) => response.json())
      .then((pages) => {
        state.pages = [
          {
            title: "Főoldal",
            slug: "fooldal",
            contentHtml: "<p>A főoldal WordPress/Elementor exportból épül, itt rövid bevezető szövegeket érdemes tárolni.</p>",
          },
          ...pages.filter((page) => page.status === "publish"),
        ];
        selectPage(state.pages[0].slug);
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
        ${page.title || page.slug}
      </button>
    `).join("");
  };

  const selectPage = (slug) => {
    state.selected = state.pages.find((page) => page.slug === slug) || state.pages[0];
    if (!state.selected) return;
    const value = getPageValue(state.selected);
    editorName.textContent = state.selected.title || state.selected.slug;
    pageTitle.value = value.title;
    pageContent.value = value.contentHtml;
    openPage.href = pageUrl(state.selected);
    renderPageList();
  };

  const renderPosts = () => {
    const posts = getPosts();
    postList.innerHTML = posts.length ? posts.map((post) => `
      <article class="admin-card">
        <strong>${post.title || "Új hír"}</strong>
        <span>${post.date || ""}</span>
        <p>${post.excerpt || ""}</p>
      </article>
    `).join("") : '<div class="admin-card"><span>Még nincs adminból hozzáadott hír.</span></div>';
  };

  const renderSubscribers = () => {
    const subscribers = getSubscribers();
    subscriberList.innerHTML = subscribers.length ? subscribers.map((subscriber) => `
      <article class="admin-card">
        <strong>${subscriber.name || "Név nélkül"}</strong>
        <span>${subscriber.email || ""} · ${subscriber.course || ""}</span>
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

  savePage.addEventListener("click", () => {
    if (!state.selected) return;
    const overrides = getOverrides();
    overrides[state.selected.slug] = {
      title: pageTitle.value.trim(),
      contentHtml: pageContent.value.trim(),
      updatedAt: new Date().toISOString(),
    };
    storage.set("dentart_page_overrides", overrides);
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
