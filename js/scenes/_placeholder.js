// Escena provisional para los actos que aún no existen: un suelo oscuro y un aviso.
// Sustituye cada fichero de acto por la escena real cuando toque.
import { createHelpers } from '../core/helpers.js';

export function makePlaceholder({ id, title, note }) {
  return {
    id,
    title,
    sceneOptions: {},
    async load(ctx) {
      const { scene, player, ui } = ctx;
      const h = createHelpers(scene);
      const g = h.MB.CreateGround('ground', { width: 40, height: 40 }, scene);
      g.material = h.mat('#1a1a1a', { spec: 0 });
      player.setBounds({ minX: -18, maxX: 18, minZ: -18, maxZ: 18 });
      player.teleport(0, 0, 0, 0);
      ui.toast(title + ': ' + note, 6000);
    },
    unload() {}
  };
}
