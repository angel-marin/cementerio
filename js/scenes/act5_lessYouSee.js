// Acto 5: "Cuanto menos veas" (la cripta oscura).
//   Puzle 9, "Apaga la luz": con la linterna encendida solo se ven paredes; a oscuras brillan cinco símbolos que hay que repetir en orden.
//   Puzle 10, "Brillo inverso": tres salas en las que la luz hace desaparecer los sueños y la oscuridad los muestra.
import { createHelpers } from '../core/helpers.js';
import * as game from '../core/state.js';
import { sfx } from '../core/audio.js';
import { CONFIG } from '../config.js';
import * as K from './_kit.js';
import { createFlashlight } from '../mechanics/flashlight.js';

const B = window.BABYLON;
const T = CONFIG.story.act5;

export const id = 'act5_lessYouSee';
export const title = 'Acto 5: Cuanto menos veas';
export const ambient = 'cripta';   // sonido de fondo (viento, interior, cripta, alba)
export const sceneOptions = { moon: false, shadows: false, hemiIntensity: 0.012, fogDensity: 0.07, fogColor: [0.004, 0.004, 0.004], clear: [0, 0, 0] };

// Símbolos de la sala y orden que hay que repetir (índices en SYMBOLS)
export const SYMBOLS = ['círculo', 'triángulo', 'cuadrado', 'rombo', 'cruz'];
export const SEQUENCE = [2, 0, 3, 1, 4];
export const HALL = { start: [0, -5.5], door: [7, -3], symbolsZ: 6.6, symbolX: [-4, -2, 0, 2, 4] };

// Salas del brillo inverso: muros [minX, maxX, minZ, maxZ], inicio, salida y ruta del brillo.
export const ROOMS = [
  {
    start: [-5.5, -5.5], exit: [5.5, 5.5],
    walls: [[-1.65, -1.35, -6.6, 2.0], [2.35, 2.65, -2.0, 6.6]],
    path: [[-5.5, -5.5], [-5.0, -1.0], [-3.5, 3.4], [0.0, 3.8], [0.5, -3.4], [4.0, -3.6], [4.5, 2.0], [5.5, 5.5]]
  },
  {
    start: [-5.5, -5.5], exit: [5.5, 5.5],
    walls: [[-3.65, -3.35, -6.6, 3.0], [-0.15, 0.15, -3.0, 6.6], [3.35, 3.65, -6.6, 3.0]],
    path: [[-5.5, -5.5], [-5.5, 0.0], [-4.5, 4.8], [-2.0, 4.8], [-1.8, -4.5], [1.7, -4.6], [2.0, 4.8], [5.2, 5.0], [5.5, 5.5]]
  },
  {
    start: [-5.5, -6.0], exit: [5.5, 6.0],
    walls: [[-6.6, 3.5, -3.65, -3.35], [-3.5, 6.6, -0.65, -0.35], [-6.6, 3.5, 2.35, 2.65]],
    path: [[-5.5, -6.0], [-4.8, -5.2], [5.0, -5.2], [5.0, -2.0], [-5.0, -2.0], [-5.0, 1.0], [5.0, 1.0], [5.0, 4.2], [5.5, 6.0]]
  }
];

let S = null;
export function unload() { S = null; }

export async function load(ctx) {
  const { scene, player, interaction, ui, audio } = ctx;
  const h = createHelpers(scene);
  const M = K.materials(h);
  const { MB, V3, box, cyl, mat } = h;
  S = { progress: 0, hallSolved: false, doorOpen: false, stage: null, room: -1, sinceTip: 0, sincePress: 99, pulses: [0, 0, 0, 0, 0] };

  ['pala', 'farol', 'llaves'].forEach((i) => game.addItem(i));
  player.setBounds({ minX: -6.5, maxX: 6.5, minZ: -6.5, maxZ: 6.5 });
  player.teleport(HALL.start[0], HALL.start[1], 0, 0);
  const fl = createFlashlight(ctx, { startOn: true, available: true, intensity: 3.0, range: 18 });

  /* ---------- Sala de los símbolos ---------- */
  const group = new B.TransformNode('hall', scene);
  const floor = MB.CreateGround('floor', { width: 14, height: 14 }, scene);
  floor.material = M.floor; floor.parent = group; floor.isPickable = false;
  box(14.4, 0.1, 14.4, 0, 3.3, 0, M.ceiling, group);
  box(14.4, 3.3, 0.4, 0, 1.65, -7.0, M.stone, group); box(14.4, 3.3, 0.4, 0, 1.65, 7.0, M.stone, group); box(0.4, 3.3, 14.4, -7.0, 1.65, 0, M.stone, group);
  box(0.4, 3.3, 3.1, 7.0, 1.65, -5.45, M.stone, group); box(0.4, 3.3, 9.1, 7.0, 1.65, 2.45, M.stone, group); box(0.4, 0.8, 1.8, 7.0, 2.9, -3.0, M.stone, group);
  const doorSlab = box(0.5, 2.5, 1.8, 6.95, 1.25, -3.0, M.stone, group);
  const doorRect = [6.6, 7.4, -3.9, -2.1];
  player.addObstacle(doorRect);

  const symMesh = [];
  const symMat = [];
  const makeSymbol = (kind) => {
    const sc = ctx.scene;
    if (kind === 0) return MB.CreateDisc('s0', { radius: 0.4, tessellation: 28 }, sc);
    if (kind === 1) { const t = MB.CreateCylinder('s1', { diameter: 0.95, height: 0.1, tessellation: 3 }, sc); t.rotation.x = Math.PI / 2; t.rotation.y = Math.PI; return t; }
    if (kind === 2) return MB.CreateBox('s2', { width: 0.7, height: 0.7, depth: 0.1 }, sc);
    if (kind === 3) { const r = MB.CreateBox('s3', { width: 0.58, height: 0.58, depth: 0.1 }, sc); r.rotation.z = Math.PI / 4; return r; }
    const a = MB.CreateBox('c1', { width: 0.76, height: 0.2, depth: 0.1 }, sc), b = MB.CreateBox('c2', { width: 0.2, height: 0.76, depth: 0.1 }, sc);
    return B.Mesh.MergeMeshes([a, b], true);
  };
  SYMBOLS.forEach((name, k) => {
    const m = makeSymbol(k);
    m.position.set(HALL.symbolX[k], 1.7, HALL.symbolsZ);
    const sm = new B.StandardMaterial('symMat' + k, scene);
    sm.disableLighting = true; sm.emissiveColor = new B.Color3(0.38, 0.38, 0.42); sm.backFaceCulling = false;
    m.material = sm; m.parent = group;
    symMesh.push(m); symMat.push(sm);
    fl.addShadowObject(m, { useShadowMaterial: false, maxVisibility: 1, pickable: true });
    interaction.add(m, { hint: () => T.symbolHint + ': ' + name, onUse: () => pressSymbol(k) });
  });

  function flashSymbol(k, on) {
    symMat[k].emissiveColor = on ? new B.Color3(1, 1, 1) : new B.Color3(0.38, 0.38, 0.42);
    symMesh[k].scaling.setAll(on ? 1.3 : 1);
  }

  /* El juego de los símbolos: se enseñan en orden (a oscuras) y hay que repetirlos */
  const seq = { state: 'wait', t: 0, i: 0, wait: 1.2 };
  function pressSymbol(k) {
    if (S.hallSolved) return;
    S.sincePress = 0;
    S.pulses[k] = 0.4; flashSymbol(k, true); sfx.chime(k);
    if (k === SEQUENCE[S.progress]) {
      S.progress++;
      if (S.progress === SEQUENCE.length) solveHall();
    } else {
      S.progress = 0; sfx.bad(); ui.toast(T.wrong, 3500);
      seq.state = 'wait'; seq.t = 0; seq.wait = 1.6;
    }
  }

  async function solveHall() {
    S.hallSolved = true;
    game.solvePuzzle('p9_simbolos'); game.addJournal(T.journalSymbols);
    sfx.open(); await ctx.wait(0.6);
    sfx.door(); S.doorOpen = true; player.removeObstacle(doorRect);
    ui.narrate(T.symbolsSolved, 8000);
    const ring = MB.CreateTorus('doorRing', { diameter: 2.0, thickness: 0.06, tessellation: 28 }, scene);
    ring.position.set(6.7, 1.3, -3.0); ring.rotation.z = Math.PI / 2; ring.rotation.y = Math.PI / 2;
    const rm = new B.StandardMaterial('ringMat', scene); rm.disableLighting = true; rm.emissiveColor = new B.Color3(1, 1, 1); ring.material = rm;
    fl.addShadowObject(ring, { useShadowMaterial: false, maxVisibility: 1 });
    await ctx.waitUntil(() => player.position.x > 6.2 && Math.abs(player.position.z + 3) < 1.0);
    ui.clearNarration();
    buildRoom(0);
  }

  /* ---------- Puzle 10: salas del brillo inverso ---------- */
  function buildRoom(n) {
    if (S.stage) S.stage.dispose(false, false);
    fl.clearShadowObjects();
    const old = S.obstacles || []; old.forEach((r) => player.removeObstacle(r)); S.obstacles = [];
    const g = S.stage = new B.TransformNode('room' + n, scene);
    group.setEnabled(false);
    const R = ROOMS[n];
    S.room = n;
    const fl2 = MB.CreateGround('rfloor', { width: 14.4, height: 14.4 }, scene); fl2.material = M.floor; fl2.parent = g; fl2.isPickable = false;
    box(14.4, 0.1, 14.4, 0, 3.3, 0, M.ceiling, g);
    box(14.4, 3.3, 0.4, 0, 1.65, -7.0, M.stone, g); box(14.4, 3.3, 0.4, 0, 1.65, 7.0, M.stone, g);
    box(0.4, 3.3, 14.4, -7.0, 1.65, 0, M.stone, g); box(0.4, 3.3, 14.4, 7.0, 1.65, 0, M.stone, g);
    R.walls.forEach((w) => {
      box(w[1] - w[0], 3.0, w[3] - w[2], (w[0] + w[1]) / 2, 1.5, (w[2] + w[3]) / 2, M.stone, g);
      player.addObstacle(w); S.obstacles.push(w);
    });
    K.orbTrail(ctx, h, fl, R.path, { spacing: 1.2, parent: g });
    // La salida: un aro grande que solo brilla a oscuras
    const ring = MB.CreateTorus('exitRing', { diameter: 1.7, thickness: 0.08, tessellation: 28 }, scene);
    ring.position.set(R.exit[0], 1.2, R.exit[1]); ring.rotation.x = Math.PI / 2; ring.parent = g;
    const rm = new B.StandardMaterial('exitMat', scene); rm.disableLighting = true; rm.emissiveColor = new B.Color3(1, 1, 1); ring.material = rm;
    fl.addShadowObject(ring, { useShadowMaterial: false, maxVisibility: 1 });
    player.setBounds({ minX: -6.6, maxX: 6.6, minZ: -6.6, maxZ: 6.6 });
    player.teleport(R.start[0], R.start[1], Math.atan2(R.path[1][0] - R.path[0][0], R.path[1][1] - R.path[0][1]), 0);
    ui.narrate(T.rooms[n], 12000);
    S.roomDone = false;
  }

  async function roomDone(n) {
    S.roomDone = true;
    sfx.open(); game.solvePuzzle('p10_sala' + (n + 1));
    if (n < ROOMS.length - 1) {
      ui.toast(T.roomDone[n], 3000);
      await ctx.wait(1.2);
      buildRoom(n + 1);
      return;
    }
    game.solvePuzzle('p10_brillo'); game.solvePuzzle('act5'); game.addJournal(T.journalDark);
    await ctx.wait(1.0);
    await ui.dialogue(T.endDialogue);
    ctx.goTo('act6_doubts');
  }

  /* ---------- Bucle ---------- */
  ctx.addUpdater((dt) => {
    S.sinceTip += dt; S.sincePress += dt;
    // pulsos de los símbolos pulsados
    for (let k = 0; k < 5; k++) if (S.pulses[k] > 0) { S.pulses[k] -= dt; if (S.pulses[k] <= 0) flashSymbol(k, false); }
    // la secuencia solo se enseña a oscuras, mientras no está resuelta y el jugador no esté probando
    if (!S.hallSolved && S.room < 0) {
      if (fl.isOn || S.sincePress < 5) { if (seq.state !== 'wait') { flashSymbol(SEQUENCE[Math.min(seq.i, 4)], false); } seq.state = 'wait'; seq.t = 0; seq.wait = 1.2; }
      else {
        seq.t += dt;
        if (seq.state === 'wait' && seq.t >= seq.wait) { seq.state = 'on'; seq.t = 0; seq.i = 0; flashSymbol(SEQUENCE[0], true); sfx.chime(SEQUENCE[0]); }
        else if (seq.state === 'on' && seq.t >= 0.7) { flashSymbol(SEQUENCE[seq.i], false); seq.state = 'gap'; seq.t = 0; }
        else if (seq.state === 'gap' && seq.t >= 0.35) {
          seq.i++; seq.t = 0;
          if (seq.i >= SEQUENCE.length) { seq.state = 'wait'; seq.wait = 3.0; }
          else { seq.state = 'on'; flashSymbol(SEQUENCE[seq.i], true); sfx.chime(SEQUENCE[seq.i]); }
        }
      }
    }
    // consejos si el jugador no se entera
    if (S.room < 0 && !S.hallSolved && fl.isOn && S.sinceTip > 25) { S.sinceTip = 0; ui.narrate(T.tipOn, 7000); }
    // salida de la sala actual
    if (S.room >= 0 && !S.roomDone) {
      const e = ROOMS[S.room].exit;
      if (Math.hypot(player.position.x - e[0], player.position.z - e[1]) < 0.9) roomDone(S.room);
    }
  });

  fl.onToggle = (on) => {
    if (S.room >= 0) return;
    if (!S.hallSolved) ui.narrate(on ? T.tipOn : (S.progress ? T.tipRepeat : T.tipOff), 7000);
  };

  K.hiddenDreams(ctx, h, id, { parent: group });

  /* ---------- Guion ---------- */
  (async function flow() {
    await ctx.whenStarted();
    audio.startPad('noche');
    await ui.dialogue(T.intro);
    ui.narrate(T.tipOn, 9000);
  })();
}
