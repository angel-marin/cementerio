// Piezas compartidas para construir escenarios (materiales, cielo, muros, personajes, naturaleza).
// Los actos las reutilizan para que todo tenga el mismo aspecto: grises, grano y piedra áspera.
import { loadModel } from '../core/helpers.js';
import { isTouch } from '../core/engine.js';
import * as game from '../core/state.js';
import { sfx, emitter } from '../core/audio.js';
import { CONFIG } from '../config.js';

const B = window.BABYLON;

/* ---------- Materiales en escala de grises ---------- */
export function materials(h) {
  const { mat, texMat, noiseTex } = h;
  const groundTex = noiseTex(256, 78, 64); groundTex.uScale = 6; groundTex.vScale = 6;
  const wallTex = noiseTex(256, 92, 70, (c, w) => {
    c.fillStyle = 'rgba(0,0,0,.45)';
    for (let r = 0; r < 4; r++) { c.fillRect(0, r * 64, w, 3); for (let x = (r % 2) * 64; x < w; x += 128) c.fillRect(x, r * 64, 3, 64); }
  });
  wallTex.uScale = 5; wallTex.vScale = 1.2;
  const plasterTex = noiseTex(256, 120, 36); plasterTex.uScale = 3; plasterTex.vScale = 1.5;
  const floorTex = noiseTex(256, 66, 40, (c, w, hh) => {
    c.fillStyle = 'rgba(0,0,0,.5)';
    for (let r = 0; r < 8; r++) c.fillRect(0, r * (hh / 8), w, 2);
    for (let r = 0; r < 8; r++) for (let x = (r * 53) % 128; x < w; x += 128) c.fillRect(x, r * (hh / 8), 2, hh / 8);
  });
  floorTex.uScale = 4; floorTex.vScale = 4;
  return {
    ground: texMat(groundTex, { spec: 0.02 }), outer: mat('#1a1a1a', { spec: 0 }),
    stone: texMat(noiseTex(256, 118, 100), { spec: 0.08 }), wall: texMat(wallTex, { spec: 0.02 }),
    plaster: texMat(plasterTex, { spec: 0.02 }), floor: texMat(floorTex, { spec: 0.08 }),
    dirt: texMat(noiseTex(128, 62, 70), { spec: 0 }), bark: texMat(noiseTex(128, 40, 60), { spec: 0.02 }),
    pit: mat('#040404', { spec: 0 }), ceiling: mat('#1c1c1c', { spec: 0 }),
    iron: mat('#121212', { spec: 0.45, power: 40 }), metal: mat('#8c8c8c', { spec: 0.6, power: 40 }),
    wood: mat('#3a3a3a', { spec: 0.08 }), woodDark: mat('#222222', { spec: 0.05 }), woodLight: mat('#6c6c6c', { spec: 0.08 }),
    band: mat('#6e6e6e', { spec: 0.4 }), linen: mat('#9a9a9a', { spec: 0.02 }), fabric: mat('#4a4a4a', { spec: 0.02 }),
    cream: mat('#c8c8c8', { spec: 0.05 }), white: mat('#e6e6e6', { spec: 0.1 }),
    lantern: mat('#f0f0f0', { emissive: '#f0f0f0', noLight: true }),
    pane: mat('#dcdcdc', { emissive: '#d0d0d8', noLight: true, cull: false }),
    fire: mat('#ffffff', { emissive: '#f4f4f4', noLight: true }),
    skin: mat('#c8c8c8', { spec: 0.12 }), cloth: mat('#1f1f1f', { spec: 0.04 }), hat: mat('#121212', { spec: 0.1 }),
    band2: mat('#3c3c3c', { spec: 0.1 }), feat: mat('#0b0b0b', { spec: 0 }), brow: mat('#2a2a2a', { spec: 0 }), cane: mat('#767676', { spec: 0.2 })
  };
}

/* ---------- Cielo con luna ---------- */
export function skyDome(ctx, h, { dawn = false } = {}) {
  const { scene } = ctx;
  const { MB, V3, dtex, noiseTex } = h;
  const skyTex = dtex(1024, 512, (c, w, hh) => {
    const g = c.createLinearGradient(0, 0, 0, hh);
    if (dawn) { g.addColorStop(0, '#2a2a2a'); g.addColorStop(0.35, '#5c5c5c'); g.addColorStop(0.5, '#c4c4c4'); g.addColorStop(0.58, '#6a6a6a'); g.addColorStop(1, '#262626'); }
    else { g.addColorStop(0, '#020202'); g.addColorStop(0.42, '#141414'); g.addColorStop(0.5, '#2a2a2a'); g.addColorStop(0.58, '#141414'); g.addColorStop(1, '#080808'); }
    c.fillStyle = g; c.fillRect(0, 0, w, hh);
    for (let i = 0; i < (dawn ? 12 : 160); i++) { c.fillStyle = 'rgba(255,255,255,' + (0.15 + Math.random() * 0.5) + ')'; c.fillRect(Math.random() * w, Math.random() * hh * 0.4, 1.4, 1.4); }
  });
  const dome = MB.CreateSphere('dome', { diameter: 300, segments: 16, sideOrientation: B.Mesh.BACKSIDE }, scene);
  const dm = new B.StandardMaterial('dome', scene);
  dm.emissiveTexture = skyTex; dm.disableLighting = true; dm.fogEnabled = false; dm.backFaceCulling = false;
  dome.material = dm; dome.infiniteDistance = true; dome.isPickable = false;

  const moonTex = noiseTex(256, 215, 40, (c, w, hh) => {
    for (let i = 0; i < 14; i++) {
      const x = Math.random() * w, y = Math.random() * hh, r = 10 + Math.random() * 28;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(90,90,90,.55)'); g.addColorStop(1, 'rgba(90,90,90,0)');
      c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
    }
  });
  const mm = new B.StandardMaterial('moonMat', scene);
  mm.disableLighting = true; mm.emissiveTexture = moonTex; mm.fogEnabled = false;
  const moon = MB.CreateSphere('moonDisc', { diameter: 15, segments: 24 }, scene);
  moon.material = mm; moon.position.set(60, 45, 70); moon.infiniteDistance = true; moon.isPickable = false; moon.applyFog = false;
  if (dawn) moon.setEnabled(false);
  if (ctx.moon) {
    const d = dawn ? new V3(-0.8, -0.35, -0.4).normalize() : new V3(-60, -45, -70).normalize();
    ctx.moon.direction = d; ctx.moon.position = d.scale(-25);
  }
  return { dome, moon };
}

/* ---------- Suelo ---------- */
export function groundPlane(ctx, h, M, { width, depth, x = 0, z = 0, y = 0, outer = true }) {
  const { MB } = h;
  const g = MB.CreateGround('ground', { width, height: depth }, ctx.scene);
  g.position.set(x, y, z); g.material = M.ground; g.receiveShadows = true;
  if (outer) {
    const o = MB.CreateGround('outer', { width: 220, height: 220 }, ctx.scene);
    o.position.y = y - 0.03; o.material = M.outer; o.isPickable = false;
  }
  return g;
}

/* ---------- Muros ---------- */
// Pared recta entre dos puntos. Por defecto añade su rectángulo de colisión.
export function wall(ctx, h, material, x0, z0, x1, z1, { height = 2.6, thick = 0.2, y = 0, obstacle = false } = {}) {
  const { box } = h;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const w = Math.abs(x1 - x0) || thick, d = Math.abs(z1 - z0) || thick;
  const m = box(w, height, d, cx, y + height / 2, cz, material);
  if (obstacle) ctx.player.addObstacle([cx - w / 2, cx + w / 2, cz - d / 2, cz + d / 2]);
  return m;
}

/* ---------- Farolillo con luz ---------- */
export function lantern(ctx, h, M, x, z, { light = true } = {}) {
  const { box, cyl } = h;
  const parts = [cyl(0.08, 0.1, 2.2, x, 1.1, z, M.iron, null, 8), box(0.3, 0.38, 0.3, x, 2.38, z, M.lantern),
    cyl(0.0, 0.46, 0.2, x, 2.67, z, M.iron, null, 4), box(0.36, 0.05, 0.36, x, 2.17, z, M.iron)];
  parts.forEach(ctx.cast);
  ctx.interaction.add(parts, { text: 'Un farolillo. La llama no parpadea.' });
  if (light) {
    const l = new B.PointLight('lamp' + x + '_' + z, new B.Vector3(x, 2.35, z), ctx.scene);
    l.intensity = 0.7; l.range = 8; l.diffuse = new B.Color3(0.95, 0.95, 0.95); l.specular = new B.Color3(0.3, 0.3, 0.3);
  }
  return parts;
}

/* ---------- Lápida ---------- */
const EPITAPHS = ['La lluvia se llevó el nombre. Solo queda una fecha.', 'Las letras están gastadas. No se lee nada.',
  'Alguien dejó una piedra pequeña encima.', 'Aquí descansa alguien que no tenía prisa.'];
export function tomb(ctx, h, M, x, z, hgt, text) {
  const { MB, box } = h;
  const w = 0.8, parts = [box(w, hgt, 0.26, x, hgt / 2, z, M.stone)];
  const arch = MB.CreateCylinder('arch', { diameter: w, height: 0.26, tessellation: 20 }, ctx.scene);
  arch.rotation.x = Math.PI / 2; arch.position.set(x, hgt, z); arch.material = M.stone; parts.push(arch);
  parts.forEach(ctx.cast);
  ctx.interaction.add(parts, { text: text || EPITAPHS[Math.floor(Math.random() * EPITAPHS.length)] });
  ctx.player.addObstacle([x - 0.5, x + 0.5, z - 0.3, z + 0.3]);
  return parts;
}

/* ---------- Verja cerrada ---------- */
export function ironGate(ctx, h, M, x, z, width = 3) {
  const { box, cyl } = h;
  const parts = [box(0.5, 3.3, 0.5, x - width / 2 - 0.25, 1.65, z, M.stone), box(0.5, 3.3, 0.5, x + width / 2 + 0.25, 1.65, z, M.stone)];
  parts.push(box(width, 0.08, 0.07, x, 2.45, z, M.iron), box(width, 0.08, 0.07, x, 0.15, z, M.iron));
  const n = Math.round(width / 0.15);
  for (let i = 1; i < n; i++) parts.push(cyl(0.028, 0.028, 2.4, x - width / 2 + i * (width / n), 1.25, z, M.iron, null, 8));
  return parts;
}

/* ---------- El sepulturero ---------- */
// full = de cuerpo entero (en casa y en el cementerio); si no, solo medio cuerpo (metido en la tumba).
export function buildGravedigger(ctx, h, M, { full = true, scale = 0.62 } = {}) {
  const { V3, box, cyl, sphere, capsule, limb } = h;
  const scene = ctx.scene;
  const root = new B.TransformNode('digger', scene);
  if (full) root.scaling.setAll(scale);
  const upper = new B.TransformNode('dUpper', scene); upper.parent = root; upper.position.y = full ? 0.95 : 0;

  const torso = capsule(0.42, 1.5, 0, 0.6, 0, M.cloth, upper); torso.scaling.set(1.08, 1, 0.74);
  const head = new B.TransformNode('dHead', scene); head.parent = upper; head.position.set(0, 1.62, 0);
  sphere(0.46, 0, 0, 0, M.skin, head, 0.9, 1.1, 0.95);
  const nose = capsule(0.055, 0.26, 0, -0.03, 0.25, M.skin, head); nose.rotation.x = Math.PI / 2 + 0.2;
  sphere(0.12, 0, -0.07, 0.38, M.skin, head);
  [-1, 1].forEach((s) => {
    const b = box(0.16, 0.04, 0.05, s * 0.1, 0.09, 0.2, M.brow, head); b.rotation.z = -s * 0.22;
    sphere(0.05, s * 0.09, 0.03, 0.21, M.feat, head);
    sphere(0.12, s * 0.2, -0.02, 0, M.skin, head, 0.6, 1, 0.8);
  });
  box(0.07, 0.025, 0.03, 0, -0.17, 0.2, M.feat, head);
  const hat = new B.TransformNode('hat', scene); hat.parent = head;
  cyl(0.56, 0.56, 0.03, 0, 0.2, 0, M.hat, hat, 24);
  cyl(0.31, 0.33, 0.34, 0, 0.38, 0, M.hat, hat, 24);
  cyl(0.335, 0.335, 0.06, 0, 0.26, 0, M.band2, hat, 24);
  cyl(0.3, 0.34, 0.14, 0, 1.38, 0, M.cloth, upper, 12);
  limb(new V3(0.46, 1.15, 0), new V3(0.66, 0.62, 0.12), 0.13, M.cloth, upper);
  sphere(0.17, 0.67, 0.55, 0.13, M.skin, upper);
  limb(new V3(-0.46, 1.15, 0), new V3(-0.74, 1.28, 0.42), 0.13, M.cloth, upper);
  sphere(0.18, -0.76, 1.3, 0.44, M.skin, upper);
  let cane = null;
  cane = limb(new V3(-0.62, 0.1, 0.75), new V3(-0.77, 1.5, 0.4), 0.028, M.cane, upper);
  if (full) {
    [-1, 1].forEach((s) => {
      capsule(0.15, 1.15, s * 0.25, 0.5, 0, M.cloth, root);
      sphere(0.34, s * 0.25, 0.07, 0.1, M.hat, root, 1, 0.6, 1.6);
    });
  }
  const meshes = root.getChildMeshes();
  meshes.forEach(ctx.cast);

  const api = {
    root, head, torso, meshes, cane,
    // El sepulturero se quita el sombrero y lo sostiene.
    holdHat(on) {
      if (on) { hat.parent = upper; hat.position.set(-0.8, 1.05, 0.55); hat.rotation.set(1.3, 0, 0); }
      else { hat.parent = head; hat.position.set(0, 0, 0); hat.rotation.set(0, 0, 0); }
    },
    time: 0,
    // Respira y mira hacia el jugador.
    update(dt, speed = 1.6) {
      api.time += dt;
      torso.scaling.y = 1 + Math.sin(api.time * 1.6) * 0.012;
      head.position.y = 1.62 + Math.sin(api.time * 1.6) * 0.01;
      head.rotation.z = Math.sin(api.time * 0.5) * 0.04;
      const dx = ctx.camera.position.x - root.position.x, dz = ctx.camera.position.z - root.position.z;
      if (Math.hypot(dx, dz) > 12) return;
      let diff = Math.atan2(dx, dz) - root.rotation.y;
      while (diff > Math.PI) diff -= 2 * Math.PI; while (diff < -Math.PI) diff += 2 * Math.PI;
      root.rotation.y += diff * Math.min(1, dt * speed);
    }
  };
  return api;
}

/* ---------- Árboles secos y rocas (modelos GLB) ---------- */
function prep(res, gray) {
  res.meshes.filter((m) => m.getTotalVertices() > 0).forEach((m) => {
    m.isPickable = false; m.isVisible = false;
    const mt = m.material;
    if (mt) { mt.albedoColor = new B.Color3(gray, gray, gray); mt.metallic = 0; mt.roughness = 0.9; mt.environmentIntensity = 0; mt.backFaceCulling = false; mt.twoSidedLighting = true; mt.maxSimultaneousLights = 6; }
  });
}
// El raíz de glTF invierte el eje X, por eso se coloca con -x.
function place(res, scene, name, x, z, sc, ry, y = 0) {
  const src = res.meshes.find((m) => m.name === name); if (!src) return null;
  const node = new B.TransformNode('pl', scene); node.parent = res.meshes[0];
  node.position.set(-x, y, z); node.scaling.setAll(sc); node.rotation.y = ry || 0;
  const c = src.clone(name + '_c', node); c.isVisible = true; c.isPickable = false; return c;
}

// inner: [[x, z, escala, giro]] árboles de dentro (con colisión); far: [[nombre, x, z, escala, giro]] siluetas de fondo.
export function nature(ctx, h, M, { inner = [], far = [], rocks = [] } = {}) {
  const { scene } = ctx;
  const { cyl } = h;
  const trees = loadModel(scene, 'trees.glb').then((res) => {
    prep(res, 0.11);
    inner.forEach((t) => {
      const c = place(res, scene, 'tree', t[0], t[1], t[2], t[3]); if (!c) return;
      ctx.cast(c);
      const trunk = cyl(0.5, 0.5, 2.4, t[0], 1.2, t[1], M.bark, null, 8); trunk.visibility = 0;
      ctx.interaction.add(trunk, { text: 'Un árbol seco. Lleva muerto muchos inviernos.' });
      ctx.player.addObstacle([t[0] - 0.35, t[0] + 0.35, t[1] - 0.35, t[1] + 0.35]);
    });
    const list = isTouch ? far.slice(0, 3) : far;
    list.forEach((t) => place(res, scene, t[0], t[1], t[2], t[3], t[4], -0.1));
  }).catch((err) => console.error('No se pudieron cargar los árboles', err));
  const rocksP = rocks.length ? loadModel(scene, 'rocks.glb').then((res) => {
    prep(res, 0.3);
    rocks.forEach((r) => {
      const c = place(res, scene, r[0], r[1], r[2], r[3], r[4]); if (!c) return;
      c.isPickable = true; ctx.cast(c);
      ctx.interaction.add(c, { text: 'Una roca cubierta de musgo. Está húmeda.' });
      ctx.player.addObstacle([r[1] - 0.55, r[1] + 0.55, r[2] - 0.55, r[2] + 0.55]);
    });
  }).catch((err) => console.error('No se pudieron cargar las rocas', err)) : Promise.resolve();
  return Promise.all([trees, rocksP]);
}

/* ---------- Rastro de brillos (solo se ven con la linterna apagada) ---------- */
// points: [[x, z], ...]. Devuelve las esferas. Necesita la linterna (mecánica flashlight) para el fundido.
export function orbTrail(ctx, h, fl, points, { spacing = 1.2, y = 1.0, size = 0.22, parent = null } = {}) {
  const { MB } = h;
  const m = new B.StandardMaterial('orbMat', ctx.scene);
  m.disableLighting = true; m.emissiveColor = new B.Color3(1, 1, 1);
  const out = [];
  const put = (x, z) => {
    const o = MB.CreateSphere('orb', { diameter: size, segments: 8 }, ctx.scene);
    o.position.set(x, y, z); o.material = m; if (parent) o.parent = parent;
    fl.addShadowObject(o, { useShadowMaterial: false, maxVisibility: 1 });
    out.push(o);
  };
  let carry = 0;
  put(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const [x0, z0] = points[i - 1], [x1, z1] = points[i];
    const len = Math.hypot(x1 - x0, z1 - z0);
    let d = spacing - carry;
    while (d <= len) { const t = d / len; put(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t); d += spacing; }
    carry = len - (d - spacing);
  }
  return out;
}

/* ---------- Sueños escondidos (extra) ---------- */
// Pequeños brillos repartidos por el mapa. Cada uno revela una frase del vídeo y suena suave desde su posición.
export function hiddenDreams(ctx, h, sceneId, { parent = null } = {}) {
  const spots = (CONFIG.hiddenDreams.spots[sceneId] || []);
  const found = game.state.flags.hidden || [];
  const txt = CONFIG.texts.hidden;
  const mat = new B.StandardMaterial('hiddenMat', ctx.scene);
  mat.disableLighting = true; mat.emissiveColor = new B.Color3(0.85, 0.9, 1);
  const orbs = [];
  spots.forEach(([id, x, y, z], i) => {
    if (found.includes(id)) return;
    const m = h.MB.CreateSphere('hiddenDream', { diameter: 0.2, segments: 10 }, ctx.scene);
    m.position.set(x, y, z); m.material = mat; m.isPickable = false; if (parent) m.parent = parent;
    const hit = h.MB.CreateSphere('hiddenHit', { diameter: 0.9, segments: 6 }, ctx.scene);
    hit.parent = m; hit.visibility = 0; hit.isPickable = true;
    const em = emitter({ freq: 880 + i * 30, vol: 0.012, pulse: 0.8, position: new B.Vector3(x, y, z) });
    let t = i * 1.7;
    const off = ctx.addUpdater((dt) => {
      t += dt; m.scaling.setAll(1 + Math.sin(t * 3) * 0.18);
      em.setVolume(m.isEnabled() ? 0.012 : 0);
    });
    ctx.interaction.add([m, hit], {
      hint: () => txt.hint,
      onUse: () => {
        if (!game.addHidden(id)) return;
        const n = game.hiddenCount(), total = CONFIG.hiddenDreams.total, lines = CONFIG.hiddenDreams.lines;
        const ids = (game.state.flags.hidden || []).slice().sort();
        game.setJournal({ id: 'escondidos', title: txt.journalTitle(n, total), text: ids.map((k) => lines[parseInt(k.slice(1), 10) - 1]).join('\n') });
        sfx.chime(n); em.dispose(); off();
        ctx.ui.toast(txt.found(n, total, lines[parseInt(id.slice(1), 10) - 1]), 6000);
        if (n >= total) ctx.ui.narrate(txt.allFound, 7000);
        m.dispose();
      }
    });
    orbs.push({ id, mesh: m });
  });
  return orbs;
}

/* ---------- Grafiti con el nombre del vecino (extra) ---------- */
// Solo aparece si CONFIG.neighbor.name no está vacío. ry: giro para que mire hacia dentro (−π/2 mira a +x, π/2 a −x, π a +z, 0 a −z).
export function graffiti(ctx, h, { x, y, z, ry = 0, width = 1.8 }) {
  const name = CONFIG.neighbor.name;
  if (!name) return null;
  const text = (CONFIG.neighbor.graffiti || '{name} estuvo aquí').replace('{name}', name);
  const tex = h.dtex(512, 128, (c, w, hh) => {
    let size = 54;
    c.font = size + 'px "Special Elite", cursive';
    const meas = c.measureText ? c.measureText(text) : null;
    const mw = meas && typeof meas.width === 'number' ? meas.width : NaN;
    if (Number.isFinite(mw) && mw > w - 40) { size = Math.max(22, size * (w - 40) / mw); c.font = size + 'px "Special Elite", cursive'; }
    c.fillStyle = 'rgba(240,240,240,0.92)'; c.textAlign = 'center';
    c.save(); c.translate(w / 2, hh / 2 + 14); c.rotate(-0.04); c.fillText(text, 0, 0); c.restore();
    c.strokeStyle = 'rgba(240,240,240,0.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(60, hh - 22); c.lineTo(w - 60, hh - 26); c.stroke();
  });
  tex.hasAlpha = true;
  const m = new B.StandardMaterial('graffitiMat', ctx.scene);
  m.diffuseTexture = tex; m.useAlphaFromDiffuseTexture = true; m.emissiveColor = new B.Color3(0.7, 0.7, 0.7); m.backFaceCulling = false; m.specularColor = new B.Color3(0, 0, 0);
  const plane = h.MB.CreatePlane('graffiti', { width, height: width * 0.25 }, ctx.scene);
  plane.position.set(x, y, z); plane.rotation.y = ry; plane.material = m;
  ctx.interaction.add(plane, { text: CONFIG.texts.hidden.graffitiLook });
  return plane;
}
