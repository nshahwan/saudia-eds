/*
 * Session-only visual edit mode.
 * Toggle on to move any text freely, resize its box, edit the words,
 * and recolor it. Nothing is persisted — a reload restores the page.
 */

import { loadCSS } from './aem.js';

const TEXT_SEL = 'h1,h2,h3,h4,h5,h6,p,a,li,button,span,strong,em,b,i,blockquote,figcaption,label,th,td,dt,dd,summary';
const CHROME_SEL = '#edit-toggle,#edit-toolbar';
const DRAG_THRESHOLD = 4;

let editMode = false;
let selectedEl = null;
let editingEl = null;
const translations = new WeakMap();

function isChrome(el) {
  return !el || el.closest(CHROME_SEL);
}

function targetFrom(node) {
  const el = node.closest ? node.closest(TEXT_SEL) : null;
  if (!el || isChrome(el)) return null;
  return el;
}

function getTranslate(el) {
  return translations.get(el) || { x: 0, y: 0 };
}

function setTranslate(el, x, y) {
  translations.set(el, { x, y });
  el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
}

function positionToolbar() {
  const bar = document.getElementById('edit-toolbar');
  if (bar) bar.classList.toggle('visible', !!selectedEl);
}

function select(el) {
  if (selectedEl === el) return;
  if (selectedEl) selectedEl.classList.remove('edit-selected');
  selectedEl = el;
  if (selectedEl) selectedEl.classList.add('edit-selected');
  const color = document.getElementById('edit-color');
  if (color && selectedEl) {
    const c = getComputedStyle(selectedEl).color;
    const m = c.match(/\d+/g);
    if (m) {
      const hex = `#${m.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('')}`;
      color.value = hex;
    }
  }
  positionToolbar();
}

function finishTextEdit() {
  if (!editingEl) return;
  editingEl.removeAttribute('contenteditable');
  editingEl.classList.remove('edit-typing');
  editingEl = null;
}

function startTextEdit(el) {
  finishTextEdit();
  editingEl = el;
  el.setAttribute('contenteditable', 'true');
  el.classList.add('edit-typing');
  el.focus();
  el.addEventListener('blur', finishTextEdit, { once: true });
}

function onPointerDown(e) {
  if (!editMode || e.button !== 0) return;
  const el = targetFrom(e.target);
  if (!el) return;
  if (el === editingEl) return; // let native caret/selection work while typing

  select(el);

  const start = getTranslate(el);
  const startX = e.clientX;
  const startY = e.clientY;
  let dragging = false;

  const move = (ev) => {
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    if (!dragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      dragging = true;
      el.classList.add('edit-dragging');
    }
    if (dragging) {
      setTranslate(el, start.x + dx, start.y + dy);
      ev.preventDefault();
    }
  };
  const up = () => {
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', up);
    el.classList.remove('edit-dragging');
  };
  document.addEventListener('pointermove', move);
  document.addEventListener('pointerup', up);
}

function onDblClick(e) {
  if (!editMode) return;
  const el = targetFrom(e.target);
  if (!el) return;
  e.preventDefault();
  select(el);
  startTextEdit(el);
}

// In edit mode, swallow link/button activation so clicks don't navigate.
function onClickCapture(e) {
  if (!editMode) return;
  const el = targetFrom(e.target);
  if (el && el !== editingEl) {
    e.preventDefault();
    e.stopPropagation();
  }
}

function stepFontSize(delta) {
  if (!selectedEl) return;
  const size = parseFloat(getComputedStyle(selectedEl).fontSize) || 16;
  selectedEl.style.fontSize = `${Math.max(8, size + delta)}px`;
}

function resetElement() {
  if (!selectedEl) return;
  selectedEl.style.transform = '';
  selectedEl.style.color = '';
  selectedEl.style.fontSize = '';
  selectedEl.style.fontWeight = '';
  selectedEl.style.width = '';
  selectedEl.style.height = '';
  translations.set(selectedEl, { x: 0, y: 0 });
  selectedEl.classList.remove('edit-resizable');
}

function buildToolbar() {
  const bar = document.createElement('div');
  bar.id = 'edit-toolbar';
  bar.setAttribute('aria-label', 'Text editing tools');

  const mkBtn = (label, title, onClick) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.title = title;
    b.setAttribute('aria-label', title);
    b.addEventListener('click', onClick);
    return b;
  };

  const colorWrap = document.createElement('label');
  colorWrap.className = 'edit-color-wrap';
  colorWrap.title = 'Text colour';
  const color = document.createElement('input');
  color.type = 'color';
  color.id = 'edit-color';
  color.value = '#005e5d';
  color.addEventListener('input', () => {
    if (selectedEl) selectedEl.style.color = color.value;
  });
  colorWrap.append(color);

  bar.append(
    mkBtn('A−', 'Smaller text', () => stepFontSize(-2)),
    mkBtn('A+', 'Larger text', () => stepFontSize(2)),
    mkBtn('B', 'Bold', () => {
      if (!selectedEl) return;
      const bold = getComputedStyle(selectedEl).fontWeight >= 600;
      selectedEl.style.fontWeight = bold ? '400' : '700';
    }),
    colorWrap,
    mkBtn('Edit text', 'Edit the wording', () => selectedEl && startTextEdit(selectedEl)),
    mkBtn('Resize box', 'Toggle a resize handle on the box', () => {
      if (selectedEl) selectedEl.classList.toggle('edit-resizable');
    }),
    mkBtn('Reset', 'Undo changes to this element', resetElement),
    mkBtn('✕', 'Deselect', () => {
      finishTextEdit();
      if (selectedEl) selectedEl.classList.remove('edit-selected');
      selectedEl = null;
      positionToolbar();
    }),
  );
  return bar;
}

function setEditMode(on) {
  editMode = on;
  document.body.classList.toggle('edit-mode', on);
  const toggle = document.getElementById('edit-toggle');
  if (toggle) {
    toggle.classList.toggle('active', on);
    toggle.textContent = on ? '✓ Editing' : '✎ Edit';
  }
  if (!on) {
    finishTextEdit();
    if (selectedEl) selectedEl.classList.remove('edit-selected');
    selectedEl = null;
    positionToolbar();
  }
}

export default function initEditMode() {
  if (document.getElementById('edit-toggle')) return;
  // Skip inside the Universal Editor canvas (page is loaded in an iframe there).
  if (window.top !== window.self) return;

  loadCSS(`${window.hlx.codeBasePath}/styles/edit-mode.css`);

  const toggle = document.createElement('button');
  toggle.id = 'edit-toggle';
  toggle.type = 'button';
  toggle.textContent = '✎ Edit';
  toggle.title = 'Toggle text edit mode';
  toggle.addEventListener('click', () => setEditMode(!editMode));

  document.body.append(toggle, buildToolbar());

  document.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('dblclick', onDblClick);
  document.addEventListener('click', onClickCapture, true);
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !editMode) return;
    if (editingEl) {
      finishTextEdit();
    } else if (selectedEl) {
      selectedEl.classList.remove('edit-selected');
      selectedEl = null;
      positionToolbar();
    }
  });
}
