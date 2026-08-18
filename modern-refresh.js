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
    if (isHome) {
      document.body.classList.add("da-home-page");
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
      ".ast-archive-post",
      ".site-footer .widget",
    ].join(",");

    const targets = Array.from(document.querySelectorAll(revealTargets));
    targets.forEach((target) => target.classList.add("da-reveal"));

    if (isHome) {
      const labels = [
        "Szakmai fókusz",
        "Előnyök",
        "Bemutatkozás",
        "Termékkínálat",
        "Hírek",
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

      document.querySelectorAll(".blog-special-grid img[srcset]").forEach((image) => {
        const candidates = image.srcset.split(",")
          .map((candidate) => {
            const parts = candidate.trim().split(/\s+/);
            return {
              url: parts[0],
              width: Number((parts[1] || "").replace("w", "")) || 0,
            };
          })
          .filter((candidate) => candidate.url);
        const largest = candidates.sort((a, b) => b.width - a.width)[0];
        if (largest) {
          image.src = largest.url;
          image.sizes = "(min-width: 922px) 680px, 100vw";
          image.setAttribute("data-da-hires", "true");
        }
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
    document.querySelectorAll('a[href*="/ajanlatkeres"], a[href*="ajanlatkeres"]').forEach((link) => {
      link.classList.add("da-quote-menu-link");
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
        <p class="da-section-kicker">Munkafolyamat</p>
        <h2>Hogyan dolgozunk együtt</h2>
        <div class="da-workflow-steps">
          <a class="da-workflow-step" href="#wpforms-27-field_1"><b>1</b><h3>Kapcsolat</h3><p>Megérkezik az igény, a csapat beazonosítja a feladat típusát.</p><span>Adatok megadása</span></a>
          <a class="da-workflow-step" href="#wpforms-27-field_3"><b>2</b><h3>Adatok</h3><p>A szükséges fájlok, kérdések és határidők egy helyre kerülnek.</p><span>Üzenet írása</span></a>
          <a class="da-workflow-step" href="#wpforms-27-field_5"><b>3</b><h3>Tervezés</h3><p>A szakmai háttér kiválasztja a megfelelő technológiát és munkamenetet.</p><span>Fájl csatolása</span></a>
          <a class="da-workflow-step" href="#wpforms-submit-27"><b>4</b><h3>Ajánlat</h3><p>Átlátható válasz érkezik, követhető következő lépéssel.</p><span>Küldés</span></a>
        </div>
      `;
      const entry = document.querySelector(".entry-content") || document.querySelector(".site-main");
      if (entry) {
        entry.appendChild(workflow);
        activateInserted(workflow);
      }
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

    const escapeHtml = (value) => String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    const plainToHtml = (value) => String(value || "")
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
      .join("\n");

    const removeClosestSection = (node) => {
      const section = node?.closest(".e-parent") || node?.closest("section, article, .elementor-element");
      if (section) section.remove();
    };

    const isLoggedIn = () => (
      document.body.classList.contains("logged-in") ||
      Boolean(window.astraAddon?.is_logged_in) ||
      Boolean(window.wp?.data)
    );

    const getProductOverrides = () => getStoredJson("dentart_product_overrides", {});
    const getCourseOverrides = () => getStoredJson("dentart_course_overrides", {});

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
      const heading = serviceFocusSection.querySelector("h1, h2, h3");
      if (heading) heading.textContent = "Szolgáltatásaink";
    }
    document.querySelectorAll(".da-service-focus-names, .da-discipline-switcher").forEach((node) => node.remove());

    if (isHome) {
      document.querySelectorAll(".atp-item").forEach((item) => {
        const text = `${item.textContent || ""} ${item.querySelector(".atp-image")?.getAttribute("title") || ""} ${item.querySelector("a")?.getAttribute("href") || ""}`;
        if (/cirkont[oö]mb|cirk[oó]nium/i.test(text)) item.remove();
      });
      document.querySelectorAll(".atp-container").forEach((container) => {
        if (!container.querySelector(".atp-item")) removeClosestSection(container);
      });

      document.querySelectorAll("h1, h2, h3").forEach((heading) => {
        const text = heading.textContent.trim();
        if (/^TOP term[eé]kek$/i.test(text)) removeClosestSection(heading);
        if (/^Hírek$/i.test(text)) heading.textContent = "Aktuális szakmai híreink";
      });

      document.querySelectorAll(".blog-special-grid .bsg-custom").forEach((card) => card.remove());
      document.querySelectorAll(".blog-special-grid .bsg-custom-headline").forEach((headline) => {
        if (/Érdekesnek találta cikkeinket/i.test(headline.textContent || "")) headline.remove();
      });
    }

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

    const enhanceFooter = () => {
      document.querySelectorAll(".da-social-links").forEach((node) => node.remove());

      const socialMarkup = `
        <span>Kövessen minket:</span>
        <a class="da-footer-social-icon" href="https://www.facebook.com/profile.php?id=61583350573056" target="_blank" rel="noopener" aria-label="Facebook">
          <i class="fab fa-facebook-f" aria-hidden="true"></i><span class="da-visually-hidden">Facebook</span>
        </a>
        <a class="da-footer-social-icon" href="https://www.instagram.com/dentarttechnik/" target="_blank" rel="noopener" aria-label="Instagram">
          <i class="fab fa-instagram" aria-hidden="true"></i><span class="da-visually-hidden">Instagram</span>
        </a>
        <a class="da-footer-social-icon" href="https://www.youtube.com/@Dentarttechnik92" target="_blank" rel="noopener" aria-label="YouTube">
          <i class="fab fa-youtube" aria-hidden="true"></i><span class="da-visually-hidden">YouTube</span>
        </a>
      `;

      const followParagraph = Array.from(document.querySelectorAll(".site-footer p")).find((paragraph) => (
        /kövess|kövessen/i.test(paragraph.textContent || "")
      ));
      if (followParagraph) {
        followParagraph.classList.add("da-footer-social-row");
        followParagraph.innerHTML = socialMarkup;
      }

      const infoMenu = document.querySelector(".site-footer .menu-info-container .menu, .site-footer nav[aria-label='Információk'] .menu");
      if (infoMenu) {
        const infoItems = [
          ["Általános szerződési feltételek", "/altalanos-szerzodesi-feltetelek/"],
          ["Adatkezelési tájékoztató", "/adatkezeles/"],
          ["Cookie tájékoztató", "/cookie-tajekoztato/"],
          ["Szállítás", "/szallitas/"],
          ["Fizetés", "/fizetes/"],
          ["Impresszum", "/impresszum/"],
          ["Kapcsolat", "/kapcsolat/"],
          ["Pályázatok", "/palyazatok/"],
        ];
        infoMenu.querySelectorAll('a[href*="ajanlatkeres"]').forEach((link) => {
          link.closest("li")?.remove();
        });
        const currentTexts = Array.from(infoMenu.querySelectorAll("a")).map((link) => link.textContent.trim());
        infoItems.forEach(([label, href]) => {
          if (currentTexts.includes(label)) return;
          const item = document.createElement("li");
          item.className = "menu-item menu-item-type-custom da-footer-info-item";
          item.innerHTML = `<a class="menu-link" href="${href}">${label}</a>`;
          infoMenu.appendChild(item);
        });
      }

      const copyright = document.querySelector(".site-footer .ast-footer-copyright");
      if (copyright && !copyright.querySelector(".da-footer-credit")) {
        const legacyWeb = Array.from(copyright.querySelectorAll("p")).find((paragraph) => /Web:/i.test(paragraph.textContent || ""));
        if (legacyWeb) legacyWeb.remove();
        const credit = document.createElement("p");
        credit.className = "da-footer-credit";
        credit.innerHTML = `
          <span>Web:</span>
          <img src="/wp-content/uploads/Weboldal-logo-sav.png" alt="D.A-Tech">
          <span class="da-footer-slash">/</span>
          <a href="https://www.xkreativ.hu/" target="_blank" rel="noopener">Xkreativ</a>
        `;
        copyright.appendChild(credit);
      }

      if (!isLoggedIn()) {
        document.querySelectorAll(".site-footer a, #ast-desktop-header a, #ast-mobile-header a").forEach((link) => {
          const label = (link.textContent || "").trim();
          const href = link.getAttribute("href") || "";
          if (/Rendeléseim|Pénztár|Kosár/i.test(label) || /\/(orders|penztar|kosar)\//i.test(href)) {
            link.closest("li, .menu-item, section, .ast-builder-layout-element")?.remove();
          }
        });
      }
    };
    enhanceFooter();

    const renderPaymentPage = () => {
      if (!path.includes("/fizetes/") || document.querySelector(".da-payment-info")) return;
      const entry = document.querySelector(".entry-content");
      if (!entry) return;
      entry.innerHTML = `
        <section class="da-payment-info da-reveal is-visible">
          <p class="da-section-kicker">Fizetési információk</p>
          <h2>Átlátható, előre egyeztetett fizetési folyamat</h2>
          <p>A Dent-Art-Techniknél a fizetés módja a megrendelés típusához, a szolgáltatás jellegéhez és az előzetesen egyeztetett feltételekhez igazodik. Célunk, hogy a rendelés leadása után a partner pontosan tudja, mikor és milyen módon történik a kiegyenlítés.</p>
          <div class="da-payment-grid">
            <article>
              <span>01</span>
              <h3>Előzetes egyeztetés</h3>
              <p>Egyedi fogtechnikai munkák és szolgáltatások esetén a fizetési feltételeket az ajánlatban vagy a visszaigazolásban rögzítjük.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Banki átutalás</h3>
              <p>Céges partnereink számára a leggyakoribb fizetési mód a számla alapján történő banki átutalás.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Webshop rendelés</h3>
              <p>Termékvásárlásnál a rendelési folyamatban megjelenő fizetési és szállítási feltételek az irányadók.</p>
            </article>
            <article>
              <span>04</span>
              <h3>Kérdés esetén</h3>
              <p>Ha bizonytalan a fizetési módban vagy számlázási adatokban, kollégáink segítenek a rendelés véglegesítése előtt.</p>
            </article>
          </div>
          <a class="da-payment-cta" href="/kapcsolat/">Kapcsolatfelvétel</a>
        </section>
      `;
    };
    renderPaymentPage();

    const applyPostOverrides = async () => {
      const savedPosts = getStoredJson("dentart_blog_posts", []);
      const wordpressOverrides = savedPosts.filter((post) => post.source === "wordpress");
      if (!wordpressOverrides.length) return;

      if (pageType === "news" || isHome) {
        wordpressOverrides.forEach((post) => {
          const article = pageType === "news"
            ? document.querySelector(`#post-${post.originalId}`)
            : Array.from(document.querySelectorAll(".blog-special-grid .bsg-post")).find((card) => (
              card.querySelector(`a[href*="${post.slug}"]`)
            ));
          if (!article) return;
          if (post.deletedAt) {
            article.remove();
            return;
          }
          const titleLink = article.querySelector(".entry-title a, h2 a, h3 a");
          const image = article.querySelector("img.wp-post-image, .post-thumb img");
          const excerpt = article.querySelector(".bsg-excerpt");
          if (titleLink && post.title) titleLink.textContent = post.title;
          if (excerpt && (post.excerpt || post.content)) excerpt.textContent = post.excerpt || post.content.slice(0, 180);
          if (image && post.image) {
            image.src = post.image;
            image.removeAttribute("srcset");
            image.alt = post.title || "";
          }
        });
        return;
      }

      try {
        const response = await fetch("/data/posts.json");
        const originalPosts = await response.json();
        const currentPost = originalPosts.find((post) => post.slug === pageSlug);
        const overridePost = currentPost && wordpressOverrides.find((post) => Number(post.originalId) === Number(currentPost.id));
        if (!overridePost || overridePost.deletedAt) return;
        const title = document.querySelector(".entry-title");
        const content = document.querySelector(".entry-content");
        if (title && overridePost.title) title.textContent = overridePost.title;
        if (content) content.innerHTML = overridePost.contentHtml || plainToHtml(overridePost.content);
      } catch (error) {
        console.warn("Dent-Art post override failed", error);
      }
    };
    applyPostOverrides();

    const renderAdminPosts = () => {
      if (pageType !== "news" || document.querySelector(".da-admin-posts")) return;
      const posts = getStoredJson("dentart_blog_posts", []).filter((post) => post.source !== "wordpress" && !post.deletedAt);
      if (!posts.length) return;
      const grid = document.createElement("section");
      grid.className = "da-admin-posts da-reveal is-visible";
      grid.innerHTML = `
        <p class="da-section-kicker">Friss blogposztok</p>
        <h2>Adminból hozzáadott hírek</h2>
        <div class="da-admin-post-grid">
          ${posts.map((post) => `
            <article class="da-admin-post-card">
              ${post.image ? `<img src="${escapeHtml(post.image)}" alt="">` : ""}
              <span>${escapeHtml(post.date || "")}</span>
              <h3>${escapeHtml(post.title || "Új hír")}</h3>
              <p>${escapeHtml(post.excerpt || post.content || "")}</p>
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
      const whySection = document.querySelector(".elementor-element-1f5b655") || document.querySelector(".usp-section");
      if (!whySection) return;
      try {
        const response = await fetch("/data/products.json");
        const productOverrides = getProductOverrides();
        const products = (await response.json()).map((product) => ({
          ...product,
          ...(productOverrides[String(product.id)] || {}),
        }));
        const usable = products.filter((product) => (
          product.status === "publish" &&
          product.title &&
          !/cirkont[oö]mb|cirk[oó]nium/i.test(`${product.title} ${product.slug} ${(product.tags || []).map((tag) => tag.name).join(" ")}`) &&
          (product.price || product.regularPrice || product.salePrice) &&
          product.images &&
          product.images.length
        ));
        const shuffled = usable.sort(() => Math.random() - 0.5).slice(0, 4);
        if (!shuffled.length) return;
        const panel = document.createElement("section");
        panel.className = "da-random-products da-reveal is-visible";
        panel.innerHTML = `
          <div class="da-random-products-head">
            <h2>Termékeink</h2>
          </div>
          <div class="da-random-product-grid">
            ${shuffled.map((product) => {
              const image = product.images[0];
              const imageSrc = product.image || (image.attachedFile ? `/wp-content/uploads/${image.attachedFile}` : `/${image.localUrl || ""}`);
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
        whySection.insertAdjacentElement("afterend", panel);
      } catch (error) {
        console.warn("Dent-Art product highlight failed", error);
      }
    };
    renderRandomProducts();

    const renderCourseInterest = () => {
      const isCoursePage = path.includes("/kurzusok/") || path.includes("/kurzus-reszletek/");
      if (!isCoursePage || document.querySelector(".da-course-interest")) return;
      const courseOverrides = getCourseOverrides();
      const detectedTitle = document.querySelector(".entry-title, h1")?.textContent?.trim() || "Kurzusaink";
      const courseName = path.includes("halado")
        ? "EXOCAD Haladó"
        : path.includes("kezdo")
          ? "EXOCAD Kezdő"
          : path.includes("cirkonium")
            ? "Cirkónium mesterfokon"
            : detectedTitle;
      const courseOverride = courseOverrides[courseName] || courseOverrides[path.split("/").filter(Boolean).pop()] || {};
      const panel = document.createElement("section");
      panel.className = "da-course-interest";
      panel.innerHTML = `
        <p class="da-section-kicker">Kurzus érdeklődés</p>
        <h2>${escapeHtml(courseOverride.title || courseName)}: érdeklődöm</h2>
        <p>${escapeHtml(courseOverride.description || "Ha a kurzus betelt, vagy szeretnél értesítést kapni a következő időpontról, add le az adataidat. Az érdeklődés mentésre kerül ebben a böngészőben, és előkészít egy emailt az info@dentarttechnik.hu címre.")}</p>
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

    const captureQuoteRequests = () => {
      if (pageType !== "quote") return;
      const form = document.querySelector("#wpforms-form-27, .wpforms-form, .entry-content form");
      if (!form || form.dataset.daQuoteCapture === "true") return;
      form.dataset.daQuoteCapture = "true";

      const getFieldLabel = (field) => {
        if (field.id) {
          const label = document.querySelector(`label[for="${field.id}"]`);
          if (label) return label.textContent.trim();
        }
        return field.getAttribute("aria-label") || field.placeholder || field.name || "Adat";
      };

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const fields = Array.from(form.querySelectorAll("input, textarea, select"))
          .filter((field) => !["hidden", "submit", "button"].includes(field.type))
          .map((field) => {
            const value = field.type === "file"
              ? Array.from(field.files || []).map((file) => file.name).join(", ")
              : field.value;
            return {
              label: getFieldLabel(field).replace(/\*/g, "").trim(),
              value: String(value || "").trim(),
            };
          })
          .filter((field) => field.value);

        const requests = getStoredJson("dentart_quote_requests", []);
        const nameField = fields.find((field) => /név|name/i.test(field.label));
        requests.unshift({
          id: Date.now(),
          status: "new",
          name: nameField?.value || "Új ajánlatkérés",
          fields,
          createdAt: new Date().toISOString(),
          source: "Ajánlatkérés oldal",
        });
        localStorage.setItem("dentart_quote_requests", JSON.stringify(requests));

        let notice = form.querySelector(".da-form-success");
        if (!notice) {
          notice = document.createElement("p");
          notice.className = "da-form-success";
          form.appendChild(notice);
        }
        notice.textContent = "Köszönjük, az ajánlatkérés mentésre került.";
        form.reset();
      });
    };
    captureQuoteRequests();

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
