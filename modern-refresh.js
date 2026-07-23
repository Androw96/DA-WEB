(function () {
  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  };

  ready(() => {
    const path = window.location.pathname.replace(/\/index\.html$/, "/");
    const isHome = document.body.classList.contains("home") || path === "/" || path.endsWith("/simply-static-1-1784283072/");
    const pageType = (() => {
      if (path.includes("/fogaszat/")) return "dentistry";
      if (path.includes("/fogtechnika/")) return "lab";
      if (path.includes("/ajanlatkeres/")) return "quote";
      if (path.includes("/hirek/")) return "news";
      if (path.includes("/palyazatok/")) return "grants";
      if (path.includes("/szolgaltatasok/")) return "services";
      if (path.includes("/rolunk/")) return "about";
      return "";
    })();

    if (pageType) {
      document.body.classList.add(`da-${pageType}-page`);
    }

    const progress = document.createElement("div");
    progress.className = "da-scroll-progress";
    document.body.appendChild(progress);

    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0;
      progress.style.width = `${ratio * 100}%`;
      document.body.style.setProperty("--da-scroll", ratio.toFixed(4));
      document.body.classList.toggle("da-scrolled", scrollTop > 20);
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();

    const revealTargets = [
      ".elementor-widget-heading",
      ".elementor-widget-image-box",
      ".elementor-widget-icon-box",
      ".woocommerce ul.products li.product",
      ".atp-item",
      ".bsg-item",
      ".site-footer .widget",
    ].join(",");

    const targets = Array.from(document.querySelectorAll(revealTargets));
    targets.forEach((target) => target.classList.add("da-reveal"));

    if (isHome) {
      const labels = [
        "Belépési pont",
        "Kiemelt ajánlatok",
        "Gyors útvonalak",
        "Friss tartalom",
        "Kapcsolódó ajánlatok",
      ];
      document.querySelectorAll(".elementor-widget-heading h2.elementor-heading-title").forEach((heading, index) => {
        const widget = heading.closest(".elementor-widget-heading");
        if (!widget || widget.querySelector(".da-component-subtitle")) return;
        widget.classList.add("da-component-heading");
        const subtitle = document.createElement("p");
        subtitle.className = "da-component-subtitle";
        subtitle.textContent = labels[index % labels.length];
        heading.insertAdjacentElement("beforebegin", subtitle);
      });
    }

    const modernCards = Array.from(
      document.querySelectorAll(
        [
          ".woocommerce ul.products li.product",
          ".elementor-widget-image-box .elementor-image-box-wrapper",
          ".elementor-widget-icon-box .elementor-icon-box-wrapper",
          ".atp-item",
          ".bsg-item",
        ].join(",")
      )
    );
    modernCards.forEach((card, index) => {
      card.classList.add("da-modern-card");
      card.style.setProperty("--da-delay", `${Math.min(index * 45, 420)}ms`);
    });

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      modernCards.forEach((card) => {
        card.addEventListener("pointermove", (event) => {
          const rect = card.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width - 0.5) * 6;
          const y = ((event.clientY - rect.top) / rect.height - 0.5) * -6;
          card.style.setProperty("--da-tilt-x", `${x.toFixed(2)}deg`);
          card.style.setProperty("--da-tilt-y", `${y.toFixed(2)}deg`);
          card.classList.add("da-tilt-active");
        });

        card.addEventListener("pointerleave", () => {
          card.classList.remove("da-tilt-active");
          card.style.removeProperty("--da-tilt-x");
          card.style.removeProperty("--da-tilt-y");
        });
      });
    }

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
      );
      targets.forEach((target) => observer.observe(target));
    } else {
      targets.forEach((target) => target.classList.add("is-visible"));
    }

    if (!document.querySelector(".da-floating-cta")) {
      const cta = document.createElement("a");
      cta.className = "da-floating-cta";
      cta.href = "/ajanlatkeres/";
      cta.textContent = "Ajánlatkérés";
      document.body.appendChild(cta);
    }
    document.querySelectorAll(".da-floating-cta").forEach((cta) => {
      cta.textContent = "Ajánlatkérés";
      cta.setAttribute("aria-label", "Ajánlatkérés");
    });

    const serviceCards = Array.from(
      document.querySelectorAll(".elementor-widget-image-box")
    ).filter((card) => {
      const href = card.querySelector("a")?.getAttribute("href") || "";
      const text = card.textContent || "";
      return /fogaszat|implantacios-protetika|esztetikai-fogaszat|bernyomtatas/i.test(href + " " + text);
    });
    serviceCards.forEach((card) => card.classList.add("da-discipline-service"));

    const activateInserted = (node) => {
      requestAnimationFrame(() => node.classList.add("is-visible"));
      node.querySelectorAll(".da-modern-panel, .da-workflow-step").forEach((item, index) => {
        item.classList.add("da-modern-card");
        item.style.setProperty("--da-delay", `${Math.min(index * 80, 360)}ms`);
      });
    };

    let pageLastInserted = null;
    const insertAfterHeader = (node) => {
      const header =
        document.querySelector(".entry-header") ||
        document.querySelector(".site-main > article") ||
        document.querySelector(".entry-content");
      const anchor = pageLastInserted || header;
      if (anchor) {
        anchor.insertAdjacentElement("afterend", node);
        pageLastInserted = node;
        activateInserted(node);
      }
    };

    const createHero = ({ kicker, title, text, stats }) => {
      const hero = document.createElement("section");
      hero.className = "da-page-hero da-reveal";
      hero.innerHTML = `
        <div class="da-page-hero-copy">
          <p class="da-section-kicker">${kicker}</p>
          <h1>${title}</h1>
          <p>${text}</p>
        </div>
        <div class="da-page-hero-panel">
          ${stats.map((stat) => `
            <div class="da-page-hero-stat">
              <strong>${stat.value}</strong>
              <span>${stat.label}</span>
            </div>
          `).join("")}
        </div>
      `;
      return hero;
    };

    const createPanelGrid = (className, panels) => {
      const grid = document.createElement("section");
      grid.className = `${className} da-reveal`;
      grid.innerHTML = panels.map((panel) => `
        <article class="da-modern-panel">
          <h3>${panel.title}</h3>
          <p>${panel.text}</p>
        </article>
      `).join("");
      return grid;
    };

    if (pageType === "dentistry" && !document.querySelector(".da-page-hero")) {
      insertAfterHeader(createHero({
        kicker: "Fogászat",
        title: "Precíz ellátás modern ritmusban",
        text: "Átlátható, pácienseknek szóló belépő esztétikai, implantációs és digitális fogászati megoldásokhoz.",
        stats: [
          { value: "01", label: "diagnózis" },
          { value: "02", label: "tervezés" },
          { value: "03", label: "mosoly" },
        ],
      }));
      insertAfterHeader(createPanelGrid("da-service-modern-grid", [
        { title: "Esztétikai fókusz", text: "Vizuálisan tisztább út a mosolyrehabilitációs és héjkerámia megoldások felé." },
        { title: "Implantációs háttér", text: "Komplex esetekhez rendezettebb, szakmai belépő és erősebb bizalomépítés." },
        { title: "Digitális kapcsolat", text: "A fogtechnikai háttér nem rejtve marad, hanem értékként jelenik meg a páciensútban." },
      ]));
    }

    if (pageType === "lab" && !document.querySelector(".da-page-hero")) {
      insertAfterHeader(createHero({
        kicker: "Fogtechnika",
        title: "Laborháttér látványosabb rendszerben",
        text: "A CAD/CAM, implantációs protetika, nyomtatás és gyártási folyamatok modernebb, komponens alapú bemutatást kapnak.",
        stats: [
          { value: "CAD", label: "tervezés" },
          { value: "CAM", label: "gyártás" },
          { value: "3D", label: "technológia" },
        ],
      }));
      insertAfterHeader(createPanelGrid("da-service-modern-grid", [
        { title: "Gyártási pontosság", text: "A technológiai szolgáltatások erősebb, prémiumabb kártyarendszerben jelennek meg." },
        { title: "Partneri útvonal", text: "Fogorvosi partnerek számára gyorsabb tájékozódás és egyértelműbb ajánlatkérési irány." },
        { title: "Anyag és folyamat", text: "A termékkategóriák mögé kerül egy modernebb szakmai narratíva és vizuális ritmus." },
      ]));
    }

    if (pageType === "quote" && !document.querySelector(".da-workflow")) {
      const workflow = document.createElement("section");
      workflow.className = "da-workflow da-reveal";
      workflow.innerHTML = `
        <p class="da-section-kicker">Ajánlatkérési folyamat</p>
        <h2>Gyorsabb út a pontos ajánlatig</h2>
        <div class="da-workflow-steps">
          <a class="da-workflow-step" href="#wpforms-27-field_1"><b>1</b><h3>Kapcsolat</h3><p>Megérkezik az igény, a csapat beazonosítja a feladat típusát.</p><span>Adatok megadása</span></a>
          <a class="da-workflow-step" href="#wpforms-27-field_3"><b>2</b><h3>Adatok</h3><p>A szükséges fájlok, kérdések és határidők egy helyre kerülnek.</p><span>Üzenet írása</span></a>
          <a class="da-workflow-step" href="#wpforms-27-field_5"><b>3</b><h3>Tervezés</h3><p>A szakmai háttér kiválasztja a megfelelő technológiát és munkamenetet.</p><span>Fájl csatolása</span></a>
          <a class="da-workflow-step" href="#wpforms-submit-27"><b>4</b><h3>Ajánlat</h3><p>Átlátható válasz érkezik, követhető következő lépéssel.</p><span>Küldés</span></a>
        </div>
      `;
      const entry = document.querySelector(".entry-content") || document.querySelector(".site-main");
      if (entry) {
        entry.insertAdjacentElement("afterbegin", workflow);
        activateInserted(workflow);
      }
    }

    if (pageType === "news" && !document.querySelector(".da-page-hero")) {
      insertAfterHeader(createHero({
        kicker: "Hírek",
        title: "Szakmai impulzusok egy helyen",
        text: "Események, kurzusok, technológiai újdonságok és Dent-Art aktualitások élőbb, magazinosabb keretben.",
        stats: [
          { value: "News", label: "aktualitás" },
          { value: "Event", label: "esemény" },
          { value: "Lab", label: "szakmai háttér" },
        ],
      }));
      insertAfterHeader(createPanelGrid("da-news-modern-grid", [
        { title: "Események", text: "Kiemeltebb belépő szakmai napokhoz, kiállításokhoz és kurzusokhoz." },
        { title: "Technológia", text: "A labor és digitális gyártás hírei modernebb, gyorsan szkennelhető formában." },
        { title: "Közösség", text: "A Dent-Art jelenléte kevésbé statikus, inkább élő szakmai történetként működik." },
      ]));
    }

    if (pageType === "grants" && !document.querySelector(".da-page-hero")) {
      insertAfterHeader(createHero({
        kicker: "Pályázatok",
        title: "Fejlesztések átláthatóbb felületen",
        text: "A támogatási és beruházási tartalmak rendezettebb, bizalomépítőbb, projektkártyás vizuális rendszert kapnak.",
        stats: [
          { value: "ERP", label: "digitalizáció" },
          { value: "R&D", label: "fejlesztés" },
          { value: "Lab", label: "kapacitás" },
        ],
      }));
      insertAfterHeader(createPanelGrid("da-grant-modern-grid", [
        { title: "Digitális fejlesztés", text: "ERP, CRM és folyamatoptimalizálás egy érthetőbb fejlesztési narratívában." },
        { title: "Innováció", text: "Szoftveres és fogtechnikai fejlesztések kiemeltebb szakmai hangsúllyal." },
        { title: "Kapacitásbővítés", text: "Beruházások, eszközök és telephelyfejlesztés rendezettebb olvasási ritmussal." },
      ]));
    }

    const getStoredJson = (key, fallback) => {
      try {
        return JSON.parse(localStorage.getItem(key) || "null") || fallback;
      } catch (error) {
        return fallback;
      }
    };

    const formatPrice = (value) => {
      const raw = Array.isArray(value) ? value[0] : value;
      const number = Number(String(raw || "").replace(/[^\d.-]/g, ""));
      if (!Number.isFinite(number) || number <= 0) return "Ár érdeklődésre";
      return `${new Intl.NumberFormat("hu-HU").format(number)} Ft`;
    };

    const pageSlug = path.split("/").filter(Boolean).pop() || "fooldal";
    const pageOverrides = getStoredJson("dentart_page_overrides", {});
    const override = pageOverrides[pageSlug] || (isHome && pageOverrides.fooldal);
    if (override) {
      const title = document.querySelector(".entry-title");
      const content = document.querySelector(".entry-content");
      if (title && override.title) title.textContent = override.title;
      if (content && override.contentHtml) content.innerHTML = override.contentHtml;
    }

    const serviceFocusSection = document.querySelector(".elementor-element-abbfed0");
    if (serviceFocusSection) {
      serviceFocusSection.remove();
    }
    document.querySelectorAll(".da-service-focus-names, .da-discipline-switcher").forEach((node) => node.remove());

    const ensureServicesSubmenu = () => {
      const serviceItems = Array.from(document.querySelectorAll(".menu-item")).filter((item) => {
        const linkText = item.querySelector(":scope > a .menu-text, :scope > a")?.textContent?.trim() || "";
        return linkText === "Szolgáltatások";
      });
      const submenuItems = [
        ["Fogászat", "/fogaszat/"],
        ["Fogtechnika", "/fogtechnika/"],
        ["Ajánlatkérés", "/ajanlatkeres/"],
        ["Kurzusok", "/kurzusok/"],
      ];
      serviceItems.forEach((item) => {
        let submenu = item.querySelector(":scope > ul.sub-menu");
        if (!submenu) {
          submenu = document.createElement("ul");
          submenu.className = "sub-menu da-filled-services-submenu";
          item.appendChild(submenu);
        }
        if (!submenu.querySelector("a")) {
          submenu.innerHTML = submenuItems.map(([label, href]) => (
            `<li class="menu-item menu-item-type-custom"><a class="menu-link" href="${href}">${label}</a></li>`
          )).join("");
        }
      });
    };
    ensureServicesSubmenu();

    const renderSocialLinks = () => {
      if (document.querySelector(".da-social-links")) return;
      const social = document.createElement("nav");
      social.className = "da-social-links";
      social.setAttribute("aria-label", "Dent-Art social");
      social.innerHTML = `
        <a href="https://www.instagram.com/dentarttechnik/" target="_blank" rel="noopener">Instagram</a>
        <a href="https://www.facebook.com/profile.php?id=61583350573056" target="_blank" rel="noopener">Facebook</a>
      `;
      const footer = document.querySelector(".site-footer") || document.body;
      footer.appendChild(social);
    };
    renderSocialLinks();

    const renderAdminShortcut = () => {
      const nav = document.querySelector(".main-header-menu, .primary-nav");
      if (!nav || nav.querySelector('a[href="/admin.html"]')) return;
      const link = document.createElement("a");
      link.className = "menu-link da-admin-shortcut";
      link.href = "/admin.html";
      link.textContent = "Admin";
      const menuItem = document.createElement("li");
      menuItem.className = "menu-item menu-item-type-custom";
      menuItem.appendChild(link);
      if (nav.tagName.toLowerCase() === "ul") {
        nav.appendChild(menuItem);
      } else {
        nav.appendChild(link);
      }
    };
    renderAdminShortcut();

    const renderAdminPosts = () => {
      if (pageType !== "news" || document.querySelector(".da-admin-posts")) return;
      const posts = getStoredJson("dentart_blog_posts", []);
      if (!posts.length) return;
      const grid = document.createElement("section");
      grid.className = "da-admin-posts da-reveal is-visible";
      grid.innerHTML = `
        <p class="da-section-kicker">Friss blogposztok</p>
        <h2>Adminból hozzáadott hírek</h2>
        <div class="da-admin-post-grid">
          ${posts.map((post) => `
            <article class="da-admin-post-card">
              ${post.image ? `<img src="${post.image}" alt="">` : ""}
              <span>${post.date || ""}</span>
              <h3>${post.title || "Új hír"}</h3>
              <p>${post.excerpt || ""}</p>
            </article>
          `).join("")}
        </div>
      `;
      const anchor = document.querySelector(".site-main") || document.querySelector(".entry-content");
      if (anchor) anchor.appendChild(grid);
    };
    renderAdminPosts();

    const renderRandomProducts = async () => {
      if (!isHome || document.querySelector(".da-random-products")) return;
      const whySection = document.querySelector(".elementor-element-1f5b655");
      if (!whySection) return;
      const originalGrid = whySection.querySelector(".elementor-element-f5e004e");
      if (originalGrid) originalGrid.style.display = "none";
      try {
        const response = await fetch("/data/products.json");
        const products = await response.json();
        const usable = products.filter((product) => (
          product.status === "publish" &&
          product.title &&
          (product.price || product.regularPrice || product.salePrice) &&
          product.images &&
          product.images.length
        ));
        const shuffled = usable.sort(() => Math.random() - 0.5).slice(0, 3);
        if (!shuffled.length) return;
        const panel = document.createElement("section");
        panel.className = "da-random-products da-reveal is-visible";
        panel.innerHTML = `
          <div class="da-random-products-head">
            <p class="da-section-kicker">Aktuális ajánlatok</p>
            <h3>Véletlenszerűen kiemelt termékek</h3>
          </div>
          <div class="da-random-product-grid">
            ${shuffled.map((product) => {
              const image = product.images[0];
              const imageSrc = image.attachedFile ? `/wp-content/uploads/${image.attachedFile}` : `/${image.localUrl || ""}`;
              return `
                <a class="da-random-product-card" href="/termek/${product.slug}/">
                  <img src="${imageSrc}" alt="${product.title}">
                  <strong>${product.title}</strong>
                  <span>${formatPrice(product.salePrice || product.price || product.regularPrice)}</span>
                </a>
              `;
            }).join("")}
          </div>
        `;
        const anchor = whySection.querySelector(".elementor-widget-heading") || whySection;
        anchor.insertAdjacentElement("afterend", panel);
      } catch (error) {
        console.warn("Dent-Art product highlight failed", error);
      }
    };
    renderRandomProducts();

    const renderCourseInterest = () => {
      const isCoursePage = path.includes("/kurzusok/exocad-kezdo/") || path.includes("/kurzusok/exocad-halado/");
      if (!isCoursePage || document.querySelector(".da-course-interest")) return;
      const courseName = path.includes("halado") ? "EXOCAD Haladó" : "EXOCAD Kezdő";
      const panel = document.createElement("section");
      panel.className = "da-course-interest";
      panel.innerHTML = `
        <p class="da-section-kicker">Betelt kurzus esetén</p>
        <h2>${courseName}: érdeklődöm</h2>
        <p>Ha a kurzus betelt, add le az adataidat. Statikus preview-ban az érdeklődés mentésre kerül ebben a böngészőben, és előkészít egy emailt az info@dentarttechnik.hu címre.</p>
        <form>
          <input name="name" type="text" placeholder="Név" required>
          <input name="email" type="email" placeholder="Email cím" required>
          <button type="submit">Érdeklődöm</button>
        </form>
      `;
      panel.querySelector("form").addEventListener("submit", (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget).entries());
        const subscribers = getStoredJson("dentart_course_subscribers", []);
        subscribers.push({ ...data, course: courseName, createdAt: new Date().toISOString() });
        localStorage.setItem("dentart_course_subscribers", JSON.stringify(subscribers));
        window.location.href = `mailto:info@dentarttechnik.hu?subject=${encodeURIComponent(courseName + " érdeklődés")}&body=${encodeURIComponent(`Név: ${data.name}\nEmail: ${data.email}\nKurzus: ${courseName}`)}`;
      });
      const entry = document.querySelector(".entry-content") || document.querySelector(".site-main");
      if (entry) entry.appendChild(panel);
    };
    renderCourseInterest();

    const renderAboutTeam = () => {
      if (!path.includes("/rolunk/") || document.querySelector(".da-team-section")) return;
      const team = document.createElement("section");
      team.className = "da-team-section da-reveal is-visible";
      team.innerHTML = `
        <div class="da-team-intro">
          <p class="da-section-kicker">Vezetőség</p>
          <h2>Emberek a Dent-Art-Technik mögött</h2>
          <p>A több évtizedes szakmai múlt mögé arcokat és felelősségi köröket teszünk, hogy a cég ne csak hosszú szövegként, hanem élő csapatként jelenjen meg.</p>
        </div>
        <div class="da-team-grid">
          <article>
            <img src="/wp-content/uploads/2025-300x250.png" alt="Dr. Kónya János">
            <span>Cégvezető</span>
            <h3>Dr. Kónya János</h3>
            <p>Alapítói szemlélet, szakmai irány és innovációs háttér.</p>
          </article>
          <article>
            <img src="/wp-content/uploads/DentArtTechnik.png" alt="Tóth Csilla">
            <span>Cégvezető</span>
            <h3>Tóth Csilla</h3>
            <p>Működés, partnerkapcsolatok és szervezeti fókusz.</p>
          </article>
        </div>
      `;
      const entry = document.querySelector(".entry-content") || document.querySelector(".site-main");
      if (entry) entry.insertAdjacentElement("afterbegin", team);
    };
    renderAboutTeam();

    const banner = document.querySelector(".floating-banner-wrapper");
    const bannerPanel = banner && banner.querySelector(".floating-banner-panel");
    const bannerButton = banner && banner.querySelector(".floating-banner-btn");
    const bannerClose = banner && banner.querySelector(".floating-banner-close");

    if (banner && bannerPanel && bannerButton && bannerClose) {
      const setAlpineOpen = (isOpen) => {
        if (window.Alpine && typeof window.Alpine.$data === "function") {
          const state = window.Alpine.$data(banner);
          if (state && "isOpen" in state) {
            state.isOpen = isOpen;
          }
        }
      };

      const closeBanner = () => {
        setAlpineOpen(true);
        banner.classList.add("da-banner-open", "da-banner-compact");
        bannerPanel.style.display = "";
        bannerButton.style.display = "none";
        sessionStorage.setItem("floatingBannerCompact", "true");
      };

      const openBanner = () => {
        setAlpineOpen(true);
        banner.classList.add("da-banner-open");
        banner.classList.remove("da-banner-compact");
        bannerPanel.style.display = "";
        bannerButton.style.display = "none";
        sessionStorage.removeItem("floatingBannerClosed");
        sessionStorage.removeItem("floatingBannerCompact");
      };

      bannerClose.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeBanner();
      });

      bannerButton.addEventListener("click", (event) => {
        event.preventDefault();
        openBanner();
      });

      bannerPanel.addEventListener("mouseenter", () => {
        banner.classList.add("da-banner-hover");
      });

      bannerPanel.addEventListener("mouseleave", () => {
        banner.classList.remove("da-banner-hover");
      });

      if (sessionStorage.getItem("floatingBannerCompact") === "true") {
        closeBanner();
      } else {
        openBanner();
      }
    }
  });
})();
