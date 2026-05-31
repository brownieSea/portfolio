/* ============================================================
   scroll.js — vanilla scroll choreography (manual, IO-free)
   Robust across background iframes / headless captures.
   ============================================================ */
(function () {
  "use strict";

  const docEl = document.documentElement;
  const backdrop = document.querySelector(".backdrop");
  const progress = document.getElementById("progress");
  const sections = Array.from(document.querySelectorAll(".sec"));
  const reveals = Array.from(document.querySelectorAll(".reveal, .tl-item"));
  const counters = Array.from(document.querySelectorAll("[data-count]"));
  const fills = Array.from(document.querySelectorAll(".skill .fill"));
  const tl = document.querySelector(".tl");
  const tlLine = document.getElementById("tlLine");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function inView(el, top, bottom) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    return r.top < vh * (top == null ? 0.88 : top) && r.bottom > vh * (bottom == null ? 0.04 : bottom);
  }

  /* ---------- count-up ---------- */
  function animateCount(el) {
    const target = parseFloat(el.getAttribute("data-count"));
    const suffix = el.getAttribute("data-suffix") || "";
    const isYear = target >= 1900;
    const dur = isYear ? 1500 : 1100;
    const start = performance.now();
    (function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.textContent = (isYear ? val : val.toLocaleString()) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  let tlDone = false;
  function drawTimeline() {
    if (tlDone || !tl || !tlLine) return;
    tlDone = true;
    tlLine.style.height = (tl.offsetHeight - 12) + "px";
  }

  /* ---------- backdrop + theme ---------- */
  let activeId = null;
  function updateActive() {
    const centerY = window.innerHeight * 0.5;
    let active = sections[0];
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top <= centerY && r.bottom >= centerY) { active = s; break; }
    }
    if (active && active.id !== activeId) {
      activeId = active.id;
      const bg = getComputedStyle(active).getPropertyValue("--sec-bg").trim();
      if (bg) backdrop.style.background = bg;
      docEl.setAttribute("data-theme", active.classList.contains("on-dark") ? "dark" : "light");
    } else if (active) {
      // keep backdrop in sync if mood/accent changed
      const bg = getComputedStyle(active).getPropertyValue("--sec-bg").trim();
      if (bg) backdrop.style.background = bg;
    }
  }

  /* ---------- main check ---------- */
  function check() {
    for (let i = reveals.length - 1; i >= 0; i--) {
      const el = reveals[i];
      if (inView(el)) { el.classList.add("in"); reveals.splice(i, 1); }
    }
    for (let i = counters.length - 1; i >= 0; i--) {
      const el = counters[i];
      if (inView(el, 0.82, 0.1)) { animateCount(el); counters.splice(i, 1); }
    }
    for (let i = fills.length - 1; i >= 0; i--) {
      const el = fills[i];
      if (inView(el, 0.85, 0.05)) { el.style.width = (el.getAttribute("data-w") || 90) + "%"; fills.splice(i, 1); }
    }
    if (tl && inView(tl, 0.7, 0)) drawTimeline();
  }

  /* ---------- scroll loop ---------- */
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      check();
      updateActive();
      const max = docEl.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
      // hero parallax
      if (heroPhoto && !reduce) {
        const y = Math.min(window.scrollY, window.innerHeight);
        heroPhoto.style.transform = "translateY(" + y * 0.06 + "px)";
      }
      ticking = false;
    });
  }
  const heroPhoto = document.querySelector(".hero-photo");

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { activeId = null; check(); updateActive(); }, { passive: true });

  // initial + a couple of settle passes (fonts/layout)
  check(); updateActive();
  [120, 400, 900].forEach((t) => setTimeout(() => { check(); updateActive(); }, t));
  window.addEventListener("load", () => { check(); updateActive(); });

  // expose for Tweaks panel to nudge backdrop after mood change
  window.__refreshScene = function () { activeId = null; updateActive(); };
})();
