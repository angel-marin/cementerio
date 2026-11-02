import { makePlaceholder } from './_placeholder.js';

const scene = makePlaceholder({
  id: 'act1_simple',
  title: 'Acto 1: Lo sencillo',
  note: 'Casa del sepulturero: la cena y las herramientas. Pendiente (Fase 3).'
});

export const id = scene.id;
export const title = scene.title;
export const sceneOptions = scene.sceneOptions;
export const load = scene.load;
export const unload = scene.unload;
