/* Yazeed Elias — light WebGL scenes (three.js r160)
   Hero: glossy 3D objects orbiting the portrait (emerald glass, gold metal, white ceramic).
   Contact: soft particle wave. Rendering pauses off-screen. */
import * as THREE from 'three';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = window.matchMedia('(max-width: 760px)').matches;
const hasGL = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (!hasGL) throw new Error('WebGL unavailable — static fallback');

function renderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.05;
  return r;
}
function runWhenVisible(el, frame) {
  let visible = false, raf = 0;
  const loop = () => { if (!visible) return; frame(); raf = requestAnimationFrame(loop); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; cancelAnimationFrame(raf); if (visible) loop(); }).observe(el);
}

/* ================= HERO ================= */
(() => {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const host = canvas.parentElement;
  const R = renderer(canvas);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  cam.position.set(0, 0, 14);
  const pm = new THREE.PMREMGenerator(R);
  scene.environment = pm.fromScene(new RoomEnvironment(R), 0.04).texture;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe8e2d0, 0.8));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(4, 6, 8); scene.add(sun);

  const gold = new THREE.MeshPhysicalMaterial({ color: 0xd9b45f, metalness: 1, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 });
  const emerald = new THREE.MeshPhysicalMaterial({ color: 0x14845a, metalness: 0.1, roughness: 0.08, transmission: 0.55, thickness: 1.5, ior: 1.45, clearcoat: 1 });
  const ceramic = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1, sheen: 0.4 });
  const deep = new THREE.MeshPhysicalMaterial({ color: 0x0f5c3f, metalness: 0.3, roughness: 0.2, clearcoat: 1 });

  const world = new THREE.Group(); scene.add(world);

  // halo ring behind the head
  const halo = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.07, 32, 200), gold);
  halo.position.set(0, 2.55, -1.6); halo.rotation.x = 1.25; world.add(halo);
  const halo2 = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.025, 16, 200), gold);
  halo2.position.copy(halo.position); halo2.rotation.set(1.1, 0.35, 0); world.add(halo2);

  // floating objects [geometry, material, x, y, z, scale]
  const G = {
    sphere: new THREE.SphereGeometry(1, 48, 48),
    torus: new THREE.TorusGeometry(0.8, 0.32, 32, 80),
    capsule: new THREE.CapsuleGeometry(0.45, 0.9, 12, 32),
    ico: new THREE.IcosahedronGeometry(1, 0),
    cone: new THREE.ConeGeometry(0.8, 1.3, 48),
    box: new THREE.BoxGeometry(1, 1, 1, 4, 4, 4)
  };
  const items = mobile ? [
    ['sphere', gold, -3.3, 3.2, 0, .42], ['torus', emerald, 3.4, 1.6, 0, .6], ['ico', deep, -3.4, -2.4, 0.5, .5], ['capsule', ceramic, 3.3, -3.0, 0, .6]
  ] : [
    ['sphere', gold, -4.4, 3.6, 0.5, .5], ['torus', emerald, 4.6, 2.2, 0, .8], ['capsule', ceramic, 4.9, -2.6, 0.5, .75],
    ['ico', deep, -4.8, -1.4, 1, .62], ['sphere', ceramic, -3.2, -4.4, -.5, .38], ['cone', gold, 3.0, -5.0, -1, .45],
    ['box', emerald, -2.4, 5.4, -2, .45], ['sphere', emerald, 2.4, 5.6, -2, .3]
  ];
  const floaters = items.map(([g, m, x, y, z, s]) => {
    const mesh = new THREE.Mesh(G[g], m);
    mesh.position.set(x, y, z); mesh.scale.setScalar(s);
    mesh.userData = { y, x, ph: Math.random() * 6.28, rx: .2 + Math.random() * .4, ry: .2 + Math.random() * .4 };
    world.add(mesh); return mesh;
  });

  // soft contact shadow under the arch
  const shadowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(10,61,42,.35)'); gr.addColorStop(1, 'rgba(10,61,42,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
  })();
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.6), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  shadow.position.set(0, -5.9, -1); world.add(shadow);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    // fit world to visible height
    const visH = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.position.z;
    world.scale.setScalar(visH / 15);
  }
  window.addEventListener('resize', resize); window.addEventListener('load', resize); resize();

  const m = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => { m.tx = e.clientX / innerWidth * 2 - 1; m.ty = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  const clock = new THREE.Clock();
  runWhenVisible(host, () => {
    const t = clock.getElapsedTime() * (reduce ? .15 : 1);
    m.x += (m.tx - m.x) * .05; m.y += (m.ty - m.y) * .05;
    const sc = Math.min(scrollY / innerHeight, 1);
    world.rotation.y = m.x * .18; world.rotation.x = m.y * .1;
    halo.rotation.z = t * .4; halo2.rotation.z = -t * .25;
    floaters.forEach((f) => {
      const u = f.userData;
      f.position.y = u.y + Math.sin(t * .8 + u.ph) * .3 + sc * 1.5 * Math.sign(u.y);
      f.position.x = u.x * (1 + sc * .25);
      f.rotation.x = t * u.rx + u.ph; f.rotation.y = t * u.ry;
    });
    R.render(scene, cam);
  });
  document.documentElement.classList.add('webgl');
})();

/* ================= CONTACT ================= */
(() => {
  const canvas = document.getElementById('contact-canvas');
  if (!canvas) return;
  const host = canvas.parentElement;
  const R = renderer(canvas);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(55, 1, .1, 100);
  cam.position.set(0, 4, 10); cam.lookAt(0, -1, 0);
  R.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const C = mobile ? 60 : 110, W = mobile ? 30 : 46, gap = .34, N = C * W;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < C; i++) for (let j = 0; j < W; j++) { const k = (i * W + j) * 3; pos[k] = (i - C / 2) * gap; pos[k + 2] = (j - W / 2) * gap; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dot = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'); const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c); })();
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uMap: { value: dot }, uSize: { value: (mobile ? 34 : 46) * R.getPixelRatio() } },
    vertexShader: `uniform float uTime; uniform float uSize; varying float vA;
      void main(){ vec3 p = position;
        p.y = sin(p.x * .5 + uTime) * .5 + cos(p.z * .68 + uTime * .8) * .5;
        vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * (1. / -mv.z); vA = .45 + p.y * .35; }`,
    fragmentShader: `uniform sampler2D uMap; varying float vA;
      void main(){ vec4 t = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(vec3(.953,.875,.659), t.a * vA); }`
  });
  const pts = new THREE.Points(geo, mat);
  pts.position.y = -3; scene.add(pts);
  const resize = () => { const w = host.clientWidth, h = host.clientHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  window.addEventListener('resize', resize); resize();
  const clock = new THREE.Clock();
  runWhenVisible(host, () => {
    const t = clock.getElapsedTime() * (reduce ? .15 : 1);
    mat.uniforms.uTime.value = t;
    R.render(scene, cam);
  });
})();
