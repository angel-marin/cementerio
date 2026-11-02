// Linterna: foco pegado a la cámara, con objetos de sombra que solo se ven con ella apagada.
//
// Uso:
//   const fl = createFlashlight(ctx, { startOn: true });
//   fl.onToggle = (isOn) => { ... };                    // los puzles reaccionan aquí
//   fl.addShadowObject(mesh, { flag: 'simbolos' });     // visible solo con la linterna apagada
//                                                       // (y, si se indica flag, solo cuando esa bandera esté activa)
//   fl.setAvailable(false);                             // p. ej. antes de recoger el farol
//   fl.toggle() / fl.set(true) / fl.dispose()
//
// Tecla F en ordenador y botón "Linterna" en móvil.
import { hasFlag } from '../core/state.js';
import { sfx } from '../core/audio.js';

const B = window.BABYLON;

export function createFlashlight(ctx, options = {}) {
  const { scene, camera, input } = ctx;
  const o = { range: 16, angle: 0.8, exponent: 2.5, intensity: 2.6, startOn: true, available: true, ...options };

  const light = new B.SpotLight('flashlight', new B.Vector3(0, 0, 0), new B.Vector3(0, 0, 1), o.angle, o.exponent, scene);
  light.parent = camera;
  light.intensity = o.intensity;
  light.range = o.range;
  light.diffuse = new B.Color3(0.96, 0.95, 0.9);
  light.specular = new B.Color3(0.3, 0.3, 0.3);

  // Material tenue de las cosas que solo viven en la oscuridad.
  const shadowMat = new B.StandardMaterial('shadowMat', scene);
  shadowMat.disableLighting = true;
  shadowMat.emissiveColor = new B.Color3(0.78, 0.8, 0.86);
  shadowMat.backFaceCulling = false;

  const entries = [];   // { mesh, flag, v }

  const fl = {
    isOn: false,
    available: o.available,
    onToggle: null,
    light,
    shadowMaterial: shadowMat,

    set(on) {
      if (on && !fl.available) return;
      if (fl.isOn === on) return;
      fl.isOn = on;
      light.setEnabled(on);
      fl.onToggle && fl.onToggle(on);
    },

    toggle() {
      if (!fl.available) return;
      sfx.tick();
      fl.set(!fl.isOn);
    },

    setAvailable(v) {
      fl.available = v;
      input.showFlashlightButton(v);
      if (!v) fl.set(false);
    },

    addShadowObject(mesh, { flag = null, maxVisibility = 0.9, useShadowMaterial = true } = {}) {
      if (useShadowMaterial) mesh.material = shadowMat;
      mesh.isPickable = false;
      mesh.visibility = 0;
      entries.push({ mesh, flag, max: maxVisibility, v: 0 });
      return mesh;
    },

    // ¿Se está viendo ahora mismo este objeto de sombra?
    isRevealed(mesh) {
      const e = entries.find((x) => x.mesh === mesh);
      return !!e && e.v > 0.5;
    },

    update(dt) {
      for (const e of entries) {
        const target = !fl.isOn && (!e.flag || hasFlag(e.flag)) ? e.max : 0;
        e.v += (target - e.v) * Math.min(1, dt * 4);
        if (Math.abs(target - e.v) < 0.005) e.v = target;
        e.mesh.visibility = e.v;
        e.mesh.setEnabled(e.v > 0.01);
      }
    },

    dispose() {
      light.dispose();
      shadowMat.dispose();
      removeUpdater();
      input.onFlashlight = null;
      input.showFlashlightButton(false);
    }
  };

  input.onFlashlight = () => fl.toggle();
  input.showFlashlightButton(fl.available);
  const removeUpdater = ctx.addUpdater((dt) => fl.update(dt));

  fl.isOn = false;
  light.setEnabled(false);
  if (o.startOn && fl.available) fl.set(true);

  return fl;
}
