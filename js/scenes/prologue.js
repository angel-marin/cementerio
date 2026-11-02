import { makePlaceholder } from './_placeholder.js';

const scene = makePlaceholder({
  id: 'prologue',
  title: 'Prólogo: Hoy no iba a dormir',
  note: 'Cuarto del niño, voz en off y camino hasta el cementerio. Pendiente (Fase 3).'
});

export const id = scene.id;
export const title = scene.title;
export const sceneOptions = scene.sceneOptions;
export const load = scene.load;
export const unload = scene.unload;
