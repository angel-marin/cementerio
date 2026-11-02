// Seguir el sueño: una esfera luminosa recorre una ruta a velocidad constante.
// Si el jugador se queda atrás, se detiene y parpadea hasta que vuelva. No hay castigo, solo espera.
//
// Uso:
//   const d = createFollowDream(ctx, { path: [new V3(...), ...], speed: 1.2, maxDistance: 6 });
//   d.onArrived = () => { ... };
//   d.start();              // empieza a moverse
//   d.onWait = (esperando) => {}   // opcional: avisa al empezar y terminar la espera
//   d.stop() / d.reset() / d.dispose()

import { emitter } from '../core/audio.js';

const B = window.BABYLON;

export function createFollowDream(ctx, options = {}) {
  const { scene, camera } = ctx;
  const V3 = B.Vector3;
  const o = { speed: 1.2, maxDistance: 6, resumeFactor: 0.8, radius: 0.16, color: '#ffffff', lightRange: 5, samples: 24, ...options };

  const curve = B.Curve3.CreateCatmullRomSpline(o.path, o.samples, false);
  const pts = curve.getPoints();
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + V3.Distance(pts[i], pts[i - 1]));
  const total = cum[cum.length - 1];

  const mat = new B.StandardMaterial('dreamMat', scene);
  mat.disableLighting = true;
  mat.emissiveColor = B.Color3.FromHexString(o.color);
  const mesh = B.MeshBuilder.CreateSphere('dream', { diameter: o.radius * 2, segments: 16 }, scene);
  mesh.material = mat;
  mesh.isPickable = false;
  const light = new B.PointLight('dreamLight', pts[0].clone(), scene);
  light.parent = mesh;
  light.intensity = 0.7; light.range = o.lightRange;
  light.diffuse = B.Color3.FromHexString(o.color);

  const hum = emitter({ freq: 196, vol: 0.03, pulse: 0.5 });   // zumbido suave que suena desde el sueño
  let s = 0, running = false, waiting = false, arrived = false, time = 0;

  function posAt(dist) {
    if (dist <= 0) return pts[0].clone();
    if (dist >= total) return pts[pts.length - 1].clone();
    let i = 1;
    while (i < cum.length && cum[i] < dist) i++;
    const t = (dist - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
    return V3.Lerp(pts[i - 1], pts[i], t);
  }

  const dream = {
    onArrived: null,
    onWait: null,
    mesh,
    light,
    get progress() { return total ? s / total : 1; },
    get isWaiting() { return waiting; },
    get isArrived() { return arrived; },
    get isRunning() { return running; },
    get length() { return total; },
    get position() { return mesh.position; },

    start() { if (!arrived) running = true; },
    stop() { running = false; },
    reset() { s = 0; arrived = false; running = false; setWaiting(false); mesh.position.copyFrom(pts[0]); mesh.setEnabled(true); },
    dispose() { removeUpdater(); hum.dispose(); mesh.dispose(); light.dispose(); mat.dispose(); }
  };

  function setWaiting(v) {
    if (waiting === v) return;
    waiting = v;
    dream.onWait && dream.onWait(v);
  }

  function update(dt) {
    time += dt;
    if (running && !arrived) {
      const dx = camera.position.x - mesh.position.x, dz = camera.position.z - mesh.position.z;
      const d = Math.hypot(dx, dz);
      if (!waiting && d > o.maxDistance) setWaiting(true);
      else if (waiting && d <= o.maxDistance * o.resumeFactor) setWaiting(false);
      if (!waiting) {
        s = Math.min(total, s + o.speed * dt);
        if (s >= total) { arrived = true; running = false; setWaiting(false); dream.onArrived && dream.onArrived(); }
      }
    }
    const p = posAt(s);
    p.y += Math.sin(time * 2) * 0.05;
    mesh.position.copyFrom(p);
    hum.setPosition(p); hum.setVolume(waiting ? (Math.sin(time * 12) > 0 ? 0.03 : 0.004) : 0.03);
    // latido normal; si espera, parpadea
    const pulse = 0.85 + Math.sin(time * 3) * 0.15;
    const blink = waiting ? (Math.sin(time * 12) > 0 ? 1 : 0.15) : 1;
    mat.emissiveColor = B.Color3.FromHexString(o.color).scale(pulse * blink);
    light.intensity = 0.7 * pulse * blink;
    mesh.scaling.setAll(waiting ? 0.9 + Math.sin(time * 12) * 0.1 : 1);
  }

  const removeUpdater = ctx.addUpdater(update);
  mesh.position.copyFrom(pts[0]);
  return dream;
}
