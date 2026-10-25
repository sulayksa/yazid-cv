document.documentElement.classList.remove('no-js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = matchMedia('(min-width: 1000px)');
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ---------- Intro ---------- */
let introDone = false;
const finish = () => {
  if (introDone) return; introDone = true;
  $('#loader').classList.add('done');
  requestAnimationFrame(() => document.body.classList.add('loaded'));
};
if (document.readyState === 'complete') setTimeout(finish, 300);
else addEventListener('load', () => setTimeout(finish, 300));
setTimeout(finish, 2200);

/* ---------- Top bar + progress ---------- */
const topbar = $('#topbar'), bar = $('#progress');
let ticking = false;
const onScroll = () => {
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => {
    topbar.classList.toggle('solid', scrollY > 10);
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
    ticking = false;
  });
};
onScroll();
addEventListener('scroll', onScroll, { passive: true });

/* ---------- Smooth in-page scrolling with eased motion ---------- */
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href');
  const el = id === '#top' ? null : $(id);
  if (id !== '#top' && !el) return;
  e.preventDefault();
  const off = topbar.offsetHeight + 8;
  const to = el ? el.getBoundingClientRect().top + scrollY - off : 0;
  if (reduce) { scrollTo(0, to); return; }
  const from = scrollY, d = to - from, dur = Math.min(1000, 420 + Math.abs(d) * .22), t0 = performance.now();
  const step = now => { const p = Math.min((now - t0) / dur, 1); scrollTo(0, from + d * ease(p)); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
  history.replaceState(null, '', id);
}));

/* ---------- Active section (desktop nav + mobile tab bar) ---------- */
const tabMap = { top: 'top', about: 'about', projects: 'projects', services: 'projects', wafa: 'experience', experience: 'experience', skills: 'experience', awards: 'experience', contact: 'contact' };
const setActive = id => {
  $$('#navDesk a').forEach(a => a.classList.toggle('active', a.dataset.nav === id));
  $$('#tabbar a').forEach(a => a.classList.toggle('active', a.dataset.nav === tabMap[id]));
};
const spy = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-45% 0px -50% 0px' });
['top', 'about', 'projects', 'services', 'wafa', 'experience', 'skills', 'awards', 'contact'].forEach(id => { const el = document.getElementById(id); el && spy.observe(el); });

/* ---------- Count-up ---------- */
const countUp = el => {
  const to = +el.dataset.count, from = el.dataset.from ? +el.dataset.from : 0, dur = 1500, t0 = performance.now();
  const step = now => { const p = Math.min((now - t0) / dur, 1); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
  el.textContent = from; requestAnimationFrame(step);
};

/* ---------- Reveal on scroll (staggered per group) ---------- */
const io = new IntersectionObserver(es => {
  const batch = es.filter(e => e.isIntersecting);
  batch.forEach((e, i) => {
    const el = e.target;
    el.style.transitionDelay = Math.min(i * 70, 280) + 'ms';
    el.classList.add('in');
    if (!reduce) el.querySelectorAll('[data-count]').forEach(countUp);
    io.unobserve(el);
  });
}, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
$$('.rv, #timeline').forEach(el => io.observe(el));

/* ---------- Project rail dots ---------- */
const rail = $('#projRail'), dots = $$('#projDots i');
if (rail) {
  rail.addEventListener('scroll', () => {
    const cards = [...rail.children];
    const mid = rail.getBoundingClientRect().left + rail.clientWidth / 2;
    let best = 0, bd = Infinity;
    cards.forEach((c, i) => { const r = c.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = i; } });
    dots.forEach((d, i) => d.classList.toggle('on', i === best));
  }, { passive: true });
  dots.forEach((d, i) => d.addEventListener('click', () => rail.children[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })));
}

/* ---------- Services: all open on desktop, accordion on mobile ---------- */
const services = $$('.service');
const syncServices = () => { if (desktop.matches) services.forEach(s => s.open = true); };
syncServices(); desktop.addEventListener('change', syncServices);
services.forEach(s => s.addEventListener('toggle', () => {
  if (desktop.matches || !s.open) return;
  services.forEach(o => { if (o !== s) o.open = false; });
}));

/* ---------- Subtle hero parallax (desktop) ---------- */
if (!reduce && desktop.matches) {
  const img = $('.hero-photo img');
  addEventListener('scroll', () => {
    if (scrollY < innerHeight && document.body.classList.contains('loaded')) img.style.transform = `translateX(-50%) translateY(${scrollY * .1}px)`;
  }, { passive: true });
}

$('#year').textContent = new Date().getFullYear();
