/* ─────────────────────────────────────────────────────────────────────────────
   Likhith.OS — script.js
   In-memory state only (no localStorage/sessionStorage)
───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── State (in-memory only) ── */
  var state = {
    theme: 'dark',
    bootDone: false,
    mobileNavOpen: false,
    typedInstance: null
  };

  /* ── Boot sequence lines ── */
  var BOOT_LINES = [
    { tag: 'init', text: 'Mounting personality filesystem...' },
    { tag: 'init', text: 'Loading kernel modules... <span class="hi">[ AI/ML, Full-Stack, DevOps ]</span>' },
    { tag: 'ok',   text: 'Python 3.11 runtime ready' },
    { tag: 'ok',   text: 'React 18 / Node.js 20 environment loaded' },
    { tag: 'ok',   text: 'LangChain + n8n automation stack initialized' },
    { tag: 'ok',   text: 'PyTorch 2.x neural subsystem online' },
    { tag: 'init', text: 'Establishing link to Dallas, TX...' },
    { tag: 'ok',   text: 'Connected to <span class="hi">ITion Solutions</span>' },
    { tag: 'ok',   text: 'GitHub remote: Likhith083 <span class="hi">✓</span>' },
    { tag: 'ok',   text: 'All systems nominal — <span class="hi">Welcome.</span>' }
  ];

  /* ── DOM References ── */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  /* ════════════════════════════════════════════════════════════════
     BOOT SEQUENCE
  ════════════════════════════════════════════════════════════════ */
  function runBootSequence() {
    var screen = $('#boot-screen');
    var log    = $('#boot-log');
    if (!screen || !log) { afterBoot(); return; }

    document.body.classList.add('boot-active');

    var delay = 120;
    BOOT_LINES.forEach(function (line, i) {
      setTimeout(function () {
        var el = document.createElement('div');
        el.className = 'boot-line';
        el.style.animationDelay = '0ms';
        el.innerHTML =
          '<span class="boot-tag ' + line.tag + '">' + line.tag.toUpperCase() + '</span>' +
          '<span class="boot-text">' + line.text + '</span>';
        log.appendChild(el);
        log.scrollTop = log.scrollHeight;
      }, delay * i + 200);
    });

    var totalTime = delay * BOOT_LINES.length + 800;
    setTimeout(function () {
      screen.classList.add('hidden');
      document.body.classList.remove('boot-active');
      state.bootDone = true;
      afterBoot();
    }, totalTime);
  }

  function afterBoot() {
    initTypewriter();
    animateHero();
  }

  /* ════════════════════════════════════════════════════════════════
     NAVIGATION
  ════════════════════════════════════════════════════════════════ */
  function initNav() {
    var nav         = $('#nav');
    var hamburger   = $('#nav-hamburger');
    var mobileNav   = $('#mobile-nav');
    var navLinks    = $$('.nav-link, .mobile-nav-link');
    var sections    = $$('section[id]');

    /* Active link on scroll */
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function (l) {
            l.classList.toggle('active', l.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(function (s) { observer.observe(s); });

    /* Mobile menu toggle */
    if (hamburger) {
      hamburger.addEventListener('click', function () {
        state.mobileNavOpen = !state.mobileNavOpen;
        if (mobileNav) {
          mobileNav.classList.toggle('open', state.mobileNavOpen);
        }
        hamburger.setAttribute('aria-expanded', state.mobileNavOpen);
      });
    }

    /* Close mobile nav on link click */
    $$('.mobile-nav-link').forEach(function (l) {
      l.addEventListener('click', function () {
        state.mobileNavOpen = false;
        if (mobileNav) mobileNav.classList.remove('open');
      });
    });

    /* Smooth scroll for all anchor links */
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 56;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  }

  /* ════════════════════════════════════════════════════════════════
     CLOCK
  ════════════════════════════════════════════════════════════════ */
  function initClock() {
    var el = $('#nav-clock');
    if (!el) return;

    function tick() {
      var now = new Date();
      var h = now.getHours().toString().padStart(2, '0');
      var m = now.getMinutes().toString().padStart(2, '0');
      el.textContent = h + ':' + m;
    }

    tick();
    setInterval(tick, 10000);
  }

  /* ════════════════════════════════════════════════════════════════
     THEME TOGGLE
  ════════════════════════════════════════════════════════════════ */
  function initTheme() {
    var btn       = $('#theme-toggle');
    var iconMoon  = $('#icon-moon');
    var iconSun   = $('#icon-sun');

    function applyTheme(theme) {
      state.theme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      if (iconMoon && iconSun) {
        iconMoon.style.display = theme === 'dark'  ? 'block' : 'none';
        iconSun.style.display  = theme === 'light' ? 'block' : 'none';
      }
      if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }

    if (btn) {
      btn.addEventListener('click', function () {
        applyTheme(state.theme === 'dark' ? 'light' : 'dark');
      });
    }

    applyTheme('dark');
  }

  /* ════════════════════════════════════════════════════════════════
     HERO CANVAS — subtle dot grid
  ════════════════════════════════════════════════════════════════ */
  function initHeroCanvas() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dots = [];
    var W, H;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      buildDots();
    }

    function buildDots() {
      dots = [];
      var spacing = 36;
      var cols = Math.ceil(W / spacing);
      var rows = Math.ceil(H / spacing);
      for (var r = 0; r <= rows; r++) {
        for (var c = 0; c <= cols; c++) {
          dots.push({
            x:  c * spacing + (spacing / 2),
            y:  r * spacing + (spacing / 2),
            ox: c * spacing + (spacing / 2),
            oy: r * spacing + (spacing / 2),
            phase: Math.random() * Math.PI * 2,
            speed: 0.4 + Math.random() * 0.4,
            amp:   0 + Math.random() * 1.2
          });
        }
      }
    }

    var mx = -9999, my = -9999;
    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', function () { mx = -9999; my = -9999; });

    var t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var isDark = state.theme !== 'light';
      var baseAlpha = isDark ? 0.18 : 0.12;
      t += 0.012;
      dots.forEach(function (d) {
        var wave = Math.sin(t * d.speed + d.phase) * d.amp;
        d.x = d.ox + wave;
        d.y = d.oy + wave * 0.5;

        var dist = Math.hypot(d.x - mx, d.y - my);
        var glow = Math.max(0, 1 - dist / 120);
        var r = 1.5 + glow * 2;
        var a = baseAlpha + glow * 0.5;

        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? 'rgba(79,152,163,' + a + ')'
          : 'rgba(1,105,111,' + a + ')';
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();
  }

  /* ════════════════════════════════════════════════════════════════
     TYPEWRITER
  ════════════════════════════════════════════════════════════════ */
  function initTypewriter() {
    var el = document.getElementById('typewriter');
    if (!el) return;

    var strings = [
      'Agentic AI Developer',
      'Full-Stack Engineer',
      'RAG Pipeline Architect',
      'LangChain Practitioner',
      'n8n Automation Expert'
    ];

    var si = 0, ci = 0, deleting = false, pausing = false;

    function tick() {
      var current = strings[si];

      if (pausing) return;

      if (!deleting) {
        el.textContent = current.slice(0, ci + 1);
        ci++;
        if (ci === current.length) {
          pausing = true;
          setTimeout(function () { pausing = false; deleting = true; tick(); }, 1800);
          return;
        }
        setTimeout(tick, 60 + Math.random() * 40);
      } else {
        el.textContent = current.slice(0, ci - 1);
        ci--;
        if (ci === 0) {
          deleting = false;
          si = (si + 1) % strings.length;
          setTimeout(tick, 400);
          return;
        }
        setTimeout(tick, 30 + Math.random() * 20);
      }
    }

    setTimeout(tick, 200);
  }

  /* ════════════════════════════════════════════════════════════════
     HERO ENTRY ANIMATION (no GSAP dependency — pure CSS + JS)
  ════════════════════════════════════════════════════════════════ */
  function animateHero() {
    var items = $$('.hero-animate');
    items.forEach(function (el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity 0.55s ease ' + (0.1 + i * 0.12) + 's, transform 0.55s ease ' + (0.1 + i * 0.12) + 's';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════
     SCROLL REVEAL
  ════════════════════════════════════════════════════════════════ */
  function initScrollReveal() {
    var reveals = $$('.reveal');
    if (!reveals.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ════════════════════════════════════════════════════════════════
     LOAD CERTIFICATIONS
  ════════════════════════════════════════════════════════════════ */
  function loadCertifications() {
    var grid = document.getElementById('certs-grid');
    if (!grid) return;

    fetch('./data/certs.json')
      .then(function (r) {
        if (!r.ok) throw new Error('Failed to load certs.json');
        return r.json();
      })
      .then(function (certs) {
        grid.innerHTML = '';
        certs.forEach(function (cert, i) {
          var card = buildCertCard(cert);
          card.classList.add('reveal');
          if (i % 3 === 1) card.classList.add('reveal-delay-1');
          if (i % 3 === 2) card.classList.add('reveal-delay-2');
          grid.appendChild(card);
        });
        initScrollReveal();
      })
      .catch(function (err) {
        console.warn('Certs load error:', err);
        grid.innerHTML = '<p style="color:var(--color-text-muted);font-family:var(--font-mono);font-size:13px;">// Could not load certifications</p>';
      });
  }

  function buildCertCard(cert) {
    var card = document.createElement('div');
    card.className = 'cert-card';
    card.style.setProperty('--cert-accent', cert.accent || 'var(--color-primary)');

    var tagsHtml = (cert.tags || []).map(function (t) {
      return '<span class="cert-tag">' + escHtml(t) + '</span>';
    }).join('');

    card.innerHTML =
      '<div class="cert-header">' +
        '<div class="cert-title">' + escHtml(cert.title) + '</div>' +
        '<span class="cert-badge">' + escHtml(cert.credentialId || 'CERT') + '</span>' +
      '</div>' +
      '<div class="cert-issuer">' + escHtml(cert.issuer) + '</div>' +
      '<div class="cert-tags">' + tagsHtml + '</div>' +
      '<div class="cert-footer">' +
        '<span class="cert-date">' + escHtml(cert.issued) + '</span>' +
        '<a class="cert-link" href="' + escHtml(cert.url) + '" target="_blank" rel="noopener noreferrer">' +
          'View' +
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' +
        '</a>' +
      '</div>';

    return card;
  }

  function escHtml(str) {
    var d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  /* ════════════════════════════════════════════════════════════════
     CONTACT FORM (simulated — no backend)
  ════════════════════════════════════════════════════════════════ */
  function initContactForm() {
    var form   = document.getElementById('contact-form');
    var status = document.getElementById('form-status');
    if (!form || !status) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name    = form.querySelector('[name="name"]').value.trim();
      var email   = form.querySelector('[name="email"]').value.trim();
      var message = form.querySelector('[name="message"]').value.trim();

      if (!name || !email || !message) {
        status.className = 'form-status error';
        status.textContent = '// All fields are required.';
        return;
      }

      /* Simulate async send */
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending...';

      setTimeout(function () {
        status.className = 'form-status success';
        status.textContent = '// Message received — I\'ll get back to you soon!';
        form.reset();
        btn.disabled = false;
        btn.textContent = 'Send Message';
      }, 1000);
    });
  }

  /* ════════════════════════════════════════════════════════════════
     INIT
  ════════════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initNav();
    initClock();
    initHeroCanvas();
    initScrollReveal();
    loadCertifications();
    initContactForm();
    runBootSequence();
  });

}());
