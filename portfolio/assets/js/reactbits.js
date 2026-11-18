/*!
 * reactbits.js — vanilla ports of React Bits components (LightRays, StarBorder)
 * Source: https://github.com/DavidHDev/react-bits
 * MIT + Commons Clause License Condition v1.0 — Copyright (c) 2026 David Haz
 * Used inside this website only; not for resale or redistribution as components.
 * Ported: the body of each component's main useEffect is wrapped in mount(el, options).
 */
(function () {
'use strict';
const LightRaysNS = (() => {
const PIXEL_BUDGET = 24e5;
const MAX_PULSES = 4;
const ORIGINS = {
  "top-left": { anchor: [0, -0.2], dir: [0, 1] },
  "top-center": { anchor: [0.5, -0.2], dir: [0, 1] },
  "top-right": { anchor: [1, -0.2], dir: [0, 1] },
  left: { anchor: [-0.2, 0.5], dir: [1, 0] },
  right: { anchor: [1.2, 0.5], dir: [-1, 0] },
  "bottom-left": { anchor: [0, 1.2], dir: [0, -1] },
  "bottom-center": { anchor: [0.5, 1.2], dir: [0, -1] },
  "bottom-right": { anchor: [1, 1.2], dir: [0, -1] }
};
const VERTEX = `#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`;
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uScale;
uniform float uTime;
uniform vec2 uSource;
uniform vec2 uAim;
uniform float uReach;
uniform vec3 uColor;
uniform float uSpread;
uniform float uLength;
uniform float uFade;
uniform float uSaturation;
uniform float uPulsating;
uniform float uNoise;
uniform float uDistortion;
uniform float uDensity;
uniform float uSharpness;
uniform float uGlow;
uniform float uHaze;
uniform float uAtmosphere;
uniform float uIntensity;
uniform vec4 uShadow;
uniform vec4 uPulses[${MAX_PULSES}];
uniform vec2 uIntro;
uniform float uLight;
uniform float uOpacity;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 w = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), w.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), w.x), w.y);
}

float shape(float strength, float width) {
  float edge = max(mix(0.5, 0.08, uSharpness), width);
  return mix(strength, smoothstep(0.62 - edge, 0.62 + edge, strength), uSharpness);
}

void main() {
  vec2 coord = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uScale;
  vec2 delta = coord - uSource;
  float distance = length(delta);
  vec2 dir = delta / max(distance, 1e-4);
  float cosAngle = dot(dir, uAim);
  float angle = cosAngle + uDistortion * sin(uTime * 2.0 + distance * 0.02) * 0.2;
  float slope = fwidth(angle);
  float depth = distance / uReach;

  float source = exp(-depth * depth * 9.0) * 0.9 + exp(-depth * 3.2) * 0.25;
  float glowLight = uGlow * source * smoothstep(-0.2, 0.6, cosAngle);
  float spread = pow(max(angle, 0.0), 1.0 / uSpread);
  float lengthFalloff = clamp(1.0 - distance / (uReach * uLength), 0.0, 1.0);
  float fadeFalloff = clamp(1.0 - distance / (uReach * uFade), 0.5, 1.0);
  float envelope = spread * lengthFalloff * fadeFalloff;
  float reveal = uIntensity * uIntro.y * (1.0 - smoothstep(uIntro.x - 0.35, uIntro.x, depth));
  if ((envelope * 1.6 + glowLight) * reveal < 0.0015) {
    fragColor = vec4(0.0);
    return;
  }

  float phaseA = angle * 36.2214 * uDensity + uTime * 1.5;
  float phaseB = -angle * 21.11349 * uDensity + uTime * 1.5;
  float phaseC = angle * 22.3991 * uDensity + uTime * 1.1;
  float phaseD = -angle * 18.0234 * uDensity + uTime * 1.1;
  float strengthA = clamp(0.75 + 0.15 * sin(phaseA) + 0.2 * cos(phaseB), 0.0, 1.0);
  float strengthB = clamp(0.75 + 0.15 * sin(phaseC) + 0.2 * cos(phaseD), 0.0, 1.0);
  float widthA = abs(0.15 * 36.2214 * cos(phaseA) + 0.2 * 21.11349 * sin(phaseB)) * uDensity * slope;
  float widthB = abs(0.15 * 22.3991 * cos(phaseC) + 0.2 * 18.0234 * sin(phaseD)) * uDensity * slope;
  float pulseA = uPulsating > 0.5 ? 0.8 + 0.2 * sin(uTime * 4.5) : 1.0;
  float pulseB = uPulsating > 0.5 ? 0.8 + 0.2 * sin(uTime * 3.3) : 1.0;
  float rayLight = envelope * (0.5 * shape(strengthA, widthA) * pulseA + 0.4 * shape(strengthB, widthB) * pulseB);

  if (uHaze > 0.0) {
    float around = atan(uAim.x * dir.y - uAim.y * dir.x, cosAngle);
    vec2 drift = vec2(around * 2.2 + uTime * 0.035, depth * 2.6 - uTime * 0.11);
    float fog = 0.65 * valueNoise(drift * vec2(3.0, 1.0)) + 0.35 * valueNoise(drift * vec2(7.0, 2.3) + 4.1);
    rayLight *= mix(1.0, 0.25 + 1.2 * fog, uHaze);
  }

  if (uShadow.z > 0.0) {
    vec2 toCursor = uShadow.xy - uSource;
    float cursorDistance = length(toCursor);
    float along = dot(delta, toCursor) / max(cursorDistance * cursorDistance, 1e-4);
    float side = abs(delta.x * toCursor.y - delta.y * toCursor.x) / max(cursorDistance, 1e-4);
    float trail = max(along - 1.0, 0.0);
    float width = uShadow.w * along + 0.22 * trail * cursorDistance;
    float behind = smoothstep(0.97, 1.25, along) * exp(-trail * 1.1);
    float shade = (1.0 - smoothstep(width * 0.3, width * 1.6, side)) * behind;
    rayLight *= 1.0 - uShadow.z * 0.62 * shade;
  }

  float boost = 0.0;
  for (int i = 0; i < ${MAX_PULSES}; i++) {
    vec4 wave = uPulses[i];
    if (wave.z <= 0.0) continue;
    float x = (depth - wave.x) / wave.y;
    boost += wave.z * exp(-x * x);
  }
  float light = (rayLight * (1.0 + boost) + glowLight) * reveal;

  if (uNoise > 0.0) {
    float n = fract(sin(dot(coord * 0.02 + uTime * 0.1, vec2(12.9898, 78.233))) * 43758.5453123);
    light *= 1.0 - uNoise + uNoise * n;
  }

  float near = clamp(1.2 - distance / (uResolution.y / uScale), 0.0, 1.0);
  vec3 tint = mix(vec3(0.9), vec3(0.1, 0.3, 0.5) + near * vec3(0.8, 0.6, 0.5), uAtmosphere);
  float gray = dot(tint, vec3(0.299, 0.587, 0.114));
  vec3 hue = max(mix(vec3(gray), tint, uSaturation), 0.0) * uColor;

  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
  if (uLight > 0.5) {
    vec3 color = hue * light;
    float energy = max(color.r, max(color.g, color.b));
    vec3 tone = clamp(1.0 - (1.0 - hue / max(max(hue.r, max(hue.g, hue.b)), 1e-4)) * 1.8, 0.0, 1.0);
    float warm = clamp((min(tone.r, tone.g) - tone.b) * 2.0, 0.0, 1.0);
    vec3 ink = tone * (mix(0.66, 0.94, warm) - 0.1 * smoothstep(0.4, 1.2, energy));
    float density = clamp(0.82 * (1.0 - exp(-1.5 * energy * energy)) * uOpacity + grain, 0.0, 1.0);
    fragColor = vec4(ink * density, density);
    return;
  }
  float level = light < 0.75 ? light : 0.75 + 0.25 * (1.0 - exp(-(light - 0.75) / 0.25));
  float top = max(hue.r, max(hue.g, hue.b));
  hue = mix(hue, vec3(top), smoothstep(0.8, 1.0, level) * 0.45);
  vec3 shown = clamp(hue * level, 0.0, 1.0) * level;
  fragColor = vec4(clamp(shown + grain, 0.0, level) * uOpacity, level * uOpacity);
}`;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const parseColor = (value) => {
  const text = String(value || "").trim();
  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
  if (hex) {
    const full = hex[1].length === 3 ? hex[1].replace(/./g, (digit) => digit + digit) : hex[1];
    return [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16) / 255);
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(text);
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map((channel) => clamp(parseFloat(channel) / 255, 0, 1));
  return null;
};
const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};
const link = (gl) => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = vertex && fragment ? gl.createProgram() : null;
  if (!vertex || !fragment || !program) {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  const uniforms = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let index = 0; index < count; index++) {
    const info = gl.getActiveUniform(program, index);
    if (info) uniforms[info.name.replace(/\[0\]$/, "")] = gl.getUniformLocation(program, info.name);
  }
  return { program, uniforms };
};
const smoother = (t) => {
  const x = clamp(t, 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

  function mountLightRays(container, options) {
    const o = Object.assign({
    raysOrigin: "top-center",
    raysColor: "#ffffff",
    raysSpeed: 1,
    lightSpread: 0.5,
    rayLength: 3,
    rayDensity: 1,
    tilt: 0,
    raySharpness: 0.35,
    glow: 0.6,
    haze: 0.25,
    atmosphere: 1,
    intensity: 1,
    pulsating: false,
    fadeDistance: 1,
    saturation: 1,
    followMouse: true,
    mouseInfluence: 0.1,
    cursorShadow: true,
    clickPulse: true,
    noiseAmount: 0,
    distortion: 0,
    intro: true,
    lightMode: false,
    opacity: 1,
    maxDevicePixelRatio: 2
    }, options || {});
    const { raysOrigin, raysColor, raysSpeed, lightSpread, rayLength, rayDensity, tilt, raySharpness, glow, haze, atmosphere, intensity, pulsating, fadeDistance, saturation, followMouse, mouseInfluence, cursorShadow, clickPulse, noiseAmount, distortion, intro, lightMode, opacity, maxDevicePixelRatio } = o;
    container.classList.add('light-rays');
    const canvasEl = document.createElement('canvas');
    canvasEl.className = 'light-rays__canvas';
    canvasEl.setAttribute('aria-hidden', 'true');
    container.appendChild(canvasEl);
    const containerRef = { current: container };
    const canvasRef = { current: canvasEl };
    const wakeRef = { current: null };
    const generation = 0;
    const setGeneration = () => {};
  const settings = {
    origin: ORIGINS[raysOrigin] || ORIGINS["top-center"],
    color: parseColor(raysColor) || [1, 1, 1],
    speed: Math.max(0, raysSpeed),
    spread: Math.max(1e-3, lightSpread),
    length: Math.max(0.01, rayLength),
    density: clamp(rayDensity, 0.1, 6),
    tilt: clamp(tilt, -90, 90) * Math.PI / 180,
    sharpness: clamp(raySharpness, 0, 1),
    glow: Math.max(0, glow),
    haze: clamp(haze, 0, 1),
    atmosphere: clamp(atmosphere, 0, 1),
    intensity: Math.max(0, intensity),
    pulsating,
    fade: Math.max(0.01, fadeDistance),
    saturation: Math.max(0, saturation),
    follow: followMouse,
    influence: clamp(mouseInfluence, 0, 1),
    cursorShadow,
    clickPulse,
    noise: clamp(noiseAmount, 0, 1),
    distortion,
    intro,
    light: lightMode,
    opacity: clamp(opacity, 0, 1),
    maxRatio: clamp(maxDevicePixelRatio, 0.5, 3)
  };
    const settingsRef = { current: settings };
    const run = () => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance"
    });
    const shader = gl ? link(gl) : null;
    if (!gl || !shader) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const vao = gl.createVertexArray();
    const size = { width: 1, height: 1, ratio: 1 };
    const pointer = { x: 0.5, y: 0.5, inside: false, seen: false };
    const aim = { x: 0.5, y: 0.5 };
    const shade = { x: 0.5, y: 0.5, presence: 0 };
    const pulses = [];
    const pulseData = new Float32Array(MAX_PULSES * 4);
    let time = 0;
    let opening = settingsRef.current.intro && !reduced && generation === 0 ? 0 : 1;
    let raf = 0;
    let last = 0;
    let visible = true;
    let pageVisible = document.visibilityState !== "hidden";
    let lost = false;
    let resizePending = false;
    const applyResize = () => {
      const s = settingsRef.current;
      const rect = container.getBoundingClientRect();
      const cssWidth = Math.max(1, rect.width);
      const cssHeight = Math.max(1, rect.height);
      const detail = s.density * (0.35 + 0.65 * s.sharpness);
      const sampling = Math.max(clamp(0.35 + 0.3 * detail, 0.5, 2), s.noise > 0 ? 1 : 0);
      const ratio = Math.min(
        window.devicePixelRatio || 1,
        s.maxRatio,
        sampling,
        Math.sqrt(PIXEL_BUDGET / (cssWidth * cssHeight))
      );
      const width = Math.max(1, Math.round(cssWidth * ratio));
      const height = Math.max(1, Math.round(cssHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      size.width = cssWidth;
      size.height = cssHeight;
      size.ratio = width / cssWidth;
    };
    const resize = () => {
      resizePending = true;
      wake();
    };
    const frame = (now) => {
      raf = 0;
      if (resizePending) {
        resizePending = false;
        applyResize();
      }
      if (lost) return;
      const s = settingsRef.current;
      const dt = clamp((now - last) / 1e3 || 0, 0, 0.05);
      last = Math.max(last, now);
      time += dt * s.speed * (reduced ? 0.35 : 1);
      if (opening < 1) opening = Math.min(1, opening + dt / 1.8);
      const steer = 1 - Math.exp(-dt / 0.2);
      const aimX = s.follow && pointer.seen ? pointer.x : 0.5;
      const aimY = s.follow && pointer.seen ? pointer.y : 0.5;
      aim.x += (aimX - aim.x) * steer;
      aim.y += (aimY - aim.y) * steer;
      const glide = 1 - Math.exp(-dt / 0.08);
      shade.x += (pointer.x - shade.x) * glide;
      shade.y += (pointer.y - shade.y) * glide;
      const shading = pointer.inside && s.cursorShadow && !reduced;
      shade.presence += ((shading ? 1 : 0) - shade.presence) * (1 - Math.exp(-dt / (shading ? 0.25 : 0.5)));
      for (let index = pulses.length - 1; index >= 0; index--) {
        pulses[index].age += dt;
        if (pulses[index].age >= 2) pulses.splice(index, 1);
      }
      pulseData.fill(0);
      pulses.forEach((pulse, index) => {
        const t = pulse.age;
        pulseData[index * 4] = 0.05 + t * 1.05;
        pulseData[index * 4 + 1] = 0.14 + t * 0.14;
        pulseData[index * 4 + 2] = 0.9 * smoother(t / 0.15) * (1 - smoother(t / 2));
      });
      const width = size.width;
      const height = size.height;
      const sourceX = s.origin.anchor[0] * width;
      const sourceY = s.origin.anchor[1] * height;
      const cos = Math.cos(s.tilt);
      const sin = Math.sin(s.tilt);
      let dirX = s.origin.dir[0] * cos - s.origin.dir[1] * sin;
      let dirY = s.origin.dir[0] * sin + s.origin.dir[1] * cos;
      if (s.follow && s.influence > 0) {
        const mx = aim.x * width - sourceX;
        const my = aim.y * height - sourceY;
        const ml = Math.hypot(mx, my) || 1;
        const bx = dirX + (mx / ml - dirX) * s.influence;
        const by = dirY + (my / ml - dirY) * s.influence;
        const bl = Math.hypot(bx, by) || 1;
        dirX = bx / bl;
        dirY = by / bl;
      }
      const eased = 1 - Math.pow(1 - opening, 3);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(shader.program);
      gl.bindVertexArray(vao);
      const u = shader.uniforms;
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);
      gl.uniform1f(u.uScale, size.ratio);
      gl.uniform1f(u.uTime, time);
      gl.uniform2f(u.uSource, sourceX, sourceY);
      gl.uniform2f(u.uAim, dirX, dirY);
      gl.uniform1f(u.uReach, Math.max(width, height));
      gl.uniform3f(u.uColor, s.color[0], s.color[1], s.color[2]);
      gl.uniform1f(u.uSpread, s.spread);
      gl.uniform1f(u.uLength, s.length);
      gl.uniform1f(u.uFade, s.fade);
      gl.uniform1f(u.uSaturation, s.saturation);
      gl.uniform1f(u.uPulsating, s.pulsating ? 1 : 0);
      gl.uniform1f(u.uNoise, s.noise);
      gl.uniform1f(u.uDistortion, s.distortion);
      gl.uniform1f(u.uDensity, s.density);
      gl.uniform1f(u.uSharpness, s.sharpness);
      gl.uniform1f(u.uGlow, s.glow);
      gl.uniform1f(u.uHaze, s.haze);
      gl.uniform1f(u.uAtmosphere, s.atmosphere);
      gl.uniform1f(u.uIntensity, s.intensity);
      gl.uniform4f(u.uShadow, shade.x * width, shade.y * height, shade.presence, 16);
      gl.uniform4fv(u.uPulses, pulseData);
      gl.uniform2f(u.uIntro, eased * 2.6, smoother(opening / 0.5));
      gl.uniform1f(u.uLight, s.light ? 1 : 0);
      gl.uniform1f(u.uOpacity, s.opacity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      const settling = Math.abs(aim.x - aimX) > 1e-4 || Math.abs(aim.y - aimY) > 1e-4 || shade.presence > 1e-3 && Math.abs(shade.x - pointer.x) + Math.abs(shade.y - pointer.y) > 1e-4 || Math.abs((shading ? 1 : 0) - shade.presence) > 1e-3 || pulses.length > 0;
      const busy = s.speed > 0 || opening < 1 || settling;
      if (busy && visible && pageVisible) raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (raf || lost || !visible || !pageVisible) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    wakeRef.current = () => {
      resize();
      wake();
    };
    const locate = (event) => {
      const rect = container.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) / Math.max(1, rect.width),
        y: (event.clientY - rect.top) / Math.max(1, rect.height),
        inside: event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom
      };
    };
    const onPointerMove = (event) => {
      const spot = locate(event);
      if (!pointer.inside && spot.inside) {
        shade.x = spot.x;
        shade.y = spot.y;
      }
      pointer.x = spot.x;
      pointer.y = spot.y;
      pointer.inside = spot.inside;
      pointer.seen = true;
      wake();
    };
    const onPointerDown = (event) => {
      const s = settingsRef.current;
      const spot = locate(event);
      if (!spot.inside || !s.clickPulse || reduced) return;
      pulses.push({ age: 0 });
      if (pulses.length > MAX_PULSES) pulses.shift();
      wake();
    };
    const onLeave = () => {
      pointer.inside = false;
      wake();
    };
    const onPointerUp = (event) => {
      if (event.pointerType !== "mouse") onLeave();
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    const onLost = (event) => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onRestored = () => setGeneration((value) => value + 1);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    const resizeObserver = new ResizeObserver(() => {
      resize();
      wake();
    });
    resizeObserver.observe(container);
    const intersection = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      wake();
    });
    intersection.observe(container);
    const onVisibility = () => {
      pageVisible = document.visibilityState !== "hidden";
      wake();
    };
    document.addEventListener("visibilitychange", onVisibility);
    resize();
    wake();
      return () => {
      cancelAnimationFrame(raf);
      wakeRef.current = null;
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      if (!gl.isContextLost()) {
        gl.deleteVertexArray(vao);
        gl.deleteProgram(shader.program);
      }
    };
    };
    const destroy = run();
    return { destroy: destroy || (() => {}), wake: () => wakeRef.current && wakeRef.current() };
  }
  return { mount: mountLightRays };
})();
const StarBorderNS = (() => {
const THEMES = {
  dark: {
    surface: "#0c0c0f",
    text: "#fafafa",
    track: "rgba(255, 255, 255, 0.1)",
    light: "#ffffff"
  },
  light: {
    surface: "#ffffff",
    text: "#18181b",
    track: "rgba(24, 24, 27, 0.12)",
    light: "#18181b"
  }
};
const HOVERS = ["lap", "brighten", "reveal", "none"];
const BLEED = 48;
const LAP = 0.9;
const TAU = Math.PI * 2;
const WHITE = [255, 255, 255];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const wrap = (value, total) => (value % total + total) % total;
const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - (2 - 2 * t) ** 3 / 2;
const mix = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t
];
const rgba = (rgb, alpha) => `rgba(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])}, ${clamp(alpha, 0, 1).toFixed(3)})`;
let colorContext = null;
const toRgb = (color) => {
  colorContext = colorContext ?? document.createElement("canvas").getContext("2d");
  if (!colorContext) return WHITE;
  colorContext.fillStyle = "#000000";
  colorContext.fillStyle = color;
  const value = String(colorContext.fillStyle);
  if (value.startsWith("#")) {
    const hex = parseInt(value.slice(1, 7), 16);
    return [hex >> 16 & 255, hex >> 8 & 255, hex & 255];
  }
  const parts = value.match(/[\d.]+/g)?.map(Number) ?? WHITE;
  return [parts[0], parts[1], parts[2]];
};
const outline = (width, height, radius) => {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  const arc = Math.PI * r / 2;
  const across = Math.max(0, width - 2 * r);
  const down = Math.max(0, height - 2 * r);
  const segments = [
    { length: across, x: r, y: 0, dx: 1, dy: 0, angle: null },
    { length: arc, x: width - r, y: r, dx: 0, dy: 0, angle: -Math.PI / 2 },
    { length: down, x: width, y: r, dx: 0, dy: 1, angle: null },
    { length: arc, x: width - r, y: height - r, dx: 0, dy: 0, angle: 0 },
    { length: across, x: width - r, y: height, dx: -1, dy: 0, angle: null },
    { length: arc, x: r, y: height - r, dx: 0, dy: 0, angle: Math.PI / 2 },
    { length: down, x: 0, y: height - r, dx: 0, dy: -1, angle: null },
    { length: arc, x: r, y: r, dx: 0, dy: 0, angle: Math.PI }
  ];
  return {
    r,
    segments,
    total: Math.max(
      1,
      segments.reduce((sum, segment) => sum + segment.length, 0)
    )
  };
};
const pointAt = (shape, distance, point) => {
  let s = wrap(distance, shape.total);
  for (const segment of shape.segments) {
    if (segment.length > 0 && s <= segment.length) {
      if (segment.angle === null) {
        point.x = segment.x + segment.dx * s;
        point.y = segment.y + segment.dy * s;
        point.nx = segment.dy;
        point.ny = -segment.dx;
      } else {
        const angle = segment.angle + s / shape.r;
        point.nx = Math.cos(angle);
        point.ny = Math.sin(angle);
        point.x = segment.x + point.nx * shape.r;
        point.y = segment.y + point.ny * shape.r;
      }
      return point;
    }
    s -= segment.length;
  }
  return point;
};
const project = (shape, px, py) => {
  let best = Infinity;
  let found = 0;
  let offset = 0;
  shape.segments.forEach((segment) => {
    if (segment.length > 0) {
      let s = 0;
      let x = 0;
      let y = 0;
      if (segment.angle === null) {
        s = clamp((px - segment.x) * segment.dx + (py - segment.y) * segment.dy, 0, segment.length);
        x = segment.x + segment.dx * s;
        y = segment.y + segment.dy * s;
      } else {
        let angle = wrap(Math.atan2(py - segment.y, px - segment.x) - segment.angle, TAU);
        if (angle > Math.PI / 2) angle = angle > Math.PI * 1.25 ? 0 : Math.PI / 2;
        s = angle * shape.r;
        x = segment.x + Math.cos(segment.angle + angle) * shape.r;
        y = segment.y + Math.sin(segment.angle + angle) * shape.r;
      }
      const distance = (px - x) ** 2 + (py - y) ** 2;
      if (distance < best) {
        best = distance;
        found = offset + s;
      }
    }
    offset += segment.length;
  });
  return found;
};

  function mountStarBorder(root, options) {
    const o = Object.assign({ theme: 'dark',
    duration: 4,
    thickness: 1,
    radius: 12,
    trailLength: 0.3,
    stars: 1,
    glow: 0.6,
    sparkle: false,
    direction: "clockwise",
    hover: "lap",
    clickPulse: true
    }, options || {});
    const { color, trailColor, duration, thickness, radius, trailLength, stars, glow, sparkle, direction, hover, clickPulse, theme, backgroundColor, textColor, borderColor } = o;
    const palette = THEMES[theme] ?? THEMES.dark;
    const light = color ?? palette.light;
  const settings = {
    light: theme === "light",
    color: light,
    trailColor: trailColor ?? light,
    duration: Math.max(0.3, duration),
    thickness: Math.max(0.5, thickness),
    radius: Math.max(0, radius),
    trailLength: clamp(trailLength, 0, 1),
    stars: clamp(Math.round(stars), 1, 6),
    glow: clamp(glow, 0, 1),
    sparkle,
    direction: direction === "counterclockwise" ? -1 : 1,
    hover: HOVERS.includes(hover) ? hover : "lap",
    clickPulse
  };
    const settingsRef = { current: settings };
    root.classList.add('star-border');
    root.style.setProperty('--star-border-radius', settings.radius + 'px');
    root.style.setProperty('--star-border-thickness', settings.thickness + 'px');
    if (borderColor) root.style.setProperty('--star-border-track', borderColor);
    const canvasEl = document.createElement('canvas');
    canvasEl.className = 'star-border__light';
    canvasEl.setAttribute('aria-hidden', 'true');
    root.insertBefore(canvasEl, root.firstChild);
    const rootRef = { current: root };
    const canvasRef = { current: canvasEl };
    const wakeRef = { current: null };
    const run = () => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !ctx) return void 0;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const point = { x: 0, y: 0, nx: 0, ny: -1 };
    const state = {
      width: 0,
      height: 0,
      dpr: 1,
      phase: 0,
      velocity: 0,
      motion: 0,
      lap: -1,
      time: 0,
      reveal: 0,
      boost: 0,
      flash: 0,
      emit: 0,
      hovered: false,
      focused: false,
      pointerX: 0,
      pointerY: 0,
      visible: true
    };
    const pulses = [];
    const dust = [];
    const colors = { key: "", head: WHITE, tail: WHITE };
    let raf = 0;
    let last = performance.now();
    let alive = true;
    let resizePending = false;
    const applyMeasure = () => {
      state.width = root.offsetWidth;
      state.height = root.offsetHeight;
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round((state.width + BLEED * 2) * state.dpr));
      canvas.height = Math.max(1, Math.round((state.height + BLEED * 2) * state.dpr));
    };
    const measure = () => {
      resizePending = true;
      wake();
    };
    const local = (event) => {
      const rect = root.getBoundingClientRect();
      const scaleX = rect.width ? state.width / rect.width : 1;
      const scaleY = rect.height ? state.height / rect.height : 1;
      return [(event.clientX - rect.left) * scaleX, (event.clientY - rect.top) * scaleY];
    };
    const shapeFor = (s) => outline(
      Math.max(1, state.width - s.thickness),
      Math.max(1, state.height - s.thickness),
      s.radius - s.thickness / 2
    );
    const stroke = (x1, y1, x2, y2, width, style2) => {
      ctx.lineWidth = width;
      ctx.strokeStyle = style2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };
    const drawTrail = (s, shape, head, length, sign, intensity, tip = true) => {
      if (length < 0.5 || intensity <= 0) return;
      const steps = clamp(Math.ceil(length / 2), 2, 90);
      pointAt(shape, head, point);
      let px = point.x;
      let py = point.y;
      for (let i = 1; i <= steps; i++) {
        pointAt(shape, head - sign * length * (i / steps), point);
        const u = 1 - (i - 0.5) / steps;
        const fade = u * u * intensity;
        let tone = mix(colors.tail, colors.head, u);
        if (!s.light) tone = mix(tone, WHITE, u ** 6 * 0.65);
        ctx.lineCap = tip && i === 1 ? "round" : "butt";
        stroke(px, py, point.x, point.y, 2 + 6 * s.glow, rgba(tone, fade * (s.light ? 0.1 : 0.2) * s.glow));
        stroke(px, py, point.x, point.y, s.thickness, rgba(tone, fade));
        px = point.x;
        py = point.y;
      }
    };
    const drawHead = (s, x, y, intensity, twinkle) => {
      if (intensity <= 0) return;
      const tone = colors.head;
      const reach = (12 + 40 * s.glow) * (s.light ? 0.6 : 1);
      const bloom = ctx.createRadialGradient(x, y, 0, x, y, reach);
      const strength = (s.light ? 0.08 : 0.4) * s.glow * intensity;
      bloom.addColorStop(0, rgba(tone, strength));
      bloom.addColorStop(0.2, rgba(tone, strength * 0.4));
      bloom.addColorStop(0.5, rgba(tone, strength * 0.1));
      bloom.addColorStop(1, rgba(tone, 0));
      ctx.fillStyle = bloom;
      ctx.fillRect(x - reach, y - reach, reach * 2, reach * 2);
      if (!s.sparkle) return;
      const size = (1 + s.thickness * 0.6) * (s.light ? 0.85 : 1);
      const core = ctx.createRadialGradient(x, y, 0, x, y, size * 2.2);
      core.addColorStop(0, rgba(s.light ? tone : WHITE, intensity));
      core.addColorStop(s.light ? 0.3 : 0.4, rgba(s.light ? tone : mix(tone, WHITE, 0.5), intensity * 0.9));
      core.addColorStop(s.light ? 0.55 : 1, rgba(tone, s.light ? intensity * 0.12 : 0));
      core.addColorStop(1, rgba(tone, 0));
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(x, y, size * 2.2, 0, TAU);
      ctx.fill();
      const spike = (3 + 4 * s.glow + s.thickness * 1.5) * twinkle;
      const center = s.light ? tone : WHITE;
      const horizontal = ctx.createLinearGradient(x - spike, y, x + spike, y);
      horizontal.addColorStop(0, rgba(tone, 0));
      horizontal.addColorStop(0.5, rgba(center, intensity * 0.95));
      horizontal.addColorStop(1, rgba(tone, 0));
      stroke(x - spike, y, x + spike, y, s.light ? 0.75 : 1, horizontal);
      const vertical = ctx.createLinearGradient(x, y - spike, x, y + spike);
      vertical.addColorStop(0, rgba(tone, 0));
      vertical.addColorStop(0.5, rgba(center, intensity * 0.95));
      vertical.addColorStop(1, rgba(tone, 0));
      stroke(x, y - spike, x, y + spike, s.light ? 0.75 : 1, vertical);
    };
    const spawnDust = (x, y, nx, ny, speed) => {
      if (dust.length > 48) return;
      const push = 3 + Math.random() * 10;
      const drift = (Math.random() - 0.5) * 8;
      dust.push({
        x: x + nx * (Math.random() * 3 - 1),
        y: y + ny * (Math.random() * 3 - 1),
        vx: nx * push - ny * drift - speed * -ny * 0.04,
        vy: ny * push + nx * drift - speed * nx * 0.04,
        age: 0,
        life: 0.35 + Math.random() * 0.5,
        size: 0.45 + Math.random() * 0.7,
        seed: Math.random() * TAU
      });
    };
    const draw = (base, shape) => {
      const s = state.boost > 1e-3 ? { ...base, glow: Math.min(1.5, base.glow + 0.4 * state.boost) } : base;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (state.width < 2 || state.height < 2) return;
      const offset = (BLEED + s.thickness / 2) * state.dpr;
      ctx.setTransform(state.dpr, 0, 0, state.dpr, offset, offset);
      ctx.globalCompositeOperation = s.light ? "source-over" : "lighter";
      ctx.lineCap = "butt";
      const total = shape.total;
      const spacing = total / s.stars;
      const speed = Math.abs(state.motion);
      const sign = state.motion >= 0 ? 1 : -1;
      const span = s.trailLength * s.duration;
      const length = Math.min(speed * span, spacing * 0.92, total * 0.6);
      const intensity = state.reveal * (1 + 0.4 * state.boost + 0.6 * state.flash);
      const ring = state.flash * (s.light ? 0.18 : 0.32) + state.boost * state.reveal * (s.light ? 0.07 : 0.12);
      if (ring > 5e-3) {
        ctx.lineWidth = s.thickness + 2 * s.glow;
        ctx.strokeStyle = rgba(colors.head, ring);
        ctx.beginPath();
        ctx.roundRect(
          0,
          0,
          Math.max(1, state.width - s.thickness),
          Math.max(1, state.height - s.thickness),
          Math.max(0, shape.r)
        );
        ctx.stroke();
      }
      const still = clamp(1 - speed / Math.max(1, total / s.duration * 0.6), 0, 1) * Math.min(1, intensity);
      const rest2 = (10 + 14 * s.glow + s.thickness * 2) * still;
      for (let i = 0; i < s.stars; i++) {
        const head = state.phase + i * spacing;
        drawTrail(s, shape, head, length, sign, Math.min(1, intensity));
        if (still > 0.01) {
          drawTrail(s, shape, head, rest2, 1, still, false);
          drawTrail(s, shape, head, rest2, -1, still, false);
        }
      }
      pulses.forEach((pulse2) => {
        const progress = pulse2.age / 0.65;
        const fade = (1 - progress) ** 2;
        const travel = total / 2 * (1 - (1 - Math.min(1, pulse2.age / 0.5)) ** 2);
        const tail = Math.min(travel, total * 0.16);
        [1, -1].forEach((way) => {
          const front = pulse2.origin + way * travel;
          drawTrail(s, shape, front, tail, way, fade);
          pointAt(shape, front, point);
          drawHead(s, point.x, point.y, fade * 0.8, 0.8);
        });
      });
      for (let i = 0; i < s.stars; i++) {
        pointAt(shape, state.phase + i * spacing, point);
        const twinkle = 0.82 + 0.18 * Math.sin(state.time * 6.1 + i * 2.3) * Math.sin(state.time * 2.7 + i);
        drawHead(s, point.x, point.y, Math.min(1.3, intensity), twinkle);
      }
      dust.forEach((mote) => {
        const left = 1 - mote.age / mote.life;
        const shimmer = 0.45 + 0.55 * Math.sin(state.time * 20 + mote.seed);
        const alpha = left * shimmer * state.reveal * (s.light ? 0.35 : 0.9);
        if (alpha <= 0.01) return;
        ctx.fillStyle = rgba(s.light ? colors.head : mix(colors.tail, WHITE, 0.6), alpha);
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.size * (0.6 + 0.4 * left), 0, TAU);
        ctx.fill();
      });
    };
    const frame = (now) => {
      raf = 0;
      if (resizePending) {
        resizePending = false;
        applyMeasure();
      }
      if (!alive) return;
      const s = settingsRef.current;
      const dt = Math.min(0.05, Math.max(1e-3, (now - last) / 1e3));
      last = now;
      state.time += dt;
      const key = `${s.color}|${s.trailColor}`;
      if (key !== colors.key) {
        colors.key = key;
        colors.head = toRgb(s.color);
        colors.tail = toRgb(s.trailColor);
      }
      const shape = shapeFor(s);
      const total = shape.total;
      const spacing = total / s.stars;
      const engaged = state.hovered || state.focused;
      const cruise = reduce ? 0 : s.direction * total / s.duration;
      const revealTarget = s.hover === "reveal" && !engaged ? 0 : 1;
      state.reveal += (revealTarget - state.reveal) * (1 - Math.exp(-dt / (revealTarget > state.reveal ? 0.16 : 0.45)));
      const boostTarget = s.hover === "brighten" && engaged ? 1 : 0;
      state.boost += (boostTarget - state.boost) * (1 - Math.exp(-dt / (boostTarget > state.boost ? 0.18 : 0.5)));
      state.flash *= Math.exp(-dt / 0.22);
      state.velocity += (cruise - state.velocity) * (1 - Math.exp(-dt / 0.45));
      let extra = 0;
      if (state.lap >= 0) {
        const before = ease(Math.min(1, state.lap / LAP));
        state.lap += dt;
        extra = (ease(Math.min(1, state.lap / LAP)) - before) * total * s.direction;
        if (state.lap >= LAP) state.lap = -1;
      }
      state.motion = state.velocity + extra / dt;
      state.phase = wrap(state.phase + state.velocity * dt + extra, total);
      const pace = Math.abs(state.motion) / Math.max(1, Math.abs(total / s.duration));
      if (s.sparkle && !reduce && state.reveal > 0.05) {
        state.emit += dt * (2 + 6 * Math.min(2, pace)) * s.stars;
        while (state.emit > 1) {
          state.emit -= 1;
          pointAt(shape, state.phase + Math.floor(Math.random() * s.stars) * spacing, point);
          spawnDust(point.x, point.y, point.nx, point.ny, state.motion);
        }
      }
      for (let i = dust.length - 1; i >= 0; i--) {
        const mote = dust[i];
        mote.age += dt;
        mote.x += mote.vx * dt;
        mote.y += mote.vy * dt;
        mote.vx *= Math.exp(-dt * 2.2);
        mote.vy *= Math.exp(-dt * 2.2);
        if (mote.age >= mote.life) dust.splice(i, 1);
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i].age += dt;
        if (pulses[i].age >= 0.65) pulses.splice(i, 1);
      }
      draw(s, shape);
      const settling = Math.abs(revealTarget - state.reveal) > 2e-3 || Math.abs(boostTarget - state.boost) > 2e-3 || state.flash > 0.01 || pulses.length > 0 || dust.length > 0;
      const moving = Math.abs(state.motion) > 0.05 || cruise !== 0 || state.lap >= 0;
      const showing = state.reveal > 2e-3 || revealTarget > 0;
      if (state.visible && (settling || moving && showing || state.hovered)) raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (raf || !alive || !state.visible) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    wakeRef.current = wake;
    const onEnter = (event) => {
      const s = settingsRef.current;
      [state.pointerX, state.pointerY] = local(event);
      state.hovered = true;
      if (s.hover === "reveal" && state.reveal < 0.15) {
        state.phase = project(shapeFor(s), state.pointerX - s.thickness / 2, state.pointerY - s.thickness / 2);
        state.velocity = 0;
      }
      if (s.hover === "lap" && state.lap < 0 && !reduce) state.lap = 0;
      wake();
    };
    const onLeave = () => {
      state.hovered = false;
      wake();
    };
    const pulse = (origin) => {
      if (!settingsRef.current.clickPulse) return;
      pulses.push({ origin, age: 0 });
      if (pulses.length > 4) pulses.shift();
      state.flash = 1;
      wake();
    };
    const onDown = (event) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      const s = settingsRef.current;
      const [x, y] = local(event);
      pulse(project(shapeFor(s), x - s.thickness / 2, y - s.thickness / 2));
    };
    const onClick = (event) => {
      if (event.detail === 0) pulse(state.phase);
    };
    const onFocus = () => {
      state.focused = root.matches(":focus-visible");
      if (state.focused && settingsRef.current.hover === "lap" && state.lap < 0 && !reduce) state.lap = 0;
      wake();
    };
    const onBlur = () => {
      state.focused = false;
      wake();
    };
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(root);
    const visibility = new IntersectionObserver((entries) => {
      state.visible = entries.some((entry) => entry.isIntersecting);
      if (state.visible) wake();
    });
    visibility.observe(root);
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("click", onClick);
    root.addEventListener("focus", onFocus);
    root.addEventListener("blur", onBlur);
    measure();
      return () => {
      alive = false;
      wakeRef.current = null;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibility.disconnect();
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("click", onClick);
      root.removeEventListener("focus", onFocus);
      root.removeEventListener("blur", onBlur);
    };
    };
    const destroy = run();
    return { destroy: destroy || (() => {}) };
  }
  return { mount: mountStarBorder };
})();
window.ReactBits = { LightRays: LightRaysNS, StarBorder: StarBorderNS };
})();
