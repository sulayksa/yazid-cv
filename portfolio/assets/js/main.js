/* Yazeed Elias — interactions & scroll motion
   Reveal / divider / progress / active-nav / parallax logic mirrors the Tower Land site. */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------------- Certificates data ---------------- */
  const CERTS = [
    { cat: 'film', kicker: 'مسار الأفلام والسينما · مختومة رسميًا', title: 'المركز الثالث على منطقة الرياض — فيلم «أثر كلمة»', issuer: 'كمصور وإداري وممنتج للفيلم · وزارتا الثقافة والتعليم', img: 'assets/img/cert/cert-film-athar.webp' },
    { cat: 'service', kicker: 'وسام التميز والتطوع المعتمد · 126 ساعة', title: 'وسام التطوع والتميز المجتمعي (مبادرة كن غيثًا)', issuer: 'مجلس إدارة جمعية التنمية الأهلية بحي الجزيرة', img: 'assets/img/work/jz-honor.jpg' },
    { cat: 'speech', kicker: 'التوستماسترز العالمية للخطابة', title: 'جائزة أفضل خطيب في الخطب الارتجالية — لقاء 414', issuer: 'نادي الصفوة للتوستماسترز · 21 / 8 / 1447هـ', img: 'assets/img/cert/cert-toastmasters-414.webp' },
    { cat: 'speech', kicker: 'التوستماسترز العالمية للخطابة', title: 'جائزة أفضل خطيب في الخطب الارتجالية — لقاء 417', issuer: 'نادي الصفوة للتوستماسترز · 13 / 9 / 1447هـ', img: 'assets/img/cert/cert-toastmasters-417.webp' },
    { cat: 'tech', kicker: 'القيادة التقنية للمناسبات · مختومة رسميًا', title: 'قيادة وإدارة النشاط التقني لحفل التخرج 1447هـ', issuer: 'التخطيط والإشراف على الأنظمة · ثانوية الأندلس', img: 'assets/img/cert/cert-tech-grad.webp' },
    { cat: 'tech', kicker: 'إدارة الأنشطة والبرامج · مختومة رسميًا', title: 'إدارة النشاط المدرسي للعام الدراسي 1447هـ', issuer: 'مسؤولية شاملة وإنجاح الأنشطة · ثانوية الأندلس', img: 'assets/img/cert/cert-school-activity.webp' },
    { cat: 'service', kicker: 'التطوع الميداني وخدمة الضيوف', title: 'خدمة الضيوف وتنظيم فعاليات جمعية تنمية الجزيرة', issuer: 'جمعية التنمية الأهلية بحي الجزيرة بالرياض', img: 'assets/img/work/jz-serve.webp' },
    { cat: 'film', kicker: 'الإخراج والإنتاج الإبداعي · مختومة رسميًا', title: 'إخراج الفيلم القصير والعمل المسرحي واليوم الوطني', issuer: 'إدارة ثانوية الأندلس بالرياض', img: 'assets/img/cert/cert-theater-national.webp' },
    { cat: 'service', kicker: 'التنظيم والتشغيل الميداني · مختومة رسميًا', title: 'تنظيم وإنجاح الدوري المدرسي الرياضي', issuer: 'إدارة الفعاليات الرياضية · ثانوية الأندلس', img: 'assets/img/cert/cert-sports-league.webp' },
    { cat: 'speech', kicker: 'الخطابة وفصاحة المنطق · مختومة رسميًا', title: 'مسابقة «خطيب الأندلس» في فن الإلقاء والخطابة', issuer: 'ثانوية الأندلس بالرياض · 1447هـ', img: 'assets/img/cert/cert-khateeb.webp' },
    { cat: 'speech', kicker: 'فنون الإلقاء والتواصل · مختومة رسميًا', title: 'دورة فن الإلقاء والتأثير الصوتي المتقدم', issuer: 'ثانوية الأندلس بالرياض', img: 'assets/img/cert/cert-public-speaking.webp' },
    { cat: 'excellence', kicker: 'التفوق والتميز الأكاديمي · مختومة رسميًا', title: 'شهادة التفوق الدراسي في جميع المواد الدراسية', issuer: 'مدرسة جعفر بن الزبير · 1444هـ', img: 'assets/img/cert/cert-academic-excellence.webp' },
    { cat: 'excellence', kicker: 'المناسبات والفعاليات الوطنية · مختومة رسميًا', title: 'تفعيل أنشطة اليوم الوطني السعودي 92', issuer: 'رائد النشاط وإدارة المدرسة · الرياض', img: 'assets/img/cert/cert-national-day-92.webp' }
  ];

  const certsEl = document.getElementById('certs');
  if (certsEl) {
    certsEl.innerHTML = CERTS.map((c, i) => `
      <button class="cert glass tilt cert-open" data-reveal="up" data-delay="${(i % 3) * 0.08}" data-cat="${c.cat}" data-full="${c.img}" data-title="${c.title}">
        <span class="cert-num">${i + 1}</span>
        <span class="cert-paper"><img src="${c.img}" alt="${c.title}" loading="lazy" /></span>
        <span class="cert-meta"><small>${c.kicker}</small><strong>${c.title}</strong><em>${c.issuer}</em></span>
      </button>`).join('');
  }

  /* ---------------- Reveal (Tower Land parity) ---------------- */
  const revealEls = document.querySelectorAll('[data-reveal], [data-divider]');
  const setIn = (el, on) => {
    if (on) {
      const d = parseFloat(el.dataset.delay || 0);
      el.style.transitionDelay = d ? d + 's' : '0s';
      el.classList.add('is-in');
    } else {
      el.style.transitionDelay = '0s';
      el.classList.remove('is-in');
    }
  };
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      const vh = window.innerHeight;
      for (const en of entries) {
        if (en.isIntersecting) setIn(en.target, true);
        else if (en.boundingClientRect.top >= vh * 0.96) setIn(en.target, false); // replay when scrolling back up
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------------- Header, progress, parallax, timeline (one rAF) ---------------- */
  const header = document.getElementById('header');
  const bar = document.getElementById('progress-bar');
  const tlFill = document.getElementById('tl-fill');
  const timeline = document.querySelector('.steps');
  const parallaxEls = [...document.querySelectorAll('[data-parallax]')].map((el) => ({ el, speed: parseFloat(el.dataset.parallax) || 0, anchor: 0, h: 300 }));
  const tl = { top: 0, h: 1 };
  const measure = () => {
    const y = window.scrollY;
    if (timeline) { const r = timeline.getBoundingClientRect(); tl.top = r.top + y; tl.h = r.height || 1; }
    parallaxEls.forEach((p) => {
      const prev = p.el.style.translate; p.el.style.translate = '';
      const r = p.el.getBoundingClientRect();
      p.anchor = r.top + y; p.h = r.height || 300;
      p.el.style.translate = prev;
    });
  };
  let lastY = window.scrollY, ticking = false;
  const frame = () => {
    ticking = false;
    const y = window.scrollY, vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    if (bar) bar.style.transform = `scale3d(${max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0}, 1, 1)`;
    if (header) {
      header.classList.toggle('is-scrolled', y > 30);
      const navOpen = document.getElementById('nav')?.classList.contains('is-open');
      header.classList.toggle('is-hidden', !navOpen && y > 500 && y > lastY + 4);
      if (y < lastY - 4) header.classList.remove('is-hidden');
    }
    lastY = y;
    if (!reduce) {
      parallaxEls.forEach((p) => {
        const dist = p.anchor + p.h * 0.5 - (y + vh * 0.5);
        const prog = Math.max(-1.4, Math.min(1.4, -dist / (vh * 0.75)));
        p.el.style.translate = `0 ${(prog * p.speed).toFixed(1)}px`;
      });
    }
    if (tlFill && timeline) {
      const p = Math.min(Math.max((y + vh * 0.6 - tl.top) / tl.h, 0), 1);
      tlFill.style.transform = `scale3d(${p}, 1, 1)`;
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- Smooth scroll (Lenis) — runs at the display's native refresh rate ---------------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true, anchors: { offset: -90 } });
    window.__lenis = lenis;
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -90, duration: 1.4 }); }
    });
  }
  window.addEventListener('resize', () => { measure(); onScroll(); }, { passive: true });
  window.addEventListener('load', () => { measure(); onScroll(); });
  measure(); frame();

  /* ---------------- Active nav link ---------------- */
  const navLinks = [...document.querySelectorAll('.nav a')];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const navIO = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) {
        const id = '#' + en.target.id;
        navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === id));
      }
    }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });
    sections.forEach((s) => navIO.observe(s));
  }

  /* ---------------- Mobile menu ---------------- */
  const menuBtn = document.getElementById('menu-btn');
  const nav = document.getElementById('nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
      nav.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ---------------- Counters ---------------- */
  const counters = document.querySelectorAll('[data-count]');
  const runCount = (el) => {
    const target = parseInt(el.dataset.count, 10), pre = el.dataset.prefix || '';
    if (reduce) { el.textContent = pre + target; return; }
    const t0 = performance.now(), dur = 1800;
    const step = (t) => {
      const k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 4);
      el.textContent = pre + Math.round(target * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const cIO = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { runCount(en.target); cIO.unobserve(en.target); }
    }), { threshold: 0.5 });
    counters.forEach((c) => cIO.observe(c));
  } else counters.forEach(runCount);

  /* ---------------- 3D tilt ---------------- */
  if (fine && !reduce) {
    document.querySelectorAll('.tilt').forEach((el) => {
      const max = parseFloat(el.dataset.tilt || 7);
      const shine = document.createElement('span'); shine.className = 'shine'; el.appendChild(shine);
      let pending = null, rect = null;
      el.addEventListener('pointerenter', () => { rect = el.getBoundingClientRect(); });
      el.addEventListener('pointermove', (e) => {
        if (el.hasAttribute('data-reveal') && !el.classList.contains('is-in')) return;
        if (pending) { pending = e; return; }
        pending = e;
        requestAnimationFrame(() => { const ev = pending; pending = null; applyTilt(ev); });
      });
      const applyTilt = (e) => {
        const r = rect || (rect = el.getBoundingClientRect());
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transition = 'transform .12s linear, opacity .68s';
        el.style.transitionDelay = '0s';
        el.style.transform = `perspective(1000px) rotateX(${((0.5 - y) * max).toFixed(2)}deg) rotateY(${((x - 0.5) * max).toFixed(2)}deg) translateZ(0)`;
        el.style.setProperty('--mx', (x * 100) + '%');
        el.style.setProperty('--my', (y * 100) + '%');
      };
      el.addEventListener('pointerleave', () => {
        rect = null;
        el.style.transition = 'transform .8s cubic-bezier(.16,1,.3,1), opacity .68s';
        el.style.transform = '';
        setTimeout(() => { el.style.transition = ''; }, 820);
      });
    });

  }

  /* ---------------- Manar screen tabs (auto-rotate) ---------------- */
  const screens = [...document.querySelectorAll('#manar-screens img')];
  const tabs = [...document.querySelectorAll('.screen-tabs button')];
  let cur = 0, timer = null;
  const showScreen = (i) => {
    cur = i;
    screens.forEach((im, k) => im.classList.toggle('is-active', k === i));
    tabs.forEach((t, k) => t.classList.toggle('is-active', k === i));
  };
  tabs.forEach((t) => t.addEventListener('click', () => { showScreen(+t.dataset.screen); clearInterval(timer); }));
  if (screens.length && !reduce) timer = setInterval(() => showScreen((cur + 1) % screens.length), 4200);

  /* ---------------- Certificate filters ---------------- */
  const filters = document.querySelectorAll('.filter');
  filters.forEach((btn) => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    filters.forEach((b) => b.classList.toggle('is-active', b === btn));
    document.querySelectorAll('.cert').forEach((c) => {
      const show = f === 'all' || c.dataset.cat === f;
      c.classList.toggle('is-hidden', !show);
      if (show) { c.classList.remove('is-in'); requestAnimationFrame(() => requestAnimationFrame(() => setIn(c, true))); }
    });
  }));

  /* ---------------- Lightbox with navigation ---------------- */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCap = document.getElementById('lb-cap');
  let group = [], idx = 0;
  const show = (i) => {
    idx = (i + group.length) % group.length;
    const el = group[idx];
    lbImg.src = el.dataset.full; lbImg.alt = el.dataset.title || '';
    lbCap.textContent = el.dataset.title || '';
    const fig = lb.querySelector('figure');
    fig.style.animation = 'none'; void fig.offsetWidth; fig.style.animation = '';
  };
  if (lb) {
    document.addEventListener('click', (e) => {
      const opener = e.target.closest('.cert-open');
      if (!opener) return;
      group = [...document.querySelectorAll('.cert-open')].filter((x) => !x.classList.contains('is-hidden'));
      show(group.indexOf(opener));
      lb.showModal();
      window.__lenis && window.__lenis.stop();
    });
    lb.addEventListener('close', () => window.__lenis && window.__lenis.start());
    lb.querySelector('.lb-close').addEventListener('click', () => lb.close());
    lb.querySelector('.lb-prev').addEventListener('click', () => show(idx - 1));
    lb.querySelector('.lb-next').addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(idx + 1);
      if (e.key === 'ArrowRight') show(idx - 1);
    });
  }
})();
