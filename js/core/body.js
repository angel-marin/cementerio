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
  return { node, parts, heads, setHeadVisible };
}

// Pega el cuerpo al jugador: va justo detrás de la cámara y gira con ella. La cabeza se oculta para no tapar la vista.
export async function attachBody(ctx) {
  const body = await loadChild(ctx);
  body.setHeadVisible(false);
  const BACK = 0.3;
  ctx.addUpdater(() => {
    const { x, z } = ctx.camera.position, yaw = ctx.player.yaw;
    body.node.position.set(x - Math.sin(yaw) * BACK, 0, z - Math.cos(yaw) * BACK);
    body.node.rotation.y = yaw + BODY_YAW;
  });
  ctx.body = body;
  return body;
}

// El modelo ya mira hacia +Z (el mismo sentido que yaw = 0).
export const BODY_YAW = 0;
