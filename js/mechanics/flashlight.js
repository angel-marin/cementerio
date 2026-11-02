// FASE 2 - Linterna.
//
// API prevista:
//   const fl = createFlashlight(ctx, { range: 14, angle: 0.7 });
//   fl.isOn                       // estado actual
//   fl.toggle() / fl.set(true)    // se enlaza a la tecla F y al botón de móvil
//   fl.onToggle = (isOn) => {}    // los puzles reaccionan aquí
//   fl.addShadowObject(mesh)      // objetos visibles solo con la linterna apagada
//   fl.dispose()
//
// Al crearla debe llamar a ctx.input.showFlashlightButton(true) y asignar ctx.input.onFlashlight.
export function createFlashlight(/* ctx, options */) {
  throw new Error('flashlight.js: pendiente de implementar en la Fase 2');
}
