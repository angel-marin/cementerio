// Interfaz: pistas, avisos, diálogos, subtítulos, inventario, ventanas y pantallas.
import { CONFIG } from '../config.js';
import { sfx } from './audio.js';
import { isTouch } from './engine.js';

export function createUI() {
  const $ = (id) => document.getElementById(id);
  const hintEl = $('hint'), crossEl = $('cross'), toastEl = $('toast'), subsEl = $('subs');
  const invEl = $('inv'), invText = $('invText'), resumeEl = $('resume');
  const startEl = $('start'), endEl = $('end'), modalEl = $('modal'), debugEl = $('debug');
  const dialogEl = $('dialog'), fadeEl = $('fade'), journalBtn = $('journalBtn'), rhythmEl = $('rhythm');
  let advanceResolver = null, cancelWait = null;

  // Espera a que el jugador avance (E, clic o Usar) o a que pase el tiempo.
  // Si la escena cambia mientras tanto (reset), la espera se cancela y la promesa no se resuelve nunca:
  // así el guion de la escena antigua no sigue hablando encima de la nueva.
  function waitAdvance(ms) {
    return new Promise((resolve) => {
      const done = () => { clearTimeout(t); if (advanceResolver === done) advanceResolver = null; cancelWait = null; resolve(); };
      const t = setTimeout(done, ms);
      advanceResolver = done;
      cancelWait = () => { clearTimeout(t); advanceResolver = null; cancelWait = null; };
    });
  }

  let toastTimer = null, subsTimer = null, hintText = null;

  const ui = {
    modalOpen: false,
    modalLocked: false,      // true = no se cierra con Escape (elecciones)
    modalKind: null,
    dialogueOpen: false,
    onModalChange: null,    // (open)

    /* --- HUD --- */
    setHint(text) {
      if (text === hintText) return;
      hintText = text;
      if (text) { hintEl.textContent = text; hintEl.classList.add('show'); crossEl.classList.add('on'); }
      else { hintEl.classList.remove('show'); crossEl.classList.remove('on'); }
    },

    toast(msg, ms = 3400) {
      toastEl.textContent = msg;
      toastEl.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms);
    },

    // Diálogo breve con nombre del que habla.
    say(name, text, ms = 7000) {
      toastEl.textContent = '';
      const b = document.createElement('b');
      b.textContent = name;
      toastEl.append(b, text);
      toastEl.classList.add('show');
      sfx.talk();
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms);
    },

    // Voz en off / subtítulos en la parte baja.
    narrate(text, ms = 5000) {
      subsEl.textContent = text;
      subsEl.classList.add('show');
      clearTimeout(subsTimer);
      subsTimer = setTimeout(() => subsEl.classList.remove('show'), ms);
    },

    renderInventory(items) {
      const names = items.map((id) => CONFIG.items[id] || id);
      invText.textContent = names.length ? names.join(', ') : CONFIG.texts.emptyInventory;
      invEl.classList.toggle('has', names.length > 0);
    },

    // Línea de estado bajo el inventario (p. ej. fragmentos recogidos). Texto vacío = se oculta.
    setStatus(text) { const e = $('status'); e.textContent = text || ''; e.hidden = !text; },

    setResumeVisible(v) { resumeEl.classList.toggle('show', !!v); },

    /* --- Ventanas --- */
    openModal(content) {
      modalEl.textContent = '';
      modalEl.appendChild(content);
      modalEl.classList.add('show');
      ui.modalOpen = true;
      ui.setHint(null);
      ui.onModalChange && ui.onModalChange(true);
    },

    closeModal() {
      if (!ui.modalOpen) return;
      modalEl.classList.remove('show');
      modalEl.textContent = '';
      ui.modalOpen = false; ui.modalLocked = false; ui.modalKind = null;
      ui.onModalChange && ui.onModalChange(false);
    },

    card(...children) {
      const card = document.createElement('div');
      card.className = 'card';
      children.forEach((c) => card.appendChild(c));
      return card;
    },

    /* --- Candado numérico --- */
    keypad({ title = 'Candado', digits = 3, code, onSolved, onClose }) {
      const values = Array(digits).fill(0);
      const h2 = el('h2', title);
      const wheels = el('div', '', 'wheels');
      const msg = el('p', 'Gira las ruedas para elegir la combinación.', 'msg');
      const tryBtn = el('button', 'Probar', 'btn'); tryBtn.type = 'button';
      const closeBtn = el('button', 'Cerrar', 'btn ghost'); closeBtn.type = 'button';
      const row = el('div', '', 'row'); row.style.justifyContent = 'center';
      row.append(tryBtn, closeBtn);

      const render = () => {
        wheels.textContent = '';
        values.forEach((d, i) => {
          const w = el('div', '', 'wheel');
          const up = el('button', '▲'); up.type = 'button'; up.setAttribute('aria-label', 'Subir cifra ' + (i + 1));
          const val = el('div', String(d), 'd');
          const dn = el('button', '▼'); dn.type = 'button'; dn.setAttribute('aria-label', 'Bajar cifra ' + (i + 1));
          up.onclick = () => { values[i] = (values[i] + 1) % 10; render(); sfx.tick(); };
          dn.onclick = () => { values[i] = (values[i] + 9) % 10; render(); sfx.tock(); };
          w.append(up, val, dn); wheels.appendChild(w);
        });
      };
      render();

      const close = () => { ui.closeModal(); onClose && onClose(); };
      closeBtn.onclick = close;
      tryBtn.onclick = () => {
        if (values.join('') === String(code)) { ui.closeModal(); onSolved && onSolved(); }
        else {
          sfx.bad(); msg.textContent = 'La combinación no es correcta.'; msg.classList.add('bad');
          wheels.classList.remove('shake'); void wheels.offsetWidth; wheels.classList.add('shake');
        }
      };
      ui.openModal(ui.card(h2, wheels, msg, row));
    },

    /* --- Diálogos con avance (Usar / E / clic) --- */
    advance() { if (advanceResolver) { advanceResolver(); return true; } return false; },

    async dialogue(lines) {
      ui.dialogueOpen = true;
      ui.onModalChange && ui.onModalChange(ui.modalOpen);
      for (const l of lines) {
        dialogEl.textContent = '';
        if (l.name) { const b = document.createElement('b'); b.textContent = l.name; dialogEl.appendChild(b); }
        dialogEl.appendChild(document.createTextNode(l.text));
        const sm = document.createElement('small');
        sm.textContent = isTouch ? 'Toca Usar para continuar' : 'Pulsa E o haz clic para continuar';
        dialogEl.appendChild(sm);
        dialogEl.classList.add('show');
        sfx.talk();
        await waitAdvance(Math.max(3200, l.text.length * 75));
      }
      dialogEl.classList.remove('show');
      ui.dialogueOpen = false;
      ui.onModalChange && ui.onModalChange(ui.modalOpen);
    },

    // Voz en off con subtítulos, una línea tras otra.
    async narrateAll(lines) {
      for (const text of lines) {
        ui.narrate(text, 60000);
        await waitAdvance(Math.max(2600, text.length * 65));
      }
      clearTimeout(subsTimer);
      subsEl.classList.remove('show');
    },

    clearNarration() { clearTimeout(subsTimer); subsEl.classList.remove('show'); },

    // Pregunta con varias opciones. Devuelve el id de la elegida.
    choose({ name, text, options }) {
      return new Promise((resolve) => {
        const list = el('div', '', 'list');
        options.forEach((o) => {
          const b = el('button', o.label, 'btn ghost'); b.type = 'button';
          if (o.disabled) b.disabled = true;
          b.onclick = () => { ui.closeModal(); resolve(o.id); };
          list.appendChild(b);
        });
        const kids = [];
        if (name) kids.push(el('h2', name));
        kids.push(el('p', text), list);
        ui.openModal(ui.card(...kids));
        ui.modalLocked = true;
      });
    },

    fade(to, ms = 500) {
      fadeEl.style.transition = 'opacity ' + ms + 'ms';
      fadeEl.style.opacity = String(to);
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    /* --- Diario --- */
    setJournalCount(n) { journalBtn.hidden = n === 0; journalBtn.textContent = 'Diario (' + n + ')'; },

    openJournal(entries) {
      const wrap = el('div');
      if (!entries.length) wrap.appendChild(el('p', 'Todavía no has anotado nada.', 'small'));
      entries.forEach((e) => {
        const d = el('div', '', 'entry');
        d.append(el('h3', e.title), el('p', e.text));
        wrap.appendChild(d);
      });
      const close = el('button', 'Cerrar', 'btn'); close.type = 'button';
      close.onclick = () => ui.closeModal();
      ui.openModal(ui.card(el('h2', 'Diario'), wrap, close));
      ui.modalKind = 'journal';
    },

    /* --- Anillo de ritmo --- */
    rhythm: {
      show(text) { rhythmEl.classList.add('show'); rhythmEl.querySelector('.rh-text').textContent = text; ui.rhythm.update(0, 0); },
      hide() { rhythmEl.classList.remove('show', 'ok', 'soft'); },
      // phase: 0..1 (1 = justo en el compás); progress: 0..1
      update(phase, progress) {
        rhythmEl.querySelector('.rh-ring').style.transform = 'scale(' + (2.2 - 1.2 * Math.min(1, Math.max(0, phase))) + ')';
        rhythmEl.querySelector('.rh-bar i').style.width = Math.round(progress * 100) + '%';
      },
      flash(kind) {
        rhythmEl.classList.add(kind);
        setTimeout(() => rhythmEl.classList.remove(kind), 260);
      }
    },

    // Limpia lo que queda de la escena anterior.
    reset() {
      if (cancelWait) cancelWait();
      advanceResolver = null;
      dialogEl.classList.remove('show');
      ui.dialogueOpen = false;
      clearTimeout(subsTimer); subsEl.classList.remove('show'); subsEl.textContent = '';
      clearTimeout(toastTimer); toastEl.classList.remove('show'); toastEl.textContent = '';
      dialogEl.textContent = '';
      ui.rhythm.hide();
      ui.setStatus('');
      if (ui.modalOpen) ui.closeModal();
    },

    /* --- Pantallas --- */
    showStart({ title, text, controls, button, onStart }) {
      startEl.textContent = '';
      const btn = el('button', button, 'btn'); btn.type = 'button';
      const row = el('div', '', 'row'); row.appendChild(btn);
      startEl.appendChild(ui.card(el('h1', title), el('p', text), el('p', controls, 'small'), row));
      startEl.classList.add('show');
      btn.onclick = () => { startEl.classList.remove('show'); onStart && onStart(); };
    },

    // Créditos finales: título, líneas de texto y, si hay enlace, un botón para abrirlo.
    showCredits({ title, lines, linkLabel, linkUrl, button, onClick }) {
      endEl.textContent = '';
      const kids = [el('h1', title)];
      lines.forEach((l) => kids.push(el('p', l)));
      const row = el('div', '', 'row');
      if (linkUrl) {
        const a = el('a', linkLabel, 'btn ghost'); a.href = linkUrl; a.target = '_blank'; a.rel = 'noopener';
        row.appendChild(a);
      }
      const btn = el('button', button, 'btn'); btn.type = 'button';
      row.appendChild(btn); kids.push(row);
      endEl.appendChild(ui.card(...kids));
      endEl.classList.add('show');
      ui.modalOpen = true;
      ui.setHint(null);
      ui.onModalChange && ui.onModalChange(true);
      btn.onclick = () => { endEl.classList.remove('show'); ui.modalOpen = false; ui.onModalChange && ui.onModalChange(false); onClick && onClick(); };
    },

    showEnd({ title, text, button, onClick }) {
      endEl.textContent = '';
      const btn = el('button', button, 'btn'); btn.type = 'button';
      const row = el('div', '', 'row'); row.appendChild(btn);
      endEl.appendChild(ui.card(el('h1', title), el('p', text), row));
      endEl.classList.add('show');
      ui.modalOpen = true;
      ui.setHint(null);
      ui.onModalChange && ui.onModalChange(true);
      btn.onclick = () => { endEl.classList.remove('show'); ui.modalOpen = false; ui.onModalChange && ui.onModalChange(false); onClick && onClick(); };
    },

    /* --- Menú de depuración --- */
    isDebugOpen: () => debugEl.classList.contains('show'),

    openDebug(items, onPick) {
      debugEl.textContent = '';
      const list = el('div', '', 'list');
      items.forEach((it) => {
        const b = el('button', it.title, 'btn ghost'); b.type = 'button';
        b.onclick = () => { ui.closeDebug(); onPick(it.id); };
        list.appendChild(b);
      });
      const close = el('button', 'Cerrar', 'btn'); close.type = 'button';
      close.onclick = () => ui.closeDebug();
      debugEl.appendChild(ui.card(el('h2', 'Menú de depuración'), el('p', 'Saltar a una escena:', 'small'), list, close));
      debugEl.classList.add('show');
      ui.onModalChange && ui.onModalChange(true);
    },

    closeDebug() {
      if (!debugEl.classList.contains('show')) return;
      debugEl.classList.remove('show');
      debugEl.textContent = '';
      ui.onModalChange && ui.onModalChange(ui.modalOpen);
    }
  };

  return ui;
}

function el(tag, text = '', className = '') {
  const e = document.createElement(tag);
  if (text) e.textContent = text;
  if (className) e.className = className;
  return e;
}
