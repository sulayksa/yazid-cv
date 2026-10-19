document.documentElement.classList.remove('no-js');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Page intro
const finishLoad = () => {
  document.getElementById('loader')?.classList.add('done');
  requestAnimationFrame(() => document.body.classList.add('loaded'));
};
if (document.readyState === 'complete') setTimeout(finishLoad, 350);
else window.addEventListener('load', () => setTimeout(finishLoad, 350));
setTimeout(finishLoad, 2500); // safety net

// Nav + scroll progress
const nav = document.getElementById('nav');
const bar = document.getElementById('progress');
const onScroll = () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
};
onScroll();
addEventListener('scroll', onScroll, { passive: true });

// Mobile menu
const menuBtn = document.getElementById('menuBtn');
menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});

// Smooth scroll with easing for every in-page link
const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href');
  const target = id === '#top' ? document.body : document.querySelector(id);
  if (!target) return;
  e.preventDefault();
  nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false);
  const to = id === '#top' ? 0 : target.getBoundingClientRect().top + scrollY - 76;
  if (reduce) { scrollTo(0, to); return; }
  const from = scrollY, dist = to - from, dur = Math.min(1100, 450 + Math.abs(dist) * .25), t0 = performance.now();
  const step = now => {
    const p = Math.min((now - t0) / dur, 1);
    scrollTo(0, from + dist * easeInOut(p));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  history.replaceState(null, '', id);
}));

// Active link
const links = [...document.querySelectorAll('#navLinks a')];
const targets = links.map(a => a.getAttribute('href') === '#top' ? document.getElementById('top') : document.querySelector(a.getAttribute('href')));
const spy = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  const i = targets.indexOf(e.target);
  if (i > -1) links.forEach((l, j) => l.classList.toggle('active', j === i));
}), { rootMargin: '-45% 0px -50% 0px' });
targets.forEach(t => t && spy.observe(t));

// Count-up
const countUp = el => {
  const target = +el.dataset.count;
  const start = el.dataset.from ? +el.dataset.from : 0;
  const dur = 1600, t0 = performance.now();
  const step = now => {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  el.textContent = start;
  requestAnimationFrame(step);
};

// Reveal on scroll
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  if (!reduce) e.target.querySelectorAll('[data-count]').forEach(countUp);
  io.unobserve(e.target);
}), { threshold: .15 });
document.querySelectorAll('.reveal, #timeline').forEach(el => io.observe(el));

// Gentle 3D tilt on project cards (desktop pointers only)
if (!reduce && matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
  // Photo parallax in hero
  const photo = document.querySelector('#heroPhoto img');
  addEventListener('scroll', () => {
    if (scrollY < innerHeight && document.body.classList.contains('loaded')) photo.style.transform = `translateX(-50%) translateY(${scrollY * .12}px)`;
  }, { passive: true });
}

document.getElementById('year').textContent = new Date().getFullYear();
