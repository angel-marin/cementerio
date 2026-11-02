// Escena de pruebas de la Fase 2: un pasillo con tres estaciones, una por mecánica.
//   z ~ 8  : linterna y objetos de sombra
//   z ~ 22 : hilo (cruzar sin tocar otro hilo ni el charco)
//   z ~ 34 : seguir el sueño
import { createHelpers } from '../core/helpers.js';
import * as game from '../core/state.js';
import { sfx } from '../core/audio.js';
import { createFlashlight } from '../mechanics/flashlight.js';
import { createThread } from '../mechanics/thread.js';
import { createFollowDream } from '../mechanics/followDream.js';

const B = window.BABYLON;

export const id = 'test_mechanics';
export const title = 'Pruebas de mecánicas (Fase 2)';
export const sceneOptions = { moon: false, shadows: false, hemiIntensity: 0.1, fogDensity: 0.045, fogColor: [0.02, 0.02, 0.02] };

export function unload() {}

export async function load(ctx) {
  const { scene, player, interaction, ui, input } = ctx;
  const h = createHelpers(scene);
  const { MB, V3, noiseTex, mat, texMat, box, cyl, sphere } = h;

  game.setFlag('sombras', false);
  player.setBounds({ minX: -13, maxX: 13, minZ: -4, maxZ: 46 });
  player.teleport(0, -1.5, 0, 0);

  const groundMat = texMat(noiseTex(256, 70, 50), { spec: 0.02 });
  groundMat.diffuseTexture.uScale = 10; groundMat.diffuseTexture.vScale = 24;
  const ground = MB.CreateGround('ground', { width: 30, height: 56 }, scene);
  ground.position.z = 21; ground.material = groundMat; ground.isPickable = false;

  const stone = texMat(noiseTex(128, 110, 90), { spec: 0.06 });
  const glowA = mat('#ffffff', { emissive: '#e8e8e8', noLight: true });
  const iron = mat('#151515', { spec: 0.4 });

  // Luces tenues para poder orientarse en la oscuridad
  function beacon(x, z) {
    cyl(0.06, 0.06, 1.2, x, 0.6, z, iron, null, 8);
    const s = sphere(0.18, x, 1.3, z, glowA); s.isPickable = false;
    const l = new B.PointLight('beacon', new V3(x, 1.4, z), scene);
    l.intensity = 0.35; l.range = 5; l.diffuse = new B.Color3(0.9, 0.9, 0.95);
  }
  beacon(-4, 2); beacon(4, 17);

  /* ---------- Estación 1: linterna ---------- */
  const fl = createFlashlight(ctx, { startOn: true });
  fl.onToggle = (on) => ui.narrate(on ? 'Linterna encendida' : 'Linterna apagada', 1200);

  const pillars = [[-3, 10], [3, 10], [-3, 15], [3, 15]].map(([x, z]) => box(0.6, 2.4, 0.6, x, 1.2, z, stone));
  interaction.add(pillars, { text: 'Una columna de piedra. Solo se ve bien con la linterna encendida.' });
  player.addObstacle([-3.3, -2.7, 9.7, 10.3]); player.addObstacle([2.7, 3.3, 9.7, 10.3]);
  player.addObstacle([-3.3, -2.7, 14.7, 15.3]); player.addObstacle([2.7, 3.3, 14.7, 15.3]);

  const lever = [cyl(0.12, 0.16, 1.1, -1.4, 0.55, 7.5, iron, null, 10), box(0.36, 0.1, 0.1, -1.4, 1.15, 7.5, glowA)];
  interaction.add(lever, {
    hint: () => (game.hasFlag('sombras') ? 'Ocultar las sombras' : 'Revelar las sombras'),
    onUse: () => {
      const on = !game.hasFlag('sombras');
      game.setFlag('sombras', on); sfx.open();
      ui.toast(on ? 'Las sombras se dejan ver cuando apagas la linterna.' : 'Las sombras se esconden de nuevo.');
    }
  });

  const symbols = [
    MB.CreateTorus('s1', { diameter: 0.9, thickness: 0.12, tessellation: 24 }, scene),
    box(0.8, 0.8, 0.08, 0, 1.6, 12.5, null),
    MB.CreateSphere('s3', { diameter: 0.8, segments: 12 }, scene)
  ];
  symbols[0].position.set(-2, 1.6, 12.5); symbols[0].rotation.x = Math.PI / 2;
  symbols[1].rotation.z = Math.PI / 4;
  symbols[2].position.set(2, 1.6, 12.5);
  symbols.forEach((m) => fl.addShadowObject(m, { flag: 'sombras' }));

  /* ---------- Estación 2: hilo ---------- */
  const A = new V3(-3.5, 0.85, 22), Bp = new V3(3.5, 0.85, 22);
  const anchorMat = mat('#ffffff', { emissive: '#f4f4f4', noLight: true });
  function anchorPost(p) {
    const parts = [cyl(0.08, 0.1, 0.8, p.x, 0.4, p.z, iron, null, 8), sphere(0.22, p.x, 0.95, p.z, anchorMat)];
    return parts;
  }
  const aParts = anchorPost(A), bParts = anchorPost(Bp);

  // Tumbas que obligan a rodear
  const tombs = [[-1.5, 23.8], [1.5, 20.2]].map(([x, z]) => {
    const m = box(1.0, 1.1, 0.4, x, 0.55, z, stone);
    player.addObstacle([x - 0.5, x + 0.5, z - 0.2, z + 0.2]);
    return m;
  });
  interaction.add(tombs, { text: 'Una lápida baja. El hilo y tú tendréis que rodearla.' });

  // Charco: zona marcada que el hilo no puede tocar (se puede pisar)
  const puddle = MB.CreateDisc('puddle', { radius: 0.7, tessellation: 24 }, scene);
  puddle.rotation.x = Math.PI / 2; puddle.position.set(-1.2, 0.012, 19.0);
  puddle.material = mat('#050505', { spec: 0.9, power: 80 }); puddle.isPickable = false;
  const puddleRect = [-1.9, -0.5, 18.3, 19.7];
  interaction.add(puddle, { text: 'Un charco hondo. El hilo no puede tocarlo.' });
  puddle.isPickable = true;

  // Hilo ya atado que cruza el camino directo
  const fixed = createThread(ctx, { from: new V3(0, 0.85, 17.2), color: '#9a9a9a' });
  fixed.start(); fixed.connect(new V3(0, 0.85, 26.8));

  const thread = createThread(ctx, { from: A, color: '#ffffff', others: [fixed], obstacles: [puddleRect] });
  const reasons = {
    propio: 'El hilo se ha cruzado consigo mismo. Se recoge solo; vuelve a intentarlo con calma.',
    otro: 'El hilo ha tocado el otro hilo. Se recoge solo; rodéalo por un extremo.',
    obstaculo: 'El hilo ha tocado el charco. Se recoge solo; pasa lejos de él.'
  };
  thread.onBroken = (why) => { sfx.bad(); ui.toast(reasons[why] || 'El hilo se ha soltado.'); };
  thread.onConnected = () => { sfx.open(); game.solvePuzzle('test_thread'); ui.toast('Hilo atado. El nudo aguanta.'); };

  interaction.add(aParts, {
    hint: () => (thread.state === 'idle' ? 'Coger el hilo' : thread.isCarrying ? 'Soltar el hilo' : thread.isConnected ? 'Deshacer el nudo' : 'Recogiendo...'),
    onUse: () => {
      if (thread.state === 'idle') { thread.start(); sfx.pick(); ui.toast('Lleva el hilo hasta el otro punto sin cruzarlo ni tocar el charco.'); }
      else if (thread.isCarrying || thread.isConnected) { thread.retract(); }
    }
  });
  interaction.add(bParts, {
    hint: () => (thread.isCarrying ? 'Atar el hilo aquí' : 'Punto de destino'),
    onUse: () => {
      if (thread.isCarrying) thread.connect(Bp);
      else ui.toast('Primero coge el hilo en el otro punto.');
    }
  });

  /* ---------- Estación 3: seguir el sueño ---------- */
  const seedBase = [cyl(0.5, 0.6, 0.7, 0, 0.35, 32, stone, null, 14), sphere(0.3, 0, 0.9, 32, anchorMat)];
  const endRing = MB.CreateTorus('endRing', { diameter: 1.6, thickness: 0.06, tessellation: 32 }, scene);
  endRing.position.set(0, 0.05, 44.5); endRing.material = anchorMat; endRing.isPickable = false;

  const dream = createFollowDream(ctx, {
    path: [new V3(0, 1.3, 32.8), new V3(-3, 1.3, 35), new V3(3, 1.3, 38), new V3(-2, 1.3, 41), new V3(0, 1.3, 44.5)],
    speed: 1.3, maxDistance: 6
  });
  dream.onWait = (w) => { if (w) ui.narrate('El sueño espera. Acércate.', 1800); };
  dream.onArrived = () => { sfx.open(); game.solvePuzzle('test_dream'); ui.toast('El sueño ha llegado. Descansa un momento a su lado.'); };
  interaction.add(seedBase, {
    hint: () => (dream.isArrived || dream.isRunning ? 'Volver a empezar' : 'Despertar el sueño'),
    onUse: () => { dream.reset(); dream.start(); sfx.pick(); ui.toast('Sigue la luz. Si te quedas atrás, esperará.'); }
  });

  ui.narrate('Zona de pruebas: sigue el pasillo hacia el norte. F enciende o apaga la linterna.', 12000);
}
