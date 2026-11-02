// Acto 1: "Lo sencillo". La casa del sepulturero.
//   Puzle 1, "La cena sencilla": poner en la mesa solo la comida sencilla.
//   Puzle 2, "Las herramientas": encontrar la pala, el farol y las llaves (el farol activa la linterna).
import { createHelpers } from '../core/helpers.js';
import * as game from '../core/state.js';
import { sfx } from '../core/audio.js';
import { CONFIG } from '../config.js';
import * as K from './_kit.js';
import { createFlashlight } from '../mechanics/flashlight.js';

const B = window.BABYLON;
const T = CONFIG.story.act1;

export const id = 'act1_simple';
export const title = 'Acto 1: Lo sencillo';
export const ambient = 'interior';   // sonido de fondo (viento, interior, cripta, alba)
export const sceneOptions = { moon: false, shadows: false, hemiIntensity: 0.16, fogDensity: 0.02, fogColor: [0.03, 0.03, 0.03] };

let S = null;
export function unload() { S = null; }

export async function load(ctx) {
  const { scene, player, interaction, ui, audio } = ctx;
  const h = createHelpers(scene);
  const M = K.materials(h);
  const { MB, V3, box, cyl, sphere, capsule, limb } = h;
  S = { cenaDone: false, toolsDone: false, placed: [], hintCena: 0, hintTool: 0, talks: 0, leaving: false, items: {} };

  // Esta escena empieza sin lo que se consigue en ella.
  ['pala', 'farol', 'llaves'].forEach((i) => game.removeItem(i));
  player.setBounds({ minX: -3.2, maxX: 3.2, minZ: -2.75, maxZ: 2.75 });
  player.teleport(0, -2.3, 0, 0);

  /* ---------- La casa ---------- */
  const floor = MB.CreateGround('floor', { width: 7, height: 6 }, scene);
  floor.position.y = 0.002; floor.material = M.floor; floor.isPickable = false;
  box(7.4, 0.1, 6.4, 0, 2.75, 0, M.ceiling);
  const wallBox = (w, hh, d, x, y, z) => box(w, hh, d, x, y, z, M.plaster);
  wallBox(0.2, 2.7, 6.2, -3.6, 1.35, 0); wallBox(0.2, 2.7, 6.2, 3.6, 1.35, 0);
  wallBox(7.4, 2.7, 0.2, 0, 1.35, 3.1);
  wallBox(3.05, 2.7, 0.2, -2.175, 1.35, -3.1); wallBox(3.05, 2.7, 0.2, 2.175, 1.35, -3.1); wallBox(1.3, 0.7, 0.2, 0, 2.35, -3.1);
  // vigas
  [-2, 0, 2].forEach((x) => box(0.16, 0.18, 6.2, x, 2.6, 0, M.woodDark));

  // Puerta de la calle (sur) y puerta de atrás (norte)
  const frontDoor = [box(1.3, 2.0, 0.08, 0, 1.0, -3.04, M.wood), sphere(0.08, 0.5, 1.0, -2.98, M.metal)];
  const backDoor = [box(1.0, 2.0, 0.08, -2.4, 1.0, 3.04, M.wood), sphere(0.07, -2.0, 1.0, 2.98, M.metal)];
  interaction.add(backDoor, { text: 'La puerta de atrás. Da al huerto y al cobertizo.' });
  interaction.add(frontDoor, {
    hint: 'Salir de la casa',
    onUse: async () => {
      if (S.leaving) return;
      if (!(S.cenaDone && S.toolsDone)) { ui.toast(T.notYet, 4000); sfx.bad(); return; }
      S.leaving = true;
      await ui.narrateAll([T.leaving]);
      game.solvePuzzle('act1');
      ctx.goTo('act2_smallGrave');
    }
  });

  // Chimenea con fuego que late
  const fireplace = [box(0.6, 1.5, 1.8, -3.3, 0.75, 0, M.stone), box(0.1, 0.8, 1.1, -2.98, 0.45, 0, M.feat)];
  const flame = box(0.06, 0.45, 0.8, -2.95, 0.3, 0, M.fire);
  interaction.add(fireplace.concat(flame), { text: T.look.chimenea });
  player.addObstacle([-3.6, -2.7, -0.95, 0.95]);
  const fireLight = new B.PointLight('fire', new V3(-2.5, 0.8, 0), scene);
  fireLight.intensity = 0.9; fireLight.range = 7; fireLight.diffuse = new B.Color3(0.96, 0.92, 0.86);
  const ceilLamp = new B.PointLight('ceilLamp', new V3(0.4, 2.3, 0), scene);
  ceilLamp.intensity = 0.35; ceilLamp.range = 8;

  // Cama (esquina suroeste)
  const bed = [box(1.0, 0.35, 2.0, -2.9, 0.18, -2.0, M.wood), box(0.94, 0.2, 1.94, -2.9, 0.45, -2.0, M.linen), box(0.6, 0.12, 0.35, -2.9, 0.6, -2.85, M.white)];
  interaction.add(bed, { text: T.look.cama });
  player.addObstacle([-3.4, -2.4, -3.0, -1.0]);

  /* ---------- Cocina: mostrador, mesa y comida ---------- */
  const counter = [box(0.7, 0.9, 4.2, 3.15, 0.45, 0.2, M.woodDark)];
  interaction.add(counter, { text: 'El mostrador de la cocina. Huele a pan y a leña.' });
  player.addObstacle([2.8, 3.6, -1.9, 2.3]);
  const table = [box(1.9, 0.06, 1.0, 0.95, 0.78, 0.4, M.woodLight)];
  [[0.1, -0.05], [1.8, -0.05], [0.1, 0.85], [1.8, 0.85]].forEach(([x, z]) => table.push(box(0.07, 0.78, 0.07, x, 0.39, z, M.wood)));
  interaction.add(table, { text: T.look.mesa });
  player.addObstacle([-0.1, 2.0, -0.2, 1.0]);
  [-0.6, 1.4].forEach((z) => { const c = [box(0.4, 0.05, 0.4, 0.95, 0.45, z, M.wood), box(0.4, 0.45, 0.05, 0.95, 0.7, z + (z < 0.4 ? -0.18 : 0.18), M.wood)]; interaction.add(c, { text: 'Una silla de madera, desgastada por el uso.' }); });

  const slots = [new V3(0.45, 0.84, 0.4), new V3(0.95, 0.84, 0.4), new V3(1.45, 0.84, 0.4)];
  function food(kind, x, y, z) {
    const n = new B.TransformNode('food_' + kind, scene); n.position.set(x, y, z);
    if (kind === 'pan') sphere(0.34, 0, 0.09, 0, M.cream, n, 1, 0.55, 1);
    if (kind === 'sopa') { cyl(0.3, 0.17, 0.14, 0, 0.07, 0, M.white, n, 16); cyl(0.26, 0.26, 0.02, 0, 0.13, 0, M.fabric, n, 16); }
    if (kind === 'queso') { const q = cyl(0.3, 0.3, 0.12, 0, 0.06, 0, M.linen, n, 3); q.rotation.y = 0.6; }
    if (kind === 'tarta') { cyl(0.36, 0.36, 0.1, 0, 0.05, 0, M.white, n, 18); cyl(0.26, 0.26, 0.1, 0, 0.15, 0, M.cream, n, 18); cyl(0.16, 0.16, 0.1, 0, 0.25, 0, M.white, n, 18); sphere(0.07, 0, 0.33, 0, M.fabric, n); }
    if (kind === 'ostras') { cyl(0.38, 0.38, 0.02, 0, 0.01, 0, M.white, n, 18); for (let i = 0; i < 4; i++) sphere(0.1, Math.cos(i * 1.6) * 0.1, 0.05, Math.sin(i * 1.6) * 0.1, M.linen, n, 1, 0.5, 1.3); sphere(0.08, 0.17, 0.05, 0, M.cream, n, 1, 0.6, 1); }
    if (kind === 'pavo') { sphere(0.34, 0, 0.14, 0, M.woodLight, n, 1.3, 0.8, 0.9); capsule(0.035, 0.18, -0.14, 0.04, 0.2, M.cream, n).rotation.x = 1.2; capsule(0.035, 0.18, 0.14, 0.04, 0.2, M.cream, n).rotation.x = 1.2; }
    return n;
  }
  const order = ['tarta', 'pan', 'ostras', 'sopa', 'pavo', 'queso'];
  const wrongLines = T.cenaWrong;
  order.forEach((kind, i) => {
    const info = T.foods[kind];
    const node = food(kind, 3.1, 0.92, -1.35 + i * 0.7);
    const meshes = node.getChildMeshes();
    const item = { kind, node, placed: false, info };
    S.items[kind] = item;
    interaction.add(meshes, {
      hint: () => (item.placed ? 'Ya está en la mesa' : 'Poner en la mesa: ' + info.name),
      onUse: () => {
        if (item.placed || S.cenaDone) { ui.toast(info.look); return; }
        if (!info.simple) {
          ui.toast(info.look, 3500);
          ui.say('Sepulturero', wrongLines[S.wrongCount = ((S.wrongCount || 0) + 1) % wrongLines.length], 4500);
          sfx.bad();
          return;
        }
        item.placed = true; S.placed.push(kind);
        node.position.copyFrom(slots[S.placed.length - 1]);
        sfx.pick(); ui.toast(info.look, 3000);
        if (S.placed.length === 3) finishCena();
      }
    });
  });

  async function finishCena() {
    S.cenaDone = true;
    game.solvePuzzle('act1_cena'); game.addJournal(T.journal);
    await ctx.wait(0.8);
    await ui.dialogue(T.cenaDone);
    ui.toast(CONFIG.story.act2.newEntry, 2500);
    checkReady();
  }

  /* ---------- Herramientas ---------- */
  let fl = null;
  fl = createFlashlight(ctx, { startOn: false, available: false });

  // Pala junto a la puerta de atrás
  const shovel = new B.TransformNode('shovel', scene);
  limb(new V3(-3.0, 0.04, 2.55), new V3(-2.72, 1.45, 2.7), 0.03, M.woodLight, shovel);
  box(0.26, 0.34, 0.03, -3.02, 0.17, 2.55, M.metal, shovel);
  const shovelMeshes = shovel.getChildMeshes();
  interaction.add(shovelMeshes, { hint: 'Coger la pala', onUse: () => take('pala', shovel) });

  // Farol colgado sobre la cama
  const farolNode = new B.TransformNode('farol', scene); farolNode.position.set(-3.45, 1.7, -2.0);
  cyl(0.18, 0.18, 0.04, 0, 0.18, 0, M.iron, farolNode, 8); cyl(0.18, 0.18, 0.04, 0, -0.18, 0, M.iron, farolNode, 8);
  box(0.2, 0.3, 0.2, 0, 0, 0, M.lantern, farolNode);
  box(0.02, 0.4, 0.02, 0, 0.35, 0, M.iron, farolNode);
  interaction.add(farolNode.getChildMeshes(), { hint: 'Coger el farol', onUse: () => take('farol', farolNode) });

  // Abrigo viejo junto a la chimenea
  const coat = new B.TransformNode('coat', scene); coat.position.set(-3.45, 1.35, -1.0);
  box(0.08, 1.0, 0.55, 0, 0, 0, M.fabric, coat); box(0.1, 0.3, 0.3, 0, 0.45, 0, M.cloth, coat); cyl(0.03, 0.03, 0.2, 0, 0.62, 0, M.iron, coat, 6);
  interaction.add(coat.getChildMeshes(), { hint: 'Registrar el abrigo', onUse: () => take('llaves', coat), text: T.look.abrigo });

  function take(item, node) {
    if (game.hasItem(item)) return;
    game.addItem(item); sfx.pick();
    if (item === 'farol') { fl.setAvailable(true); fl.set(true); }
    node.dispose(false, false);
    ui.toast(T.pick[item], 5000);
    if (['pala', 'farol', 'llaves'].every((i) => game.hasItem(i))) finishTools();
  }

  async function finishTools() {
    S.toolsDone = true; game.solvePuzzle('act1_herramientas');
    await ctx.wait(0.8);
    await ui.dialogue([{ name: 'Sepulturero', text: T.herramientasAll }]);
    checkReady();
  }
  function checkReady() {
    if (S.cenaDone && S.toolsDone) ui.toast('Ya podéis salir por la puerta de la calle.', 5000);
  }

  /* ---------- El sepulturero ---------- */
  const digger = K.buildGravedigger(ctx, h, M, { full: true });
  digger.root.position.set(-1.3, 0, 0.5);
  digger.root.rotation.y = 0.6;
  player.addObstacle([-1.7, -0.9, 0.1, 0.9]);
  interaction.add(digger.meshes, {
    hint: 'Hablar con el sepulturero',
    onUse: () => {
      let line;
      const missing = ['pala', 'farol', 'llaves'].filter((i) => !game.hasItem(i));
      const wantCena = !S.cenaDone && (S.talks % 2 === 0 || !missing.length);
      if (wantCena) { line = T.cenaHints[S.hintCena % T.cenaHints.length]; S.hintCena++; }
      else if (missing.length) { line = T.herramientasHints[missing[S.hintTool % missing.length]]; S.hintTool++; }
      else line = S.cenaDone && S.toolsDone ? 'Cuando quieras, salimos por la puerta de la calle.' : T.herramientasAll;
      S.talks++;
      ui.say('Sepulturero', line, 7000);
    }
  });

  ctx.addUpdater((dt) => {
    digger.update(dt);
    const t = performance.now() / 1000;
    fireLight.intensity = 0.85 + Math.sin(t * 9) * 0.05 + Math.random() * 0.08;
    flame.scaling.y = 1 + Math.sin(t * 11) * 0.12;
  });

  K.hiddenDreams(ctx, h, id);

  /* ---------- Guion ---------- */
  (async function flow() {
    await ctx.whenStarted();
    audio.startPad('noche');
    await ui.dialogue(T.welcome);
    ui.narrate('Pregúntale al sepulturero si te pierdes. Puedes hacer la cena y buscar las herramientas en el orden que quieras.', 9000);
  })();
}
