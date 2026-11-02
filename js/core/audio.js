// Sonido sin ficheros: todo se genera con WebAudio.
//   - efectos (sfx), música de acordes lentos (startPad) y ambientes (viento, cripta, interior, alba);
//   - pasos y sonido espacial: cada fuente (emitter) suena desde su posición en el mundo;
//   - volumen general con silenciar (tecla M o menú), que se recuerda en el navegador.
// Si se prefiere música real, basta con dejar ficheros en assets/audio/ y usar playMusic('fichero.mp3').
let ac = null, master = null;
let muted = false;
try { muted = localStorage.getItem('noche-sonido') === 'no'; } catch (_) {}

function ctx() {
  if (!ac) {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ac.destination);
  }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
const out = () => { ctx(); return master; };

export function isMuted() { return muted; }
export function setMuted(v) {
  muted = !!v;
  try { localStorage.setItem('noche-sonido', muted ? 'no' : 'si'); } catch (_) {}
  try { if (master) master.gain.value = muted ? 0 : 1; } catch (_) {}
}

export function beep(freq, dur, type = 'sine', vol = 0.05, delay = 0) {
  try {
    const a = ctx();
    const o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.value = freq;
    o.connect(g); g.connect(out());
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
  thud() { beep(80, 0.3, 'sine', 0.14); beep(55, 0.35, 'sine', 0.1, 0.02); },
  soft() { beep(330, 0.25, 'sine', 0.03); },
  whisper() { beep(170, 0.6, 'sine', 0.018); beep(131, 0.7, 'triangle', 0.012, 0.15); },
  chime(i = 0) { beep([392, 440, 494, 587, 659][i % 5], 0.35, 'sine', 0.05); },
  tick() { beep(900, 0.04, 'square', 0.02); },
  tock() { beep(700, 0.04, 'square', 0.02); }
};

// Debe llamarse desde un gesto del usuario (clic o toque) para que el navegador permita el audio.
export function unlock() { try { ctx(); } catch (_) {} }

/* ---------- Música: acordes lentos ---------- */
const PADS = {
  noche: { dur: 9, vol: 0.022, chords: [[110, 165, 220], [98, 147, 196], [110, 165, 220], [87.3, 130.8, 174.6]] },
  suave: { dur: 7, vol: 0.03, chords: [[196, 247, 294], [175, 220, 262], [165, 208, 247], [147, 185, 220]] }
};
let padTimer = null, padMaster = null;
export function startPad(name = 'noche') {
  stopPad();
  const cfg = PADS[name];
  if (!cfg) return;
  try {
    const a = ctx();
    padMaster = a.createGain(); padMaster.gain.value = 1; padMaster.connect(out());
    const m = padMaster;
    let i = 0;
    const play = () => {
      const t = a.currentTime, chord = cfg.chords[i % cfg.chords.length]; i++;
      chord.forEach((f, k) => {
        const o = a.createOscillator(), g = a.createGain();
        o.type = k === 0 ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = (k - 1) * 5;
        o.connect(g); g.connect(m);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(cfg.vol, t + cfg.dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + cfg.dur + 0.6);
        o.start(t); o.stop(t + cfg.dur + 0.7);
      });
    };
    play();
    padTimer = setInterval(play, (cfg.dur - 0.4) * 1000);
  } catch (_) {}
}
export function stopPad(fade = 1.2) {
  if (padTimer) { clearInterval(padTimer); padTimer = null; }
  if (padMaster) {
    try { const a = ctx(); padMaster.gain.cancelScheduledValues(a.currentTime); padMaster.gain.setValueAtTime(padMaster.gain.value, a.currentTime); padMaster.gain.linearRampToValueAtTime(0, a.currentTime + fade); } catch (_) {}
    padMaster = null;
  }
}

// Música real: busca assets/audio/<fichero>. Si no existe, no pasa nada.
let music = null;
export function playMusic(file, { volume = 0.4, loop = true } = {}) {
  stopMusic();
  try {
    music = new Audio('assets/audio/' + file);
    music.loop = loop; music.volume = muted ? 0 : volume;
    music.play().catch(() => {});
  } catch (_) {}
}
export function stopMusic() { if (music) { music.pause(); music = null; } }

/* ---------- Ambientes (viento, cripta, interior, alba) ---------- */
let noiseBuf = null;
function noise(a) {
  if (!noiseBuf) {
    noiseBuf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}
const AMBIENTS = {
  viento: { cutoff: 380, gain: 0.05, lfo: 0.11, depth: 0.5 },
  interior: { cutoff: 160, gain: 0.025, lfo: 0.07, depth: 0.25 },
  cripta: { cutoff: 90, gain: 0.06, lfo: 0.05, depth: 0.3, drone: 55 },
  alba: { cutoff: 520, gain: 0.03, lfo: 0.09, depth: 0.5, birds: true }
};
let ambNodes = null, birdTimer = null, ambKind = null;
export function startAmbient(kind) {
  if (ambKind === kind && ambNodes) return;
  stopAmbient(0.2);
  const cfg = AMBIENTS[kind];
  if (!cfg) return;
  try {
    const a = ctx();
    const src = a.createBufferSource(); src.buffer = noise(a); src.loop = true;
    const filt = a.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = cfg.cutoff;
    const g = a.createGain(); g.gain.value = cfg.gain;
    const lfo = a.createOscillator(), lg = a.createGain();
    lfo.frequency.value = cfg.lfo; lg.gain.value = cfg.gain * cfg.depth;
    lfo.connect(lg); lg.connect(g.gain);
    src.connect(filt); filt.connect(g); g.connect(out());
    src.start(); lfo.start();
    const nodes = [src, lfo];
    if (cfg.drone) { const d = a.createOscillator(), dg = a.createGain(); d.frequency.value = cfg.drone; dg.gain.value = 0.02; d.connect(dg); dg.connect(out()); d.start(); nodes.push(d); }
    ambNodes = { nodes, g }; ambKind = kind;
    if (cfg.birds) birdTimer = setInterval(() => { if (Math.random() < 0.6) chirp(); }, 2600);
  } catch (_) {}
}
function chirp() {
  try {
    const a = ctx(), o = a.createOscillator(), g = a.createGain();
    const f = 1800 + Math.random() * 1400, t = a.currentTime;
    o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.4, t + 0.12);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.012, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g); g.connect(out()); o.start(t); o.stop(t + 0.2);
  } catch (_) {}
}
export function stopAmbient(fade = 0.6) {
  if (birdTimer) { clearInterval(birdTimer); birdTimer = null; }
  if (ambNodes) {
    const { nodes, g } = ambNodes;
    try { const a = ctx(); g.gain.cancelScheduledValues(a.currentTime); g.gain.linearRampToValueAtTime(0, a.currentTime + fade); setTimeout(() => nodes.forEach((n) => { try { n.stop(); } catch (_) {} }), fade * 1000 + 100); } catch (_) {}
  }
  ambNodes = null; ambKind = null;
}

/* ---------- Pasos ---------- */
export function footstep() {
  try {
    const a = ctx(), t = a.currentTime;
    const src = a.createBufferSource(); src.buffer = noise(a);
    const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260 + Math.random() * 120;
    const g = a.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    src.connect(f); f.connect(g); g.connect(out()); src.start(t, Math.random()); src.stop(t + 0.13);
  } catch (_) {}
}

/* ---------- Sonido espacial ---------- */
// Cada fuente suena desde una posición del mundo; el oyente es la cámara. El mundo de Babylon usa z hacia delante
// y WebAudio usa z hacia atrás, por eso se invierte z.
const emitters = new Set();
export function emitter({ freq = 220, type = 'sine', vol = 0.03, pulse = 0, position = null } = {}) {
  const em = { alive: false, setPosition() {}, setVolume() {}, dispose() {} };
  try {
    const a = ctx();
    const o = a.createOscillator(), g = a.createGain(), p = a.createPanner();
    o.type = type; o.frequency.value = freq;
    g.gain.value = vol;
    p.panningModel = 'equalpower'; p.distanceModel = 'inverse';
    p.refDistance = 1.5; p.rolloffFactor = 1.6; p.maxDistance = 30;
    o.connect(g); g.connect(p); p.connect(out());
    let lfo = null;
    if (pulse) { lfo = a.createOscillator(); const lg = a.createGain(); lfo.frequency.value = pulse; lg.gain.value = vol * 0.7; lfo.connect(lg); lg.connect(g.gain); lfo.start(); }
    o.start();
    const setPos = (x, y, z) => {
      if (p.positionX) { p.positionX.value = x; p.positionY.value = y; p.positionZ.value = -z; }
      else if (p.setPosition) p.setPosition(x, y, -z);
    };
    if (position) setPos(position.x, position.y, position.z);
    em.alive = true;
    em.setPosition = (v) => { try { setPos(v.x, v.y, v.z); } catch (_) {} };
    em.setVolume = (v) => { try { g.gain.value = v; } catch (_) {} };
    em.dispose = () => { if (!em.alive) return; em.alive = false; emitters.delete(em); try { o.stop(); if (lfo) lfo.stop(); o.disconnect(); } catch (_) {} };
    emitters.add(em);
  } catch (_) { /* audio no disponible */ }
  return em;
}
export function clearEmitters() { [...emitters].forEach((e) => e.dispose()); emitters.clear(); }
export const emitterCount = () => emitters.size;

// Coloca el oído del jugador (cámara) en el mundo.
export function updateListener(pos, yaw) {
  try {
    if (!ac) return;
    const l = ac.listener, fx = Math.sin(yaw), fz = -Math.cos(yaw);
    if (l.positionX) {
      l.positionX.value = pos.x; l.positionY.value = pos.y; l.positionZ.value = -pos.z;
      l.forwardX.value = fx; l.forwardY.value = 0; l.forwardZ.value = fz;
      l.upX.value = 0; l.upY.value = 1; l.upZ.value = 0;
    } else if (l.setPosition) { l.setPosition(pos.x, pos.y, -pos.z); l.setOrientation(fx, 0, fz, 0, 1, 0); }
  } catch (_) {}
}

// Compatibilidad con la versión anterior
export function playAt(kind = 'chime', pos = null) {
  const em = emitter({ freq: 660, vol: 0.05, position: pos });
  setTimeout(() => em.dispose(), 600);
}

export const audio = { beep, sfx, unlock, playMusic, stopMusic, startPad, stopPad, startAmbient, stopAmbient, footstep, emitter, clearEmitters, updateListener, playAt, isMuted, setMuted };
