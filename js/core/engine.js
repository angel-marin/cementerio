// Motor, escena base, luces, niebla y acabado de imagen (grano + viñeta).
const B = window.BABYLON;

export const isTouch = window.matchMedia('(pointer:coarse)').matches;

// Calidad gráfica: ?calidad=baja en la URL o la opción del menú (se recuerda en el navegador).
const QKEY = 'noche-calidad';
function readLow() {
  try {
    const q = new URLSearchParams(location.search).get('calidad');
    if (q) return q === 'baja';
    return localStorage.getItem(QKEY) === 'baja';
  } catch (_) { return false; }
}
export const quality = { low: readLow() };
export function setQuality(low) {
  quality.low = !!low;
  try { localStorage.setItem(QKEY, low ? 'baja' : 'alta'); } catch (_) {}
}

export function applyScaling(engine) {
  engine.setHardwareScalingLevel(quality.low ? 1.25 : 1 / Math.min(window.devicePixelRatio || 1, 1.5));
}

export function createEngine(canvas) {
  const engine = new B.Engine(canvas, true, { stencil: false });
  applyScaling(engine);
  window.addEventListener('resize', () => engine.resize());
  return engine;
}

/**
 * Crea una escena de Babylon lista para usar con cámara en primera persona.
 * Cada escena de juego recibe una escena de Babylon nueva; al salir se destruye entera.
 */
export function createBaseScene(engine, options = {}) {
  const o = {
    clear: [0.02, 0.02, 0.02],
    fogDensity: 0.04,
    fogColor: [0.045, 0.045, 0.045],
    hemiIntensity: 0.32,
    moon: true,        // luz direccional de luna
    shadows: true,     // sombras (solo en ordenador)
    filmLook: true,    // grano + viñeta + brillo
    ...options
  };

  const scene = new B.Scene(engine);
  scene.clearColor = new B.Color4(o.clear[0], o.clear[1], o.clear[2], 1);
  scene.fogMode = B.Scene.FOGMODE_EXP2;
  scene.fogDensity = o.fogDensity;
  scene.fogColor = new B.Color3(o.fogColor[0], o.fogColor[1], o.fogColor[2]);
  scene.skipPointerMovePicking = true;

  const camera = new B.UniversalCamera('cam', new B.Vector3(0, 1.65, 0), scene);
  camera.inputs.clear();
  camera.minZ = 0.05;
  camera.fov = 1.0;

  const hemi = new B.HemisphericLight('hemi', new B.Vector3(0, 1, 0), scene);
  hemi.intensity = o.hemiIntensity;
  hemi.diffuse = new B.Color3(0.8, 0.8, 0.8);
  hemi.groundColor = new B.Color3(0.1, 0.1, 0.1);

  let moon = null;
  let shadow = null;
  if (o.moon) {
    moon = new B.DirectionalLight('moon', new B.Vector3(-0.5, -1, -0.35), scene);
    moon.position = new B.Vector3(12, 20, 8);
    moon.intensity = 0.6;
    moon.diffuse = new B.Color3(0.82, 0.82, 0.82);
    moon.specular = new B.Color3(0.2, 0.2, 0.2);
    if (!isTouch && !quality.low && o.shadows) {
      shadow = new B.ShadowGenerator(1024, moon);
      shadow.useBlurExponentialShadowMap = true;
      shadow.blurKernel = 18;
      shadow.darkness = 0.25;
    }
  }
  const cast = (mesh) => { if (shadow) shadow.addShadowCaster(mesh); };

  let pipe = null, glow = null;
  if (o.filmLook) {
    try {
      if (isTouch || quality.low) {
        const ip = scene.imageProcessingConfiguration;
        ip.isEnabled = true; ip.vignetteEnabled = true; ip.vignetteWeight = 2.5; ip.contrast = 1.2;
      } else {
        pipe = new B.DefaultRenderingPipeline('dp', false, scene, [camera]);
        pipe.grainEnabled = true; pipe.grain.intensity = 9; pipe.grain.animated = true;
        pipe.imageProcessingEnabled = true;
        pipe.imageProcessing.vignetteEnabled = true;
        pipe.imageProcessing.vignetteWeight = 3;
        pipe.imageProcessing.contrast = 1.25;
        glow = new B.GlowLayer('glow', scene, { mainTextureFixedSize: 256, blurKernelSize: 32 });
        glow.intensity = 0.6;
      }
    } catch (err) {
      console.warn('No se pudo activar el acabado de imagen', err);
    }
  }

  // Si el juego va lento, se apagan sombras, grano y brillo y se baja un poco la resolución.
  const lowerQuality = () => {
    try {
      if (moon) moon.shadowEnabled = false;
      if (pipe) pipe.grainEnabled = false;
      if (glow) { glow.dispose(); glow = null; }
      engine.setHardwareScalingLevel(Math.max(engine.getHardwareScalingLevel(), 1.25));
    } catch (err) { console.warn('No se pudo bajar la calidad', err); }
  };

  return { scene, camera, hemi, moon, shadow, cast, lowerQuality };
}
