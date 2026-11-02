// Fragmentos de sueños rotos y rompecabezas 3D.
//
// Hay tres sueños (cohete, violín, balón) y cada uno está roto en tres fragmentos.
// Los fragmentos están repartidos por el mapa (createFragment). En la lápida de cada sueño
// aparecen tres siluetas fantasma con la forma de cada pieza (createDreamPuzzle): hay que
// colocar en cada hueco el fragmento que encaje. Equivocarse no cuesta nada.
//
//   const frag = createFragment(ctx, h, { dream: 'cohete', piece: 'punta', position: V3 });
//   const pz = createDreamPuzzle(ctx, h, { dream: 'cohete', origin: V3, onSolved: () => {} });
//
// Los fragmentos recogidos se guardan en state.flags.fragments = { cohete: ['punta', ...], ... }
import * as game from '../core/state.js';
import { sfx } from '../core/audio.js';

const B = window.BABYLON;

export const DREAMS = {
  cohete: {
    name: 'Cohete',
    pieces: [
      { id: 'punta', name: 'Punta cónica' },
      { id: 'cuerpo', name: 'Cuerpo con ventanilla' },
      { id: 'aletas', name: 'Aletas' }
    ]
  },
  violin: {
    name: 'Violín',
    pieces: [
      { id: 'mastil', name: 'Mástil con voluta' },
      { id: 'caja', name: 'Caja de resonancia' },
      { id: 'arco', name: 'Arco' }
    ]
  },
  balon: {
    name: 'Balón',
    pieces: [
      { id: 'arriba', name: 'Casquete de arriba' },
      { id: 'abajo', name: 'Casquete de abajo' },
      { id: 'cinta', name: 'Cinta del medio' }
    ]
  }
};

export const pieceName = (dream, piece) => DREAMS[dream].pieces.find((p) => p.id === piece).name;

/* ---------- Fragmentos recogidos (guardados en el estado) ---------- */
const fragments = () => game.state.flags.fragments || {};
export const ownedFragments = (dream) => (fragments()[dream] || []).slice();
export function addFragment(dream, piece) {
  const f = { ...fragments() };
  f[dream] = [...(f[dream] || []), piece];
  game.setFlag('fragments', f);
}
export function removeFragment(dream, piece) {
  const f = { ...fragments() };
  f[dream] = (f[dream] || []).filter((p) => p !== piece);
  game.setFlag('fragments', f);
}
export function resetFragments() { game.setFlag('fragments', {}); }

// "Cohete 1/3, violín 0/3, balón 2/3": recogidos (o ya colocados) de cada sueño.
export function fragmentStatus(placed = {}) {
  const names = { cohete: 'cohete', violin: 'violín', balon: 'balón' };
  return 'Fragmentos: ' + Object.keys(DREAMS).map((d) => {
    const n = ownedFragments(d).length + (placed[d] || 0);
    return names[d] + ' ' + n + '/3';
  }).join(', ');
}

/* ---------- Geometría de cada pieza (en el marco del sueño ya montado) ---------- */
export function buildPiece(h, dream, piece, material) {
  const { MB, box, cyl, sphere } = h;
  const scene = h.scene;
  const root = new B.TransformNode('piece_' + dream + '_' + piece, scene);
  const add = (m) => { m.parent = root; m.material = material; return m; };

  if (dream === 'cohete') {
    if (piece === 'punta') add(cyl(0, 0.38, 0.45, 0, 0.58, 0, null, null, 20));
    if (piece === 'cuerpo') {
      add(cyl(0.38, 0.38, 0.8, 0, -0.05, 0, null, null, 20));
      add(sphere(0.15, 0, 0.08, 0.19, null));
    }
    if (piece === 'aletas') {
      for (let i = 0; i < 3; i++) {
        const f = add(box(0.04, 0.32, 0.24, 0, -0.52, 0, null));
        f.position.set(Math.sin(i * 2.094) * 0.24, -0.52, Math.cos(i * 2.094) * 0.24);
        f.rotation.y = i * 2.094;
      }
      add(cyl(0.16, 0.2, 0.1, 0, -0.63, 0, null, null, 12));
    }
  }
  if (dream === 'violin') {
    if (piece === 'caja') {
      add(sphere(0.5, 0, -0.3, 0, null, null, 1, 0.9, 0.34));
      add(sphere(0.38, 0, -0.02, 0, null, null, 1, 0.9, 0.34));
      add(box(0.2, 0.02, 0.06, 0, -0.3, 0.1, null));
    }
    if (piece === 'mastil') {
      add(box(0.08, 0.6, 0.05, 0, 0.4, 0, null));
      const t = add(MB.CreateTorus('scroll', { diameter: 0.15, thickness: 0.035, tessellation: 16 }, scene));
      t.position.set(0, 0.78, 0); t.rotation.x = Math.PI / 2;
    }
    if (piece === 'arco') {
      const a = add(cyl(0.02, 0.02, 1.05, 0.38, -0.1, 0.14, null, null, 8)); a.rotation.z = 0.55;
      const fr = add(box(0.05, 0.05, 0.05, 0.38 + Math.sin(0.55) * 0.52, -0.1 - Math.cos(0.55) * 0.52, 0.14, null)); fr.rotation.z = 0.55;
    }
  }
  if (dream === 'balon') {
    if (piece === 'arriba' || piece === 'abajo') {
      const s = add(MB.CreateSphere('cap', { diameter: 0.7, segments: 18, slice: 0.5 }, scene));
      if (piece === 'abajo') s.rotation.x = Math.PI;
    }
    if (piece === 'cinta') {
      add(MB.CreateTorus('band', { diameter: 0.72, thickness: 0.06, tessellation: 28 }, scene));
    }
  }
  root.getChildMeshes().forEach((m) => { m.isPickable = false; });
  return root;
}

/* ---------- Fragmento suelto ---------- */
// Un trozo brillante que flota entre las lápidas. Se recoge con "Usar".
export function createFragment(ctx, h, { dream, piece, position, onCollected }) {
  const mats = ctx.fragmentMaterials || (ctx.fragmentMaterials = makeMaterials(ctx));
  const root = buildPiece(h, dream, piece, mats.glow);
  root.scaling.setAll(0.5);
  root.position.copyFrom(position);
  const base = position.y;
  let time = Math.random() * 6;
  const meshes = root.getChildMeshes();
  // Caja invisible para apuntar con facilidad.
  const hit = h.MB.CreateSphere('fragHit', { diameter: 0.9, segments: 6 }, ctx.scene);
  hit.parent = root; hit.scaling.setAll(2); hit.visibility = 0; hit.isPickable = true;
  const frag = { dream, piece, root, collected: false };
  ctx.interaction.add(hit, {
    hint: () => 'Recoger: ' + pieceName(dream, piece) + ' (' + DREAMS[dream].name.toLowerCase() + ')',
    onUse: () => {
      if (frag.collected) return;
      frag.collected = true;
      addFragment(dream, piece);
      sfx.pick();
      removeUpdater();
      root.dispose(false, false);
      ctx.ui.toast('Fragmento: ' + pieceName(dream, piece) + '. Es parte de un ' + DREAMS[dream].name.toLowerCase() + '.', 3500);
      onCollected && onCollected(frag);
    }
  });
  const removeUpdater = ctx.addUpdater((dt) => {
    time += dt;
    root.position.y = base + Math.sin(time * 1.6) * 0.07;
    root.rotation.y += dt * 0.8;
  });
  frag.meshes = meshes;
  return frag;
}

/* ---------- Rompecabezas en la lápida ---------- */
export function createDreamPuzzle(ctx, h, { dream, origin, onPlaced, onSolved }) {
  const mats = ctx.fragmentMaterials || (ctx.fragmentMaterials = makeMaterials(ctx));
  const { ui, interaction } = ctx;
  const info = DREAMS[dream];
  const placed = new Set();
  const sockets = {};
  const root = new B.TransformNode('puzzle_' + dream, ctx.scene);
  root.position.copyFrom(origin);
  let solved = false, time = 0;

  info.pieces.forEach((p) => {
    const ghost = buildPiece(h, dream, p.id, mats.ghost);
    ghost.parent = root;
    const meshes = ghost.getChildMeshes();
    meshes.forEach((m) => { m.visibility = 0.35; m.isPickable = true; });
    sockets[p.id] = { ghost, meshes, real: null };
    interaction.add(meshes, {
      hint: () => (placed.has(p.id) ? info.name + ': pieza colocada' : 'Colocar un fragmento aquí'),
      onUse: () => tryPlace(p.id)
    });
  });

  async function tryPlace(pieceId) {
    if (placed.has(pieceId) || solved) return;
    const mine = ownedFragments(dream);
    if (!mine.length) { ui.toast('No llevas ningún fragmento de este sueño. Búscalos entre las lápidas.', 4000); sfx.bad(); return; }
    const pick = await ui.choose({
      name: info.name,
      text: '¿Qué fragmento encaja en esta forma?',
      options: [...mine.map((id) => ({ id, label: pieceName(dream, id) })), { id: '__no', label: 'Todavía no' }]
    });
    if (pick === '__no') return;
    if (pick !== pieceId) { ui.toast('No encaja aquí. Fíjate en la forma y prueba con otro fragmento.', 4000); sfx.bad(); return; }
    // Encaja
    removeFragment(dream, pick);
    placed.add(pieceId);
    const s = sockets[pieceId];
    s.meshes.forEach((m) => m.setEnabled(false));
    s.real = buildPiece(h, dream, pieceId, mats.glow);
    s.real.parent = root;
    s.real.scaling.setAll(0.2);
    s.grow = 0;
    sfx.open();
    onPlaced && onPlaced(pieceId, placed.size);
    if (placed.size === info.pieces.length) {
      solved = true;
      sfx.open();
      onSolved && onSolved();
    }
  }

  const removeUpdater = ctx.addUpdater((dt) => {
    time += dt;
    for (const id in sockets) {
      const s = sockets[id];
      if (s.real && s.grow < 1) { s.grow = Math.min(1, s.grow + dt * 2.5); s.real.scaling.setAll(0.2 + 0.8 * s.grow); }
    }
    if (solved) { root.rotation.y += dt * 0.5; root.position.y = origin.y + Math.sin(time * 1.3) * 0.05; }
  });

  return {
    root, sockets,
    get placedCount() { return placed.size; },
    get isSolved() { return solved; },
    dispose() { removeUpdater(); root.dispose(false, false); }
  };
}

function makeMaterials(ctx) {
  const glow = new B.StandardMaterial('fragGlow', ctx.scene);
  glow.disableLighting = true; glow.emissiveColor = new B.Color3(0.92, 0.92, 0.95); glow.backFaceCulling = false;
  const ghost = new B.StandardMaterial('fragGhost', ctx.scene);
  ghost.disableLighting = true; ghost.emissiveColor = new B.Color3(0.7, 0.72, 0.8); ghost.alpha = 0.5; ghost.backFaceCulling = false;
  return { glow, ghost };
}
