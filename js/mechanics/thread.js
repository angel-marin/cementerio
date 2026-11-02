// Hilo: se ata en un punto, el jugador lo arrastra y lo ata en otro sin que se cruce.
//
// Uso:
//   const t = createThread(ctx, { from: new V3(x, 0.85, z), color: '#e8e8e8', obstacles: [rect o mesh], others: [otroHilo] });
//   t.start();                       // el hilo empieza a seguir al jugador
//   t.connect(new V3(x, 0.85, z));   // lo ata en el destino; si no se cruza, onConnected()
//   t.retract();                     // lo recoge con calma (sin penalización)
//   t.onConnected = () => {};
//   t.onBroken = (motivo) => {};     // 'propio' | 'otro' | 'obstaculo'; el hilo se recoge solo
//
// Todo se comprueba en el plano del suelo (x, z).
// obstacles: rectángulos [minX, maxX, minZ, maxZ] o mallas. Son zonas marcadas que el hilo no puede tocar.
// others: otros hilos con los que no puede cruzarse.

const B = window.BABYLON;
const HAND_HEIGHT = 0.85;

const cross2 = (p, q, r) => (q.x - p.x) * (r.z - p.z) - (q.z - p.z) * (r.x - p.x);

// Dos tramos se consideran cruzados también si se rozan o se solapan (un hilo que toca a otro cuenta).
export function segmentsCross(a, b, c, d) {
  const eps = 1e-9;
  const d1 = cross2(a, b, c), d2 = cross2(a, b, d), d3 = cross2(c, d, a), d4 = cross2(c, d, b);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  const within = (p, q, r) =>
    Math.min(p.x, q.x) - 1e-6 <= r.x && r.x <= Math.max(p.x, q.x) + 1e-6 &&
    Math.min(p.z, q.z) - 1e-6 <= r.z && r.z <= Math.max(p.z, q.z) + 1e-6;
  if (Math.abs(d1) < eps && within(a, b, c)) return true;
  if (Math.abs(d2) < eps && within(a, b, d)) return true;
  if (Math.abs(d3) < eps && within(c, d, a)) return true;
  if (Math.abs(d4) < eps && within(c, d, b)) return true;
  return false;
}

// Liang-Barsky en el plano (x, z), con el rectángulo ligeramente encogido para no fallar por los bordes.
export function segmentHitsRect(a, b, r) {
  const minX = r[0] + 0.02, maxX = r[1] - 0.02, minZ = r[2] + 0.02, maxZ = r[3] - 0.02;
  if (minX >= maxX || minZ >= maxZ) return false;
  const dx = b.x - a.x, dz = b.z - a.z;
  const p = [-dx, dx, -dz, dz], q = [a.x - minX, maxX - a.x, a.z - minZ, maxZ - a.z];
  let t0 = 0, t1 = 1;
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) { if (q[i] < 0) return false; }
    else {
      const t = q[i] / p[i];
      if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
      else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
  }
  return true;
}

export function rectOf(meshOrRect) {
  if (Array.isArray(meshOrRect)) return meshOrRect;
  meshOrRect.computeWorldMatrix(true);
  const bb = meshOrRect.getBoundingInfo().boundingBox;
  return [bb.minimumWorld.x, bb.maximumWorld.x, bb.minimumWorld.z, bb.maximumWorld.z];
}

export function createThread(ctx, options = {}) {
  const { scene, camera, player } = ctx;
  const V3 = B.Vector3;
  const o = { color: '#e8e8e8', radius: 0.018, minStep: 0.3, retractSpeed: 7, obstacles: [], others: [], ...options };
  const anchor = o.from.clone();
  anchor.y = anchor.y || HAND_HEIGHT;

  const material = new B.StandardMaterial('threadMat', scene);
  material.disableLighting = true;
  material.emissiveColor = B.Color3.FromHexString(o.color);

  let obstacles = o.obstacles.map(rectOf);
  let pts = [anchor.clone()];      // puntos fijos del recorrido
  let tip = null;                  // extremo libre mientras se arrastra
  let mesh = null;
  let state = 'idle';              // idle | carrying | connected | retracting
  let dirty = true;

  const thread = {
    onConnected: null,
    onBroken: null,
    onRetracted: null,
    get state() { return state; },
    get isCarrying() { return state === 'carrying'; },
    get isConnected() { return state === 'connected'; },
    get points() { return pts; },
    get mesh() { return mesh; },

    setObstacles(list) { obstacles = list.map(rectOf); },
    addOther(t) { o.others.push(t); },

    // Segmentos actuales (incluye el tramo hasta el extremo libre).
    getSegments() {
      const path = fullPath();
      const segs = [];
      for (let i = 0; i < path.length - 1; i++) segs.push([path[i], path[i + 1]]);
      return segs;
    },

    start() {
      if (state !== 'idle') return false;
      pts = [anchor.clone()];
      state = 'carrying';
      updateTip();
      dirty = true;
      return true;
    },

    connect(to) {
      if (state !== 'carrying') return false;
      const end = to.clone(); end.y = end.y || HAND_HEIGHT;
      const last = pts[pts.length - 1];
      const reason = crossingReason(last, end, pts.length - 1);   // el último tramo no cuenta como propio
      if (reason) { breakThread(reason); return false; }
      pts.push(end);
      tip = null;
      state = 'connected';
      dirty = true;
      thread.onConnected && thread.onConnected();
      return true;
    },

    retract() {
      if (state === 'carrying' || state === 'connected') { tip = null; state = 'retracting'; }
    },

    dispose() { removeUpdater(); if (mesh) mesh.dispose(); material.dispose(); }
  };

  function updateTip() {
    const c = camera.position;
    tip = new V3(c.x - Math.sin(player.yaw) * 0.1, HAND_HEIGHT, c.z - Math.cos(player.yaw) * 0.1);
  }

  function fullPath() {
    return tip && state === 'carrying' ? [...pts, tip] : pts;
  }

  // ¿El tramo a->b toca algo? ignoreLast = nº de tramos propios finales que se pueden ignorar (el contiguo).
  function crossingReason(a, b, ownCount) {
    for (const r of obstacles) if (segmentHitsRect(a, b, r)) return 'obstaculo';
    for (let i = 0; i < ownCount - 1; i++) if (segmentsCross(a, b, pts[i], pts[i + 1])) return 'propio';
    for (const t of o.others) {
      if (t === thread) continue;
      for (const [p, q] of t.getSegments()) if (segmentsCross(a, b, p, q)) return 'otro';
    }
    return null;
  }

  function breakThread(reason) {
    state = 'retracting';
    thread.onBroken && thread.onBroken(reason);
  }

  function pathLength(path) { let l = 0; for (let i = 0; i < path.length - 1; i++) l += V3.Distance(path[i], path[i + 1]); return l; }

  function rebuild() {
    if (mesh) { mesh.dispose(); mesh = null; }
    const path = fullPath().filter((p, i, a) => i === 0 || V3.Distance(p, a[i - 1]) > 0.005);
    if (path.length < 2) return;
    mesh = B.MeshBuilder.CreateTube('thread', { path, radius: o.radius, tessellation: 6, cap: B.Mesh.CAP_ALL }, scene);
    mesh.material = material;
    mesh.isPickable = false;
  }

  function update(dt) {
    if (state === 'carrying') {
      updateTip();
      const last = pts[pts.length - 1];
      // ¿Choca el tramo que cuelga entre el último punto y el jugador?
      const reason = crossingReason(last, tip, pts.length - 1);
      if (reason) { breakThread(reason); }
      else if (V3.Distance(last, tip) > o.minStep) { pts.push(tip.clone()); }
      dirty = true;
    }
    if (state === 'retracting') {
      let remaining = o.retractSpeed * dt;
      while (remaining > 0 && pts.length > 1) {
        const a = pts[pts.length - 2], b = pts[pts.length - 1];
        const seg = V3.Distance(a, b);
        if (seg <= remaining) { pts.pop(); remaining -= seg; }
        else { pts[pts.length - 1] = V3.Lerp(b, a, remaining / seg); remaining = 0; }
      }
      tip = null;
      dirty = true;
      if (pts.length <= 1) { pts = [anchor.clone()]; state = 'idle'; thread.onRetracted && thread.onRetracted(); }
    }
    if (dirty) { rebuild(); dirty = false; }
  }

  const removeUpdater = ctx.addUpdater(update);
  return thread;
}
