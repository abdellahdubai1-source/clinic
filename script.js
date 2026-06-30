/* =========================================================
   EliteCare Medical Center — script.js
   Vanilla JS: nav, scroll reveals, counters, FAQ, form, UI
   ========================================================= */
(function () {
  "use strict";

  // Mark that JS is active so the CSS hidden-state for .reveal applies.
  // (If this script never runs, .reveal elements remain visible by default.)
  document.documentElement.classList.add("js");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky navbar shadow on scroll ---------- */
  const navbar = document.getElementById("navbar");
  const onScrollNav = () => {
    if (window.scrollY > 20) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  };
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  /* ---------- Mobile hamburger menu ---------- */
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  const closeMenu = () => {
    navLinks.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Open menu");
  };
  const toggleMenu = () => {
    const open = navLinks.classList.toggle("open");
    hamburger.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", String(open));
    hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  hamburger.addEventListener("click", toggleMenu);
  // Close menu when a link is tapped
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", closeMenu)
  );
  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("open")) closeMenu();
  });

  /* ---------- Active nav link on scroll ---------- */
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const navAnchors = Array.from(navLinks.querySelectorAll('a[href^="#"]:not(.btn)'));
  const setActive = () => {
    const pos = window.scrollY + 120;
    let current = sections[0] ? sections[0].id : "";
    for (const sec of sections) {
      if (sec.offsetTop <= pos) current = sec.id;
    }
    navAnchors.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === "#" + current)
    );
  };
  setActive();
  window.addEventListener("scroll", setActive, { passive: true });

  /* ---------- Scroll reveal (Intersection Observer) ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const showReveal = (el) => el.classList.add("in");

  // Reveal anything already within (or near) the viewport. This fixes elements
  // that the observer's threshold/rootMargin can skip on tall desktop layouts,
  // so no text or image stays hidden if the user never scrolls past it.
  const revealInView = () => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    revealEls.forEach((el) => {
      if (el.classList.contains("in")) return;
      const r = el.getBoundingClientRect();
      if (r.top < vh + 120 && r.bottom > -120) showReveal(el);
    });
  };

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(showReveal);
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // light stagger for grouped items
            const delay = Math.min(i * 70, 280);
            setTimeout(() => showReveal(entry.target), delay);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));

    // Immediately reveal whatever is already on screen (above-the-fold + dead zones).
    revealInView();
    // Re-check after full load and on resize (font/layout shifts, desktop widths).
    window.addEventListener("load", revealInView);
    window.addEventListener("resize", revealInView, { passive: true });

    // Safety net: if the observer ever stalls, make sure nothing stays hidden.
    window.addEventListener("load", () => {
      setTimeout(() => revealEls.forEach(showReveal), 2500);
    });
  }

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll(".stat-num[data-count]");
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    if (prefersReduced) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window && counters.length) {
    const countObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => countObserver.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = c.dataset.count + (c.dataset.suffix || "")));
  }

  /* ---------- FAQ accordion ---------- */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const btn = item.querySelector(".faq-q");
    const panel = item.querySelector(".faq-a");
    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      // Close all (single-open accordion)
      faqItems.forEach((other) => {
        other.classList.remove("open");
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        other.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });
  // Recalculate open panel height on resize
  window.addEventListener("resize", () => {
    const open = document.querySelector(".faq-item.open .faq-a");
    if (open) open.style.maxHeight = open.scrollHeight + "px";
  });

  /* ---------- Back to top ---------- */
  const toTop = document.getElementById("toTop");
  const onScrollTop = () => {
    if (window.scrollY > 600) toTop.classList.add("show");
    else toTop.classList.remove("show");
  };
  onScrollTop();
  window.addEventListener("scroll", onScrollTop, { passive: true });
  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });

  /* ---------- Appointment form ---------- */
  const form = document.getElementById("apptForm");
  const status = document.getElementById("formStatus");

  if (form) {
    // Prevent past dates
    const dateInput = form.querySelector("#date");
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      dateInput.min = today;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      status.className = "form-status";

      // Basic validation
      const required = form.querySelectorAll("[required]");
      let valid = true;
      let firstInvalid = null;
      required.forEach((field) => {
        const ok = field.value.trim() !== "";
        field.style.borderColor = ok ? "" : "#d94c4c";
        if (!ok && !firstInvalid) firstInvalid = field;
        if (!ok) valid = false;
      });

      const email = form.querySelector("#email");
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      if (email.value.trim() && !emailOk) {
        email.style.borderColor = "#d94c4c";
        valid = false;
        if (!firstInvalid) firstInvalid = email;
      }

      if (!valid) {
        status.textContent = "Please complete the highlighted fields.";
        status.classList.add("error");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Simulated success (no backend)
      const name = form.querySelector("#fullName").value.trim().split(" ")[0];
      status.textContent = `Thank you${name ? ", " + name : ""} — your request has been received. Our team will confirm your appointment shortly.`;
      status.classList.add("success");
      form.reset();
      if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];
    });

    // Clear error styling as the user types
    form.querySelectorAll("input, select, textarea").forEach((field) => {
      field.addEventListener("input", () => (field.style.borderColor = ""));
    });
  }

  /* ---------- Smooth scroll for in-page anchors (with offset) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const id = this.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 74;
      window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
    });
  });

  /* ---------- Page-load flag ---------- */
  window.addEventListener("load", () => {
    document.body.classList.add("loaded");
  });
})();
