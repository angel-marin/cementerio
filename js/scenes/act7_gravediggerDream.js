// Acto 7: "El sueño del sepulturero".
//   Puzle 12, "¿Dónde está su sueño?": el sepulturero dijo que lo puso «aquí dentro». Hay que mirar el cementerio al amanecer,
//   reunir pistas y descubrir que su sueño es el propio cementerio: cada tumba cuidada es un sueño que tuvo un buen fin.
//   Escena final: se despide en paz. Si se encontraron todos los sueños escondidos (Fase 6), aparece el mensaje oculto.
import { createHelpers } from '../core/helpers.js';
import * as game from '../core/state.js';
import { sfx } from '../core/audio.js';
import { CONFIG } from '../config.js';
import * as K from './_kit.js';

const B = window.BABYLON;
const T = CONFIG.story.act7;

export const id = 'act7_gravediggerDream';
export const title = 'Acto 7: El sueño del sepulturero';
export const ambient = 'alba';   // sonido de fondo (viento, interior, cripta, alba)
export const sceneOptions = { moon: true, shadows: true, hemiIntensity: 0.5, fogDensity: 0.025, fogColor: [0.5, 0.5, 0.52], clear: [0.45, 0.45, 0.47] };

export const LAYOUT = {
  start: [0, -6.0],
  digger: [-1.8, -1.2],
  clueTombs: { t1: [-4.8, -3.2], t2: [-2.0, -4.8], t3: [4.6, -3.6], t4: [5.4, 0.8], t5: [-5.4, 1.2], t6: [1.8, -1.6] },
  decorTombs: [[-3.2, 3.2, 0.9], [3.2, 3.4, 1.0], [-6.0, -0.6, 0.8], [0.6, 1.2, 0.8]],
  lantern: [3.4, -5.6],
  house: [0, 6.0]
};

let S = null;
export function unload() { S = null; }

export async function load(ctx) {
  const { scene, player, interaction, ui, audio } = ctx;
  const h = createHelpers(scene);
  const M = K.materials(h);
  const { MB, V3, box, cyl, sphere } = h;
  const clueIds = Object.keys(T.clues);
  S = { clues: new Set(), hint: 0, done: false, asked: 0 };

  ['pala', 'farol', 'llaves'].forEach((i) => game.addItem(i));
  player.setBounds({ minX: -6.8, maxX: 6.8, minZ: -6.8, maxZ: 5.0 });
  player.teleport(LAYOUT.start[0], LAYOUT.start[1], 0, 0);

  /* ---------- Cementerio al amanecer ---------- */
  K.skyDome(ctx, h, { dawn: true });
  K.groundPlane(ctx, h, M, { width: 16.4, depth: 16.4 });
  box(0.4, 2.8, 16.4, -8.2, 1.4, 0, M.wall); box(0.4, 2.8, 16.4, 8.2, 1.4, 0, M.wall);
  box(16.4, 2.8, 0.4, 0, 1.4, -8.2, M.wall); box(16.4, 2.8, 0.4, 0, 1.4, 8.2, M.wall);
  K.nature(ctx, h, M, { far: [['tree.005', -13, 8, 0.55, 0.3], ['tree', 12, 9, 1.3, 1.1], ['tree', -12, -9, 1.2, 2.4], ['tree', 14, -8, 1.1, 1.7]] });

  const refresh = () => ui.setStatus(T.clueCount(S.clues.size, clueIds.length));
  function clue(id, parts) {
    interaction.add(parts, {
      hint: () => (S.clues.has(id) ? 'Mirar otra vez' : 'Examinar'),
      onUse: () => {
        ui.toast(T.clues[id], 5500);
        if (!S.clues.has(id)) { S.clues.add(id); sfx.chime(S.clues.size); refresh(); }
      }
    });
  }

  // Tumbas cuidadas: flores frescas, lazos y piedras en su sitio
  Object.entries(LAYOUT.clueTombs).forEach(([id, [x, z]]) => {
    const parts = K.tomb(ctx, h, M, x, z, id === 't6' ? 0.6 : 1.0, T.clues[id]);
    const flower = [cyl(0.015, 0.015, 0.35, x + 0.25, 0.18, z - 0.35, M.iron, null, 5), sphere(0.13, x + 0.25, 0.4, z - 0.35, M.white), cyl(0.015, 0.015, 0.3, x - 0.2, 0.15, z - 0.35, M.iron, null, 5), sphere(0.11, x - 0.2, 0.33, z - 0.35, M.cream)];
    clue(id, parts.concat(flower));
  });
  LAYOUT.decorTombs.forEach((t) => K.tomb(ctx, h, M, t[0], t[1], t[2], 'Una tumba cuidada, como todas las de este sitio.'));
  const lamp = K.lantern(ctx, h, M, LAYOUT.lantern[0], LAYOUT.lantern[1], { light: false });
  clue('lamp', lamp);

  // La casa del sepulturero, al fondo
  const hx = LAYOUT.house[0], hz = LAYOUT.house[1];
  const houseParts = [box(4.2, 2.6, 2.4, hx, 1.3, hz, M.plaster), box(1.0, 1.9, 0.12, hx, 0.95, hz - 1.25, M.woodDark), cyl(0, 6.0, 1.5, hx, 3.3, hz, M.woodDark, null, 4)];
  houseParts[2].rotation.y = Math.PI / 4;
  clue('house', houseParts);
  player.addObstacle([hx - 2.2, hx + 2.2, hz - 1.3, hz + 1.3]);

  /* ---------- El sepulturero ---------- */
  const digger = K.buildGravedigger(ctx, h, M, { full: true });
  digger.root.position.set(LAYOUT.digger[0], 0, LAYOUT.digger[1]);
  player.addObstacle([LAYOUT.digger[0] - 0.4, LAYOUT.digger[0] + 0.4, LAYOUT.digger[1] - 0.4, LAYOUT.digger[1] + 0.4]);
  interaction.add(digger.meshes, {
    hint: () => (S.done ? 'El sepulturero' : S.clues.size >= T.needClues ? T.tellHint : 'Hablar con el sepulturero'),
    onUse: () => {
      if (S.done) return;
      if (S.clues.size < T.needClues) { ui.say('Sepulturero', T.talkHints[S.hint++ % T.talkHints.length], 6000); return; }
      askWhere();
    }
  });

  /* ---------- Puzle 12 ---------- */
  async function askWhere() {
    if (S.asking) return; S.asking = true;
    const pick = await ui.choose({
      name: 'Sepulturero', text: T.ask,
      options: ['casa', 'ataud', 'bolsillo', 'todo'].map((k) => ({ id: k, label: T.options[k] }))
    });
    S.asking = false;
    if (pick !== 'todo') { sfx.bad(); ui.say('Sepulturero', T.wrong[pick], 6000); return; }
    finale();
  }

  async function finale() {
    S.done = true;
    game.solvePuzzle('p12_sueno'); game.addJournal(T.journalDream);
    ui.setStatus('');
    sfx.open();
    await ui.dialogue(T.solved);
    audio.startPad('suave');
    digger.holdHat(true);
    S.walkAway = true;
    S.brighten = true;
    await ui.narrateAll(T.farewell);
    await ctx.wait(1.5);
    // Mensaje oculto: solo si se han encontrado todos los sueños escondidos
    if (game.hiddenCount() >= CONFIG.hiddenDreams.total) {
      await ui.dialogue([{ name: T.secretTitle, text: CONFIG.neighbor.secretMessage || T.secretDefault }]);
    }
    game.solvePuzzle('act7');
    ctx.goTo('epilogue');
  }

  /* ---------- Bucle ---------- */
  ctx.addUpdater((dt) => {
    if (!S.walkAway) digger.update(dt);
    else {
      // se va hacia su casa, despacio, y se desvanece
      const r = digger.root, tx = LAYOUT.house[0], tz = LAYOUT.house[1] - 1.8;
      const dx = tx - r.position.x, dz = tz - r.position.z, d = Math.hypot(dx, dz);
      if (d > 0.1) { r.position.x += dx / d * 0.9 * dt; r.position.z += dz / d * 0.9 * dt; r.rotation.y += (Math.atan2(dx, dz) - r.rotation.y) * Math.min(1, dt * 2); }
    }
    if (S.brighten && ctx.hemi.intensity < 0.8) ctx.hemi.intensity += dt * 0.05;
  });

  K.hiddenDreams(ctx, h, id);

  /* ---------- Guion ---------- */
  refresh();
  (async function flow() {
    await ctx.whenStarted();
    audio.startPad('noche');
    await ui.narrateAll(T.dawn);
    await ui.dialogue(T.intro);
    ui.narrate(T.task, 12000);
  })();
}
