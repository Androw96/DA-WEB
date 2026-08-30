(function () {
  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  };

  ready(() => {
    const pagesBase = window.location.hostname.endsWith("github.io")
      ? `/${window.location.pathname.split("/").filter(Boolean)[0] || ""}`
      : "";
    const siteUrl = (url) => {
      if (!url || !url.startsWith("/") || url.startsWith("//")) return url;
      if (!pagesBase || url.startsWith(`${pagesBase}/`)) return url;
      return `${pagesBase}${url}`;
    };
    const rawPath = window.location.pathname.replace(/\/index\.html$/, "/");
    const path = pagesBase && rawPath.startsWith(`${pagesBase}/`)
      ? rawPath.slice(pagesBase.length) || "/"
      : rawPath;
    const normalizeSiteUrls = (root = document) => {
      if (!pagesBase) return;
      root.querySelectorAll("[href], [src], [action]").forEach((element) => {
        ["href", "src", "action"].forEach((attribute) => {
          const value = element.getAttribute(attribute);
          if (value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith(`${pagesBase}/`)) {
            element.setAttribute(attribute, siteUrl(value));
          }
        });
      });
      root.querySelectorAll("[srcset]").forEach((element) => {
        const value = element.getAttribute("srcset");
        if (!value) return;
        element.setAttribute("srcset", value
          .split(",")
          .map((item) => {
            const parts = item.trim().split(/\s+/);
            if (parts[0]?.startsWith("/") && !parts[0].startsWith(`${pagesBase}/`)) {
              parts[0] = siteUrl(parts[0]);
            }
            return parts.join(" ");
          })
          .join(", "));
      });
    };
    const isHome = document.body.classList.contains("home") || path === "/" || path.endsWith("/simply-static-1-1784283072/");
    const pageType = (() => {
      if (path.includes("/fogaszat/")) return "dentistry";
      if (path.includes("/fogtechnika/")) return "lab";
      if (path.includes("/ajanlatkeres/")) return "quote";
      if (path.includes("/hirek/")) return "news";
      if (path.includes("/palyazatok/")) return "grants";
      if (path.includes("/szolgaltatasok/")) return "services";
      if (path.includes("/rolunk/")) return "about";
      if (path.includes("/kurzusok/")) return "courses";
      return "";
    })();

    if (pageType) {
      document.body.classList.add(`da-${pageType}-page`);
    }
    if (isHome) {
      document.body.classList.add("da-home-page");
    }
    if (path.includes("/a-mosoly-hattere-szakmai-nap-gyorben/")) {
      document.body.classList.add("da-smile-event-page");
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
        "",
        "Előnyök",
        "Bemutatkozás",
        "Termékkínálat",
        "Hírek",
      ];
      document.querySelectorAll(".elementor-widget-heading h2.elementor-heading-title").forEach((heading, index) => {
        const widget = heading.closest(".elementor-widget-heading");
        if (!widget || widget.querySelector(".da-component-subtitle")) return;
        widget.classList.add("da-component-heading");
        if (!labels[index % labels.length]) return;
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
    ).filter((card) => {
      const isServiceFocusCard = Boolean(
        card.closest(".da-home-services, .da-service-modern-grid, body.da-dentistry-page, body.da-lab-page")
      );
      const isNavigationCard = Boolean(card.closest(".main-header-menu, .custom-sidebar-menu"));
      return !isServiceFocusCard && !isNavigationCard;
    });
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
    const getFloatingLayer = () => {
      let layer = document.querySelector(".da-floating-layer");
      if (!layer) {
        layer = document.createElement("div");
        layer.className = "da-floating-layer";
      }
      if (layer.parentElement !== document.documentElement) {
        document.documentElement.appendChild(layer);
      }
      return layer;
    };
    let floatingUiFrame = 0;
    const positionFloatingUi = () => {
      const cta = document.querySelector(".da-floating-cta");
      const banner = document.querySelector(".floating-banner-wrapper");
      const layer = getFloatingLayer();
      if (banner && banner.parentElement !== layer) layer.appendChild(banner);
      if (cta && cta.parentElement !== layer) layer.appendChild(cta);
      const footer = document.querySelector(".site-footer");
      const footerTopInViewport = footer ? footer.getBoundingClientRect().top : Number.POSITIVE_INFINITY;
      const layerHeight = layer.getBoundingClientRect().height || 0;
      const bottomGap = window.matchMedia("(max-width: 768px)").matches ? 12 : 18;
      const shouldHideFloatingUi = footerTopInViewport < window.innerHeight - bottomGap - layerHeight;
      layer.style.top = "";
      layer.style.bottom = "";
      layer.classList.toggle("da-floating-layer-hidden", shouldHideFloatingUi);

      if (cta) {
        cta.classList.toggle("da-floating-cta-compact", window.matchMedia("(max-width: 640px)").matches);
        cta.setAttribute("aria-hidden", shouldHideFloatingUi ? "true" : "false");
        cta.tabIndex = shouldHideFloatingUi ? -1 : 0;
        cta.classList.toggle("da-floating-cta-hidden", shouldHideFloatingUi);
      }

      if (banner) {
        banner.classList.toggle("da-banner-hidden", shouldHideFloatingUi);
        banner.setAttribute("aria-hidden", shouldHideFloatingUi ? "true" : "false");
      }
    };
    const syncFloatingUi = () => {
      if (floatingUiFrame) return;
      floatingUiFrame = requestAnimationFrame(() => {
        floatingUiFrame = 0;
        positionFloatingUi();
      });
    };
    syncFloatingUi();
    window.addEventListener("scroll", syncFloatingUi, { passive: true });
    window.addEventListener("resize", syncFloatingUi);
    document.querySelectorAll('a[href*="/ajanlatkeres"], a[href*="ajanlatkeres"]').forEach((link) => {
      link.classList.add("da-quote-menu-link");
    });
    document.querySelectorAll(
      '.main-header-menu a[href*="/ajanlatkeres"], .main-header-menu a[href*="ajanlatkeres"], .site-footer .menu a[href*="/ajanlatkeres"], .site-footer .menu a[href*="ajanlatkeres"]'
    ).forEach((link) => {
      link.closest("li.menu-item")?.remove();
    });

    const wireNavigationSubmenus = () => {
      const expandableMenus = ".main-header-menu, .custom-sidebar-menu .custom-menu-list";
      const isInsideExpandableMenu = (node) => node?.closest?.(expandableMenus);
      const getDirectChild = (item, selector) => Array.from(item.children).find((child) => child.matches?.(selector));
      const isCategoryBranch = (item) => {
        const categoryRoot = item.closest(".kiemelt-link");
        return Boolean(categoryRoot && categoryRoot !== item);
      };
      const isSidebarBranch = (item) => Boolean(item.closest(".custom-sidebar-menu"));
      const makeLinkOnlyBranch = (item) => {
        const link = getDirectChild(item, "a.menu-link, a");
        item.classList.add("da-link-only-branch");
        item.classList.remove("da-has-click-submenu", "da-submenu-open", "ast-submenu-expanded");
        link?.removeAttribute("aria-haspopup");
        link?.removeAttribute("role");
        link?.setAttribute("aria-expanded", "false");
      };

      document.querySelectorAll(`${expandableMenus} .menu-item-has-children`).forEach((item) => {
        const button = getDirectChild(item, "button.ast-menu-toggle");
        const link = getDirectChild(item, "a.menu-link, a");
        const submenu = getDirectChild(item, "ul.sub-menu");
        if (!submenu) return;
        if (isCategoryBranch(item) || isSidebarBranch(item)) {
          makeLinkOnlyBranch(item);
          return;
        }
        item.classList.add("da-has-click-submenu");
        link?.setAttribute("aria-haspopup", "true");
        link?.setAttribute("role", "button");
        button?.setAttribute("aria-haspopup", "true");
        if (item.dataset.daSubmenuReady === "true") return;
        item.dataset.daSubmenuReady = "true";

        const setExpanded = (expanded) => {
          item.classList.toggle("ast-submenu-expanded", expanded);
          item.classList.toggle("da-submenu-open", expanded);
          button?.setAttribute("aria-expanded", String(expanded));
          link?.setAttribute("aria-expanded", String(expanded));
        };

        button?.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          setExpanded(!item.classList.contains("ast-submenu-expanded"));
        });

        link?.addEventListener("click", (event) => {
          if (!isInsideExpandableMenu(event.target)) return;
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation?.();
          setExpanded(!item.classList.contains("ast-submenu-expanded"));
        });

        item.addEventListener("click", (event) => {
          if (submenu.contains(event.target)) return;
          const clickedDirectLink = link && (event.target === link || link.contains(event.target));
          const clickedDirectButton = button && (event.target === button || button.contains(event.target));
          if (clickedDirectLink || clickedDirectButton) return;
          event.preventDefault();
          event.stopPropagation();
          setExpanded(!item.classList.contains("ast-submenu-expanded"));
        });
      });

      if (document.body.dataset.daDelegatedSubmenus !== "true") {
        document.body.dataset.daDelegatedSubmenus = "true";
        document.addEventListener("click", (event) => {
          const menuRoot = event.target.closest?.(expandableMenus);
          if (!menuRoot) return;

          const item = event.target.closest(".menu-item-has-children");
          if (!item || !menuRoot.contains(item)) return;
          if (item.classList.contains("da-link-only-branch") || isCategoryBranch(item) || isSidebarBranch(item)) {
            makeLinkOnlyBranch(item);
            return;
          }

          const submenu = getDirectChild(item, "ul.sub-menu");
          if (!submenu || submenu.contains(event.target)) return;

          const directLink = getDirectChild(item, "a.menu-link, a");
          const directButton = getDirectChild(item, "button.ast-menu-toggle");
          const clickedDirectLink = directLink && (event.target === directLink || directLink.contains(event.target));
          const clickedDirectButton = directButton && (event.target === directButton || directButton.contains(event.target));
          const clickedItemSurface = event.target === item;
          if (!clickedDirectLink && !clickedDirectButton && !clickedItemSurface) return;

          item.classList.add("da-has-click-submenu");
          directLink?.setAttribute("aria-haspopup", "true");
          directLink?.setAttribute("role", "button");
          directButton?.setAttribute("aria-haspopup", "true");
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation?.();
          const expanded = !item.classList.contains("da-submenu-open") && !item.classList.contains("ast-submenu-expanded");
          item.classList.toggle("ast-submenu-expanded", expanded);
          item.classList.toggle("da-submenu-open", expanded);
          directButton?.setAttribute("aria-expanded", String(expanded));
          directLink?.setAttribute("aria-expanded", String(expanded));
        }, true);
      }
    };
    wireNavigationSubmenus();

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
          ${panel.image ? `<img src="${siteUrl(panel.image)}" alt="${panel.title}">` : ""}
          <h3>${panel.title}</h3>
          <p>${panel.text}</p>
        </article>
      `).join("");
      return grid;
    };

    if (pageType === "dentistry" && !document.querySelector(".da-page-hero")) {
      insertAfterHeader(createHero({
        kicker: "Fogászat",
        title: "A pontos diagnózistól a személyre szabott megoldásig!",
        text: "Modern diagnosztikai, esztétikai és implantációs megoldások, digitális tervezéssel és személyre szabott szemlélettel.",
        stats: [
          { value: "01", label: "diagnózis" },
          { value: "02", label: "tervezés" },
          { value: "03", label: "mosoly" },
        ],
      }));
      insertAfterHeader(createPanelGrid("da-service-modern-grid", [
        { title: "Esztétikai megoldások", text: "Héjkerámiák, esztétikai fogpótlások és komplex mosolyrehabilitációk a természetes és kiszámítható végeredményért.", image: "/wp-content/uploads/Veneers.png" },
        { title: "Implantációs megoldások", text: "Implantációs és protetikai háttér az egyedi felépítményektől a teljes fogíves rehabilitációkig.", image: "/wp-content/uploads/Implantacios-protetika.png" },
        { title: "Digitális együttműködés", text: "Digitális tervezés és korszerű gyártástechnológia a pontosabb, gyorsabb és kiszámíthatóbb közös munkáért.", image: "/wp-content/uploads/Digitalis-tervezes-600x493.png" },
      ]));
    }

    if (pageType === "lab" && !document.querySelector(".da-page-hero")) {
      insertAfterHeader(createHero({
        kicker: "Fogtechnika",
        title: "Technológiai háttér, amire a laborja építhet",
        text: "A digitális tervezéstől a gyártáson át az anyagellátásig olyan technológiai és szakmai hátteret biztosítunk, amelyre fogtechnikai partnerként a mindennapi munkában is számíthat.",
        stats: [
          { value: "CAD", label: "tervezés" },
          { value: "CAM", label: "gyártás" },
          { value: "3D", label: "technológia" },
        ],
      }));
      insertAfterHeader(createPanelGrid("da-service-modern-grid", [
        { title: "Technológiai háttér", text: "Precíz digitális tervezés, 3D nyomtatás és marástechnológia egy helyen.", image: "/wp-content/uploads/Cirkonmaras-600x600.png" },
        { title: "Laborpartnerség", text: "Rugalmas gyártási és szakmai háttér fogtechnikai laborok számára, az egyedi feladattól a komplex munkákig.", image: "/wp-content/uploads/partneri-utvonal-business-v1.png" },
        { title: "Anyag- és eszközellátás", text: "Vsmile és D-Tech alap- és segédanyagok közvetlenül a labor mindennapi munkájához.", image: "/wp-content/uploads/LMF-600x600.png" },
      ]));
    }

    if (pageType === "quote" && !document.querySelector(".da-workflow")) {
      document.querySelectorAll('img[src*="Fogtechnikai-munkafolyamat"], img[alt*="munkafolyamat" i]').forEach((image) => {
        image.closest("p, figure, .wp-block-image, .elementor-widget-image")?.classList.add("da-hide-static-workflow");
      });
      const workflow = document.createElement("section");
      workflow.className = "da-workflow da-reveal";
      const steps = [
        { title: "Lenyomatvétel", text: "Oral scan / analóg lenyomat", href: "#wpforms-27-field_1", icon: "tooth", tone: "blue", x: 14, y: 54, label: "top" },
        { title: "Design I.", text: "Virtuális tervezés, 3D ellenőrzés, mock-up STL", href: "#wpforms-27-field_3", icon: "screen", tone: "purple", x: 28, y: 59, label: "bottom" },
        { title: "Rendelői konzultáció", text: "Mock-up próba", href: "#wpforms-27-field_3", icon: "clipboard", tone: "blue", x: 42, y: 51, label: "top" },
        { title: "Design II.", text: "Végleges design, 3D ellenőrzés, mock-up II., változtatások megbeszélése", href: "#wpforms-27-field_5", icon: "screen", tone: "purple", x: 56, y: 58, label: "bottom" },
        { title: "Gyártás", text: "Kidolgozás, leplezés, ragasztás", href: "#wpforms-27-field_5", icon: "gear", tone: "blue", x: 70, y: 51, label: "top" },
        { title: "Szállítás", text: "Biztonságos logisztika", href: "#wpforms-submit-27", icon: "palette", tone: "purple", x: 84, y: 58, label: "bottom" },
        { title: "Átadás", text: "Kész munka átadása", href: "#wpforms-submit-27", icon: "pin", tone: "green", x: 96, y: 53, label: "top" },
      ];
      const workflowIcons = {
        tooth: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M15.5 8.5c3.1-1.7 6 .5 8.5.5s5.4-2.2 8.5-.5c4.8 2.7 4.6 9.4 2.5 15.8-1.8 5.5-2 14.7-6.5 14.7-2.8 0-2.2-9.7-5-9.7s-2.2 9.7-5 9.7c-4.5 0-4.7-9.2-6.5-14.7-2.1-6.4-2.3-13.1 2.5-15.8Z"/></svg>',
        screen: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 12h32v21H8zM18 39h12M15 33h18"/><path d="M28 27 39 16M35 14l5 5M24 31l-3 1 1-3 12-12 2 2Z"/></svg>',
        clipboard: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M16 10h16v6H16z"/><path d="M13 13H9v29h30V13h-4M18 24h12M18 31h12M18 38h8"/><path d="M22 7h4"/></svg>',
        gear: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 17a7 7 0 1 1 0 14 7 7 0 0 1 0-14Z"/><path d="M24 7v6M24 35v6M7 24h6M35 24h6M11.9 11.9l4.2 4.2M31.9 31.9l4.2 4.2M36.1 11.9l-4.2 4.2M16.1 31.9l-4.2 4.2"/></svg>',
        palette: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 8c-8.2 0-15 5.5-15 12.9 0 6.7 5.5 12.1 12.7 12.1h2.4c2 0 3.2 2.2 2.1 3.9-.9 1.4.1 3.1 1.8 3.1 6.2 0 11-6.5 11-14.8C39 15.7 32.2 8 24 8Z"/><path d="M16 21h.1M22 17h.1M30 18h.1M34 25h.1"/></svg>',
        pin: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 43s13-11.7 13-23A13 13 0 0 0 11 20c0 11.3 13 23 13 23Z"/><path d="M24 25a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"/></svg>',
      };
      const arrows = [
        { x: 21, y: 55, r: 10, w: 72 },
        { x: 35, y: 55, r: -12, w: 72 },
        { x: 49, y: 54, r: 12, w: 72 },
        { x: 63, y: 54, r: -12, w: 72 },
        { x: 77, y: 54, r: 12, w: 72 },
        { x: 90, y: 55, r: -5, w: 58 },
      ];
      workflow.innerHTML = `
        <p class="da-section-kicker">Munkafolyamat</p>
        <h2>Munkafolyamat fogászat és fogtechnika között</h2>
        <div class="da-workflow-road da-workflow-map" aria-label="Fogtechnikai munkafolyamat">
          <div class="da-workflow-steps">
            ${arrows.map((arrow, index) => `
              <span class="da-workflow-arrow" aria-hidden="true" style="--x:${arrow.x}%; --y:${arrow.y}%; --r:${arrow.r}deg; --w:${arrow.w}px; --da-card-index:${index};"></span>
            `).join("")}
            ${steps.map((step, index) => `
              <a class="da-workflow-step is-${step.tone} is-${step.label}" href="${step.href}" style="--da-card-index:${index}; --x:${step.x}%; --y:${step.y}%;">
                <b>${workflowIcons[step.icon]}</b>
                <div class="da-workflow-copy">
                  <h3>${step.title}</h3>
                  <p>${step.text}</p>
                </div>
                <span class="da-workflow-action">${index === steps.length - 1 ? "Lezárás" : "Ugrás a ponthoz"}</span>
              </a>
            `).join("")}
          </div>
        </div>
      `;
      const entry = document.querySelector(".entry-content") || document.querySelector(".site-main");
      if (entry) {
        if (!document.querySelector(".da-quote-intro")) {
          const intro = document.createElement("section");
          intro.className = "da-quote-intro da-reveal is-visible";
          intro.innerHTML = `
            <p class="da-section-kicker">Ajánlatkérés</p>
            <h2>Személyre szabott szakmai válasz, átlátható lépésekben</h2>
            <p>Írja meg, milyen munkához, anyaghoz vagy digitális folyamathoz kér támogatást. A beérkező információk alapján olyan ajánlatot készítünk, amely nem csak árat, hanem követhető szakmai útvonalat is ad.</p>
          `;
          entry.insertAdjacentElement("afterbegin", intro);
        }
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
      serviceFocusSection.classList.add("da-home-services", "da-reveal", "is-visible");
      const heading = serviceFocusSection.querySelector("h1, h2, h3");
      if (heading) heading.textContent = "Szolgáltatásaink";
    }
    document.querySelectorAll(".da-service-focus-names, .da-discipline-switcher").forEach((node) => node.remove());

    const renderPartnerStrip = () => {
      const partnerImage = document.querySelector(".elementor-element-9e5c440 img[src*='Weboldal-logo-sav']");
      if (!partnerImage || document.querySelector(".da-partner-logo-grid")) return;
      const widget = partnerImage.closest(".elementor-widget-container") || partnerImage.parentElement;
      if (!widget) return;
      const logos = [
        ["SGS Dental", "/wp-content/uploads/partners/sgs-dental.png"],
        ["D-Tech 3D", "/wp-content/uploads/partners/dtech-3d.png"],
        ["VSmile", "/wp-content/uploads/partners/vsmile.png"],
        ["Dent Art Klinik", "/wp-content/uploads/partners/dent-art-klinik.png"],
        ["Bono", "/wp-content/uploads/partners/bono.png"],
        ["Dent-Art-Technik", "/wp-content/uploads/partners/dent-art-technik.png"],
      ];
      const grid = document.createElement("div");
      grid.className = "da-partner-logo-grid";
      grid.setAttribute("aria-label", "Partnereink");
      grid.innerHTML = logos.map(([name, src]) => `
        <div class="da-partner-logo-card">
          <img src="${siteUrl(src)}" alt="${escapeHtml(name)}">
        </div>
      `).join("");
      widget.replaceChildren(grid);
    };
    renderPartnerStrip();

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
        if (item.closest(".kiemelt-link")) return false;
        const linkText = item.querySelector(":scope > a .menu-text, :scope > a")?.textContent?.trim() || "";
        return linkText === "Szolgáltatások";
      });
      const submenuItems = [
        ["Fogászat", "/fogaszat/"],
        ["Fogtechnika", "/fogtechnika/"],
        ["Kurzusok", "/kurzusok/"],
      ];
      serviceItems.forEach((item) => {
        item.classList.add("menu-item-has-children");
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
      wireNavigationSubmenus();
    };

    const simplifyCategoryDropdown = () => {
      const categoryLinks = [
        ["Termékek", "/uzlet/"],
        ["Szolgáltatások", "/szolgaltatasok/"],
        ["Kurzusok", "/kurzusok/"],
        ["Rólunk", "/rolunk/"],
      ];

      document.querySelectorAll(".main-header-menu .kiemelt-link").forEach((root) => {
        let submenu = Array.from(root.children).find((child) => child.matches?.("ul.sub-menu"));
        if (!submenu) {
          submenu = document.createElement("ul");
          submenu.className = "sub-menu";
          root.appendChild(submenu);
        }

        root.classList.add("menu-item-has-children", "da-simplified-categories");
        submenu.innerHTML = categoryLinks.map(([label, href]) => (
          `<li class="menu-item menu-item-type-custom da-category-direct-link"><a class="menu-link" href="${href}">${label}</a></li>`
        )).join("");
      });
    };
    simplifyCategoryDropdown();
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
          <a href="https://da-technology.eu/" target="_blank" rel="noopener">D.A.-Tech</a>
          <span class="da-footer-slash">/</span>
          <a href="https://www.xkreativ.hu/" target="_blank" rel="noopener">xkreativ</a>
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
        const response = await fetch(siteUrl("/data/posts.json"));
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
      const serviceSection = document.querySelector(".da-home-services");
      const fallbackSection = document.querySelector(".dentart-slider")?.closest(".e-parent, .e-con, section") || document.querySelector(".elementor-element-1f5b655") || document.querySelector(".usp-section");
      const productAnchor = serviceSection || fallbackSection;
      if (!productAnchor) return;
      try {
        const response = await fetch(siteUrl("/data/products.json"));
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
              const rawImageSrc = product.image || (image.attachedFile ? `/wp-content/uploads/${image.attachedFile}` : `/${image.localUrl || ""}`);
              const imageSrc = siteUrl(rawImageSrc);
              const productHref = siteUrl(`/termek/${product.slug}/`);
              return `
                <a class="da-random-product-card" href="${productHref}">
                  <img src="${imageSrc}" alt="${product.title}">
                  <strong>${product.title}</strong>
                  <span>${formatPrice(product.salePrice || product.price || product.regularPrice)}</span>
                </a>
              `;
            }).join("")}
          </div>
        `;
        productAnchor.insertAdjacentElement("afterend", panel);
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

    const renderServicesPage = () => {
      if (pageType !== "services") return;
      const entry = document.querySelector(".entry-content") || document.querySelector(".site-main");
      if (!entry || document.querySelector(".da-services-hub")) return;
      const services = [
        {
          title: "Implantációs protetika",
          text: "Tervezett implantátumra épülő koronák, hidak, All-on megoldások és egyéni implantátum irányok.",
          href: "/termekkategoria/implantacios-protetika/",
          image: "/wp-content/uploads/Implantacios-protetika.png",
        },
        {
          title: "Esztétikai fogászat",
          text: "Héjkerámiák, koronák, inlay-onlay betétek és mosolyrehabilitációs megoldások egy helyen.",
          href: "/termekkategoria/esztetikai-fogaszat/",
          image: "/wp-content/uploads/Veneers.png",
        },
        {
          title: "Bérnyomtatás és marástechnológia",
          text: "Digitális tervezés, 3D nyomtatás, LMF és marási folyamatok fogászati/fogtechnikai háttérrel.",
          href: "/termekkategoria/bernyomtatas-es-marastechnologia/",
          image: "/wp-content/uploads/3D-polimer-nyomtatas-500x500.png",
        },
        {
          title: "Kombinált munkák",
          text: "Fémlemezes és fémmentes kombinált pótlások komplex esetekhez, laboroldali támogatással.",
          href: "/termekkategoria/kombinalt-munkak/",
          image: "/wp-content/uploads/Femlemezes-potlasok.jpg",
        },
        {
          title: "CAD/CAM termék- és anyagrendszer",
          text: "Cirkónium-dioxid, PMMA, 3D resin és kapcsolódó digitális CAD/CAM anyagok áttekinthetően.",
          href: "/termekkategoria/cadcam/",
          image: "/wp-content/uploads/Cirkonmaras-600x600.png",
        },
        {
          title: "Ajánlatkérés szakmai munkára",
          text: "Ha konkrét esethez, laborfolyamathoz vagy anyagválasztáshoz kérsz irányt, indulj innen.",
          href: "/ajanlatkeres/",
          image: "/wp-content/uploads/Fogtechnikai-munkafolyamat-500x496.png",
        },
      ];
      entry.innerHTML = `
        <section class="da-services-hub da-reveal is-visible">
          <div class="da-services-hub-hero">
            <p class="da-section-kicker">Szolgáltatásaink</p>
            <h2>Válassz szakmai irányt, a részletek már az adott oldalon vezetnek tovább</h2>
            <p>A menü most nem apró almenükbe bontja szét a szakmai területeket: minden szolgáltatási csoport saját oldalra visz, ahol a kapcsolódó termékek, eljárások és ajánlatkérési útvonalak áttekinthetően épülnek fel.</p>
          </div>
          <div class="da-services-link-grid">
            ${services.map((service) => `
              <a class="da-service-link-card" href="${service.href}">
                <img src="${service.image}" alt="${escapeHtml(service.title)}">
                <span>Megnyitás</span>
                <h3>${escapeHtml(service.title)}</h3>
                <p>${escapeHtml(service.text)}</p>
              </a>
            `).join("")}
          </div>
        </section>
      `;
    };
    renderServicesPage();

    const renderCoursesOverview = () => {
      if (path !== "/kurzusok/" && !path.endsWith("/kurzusok/")) return;
      const entry = document.querySelector(".entry-content") || document.querySelector(".site-main");
      if (!entry || document.querySelector(".da-courses-overview")) return;
      const courses = [
        {
          title: "EXOCAD Kezdő",
          status: "Érdeklődöm",
          text: "Belépő szintű digitális tervezési kurzus azoknak, akik stabil alapokat szeretnének az EXOCAD használatához.",
          href: "/kurzusok/exocad-kezdo/",
          image: "/wp-content/uploads/exocad-kezdo-digitalis-fog-v1.png",
          past: true,
        },
        {
          title: "EXOCAD Haladó",
          status: "Érdeklődöm",
          text: "Haladó tervezési szemlélet, összetettebb esetek és gyorsabb digitális munkafolyamatok.",
          href: "/kurzusok/exocad-halado/",
          image: "/wp-content/uploads/exocad-halado-digitalis-fogsor-v1.png",
          past: true,
        },
        {
          title: "Cirkónium mesterfokon",
          status: "Érdeklődöm",
          text: "Anyagismeret, tervezési döntések és gyakorlati fogások cirkónium munkákhoz.",
          href: "/kurzusok/cirkonium-mesterfokon/",
          image: "/wp-content/uploads/Cirkonium-mesterfokon.png",
          past: true,
        },
        {
          title: "A mosoly háttere - szakmai nap",
          status: "Múltbéli esemény",
          text: "Kreditpontos szakmai nap Győrben, előadókkal, ünnepi programmal és közös szakmai találkozással.",
          href: "/a-mosoly-hattere-szakmai-nap-gyorben/",
          image: "/wp-content/uploads/WEBOLDAL-boritokepek-3-1024x423.png",
          past: true,
        },
      ];
      entry.innerHTML = `
        <section class="da-courses-overview da-reveal is-visible">
          <div class="da-courses-hero">
            <p class="da-section-kicker">Kurzusaink</p>
            <h2>Szakmai képzések digitális fogászati és fogtechnikai fókuszban</h2>
            <p>Az aktuális időpontok folyamatosan frissülnek. Ha egy kurzus betelt vagy már lezárult, az érdeklődés gombbal jelezheted, hogy szeretnél értesítést kapni a következő alkalomról.</p>
          </div>
          <div class="da-course-card-grid">
            ${courses.slice(0, 3).map((course) => `
              <article class="da-course-card">
                <img src="${course.image}" alt="${escapeHtml(course.title)}">
                <div>
                  <span>${escapeHtml(course.status)}</span>
                  <h3>${escapeHtml(course.title)}</h3>
                  <p>${escapeHtml(course.text)}</p>
                  <a href="${course.href}">Érdeklődöm</a>
                </div>
              </article>
            `).join("")}
          </div>
          <section class="da-past-courses">
            <p class="da-section-kicker">Archívum</p>
            <h2>Múltbéli kurzusaink:</h2>
            <div class="da-past-course-list">
              ${courses.filter((course) => course.past).map((course) => `
                <a href="${course.href}">
                  <strong>${escapeHtml(course.title)}</strong>
                  <span>${escapeHtml(course.status)}</span>
                </a>
              `).join("")}
            </div>
          </section>
        </section>
      `;
    };
    renderCoursesOverview();

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

    const featuredTeamMembers = [
      {
        name: "Dr. Kónya János",
        initials: "KJ",
        role: "Ügyvezető | Aranykoszorús fogtechnikus mester | Anyagtudományok doktora",
        lead: "A Dent-Art-Technik Kft. alapítója és ügyvezetője, aki több mint három évtizede dolgozik a fogtechnika folyamatos fejlesztésén.",
        paragraphs: [
          "Szakmai pályáját a fogtechnika, a mérnöki szemlélet és az innováció összekapcsolása határozza meg.",
          "Kiemelt szakterülete a digitális fogtechnológia, a 3D fémnyomtatás és a titán fogászati alkalmazása. Doktori kutatásában a 3D nyomtatással gyártott titánötvözet implantátumok felületkezelésével és szövetintegrációjának javításával foglalkozott.",
          "Aktív szerepet vállal a szakmai tudás átadásában és a fogtechnika fejlődésében is. Rendszeresen tart szakmai előadásokat és képzéseket, emellett a MediKlaszter társelnöke és közép-dunántúli regionális igazgatója.",
          "Munkáját több mint 30 év szakmai tapasztalata mellett ma is ugyanaz a szemlélet vezérli: a legújabb technológiák nem önmagukért fontosak, hanem azért, hogy egyre pontosabb, kiszámíthatóbb és magasabb színvonalú megoldások születhessenek."
        ]
      },
      {
        name: "Tóth Csilla",
        initials: "TC",
        role: "Ügyvezető | Gazdasági és külkapcsolati vezető",
        lead: "1997-ben csatlakozott férjéhez, Dr. Kónya Jánoshoz a Dent-Art-Technik Kft. vezetésében, és azóta meghatározó szerepet tölt be a családi vállalkozás fejlődésében.",
        paragraphs: [
          "Ügyvezetőként a gazdasági folyamatok irányításáért, valamint a hazai és nemzetközi üzleti kapcsolatokért felel.",
          "Munkájával közel három évtizede járul hozzá a vállalat stabil működéséhez, növekedéséhez és nemzetközi jelenlétének erősítéséhez.",
          "A Dent-Art-Technik számára a családi értékek és a hosszú távú gondolkodás a kezdetektől meghatározóak, ezt a szemléletet ma már a következő generáció is továbbviszi a vállalkozásban.",
          "Szakmai és vállalkozói tevékenységének elismeréseként 2014-ben Év Vállalkozója díjban részesült."
        ]
      },
      {
        name: "Kónya János Bendegúz",
        initials: "KB",
        role: "Vezetőség | Üzletfejlesztés és ügyvezetői management",
        lead: "A családi vállalkozás következő generációját képviseli a Dent-Art-Technik Kft. vezetésében.",
        paragraphs: [
          "Ausztriában, a PwC tanácsadói környezetében szerzett nemzetközi tapasztalatokat, majd hazatért, hogy szakmai tudásával és új szemléletével is hozzájáruljon a vállalkozás további növekedéséhez.",
          "Munkájában kiemelt szerepet kap az üzletfejlesztés, az innováció és a vállalati működés folyamatos fejlesztése.",
          "Nemzetközi tapasztalatait a Dent-Art-Technik több évtizedes szakmai tudásával ötvözve dolgozik azon, hogy a vállalat a hagyományaira építve, ugyanakkor a jövő lehetőségeire nyitottan fejlődjön tovább.",
          "A Széchenyi István Egyetem Regionális- és Gazdaságtudományi Doktori Iskolájának PhD-hallgatója. Kutatásainak középpontjában a családi vállalkozások generációváltása, az innováció és az első, illetve második generáció együttműködése áll."
        ]
      },
      {
        name: "Bozsányi Lajos",
        initials: "BL",
        role: "Fogtechnikus | CAD és individuális implantátumtervező",
        lead: "2017 óta erősíti a Dent-Art-Technik csapatát, fogászati CAD/CAM rendszerekkel pedig már 2012 óta foglalkozik.",
        paragraphs: [
          "Munkájának középpontjában az egyedi, páciensspecifikus megoldások digitális tervezése áll.",
          "A hagyományos fogpótlások mellett egyéni implantátumok, individuális csontpótlások és koponyarekonstrukciók tervezésében is részt vesz.",
          "Szakértelmében a fogtechnikai tapasztalat, a digitális technológia és a mérnöki szemlélet találkozik.",
          "A mindennapi tervezőmunka mellett kutatás-fejlesztési és innovációs projektekben is közreműködik, szakmai munkája tudományos publikációkhoz és páciensspecifikus implantátumok fejlesztéséhez is kapcsolódik."
        ]
      },
      {
        name: "Salamon Zsolt",
        initials: "SZ",
        role: "Fogtechnikus | CAD designer | EXOCAD oktató",
        lead: "Szakmai pályafutása szorosan összefonódik a Dent-Art-Technik-kel: tanulóéveit is nálunk kezdte, és 2010 óta csapatunk tagja.",
        paragraphs: [
          "Az elmúlt több mint másfél évtized alatt tanulóból tapasztalt szakemberré és a csapat meghatározó tagjává vált.",
          "Fogtechnikusként és CAD designerként széles körű tapasztalattal rendelkezik a digitális fogászati tervezésben, kiemelten az implantátumos és kombinált munkák területén.",
          "Szakmai tudását aktívan továbbadja: a Dent-Art-Technik EXOCAD alap- és haladó szintű képzéseinek oktatója, emellett szakmai rendezvényeken is rendszeresen osztja meg gyakorlati tapasztalatait.",
          "Története jól példázza azt a szemléletet, hogy a Dent-Art-Technik-nél a szakmai utánpótlás hosszú távú közös fejlődést is jelent."
        ]
      },
      {
        name: "Takács Fanni",
        initials: "TF",
        role: "Ügyvezetői koordinátor | Pályázati projektek",
        lead: "Az ügyvezetés napi munkájának egyik meghatározó támogatója, aki számos szervezési és koordinációs feladat összefogásáért felel.",
        paragraphs: [
          "Munkájával biztos hátteret teremt a vezetői feladatok és a vállalat mindennapi működése mögött.",
          "Kiemelt területe a pályázati lehetőségek felkutatása, a pályázatok előkészítése és a kapcsolódó folyamatok koordinálása.",
          "Munkájának köszönhetően a Dent-Art-Technik az elmúlt években számos sikeres pályázati projektet valósíthatott meg, amelyek a vállalat fejlesztéseit és további növekedését is támogatták.",
          "Precíz szervezőmunkájával összekötő szerepet tölt be az ügyvezetés, a különböző projektek és a vállalat működési folyamatai között."
        ]
      },
      {
        name: "Brányi-Virág Karolina",
        initials: "BK",
        role: "Üzletfejlesztési és marketingmenedzser",
        lead: "Többéves kereskedelmi és vezetői tapasztalattal, valamint erős marketing- és üzletfejlesztési háttérrel csatlakozott a Dent-Art-Technik csapatához.",
        paragraphs: [
          "Korábban a fogtechnikai kereskedelem területén dolgozott, ahol operatív vezetőként az értékesítési és vállalati folyamatokra is széles körű rálátást szerzett.",
          "A Dent-Art-Technik-nél a marketing és az üzletfejlesztés mellett a szakmai rendezvények és események szervezéséért is felel.",
          "Munkájának fontos része az új üzleti és marketinglehetőségek felismerése, valamint olyan ötletek és megoldások kidolgozása, amelyek támogatják az ügyfélszerzést, a partnerkapcsolatok erősítését és a vállalat további növekedését.",
          "Szemléletében a marketing szorosan összefonódik az értékesítéssel és az üzleti célokkal."
        ]
      }
    ];

    const teamMemberCard = (member, index, detailed = false) => `
      <article class="da-featured-person${detailed ? " da-featured-person-detail" : ""}" style="--da-card-index:${index};">
        <div class="da-person-avatar" aria-hidden="true">${escapeHtml(member.initials)}</div>
        <div class="da-person-copy">
          <span>${escapeHtml(member.role)}</span>
          <h3>${escapeHtml(member.name)}</h3>
          <p class="da-person-lead">${escapeHtml(member.lead)}</p>
          ${detailed ? member.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("") : ""}
        </div>
      </article>
    `;

    const renderAboutTeam = () => {
      if (!path.includes("/rolunk/")) return;
      const entry = document.querySelector(".entry-content") || document.querySelector(".site-main");
      const title = document.querySelector(".entry-title");
      if (path.includes("/rolunk/csapat/")) {
        if (title) title.textContent = "Kiemelt munkatársaink";
        if (entry && !document.querySelector(".da-team-profile-page")) {
          entry.innerHTML = `
            <section class="da-team-profile-page da-reveal is-visible">
              <div class="da-team-profile-hero">
                <p class="da-section-kicker">Rólunk / Csapat</p>
                <h2>Kiemelt munkatársaink</h2>
                <p>A több évtizedes tapasztalat mögött vezetői, fogtechnikai, üzletfejlesztési és szervezési szerepek találkoznak.</p>
              </div>
              <div class="da-featured-team-list">
                ${featuredTeamMembers.map((member, index) => teamMemberCard(member, index, true)).join("")}
              </div>
            </section>
          `;
        }
        return;
      }
      if (!entry || document.querySelector(".da-about-experience")) return;
      const image = entry.querySelector('img[src*="2025"]');
      const imageSrc = image?.getAttribute("srcset")?.split(",").pop()?.trim().split(/\s+/)[0]
        || image?.getAttribute("src")
        || "/wp-content/uploads/2025.png";
      image?.closest("p, figure")?.remove();
      entry.innerHTML = `
        <section class="da-about-experience da-reveal is-visible">
          <div class="da-about-visual">
            <img src="${imageSrc}" alt="Dent-Art-Technik csapat">
            <div>
              <p class="da-section-kicker">Dent-Art-Technik</p>
              <h2>33 év szakmai háttér, digitális lendület és laborprecizitás</h2>
              <p>Nem csak fogtechnikai termékeket gyártunk: olyan szakmai hátteret építünk, amelyben a hagyományos mesterség, a CAD/CAM gondolkodás, a 3D technológia és a partneri kommunikáció egy rendszerként működik.</p>
            </div>
          </div>
          <div class="da-about-story">
            <article>
              <span>1992</span>
              <h3>Mesterlaborból komplex szakmai partner</h3>
              <p>Kónya János fogtechnikus mester alapításával a cél kezdettől egyértelmű volt: magas színvonalú, teljes körű laborháttér, amely biztonságot ad a rendelőknek és kiszámítható minőséget a pácienseknek.</p>
            </article>
            <article>
              <span>Technológia</span>
              <h3>Modern géppark, egymásra épülő folyamatok</h3>
              <p>A kivehető protézisektől az implantátumgyártásig, a préskerámiától a digitális tervezésig minden terület mögött kontrollált folyamat és fejleszthető szakmai rendszer áll.</p>
            </article>
            <article>
              <span>Minőség</span>
              <h3>Tanúsított működés, szakmai elismerések</h3>
              <p>ISO rendszerek, CE minősített eljárások, Magyar Termék Nagydíjak és szakmai díjak jelzik azt az irányt, amelyet a csapat nap mint nap képvisel.</p>
            </article>
          </div>
          <div class="da-about-team-link">
            <div>
              <p class="da-section-kicker">Csapat</p>
              <h2>Kiemelt munkatársaink</h2>
              <p>A vezetői, fogtechnikai, üzletfejlesztési és szervezési szerepek ugyanazon az oldalon, áttekinthető formában jelennek meg.</p>
            </div>
          </div>
          <div class="da-featured-team-list da-featured-team-inline">
            ${featuredTeamMembers.map((member, index) => teamMemberCard(member, index, false)).join("")}
          </div>
        </section>
      `;
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
        syncFloatingUi();
      };

      const openBanner = () => {
        setAlpineOpen(true);
        banner.classList.add("da-banner-open");
        banner.classList.remove("da-banner-compact");
        bannerPanel.style.display = "";
        bannerButton.style.display = "none";
        sessionStorage.removeItem("floatingBannerClosed");
        sessionStorage.removeItem("floatingBannerCompact");
        syncFloatingUi();
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
      window.addEventListener("load", syncFloatingUi, { once: true });
    }
    normalizeSiteUrls();
  });
})();
