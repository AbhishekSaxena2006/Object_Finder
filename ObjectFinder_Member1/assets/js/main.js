/* ============================================================
   ObjectFinder — main.js
   Navigation, Animations, Landing Page Interactions
   ============================================================ */

'use strict';

/* ── Navbar: scroll effect + hamburger ── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('nav-hamburger');
  const mobileNav = document.getElementById('nav-mobile');

  if (!navbar) return;

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Hamburger toggle
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile nav on outside click
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
})();

/* ── Scroll-reveal animations ── */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.animate-fade-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger delay based on element index within its parent
        const siblings = Array.from(entry.target.parentElement?.children || []);
        const idx = siblings.indexOf(entry.target);
        const delay = Math.min(idx * 80, 400);

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();

/* ── Toast notification system ── */
const Toast = (() => {
  let container = null;

  function getContainer() {
    if (!container) {
      container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }
    }
    return container;
  }

  function show(message, type = 'info', duration = 4000) {
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const c = getContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-msg">${message}</span>
      <button class="toast-close" aria-label="Close notification">✕</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    const remove = () => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    };

    closeBtn.addEventListener('click', remove);
    c.appendChild(toast);

    if (duration > 0) {
      setTimeout(remove, duration);
    }

    return { remove };
  }

  return { show };
})();

/* ── Navbar: Scrollspy, Active Transparent Pill Indicators & Smooth Scroll ── */
(function initNavScrollspy() {
  const navbar = document.getElementById('navbar');
  const desktopLinks = Array.from(document.querySelectorAll('.nav-links .nav-link'));
  const mobileLinks = Array.from(document.querySelectorAll('.nav-mobile .nav-link'));
  const allNavLinks = [...desktopLinks, ...mobileLinks];

  // List of navigable sections on index.html in order
  const sectionIds = ['home', 'report-item', 'register-item', 'view-reported-items', 'about'];
  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  let isManualScrolling = false;
  let manualScrollTimer = null;

  function setActive(targetId) {
    if (!targetId) return;

    allNavLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      let linkId = '';
      if (href.startsWith('#')) {
        linkId = href.slice(1);
      } else if (href.includes('#')) {
        linkId = href.split('#')[1];
      }

      if (linkId === targetId || (targetId === 'home' && (href === 'index.html' || href === '#home'))) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else if (href.includes('#') || href === 'index.html') {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  function getActiveSectionId() {
    if (!sections.length) return null;

    const scrollY = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    // If near bottom of the page, activate the last section
    if (scrollY + windowHeight >= docHeight - 60) {
      return sections[sections.length - 1].id;
    }

    // If at top of the page, activate home
    if (scrollY < 120) {
      return 'home';
    }

    const navHeight = navbar ? navbar.offsetHeight : 70;
    const triggerOffset = scrollY + navHeight + 110;
    let activeId = sections[0].id;

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      if (triggerOffset >= sec.offsetTop) {
        activeId = sec.id;
      }
    }

    return activeId;
  }

  // Smooth scroll & click active state for all internal hash links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const targetId = href.slice(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();

        // Immediately apply transparent active styling to clicked button
        setActive(targetId);

        // Lock scrollspy during animated scroll to avoid intermediate flickering
        isManualScrolling = true;
        clearTimeout(manualScrollTimer);

        const navHeight = navbar ? navbar.offsetHeight : 70;
        const targetTop = targetElement.getBoundingClientRect().top + window.scrollY - navHeight - 12;

        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth'
        });

        // Close mobile nav drawer if open
        const hamburger = document.getElementById('nav-hamburger');
        const mobileNav = document.getElementById('nav-mobile');
        if (hamburger && mobileNav && mobileNav.classList.contains('open')) {
          hamburger.classList.remove('open');
          mobileNav.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }

        manualScrollTimer = setTimeout(() => {
          isManualScrolling = false;
          setActive(targetId);
        }, 850);
      }
    });
  });

  // Handle Logo click to return to home smoothly
  const logo = document.querySelector('.nav-logo');
  if (logo && sections.length > 0) {
    logo.addEventListener('click', (e) => {
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      if (currentPath === 'index.html' || currentPath === '') {
        e.preventDefault();
        setActive('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Optimized scroll event listener with requestAnimationFrame
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (!isManualScrolling && sections.length > 0) {
          const activeSec = getActiveSectionId();
          if (activeSec) {
            setActive(activeSec);
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Initial detection on page load
  const initialHash = window.location.hash.slice(1);
  if (initialHash && document.getElementById(initialHash)) {
    setActive(initialHash);
  } else if (sections.length > 0) {
    setActive(getActiveSectionId());
  } else {
    // Other pages: highlight matching html page
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    allNavLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath) {
        link.classList.add('active');
      }
    });
  }
})();

/* ── Expose Toast globally ── */
window.Toast = Toast;
