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
        "Szolgáltatási fókusz",
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
      cta.innerHTML = "<span>+</span> Ajánlatkérés";
      document.body.appendChild(cta);
    }

    const serviceCards = Array.from(
      document.querySelectorAll(".elementor-widget-image-box")
    ).filter((card) => {
      const href = card.querySelector("a")?.getAttribute("href") || "";
      const text = card.textContent || "";
      return /fogaszat|implantacios-protetika|esztetikai-fogaszat|bernyomtatas/i.test(href + " " + text);
    });
    serviceCards.forEach((card) => card.classList.add("da-discipline-service"));

    if (
      document.body.classList.contains("home") &&
      !document.querySelector(".da-discipline-switcher")
    ) {
      const anchor =
        document.querySelector(".elementor-element-abbfed0") ||
        document.querySelector(".dentart-slider") ||
        document.querySelector(".entry-content");

      if (anchor) {
        const switcher = document.createElement("section");
        switcher.className = "da-discipline-switcher da-reveal";
        switcher.innerHTML = `
          <div class="da-discipline-copy">
            <p class="da-discipline-kicker">Két fókusz, egy precíz háttér</p>
            <h2>Fogászat és fogtechnika új ritmusban</h2>
            <p>Gyorsabb tájékozódás, erősebb vizuális belépő és tisztább út a szolgáltatások felé.</p>
          </div>
          <div class="da-discipline-grid">
            <a class="da-discipline-card" href="/fogaszat/">
              <img src="/wp-content/uploads/Esztetikai-fogaszat.png" alt="Fogászat">
              <span class="da-discipline-content">
                <span class="da-discipline-label">Pácienseknek</span>
                <h3>Fogászat</h3>
                <p>Esztétikai és implantációs megoldások egy átlátható belépőből.</p>
                <span class="da-discipline-cta">Megnézem</span>
              </span>
            </a>
            <a class="da-discipline-card" href="/fogtechnika/">
              <img src="/wp-content/uploads/Implantacios-protetika.png" alt="Fogtechnika">
              <span class="da-discipline-content">
                <span class="da-discipline-label">Partnereknek</span>
                <h3>Fogtechnika</h3>
                <p>Digitális tervezés, protetika és gyártási háttér dinamikusabb struktúrában.</p>
                <span class="da-discipline-cta">Belépek</span>
              </span>
            </a>
          </div>
        `;

        anchor.insertAdjacentElement("beforebegin", switcher);
        requestAnimationFrame(() => switcher.classList.add("is-visible"));
      }
    }

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
          <article class="da-workflow-step"><b>1</b><h3>Kapcsolat</h3><p>Megérkezik az igény, a csapat beazonosítja a feladat típusát.</p></article>
          <article class="da-workflow-step"><b>2</b><h3>Adatok</h3><p>A szükséges fájlok, kérdések és határidők egy helyre kerülnek.</p></article>
          <article class="da-workflow-step"><b>3</b><h3>Tervezés</h3><p>A szakmai háttér kiválasztja a megfelelő technológiát és munkamenetet.</p></article>
          <article class="da-workflow-step"><b>4</b><h3>Ajánlat</h3><p>Átlátható válasz érkezik, követhető következő lépéssel.</p></article>
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
        setAlpineOpen(false);
        banner.classList.remove("da-banner-open");
        bannerPanel.style.display = "none";
        bannerButton.style.display = "inline-flex";
        sessionStorage.setItem("floatingBannerClosed", "true");
      };

      const openBanner = () => {
        setAlpineOpen(true);
        banner.classList.add("da-banner-open");
        bannerPanel.style.display = "";
        bannerButton.style.display = "none";
        sessionStorage.removeItem("floatingBannerClosed");
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

      if (sessionStorage.getItem("floatingBannerClosed") === "true") {
        closeBanner();
      } else {
        openBanner();
      }
    }
  });
})();
