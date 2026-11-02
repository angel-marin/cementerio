// Acto 6: "Las dudas".
//   Puzle 11, "Sostén tu sueño": mantener pulsado Usar para que el sueño brille mientras las sombras de las dudas intentan apagarlo.
//   Jefe final, "La Gente": una figura hecha de voces. Se supera con un recorrido que combina oscuridad, seguir al sueño y el hilo.
// No hay combate ni daño: si el sueño se apaga, se vuelve a encender y se retrocede a un punto de control.
import { createHelpers } from '../core/helpers.js';
import * as game from '../core/state.js';
import { sfx } from '../core/audio.js';
import { CONFIG } from '../config.js';
import * as K from './_kit.js';
import { createFlashlight } from '../mechanics/flashlight.js';
import { createTether } from '../mechanics/tether.js';
import { createFollowDream } from '../mechanics/followDream.js';
import { createThread } from '../mechanics/thread.js';

const B = window.BABYLON;
const T = CONFIG.story.act6;
const T4 = CONFIG.story.act4;

export const id = 'act6_doubts';
export const title = 'Acto 6: Las dudas';
export const ambient = 'viento';   // sonido de fondo (viento, interior, cripta, alba)
export const sceneOptions = { moon: true, shadows: false, hemiIntensity: 0.22, fogDensity: 0.05, fogColor: [0.04, 0.04, 0.045] };

// Parámetros del puzle 11 (se pueden retocar)
export const HOLD = {
  holdRate: 0.45,        // cuánto sube el brillo por segundo al mantener Usar
  decay: 0.06,           // cuánto baja por segundo por las voces
  dimRate: 0.9,          // cuánto baja por segundo una sombra pegada al sueño
  holdShield: 0.5,       // al mantener Usar, las sombras apagan la mitad
  dimRadius: 3.0,        // distancia a la que una sombra empieza a apagar
  shadowSpeed: 0.55,     // m/s de las sombras
  litThreshold: 0.45,    // por encima de este brillo se avanza
  progressBase: 0.02, progressGain: 0.035,   // avance por segundo = base + gain * brillo
  voiceEvery: 5          // segundos entre voces
};

export const LAYOUT = {
  start: [0, -5.5],
  dreamHome: [0, -3.4],
  shadows: [[-5.5, 5.5], [5.5, 5.5], [5.5, -1.0], [-5.5, 1.0]],
  tombs: [[-4.0, -1.5, 0.9], [2.5, 0.5, 0.9], [-2.5, 2.5, 1.0], [3.5, -5.0, 0.9]],
  // La Gente
  figure: [0, 6.2],
  leg1: { start: [-5.5, -5.5], p1: [-5.0, 4.8], path: [[-5.5, -5.5], [-5.5, -1.0], [-4.8, 2.0], [-5.0, 4.8]] },
  leg2: { path: [[-5.0, 4.8], [-1.5, 5.2], [1.0, 3.0], [4.5, 3.5], [5.5, 0.8], [5.0, -3.0]], p2: [5.0, -3.0] },
  leg3: { A: [5.0, -4.0], B: [-5.0, -4.0], fixed: [[0, -7, 0, -1.5], [-2.5, 7, -2.5, -3.0]], solution: [[5.0, -4.0], [5.0, -0.8], [0.3, -0.8], [-1.3, -2.0], [-1.4, -4.2], [-5.0, -4.2], [-5.0, -4.0]] }
};

let S = null;
export function unload() { S = null; }

export async function load(ctx) {
  const { scene, player, interaction, ui, audio, input } = ctx;
  const h = createHelpers(scene);
  const M = K.materials(h);
  const { MB, V3, box, cyl, sphere, mat } = h;
  S = { phase: 'hold', b: 0.5, p: 0, checkpoint: 0, voiceT: 2, voiceI: 0, quiet: 0, extinguished: 0, leg: -1, shadows: [], crowd: null, time: 0, bossVoiceT: 4, hintT: 0 };

  ['pala', 'farol', 'llaves'].forEach((i) => game.addItem(i));
  player.setBounds({ minX: -6.8, maxX: 6.8, minZ: -6.8, maxZ: 6.8 });
  player.teleport(LAYOUT.start[0], LAYOUT.start[1], 0, 0);

  /* ---------- Cementerio ---------- */
  K.skyDome(ctx, h);
  K.groundPlane(ctx, h, M, { width: 16.4, depth: 16.4 });
  box(0.4, 2.8, 16.4, -8.2, 1.4, 0, M.wall); box(0.4, 2.8, 16.4, 8.2, 1.4, 0, M.wall);
  box(16.4, 2.8, 0.4, 0, 1.4, -8.2, M.wall); box(16.4, 2.8, 0.4, 0, 1.4, 8.2, M.wall);
  LAYOUT.tombs.forEach((t) => K.tomb(ctx, h, M, t[0], t[1], t[2]));
  K.nature(ctx, h, M, { far: [['tree.005', -13, 8, 0.55, 0.3], ['tree', 12, 9, 1.3, 1.1], ['tree', -12, -9, 1.2, 2.4]] });
  const fl = createFlashlight(ctx, { startOn: false, available: true });

  /* ---------- Puzle 11: sostén tu sueño ---------- */
  const tether = createTether(ctx, h, { home: new V3(LAYOUT.dreamHome[0], 1.2, LAYOUT.dreamHome[1]), maxTurn: 99, maxSpeed: 99, maxDistance: 7.5 });
  interaction.add(tether.hit, {
    hint: () => (tether.isTied ? 'Mantén pulsado Usar' : T.holdTie),
    onUse: () => { if (S.phase === 'hold' && tether.state === 'idle') { if (tether.tie()) startHold(); else ui.toast('Acércate más al sueño.'); } }
  });
  tether.onReleased = () => { ui.toast('Te has alejado demasiado. El sueño vuelve contigo cuando quieras atarlo.', 4000); ui.rhythm.hide(); S.holding = false; };

  const shadowMat = mat('#000000', { spec: 0 }); shadowMat.alpha = 0.72; shadowMat.disableLighting = true; shadowMat.emissiveColor = new B.Color3(0, 0, 0);
  LAYOUT.shadows.forEach(([x, z], i) => {
    const node = new B.TransformNode('shadowZone' + i, scene); node.position.set(x, 0, z);
    const disc = MB.CreateDisc('shadowDisc', { radius: 1.7, tessellation: 32 }, scene);
    disc.rotation.x = Math.PI / 2; disc.position.y = 0.03; disc.material = shadowMat; disc.parent = node; disc.isPickable = false;
    const wisps = [];
    for (let k = 0; k < 4; k++) {
      const w = cyl(0.05, 0.4, 1.6 + k * 0.3, Math.cos(k * 1.6) * 0.9, 0.9, Math.sin(k * 1.6) * 0.9, shadowMat, node, 7);
      w.isPickable = false; wisps.push(w);
    }
    interaction.add(disc, { text: T.look.sombra });
    S.shadows.push({ node, wisps, base: [x, z], r: 1.7, scale: 1 });
  });

  function startHold() {
    S.holding = true;
    ui.rhythm.show(T.barText);
    ui.narrate(ctx.isTouch ? T.holdPromptTouch : T.holdPromptDesktop, 9000);
  }

  function nearestShadow(px, pz) {
    let best = Infinity;
    S.shadows.forEach((s) => { best = Math.min(best, Math.hypot(s.node.position.x - px, s.node.position.z - pz) - 0.3); });
    return best;
  }

  function updateHold(dt) {
    if (!S.holding || !tether.isTied) return;
    const d = tether.position;
    // las sombras se acercan despacio al sueño
    S.shadows.forEach((s, i) => {
      const dx = d.x - s.node.position.x, dz = d.z - s.node.position.z, dist = Math.hypot(dx, dz) || 1;
      const v = HOLD.shadowSpeed * s.scale;
      s.node.position.x += dx / dist * v * dt + Math.sin(S.time * 0.7 + i) * 0.15 * dt;
      s.node.position.z += dz / dist * v * dt + Math.cos(S.time * 0.6 + i * 2) * 0.15 * dt;
      s.node.position.x = Math.max(-6.9, Math.min(6.9, s.node.position.x)); s.node.position.z = Math.max(-6.9, Math.min(6.9, s.node.position.z));
      s.wisps.forEach((w, k) => { w.scaling.y = 1 + Math.sin(S.time * 2 + k + i) * 0.15; });
    });
    // brillo
    const held = input.isUseHeld();
    let dim = 0;
    S.shadows.forEach((s) => { const dist = Math.hypot(s.node.position.x - d.x, s.node.position.z - d.z); dim += HOLD.dimRate * Math.max(0, 1 - dist / HOLD.dimRadius); });
    dim *= (1 - 0.5 * S.p) * (held ? HOLD.holdShield : 1);
    S.b += ((held ? HOLD.holdRate : -HOLD.decay) - dim) * dt;
    S.b = Math.max(0, Math.min(1, S.b));
    if (S.quiet > 0) { S.quiet -= dt; S.b = Math.max(S.b, 0.3); }
    // avance: cuanto más brilla, más rápido; y más fuerte brilla cuanto más ha avanzado
    if (S.b > HOLD.litThreshold) S.p = Math.min(1, S.p + (HOLD.progressBase + HOLD.progressGain * S.b) * dt);
    tether.brightness = S.b;
    tether.light.range = 4 + 6 * S.p;
    ui.rhythm.update(S.b, S.p);
    // puntos de control
    const cp = Math.floor(S.p * 4) / 4;
    if (cp > S.checkpoint) { S.checkpoint = cp; if (cp < 1) { ui.toast(T.checkpoint, 2500); sfx.chime(Math.round(cp * 4)); } }
    // se apaga: vuelve a encenderse y se retrocede al último punto de control (sin castigo)
    if (S.b <= 0.02) {
      S.extinguished++; S.b = 0.4; S.p = S.checkpoint; S.quiet = 3;
      S.shadows.forEach((s) => { s.node.position.x += (s.node.position.x - d.x) * 0.8; s.node.position.z += (s.node.position.z - d.z) * 0.8; });
      ui.toast(T.extinguished, 4500); sfx.soft();
    }
    // voces
    S.voiceT -= dt * (1 + Math.max(0, 1 - nearestShadow(d.x, d.z) / 4));
    if (S.voiceT <= 0 && S.quiet <= 0) { S.voiceT = HOLD.voiceEvery; ui.narrate(T.doubts[S.voiceI++ % T.doubts.length], 2400); sfx.whisper(); }
    if (S.p >= 1) finishHold();
  }

  async function finishHold() {
    S.holding = false; S.phase = 'between';
    ui.rhythm.hide();
    game.solvePuzzle('p11_sosten'); game.addJournal(T.journalHold);
    sfx.open();
    S.shadows.forEach((s) => { s.dissolve = true; });
    await ui.narrateAll(T.holdDone);
    startBoss();
  }

  /* ---------- La Gente ---------- */
  function buildCrowd() {
    const base = MB.CreateSphere('crowdBase', { diameter: 0.45, segments: 6 }, scene);
    const dark = mat('#050505', { spec: 0 });
    base.material = dark; base.isPickable = false; base.isVisible = false;   // solo se ven las instancias
    const parts = [];
    let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const add = (x, y, z, s) => { const m = base.createInstance('crowd' + parts.length); m.position.set(x, y, z); m.scaling.setAll(s); m.isPickable = false; parts.push({ m, x, y, z, s, k: rnd() * 6 }); };
    for (let i = 0; i < 14; i++) add((rnd() - 0.5) * 1.0, 4.3 + (rnd() - 0.5) * 0.9, (rnd() - 0.5) * 0.6, 0.9 + rnd() * 0.7);           // cabeza
    for (let i = 0; i < 34; i++) add((rnd() - 0.5) * 2.6, 2.0 + rnd() * 1.9, (rnd() - 0.5) * 0.9, 1.0 + rnd() * 0.8);                    // torso
    for (const sx of [-1, 1]) for (let i = 0; i < 9; i++) add(sx * (1.4 + i * 0.22), 3.5 - i * 0.2, (rnd() - 0.5) * 0.5, 0.7 + rnd() * 0.5); // brazos
    for (let i = 0; i < 24; i++) { const a = rnd() * 6.28, r = 0.4 + rnd() * 1.3; add(Math.cos(a) * r, 0.3 + rnd() * 1.6, Math.sin(a) * r * 0.5, 1.0 + rnd() * 0.9); } // capa
    const root = new B.TransformNode('laGente', scene); root.position.set(LAYOUT.figure[0], 0, LAYOUT.figure[1]);
    parts.forEach((p) => { p.m.parent = root; });
    const hit = MB.CreateBox('crowdHit', { width: 3.4, height: 5, depth: 1.6 }, scene);
    hit.parent = root; hit.position.y = 2.5; hit.visibility = 0; hit.isPickable = true;
    interaction.add(hit, { text: T.look.gente });
    return { root, parts, scale: 1, dissolving: false };
  }

  function startBoss() {
    S.phase = 'boss';
    tether.dispose();
    S.crowd = buildCrowd();
    ui.narrateAll(T.bossIntro).then(() => { if (S) startLeg(0); });
  }

  function setLight(dark) {
    ctx.hemi.intensity = dark ? 0.02 : 0.22;
    if (ctx.moon) ctx.moon.intensity = dark ? 0.0 : 0.6;
  }

  let stage = null;
  const clearStage = () => { if (stage) { stage.obstacles.forEach((r) => player.removeObstacle(r)); stage.threads.forEach((t) => t.dispose()); stage.items.forEach((d) => d.dispose && d.dispose()); stage.group.dispose(false, false); } stage = null; };
  const newStage = () => (stage = { group: new B.TransformNode('leg', scene), threads: [], items: [], obstacles: [] });
  const pedestal = (x, z, parent) => {
    const base = cyl(0.8, 0.9, 0.22, x, 0.11, z, M.stone, parent, 18);
    const ring = MB.CreateTorus('ring', { diameter: 0.9, thickness: 0.04, tessellation: 24 }, scene);
    ring.position.set(x, 0.24, z); ring.material = M.fire; ring.parent = parent; ring.isPickable = false;
    return base;
  };

  function startLeg(n) {
    clearStage(); fl.clearShadowObjects();
    S.leg = n;
    const st = newStage();
    ui.narrate(T.legs[n], 12000);
    if (n === 0) {
      setLight(true);
      const L = LAYOUT.leg1;
      player.teleport(L.start[0], L.start[1], Math.atan2(L.path[1][0] - L.path[0][0], L.path[1][1] - L.path[0][1]), 0);
      K.orbTrail(ctx, h, fl, L.path, { spacing: 1.2, parent: st.group });
      const ped = pedestal(L.p1[0], L.p1[1], st.group);
      const ringMesh = ped; interaction.add(ringMesh, { text: T.pedestal });
      const goal = MB.CreateTorus('goalRing', { diameter: 1.4, thickness: 0.07, tessellation: 24 }, scene);
      goal.position.set(L.p1[0], 1.2, L.p1[1]); goal.rotation.x = Math.PI / 2; goal.parent = st.group;
      const gm = new B.StandardMaterial('goalMat', scene); gm.disableLighting = true; gm.emissiveColor = new B.Color3(1, 1, 1); goal.material = gm;
      fl.addShadowObject(goal, { useShadowMaterial: false, maxVisibility: 1 });
    }
    if (n === 1) {
      setLight(false);
      const L = LAYOUT.leg2;
      const d = createFollowDream(ctx, { path: L.path.map(([x, z]) => new V3(x, 1.3, z)), speed: 1.3, maxDistance: 5.5 });
      stage.items.push(d);
      const hit = MB.CreateSphere('dreamHit', { diameter: 1.0, segments: 6 }, scene);
      hit.parent = d.mesh; hit.visibility = 0; hit.isPickable = true;
      interaction.add(hit, { hint: () => (d.isRunning ? 'Sigue la luz' : 'Seguir el sueño'), onUse: () => { if (!d.isRunning && !d.isArrived) { d.start(); ui.narrate(CONFIG.story.act3.follow.prompt, 6000); } } });
      d.onWait = (w) => { if (w) ui.narrate(CONFIG.story.act3.follow.wait, 2200); };
      d.onArrived = () => { legDone(1); };
      pedestal(L.path[0][0], L.path[0][1], st.group); pedestal(L.p2[0], L.p2[1], st.group);
      player.teleport(L.path[0][0] + 1.2, L.path[0][1] - 1.2, 0, 0);
    }
    if (n === 2) {
      setLight(false);
      const L = LAYOUT.leg3;
      const fixed = L.fixed.map(([x1, z1, x2, z2]) => { const t = createThread(ctx, { from: new V3(x1, 0.85, z1), color: '#4a4a4a' }); t.start(); t.connect(new V3(x2, 0.85, z2)); st.threads.push(t); return t; });
      const aPost = [cyl(0.08, 0.1, 0.8, L.A[0], 0.4, L.A[1], M.iron, st.group, 8), sphere(0.26, L.A[0], 0.95, L.A[1], M.fire, st.group)];
      const bPost = [cyl(0.08, 0.1, 0.8, L.B[0], 0.4, L.B[1], M.iron, st.group, 8), sphere(0.34, L.B[0], 0.95, L.B[1], M.fire, st.group)];
      const thread = createThread(ctx, { from: new V3(L.A[0], 0.85, L.A[1]), color: '#ffffff', others: fixed });
      st.threads.push(thread); S.thread = thread;
      thread.onBroken = () => { sfx.bad(); ui.toast(T4.knotBreak.otro, 4500); };
      thread.onConnected = () => legDone(2);
      interaction.add(aPost, {
        hint: () => (thread.state === 'idle' ? T4.knotHint.A : thread.isCarrying ? T4.knotHint.carrying : 'Recogiendo...'),
        onUse: () => { if (thread.state === 'idle') { thread.start(); sfx.pick(); } else if (thread.isCarrying) thread.retract(); },
        text: T4.look.corazon
      });
      interaction.add(bPost, { hint: () => (thread.isCarrying ? T4.knotHint.B : T4.knotHint.Bwait), onUse: () => { if (thread.isCarrying) thread.connect(new V3(L.B[0], 0.85, L.B[1])); }, text: T4.look.cabeza });
      // los brazos de La Gente: hilos de voces
      player.teleport(L.A[0] - 0.8, L.A[1] + 0.2, -Math.PI / 2, 0);
    }
  }

  async function legDone(n) {
    if (S.legBusy === n) return; S.legBusy = n;
    sfx.open(); game.solvePuzzle('p11_tramo' + (n + 1));
    if (n < 2) {
      ui.toast(T.legDone[n], 3500);
      await ctx.wait(1.4);
      startLeg(n + 1);
      return;
    }
    S.phase = 'done';
    game.solvePuzzle('p11_gente'); game.solvePuzzle('act6'); game.addJournal(T.journalBoss);
    S.crowd.dissolving = true;
    await ui.narrateAll(T.bossDone);
    for (const v of T.afterVoices) { ui.narrate(v, 1800); sfx.chime(1); await ctx.wait(1.6); }
    ctx.goTo('act7_gravediggerDream');
  }

  /* ---------- Bucle ---------- */
  ctx.addUpdater((dt) => {
    S.time += dt;
    if (S.phase === 'hold') updateHold(dt);
    // sombras que se disuelven
    S.shadows.forEach((s) => { if (s.dissolve && s.scale > 0) { s.scale = Math.max(0, s.scale - dt * 0.7); s.node.scaling.setAll(Math.max(0.001, s.scale)); } });
    // la figura de voces
    if (S.crowd) {
      const c = S.crowd;
      if (c.dissolving) { c.scale = Math.max(0, c.scale - dt * 0.4); c.root.scaling.setAll(Math.max(0.001, c.scale)); }
      c.parts.forEach((p, i) => { p.m.position.x = p.x + Math.sin(S.time * 1.1 + p.k) * 0.08; p.m.position.y = p.y + Math.sin(S.time * 0.9 + p.k * 2) * 0.1; });
      if (S.phase === 'boss') {
        S.bossVoiceT -= dt;
        if (S.bossVoiceT <= 0 && !ui.dialogueOpen) { S.bossVoiceT = 7; ui.narrate(T.bossVoices[S.voiceI++ % T.bossVoices.length], 2400); sfx.whisper(); }
      }
    }
    // tramo 1: llegar al primer pedestal en la oscuridad
    if (S.phase === 'boss' && S.leg === 0 && !S.legBusy) {
      const p1 = LAYOUT.leg1.p1;
      if (Math.hypot(player.position.x - p1[0], player.position.z - p1[1]) < 1.0) legDone(0);
    }
  });

  K.hiddenDreams(ctx, h, id);

  /* ---------- Guion ---------- */
  (async function flow() {
    await ctx.whenStarted();
    audio.startPad('noche');
    await ui.narrateAll(T.intro);
    ui.narrate('Acércate al sueño y átalo. Después, mantén pulsado Usar para sostenerlo.', 9000);
  })();
}
