/* Yazeed Elias — WebGL scenes (three.js r160)
   Hero: gold crystals, orbit rings around the portrait, star dust, mouse/scroll parallax.
   Contact: flowing gold particle wave. Rendering pauses when off-screen. */
import * as THREE from 'three';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = window.matchMedia('(max-width: 760px)').matches;

function supportsWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch { return false; }
}
if (!supportsWebGL()) throw new Error('WebGL not available — CSS fallback in use');

const GOLD = new THREE.Color('#d9b45f');
const GOLD_LIGHT = new THREE.Color('#f6e3a8');
const EMERALD = new THREE.Color('#1f8a62');

function makeRenderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.1;
  return r;
}

function dotTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,245,215,1)');
  grd.addColorStop(0.35, 'rgba(230,195,110,.55)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const DOT = dotTexture();

/* =============================== HERO =============================== */
(function hero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const section = canvas.parentElement;
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 12);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const key = new THREE.DirectionalLight(0xfff0d0, 2.2); key.position.set(5, 6, 8); scene.add(key);
  const rim = new THREE.PointLight(0x1f8a62, 40, 30); rim.position.set(-6, -3, 4); scene.add(rim);
  const warm = new THREE.PointLight(0xd9b45f, 30, 30); warm.position.set(6, 2, 3); scene.add(warm);

  const goldMat = new THREE.MeshPhysicalMaterial({
    color: GOLD, metalness: 1, roughness: 0.22, clearcoat: 0.6, clearcoatRoughness: 0.2, flatShading: true, envMapIntensity: 1.4
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x9fe3c4, metalness: 0, roughness: 0.05, transmission: 1, thickness: 1.2, ior: 1.5,
    transparent: true, opacity: 0.9, flatShading: true, envMapIntensity: 1.2
  });
  const emeraldMat = new THREE.MeshPhysicalMaterial({ color: EMERALD, metalness: 0.8, roughness: 0.25, flatShading: true, envMapIntensity: 1.2 });

  /* --- Orbit system around the portrait --- */
  const orbit = new THREE.Group(); scene.add(orbit);
  const ringMat = new THREE.MeshStandardMaterial({ color: GOLD_LIGHT, metalness: 1, roughness: 0.18, emissive: GOLD, emissiveIntensity: 0.15 });
  const rings = [];
  [[2.75, 0.018, 1.15, 0.2], [3.15, 0.012, -0.5, 0.9], [3.6, 0.008, 0.4, -0.6]].forEach(([R, t, rx, ry]) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(R, t, 12, 220), ringMat);
    m.rotation.set(rx, ry, 0); orbit.add(m); rings.push(m);
  });
  // satellites riding the rings
  const sats = [];
  const satGeo = new THREE.OctahedronGeometry(0.13, 0);
  rings.forEach((ring, i) => {
    for (let k = 0; k < 2; k++) {
      const s = new THREE.Mesh(satGeo, k ? emeraldMat : goldMat);
      ring.add(s); sats.push({ mesh: s, R: ring.geometry.parameters.radius, a: Math.random() * Math.PI * 2, sp: 0.25 + i * 0.12 + k * 0.05 });
    }
  });
  // wireframe halo
  const halo = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(4.3, 1)),
    new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.08 })
  );
  orbit.add(halo);

  /* --- Floating crystals across the hero --- */
  const crystals = new THREE.Group(); scene.add(crystals);
  const geos = [new THREE.IcosahedronGeometry(1, 0), new THREE.OctahedronGeometry(1, 0), new THREE.DodecahedronGeometry(1, 0), new THREE.TetrahedronGeometry(1, 0)];
  const mats = [goldMat, goldMat, glassMat, emeraldMat];
  const spots = mobile
    ? [[-3.4, 5.6, -3, .38], [3.4, -6.4, -4, .45], [-3.0, -6.8, -2, .3], [3.2, 6.2, -5, .32]]
    : [[6.2, 4.9, -3, .42], [11.8, -5.0, -6, .7], [1.0, -5.0, -3, .36], [12.6, 0.6, -9, .55], [0.6, 4.9, -6, .42], [-8.8, -4.0, -3, .4], [-0.6, -0.8, -9, .8], [-9.6, 3.8, -6, .5]];
  spots.forEach(([x, y, z, s], i) => {
    const m = new THREE.Mesh(geos[i % geos.length], mats[i % mats.length]);
    m.position.set(x, y, z); m.scale.setScalar(s);
    m.userData = { base: new THREE.Vector3(x, y, z), rs: new THREE.Vector3(Math.random() * .4 + .1, Math.random() * .4 + .1, 0), ph: Math.random() * 6.28 };
    crystals.add(m);
  });

  /* --- Star dust --- */
  const N = mobile ? 700 : 1800;
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - .5) * 34;
    pos[i * 3 + 1] = (Math.random() - .5) * 22;
    pos[i * 3 + 2] = -Math.random() * 18 + 2;
    const c = Math.random() < .78 ? GOLD_LIGHT : EMERALD;
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  dustGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    size: 0.09, map: DOT, vertexColors: true, transparent: true, opacity: .85, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
  }));
  scene.add(dust);

  /* --- Place orbit on the portrait --- */
  const portrait = document.querySelector('.portrait-3d');
  const anchor = new THREE.Vector3();
  function placeOrbit() {
    if (!portrait) return;
    const cr = canvas.getBoundingClientRect(), pr = portrait.getBoundingClientRect();
    const nx = ((pr.left + pr.width / 2 - cr.left) / cr.width) * 2 - 1;
    const ny = -(((pr.top + pr.height / 2 - cr.top) / cr.height) * 2 - 1);
    const v = new THREE.Vector3(nx, ny, 0.5).unproject(camera).sub(camera.position).normalize();
    const d = -camera.position.z / v.z;
    anchor.copy(camera.position).add(v.multiplyScalar(d));
    orbit.position.copy(anchor);
    const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const worldPerPx = visH / cr.height;
    orbit.scale.setScalar((pr.width * worldPerPx) / 5.2);
  }

  function resize() {
    const w = section.clientWidth, h = section.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    placeOrbit();
  }
  window.addEventListener('resize', resize);
  window.addEventListener('load', resize);
  resize();

  /* --- Interaction --- */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(section);

  const clock = new THREE.Clock();
  let raf = 0;
  function loop() {
    cancelAnimationFrame(raf);
    if (!visible) return;
    const t = clock.getElapsedTime();
    const sp = reduce ? 0.15 : 1;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    const scroll = Math.min(window.scrollY / window.innerHeight, 1.2);

    camera.position.x = mouse.x * 0.6;
    camera.position.y = -mouse.y * 0.4 - scroll * 1.2;
    camera.lookAt(0, -scroll * 1.2, 0);

    rings.forEach((r, i) => { r.rotation.z = t * (0.12 + i * 0.05) * sp * (i % 2 ? -1 : 1); });
    sats.forEach((s) => {
      const a = s.a + t * s.sp * sp;
      s.mesh.position.set(Math.cos(a) * s.R, Math.sin(a) * s.R, 0);
      s.mesh.rotation.x = t * 2 * sp; s.mesh.rotation.y = t * 1.6 * sp;
    });
    halo.rotation.y = t * 0.05 * sp; halo.rotation.x = t * 0.03 * sp;
    orbit.rotation.y = mouse.x * 0.25; orbit.rotation.x = mouse.y * 0.18;

    crystals.children.forEach((m) => {
      const u = m.userData;
      m.rotation.x = t * u.rs.x * sp + u.ph;
      m.rotation.y = t * u.rs.y * sp + u.ph;
      m.position.y = u.base.y + Math.sin(t * 0.6 * sp + u.ph) * 0.35 + scroll * (2 + u.base.z * -0.3);
      m.position.x = u.base.x + mouse.x * (0.3 + -u.base.z * 0.08);
    });
    dust.rotation.y = t * 0.012 * sp + mouse.x * 0.04;
    dust.position.y = scroll * 2;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }
  loop();
  document.documentElement.classList.add('webgl');
})();

/* ============================== CONTACT ============================== */
(function contact() {
  const canvas = document.getElementById('contact-canvas');
  if (!canvas) return;
  const section = canvas.parentElement;
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 4.2, 11); camera.lookAt(0, 0, 0);

  const COLS = mobile ? 70 : 130, ROWS = mobile ? 34 : 56, GAP = 0.32;
  const N = COLS * ROWS;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < COLS; i++) for (let j = 0; j < ROWS; j++) {
    const k = (i * ROWS + j) * 3;
    pos[k] = (i - COLS / 2) * GAP; pos[k + 1] = 0; pos[k + 2] = (j - ROWS / 2) * GAP;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.07, map: DOT, color: GOLD_LIGHT, transparent: true, opacity: .75, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  pts.position.y = -2.4;
  scene.add(pts);

  function resize() {
    const w = section.clientWidth, h = section.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize); resize();

  let visible = false;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(section);

  const clock = new THREE.Clock();
  let raf = 0;
  function loop() {
    cancelAnimationFrame(raf);
    if (!visible) return;
    const t = clock.getElapsedTime() * (reduce ? 0.15 : 1);
    const a = geo.attributes.position.array;
    for (let i = 0; i < COLS; i++) for (let j = 0; j < ROWS; j++) {
      const k = (i * ROWS + j) * 3;
      a[k + 1] = Math.sin(i * 0.18 + t * 1.1) * 0.45 + Math.cos(j * 0.22 + t * 0.8) * 0.45;
    }
    geo.attributes.position.needsUpdate = true;
    pts.rotation.y = Math.sin(t * 0.1) * 0.15;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }
})();
