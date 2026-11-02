// Estado global del juego: acto actual, puzles resueltos, inventario y banderas.
const KEY = 'noche-del-enterrador-v1';

export const state = {
  act: 'prototype',
  solvedPuzzles: new Set(),
  inventory: [],
  flags: {},
  journal: []          // { id, title, text }
};

let persist = false;
const listeners = new Set();

function changed() {
  if (persist) save();
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function setAct(id) { state.act = id; changed(); }
export function setFlag(name, value = true) { state.flags[name] = value; changed(); }
export function hasFlag(name) { return !!state.flags[name]; }
export function getFlag(name) { return state.flags[name]; }

export function addItem(id) { if (!state.inventory.includes(id)) { state.inventory.push(id); changed(); } }
export function removeItem(id) { const i = state.inventory.indexOf(id); if (i >= 0) { state.inventory.splice(i, 1); changed(); } }
export function hasItem(id) { return state.inventory.includes(id); }

export function solvePuzzle(id) { if (!state.solvedPuzzles.has(id)) { state.solvedPuzzles.add(id); changed(); } }
export function isSolved(id) { return state.solvedPuzzles.has(id); }

export function addJournal(entry) {
  if (state.journal.some((e) => e.id === entry.id)) return false;
  state.journal.push(entry); changed(); return true;
}
export function hasJournal(id) { return state.journal.some((e) => e.id === id); }

export function reset() {
  state.act = 'prototype';
  state.solvedPuzzles = new Set();
  state.inventory = [];
  state.flags = {};
  state.journal = [];
  changed();
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      act: state.act, solved: [...state.solvedPuzzles], inventory: state.inventory, flags: state.flags, journal: state.journal
    }));
  } catch (_) { /* sin almacenamiento disponible */ }
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    state.act = d.act || state.act;
    state.solvedPuzzles = new Set(d.solved || []);
    state.inventory = d.inventory || [];
    state.flags = d.flags || {};
    state.journal = d.journal || [];
    listeners.forEach((fn) => fn(state));
    return true;
  } catch (_) { return false; }
}

export function clearSave() { try { localStorage.removeItem(KEY); } catch (_) {} }

export function enablePersistence(on) { persist = !!on; if (persist) save(); }
