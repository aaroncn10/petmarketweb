(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var revealObserver;

  function setUpMenu() {
    var toggle = document.getElementById("menu-toggle");
    var menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) return;

    function setMenu(open) {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    }

    toggle.addEventListener("click", function () {
      setMenu(!menu.classList.contains("is-open"));
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });
  }

  function setUpNavigation() {
    var nav = document.querySelector(".nav");
    if (!nav) return;
    var ticking = false;

    function updateNav() {
      nav.classList.toggle("is-scrolled", window.scrollY > 18);
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(updateNav);
        ticking = true;
      }
    }, { passive: true });
    updateNav();
  }

  function setUpReveals() {
    var groups = [
      ".section > .container > .eyebrow",
      ".section > .container > h2",
      ".feature",
      ".category",
      ".product",
      ".location-card"
    ];
    var items = Array.from(document.querySelectorAll(groups.join(",")));

    items.forEach(function (item, index) {
      item.classList.add("reveal");
      item.style.setProperty("--reveal-delay", String((index % 4) * 70) + "ms");
    });

    if (reducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (item) { item.classList.add("is-revealed"); });
      return;
    }

    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });

    items.forEach(function (item) { revealObserver.observe(item); });
  }

  function setUpFilters() {
    var buttons = Array.from(document.querySelectorAll(".cat-btn"));
    var cards = Array.from(document.querySelectorAll(".cat-card"));
    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var filter = button.getAttribute("data-filter");
        buttons.forEach(function (item) {
          var active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });

        cards.forEach(function (card, index) {
          var visible = filter === "all" || card.getAttribute("data-category") === filter;
          card.style.setProperty("--card-delay", String((index % 3) * 55) + "ms");

          if (visible) {
            card.classList.remove("is-filtering-out");
            card.classList.add("is-visible", "is-filtering-in");
            card.setAttribute("aria-hidden", "false");
            window.requestAnimationFrame(function () {
              window.requestAnimationFrame(function () { card.classList.remove("is-filtering-in"); });
            });
          } else if (card.classList.contains("is-visible")) {
            if (reducedMotion) {
              card.classList.remove("is-visible");
              card.setAttribute("aria-hidden", "true");
            } else {
              card.classList.add("is-filtering-out");
              window.setTimeout(function () {
                card.classList.remove("is-visible", "is-filtering-out");
                card.setAttribute("aria-hidden", "true");
              }, 220);
            }
          }
        });
      });
    });

    buttons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
    });
  }

  function setUpHeroMotion() {
    document.documentElement.classList.add("motion-ready");
    window.requestAnimationFrame(function () {
      document.body.classList.add("page-entered");
    });

    if (reducedMotion || !finePointer) return;
    var media = document.querySelector(".hero__media");
    if (!media) return;
    var ticking = false;

    function updateParallax() {
      var rect = media.getBoundingClientRect();
      var viewportCenter = window.innerHeight / 2;
      var mediaCenter = rect.top + rect.height / 2;
      var shift = Math.max(-12, Math.min(12, (viewportCenter - mediaCenter) * 0.035));
      media.style.setProperty("--hero-shift", shift.toFixed(2) + "px");
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }

  function setUpWhatsAppAttention() {
    if (reducedMotion) return;
    var button = document.querySelector(".wa-float");
    if (!button) return;

    function pulse() {
      if (document.hidden) return;
      button.classList.remove("is-pulsing");
      void button.offsetWidth;
      button.classList.add("is-pulsing");
    }

    window.setTimeout(pulse, 4500);
    window.setInterval(pulse, 12000);
  }

  function init() {
    setUpMenu();
    setUpNavigation();
    setUpReveals();
    setUpFilters();
    setUpHeroMotion();
    setUpWhatsAppAttention();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
