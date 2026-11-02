// El modelo del niño (child.glb): cuerpo visible en primera persona y reflejos.
// El jugador ES el niño, así que solo se ve el cuerpo al mirar hacia abajo (y en el espejo del cuarto).
import { loadModel } from './helpers.js';

const B = window.BABYLON;

const GRAY = { 'Material.001': 0.15, 'NiñoPantalon': 0.09, 'NiñoPiel': 0.74, 'Pelo Flequillo': 0.04, 'Dientes': 0.85, 'Niño Nariz': 0.6, 'Niño Ojos': 0.02, 'Niño Zapatos': 0.03 };
const HEAD = /^(HEAD|CEJAS|Dientes|Flequillo|LENGUA|NARIZ|OJOs|Orejas)/i;

export const BODY_SCALE = 1.15;   // el modelo mide 1,37 m; con esta escala la coronilla queda justo bajo los ojos (1,65 m)

// Carga una copia del niño. Devuelve { node, parts, heads, setHeadVisible }.
export async function loadChild(ctx, { scale = BODY_SCALE } = {}) {
  const res = await loadModel(ctx.scene, 'child.glb');
  const root = res.meshes[0];
  const node = new B.TransformNode('childBody', ctx.scene);
  root.parent = node;
  node.scaling.setAll(scale);
  const parts = res.meshes.filter((m) => m.getTotalVertices() > 0);
  const heads = parts.filter((m) => HEAD.test(m.name));
  parts.forEach((m) => {
    const mt = m.material;
    if (mt) {
      const g = GRAY[mt.name];
      if (g !== undefined && mt.albedoColor) mt.albedoColor = new B.Color3(g, g, g);
      mt.metallic = 0; mt.roughness = 0.75; mt.environmentIntensity = 0; mt.maxSimultaneousLights = 6;
    }
    m.alwaysSelectAsActiveMesh = true; m.isPickable = false; ctx.cast(m);
  });
  const setHeadVisible = (v) => heads.forEach((m) => { m.isVisible = v; });
  const rig = makeRig(res);
  let phase = 0, amp = 0;
  // Animación de caminar según la velocidad (m/s). Sin velocidad, el cuerpo vuelve poco a poco a la postura de reposo.
  const walk = (dt, speed) => {
    amp += ((Math.min(1, speed / 2) || 0) - amp) * Math.min(1, dt * 8);
    phase += dt * speed * 3.7;
    animate(rig, node, phase, amp);
  };
  return { node, parts, heads, setHeadVisible, walk, follow: true };
}

// Huesos que se mueven al caminar (nombres del esqueleto Rigify del modelo).
function makeRig(res) {
  const bone = (name) => { const n = res.transformNodes.find((t) => t.name === name); return n && n.rotationQuaternion ? { n, base: n.rotationQuaternion.clone() } : null; };
  return {
    thighL: bone('DEF-thigh.L'), thighR: bone('DEF-thigh.R'), shinL: bone('DEF-shin.L'), shinR: bone('DEF-shin.R'),
    armL: bone('DEF-upper_arm.L'), armR: bone('DEF-upper_arm.R'), foreL: bone('DEF-forearm.L'), foreR: bone('DEF-forearm.R')
  };
}

// Gira un hueso 'ang' radianes alrededor de un eje del mundo (el eje se pasa al espacio del padre del hueso).
const SIGN = 1;   // sentido del giro: 1 = el ángulo positivo adelanta la parte del cuerpo hacia donde mira el niño
function swing(b, axisWorld, ang) {
  if (!b) return;
  const inv = b.n.parent.getWorldMatrix().clone().invert();
  const axis = B.Vector3.TransformNormal(axisWorld, inv).normalize();
  b.n.rotationQuaternion = B.Quaternion.RotationAxis(axis, ang * SIGN).multiply(b.base);
}

const STAND = { thigh: -1.45, shin: 1.45, arm: -0.7, fore: -0.5 };   // radianes que enderezan las piernas desde la postura sentada

function animate(rig, node, phase, amp) {
  const axis = B.Vector3.TransformNormal(new B.Vector3(1, 0, 0), node.getWorldMatrix()).normalize();
  const s = Math.sin(phase), c = Math.cos(phase);
  // El modelo viene en postura sentada (muslos hacia delante, rodillas dobladas): se endereza siempre antes de animar.
  swing(rig.thighL, axis, STAND.thigh + s * 0.55 * amp); swing(rig.thighR, axis, STAND.thigh - s * 0.55 * amp);
  // la rodilla se dobla cuando la pierna pasa hacia delante
  swing(rig.shinL, axis, STAND.shin - Math.max(0, c) * 0.7 * amp); swing(rig.shinR, axis, STAND.shin - Math.max(0, -c) * 0.7 * amp);
  swing(rig.armL, axis, STAND.arm - s * 0.45 * amp); swing(rig.armR, axis, STAND.arm + s * 0.45 * amp);
  swing(rig.foreL, axis, STAND.fore + 0.25 * amp * Math.max(0, s)); swing(rig.foreR, axis, STAND.fore + 0.25 * amp * Math.max(0, -s));
}

// Pega el cuerpo al jugador: va justo detrás de la cámara y gira con ella. La cabeza se oculta para no tapar la vista.
export async function attachBody(ctx) {
  const body = await loadChild(ctx);
  body.setHeadVisible(false);
  const BACK = 0.3;
  ctx.addUpdater((dt) => {
    body.walk(dt, ctx.player.velocity.speed);
    if (!body.follow) return;
    const { x, z } = ctx.camera.position, yaw = ctx.player.yaw;
    body.node.position.set(x - Math.sin(yaw) * BACK, 0, z - Math.cos(yaw) * BACK);
    body.node.rotation.y = yaw + BODY_YAW;
  });
  ctx.body = body;
  return body;
}

// El modelo ya mira hacia +Z (el mismo sentido que yaw = 0).
export const BODY_YAW = 0;
