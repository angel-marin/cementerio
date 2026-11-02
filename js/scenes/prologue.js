// Prólogo: "Hoy no iba a dormir".
// Cuarto del niño (tutorial de movimiento e interacción, juguete opcional) y camino por el pueblo hasta el cementerio.
import { createHelpers } from '../core/helpers.js';
import * as game from '../core/state.js';
import { sfx } from '../core/audio.js';
import { CONFIG } from '../config.js';
import * as K from './_kit.js';

const B = window.BABYLON;
const T = CONFIG.story.prologue;

export const id = 'prologue';
export const title = 'Prólogo: Hoy no iba a dormir';
export const ambient = 'viento';   // sonido de fondo (viento, interior, cripta, alba)
export const sceneOptions = { moon: true, shadows: false, hemiIntensity: 0.2, fogDensity: 0.03, fogColor: [0.04, 0.04, 0.045] };

let S = null;
export function unload() { S = null; }

export async function load(ctx) {
  const { scene, player, interaction, ui, audio, isTouch } = ctx;
  const h = createHelpers(scene);
  const M = K.materials(h);
  const { MB, V3, box, cyl, sphere, capsule } = h;
  S = { windowSeen: false, doorOpen: false, toyTaken: false, reminded: false };

  player.setBounds({ minX: -2.25, maxX: 2.25, minZ: -3.7, maxZ: 32.6 });
  player.teleport(0, -2.6, 0, 0);
  K.skyDome(ctx, h);

  /* ---------- Cuarto ---------- */
  const floor = MB.CreateGround('roomFloor', { width: 5, height: 5.5 }, scene);
  floor.position.set(0, 0.002, -1.25); floor.material = M.floor; floor.isPickable = false;
  box(5.2, 0.1, 5.7, 0, 2.7, -1.25, M.ceiling);
  const W = (w, hh, d, x, y, z) => box(w, hh, d, x, y, z, M.plaster);
  W(0.2, 2.65, 5.7, -2.6, 1.325, -1.25); W(0.2, 2.65, 5.7, 2.6, 1.325, -1.25); W(5.4, 2.65, 0.2, 0, 1.325, -4.1);
  W(1.95, 2.65, 0.2, -1.625, 1.325, 1.5); W(1.95, 2.65, 0.2, 1.625, 1.325, 1.5); W(1.3, 0.65, 0.2, 0, 2.325, 1.5);
  player.addObstacle([-2.6, -0.65, 1.4, 1.6]); player.addObstacle([0.65, 2.6, 1.4, 1.6]);

  // Cama
  const bed = [box(1.0, 0.35, 2.0, -1.85, 0.18, -2.9, M.wood), box(0.94, 0.2, 1.94, -1.85, 0.45, -2.9, M.linen), box(0.6, 0.12, 0.35, -1.85, 0.6, -3.75, M.white)];
  interaction.add(bed, { text: T.bed });
  player.addObstacle([-2.4, -1.3, -3.95, -1.85]);
  // Escritorio y silla
  const desk = [box(1.2, 0.05, 0.6, 1.7, 0.75, -3.65, M.woodDark), box(0.06, 0.75, 0.06, 1.15, 0.37, -3.9, M.wood), box(0.06, 0.75, 0.06, 2.25, 0.37, -3.9, M.wood),
    box(0.06, 0.75, 0.06, 1.15, 0.37, -3.4, M.wood), box(0.06, 0.75, 0.06, 2.25, 0.37, -3.4, M.wood), box(0.3, 0.2, 0.2, 2.0, 0.88, -3.75, M.fabric)];
  interaction.add(desk, { text: T.desk });
  player.addObstacle([1.05, 2.35, -4.0, -3.3]);
  // Armario
  const wardrobe = [box(0.7, 2.0, 1.0, 2.2, 1.0, 0.5, M.woodDark), box(0.02, 1.7, 0.02, 1.84, 1.0, 0.5, M.band)];
  interaction.add(wardrobe, { text: T.wardrobe });
  player.addObstacle([1.8, 2.6, -0.1, 1.1]);
  // Alfombra
  const rug = MB.CreateDisc('rug', { radius: 0.9, tessellation: 24 }, scene);
  rug.rotation.x = Math.PI / 2; rug.position.set(0, 0.012, -1.3); rug.material = M.fabric; rug.isPickable = false;
  // Ventana (la luna entra por aquí)
  const winParts = [box(0.06, 1.3, 1.0, 2.52, 1.55, -1.4, M.woodDark)];
  const pane = MB.CreatePlane('pane', { width: 0.86, height: 1.16 }, scene);
  pane.position.set(2.47, 1.55, -1.4); pane.rotation.y = Math.PI / 2; pane.material = M.pane; winParts.push(pane);
  interaction.add(winParts, {
    hint: 'Mirar por la ventana',
    onUse: () => { S.windowSeen = true; ui.toast(T.window, 5000); sfx.soft(); }
  });
  const moonBeam = new B.PointLight('moonBeam', new V3(2.1, 1.6, -1.4), scene);
  moonBeam.intensity = 0.35; moonBeam.range = 4; moonBeam.diffuse = new B.Color3(0.85, 0.88, 1);
  // Bombilla
  cyl(0.02, 0.02, 0.4, 0, 2.5, -1.3, M.iron, null, 6); sphere(0.18, 0, 2.28, -1.3, M.lantern).isPickable = false;
  const lamp = new B.PointLight('roomLamp', new V3(0, 2.2, -1.3), scene);
  lamp.intensity = 0.55; lamp.range = 7; lamp.diffuse = new B.Color3(0.95, 0.93, 0.9);

  // Taburete con el juguete
  const stool = [cyl(0.4, 0.4, 0.05, -0.5, 0.42, -3.4, M.wood, null, 14), cyl(0.06, 0.06, 0.4, -0.5, 0.2, -3.4, M.wood, null, 8)];
  interaction.add(stool, { text: 'Un taburete pequeño.' });
  const toy = new B.TransformNode('toy', scene); toy.position.set(-0.5, 0.45, -3.4);
  capsule(0.12, 0.34, 0, 0.17, 0, M.fabric, toy); sphere(0.2, 0, 0.42, 0, M.fabric, toy);
  sphere(0.09, -0.1, 0.55, 0, M.fabric, toy); sphere(0.09, 0.1, 0.55, 0, M.fabric, toy);
  sphere(0.03, -0.045, 0.44, 0.09, M.feat, toy); sphere(0.03, 0.045, 0.44, 0.09, M.feat, toy); sphere(0.06, 0, 0.4, 0.1, M.linen, toy);
  [-1, 1].forEach((sx) => { capsule(0.04, 0.16, sx * 0.15, 0.2, 0.02, M.fabric, toy); capsule(0.045, 0.16, sx * 0.07, 0.03, 0.06, M.fabric, toy); });
  const toyMeshes = toy.getChildMeshes();
  interaction.add(toyMeshes, {
    hint: 'Coger el juguete',
    onUse: () => {
      game.addItem('juguete'); game.setFlag('juguete', true); S.toyTaken = true;
      toy.dispose(false, false); sfx.pick(); ui.toast(T.toyTake);
    },
    text: T.toyLook
  });

  // Puerta del cuarto
  const doorPivot = new B.TransformNode('doorPivot', scene); doorPivot.position.set(-0.65, 0, 1.5);
  const doorParts = [box(1.3, 2.0, 0.08, 0.65, 1.0, 0, M.wood, doorPivot), sphere(0.08, 1.15, 1.0, -0.08, M.metal, doorPivot)];
  const doorRect = [-0.65, 0.65, 1.4, 1.6];
  player.addObstacle(doorRect);
  let doorAngle = 0, doorTarget = 0;
  interaction.add(doorParts, {
    hint: () => (S.doorOpen ? 'La puerta está abierta' : 'Abrir la puerta'),
    onUse: async () => {
      if (S.doorOpen) return;
      if (!S.toyTaken && !S.reminded) { S.reminded = true; ui.toast(T.toyReminder, 4000); }
      S.doorOpen = true; doorTarget = -1.65; sfx.door();
      player.removeObstacle(doorRect);
      ui.say(T.fatherAtDoor.name, T.fatherAtDoor.text, 5000);
    }
  });

  /* ---------- Calle ---------- */
  const street = MB.CreateGround('street', { width: 9, height: 36 }, scene);
  street.position.set(0, 0, 19.5); street.material = M.ground; street.isPickable = false;
  const outer = MB.CreateGround('outer', { width: 220, height: 220 }, scene);
  outer.position.y = -0.03; outer.material = M.outer; outer.isPickable = false;
  // vallas bajas
  for (const sx of [-1, 1]) {
    const f = [box(0.12, 0.9, 31.5, sx * 2.75, 0.45, 17.5, M.wood)];
    for (let z = 3; z <= 32; z += 3) f.push(box(0.2, 1.1, 0.2, sx * 2.75, 0.55, z, M.woodDark));
    interaction.add(f, { text: 'Una valla de madera, baja y vieja.' });
  }
  // casas a los lados
  const houseTexts = T.houses;
  [[-7, 8], [-7, 17], [-7, 26], [7, 6], [7, 15], [7, 24]].forEach(([x, z], i) => {
    const sx = x < 0 ? 1 : -1;
    const body = box(6, 4, 6, x, 2, z, M.plaster);
    const roof = cyl(0, 9, 2.4, x, 5.2, z, M.woodDark, null, 4); roof.rotation.y = Math.PI / 4;
    const lit = i % 3 === 1;
    const win = MB.CreatePlane('win', { width: 0.9, height: 1.2 }, scene);
    win.position.set(x + sx * 3.02, 2.2, z); win.rotation.y = x < 0 ? -Math.PI / 2 : Math.PI / 2;
    win.material = lit ? M.pane : M.feat;
    interaction.add([body, roof, win], { text: houseTexts[lit ? 1 : 0] });
    player.addObstacle([x - 3.1, x + 3.1, z - 3.1, z + 3.1]);
  });
  K.lantern(ctx, h, M, -2.3, 9); K.lantern(ctx, h, M, 2.3, 21);
  K.graffiti(ctx, h, { x: -3.97, y: 1.3, z: 12.0, ry: -Math.PI / 2 });   // si hay nombre del vecino en config.js

  // Puerta del cementerio al final de la calle
  const gate = K.ironGate(ctx, h, M, 0, 33.5, 3);
  interaction.add(gate, { text: 'La verja del cementerio. Al otro lado, la noche es más profunda.' });
  K.wall(ctx, h, M.wall, -9, 33.5, -1.8, 33.5, { height: 2.8 }); K.wall(ctx, h, M.wall, 1.8, 33.5, 9, 33.5, { height: 2.8 });
  [[-3, 38, 1.0], [2.5, 40, 0.9], [-1, 44, 1.1], [4, 46, 0.8], [-4.5, 47, 1.0]].forEach(([x, z, hh]) => K.tomb(ctx, h, M, x, z, hh));
  K.nature(ctx, h, M, { far: [['tree.005', -14, 44, 0.55, 0.3], ['tree', 9, 43, 1.3, 1.1], ['tree', -10, 28, 1.2, 2.4]] });

  /* ---------- Animación de la puerta ---------- */
  ctx.addUpdater((dt) => {
    doorAngle += (doorTarget - doorAngle) * Math.min(1, dt * 3);
    doorPivot.rotation.y = doorAngle;
  });

  K.hiddenDreams(ctx, h, id);

  /* ---------- Guion: voz en off, tutorial y camino ---------- */
  const wrap = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
  (async function flow() {
    await ctx.whenStarted();
    audio.startPad('noche');
    await ui.narrateAll(T.intro);

    ui.narrate(isTouch ? T.tutorial.moveTouch : T.tutorial.moveDesktop, 600000);
    const p0 = player.position.clone();
    await ctx.waitUntil(() => V3.Distance(player.position, p0) > 1.5);

    ui.narrate(isTouch ? T.tutorial.lookTouch : T.tutorial.lookDesktop, 600000);
    let turned = 0, lastYaw = player.yaw;
    await ctx.waitUntil(() => { turned += Math.abs(wrap(player.yaw - lastYaw)); lastYaw = player.yaw; return turned > 1.2; });

    ui.narrate(isTouch ? T.tutorial.interactTouch : T.tutorial.interactDesktop, 600000);
    await ctx.waitUntil(() => S.windowSeen);
    ui.narrate(T.tutorial.exit, 12000);
    S.tutorialDone = true;

    await ctx.waitUntil(() => player.position.z > 14);
    await ui.narrateAll(T.streetMid);
    await ctx.waitUntil(() => player.position.z > 30);
    await ui.narrateAll(T.streetEnd);
    game.solvePuzzle('prologo');
    ctx.goTo('act1_simple');
  })();
}
