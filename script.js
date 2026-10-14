document.addEventListener("DOMContentLoaded", () => {
  // Loader
  const loader = document.getElementById("pageLoader");
  window.addEventListener("load", () => {
    setTimeout(() => loader?.classList.add("hidden"), 400);
  });

  // Menu mobile
  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");

  menuBtn?.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    menuBtn.innerHTML = isOpen
      ? '<i class="fas fa-xmark"></i>'
      : '<i class="fas fa-bars"></i>';
  });

  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });

  // Année footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Header scroll
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    header?.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Back to top
  const backBtn = document.getElementById("backToTop");
  window.addEventListener(
    "scroll",
    () => {
      backBtn?.classList.toggle("visible", window.scrollY > 400);
    },
    { passive: true }
  );
  backBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Reveal on scroll
  const reveals = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  reveals.forEach((el) => revealObserver.observe(el));

  // Barres de langues
  const bars = document.querySelectorAll(".bar");
  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animated");
          barObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  bars.forEach((bar) => barObserver.observe(bar));

  // Lien actif dans la nav
  const sections = document.querySelectorAll("section[id]");
  const navAs = document.querySelectorAll(".nav-links a");

  const highlightNav = () => {
    const scrollY = window.scrollY + 120;
    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute("id");
      if (scrollY >= top && scrollY < top + height) {
        navAs.forEach((a) => {
          a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
        });
      }
    });
  };
  window.addEventListener("scroll", highlightNav, { passive: true });
});