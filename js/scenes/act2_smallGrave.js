import { makePlaceholder } from './_placeholder.js';

const scene = makePlaceholder({
  id: 'act2_smallGrave',
  title: 'Acto 2: La tumba pequeña',
  note: 'Cavar con respeto y diálogo con elección. Pendiente (Fase 3).'
});

export const id = scene.id;
export const title = scene.title;
export const sceneOptions = scene.sceneOptions;
export const load = scene.load;
export const unload = scene.unload;
