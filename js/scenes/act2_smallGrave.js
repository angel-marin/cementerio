// Acto 2: "La tumba pequeña".
//   Puzle 3, "Cavar con respeto": minijuego rítmico, sin fallo posible.
//   Diálogo con elección: tres preguntas, cada una añade una entrada al diario.
//   Momento emotivo: sin puzle.
import { createHelpers } from '../core/helpers.js';
import * as game from '../core/state.js';
import { sfx } from '../core/audio.js';
import { CONFIG } from '../config.js';
import * as K from './_kit.js';
import { createFlashlight } from '../mechanics/flashlight.js';

const B = window.BABYLON;
const T = CONFIG.story.act2;

export const id = 'act2_smallGrave';
export const title = 'Acto 2: La tumba pequeña';
export const ambient = 'viento';   // sonido de fondo (viento, interior, cripta, alba)
export const sceneOptions = { moon: true, shadows: true, hemiIntensity: 0.3, fogDensity: 0.04, fogColor: [0.045, 0.045, 0.045] };

// Parámetros del ritmo (ajustables)
export const RHYTHM = { period: 1.8, window: 0.45, beats: 8 };

let S = null;
export function unload() { S = null; }

export async function load(ctx) {
  const { scene, player, interaction, ui, audio } = ctx;
  const h = createHelpers(scene);
  const M = K.materials(h);
  const { MB, V3, box, cyl, sphere } = h;
  S = { digging: false, dug: false, progress: 0, t: 0, nextBeat: 0, missed: 0, early: 0 };

  // Si se llega aquí con el menú de depuración, se dan las cosas del acto anterior.
  ['pala', 'farol', 'llaves'].forEach((i) => game.addItem(i));
  player.setBounds({ minX: -5.4, maxX: 5.4, minZ: -5.4, maxZ: 5.4 });
  player.teleport(-1.2, -3.2, 0.5, 0);

  /* ---------- Cementerio ---------- */
  K.skyDome(ctx, h);
  K.groundPlane(ctx, h, M, { width: 12.4, depth: 12.4 });
  box(0.4, 2.8, 12.4, -6.0, 1.4, 0, M.wall); box(0.4, 2.8, 12.4, 6.0, 1.4, 0, M.wall);
  box(12.4, 2.8, 0.4, 0, 1.4, -6.0, M.wall); box(12.4, 2.8, 0.4, 0, 1.4, 6.0, M.wall);
  [[-3.6, -2.2, 0.9], [-1.8, -3.9, 1.1], [3.9, -3.8, 1.0], [4.5, 0.9, 0.9], [-4.4, 2.2, 0.8], [-1.2, 3.8, 1.1], [3.4, 4.0, 0.9], [-3.9, -0.4, 0.8]]
    .forEach((t) => K.tomb(ctx, h, M, t[0], t[1], t[2]));
  K.lantern(ctx, h, M, -4.8, 4.6); K.lantern(ctx, h, M, 4.8, -4.8);
  K.nature(ctx, h, M, {
    inner: [[-4.6, -2.2, 0.55, 0.4]],
    far: [['tree.005', -11, 9, 0.55, 0.3], ['tree', 9, 8, 1.3, 1.1], ['tree', -10, -7, 1.2, 2.4], ['tree', 13, -4, 1.1, 1.7]],
    rocks: [['rock_moss_set_01_rock01', -4.9, -5.0, 1.1, 0.5], ['rock_moss_set_01_rock05', 4.3, 4.9, 0.9, 2.6]]
  });

  // Linterna: el farol se consiguió en el acto anterior
  const fl = createFlashlight(ctx, { startOn: false, available: game.hasItem('farol') });

  /* ---------- El sitio de la tumba pequeña ---------- */
  const gx = 1.6, gz = 1.8;
  const pit = MB.CreateGround('pit', { width: 1.0, height: 1.5 }, scene);
  pit.position.set(gx, 0.012, gz); pit.material = M.pit; pit.scaling.set(0.25, 1, 0.25);
  const rimParts = [box(0.2, 0.1, 1.9, gx - 0.65, 0.05, gz, M.dirt), box(0.2, 0.1, 1.9, gx + 0.65, 0.05, gz, M.dirt),
    box(1.3, 0.1, 0.2, gx, 0.05, gz - 0.95, M.dirt), box(1.3, 0.1, 0.2, gx, 0.05, gz + 0.95, M.dirt)];
  // Estacas y cuerda: marcan el sitio
  const stakes = [[-0.5, -0.8], [0.5, -0.8], [-0.5, 0.8], [0.5, 0.8]].map(([dx, dz]) => cyl(0.04, 0.05, 0.55, gx + dx, 0.27, gz + dz, M.woodLight, null, 6));
  const cord = [box(1.0, 0.012, 0.012, gx, 0.5, gz - 0.8, M.cream), box(1.0, 0.012, 0.012, gx, 0.5, gz + 0.8, M.cream),
    box(0.012, 0.012, 1.6, gx - 0.5, 0.5, gz, M.cream), box(0.012, 0.012, 1.6, gx + 0.5, 0.5, gz, M.cream)];
  const mound = sphere(1.6, gx + 2.1, 0, gz - 0.2, M.dirt, null, 1.2, 0.05, 0.9);
  [pit, ...rimParts, ...stakes, ...cord, mound].forEach(ctx.cast);
  interaction.add([pit, ...rimParts, ...stakes, ...cord, mound], {
    hint: () => (S.dug ? 'La tumba está lista' : 'Cavar la tumba'),
    onUse: () => { if (S.dug) ui.toast(T.look.tumba); else if (!S.busy) startDig(); },
    text: T.look.tumba
  });
  player.addObstacle([gx - 0.9, gx + 0.9, gz - 1.1, gz + 1.1]);

  // El ataúd pequeño, con una flor
  const coffin = [box(0.36, 0.26, 0.8, gx - 2.3, 0.13, gz + 0.2, M.woodLight), box(0.4, 0.04, 0.84, gx - 2.3, 0.28, gz + 0.2, M.linen),
    cyl(0.01, 0.01, 0.2, gx - 2.3, 0.4, gz + 0.1, M.metal, null, 4), sphere(0.08, gx - 2.3, 0.51, gz + 0.1, M.white)];
  coffin.forEach(ctx.cast);
  interaction.add(coffin, { text: T.look.ataud });
  player.addObstacle([gx - 2.6, gx - 2.0, gz - 0.3, gz + 0.7]);

  const digger = K.buildGravedigger(ctx, h, M, { full: true });
  digger.root.position.set(gx - 1.4, 0, gz - 0.5);
  interaction.add(digger.meshes, { hint: 'Hablar con el sepulturero', text: T.look.sepulturero, onUse: () => ui.say('Sepulturero', S.dug ? 'Pregunta lo que quieras, chico.' : 'Cuando quieras, empieza a cavar. Sin prisa.', 4000) });
  player.addObstacle([gx - 1.8, gx - 1.0, gz - 0.9, gz - 0.1]);

  /* ---------- Minijuego: cavar con respeto ---------- */
  function startDig() {
    S.busy = true; S.digging = true; S.t = 0; S.nextBeat = RHYTHM.period; S.progress = S.progress || 0; S.missed = 0; S.early = 0;
    player.moveLocked = true;
    ctx.useHandler = press;
    ui.rhythm.show(T.digPrompt);
  }

  function press() {
    if (!S.digging) return;
    const dtb = S.nextBeat - S.t;
    if (Math.abs(dtb) <= RHYTHM.window) {            // en el compás
      S.progress++; S.nextBeat += RHYTHM.period; S.missed = 0;
      sfx.thud(); ui.rhythm.flash('ok');
      growPit();
      if (S.progress >= RHYTHM.beats) finishDig();
    } else if (dtb > RHYTHM.window) {                // demasiado pronto: el ritmo se reinicia con calma
      ui.rhythm.flash('soft'); sfx.soft();
      ui.say('Sepulturero', T.tooFast[S.early++ % T.tooFast.length], 3500);
      S.nextBeat = S.t + RHYTHM.period;
    }
  }

  function growPit() {
    const k = 0.25 + 0.75 * (S.progress / RHYTHM.beats);
    pit.scaling.set(k, 1, k);
    mound.scaling.set(1.2, 0.05 + 0.5 * (S.progress / RHYTHM.beats), 0.9);
    mound.position.y = 0;
  }

  async function finishDig() {
    S.digging = false; S.dug = true; S.busy = true;
    ctx.useHandler = null; player.moveLocked = false; ui.rhythm.hide();
    game.solvePuzzle('p3_cavar');
    await ctx.wait(0.6);
    await ui.dialogue(T.digDone);
    await questions();
    await emotional();
  }

  /* ---------- Preguntas ---------- */
  async function questions() {
    const ids = Object.keys(T.questions);
    const asked = new Set();
    while (asked.size < ids.length) {
      const pick = await ui.choose({
        name: 'Sepulturero', text: T.questionPrompt,
        options: ids.map((q) => ({ id: q, label: T.questions[q].label, disabled: asked.has(q) }))
      });
      const q = T.questions[pick];
      asked.add(pick);
      await ui.dialogue(q.lines);
      game.addJournal(q.journal);
      ui.toast(T.newEntry, 3000);
    }
  }

  /* ---------- Momento emotivo ---------- */
  async function emotional() {
    audio.startPad('suave');
    digger.holdHat(true);
    await ctx.wait(1.2);
    await ui.dialogue(T.emotional);
    await ui.narrateAll([T.emotionalNarration]);
    await ctx.wait(1.5);
    game.solvePuzzle('act2');
    ctx.goTo('act3_brokenDreams');
  }

  /* ---------- Bucle ---------- */
  ctx.addUpdater((dt) => {
    digger.update(dt);
    if (!S || !S.digging) return;
    S.t += dt;
    if (S.t > S.nextBeat + RHYTHM.window) {            // compás que se pasó: sin castigo
      S.missed++; S.nextBeat += RHYTHM.period;
      if (S.missed % 2 === 1) ui.say('Sepulturero', T.missed[(S.missed >> 1) % T.missed.length], 3000);
    }
    const phase = Math.max(0, Math.min(1, 1 - (S.nextBeat - S.t) / RHYTHM.period));
    ui.rhythm.update(phase, S.progress / RHYTHM.beats);
  });

  K.hiddenDreams(ctx, h, id);

  /* ---------- Guion ---------- */
  (async function flow() {
    await ctx.whenStarted();
    audio.startPad('noche');
    await ui.dialogue(T.intro);
    ui.narrate('Acércate a la tumba marcada y pulsa ' + (ctx.isTouch ? 'Usar' : 'E o haz clic') + ' para cavar.', 8000);
  })();
}
