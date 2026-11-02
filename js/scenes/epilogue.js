import { makePlaceholder } from './_placeholder.js';

const scene = makePlaceholder({
  id: 'epilogue',
  title: 'Epílogo: Cumplió su palabra',
  note: 'Salto en el tiempo y créditos. Pendiente (Fase 5).'
});

export const id = scene.id;
export const title = scene.title;
export const sceneOptions = scene.sceneOptions;
export const load = scene.load;
export const unload = scene.unload;
