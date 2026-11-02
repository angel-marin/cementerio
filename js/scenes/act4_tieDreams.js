// Acto 4: "Atar los sueños".
//   Puzle 7, "El nudo": llevar un hilo del corazón a la cabeza sin cruzarlo, en tres niveles.
//   Puzle 8, "Que te sigan": llevar un sueño atado por un camino con obstáculos, en tres tramos.
import { createHelpers } from '../core/helpers.js';
import * as game from '../core/state.js';
import { sfx } from '../core/audio.js';
import { CONFIG } from '../config.js';
import * as K from './_kit.js';
import { createFlashlight } from '../mechanics/flashlight.js';
import { createThread } from '../mechanics/thread.js';
import { createTether } from '../mechanics/tether.js';

const B = window.BABYLON;
const T = CONFIG.story.act4;

export const id = 'act4_tieDreams';
export const title = 'Acto 4: Atar los sueños';
export const sceneOptions = { moon: true, shadows: false, hemiIntensity: 0.3, fogDensity: 0.04, fogColor: [0.045, 0.045, 0.045] };

// Todo en [x, z]; los rectángulos son [minX, maxX, minZ, maxZ]. "solution" es una ruta que se puede recorrer (la usan las pruebas).
export const LEVELS = [
  {
    A: [-5, -5], B: [5, 5],
    fixed: [[0, -7, 0, 2]], puddles: [],
    tombs: [[-2.5, -1.5, 0.9], [2.8, -0.5, 0.9], [-1.2, 2.8, 0.9]],
    solution: [[-5, -5], [-5, 4.5], [4.5, 4.5], [5, 5]]
  },
  {
    A: [-5.5, -5.5], B: [5.5, 5.5],
    fixed: [[-2.5, -7, -2.5, 1.2], [2.5, 7, 2.5, -1.2]], puddles: [[-5.1, -3.3, -3.4, -1.6]],
    tombs: [[-0.2, -4.5, 0.9], [0.3, 4.5, 0.9], [-4.5, 3.5, 1.0], [4.5, -3.5, 1.0]],
    solution: [[-5.5, -5.5], [-5.5, 2.2], [0, 2.2], [0, -2.5], [4.2, -2.5], [4.2, 5.5], [5.5, 5.5]]
  },
  {
    A: [-5.5, -6], B: [5.5, 6.2],
    fixed: [[-7, -3.5, 3.5, -3.5], [7, -0.5, -3.5, -0.5], [-7, 2.5, 3.5, 2.5]],
    puddles: [[-0.8, 0.8, -5.8, -4.2], [-0.8, 0.8, -2.8, -1.2], [-0.8, 0.8, 0.2, 1.8]],
    tombs: [[-2.5, -5.2, 0.9], [2.0, -2.2, 0.9], [-2.0, 0.9, 0.9], [3.0, 4.5, 0.9], [-3.0, 5.0, 1.0]],
    solution: [[-5.5, -6], [-4.8, -6.4], [4.8, -6.4], [4.8, -3.1], [-4.8, -3.1], [-4.8, 2.1], [4.8, 2.1], [4.8, 6.2], [5.5, 6.2]]
  }
];

export const COURSE = {
  speed: 2.0,
  sections: [
    { // La verja: pasar por la abertura sin girar de golpe
      home: [-5.5, -5.6], end: [-3.8, 1.2],
      solids: [[-7.2, -4.9, -3.15, -2.85], [-2.7, -1.0, -3.15, -2.85]], hazards: [],
      path: [[-5.5, -5.6], [-5.0, -4.4], [-4.1, -3.0], [-3.8, -1.6], [-3.8, 1.2]]
    },
    { // El charco: un rodeo amplio
      home: [-3.8, 1.2], end: [3.8, 1.2],
      solids: [], hazards: [[-1.6, 1.6, 0.9, 3.3]],
      path: [[-3.8, 1.2], [-2.6, -0.4], [0, -0.9], [2.6, -0.4], [3.8, 1.2]]
    },
    { // Las ramas: zigzag lento, con giros amplios
      home: [3.8, 1.2], end: [-4.2, 6.4],
      solids: [], hazards: [[-7.0, 2.0, 2.4, 2.8], [-2.0, 7.0, 5.2, 5.6]],
      path: [[3.8, 1.2], [4.6, 2.6], [4.2, 3.8], [1.0, 4.0], [-3.0, 4.1], [-4.4, 5.4], [-4.2, 6.4]]
    }
  ]
};

let S = null;
export function unload() { S = null; }

export async function load(ctx) {
  const { scene, player, interaction, ui, audio } = ctx;
  const h = createHelpers(scene);
  const M = K.materials(h);
  const { MB, V3, box, cyl, sphere } = h;
  S = { level: 0, stage: null, section: 0, stageB: false, tether: null };

  ['pala', 'farol', 'llaves'].forEach((i) => game.addItem(i));
  player.setBounds({ minX: -6.8, maxX: 6.8, minZ: -6.8, maxZ: 6.8 });
  createFlashlight(ctx, { startOn: false, available: game.hasItem('farol') });

  /* ---------- Patio ---------- */
  K.skyDome(ctx, h);
  K.groundPlane(ctx, h, M, { width: 16.4, depth: 16.4 });
  box(0.4, 2.8, 16.4, -8.2, 1.4, 0, M.wall); box(0.4, 2.8, 16.4, 8.2, 1.4, 0, M.wall);
  box(16.4, 2.8, 0.4, 0, 1.4, -8.2, M.wall); box(16.4, 2.8, 0.4, 0, 1.4, 8.2, M.wall);
  K.lantern(ctx, h, M, -7.0, 7.0); K.lantern(ctx, h, M, 7.0, -7.0);
  K.nature(ctx, h, M, { far: [['tree.005', -13, 8, 0.55, 0.3], ['tree', 12, 9, 1.3, 1.1], ['tree', -12, -9, 1.2, 2.4], ['tree', 14, -8, 1.1, 1.7]] });

  const digger = K.buildGravedigger(ctx, h, M, { full: true });
  digger.root.position.set(-7.2, 0, 0);
  interaction.add(digger.meshes, { hint: 'Hablar con el sepulturero', onUse: () => ui.say('Sepulturero', S.stageB ? 'Con calma, chico. Y rodeos amplios.' : 'Los nudos buenos se hacen despacio.', 5000) });
  player.addObstacle([-7.6, -6.8, -0.4, 0.4]);

  /* ---------- Gestión de cada etapa ---------- */
  function newStage() {
    const st = { group: new B.TransformNode('stage', scene), obstacles: [], threads: [], tether: null };
    st.addObstacle = (r) => { player.addObstacle(r); st.obstacles.push(r); };
    st.dispose = () => {
      st.obstacles.forEach((r) => player.removeObstacle(r));
      st.threads.forEach((t) => t.dispose());
      if (st.tether) st.tether.dispose();
      st.group.dispose(false, false);
    };
    return st;
  }
  function levelTomb(st, x, z, hgt) {
    const parts = [box(0.8, hgt, 0.26, x, hgt / 2, z, M.stone, st.group)];
    const arch = MB.CreateCylinder('arch', { diameter: 0.8, height: 0.26, tessellation: 18 }, scene);
    arch.rotation.x = Math.PI / 2; arch.position.set(x, hgt, z); arch.material = M.stone; arch.parent = st.group; parts.push(arch);
    interaction.add(parts, { text: 'Una lápida baja. El hilo y tú tendréis que rodearla.' });
    st.addObstacle([x - 0.5, x + 0.5, z - 0.3, z + 0.3]);
  }
  const post = (st, x, z, glow) => {
    const parts = [cyl(0.08, 0.1, 0.8, x, 0.4, z, M.iron, st.group, 8), sphere(glow, x, 0.95, z, M.fire, st.group)];
    return parts;
  };

  /* ---------- Puzle 7: el nudo ---------- */
  function buildKnot(n) {
    if (S.stage) S.stage.dispose();
    const st = S.stage = newStage();
    const L = LEVELS[n];
    S.level = n;
    L.tombs.forEach(([x, z, hgt]) => levelTomb(st, x, z, hgt));
    const rects = [];
    L.puddles.forEach((r) => {
      const d = MB.CreateDisc('puddle', { radius: 0.5, tessellation: 24 }, scene);
      d.rotation.x = Math.PI / 2; d.position.set((r[0] + r[1]) / 2, 0.012, (r[2] + r[3]) / 2);
      d.scaling.set(r[1] - r[0], r[3] - r[2], 1); d.parent = st.group;
      d.material = M.pit; interaction.add(d, { text: T.look.charco });
      rects.push(r);
    });
    const fixed = L.fixed.map(([x1, z1, x2, z2]) => {
      const t = createThread(ctx, { from: new V3(x1, 0.85, z1), color: '#8f8f8f' });
      t.start(); t.connect(new V3(x2, 0.85, z2));
      st.threads.push(t);
      return t;
    });
    const [ax, az] = L.A, [bx, bz] = L.B;
    const aPost = post(st, ax, az, 0.26), bPost = post(st, bx, bz, 0.34);
    const thread = createThread(ctx, { from: new V3(ax, 0.85, az), color: '#ffffff', others: fixed, obstacles: rects });
    st.threads.push(thread);
    S.thread = thread;
    thread.onBroken = (why) => { sfx.bad(); ui.toast(T.knotBreak[why] || 'El hilo se ha soltado.', 4500); };
    thread.onConnected = () => knotDone(n);
    interaction.add(aPost, {
      hint: () => (thread.state === 'idle' ? T.knotHint.A : thread.isCarrying ? T.knotHint.carrying : thread.isConnected ? 'Deshacer el nudo' : 'Recogiendo...'),
      onUse: () => {
        if (thread.state === 'idle') { thread.start(); sfx.pick(); ui.toast(T.knotStart, 5000); }
        else if (thread.isCarrying || thread.isConnected) thread.retract();
      },
      text: T.look.corazon
    });
    interaction.add(bPost, {
      hint: () => (thread.isCarrying ? T.knotHint.B : T.knotHint.Bwait),
      onUse: () => { if (thread.isCarrying) thread.connect(new V3(bx, 0.85, bz)); else ui.toast('Primero coge el hilo en el corazón.'); },
      text: T.look.cabeza
    });
    // El jugador empieza junto al corazón, mirando hacia la cabeza
    player.teleport(ax + Math.sign(bx - ax) * 0.8, az + Math.sign(bz - az) * 0.8, Math.atan2(bx - ax, bz - az), 0);
    ui.narrate(T.knotLevels[n], 7000);
  }

  async function knotDone(n) {
    sfx.open(); game.solvePuzzle('p7_n' + (n + 1));
    ui.toast(T.knotTied[n], 3500);
    if (n < LEVELS.length - 1) {
      await ctx.wait(1.8);
      buildKnot(n + 1);
      return;
    }
    game.solvePuzzle('p7_nudo'); game.addJournal(T.journalKnot);
    await ctx.wait(1.2);
    await ui.dialogue(T.knotDone);
    buildCourse();
  }

  /* ---------- Puzle 8: que te sigan ---------- */
  function buildCourse() {
    if (S.stage) S.stage.dispose();
    const st = S.stage = newStage();
    S.stageB = true; S.section = 0;
    player.canRun = true; player.speed = COURSE.speed;
    const at = (p, y = 0) => new V3(p[0], y, p[1]);

    // Pedestales de cada tramo
    const marks = [COURSE.sections[0].home, ...COURSE.sections.map((s) => s.end)];
    const pedestals = marks.map((p, i) => {
      const parts = [cyl(0.8, 0.9, 0.22, p[0], 0.11, p[1], M.stone, st.group, 18)];
      const ring = MB.CreateTorus('ring', { diameter: 0.9, thickness: 0.04, tessellation: 24 }, scene);
      ring.position.set(p[0], 0.24, p[1]); ring.material = M.fire; ring.parent = st.group; ring.isPickable = false;
      return parts;
    });

    // Obstáculos de cada tramo (se dibujan todos; solo cuentan los del tramo actual)
    COURSE.sections.forEach((sec, si) => {
      sec.solids.forEach((r) => {
        const w = r[1] - r[0], d = r[3] - r[2];
        const fence = [box(w, 0.9, d, (r[0] + r[1]) / 2, 0.45, (r[2] + r[3]) / 2, M.woodDark, st.group)];
        for (let x = r[0] + 0.1; x < r[1]; x += 0.9) fence.push(box(0.16, 1.1, 0.22, x, 0.55, (r[2] + r[3]) / 2, M.wood, st.group));
        interaction.add(fence, { text: T.look.verja });
        st.addObstacle(r);
      });
      sec.hazards.forEach((r) => {
        const w = r[1] - r[0], d = r[3] - r[2];
        if (si === 1) {
          const disc = MB.CreateDisc('puddle', { radius: 0.5, tessellation: 28 }, scene);
          disc.rotation.x = Math.PI / 2; disc.position.set((r[0] + r[1]) / 2, 0.012, (r[2] + r[3]) / 2);
          disc.scaling.set(w, d, 1); disc.material = M.pit; disc.parent = st.group;
          interaction.add(disc, { text: T.look.charco });
        } else {
          const bar = [box(w, 0.12, d, (r[0] + r[1]) / 2, 1.3, (r[2] + r[3]) / 2, M.bark, st.group)];
          for (let x = r[0] + 0.2; x < r[1]; x += 0.7) bar.push(cyl(0.03, 0.05, 0.5 + (x * 7 % 3) * 0.1, x, 1.0, (r[2] + r[3]) / 2, M.bark, st.group, 5));
          interaction.add(bar, { text: T.look.ramas });
        }
      });
    });

    // El sueño atado
    const first = COURSE.sections[0];
    const tether = createTether(ctx, h, { home: at(first.home, 1.2) });
    st.tether = tether; S.tether = tether;
    tether.setSolids(first.solids); tether.setHazards(first.hazards);
    tether.onReleased = (why) => { sfx.bad(); ui.toast(T.released[why] || 'El sueño se ha soltado.', 5000); };
    tether.onTied = () => { sfx.pick(); ui.toast(T.courseTied, 4000); };
    interaction.add(tether.hit, {
      hint: () => (tether.isTied ? T.courseWait : tether.state === 'idle' ? T.courseTie : 'El sueño vuelve al inicio'),
      onUse: () => {
        if (tether.state !== 'idle') return;
        if (!tether.tie()) ui.toast('Acércate más al sueño.');
      }
    });
    // Pedestal final de cada tramo: dejar el sueño
    COURSE.sections.forEach((sec, si) => {
      interaction.add(pedestals[si + 1], {
        hint: () => (S.section === si && tether.isTied ? T.courseDrop : 'Un pedestal'),
        onUse: () => {
          if (S.section !== si) { ui.toast(T.look.pedestal); return; }
          if (!tether.isTied) { ui.toast(T.courseTooFar); return; }
          const d = Math.hypot(tether.position.x - sec.end[0], tether.position.z - sec.end[1]);
          if (d > 3.2) { ui.toast(T.courseTooFar); return; }
          sectionDone(si);
        }
      });
    });
    player.teleport(first.home[0] + 1.0, first.home[1] + 0.2, Math.atan2(first.end[0] - first.home[0], first.end[1] - first.home[1]), 0);
    ui.narrate(T.courseIntro, 11000);
  }

  async function sectionDone(si) {
    const tether = S.tether, sec = COURSE.sections[si];
    sfx.open();
    tether.rest(); tether.setHome(new V3(sec.end[0], 1.2, sec.end[1]));
    game.solvePuzzle('p8_t' + (si + 1));
    ui.toast(T.sections[si].done, 3500);
    if (si < COURSE.sections.length - 1) {
      S.section = si + 1;
      const next = COURSE.sections[S.section];
      tether.setSolids(next.solids); tether.setHazards(next.hazards);
      await ctx.wait(1.2);
      ui.narrate(T.sections[S.section].intro + ' ' + T.courseRest, 9000);
      return;
    }
    game.solvePuzzle('p8_siguen'); game.solvePuzzle('act4'); game.addJournal(T.journalCourse);
    player.canRun = false; player.speed = 2.5;
    await ctx.wait(1.2);
    await ui.dialogue(T.courseDone);
    ctx.goTo('act5_lessYouSee');
  }

  /* ---------- Bucle y guion ---------- */
  ctx.addUpdater((dt) => digger.update(dt));

  (async function flow() {
    await ctx.whenStarted();
    audio.startPad('noche');
    await ui.dialogue(T.intro);
    buildKnot(0);
  })();
}
