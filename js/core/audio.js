// Sonido: efectos sintéticos (WebAudio) y ganchos para música y sonido espacial.
let ac = null;

function ctx() {
  ac = ac || new (window.AudioContext || window.webkitAudioContext)();
  if (ac.state === 'suspended') ac.resume();
  return ac;
}

export function beep(freq, dur, type = 'sine', vol = 0.05, delay = 0) {
  try {
    const a = ctx();
    const o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.value = freq;
    o.connect(g); g.connect(a.destination);
    const t = a.currentTime + delay;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.03);
  } catch (_) { /* audio no disponible */ }
}

export const sfx = {
  pick() { beep(520, 0.12, 'triangle', 0.06); beep(780, 0.16, 'triangle', 0.06, 0.1); },
  open() { beep(300, 0.12, 'triangle', 0.06); beep(450, 0.12, 'triangle', 0.06, 0.1); beep(680, 0.2, 'triangle', 0.06, 0.2); },
  bad() { beep(150, 0.22, 'square', 0.04); },
  talk() { beep(240, 0.07, 'triangle', 0.04); beep(300, 0.07, 'triangle', 0.04, 0.09); },
  door() { beep(110, 0.8, 'sawtooth', 0.035); beep(165, 0.8, 'sawtooth', 0.025, 0.1); },
  tick() { beep(900, 0.04, 'square', 0.02); },
  tock() { beep(700, 0.04, 'square', 0.02); }
};

// Debe llamarse desde un gesto del usuario (clic o toque) para que el navegador permita el audio.
export function unlock() { try { ctx(); } catch (_) {} }

// Música ambiente: busca assets/audio/<fichero>. Si no existe, no pasa nada.
let music = null;
export function playMusic(file, { volume = 0.4, loop = true } = {}) {
  stopMusic();
  try {
    music = new Audio('assets/audio/' + file);
    music.loop = loop; music.volume = volume;
    music.play().catch(() => {});
  } catch (_) {}
}
export function stopMusic() { if (music) { music.pause(); music = null; } }

// Fase 6: sonido espacial con BABYLON.Sound. Por ahora solo reserva la firma.
export function playAt(/* file, position, options */) { /* pendiente */ }

export const audio = { beep, sfx, unlock, playMusic, stopMusic, playAt };
