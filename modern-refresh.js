(function () {
  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  };

  ready(() => {
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
