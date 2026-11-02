// Epílogo: "Cumplió su palabra".
// Saltamos en el tiempo y se controla al niño ya mayor. Los sueños que salvó se reflejan como cosas que hizo en su vida,
// el cementerio de los sueños está vacío y, si cogió el juguete en el prólogo, el juguete aparece de nuevo.
import { createHelpers } from '../core/helpers.js';
import * as game from '../core/state.js';
import { sfx } from '../core/audio.js';
import { CONFIG } from '../config.js';
import * as K from './_kit.js';
import { buildPiece, DREAMS } from '../mechanics/dreamFragment.js';
import { loadChild, BODY_YAW } from '../core/body.js';

const B = window.BABYLON;
const T = CONFIG.story.epilogue;

export const id = 'epilogue';
export const title = 'Epílogo: Cumplió su palabra';
export const body = false;      // aquí se controla al niño ya mayor: sin el cuerpo del niño
export const ambient = 'alba';   // sonido de fondo (viento, interior, cripta, alba)
export const sceneOptions = { moon: true, shadows: true, hemiIntensity: 0.55, fogDensity: 0.02, fogColor: [0.52, 0.52, 0.54], clear: [0.5, 0.5, 0.52] };

export const LAYOUT = { start: [0, -6.2], gate: [0, 6.6], standX: 2.4, standZ0: -4.2, standStep: 1.35, bench: [-4.6, 2.2] };

let S = null;
export function unload() { S = null; }

// Qué logros se muestran: los de los puzles resueltos. Si no hay ninguno (se saltó con el menú), se muestran todos.
export function achievementsToShow() {
  const solved = T.achievements.filter((a) => game.isSolved(a.puzzle));
  return solved.length ? solved : T.achievements;
}

export async function load(ctx) {
  const { scene, player, interaction, ui, audio, camera } = ctx;
  const h = createHelpers(scene);
  const M = K.materials(h);
  const { MB, V3, box, cyl, sphere, capsule } = h;
  S = { read: new Set(), shown: [], credits: false };

  player.eye = 1.78;                        // ya es mayor
  player.setBounds({ minX: -6.8, maxX: 6.8, minZ: -6.8, maxZ: 6.4 });
  player.teleport(LAYOUT.start[0], LAYOUT.start[1], 0, 0);

  /* ---------- El cementerio vacío ---------- */
  K.skyDome(ctx, h, { dawn: true });
  K.groundPlane(ctx, h, M, { width: 16.4, depth: 16.4 });
  box(0.4, 2.8, 16.4, -8.2, 1.4, 0, M.wall); box(0.4, 2.8, 16.4, 8.2, 1.4, 0, M.wall);
  box(16.4, 2.8, 0.4, 0, 1.4, -8.2, M.wall); box(7.0, 2.8, 0.4, -4.7, 1.4, 8.2, M.wall); box(7.0, 2.8, 0.4, 4.7, 1.4, 8.2, M.wall);
  [[-5.4, -3.0, 0.9], [-5.6, -0.2, 0.8], [5.8, 2.6, 0.9], [-3.4, 4.8, 1.0], [4.4, 5.0, 0.8]].forEach((t) => K.tomb(ctx, h, M, t[0], t[1], t[2], T.emptyPlaque));
  K.nature(ctx, h, M, { far: [['tree.005', -13, 8, 0.55, 0.3], ['tree', 12, 9, 1.3, 1.1], ['tree', -12, -9, 1.2, 2.4], ['tree', 14, -8, 1.1, 1.7]] });
  K.lantern(ctx, h, M, -6.2, -6.0, { light: false });
  K.graffiti(ctx, h, { x: 7.98, y: 1.5, z: 3.0, ry: Math.PI / 2 });

  // El camino de los recuerdos
  const list = achievementsToShow();
  const mats = {
    glow: (() => { const m = new B.StandardMaterial('epGlow', scene); m.disableLighting = true; m.emissiveColor = new B.Color3(0.95, 0.95, 1); m.backFaceCulling = false; return m; })()
  };
  list.forEach((a, i) => {
    const side = i % 2 === 0 ? 1 : -1;
    const x = side * LAYOUT.standX, z = LAYOUT.standZ0 + i * LAYOUT.standStep;
    const base = cyl(0.9, 1.0, 0.7, x, 0.35, z, M.stone, null, 18);
    const top = [];
    if (a.dream) {
      DREAMS[a.dream].pieces.forEach((p) => { const n = buildPiece(h, a.dream, p.id, mats.glow); n.position.set(x, 1.5, z); n.scaling.setAll(0.8); top.push(n); });
    } else {
      const ring = MB.CreateTorus('ring', { diameter: 0.8, thickness: 0.06, tessellation: 24 }, scene); ring.position.set(x, 1.3, z); ring.material = mats.glow;
      const orb = sphere(0.3, x, 1.3, z, mats.glow); top.push(ring, orb);
    }
    const parts = [base, ...top.flatMap((n) => (n.getChildMeshes ? [n, ...n.getChildMeshes()] : [n]))].filter((m) => m.getClassName && m.getClassName() !== 'TransformNode');
    parts.forEach((m) => { m.isPickable = true; });
    interaction.add(parts, {
      hint: () => (S.read.has(a.id) ? 'Recordar otra vez: ' + a.title : T.stand + ': ' + a.title),
      onUse: () => {
        S.read.add(a.id); sfx.chime(S.read.size);
        ui.say(a.title, a.text, 9000);
        if (S.read.size === list.length) ui.narrate('Has recordado todo lo que fue de tus sueños. La verja está abierta.', 7000);
      }
    });
    player.addObstacle([x - 0.6, x + 0.6, z - 0.6, z + 0.6]);
    S.shown.push({ a, x, z, nodes: top });
  });

  // El banco del sepulturero, con su sombrero (y tu juguete, si lo cogiste)
  const [bx, bz] = LAYOUT.bench;
  const bench = [box(1.6, 0.1, 0.5, bx, 0.5, bz, M.woodDark), box(0.1, 0.5, 0.45, bx - 0.7, 0.25, bz, M.wood), box(0.1, 0.5, 0.45, bx + 0.7, 0.25, bz, M.wood), box(1.6, 0.5, 0.08, bx, 0.85, bz + 0.22, M.woodDark)];
  const hat = [cyl(0.5, 0.5, 0.03, bx - 0.4, 0.57, bz, M.hat, null, 20), cyl(0.28, 0.3, 0.3, bx - 0.4, 0.73, bz, M.hat, null, 20)];
  interaction.add(bench.concat(hat), { text: T.bench });
  player.addObstacle([bx - 0.9, bx + 0.9, bz - 0.4, bz + 0.4]);
  if (game.hasFlag('juguete')) {
    const toy = new B.TransformNode('toy', scene); toy.position.set(bx + 0.4, 0.55, bz);
    capsule(0.1, 0.28, 0, 0.14, 0, M.fabric, toy); sphere(0.17, 0, 0.34, 0, M.fabric, toy);
    sphere(0.07, -0.08, 0.44, 0, M.fabric, toy); sphere(0.07, 0.08, 0.44, 0, M.fabric, toy);
    sphere(0.025, -0.04, 0.35, 0.07, M.feat, toy); sphere(0.025, 0.04, 0.35, 0.07, M.feat, toy);
    interaction.add(toy.getChildMeshes(), { text: T.toy });
    S.toy = toy;
  }

  // La verja, abierta
  const gx = LAYOUT.gate[0], gz = LAYOUT.gate[1];
  const gate = [box(0.5, 3.3, 0.5, gx - 1.6, 1.65, 8.2, M.stone), box(0.5, 3.3, 0.5, gx + 1.6, 1.65, 8.2, M.stone), box(3.7, 0.3, 0.5, gx, 3.4, 8.2, M.stone)];
  const exit = box(2.8, 3.0, 0.1, gx, 1.5, 8.35, M.pane); exit.isPickable = false;
  interaction.add(gate.concat(exit), { hint: T.gate, onUse: () => credits() });
  const trigger = ctx.addUpdater(() => {
    if (!S.credits && player.position.z > 6.3 && Math.abs(player.position.x - gx) < 1.5) credits();
  });

  // Cinemática final: la cámara se separa y se ve, por fin, al niño (ya mayor) cruzando la verja.
  async function walkOut() {
    const kid = await loadChild(ctx, { scale: 1.3 }).catch((err) => { console.error('No se pudo cargar el niño', err); return null; });
    if (!kid) return;
    const p0 = player.position.clone();
    player.frozen = true;
    kid.node.position.set(p0.x, 0, p0.z); kid.node.rotation.y = BODY_YAW;
    const SECONDS = 5;
    let t = 0;
    await new Promise((res) => {
      const off = ctx.addUpdater((dt) => {
        t += dt;
        const k = Math.min(1, t / SECONDS), e = k * k * (3 - 2 * k);
        kid.node.position.z = p0.z + e * 3.2;
        camera.position.set(p0.x, p0.y + e * 0.9, p0.z - e * 3.6);
        player.yaw = 0; player.pitch = 0.05 + e * 0.12;
        if (k >= 1) { off(); res(); }
      });
    });
  }

  async function credits() {
    if (S.credits) return;
    S.credits = true;
    game.solvePuzzle('epilogo');
    await walkOut();
    const lines = [...T.credits.lines];
    if (CONFIG.neighbor.name) lines.unshift(T.credits.forName(CONFIG.neighbor.name));
    // Final secreto: con los 18 sueños escondidos, un mensaje dedicado (editable en config.js)
    const secret = game.hiddenCount() >= CONFIG.hiddenDreams.total;
    if (secret) lines.push(T.credits.secretTitle, CONFIG.neighbor.secretMessage || CONFIG.story.act7.secretDefault);
    ui.showCredits({
      title: T.credits.title, lines,
      linkLabel: T.credits.linkLabel, linkUrl: CONFIG.neighbor.videoUrl || null,
      button: T.credits.button, onClick: () => location.reload()
    });
  }

  K.hiddenDreams(ctx, h, id);

  /* ---------- Guion ---------- */
  (async function flow() {
    await ctx.whenStarted();
    audio.startPad('suave');
    await ui.narrateAll(T.intro);
    ui.narrate(T.jump, 4000);
    await ctx.wait(4);
    ui.narrate(T.tip, 10000);
  })();
}
