// FASE 2 - Hilo.
//
// API prevista:
//   const t = createThread(ctx, { from: Vector3, to: Vector3, obstacles: [mesh], others: [thread] });
//   t.setEnd(Vector3)             // estira el hilo (por ejemplo, hacia el jugador)
//   t.check()                     // comprueba cruces con otros hilos y con obstáculos
//   t.onConnected = () => {}
//   t.onBroken = () => {}
//   t.dispose()
export function createThread(/* ctx, options */) {
  throw new Error('thread.js: pendiente de implementar en la Fase 2');
}
