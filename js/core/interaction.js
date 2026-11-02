// Selección de objetos con la mirada y acción "Usar".
//
// Registrar un objeto:
//   interaction.add(meshes, { id:'puerta', hint:'Abrir la puerta', onUse(){...} })
//   interaction.add(mesh,   { text:'Una lápida sin nombre.' })           // solo examinar
//   hint puede ser texto o función que devuelve texto (para que cambie con el estado).

export function createInteraction({ scene, player, ui }) {
  let target = null;

  const api = {
    range: 3.2,

    add(meshes, def) {
      const list = Array.isArray(meshes) ? meshes : [meshes];
      list.forEach((m) => { m.metadata = { ...(m.metadata || {}), interact: def }; });
      return list;
    },

    remove(meshes) {
      const list = Array.isArray(meshes) ? meshes : [meshes];
      list.forEach((m) => { if (m.metadata) delete m.metadata.interact; });
    },

    get target() { return target; },

    update() {
      if (player.frozen) { target = null; ui.setHint(null); return; }
      const ray = player.forwardRay(api.range);
      const hit = scene.pickWithRay(ray, (m) => m.isPickable && m.isEnabled());
      let def = null;
      if (hit && hit.hit && hit.pickedMesh && hit.pickedMesh.metadata && hit.pickedMesh.metadata.interact) {
        def = hit.pickedMesh.metadata.interact;
      }
      target = def;
      if (!def) { ui.setHint(null); return; }
      const hint = typeof def.hint === 'function' ? def.hint() : def.hint;
      ui.setHint(hint || 'Examinar');
    },

    use() {
      if (player.frozen || !target) return;
      if (target.onUse) target.onUse();
      else if (target.text) ui.toast(target.text);
    }
  };
  return api;
}
