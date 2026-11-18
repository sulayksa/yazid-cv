/* Yazeed Elias — motion layer
   GSAP + ScrollTrigger as the single clock, Lenis smooth scroll, React Bits effects.
   Calm by design; everything is skipped under prefers-reduced-motion. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  const RB = window.ReactBits;

  /* ---------- Light Rays (hero background) ---------- */
  const raysHost = document.querySelector('.hero-rays');
  if (raysHost && RB) {
    try {
      RB.LightRays.mount(raysHost, {
        raysOrigin: 'top-center',
        raysColor: '#0f5c3f',
        lightMode: true,
        atmosphere: 0,
        raysSpeed: reduce ? 0 : 0.45,
        lightSpread: 0.75,
        rayLength: 1.6,
        glow: 0.35,
        haze: 0.35,
        opacity: 0.5,
        followMouse: !reduce,
        mouseInfluence: 0.05,
        cursorShadow: false,
        clickPulse: false,
        intro: !reduce,
        maxDevicePixelRatio: 1.5
      });
    } catch (e) { console.warn('LightRays unavailable', e); }
  }

  if (!hasGSAP) return; // inline fallback adds .no-gs after 3s
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('gs-on');

  /* ---------- Lenis on GSAP's ticker (one clock) ---------- */
  document.querySelectorAll('dialog, .nav, [data-scroll-own]').forEach((el) => el.setAttribute('data-lenis-prevent', ''));
  if (!reduce && window.Lenis) {
    const lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 0.9, autoRaf: false, anchors: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Blur Text (hero title, whole words only) ---------- */
  const title = document.querySelector('[data-blur]');
  if (title) {
    title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());
    const words = [];
    const splitNode = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            const w = document.createElement('span');
            w.className = 'bw'; w.setAttribute('aria-hidden', 'true'); w.textContent = p;
            frag.appendChild(w); words.push(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          if (child.classList.contains('h1-dot')) { child.classList.add('bw'); child.setAttribute('aria-hidden', 'true'); words.push(child); }
          else splitNode(child);
        }
      });
    };
    splitNode(title);
    if (!reduce) {
      gsap.set(words, { filter: 'blur(10px)', opacity: 0, y: -36, willChange: 'filter, transform, opacity' });
      gsap.to(words, {
        keyframes: [
          { filter: 'blur(5px)', opacity: 0.5, y: 3.6, duration: 0.35, ease: 'power1.out' },
          { filter: 'blur(0px)', opacity: 1, y: 0, duration: 0.35, ease: 'power1.out' }
        ],
        stagger: 0.16, delay: 0.25,
        onComplete: () => gsap.set(words, { clearProps: 'filter,willChange' })
      });
    }
  }

  /* ---------- Star Border (primary buttons only) ---------- */
  if (RB && !reduce) {
    document.querySelectorAll('[data-star]').forEach((btn) => {
      const onLight = btn.dataset.star === 'light';
      try {
        RB.StarBorder.mount(btn, onLight
          ? { theme: 'light', color: '#0f5c3f', trailColor: '#d9b45f', duration: 5, thickness: 1.5, radius: 999, glow: 0.55, hover: 'lap', clickPulse: false, borderColor: 'rgba(15,92,63,.18)' }
          : { theme: 'dark', color: '#fbf3dc', trailColor: '#d9b45f', duration: 5, thickness: 1.5, radius: 999, glow: 0.55, hover: 'lap', clickPulse: false, borderColor: 'rgba(255,255,255,.18)' });
      } catch (e) { console.warn('StarBorder unavailable', e); }
    });
  }

  if (reduce) return;

  /* ---------- Section reveals ---------- */
  document.querySelectorAll('main > section:not(.hero) > .container').forEach((wrap) => {
    gsap.from(wrap, { y: 44, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: wrap, start: 'top 88%', once: true } });
  });

  /* ---------- [data-reveal] items via batch (keeps tuned CSS transitions, replays like Tower Land) ---------- */
  const items = gsap.utils.toArray('[data-reveal]:not(.hero [data-reveal]), [data-divider]');
  const show = (batch) => batch.forEach((el, i) => {
    const own = parseFloat(el.dataset.delay || 0);
    el.style.transitionDelay = (own + i * 0.08).toFixed(2) + 's';
    el.classList.add('is-in');
  });
  const hide = (batch) => batch.forEach((el) => { el.style.transitionDelay = '0s'; el.classList.remove('is-in'); });
  ScrollTrigger.batch(items, { start: 'top 92%', onEnter: show, onLeaveBack: hide, interval: 0.08 });
  // hero items: reveal on load
  gsap.utils.toArray('.hero [data-reveal]').forEach((el) => {
    const d = parseFloat(el.dataset.delay || 0) + 0.3;
    el.style.transitionDelay = d + 's'; requestAnimationFrame(() => el.classList.add('is-in'));
  });

  /* ---------- Count-ups (replay when scrolled back) ---------- */
  gsap.utils.toArray('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const dec = (String(el.dataset.count).split('.')[1] || '').length;
    const fmt = (v) => pre + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
    const obj = { v: 0 };
    el.textContent = fmt(0);
    const tween = gsap.to(obj, { v: target, duration: 1.8, ease: 'power3.out', paused: true, onUpdate: () => { el.textContent = fmt(obj.v); } });
    ScrollTrigger.create({ trigger: el, start: 'top 90%', onEnter: () => tween.restart(), onEnterBack: () => tween.restart(), onLeaveBack: () => { tween.pause(0); el.textContent = fmt(0); } });
  });

  /* ---------- Refresh after anything that changes layout ---------- */
  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener('load', refresh);
  document.querySelectorAll('.filter').forEach((b) => b.addEventListener('click', () => requestAnimationFrame(refresh)));
  window.__refreshMotion = refresh;
})();
