// Entrada unificada: teclado, ratón (bloqueo de puntero) y controles táctiles.
// El resto del juego solo conoce: input.getMove(), onLook, onUse, onFlashlight, onDebug, onEscape.

const MOUSE_SENS = 0.0022;
const TOUCH_SENS = 0.005;

export function createInput({ canvas, isTouch }) {
  const $ = (id) => document.getElementById(id);
  const keys = {};
  const joy = { x: 0, y: 0 };

  const input = {
    enabled: false,
    onLook: null,         // (dyaw, dpitch) en radianes
    onUse: null,
    onFlashlight: null,
    onDebug: null,
    onEscape: null,
    onLockChange: null,   // (locked)

    isLocked: () => document.pointerLockElement === canvas,

    requestLock() {
      if (isTouch) return;
      try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (_) {}
    },
    exitLock() { if (document.pointerLockElement) document.exitPointerLock(); },

    setEnabled(v) {
      input.enabled = v;
      if (!v) { for (const k in keys) keys[k] = false; joy.x = joy.y = 0; }
    },

    showTouchControls(v) { $('touch').classList.toggle('on', !!v && isTouch); },
    showFlashlightButton(v) { $('flashBtn').hidden = !v; },

    // Vector de movimiento normalizado: x = lateral, y = adelante.
    getMove() {
      if (!input.enabled) return { x: 0, y: 0 };
      let x = 0, y = 0;
      if (keys.KeyW || keys.ArrowUp) y += 1;
      if (keys.KeyS || keys.ArrowDown) y -= 1;
      if (keys.KeyD || keys.ArrowRight) x += 1;
      if (keys.KeyA || keys.ArrowLeft) x -= 1;
      x += joy.x; y += joy.y;
      const len = Math.hypot(x, y);
      if (len > 1) { x /= len; y /= len; }
      return { x, y };
    }
  };

  /* Teclado */
  window.addEventListener('keydown', (e) => {
    if (input.enabled && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    if (e.code === 'KeyP' && !e.repeat) { input.onDebug && input.onDebug(); return; }
    if (e.code === 'Escape') { input.onEscape && input.onEscape(); }
    if (!input.enabled) return;
    if (e.code === 'KeyE' && !e.repeat) input.onUse && input.onUse();
    if (e.code === 'KeyF' && !e.repeat) input.onFlashlight && input.onFlashlight();
    keys[e.code] = true;
  });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

  /* Ratón */
  document.addEventListener('mousemove', (e) => {
    if (!input.enabled || !input.isLocked()) return;
    input.onLook && input.onLook(e.movementX * MOUSE_SENS, e.movementY * MOUSE_SENS);
  });
  canvas.addEventListener('click', () => {
    if (!input.enabled || isTouch) return;
    if (input.isLocked()) input.onUse && input.onUse(); else input.requestLock();
  });
  document.addEventListener('pointerlockchange', () => input.onLockChange && input.onLockChange(input.isLocked()));

  /* Joystick */
  const stick = $('stick'), knob = $('knob');
  let sid = null, scx = 0, scy = 0;
  const moveStick = (t) => {
    let dx = t.clientX - scx, dy = t.clientY - scy;
    const m = Math.hypot(dx, dy), R = 44;
    if (m > R) { dx = dx / m * R; dy = dy / m * R; }
    knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    joy.x = dx / R; joy.y = -dy / R;
  };
  stick.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.changedTouches[0]; sid = t.identifier;
    const r = stick.getBoundingClientRect(); scx = r.left + r.width / 2; scy = r.top + r.height / 2;
    moveStick(t);
  }, { passive: false });
  stick.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (const t of e.changedTouches) if (t.identifier === sid) moveStick(t);
  }, { passive: false });
  const endStick = (e) => {
    for (const t of e.changedTouches) if (t.identifier === sid) { sid = null; joy.x = joy.y = 0; knob.style.transform = 'translate(0,0)'; }
  };
  stick.addEventListener('touchend', endStick);
  stick.addEventListener('touchcancel', endStick);

  /* Botones táctiles */
  $('use').addEventListener('touchstart', (e) => { e.preventDefault(); if (input.enabled) input.onUse && input.onUse(); }, { passive: false });
  $('flashBtn').addEventListener('touchstart', (e) => { e.preventDefault(); if (input.enabled) input.onFlashlight && input.onFlashlight(); }, { passive: false });

  /* Arrastrar para mirar */
  let lookId = null, lx = 0, ly = 0;
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!input.enabled) return;
    for (const t of e.changedTouches) if (lookId === null) { lookId = t.identifier; lx = t.clientX; ly = t.clientY; }
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (const t of e.changedTouches) if (t.identifier === lookId) {
      if (input.enabled) input.onLook && input.onLook((t.clientX - lx) * TOUCH_SENS, (t.clientY - ly) * TOUCH_SENS);
      lx = t.clientX; ly = t.clientY;
    }
  }, { passive: false });
  const endLook = (e) => { for (const t of e.changedTouches) if (t.identifier === lookId) lookId = null; };
  canvas.addEventListener('touchend', endLook);
  canvas.addEventListener('touchcancel', endLook);

  /* Triple toque sobre el cuadro de bolsillos = menú de depuración */
  let taps = [];
  $('inv').addEventListener('click', () => {
    const now = performance.now();
    taps = taps.filter((t) => now - t < 800); taps.push(now);
    if (taps.length >= 3) { taps = []; input.onDebug && input.onDebug(); }
  });

  return input;
}

