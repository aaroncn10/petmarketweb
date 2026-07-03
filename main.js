(function () {
  "use strict";

  const data = window.__BRAND__ || {};
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  const $ = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
  const escHTML = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  const ICONS = {
    perros: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 10a2 2 0 100-4 2 2 0 000 4zm5-3a2 2 0 100-4 2 2 0 000 4zm5 0a2 2 0 100-4 2 2 0 000 4zm4.5 3a2 2 0 100-4 2 2 0 000 4zM12 12c-3 0-6.5 2.3-6.5 5.4 0 1.6 1.3 2.6 2.9 2.2.9-.2 1.9-.6 3.6-.6s2.7.4 3.6.6c1.6.4 2.9-.6 2.9-2.2C18.5 14.3 15 12 12 12z"/></svg>',
    gatos: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l1.6 3 2.7-2.2-.6 3.4A6 6 0 0118 12c0 4-2.7 8-6 8s-6-4-6-8a6 6 0 012.3-4.8l-.6-3.4L10.4 6z"/></svg>'
  };

  function brandLabel(id) {
    const b = (data.brands || []).find(x => x.id === id);
    return b ? b.name : id;
  }
  function categoryLabel(id) {
    const c = (data.categories || []).find(x => x.id === id);
    return c ? c.name : id;
  }

  // -------- WhatsApp / Instagram links --------
  function initSocialLinks() {
    const msg = encodeURIComponent("Hola PetMarket, quisiera más información sobre su catálogo 🐾");
    const waHref = "https://wa.me/" + (data.whatsapp || "") + "?text=" + msg;
    $$("[data-whatsapp-link]").forEach(a => a.href = waHref);
    $$("[data-instagram-link]").forEach(a => a.href = data.instagram || "#");
  }

  // -------- Mounts (idempotent) --------
  function mountFeatures() {
    const target = $("[data-features]");
    if (!target || target.children.length > 0 || !data.features) return;
    const icons = [
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.6 6.6L21 11l-6.4 2.4L12 20l-2.6-6.6L3 11l6.4-2.4z"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 01-9.5 8.3A8.4 8.4 0 013 11.5 8.5 8.5 0 0111.5 3c.9 3 3 5 6.5 5.5a8.4 8.4 0 013 3z"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>'
    ];
    target.innerHTML = data.features.map((f, i) => `
      <article class="glass-card reveal" data-tilt>
        <div class="feature-icon">${icons[i % icons.length]}</div>
        <h3>${escHTML(f.title)}</h3>
        <p>${escHTML(f.text)}</p>
      </article>
    `).join("");
  }

  function renderCatalog(filter) {
    const target = $("[data-catalog]");
    if (!target || !data.catalog) return;
    const items = filter === "all" ? data.catalog : data.catalog.filter(p => p.category === filter);
    target.innerHTML = items.map(p => `
      <article class="product-card reveal is-visible" data-tilt>
        <div class="product-top">
          <div class="product-icon cat-${escHTML(p.category)}">${ICONS[p.category] || ""}</div>
          ${p.badge ? `<span class="product-badge">${escHTML(p.badge)}</span>` : ""}
        </div>
        <div>
          <span class="product-brand">${escHTML(brandLabel(p.brand))}</span>
          <h3>${escHTML(p.name)}</h3>
        </div>
        <p class="note">${escHTML(p.note)}</p>
        <div class="product-meta">
          <span class="product-sizes">${escHTML(p.sizes)}</span>
        </div>
        <a class="btn btn-primary btn-sm" data-whatsapp-product="${escHTML(p.name)}" target="_blank" rel="noopener">Pedir por WhatsApp</a>
      </article>
    `).join("");
    initSocialLinks();
    $$("[data-whatsapp-product]").forEach(a => {
      const productName = a.getAttribute("data-whatsapp-product");
      const msg = encodeURIComponent(`Hola PetMarket, quisiera pedir: ${productName}`);
      a.href = "https://wa.me/" + (data.whatsapp || "") + "?text=" + msg;
    });
    safe(initTilt, "initTilt");
    safe(initReveals, "initReveals");
  }

  function mountCatalog() {
    const target = $("[data-catalog]");
    if (!target || target.dataset.mounted === "1") return;
    target.dataset.mounted = "1";
    renderCatalog("all");
  }

  function initFilters() {
    const wrap = $("[data-filters]");
    if (!wrap) return;
    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      $$(".filter-btn", wrap).forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderCatalog(btn.dataset.filter);
    });
  }

  // -------- Nav --------
  function initNav() {
    const nav = $("[data-nav]");
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 24) nav.classList.add("is-solid");
      else nav.classList.remove("is-solid");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const menu = $("[data-mobile-menu]");
    const openBtn = $("[data-menu-open]");
    const closeBtn = $("[data-menu-close]");
    function open() { menu.classList.add("is-open"); openBtn.setAttribute("aria-expanded", "true"); }
    function close() { menu.classList.remove("is-open"); openBtn.setAttribute("aria-expanded", "false"); }
    if (openBtn) openBtn.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    $$("[data-menu-link]", menu).forEach(a => a.addEventListener("click", close));
  }

  // -------- Smooth anchor scroll (native) --------
  function initAnchorScroll() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top, behavior: "smooth" });
    });
  }

  // -------- Reveal on scroll --------
  function initReveals() {
    const items = $$(".reveal:not(.is-visible)");
    if (!items.length) return;
    if (typeof IntersectionObserver === "undefined") {
      items.forEach(el => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    items.forEach(el => io.observe(el));
    // 6s safety net
    setTimeout(() => items.forEach(el => el.classList.add("is-visible")), 6000);
  }

  // -------- Tilt on glass / product cards --------
  function initTilt() {
    if (!fineHover) return;
    $$("[data-tilt]:not([data-tilt-bound])").forEach(card => {
      card.dataset.tiltBound = "1";
      card.addEventListener("mouseover", (e) => {
        if (!card.contains(e.relatedTarget)) card.style.transition = "transform .1s linear";
      });
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`;
      });
      card.addEventListener("mouseout", (e) => {
        if (card.contains(e.relatedTarget)) return;
        card.style.transition = "transform .5s cubic-bezier(0.16,1,0.3,1)";
        card.style.transform = "";
      });
    });
  }

  // -------- Footer year --------
  function initYear() {
    const el = $("[data-year]");
    if (el) el.textContent = new Date().getFullYear();
  }

  function boot() {
    safe(initSocialLinks, "initSocialLinks");
    safe(mountFeatures, "mountFeatures");
    safe(mountCatalog, "mountCatalog");
    safe(initFilters, "initFilters");
    safe(initNav, "initNav");
    safe(initAnchorScroll, "initAnchorScroll");
    safe(initReveals, "initReveals");
    safe(initTilt, "initTilt");
    safe(initYear, "initYear");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
