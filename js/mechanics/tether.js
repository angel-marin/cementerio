// Sueño atado: lleva un sueño tras de ti, con calma.
//
// El sueño te persigue atado a tu pecho con un hilo. Se suelta y vuelve al inicio del tramo, sin castigo, si:
//   - choca con un obstáculo o una zona marcada (el sueño corta las esquinas: da un rodeo amplio),
//   - giras de golpe (más de maxTurn radianes de cambio de dirección en medio segundo),
//   - vas demasiado deprisa (más de maxSpeed m/s durante más de speedGrace segundos; en ordenador, Mayús),
//   - te alejas demasiado (más de maxDistance metros).
//
//   const t = createTether(ctx, h, { home: V3, hazards: [rect], solids: [rect] });
//   t.tie();                         // atar (hay que estar cerca)
//   t.setHome(V3);                   // nuevo inicio de tramo (el sueño se queda ahí, desatado)
//   t.onReleased = (motivo) => {};   // 'obstaculo' | 'giro' | 'prisa' | 'lejos'
//   t.onTied = () => {};
// Los rectángulos son [minX, maxX, minZ, maxZ].

const B = window.BABYLON;

export const TETHER = {
  length: 1.5,        // distancia a la que va el sueño detrás del jugador
  maxDistance: 4.5,   // si se separa más, se suelta
  dreamSpeed: 3.2,    // velocidad máxima del sueño
  maxTurn: 1.4,       // radianes de cambio de dirección permitidos en 0,5 s
  turnWindow: 0.5,
  maxSpeed: 2.3,      // m/s
  speedGrace: 0.35,   // segundos
  radius: 0.16,
  tieRange: 3.2
};

export function createTether(ctx, h, options = {}) {
  const { scene, camera, player } = ctx;
  const V3 = B.Vector3;
  const o = { ...TETHER, hazards: [], solids: [], ...options };
  const home = (options.home || new V3(0, 1.2, 0)).clone();
  let hazards = o.hazards.slice(), solids = o.solids.slice();

  const mat = new B.StandardMaterial('tetherMat', scene);
  mat.disableLighting = true; mat.emissiveColor = new B.Color3(1, 1, 1);
  const mesh = B.MeshBuilder.CreateSphere('tetherDream', { diameter: o.radius * 2, segments: 16 }, scene);
  mesh.material = mat; mesh.isPickable = false;
  const hit = B.MeshBuilder.CreateSphere('tetherHit', { diameter: 0.9, segments: 6 }, scene);
  hit.parent = mesh; hit.visibility = 0; hit.isPickable = true;
  const light = new B.PointLight('tetherLight', home.clone(), scene);
  light.parent = mesh; light.intensity = 0.6; light.range = 4;

  const ropeMat = new B.StandardMaterial('ropeMat', scene);
  ropeMat.disableLighting = true; ropeMat.emissiveColor = new B.Color3(0.85, 0.85, 0.9);
  let rope = null;

  let state = 'idle';           // idle | tied | returning
  const pos = home.clone(); pos.y = 1.2;
  const vel = new V3(0, 0, 0);
  let time = 0, fast = 0;
  const heading = [];           // { t, a }
  let lastHeading = null;

  const tether = {
    onReleased: null,
    onTied: null,
    mesh, hit, light, home,
    get state() { return state; },
    get isTied() { return state === 'tied'; },
    get position() { return pos; },
    get distanceToPlayer() { return Math.hypot(pos.x - camera.position.x, pos.z - camera.position.z); },

    setHazards(list) { hazards = list.slice(); },
    setSolids(list) { solids = list.slice(); },
    setHome(p) { home.copyFrom(p); home.y = 1.2; if (state !== 'tied') { pos.copyFrom(home); vel.set(0, 0, 0); state = 'idle'; } },

    // Atar el sueño al jugador (hay que estar cerca).
    tie() {
      if (state === 'tied') return false;
      if (tether.distanceToPlayer > o.tieRange + 0.5) return false;
      state = 'tied'; vel.set(0, 0, 0); heading.length = 0; lastHeading = null; fast = 0;
      tether.onTied && tether.onTied();
      return true;
    },

    // Soltar sin penalización: el sueño vuelve al inicio del tramo.
    release(reason) {
      if (state !== 'tied') return;
      state = 'returning';
      dropRope();
      tether.onReleased && tether.onReleased(reason);
    },

    // Deja el sueño donde está (final del tramo) y lo desata.
    rest() { state = 'idle'; dropRope(); vel.set(0, 0, 0); },

    dispose() { removeUpdater(); dropRope(); mesh.dispose(); light.dispose(); mat.dispose(); ropeMat.dispose(); }
  };

  function dropRope() { if (rope) { rope.dispose(); rope = null; } }

  function inRect(p, r, pad) { return p.x > r[0] - pad && p.x < r[1] + pad && p.z > r[2] - pad && p.z < r[3] + pad; }

  function update(dt) {
    time += dt;
    const px = camera.position.x, pz = camera.position.z;

    if (state === 'tied') {
      // Persecución suave: el sueño quiere estar a "length" metros del jugador, en línea recta.
      let dx = pos.x - px, dz = pos.z - pz;
      const d = Math.hypot(dx, dz) || 0.001;
      dx /= d; dz /= d;
      const tx = px + dx * o.length, tz = pz + dz * o.length;
      let vx = (tx - pos.x) * 4, vz = (tz - pos.z) * 4;
      const sp = Math.hypot(vx, vz);
      if (sp > o.dreamSpeed) { vx *= o.dreamSpeed / sp; vz *= o.dreamSpeed / sp; }
      const k = Math.min(1, dt * 5);
      vel.x += (vx - vel.x) * k; vel.z += (vz - vel.z) * k;
      pos.x += vel.x * dt; pos.z += vel.z * dt;
      pos.y = 1.2 + Math.sin(time * 2.2) * 0.05;

      // 1) obstáculos y zonas marcadas
      for (const r of solids) if (inRect(pos, r, o.radius)) { tether.release('obstaculo'); return afterRelease(); }
      for (const r of hazards) if (inRect(pos, r, o.radius)) { tether.release('obstaculo'); return afterRelease(); }
      // 2) demasiado lejos
      if (d > o.maxDistance) { tether.release('lejos'); return afterRelease(); }
      // 3) giro brusco: cambio de dirección acumulado en la ventana
      const v = player.velocity;
      if (v.speed > 0.5) {
        const a = Math.atan2(v.x, v.z);
        if (lastHeading !== null) {
          let diff = a - lastHeading;
          while (diff > Math.PI) diff -= 2 * Math.PI; while (diff < -Math.PI) diff += 2 * Math.PI;
          heading.push({ t: time, d: Math.abs(diff) });
        }
        lastHeading = a;
      } else lastHeading = null;
      while (heading.length && time - heading[0].t > o.turnWindow) heading.shift();
      const turned = heading.reduce((s, e) => s + e.d, 0);
      if (turned > o.maxTurn) { tether.release('giro'); return afterRelease(); }
      // 4) prisa
      if (v.speed > o.maxSpeed) fast += dt; else fast = Math.max(0, fast - dt);
      if (fast > o.speedGrace) { tether.release('prisa'); return afterRelease(); }

      drawRope();
    } else if (state === 'returning') {
      // Vuelve volando al inicio del tramo
      const dx = home.x - pos.x, dz = home.z - pos.z, dy = home.y - pos.y;
      const d = Math.hypot(dx, dz, dy);
      const step = 6 * dt;
      if (d <= step) { pos.copyFrom(home); state = 'idle'; vel.set(0, 0, 0); }
      else { pos.x += dx / d * step; pos.y += dy / d * step; pos.z += dz / d * step; }
    } else {
      pos.y = home.y + Math.sin(time * 2) * 0.06;
    }
    const pulse = 0.85 + Math.sin(time * 3) * 0.15;
    mat.emissiveColor = new B.Color3(pulse, pulse, pulse);
    mesh.position.copyFrom(pos);
  }

  function afterRelease() { mesh.position.copyFrom(pos); }

  function drawRope() {
    dropRope();
    const from = new V3(camera.position.x - Math.sin(player.yaw) * 0.15, 1.15, camera.position.z - Math.cos(player.yaw) * 0.15);
    const to = new V3(pos.x, pos.y, pos.z);
    if (V3.Distance(from, to) < 0.05) return;
    rope = B.MeshBuilder.CreateTube('rope', { path: [from, to], radius: 0.012, tessellation: 5 }, scene);
    rope.material = ropeMat; rope.isPickable = false;
  }

  const removeUpdater = ctx.addUpdater(update);
  mesh.position.copyFrom(pos);
  return tether;
}
