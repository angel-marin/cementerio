// Prototipo original: el cementerio con el enterrador, el niño, el ataúd con candado y la verja.
// Se conserva tal cual para comprobar que el refactor no rompe nada.
import { isTouch } from '../core/engine.js';
import { createHelpers, loadModel } from '../core/helpers.js';
import * as game from '../core/state.js';
import { sfx } from '../core/audio.js';
import { CONFIG } from '../config.js';

const B = window.BABYLON;

export const id = 'prototype';
export const title = 'Cementerio (prototipo original)';
export const sceneOptions = {};

let S = null;   // estado interno de la escena

export function update(dt, ctx) { if (S) S.update(dt, ctx); }

export function unload() {
  if (S) { S.timers.forEach(clearTimeout); S = null; }
}

export async function load(ctx) {
  const { scene, camera, player, interaction, ui, cast } = ctx;
  const h = createHelpers(scene);
  const { MB, V3, dtex, noiseTex, mat, texMat, box, cyl, sphere, capsule, limb } = h;

  S = { timers: [], update: () => {} };

  // Esta escena empieza siempre desde cero.
  game.removeItem('llave');
  game.setFlag('chestUnlocked', false);
  game.setFlag('gateOpen', false);

  player.setBounds({ minX: -5.4, maxX: 5.4, minZ: -5.4, maxZ: 5.4 });
  player.teleport(0, -4.6, 0, 0);
  const obstacle = (r) => player.addObstacle(r);

  let time = 0;
  let doorOpening = false;

  /* ---------- Texturas y materiales ---------- */
  const groundTex = noiseTex(256, 78, 64); groundTex.uScale = 6; groundTex.vScale = 6;
  const stoneTex = noiseTex(256, 118, 100);
  const wallTex = noiseTex(256, 92, 70, (c, w) => {
    c.fillStyle = 'rgba(0,0,0,.45)';
    for (let r = 0; r < 4; r++) {
      c.fillRect(0, r * 64, w, 3);
      for (let x = (r % 2) * 64; x < w; x += 128) c.fillRect(x, r * 64, 3, 64);
    }
  });
  wallTex.uScale = 5; wallTex.vScale = 1.2;
  const dirtTex = noiseTex(128, 62, 70);
  const barkTex = noiseTex(128, 40, 60);

  const skyTex = dtex(1024, 512, (c, w, hh) => {
    const g = c.createLinearGradient(0, 0, 0, hh);
    g.addColorStop(0, '#020202'); g.addColorStop(0.42, '#141414'); g.addColorStop(0.5, '#2a2a2a');
    g.addColorStop(0.58, '#141414'); g.addColorStop(1, '#080808');
    c.fillStyle = g; c.fillRect(0, 0, w, hh);
    for (let i = 0; i < 160; i++) { c.fillStyle = 'rgba(255,255,255,' + (0.15 + Math.random() * 0.5) + ')'; c.fillRect(Math.random() * w, Math.random() * hh * 0.4, 1.4, 1.4); }
  });

  const M = {
    ground: texMat(groundTex, { spec: 0.02 }), outer: mat('#1a1a1a', { spec: 0 }),
    stone: texMat(stoneTex, { spec: 0.08 }), wall: texMat(wallTex, { spec: 0.02 }), dirt: texMat(dirtTex, { spec: 0 }),
    bark: texMat(barkTex, { spec: 0.02 }), pit: mat('#040404', { spec: 0 }),
    iron: mat('#121212', { spec: 0.45, power: 40 }), metal: mat('#8c8c8c', { spec: 0.6, power: 40 }),
    wood: mat('#3a3a3a', { spec: 0.08 }), woodDark: mat('#222222', { spec: 0.05 }), band: mat('#6e6e6e', { spec: 0.4 }),
    lantern: mat('#f0f0f0', { emissive: '#f0f0f0', noLight: true }),
    exit: mat('#ffffff', { emissive: '#ffffff', noLight: true, cull: false }),
    key: mat('#bdbdbd', { emissive: '#444444', spec: 0.8, power: 48 }),
    skin: mat('#c8c8c8', { spec: 0.12 }), cloth: mat('#1f1f1f', { spec: 0.04 }), clothBoy: mat('#2e2e2e', { spec: 0.04 }),
    hat: mat('#121212', { spec: 0.1 }), band2: mat('#3c3c3c', { spec: 0.1 }), hair: mat('#0e0e0e', { spec: 0.1 }),
    feat: mat('#0b0b0b', { spec: 0 }), brow: mat('#2a2a2a', { spec: 0 }), cane: mat('#767676', { spec: 0.2 })
  };

  /* ---------- Cielo, suelo y muros ---------- */
  const dome = MB.CreateSphere('dome', { diameter: 300, segments: 16, sideOrientation: B.Mesh.BACKSIDE }, scene);
  const domeMat = new B.StandardMaterial('dome', scene);
  domeMat.emissiveTexture = skyTex; domeMat.disableLighting = true; domeMat.fogEnabled = false; domeMat.backFaceCulling = false;
  dome.material = domeMat; dome.infiniteDistance = true; dome.isPickable = false;

  const outer = MB.CreateGround('outer', { width: 140, height: 140 }, scene);
  outer.position.y = -0.02; outer.material = M.outer; outer.isPickable = false;
  const ground = MB.CreateGround('ground', { width: 12.4, height: 12.4 }, scene);
  ground.material = M.ground; ground.receiveShadows = true;

  box(0.4, 2.8, 12.4, -6.0, 1.4, 0, M.wall); box(0.4, 2.8, 12.4, 6.0, 1.4, 0, M.wall); box(12.4, 2.8, 0.4, 0, 1.4, -6.0, M.wall);
  box(7.2, 2.8, 0.4, -2.6, 1.4, 6.0, M.wall);
  box(3.2, 2.8, 0.4, 4.6, 1.4, 6.0, M.wall);
  const pillars = [box(0.5, 3.3, 0.5, 1.0, 1.65, 6.0, M.stone), box(0.5, 3.3, 0.5, 3.0, 1.65, 6.0, M.stone),
    box(0.64, 0.14, 0.64, 1.0, 3.37, 6.0, M.stone), box(0.64, 0.14, 0.64, 3.0, 3.37, 6.0, M.stone)];
  interaction.add(pillars, { text: 'Los pilares de la verja. La piedra está helada.' });

  const exitPlane = MB.CreatePlane('exit', { width: 7, height: 5 }, scene);
  exitPlane.position.set(2, 2.2, 9.5); exitPlane.material = M.exit; exitPlane.isPickable = false;
  const exitBar = box(0.7, 7, 0.1, 2, 3.5, 9.3, M.exit); exitBar.isPickable = false;

  /* ---------- Verja ---------- */
  const gatePivot = new B.TransformNode('gatePivot', scene); gatePivot.position.set(1.25, 0, 5.8);
  const gateParts = [
    box(0.07, 2.5, 0.07, 0.035, 1.25, 0, M.iron, gatePivot), box(0.07, 2.5, 0.07, 1.465, 1.25, 0, M.iron, gatePivot),
    box(1.5, 0.08, 0.07, 0.75, 2.45, 0, M.iron, gatePivot), box(1.5, 0.08, 0.07, 0.75, 1.1, 0, M.iron, gatePivot), box(1.5, 0.08, 0.07, 0.75, 0.15, 0, M.iron, gatePivot),
    box(0.16, 0.2, 0.08, 1.36, 1.1, -0.05, M.metal, gatePivot), box(0.025, 0.07, 0.09, 1.36, 1.1, -0.07, M.feat, gatePivot)
  ];
  for (let i = 1; i < 10; i++) {
    gateParts.push(cyl(0.028, 0.028, 2.4, i * 0.15, 1.25, 0, M.iron, gatePivot, 8));
    gateParts.push(cyl(0.0, 0.05, 0.12, i * 0.15, 2.56, 0, M.iron, gatePivot, 6));
  }
  interaction.add(gateParts, {
    hint: () => (game.hasItem('llave') ? 'Abrir la verja con la llave' : 'Examinar la verja'),
    onUse: () => {
      if (!game.hasItem('llave')) { sfx.bad(); ui.toast('La verja está cerrada con llave.'); return; }
      game.removeItem('llave'); game.setFlag('gateOpen', true); doorOpening = true;
      sfx.door(); ui.toast('La llave gira y la verja se abre con un chirrido.');
      interaction.remove(gateParts); gateParts.forEach((m) => { m.isPickable = false; });
      S.timers.push(setTimeout(showWin, 2400));
    }
  });

  /* ---------- Lápidas ---------- */
  const epitaphs = ['La lluvia se llevó el nombre. Solo queda una fecha.', 'Las letras están gastadas. No se lee nada.',
    'Alguien dejó una piedra pequeña encima.', 'Aquí descansa alguien que no tenía prisa.'];
  function tomb(x, z, hgt) {
    const w = 0.8, parts = [box(w, hgt, 0.26, x, hgt / 2, z, M.stone)];
    const arch = MB.CreateCylinder('arch', { diameter: w, height: 0.26, tessellation: 20 }, scene);
    arch.rotation.x = Math.PI / 2; arch.position.set(x, hgt, z); arch.material = M.stone; parts.push(arch);
    parts.forEach(cast);
    interaction.add(parts, { text: epitaphs[Math.floor(Math.random() * epitaphs.length)] });
    obstacle([x - 0.5, x + 0.5, z - 0.3, z + 0.3]);
  }
  [[-3.6, -2.2, 0.9], [-1.8, -3.0, 1.1], [0.1, -2.2, 0.8], [3.9, -3.8, 1.0], [4.5, 0.9, 0.9], [0.5, 1.2, 1.0],
    [-4.4, 2.2, 0.8], [-1.2, 3.0, 1.1], [3.4, 3.6, 0.9], [-3.9, 4.5, 0.8]].forEach((t) => tomb(t[0], t[1], t[2]));

  (function bigTomb() {
    const x = 1.4, z = -3.4;
    const body = box(1.2, 1.6, 0.36, x, 0.8, z, M.stone);
    const roof = box(0.85, 0.85, 0.36, x, 1.6, z, M.stone); roof.rotation.z = Math.PI / 4;
    [body, roof].forEach(cast);
    interaction.add([body, roof], { text: 'Una lápida enorme. No hay ningún nombre, solo piedra áspera.' });
    obstacle([x - 0.7, x + 0.7, z - 0.3, z + 0.3]);
  })();

  const boyTombX = -2.6, boyTombZ = 0.8, boyTombH = 1.0;
  (function boyTomb() {
    const parts = [box(0.95, boyTombH, 0.3, boyTombX, boyTombH / 2, boyTombZ, M.stone)];
    const arch = MB.CreateCylinder('arch', { diameter: 0.95, height: 0.3, tessellation: 22 }, scene);
    arch.rotation.x = Math.PI / 2; arch.position.set(boyTombX, boyTombH, boyTombZ); arch.material = M.stone; parts.push(arch);
    parts.forEach(cast);
    interaction.add(parts, { text: 'La lápida donde está sentado el niño. Tiene un golpe en una esquina.' });
    obstacle([boyTombX - 0.55, boyTombX + 0.55, boyTombZ - 0.3, boyTombZ + 0.3]);
  })();

  /* ---------- Tumba abierta y montón de tierra ---------- */
  const pitX = 2.4, pitZ = -1.2;
  const pitPlane = MB.CreateGround('pit', { width: 1.0, height: 2.0 }, scene);
  pitPlane.position.set(pitX, 0.012, pitZ); pitPlane.material = M.pit;
  const rim = [
    box(0.28, 0.2, 2.5, pitX - 0.64, 0.1, pitZ, M.dirt), box(0.28, 0.2, 2.5, pitX + 0.64, 0.1, pitZ, M.dirt),
    box(1.0, 0.2, 0.28, pitX, 0.1, pitZ - 1.14, M.dirt), box(1.0, 0.2, 0.28, pitX, 0.1, pitZ + 1.14, M.dirt), pitPlane
  ];
  interaction.add(rim, { text: 'Una tumba abierta. Huele a tierra húmeda.' });
  obstacle([pitX - 0.8, pitX + 0.8, pitZ - 1.3, pitZ + 1.3]);
  const mound = sphere(1.9, 4.3, 0, -1.4, M.dirt, null, 1.3, 0.42, 1.0); cast(mound);
  interaction.add(mound, { text: 'Un montón de tierra removida.' });
  obstacle([3.5, 5.1, -2.0, -0.8]);

  /* ---------- Árboles secos (plan B si el modelo no carga) ---------- */
  function deadTree(x, z) {
    const root = new B.TransformNode('tree', scene); root.position.set(x, 0, z);
    function seg(a, dir, len, r, depth, n) {
      const b = a.add(dir.scale(len));
      const holder = new B.TransformNode('br', scene); holder.parent = root; holder.position.copyFrom(a);
      const up = Math.abs(dir.y) > 0.95 ? V3.Forward() : V3.Up();
      holder.rotationQuaternion = B.Quaternion.FromLookDirectionLH(dir.clone().normalize(), up);
      const c = MB.CreateCylinder('br', { diameterTop: r * 1.4, diameterBottom: r * 2, height: len, tessellation: 6 }, scene);
      c.rotation.x = Math.PI / 2; c.position.z = len / 2; c.parent = holder; c.material = M.bark;
      if (depth > 0) {
        for (let i = 0; i < n; i++) {
          const nd = new V3(dir.x + (Math.random() - 0.5) * 1.5, Math.max(0.15, dir.y * 0.6 + 0.25 + Math.random() * 0.3), dir.z + (Math.random() - 0.5) * 1.5).normalize();
          seg(b, nd, len * 0.72, r * 0.68, depth - 1, 2);
        }
      }
    }
    seg(V3.Zero(), new V3(0.04, 1, 0.03), 2.3, 0.13, 3, 3);
    const meshes = root.getChildMeshes(); meshes.forEach(cast);
    interaction.add(meshes, { text: 'Un árbol seco. Lleva muerto muchos inviernos.' });
  }

  /* ---------- Farolillos (tres) ---------- */
  function lantern(x, z) {
    const parts = [cyl(0.08, 0.1, 2.2, x, 1.1, z, M.iron, null, 8), box(0.3, 0.38, 0.3, x, 2.38, z, M.lantern),
      cyl(0.0, 0.46, 0.2, x, 2.67, z, M.iron, null, 4), box(0.36, 0.05, 0.36, x, 2.17, z, M.iron)];
    parts.forEach(cast);
    interaction.add(parts, { text: 'Un farolillo. La llama no parpadea.' });
    const l = new B.PointLight('lamp' + x, new V3(x, 2.35, z), scene);
    l.intensity = 0.7; l.range = 8; l.diffuse = new B.Color3(0.95, 0.95, 0.95); l.specular = new B.Color3(0.3, 0.3, 0.3);
  }
  lantern(-4.8, 4.6); lantern(4.8, -4.8); lantern(-1.0, 4.9);

  /* ---------- Ataúd con candado ---------- */
  const cfX = -4.8, cfZ = -3.5;
  const coffin = [
    box(0.8, 0.36, 1.9, cfX, 0.18, cfZ, M.wood),
    box(0.06, 0.1, 1.9, cfX - 0.37, 0.41, cfZ, M.wood), box(0.06, 0.1, 1.9, cfX + 0.37, 0.41, cfZ, M.wood),
    box(0.8, 0.1, 0.06, cfX, 0.41, cfZ - 0.92, M.wood), box(0.8, 0.1, 0.06, cfX, 0.41, cfZ + 0.92, M.wood),
    box(0.82, 0.08, 0.08, cfX, 0.2, cfZ - 0.5, M.band), box(0.82, 0.08, 0.08, cfX, 0.2, cfZ + 0.5, M.band),
    box(0.7, 0.02, 1.8, cfX, 0.37, cfZ, M.feat)
  ];
  const lidPivot = new B.TransformNode('lidPivot', scene); lidPivot.position.set(cfX - 0.42, 0.46, cfZ);
  coffin.push(box(0.84, 0.1, 1.96, 0.42, 0.05, 0, M.woodDark, lidPivot));
  coffin.push(box(0.08, 0.11, 1.98, 0.42, 0.05, -0.5, M.band, lidPivot));
  coffin.push(box(0.08, 0.11, 1.98, 0.42, 0.05, 0.5, M.band, lidPivot));
  const padlock = new B.TransformNode('padlock', scene); padlock.position.set(cfX + 0.44, 0.46, cfZ);
  const shackle = MB.CreateTorus('shackle', { diameter: 0.1, thickness: 0.025, tessellation: 16 }, scene);
  shackle.rotation.z = Math.PI / 2; shackle.position.set(0, 0.07, 0); shackle.material = M.metal; shackle.parent = padlock;
  const padParts = [box(0.06, 0.15, 0.16, 0, -0.02, 0, M.metal, padlock), shackle, box(0.02, 0.04, 0.02, 0.035, -0.02, 0, M.feat, padlock)];
  const coffinAll = coffin.concat(padParts); coffinAll.forEach(cast);
  obstacle([cfX - 0.5, cfX + 0.5, cfZ - 1.0, cfZ + 1.0]);

  interaction.add(coffinAll, {
    hint: () => (game.hasFlag('chestUnlocked') ? 'Examinar el ataúd' : 'Probar el candado'),
    onUse: () => {
      if (game.hasFlag('chestUnlocked')) { ui.toast('El ataúd está abierto y vacío.'); return; }
      ui.keypad({
        title: 'Candado de tres cifras', digits: 3, code: '321',
        onSolved: () => {
          game.setFlag('chestUnlocked', true); game.solvePuzzle('prototype_candado');
          padlock.setEnabled(false); keyNode.setEnabled(true);
          sfx.open(); ui.toast('El candado cede y la tapa del ataúd se levanta. Hay algo dentro.');
        }
      });
    }
  });

  /* Llave dentro del ataúd (oculta hasta abrir) */
  const keyNode = new B.TransformNode('key', scene); keyNode.position.set(cfX, 0.42, cfZ);
  const keyRing = MB.CreateTorus('keyRing', { diameter: 0.1, thickness: 0.025, tessellation: 16 }, scene);
  keyRing.position.set(0, 0, -0.1); keyRing.material = M.key; keyRing.parent = keyNode;
  const keyParts = [keyRing, box(0.02, 0.02, 0.2, 0, 0, 0.04, M.key, keyNode), box(0.02, 0.04, 0.025, 0, -0.015, 0.12, M.key, keyNode), box(0.02, 0.03, 0.025, 0, -0.01, 0.08, M.key, keyNode)];
  interaction.add(keyParts, {
    hint: 'Coger la llave',
    onUse: () => { keyNode.dispose(); game.addItem('llave'); sfx.pick(); ui.toast('Has cogido una llave oxidada.'); }
  });
  keyNode.setEnabled(false);

  /* ---------- El enterrador ---------- */
  const digger = new B.TransformNode('digger', scene); digger.position.set(pitX, 0, pitZ); digger.rotation.y = Math.PI;
  const dTorso = capsule(0.42, 1.5, 0, 0.6, 0, M.cloth, digger); dTorso.scaling.set(1.08, 1, 0.74);
  const dHead = new B.TransformNode('dHead', scene); dHead.parent = digger; dHead.position.set(0, 1.62, 0);
  sphere(0.46, 0, 0, 0, M.skin, dHead, 0.9, 1.1, 0.95);
  const nose = capsule(0.055, 0.26, 0, -0.03, 0.25, M.skin, dHead); nose.rotation.x = Math.PI / 2 + 0.2;
  sphere(0.12, 0, -0.07, 0.38, M.skin, dHead);
  [-1, 1].forEach((s) => {
    const b = box(0.16, 0.04, 0.05, s * 0.1, 0.09, 0.2, M.brow, dHead); b.rotation.z = -s * 0.22;
    sphere(0.05, s * 0.09, 0.03, 0.21, M.feat, dHead);
    sphere(0.12, s * 0.2, -0.02, 0, M.skin, dHead, 0.6, 1, 0.8);
  });
  box(0.07, 0.025, 0.03, 0, -0.17, 0.2, M.feat, dHead);
  cyl(0.56, 0.56, 0.03, 0, 0.2, 0, M.hat, dHead, 24);
  cyl(0.31, 0.33, 0.34, 0, 0.38, 0, M.hat, dHead, 24);
  cyl(0.335, 0.335, 0.06, 0, 0.26, 0, M.band2, dHead, 24);
  cyl(0.3, 0.34, 0.14, 0, 1.38, 0, M.cloth, digger, 12);
  limb(new V3(0.46, 1.15, 0), new V3(0.66, 0.62, 0.12), 0.13, M.cloth, digger);
  sphere(0.17, 0.67, 0.55, 0.13, M.skin, digger);
  limb(new V3(-0.46, 1.15, 0), new V3(-0.74, 1.28, 0.42), 0.13, M.cloth, digger);
  sphere(0.18, -0.76, 1.3, 0.44, M.skin, digger);
  limb(new V3(-0.62, 0.1, 0.75), new V3(-0.77, 1.5, 0.4), 0.028, M.cane, digger);
  const diggerMeshes = digger.getChildMeshes(); diggerMeshes.forEach(cast);
  interaction.add(diggerMeshes, { hint: 'Hablar con el enterrador', onUse: () => talk('digger') });

  /* ---------- El niño (modelo GLB) ---------- */
  const BOY_SCALE = 0.85;
  const boy = new B.TransformNode('boy', scene);
  boy.scaling.setAll(BOY_SCALE);
  boy.position.set(boyTombX, boyTombH + 0.475 - 0.561 * BOY_SCALE + 0.06, boyTombZ);
  boy.rotation.y = Math.PI;
  let boyBaseYaw = Math.PI, boyMaxDev = 0.7;
  let legPivots = [], bHead = null, shinL = null, shinR = null, shinBaseL = null, shinBaseR = null;
  const shinAxisL = new V3(0.749, -0.025, -0.662).normalize(), shinAxisR = new V3(0.749, 0.025, 0.662).normalize();

  function buildPrimitiveBoy() {   // plan B si el modelo no carga
    boy.scaling.setAll(1); boy.position.set(boyTombX, boyTombH + 0.45, boyTombZ + 0.02); boy.rotation.y = 0; boyBaseYaw = 0; boyMaxDev = Math.PI;
    capsule(0.15, 0.5, 0, 0.27, 0, M.clothBoy, boy);
    bHead = new B.TransformNode('bHead', scene); bHead.parent = boy; bHead.position.set(0, 0.72, 0);
    sphere(0.36, 0, 0, 0, M.skin, bHead, 1, 0.95, 1);
    sphere(0.385, 0, 0.09, -0.01, M.hair, bHead, 1, 0.72, 1);
    [-1, 1].forEach((s) => { sphere(0.09, s * 0.18, 0, 0, M.skin, bHead, 0.6, 1, 0.9); sphere(0.045, s * 0.075, 0.02, 0.16, M.feat, bHead); });
    box(0.07, 0.015, 0.02, 0, -0.07, 0.17, M.feat, bHead);
    legPivots = [-1, 1].map((s) => {
      const p = new B.TransformNode('hip', scene); p.parent = boy; p.position.set(s * 0.085, 0.06, 0.04);
      const th = capsule(0.06, 0.32, 0, 0, 0.13, M.clothBoy, p); th.rotation.x = Math.PI / 2;
      capsule(0.055, 0.34, 0, -0.16, 0.25, M.clothBoy, p);
      return p;
    });
    const ms = boy.getChildMeshes(); ms.forEach(cast);
    interaction.add(ms, { hint: 'Hablar con el niño', onUse: () => talk('boy') });
  }

  const BOY_GRAY = { 'Material.001': 0.15, 'NiñoPantalon': 0.09, 'NiñoPiel': 0.74, 'Pelo Flequillo': 0.04, 'Dientes': 0.85, 'Niño Nariz': 0.6, 'Niño Ojos': 0.02, 'Niño Zapatos': 0.03 };
  const boyLoad = loadModel(scene, 'child.glb').then((res) => {
    const root = res.meshes[0]; root.parent = boy;
    const parts = res.meshes.filter((m) => m.getTotalVertices() > 0);
    parts.forEach((m) => {
      const mt = m.material;
      if (mt) {
        const g = BOY_GRAY[mt.name];
        if (g !== undefined && mt.albedoColor) mt.albedoColor = new B.Color3(g, g, g);
        mt.metallic = 0; mt.roughness = 0.75; mt.environmentIntensity = 0; mt.maxSimultaneousLights = 6;
      }
      m.alwaysSelectAsActiveMesh = true; m.receiveShadows = true; cast(m);
    });
    // Babylon hace el picking sobre la malla sin deformar (en T): se usa una caja invisible.
    parts.forEach((m) => { m.isPickable = false; });
    const hit = MB.CreateBox('boyHit', { width: 0.6, height: 1.05, depth: 0.7 }, scene);
    hit.parent = boy; hit.position.set(0, 0.88, 0.05); hit.visibility = 0; hit.isPickable = true;
    interaction.add(hit, { hint: 'Hablar con el niño', onUse: () => talk('boy') });
    shinL = scene.getTransformNodeByName('DEF-shin.L'); shinR = scene.getTransformNodeByName('DEF-shin.R');
    if (shinL && shinR) { shinBaseL = shinL.rotationQuaternion.clone(); shinBaseR = shinR.rotationQuaternion.clone(); }
  }).catch((err) => { console.error('No se pudo cargar el niño', err); buildPrimitiveBoy(); });

  /* ---------- Árboles y rocas (modelos GLB) ---------- */
  function prepNature(res, gray) {
    const parts = res.meshes.filter((m) => m.getTotalVertices() > 0);
    parts.forEach((m) => {
      m.isPickable = false; m.isVisible = false;
      const mt = m.material;
      if (mt) { mt.albedoColor = new B.Color3(gray, gray, gray); mt.metallic = 0; mt.roughness = 0.9; mt.environmentIntensity = 0; mt.backFaceCulling = false; mt.twoSidedLighting = true; mt.maxSimultaneousLights = 6; }
    });
  }
  // El raíz de glTF invierte el eje X, por eso se coloca con -x.
  function place(res, name, x, z, sc, ry) {
    const src = res.meshes.find((m) => m.name === name); if (!src) return null;
    const node = new B.TransformNode('pl', scene); node.parent = res.meshes[0];
    node.position.set(-x, 0, z); node.scaling.setAll(sc); node.rotation.y = ry || 0;
    const c = src.clone(name + '_c', node); c.isVisible = true; c.isPickable = false; return c;
  }
  const treesLoad = loadModel(scene, 'trees.glb').then((res) => {
    prepNature(res, 0.11);
    [[-4.6, -0.6, 0.55, 0.4], [4.7, 3.0, 0.5, 2.0]].forEach((t) => {
      const c = place(res, 'tree', t[0], t[1], t[2], t[3]); if (!c) return;
      cast(c);
      const trunk = cyl(0.5, 0.5, 2.4, t[0], 1.2, t[1], M.bark, null, 8); trunk.visibility = 0;
      interaction.add(trunk, { text: 'Un árbol seco. Lleva muerto muchos inviernos.' });
      obstacle([t[0] - 0.35, t[0] + 0.35, t[1] - 0.35, t[1] + 0.35]);
    });
    const far = isTouch
      ? [['tree.005', -11, 9, 0.55, 0.3], ['tree', 9, 8, 1.3, 1.1], ['tree', -10, -7, 1.2, 2.4]]
      : [['tree.005', -11, 9, 0.55, 0.3], ['tree.005', 13, -9, 0.5, 2.2], ['tree', 9, 8, 1.3, 1.1], ['tree', -10, -7, 1.2, 2.4], ['tree', -8, 15, 1.4, 0.6], ['tree', 15, 3, 1.1, 1.7], ['tree', 1, -13, 1.3, 2.9]];
    far.forEach((t) => place(res, t[0], t[1], t[2], t[3], t[4]));
  }).catch((err) => { console.error('No se pudieron cargar los árboles', err); deadTree(-4.6, -0.6); deadTree(4.7, 3.0); });

  const rocksLoad = loadModel(scene, 'rocks.glb').then((res) => {
    prepNature(res, 0.3);
    [['rock_moss_set_01_rock01', -4.9, -5.0, 1.1, 0.5], ['rock_moss_set_01_rock02', -3.0, 5.0, 1.0, 1.2], ['rock_moss_set_01_rock03', 5.0, -3.2, 1.2, 2.0],
      ['rock_moss_set_01_rock04', -5.0, 1.6, 0.9, 0.1], ['rock_moss_set_01_rock05', 0.2, 4.3, 0.9, 2.6], ['rock_moss_set_01_rock06', -2.4, -5.0, 1.2, 1.9]].forEach((r) => {
      const c = place(res, r[0], r[1], r[2], r[3], r[4]); if (!c) return;
      c.isPickable = true; cast(c);
      interaction.add(c, { text: 'Una roca cubierta de musgo. Está húmeda.' });
      obstacle([r[1] - 0.55, r[1] + 0.55, r[2] - 0.55, r[2] + 0.55]);
    });
  }).catch((err) => console.error('No se pudieron cargar las rocas', err));

  /* ---------- Diálogos ---------- */
  const talkCount = { boy: 0, digger: 0 };
  function talk(who) {
    let line;
    if (who === 'boy') {
      if (game.hasItem('llave') || game.hasFlag('chestUnlocked')) line = '¡Lo abriste! Corre a la verja antes de que se dé cuenta.';
      else {
        const L = ['Hola. ¿Tú también te has colado? La verja se cierra sola de noche.',
          'El señor guardó algo en el ataúd del fondo y le puso un candado. Yo no me acerco.',
          'Dice que la combinación es lo que cuentas dentro de la tapia: lo que ilumina, lo que está seco y lo que está abierto. En ese orden.'];
        line = L[talkCount.boy % L.length]; talkCount.boy++;
      }
      ui.say('El niño', line);
    } else {
      if (game.hasItem('llave')) line = 'Vaya, ya tienes la llave. La verja está al norte, entre los dos pilares. No mires atrás.';
      else if (game.hasFlag('chestUnlocked')) line = 'Has abierto mi ataúd. No me mires así, yo solo cavo.';
      else {
        const L = ['Nadie entra a esta hora. Y nadie sale.', 'Yo cavo. El chico habla. Pregúntale a él, que no calla.',
          'Todo lo que guardo bajo llave está en el ataúd del fondo.'];
        line = L[talkCount.digger % L.length]; talkCount.digger++;
      }
      ui.say('El enterrador', line);
    }
  }

  /* ---------- Final ---------- */
  function showWin() {
    const s = Math.round((performance.now() - ctx.game.startTime) / 1000), mm = Math.floor(s / 60), ss = String(s % 60).padStart(2, '0');
    game.solvePuzzle('prototype_verja');
    ui.showEnd({
      title: 'Has salido',
      text: 'La luz lo cubre todo al otro lado. Has salido en ' + mm + ':' + ss + '. El enterrador no te quita ojo hasta el último momento.',
      button: 'Jugar otra vez',
      onClick: () => ctx.goTo('prototype')
    });
  }

  /* ---------- Bucle de la escena ---------- */
  function wrap(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
  function turnToward(node, dt, speed, base, maxDev) {
    const dx = camera.position.x - node.position.x, dz = camera.position.z - node.position.z;
    if (Math.hypot(dx, dz) > 11) return;
    let want = Math.atan2(dx, dz);
    if (base !== undefined) want = base + Math.max(-maxDev, Math.min(maxDev, wrap(want - base)));
    node.rotation.y += wrap(want - node.rotation.y) * Math.min(1, dt * speed);
  }
  let lidAngle = 0;
  S.update = (dt) => {
    time += dt;
    turnToward(digger, dt, 1.6); turnToward(boy, dt, 1.2, boyBaseYaw, boyMaxDev);
    dTorso.scaling.y = 1 + Math.sin(time * 1.6) * 0.012;
    dHead.position.y = 1.62 + Math.sin(time * 1.6) * 0.01;
    dHead.rotation.z = Math.sin(time * 0.5) * 0.04;
    // niño
    boy.scaling.y = (legPivots.length ? 1 : BOY_SCALE) * (1 + Math.sin(time * 1.7) * 0.006);
    if (shinL && shinBaseL) {
      const a = 0.15 + Math.sin(time * 2.1) * 0.32, b = 0.15 + Math.sin(time * 2.1 + 1.7) * 0.32;
      shinL.rotationQuaternion = shinBaseL.multiply(B.Quaternion.RotationAxis(shinAxisL, a));
      shinR.rotationQuaternion = shinBaseR.multiply(B.Quaternion.RotationAxis(shinAxisR, b));
    }
    if (legPivots.length) {
      legPivots[0].rotation.x = Math.sin(time * 2.1) * 0.2; legPivots[1].rotation.x = Math.sin(time * 2.1 + 1.6) * 0.2;
      if (bHead) bHead.rotation.z = Math.sin(time * 0.9) * 0.06;
    }
    // entorno
    lidAngle += ((game.hasFlag('chestUnlocked') ? 1.7 : 0) - lidAngle) * Math.min(1, dt * 3); lidPivot.rotation.z = lidAngle;
    if (doorOpening) gatePivot.rotation.y += (-1.7 - gatePivot.rotation.y) * Math.min(1, dt * 2);
    if (!keyNode.isDisposed() && keyNode.isEnabled()) keyNode.rotation.y += dt * 1.4;
  };

  await Promise.allSettled([boyLoad, treesLoad, rocksLoad]);
}
