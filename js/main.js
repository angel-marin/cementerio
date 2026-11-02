// Arranque del juego, bucle principal y gestor de escenas.
import { CONFIG } from './config.js';
import { createEngine, createBaseScene, isTouch } from './core/engine.js';
import { createInput } from './core/input.js';
import { createPlayer } from './core/player.js';
import { createInteraction } from './core/interaction.js';
import { createUI } from './core/ui.js';
import * as audio from './core/audio.js';
import * as state from './core/state.js';

import * as prototype from './scenes/prototype.js';
import * as prologue from './scenes/prologue.js';
import * as act1 from './scenes/act1_simple.js';
import * as act2 from './scenes/act2_smallGrave.js';
import * as act3 from './scenes/act3_brokenDreams.js';
import * as act4 from './scenes/act4_tieDreams.js';
import * as act5 from './scenes/act5_lessYouSee.js';
import * as act6 from './scenes/act6_doubts.js';
import * as act7 from './scenes/act7_gravediggerDream.js';
import * as epilogue from './scenes/epilogue.js';
import * as testMechanics from './scenes/test_mechanics.js';

/* ---------- Registro de escenas ---------- */
// Para añadir un acto nuevo: crea js/scenes/<nombre>.js con { id, title, load, unload } y añádelo aquí.
const SCENES = [prologue, act1, act2, act3, act4, act5, act6, act7, epilogue, prototype, testMechanics];
const registry = new Map(SCENES.map((s) => [s.id, s]));

/* ---------- Núcleo ---------- */
const canvas = document.getElementById('c');
const engine = createEngine(canvas);
const input = createInput({ canvas, isTouch });
const ui = createUI();
const game = { started: false, startTime: 0 };

let current = null;     // módulo de la escena activa
let ctx = null;         // contexto que reciben las escenas
let loading = false;

if (CONFIG.persist) { state.enablePersistence(true); state.load(); }
state.subscribe((s) => { ui.renderInventory(s.inventory); ui.setJournalCount(s.journal.length); });
ui.renderInventory(state.state.inventory);
ui.setJournalCount(state.state.journal.length);
const startWaiters = [];

function syncBlocked() {
  const modal = ui.modalOpen || ui.isDebugOpen();
  input.setEnabled(game.started && !modal);
  if (ctx) ctx.player.frozen = !game.started || modal || ui.dialogueOpen;
  syncResume();
}
function syncResume() {
  const need = !isTouch && game.started && !ui.modalOpen && !ui.isDebugOpen() && !input.isLocked();
  ui.setResumeVisible(need);
}
ui.onModalChange = (open) => { if (open) input.exitLock(); syncBlocked(); };
input.onLockChange = () => syncResume();

/* ---------- Cambio de escena ---------- */
async function goTo(id) {
  const mod = registry.get(id);
  if (!mod || loading) return;
  loading = true;
  try {
    if (current && game.started) await ui.fade(1, 400);
    ui.reset();
    audio.stopPad(0.4);
    if (current) {
      try { current.unload && current.unload(ctx); } catch (err) { console.error(err); }
      ctx.scene.dispose();
    }
    const base = createBaseScene(engine, mod.sceneOptions || {});
    const player = createPlayer({ camera: base.camera, input });
    const interaction = createInteraction({ scene: base.scene, player, ui });
    const updaters = [];
    const addUpdater = (fn) => { updaters.push(fn); return () => { const i = updaters.indexOf(fn); if (i >= 0) updaters.splice(i, 1); }; };
    const waitUntil = (cond) => new Promise((res) => {
      if (cond()) { res(); return; }
      const off = addUpdater(() => { if (cond()) { off(); res(); } });
    });
    const wait = (seconds) => new Promise((res) => {
      let t = 0;
      const off = addUpdater((dt) => { t += dt; if (t >= seconds) { off(); res(); } });
    });
    const whenStarted = () => (game.started ? Promise.resolve() : new Promise((res) => startWaiters.push(res)));
    ctx = { ...base, engine, canvas, input, ui, audio, state, player, interaction, game, isTouch, goTo, updaters, addUpdater, waitUntil, wait, whenStarted, useHandler: null };

    input.onLook = (dx, dy) => player.look(dx, dy);
    input.onUse = () => { if (ui.advance()) return; if (ctx.useHandler) { ctx.useHandler(); return; } interaction.use(); };
    input.onFlashlight = null;   // lo asigna la mecánica de linterna (Fase 2)
    input.showFlashlightButton(false);

    current = mod;
    state.setAct(id);
    await mod.load(ctx);
    syncBlocked();
    if (game.started) ui.fade(0, 700);
  } catch (err) {
    console.error('Error al cargar la escena ' + id, err);
    ui.toast('No se pudo cargar la escena: ' + id, 5000);
  } finally {
    loading = false;
  }
}

/* ---------- Diario (tecla J o botón) ---------- */
function toggleJournal() {
  if (ui.modalOpen && ui.modalKind === 'journal') { ui.closeModal(); return; }
  if (!game.started || ui.modalOpen || ui.isDebugOpen()) return;
  ui.openJournal(state.state.journal);
}
input.onJournal = toggleJournal;
document.getElementById('journalBtn').addEventListener('click', toggleJournal);

/* ---------- Menú de depuración (tecla P o triple toque en el cuadro de bolsillos) ---------- */
function toggleDebug() {
  if (ui.isDebugOpen()) { ui.closeDebug(); syncBlocked(); return; }
  ui.openDebug(SCENES.map((s) => ({ id: s.id, title: s.title })), (id) => { goTo(id); });
  syncBlocked();
}
input.onDebug = toggleDebug;
input.onEscape = () => {
  if (ui.isDebugOpen()) { ui.closeDebug(); syncBlocked(); }
  else if (ui.modalOpen && !ui.modalLocked && !document.getElementById('end').classList.contains('show')) { ui.closeModal(); }
};

/* ---------- Bucle principal ---------- */
let last = performance.now();
engine.runRenderLoop(() => {
  const now = performance.now();
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!ctx || loading) return;
  ctx.player.update(dt);
  ctx.interaction.update();
  for (const fn of ctx.updaters.slice()) fn(dt);
  if (current.update) current.update(dt, ctx);
  ctx.scene.render();
});

/* ---------- Pantalla de inicio ---------- */
(async function boot() {
  const params = new URLSearchParams(location.search);
  const first = registry.has(params.get('escena')) ? params.get('escena') : CONFIG.defaultScene;
  await goTo(first);
  ui.showStart({
    title: CONFIG.title,
    text: CONFIG.texts.intro,
    controls: isTouch ? CONFIG.texts.controlsTouch : CONFIG.texts.controlsDesktop,
    button: CONFIG.texts.startButton,
    onStart: () => {
      audio.unlock();
      game.started = true;
      game.startTime = performance.now();
      if (isTouch) input.showTouchControls(true); else input.requestLock();
      syncBlocked();
      startWaiters.splice(0).forEach((fn) => fn());
    }
  });
})();

// Útil para depurar desde la consola del navegador.
window.__juego = { goTo, state, get ctx() { return ctx; } };
