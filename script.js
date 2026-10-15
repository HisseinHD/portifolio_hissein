"use strict";

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     PORTFOLIO — SCRIPT.JS
     ========================================================= */

  // ---------------------------------------------------------
  // Utilitaires et constantes
  // ---------------------------------------------------------
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  const DESKTOP_BREAKPOINT = 900; // doit correspondre au breakpoint du menu dans styles.css
  const HEADER_SCROLLED_AT = 40;
  const BACK_TO_TOP_AT = 400;
  const SCROLL_GAP = 15;

  const hasObserver = "IntersectionObserver" in window;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollBehavior = reducedMotion ? "auto" : "smooth";

  // ---------------------------------------------------------
  // Icônes décoratives : masquées pour les lecteurs d'écran
  // ---------------------------------------------------------
  $$("i.fas, i.fab, i.far").forEach((icon) => icon.setAttribute("aria-hidden", "true"));

  // ---------------------------------------------------------
  // Année automatique
  // ---------------------------------------------------------
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------------------------------------------------------
  // Loader : masqué une fois la page chargée
  // ---------------------------------------------------------
  const loader = $("#pageLoader");

  const hideLoader = () => {
    if (!loader || !loader.isConnected) return;
    loader.classList.add("hidden", "loaded");
    loader.style.opacity = "0";
    loader.style.pointerEvents = "none";
    setTimeout(() => loader.remove(), 500);
  };

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });
    setTimeout(hideLoader, 4000); // sécurité si une ressource externe est lente
  }

  // ---------------------------------------------------------
  // Menu mobile
  // ---------------------------------------------------------
  const menuBtn = $("#menuBtn");
  const navLinks = $("#navLinks");

  const setMenu = (open) => {
    if (!menuBtn || !navLinks) return;
    navLinks.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    menuBtn.innerHTML = `<i class="fas ${open ? "fa-xmark" : "fa-bars"}" aria-hidden="true"></i>`;
  };

  const isMenuOpen = () => Boolean(navLinks?.classList.contains("open"));

  menuBtn?.addEventListener("click", () => setMenu(!isMenuOpen()));

  // Fermer après un clic sur un lien du menu
  $$("a", navLinks).forEach((link) => link.addEventListener("click", () => setMenu(false)));

  // Fermer en cliquant à l'extérieur
  document.addEventListener("click", (event) => {
    if (isMenuOpen() && !navLinks.contains(event.target) && !menuBtn.contains(event.target)) {
      setMenu(false);
    }
  });

  // Fermer avec Échap (et rendre le focus au bouton)
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isMenuOpen()) {
      setMenu(false);
      menuBtn?.focus();
    }
  });

  // Fermer sur grand écran
  window.addEventListener("resize", () => {
    if (window.innerWidth > DESKTOP_BREAKPOINT && isMenuOpen()) setMenu(false);
  });

  // ---------------------------------------------------------
  // Défilement fluide pour tous les liens d'ancre (#section)
  // ---------------------------------------------------------
  const header = $(".site-header");

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href.length < 2) return;

      let target;
      try {
        target = document.getElementById(decodeURIComponent(href.slice(1)));
      } catch {
        return;
      }
      if (!target) return;

      event.preventDefault();

      const headerHeight = header?.offsetHeight ?? 0;
      const top =
        target.id === "accueil" || target.id === "main"
          ? 0
          : target.getBoundingClientRect().top + window.scrollY - headerHeight - SCROLL_GAP;

      window.scrollTo({ top: Math.max(0, top), behavior: scrollBehavior });

      // Accessibilité : déplacer le focus clavier vers la section ciblée
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });

      history.replaceState?.(null, "", href);
    });
  });

  // ---------------------------------------------------------
  // Header et bouton « retour en haut » (scroll optimisé)
  // ---------------------------------------------------------
  const backBtn = $("#backToTop");

  const updateOnScroll = () => {
    header?.classList.toggle("scrolled", window.scrollY > HEADER_SCROLLED_AT);
    backBtn?.classList.toggle("visible", window.scrollY > BACK_TO_TOP_AT);
  };

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateOnScroll();
        ticking = false;
      });
    },
    { passive: true }
  );

  backBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: scrollBehavior });
  });

  updateOnScroll();

  // ---------------------------------------------------------
  // Lien actif dans le menu selon la section visible
  // ---------------------------------------------------------
  const navAnchors = $$("a", navLinks);

  if (hasObserver && navAnchors.length) {
    const setActiveLink = (id) => {
      navAnchors.forEach((link) => {
        const active = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("active", active);
        if (active) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveLink(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    $$("main section[id]").forEach((section) => sectionObserver.observe(section));
  }

  // ---------------------------------------------------------
  // Animations d'apparition (.reveal, .fade-in, .fade-in-up)
  // « visible » et « appear » sont ajoutées pour rester compatible
  // avec les différentes règles possibles de styles.css
  // ---------------------------------------------------------
  const revealElements = $$(".reveal, .fade-in, .fade-in-up");

  const showElement = (element) => element.classList.add("visible", "appear");

  if (hasObserver && !reducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          showElement(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach(showElement);
  }

  // ---------------------------------------------------------
  // Barres de langues / compétences
  // ---------------------------------------------------------
  const bars = $$(".bar");

  if (hasObserver && !reducedMotion && bars.length) {
    const barObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("animated");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    bars.forEach((bar) => barObserver.observe(bar));
  } else {
    bars.forEach((bar) => bar.classList.add("animated"));
  }

  // ---------------------------------------------------------
  // Animation 3D n°1 : scène Three.js dans le hero
  // Formes filaires flottantes + particules, réactives à la souris
  // ---------------------------------------------------------
  const initHero3D = () => {
    const canvas = $("#hero3d");
    const hero = $("#accueil");
    if (!canvas || !hero || !window.THREE || reducedMotion) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      canvas.remove(); // WebGL indisponible : le site reste fonctionnel
      return;
    }

    const isMobile = window.innerWidth < DESKTOP_BREAKPOINT;
    const COLOR_A = 0x4f9cff;
    const COLOR_B = 0x8b7bff;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 14;

    const world = new THREE.Group();
    scene.add(world);

    // Formes filaires flottantes
    const shapeDefs = [
      { geo: new THREE.IcosahedronGeometry(1.7, 0), pos: [-8, 3, -3] },
      { geo: new THREE.TorusGeometry(1.2, 0.38, 12, 36), pos: [8.5, -3, -2] },
      { geo: new THREE.OctahedronGeometry(1.4, 0), pos: [6, 4.2, -5] },
      { geo: new THREE.BoxGeometry(1.7, 1.7, 1.7), pos: [-6.5, -4, -1] },
      { geo: new THREE.TetrahedronGeometry(1.5, 0), pos: [0.5, -5.5, -4] }
    ];

    const shapes = shapeDefs.slice(0, isMobile ? 3 : shapeDefs.length).map((def, i) => {
      const mesh = new THREE.Mesh(
        def.geo,
        new THREE.MeshBasicMaterial({
          color: i % 2 ? COLOR_B : COLOR_A,
          wireframe: true,
          transparent: true,
          opacity: 0.35
        })
      );
      mesh.position.set(...def.pos);
      mesh.userData = {
        baseY: def.pos[1],
        spin: 0.1 + i * 0.04,
        phase: i * 1.3
      };
      world.add(mesh);
      return mesh;
    });

    // Champ de particules
    const count = isMobile ? 120 : 260;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        color: COLOR_A,
        size: 0.07,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true
      })
    );
    world.add(particles);

    // Taille = taille du hero
    const resize = () => {
      const width = hero.clientWidth || window.innerWidth;
      const height = hero.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    // Parallaxe à la souris
    const mouse = { x: 0, y: 0 };
    window.addEventListener(
      "pointermove",
      (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
      },
      { passive: true }
    );

    // Boucle d'animation (en pause si le hero n'est pas visible)
    const clock = new THREE.Clock();
    let running = false;
    let heroVisible = true;
    let rafId = 0;

    const render = () => {
      if (!running) return;
      const t = clock.getElapsedTime();

      shapes.forEach((mesh) => {
        const { baseY, spin, phase } = mesh.userData;
        mesh.rotation.x = t * spin;
        mesh.rotation.y = t * spin * 1.4;
        mesh.position.y = baseY + Math.sin(t * 0.6 + phase) * 0.5;
      });

      particles.rotation.y = t * 0.02;
      world.rotation.y += (mouse.x * 0.25 - world.rotation.y) * 0.04;
      world.rotation.x += (mouse.y * 0.15 - world.rotation.x) * 0.04;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(render);
    };

    const sync = () => {
      const shouldRun = heroVisible && !document.hidden;
      if (shouldRun && !running) {
        running = true;
        clock.getDelta();
        rafId = requestAnimationFrame(render);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(rafId);
      }
    };

    if (hasObserver) {
      new IntersectionObserver((entries) => {
        heroVisible = entries[0].isIntersecting;
        sync();
      }).observe(hero);
    }
    document.addEventListener("visibilitychange", sync);
    sync();
  };

  // ---------------------------------------------------------
  // Animation 3D n°2 : inclinaison des cartes au survol
  // (uniquement sur appareils avec souris)
  // ---------------------------------------------------------
  const initTilt3D = () => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover || reducedMotion) return;

    const MAX_TILT = 8; // degrés

    $$(".project-card, .profile-card, .skill, .education-grid .card").forEach((element) => {
      let resetTimer;
      element.classList.add("tilt-3d");

      element.addEventListener("pointermove", (event) => {
        if (!element.classList.contains("visible")) return; // attendre la fin de l'animation d'apparition
        clearTimeout(resetTimer);

        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        element.style.transition = "transform 0.12s ease-out";
        element.style.transform =
          `perspective(900px) rotateX(${-y * MAX_TILT * 2}deg) rotateY(${x * MAX_TILT * 2}deg) scale(1.02)`;
      });

      element.addEventListener("pointerleave", () => {
        element.style.transition = "transform 0.5s ease";
        element.style.transform = "";
        resetTimer = setTimeout(() => {
          element.style.transition = "";
        }, 500);
      });
    });
  };

  initHero3D();
  initTilt3D();
});
