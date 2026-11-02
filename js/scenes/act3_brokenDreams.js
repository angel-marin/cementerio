// Acto 3: "Sueños rotos".
//   Puzle 4, "Rompecabezas de sueños": recoger fragmentos y devolver su forma a tres sueños (cohete, violín, balón).
//   Puzle 5, "Los que se alejan": seguir a dos sueños que se escapan hasta su lápida.
//   Puzle 6, "El orden de las edades": colocar las lápidas por edades, de menor a mayor, para abrir la cripta.
import { createHelpers } from '../core/helpers.js';
import * as game from '../core/state.js';
import { sfx } from '../core/audio.js';
import { CONFIG } from '../config.js';
import * as K from './_kit.js';
import { createFlashlight } from '../mechanics/flashlight.js';
import { createFollowDream } from '../mechanics/followDream.js';
import { DREAMS, createFragment, createDreamPuzzle, fragmentStatus, resetFragments } from '../mechanics/dreamFragment.js';

const B = window.BABYLON;
const T = CONFIG.story.act3;

export const id = 'act3_brokenDreams';
export const title = 'Acto 3: Sueños rotos';
export const ambient = 'viento';   // sonido de fondo (viento, interior, cripta, alba)
export const sceneOptions = { moon: true, shadows: true, hemiIntensity: 0.3, fogDensity: 0.04, fogColor: [0.045, 0.045, 0.045] };

// Datos del mapa (se exportan para poder revisarlos y probarlos)
export const LAYOUT = {
  decorTombs: [[-3.2, -4.8, 0.9], [2.6, -4.6, 1.0], [-5.6, -5.2, 0.8], [5.8, -5.4, 0.9], [-2.6, 0.6, 1.0], [2.6, 0.9, 0.9], [-4.2, 2.0, 0.9], [4.4, 1.6, 0.9]],
  dreamTombs: { cohete: [-5.4, -1.2], violin: [5.4, -1.2], balon: [0, -1.6] },
  fragments: [
    ['cohete', 'punta', -6.6, -3.4], ['cohete', 'cuerpo', -2.0, -6.4], ['cohete', 'aletas', -4.4, 3.8],
    ['violin', 'mastil', 6.5, -3.6], ['violin', 'caja', 3.8, -2.6], ['violin', 'arco', 3.9, 3.6],
    ['balon', 'arriba', -0.8, 0.9], ['balon', 'abajo', 0.6, -5.4], ['balon', 'cinta', 0.4, 3.2]
  ],
  slabAges: [6, 2, 7, 5, 4],       // orden inicial (desordenado)
  slabX: [-3, -1.5, 0, 1.5, 3],
  slabZ: 4.2,
  runaway: {
    6: { tomb: [-6.4, 3.4], path: [[2.2, -0.6], [1.0, -3.2], [-1.2, -2.4], [-2.0, 0.0], [-1.0, 2.4], [-3.0, 3.4], [-5.4, 3.0], [-6.4, 2.6]] },
    7: { tomb: [6.4, 3.4], path: [[-2.2, -0.4], [-0.8, -3.6], [1.8, -2.2], [2.8, 0.0], [1.4, 2.4], [3.6, 3.4], [5.4, 3.0], [6.4, 2.6]] }
  }
};

let S = null;
export function unload() { S = null; }

export async function load(ctx) {
  const { scene, player, interaction, ui, audio } = ctx;
  const h = createHelpers(scene);
  const M = K.materials(h);
  const { MB, V3, box, cyl, noiseTex } = h;
  S = { dreamsDone: 0, row: false, selected: null, slabs: [], cryptOpen: false, runaways: 0, placed: {} };

  // Si se llega aquí con el menú de depuración, se dan las cosas de los actos anteriores.
  ['pala', 'farol', 'llaves'].forEach((i) => game.addItem(i));
  resetFragments();
  player.setBounds({ minX: -7.2, maxX: 7.2, minZ: -7.2, maxZ: 7.3 });
  player.teleport(0, -6.4, 0, 0);

  /* ---------- Cementerio ---------- */
  K.skyDome(ctx, h);
  K.groundPlane(ctx, h, M, { width: 16.4, depth: 16.4 });
  box(0.4, 2.8, 16.4, -8.2, 1.4, 0, M.wall); box(0.4, 2.8, 16.4, 8.2, 1.4, 0, M.wall); box(16.4, 2.8, 0.4, 0, 1.4, -8.2, M.wall);
  LAYOUT.decorTombs.forEach((t) => K.tomb(ctx, h, M, t[0], t[1], t[2]));
  K.lantern(ctx, h, M, -6.8, 5.6); K.lantern(ctx, h, M, 6.8, -6.6);
  K.nature(ctx, h, M, { far: [['tree.005', -13, 8, 0.55, 0.3], ['tree', 12, 9, 1.3, 1.1], ['tree', -12, -9, 1.2, 2.4], ['tree', 14, -8, 1.1, 1.7]] });
  createFlashlight(ctx, { startOn: false, available: game.hasItem('farol') });

  /* ---------- La cripta (muro norte con puerta) ---------- */
  box(7.5, 3.4, 2.0, -4.45, 1.7, 7.2, M.stone); box(7.5, 3.4, 2.0, 4.45, 1.7, 7.2, M.stone); box(1.4, 1.1, 2.0, 0, 2.85, 7.2, M.stone);
  box(0.3, 3.6, 0.3, -0.95, 1.8, 6.1, M.stone); box(0.3, 3.6, 0.3, 0.95, 1.8, 6.1, M.stone); box(2.4, 0.3, 0.4, 0, 3.55, 6.1, M.stone);
  player.addObstacle([-8.2, -0.7, 6.2, 8.2]); player.addObstacle([0.7, 8.2, 6.2, 8.2]);
  const light = MB.CreatePlane('cryptLight', { width: 1.4, height: 2.3 }, scene);
  light.position.set(0, 1.15, 8.05); light.material = M.pane; light.isPickable = false;
  const doorSlab = box(1.4, 2.3, 0.3, 0, 1.15, 6.4, M.stone);
  const doorRect = [-0.7, 0.7, 6.2, 6.5];
  player.addObstacle(doorRect);
  const plaqueTex = h.dtex(256, 128, (c, w, hh) => {
    c.fillStyle = '#2a2a2a'; c.fillRect(0, 0, w, hh);
    c.fillStyle = '#e8e8e8'; c.font = '20px serif'; c.textAlign = 'center';
    c.fillText('De los más pequeños', w / 2, 52); c.fillText('a los mayores', w / 2, 82);
  });
  const plaque = MB.CreatePlane('plaque', { width: 0.8, height: 0.4 }, scene);
  plaque.position.set(1.6, 1.5, 6.15); plaque.material = h.texMat(plaqueTex, { spec: 0 });
  interaction.add([doorSlab, plaque], { hint: () => (S.cryptOpen ? 'La cripta está abierta' : 'Leer la placa de la cripta'), text: T.plaque });

  /* ---------- El sepulturero ---------- */
  const digger = K.buildGravedigger(ctx, h, M, { full: true });
  digger.root.position.set(2.0, 0, -5.8);
  interaction.add(digger.meshes, { hint: 'Hablar con el sepulturero', onUse: () => ui.say('Sepulturero', S.cryptOpen ? 'Entra cuando quieras.' : 'Un sueño roto vuelve a ser sueño si alguien se toma la molestia, chico.', 5000) });
  player.addObstacle([1.6, 2.4, -6.2, -5.4]);

  /* ---------- Puzle 4: fragmentos y rompecabezas ---------- */
  const refreshStatus = () => ui.setStatus(fragmentStatus(S.placed));
  const puzzles = {};
  Object.keys(DREAMS).forEach((d) => {
    const [tx, tz] = LAYOUT.dreamTombs[d];
    K.tomb(ctx, h, M, tx, tz, 1.3, T.dreamTombs[d]);
    puzzles[d] = createDreamPuzzle(ctx, h, {
      dream: d, origin: new V3(tx, 2.0, tz),
      onPlaced: (piece, n) => { S.placed[d] = n; refreshStatus(); },
      onSolved: () => dreamSolved(d)
    });
  });
  LAYOUT.fragments.forEach(([dream, piece, x, z]) => createFragment(ctx, h, { dream, piece, position: new V3(x, 0.9, z), onCollected: refreshStatus }));
  refreshStatus();

  function dreamSolved(d) {
    game.addJournal(T.dreamDone[d]); game.solvePuzzle('p4_' + d);
    ui.toast(T.dreamDone[d].title + ' entero. ' + CONFIG.story.act2.newEntry, 4000);
    S.dreamsDone++;
    if (S.dreamsDone < 3) { ui.narrate(T.oneDone[0], 5000); return; }
    game.solvePuzzle('p4_suenos');
    ui.setStatus('');
    phaseFollow();
  }

  /* ---------- Puzle 5: los que se alejan ---------- */
  const tombWithAge = (age, x, z) => {
    const parts = K.tomb(ctx, h, M, x, z, 1.1, T.follow['tomb' + age]);
    return parts;
  };
  tombWithAge(6, ...LAYOUT.runaway[6].tomb); tombWithAge(7, ...LAYOUT.runaway[7].tomb);

  async function phaseFollow() {
    await ctx.wait(1.0);
    await ui.narrateAll(T.allDone);
    spawnRunaway(6);
  }

  function spawnRunaway(age) {
    const cfg = LAYOUT.runaway[age];
    const d = createFollowDream(ctx, { path: cfg.path.map(([x, z]) => new V3(x, 1.3, z)), speed: 1.35, maxDistance: 5.5 });
    const hit = MB.CreateSphere('dreamHit', { diameter: 1.0, segments: 6 }, scene);
    hit.parent = d.mesh; hit.visibility = 0; hit.isPickable = true;
    interaction.add(hit, {
      hint: () => (d.isArrived ? 'Un sueño que descansa' : d.isRunning ? 'Sigue la luz' : T.follow.hint),
      onUse: () => {
        if (d.isArrived) { ui.toast(T.follow['arrived' + age], 3500); return; }
        if (d.isRunning) { ui.toast(T.follow.busy, 2500); return; }
        d.start(); ui.narrate(T.follow.prompt, 7000);
      }
    });
    d.onWait = (w) => { if (w) ui.narrate(T.follow.wait, 2200); };
    d.onArrived = () => {
      S.runaways++;
      sfx.open(); ui.toast(T.follow['arrived' + age], 4500);
      game.solvePuzzle('p5_' + age);
      if (age === 6) { ui.narrate(T.follow.next, 6000); spawnRunaway(7); }
      else { game.solvePuzzle('p5_suenos'); game.addJournal(T.journalFollow); unlockSlabs(); }
    };
    ui.narrate(T.follow.busy, 6000);
    return d;
  }

  /* ---------- Puzle 6: el orden de las edades ---------- */
  const SLAB_Y = 0.8, HIDDEN_Y = -0.9;
  const numTex = (age) => h.dtex(128, 192, (c, w, hh) => {
    c.fillStyle = '#2c2c2c'; c.fillRect(0, 0, w, hh);
    c.fillStyle = '#ececec'; c.font = 'bold 110px serif'; c.textAlign = 'center'; c.fillText(String(age), w / 2, hh / 2 + 30);
    c.font = '20px serif'; c.fillText('años', w / 2, hh - 24);
  });
  LAYOUT.slabX.forEach((x) => box(0.9, 0.3, 0.7, x, 0.15, LAYOUT.slabZ, M.stone));
  player.addObstacle([-3.5, 3.5, LAYOUT.slabZ - 0.35, LAYOUT.slabZ + 0.35]);   // para llegar a la puerta hay que rodear la fila
  LAYOUT.slabAges.forEach((age, i) => {
    const node = new B.TransformNode('slab' + age, scene); node.position.set(LAYOUT.slabX[i], HIDDEN_Y, LAYOUT.slabZ);
    const sm = M.stone.clone('slabMat' + age);
    const body = box(0.62, 1.0, 0.16, 0, 0, 0, sm, node);
    const num = MB.CreatePlane('num' + age, { width: 0.46, height: 0.62 }, scene);
    num.parent = node; num.position.set(0, 0.04, -0.09); num.material = h.texMat(numTex(age), { spec: 0 });
    const slab = { age, node, mat: sm, slot: i, y: HIDDEN_Y, targetY: HIDDEN_Y, x: LAYOUT.slabX[i] };
    S.slabs.push(slab);
    interaction.add([body, num], {
      hint: () => (S.selected === slab ? 'Soltar esta lápida' : S.selected ? T.slabHintSwap : T.slabHintPick),
      onUse: () => pickSlab(slab)
    });
  });

  function unlockSlabs() {
    S.row = true;
    S.slabs.forEach((s) => { s.targetY = SLAB_Y; });
    sfx.door();
    ui.narrate(T.slabsRise, 8000);
  }

  function setSelected(slab) {
    if (S.selected) S.selected.mat.emissiveColor = new B.Color3(0, 0, 0);
    S.selected = slab;
    if (slab) { slab.mat.emissiveColor = new B.Color3(0.4, 0.4, 0.45); }
  }

  function pickSlab(slab) {
    if (!S.row || S.cryptOpen) return;
    if (!S.selected) { setSelected(slab); sfx.tick(); return; }
    if (S.selected === slab) { setSelected(null); sfx.tock(); return; }
    const a = S.selected, b = slab;
    [a.slot, b.slot] = [b.slot, a.slot];
    sfx.pick();
    setSelected(null);
    if (isSorted()) openCrypt();
  }

  function isSorted() {
    const bySlot = S.slabs.slice().sort((p, q) => p.slot - q.slot).map((s) => s.age);
    return bySlot.every((v, i) => i === 0 || bySlot[i - 1] < v);
  }

  async function openCrypt() {
    S.cryptOpen = true;
    game.solvePuzzle('p6_edades'); game.addJournal(T.journalCrypt);
    S.slabs.forEach((s) => { s.mat.emissiveColor = new B.Color3(0.25, 0.25, 0.28); });
    player.removeObstacle(doorRect);
    sfx.door();
    ui.narrate(T.slabSorted, 6000);
    await ctx.wait(1.5);
    await ui.dialogue(T.cryptOpen);
    ui.narrate(T.enter, 600000);
    await ctx.waitUntil(() => Math.abs(player.position.x) < 0.8 && player.position.z > 6.7);
    ui.clearNarration();
    game.solvePuzzle('act3');
    ctx.goTo('act4_tieDreams');
  }

  /* ---------- Animaciones ---------- */
  ctx.addUpdater((dt) => {
    digger.update(dt);
    S.slabs.forEach((s) => {
      s.y += (s.targetY - s.y) * Math.min(1, dt * 3);
      s.x += (LAYOUT.slabX[s.slot] - s.x) * Math.min(1, dt * 6);
      s.node.position.set(s.x, s.y, LAYOUT.slabZ);
    });
    if (S.cryptOpen) doorSlab.position.y += (-1.4 - doorSlab.position.y) * Math.min(1, dt * 2);
  });

  K.hiddenDreams(ctx, h, id);

  /* ---------- Guion ---------- */
  (async function flow() {
    await ctx.whenStarted();
    audio.startPad('noche');
    await ui.dialogue(T.intro);
    ui.narrate(T.objective, 9000);
    await ctx.wait(9);
    ui.narrate(T.fragmentsHelp, 9000);
  })();
}
