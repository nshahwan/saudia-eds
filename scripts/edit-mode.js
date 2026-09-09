/*
 * Session-only controlled text styling.
 * Toggle on, click any text, then restyle it from a Style panel:
 * font, size, position (alignment) and colour. Text wording can also be
 * edited inline (double-click). Nothing is persisted — a reload restores
 * the page.
 */

import { loadCSS } from './aem.js';

const TEXT_SEL = 'h1,h2,h3,h4,h5,h6,p,a,li,button,span,strong,em,b,i,blockquote,figcaption,label,th,td,dt,dd,summary';
const CHROME_SEL = '#edit-toggle,#edit-panel';

const FONTS = [
  ['Default', ''],
  ['Roboto', 'roboto, sans-serif'],
  ['Roboto Condensed', 'roboto-condensed, sans-serif'],
  ['Georgia', 'georgia, serif'],
  ['Arial', 'arial, helvetica, sans-serif'],
  ['Courier', '"courier new", monospace'],
];
const SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72];
const SWATCHES = ['#005e5d', '#0a3a34', '#007a3d', '#00817f', '#c9a227', '#1a1a1a', '#ffffff'];
const ALIGNS = [['left', 'L', 'Align left'], ['center', 'C', 'Align centre'], ['right', 'R', 'Align right']];

let editMode = false;
let selectedEl = null;
let editingEl = null;

function isChrome(el) {
  return !el || el.closest(CHROME_SEL);
}

function targetFrom(node) {
  const el = node.closest ? node.closest(TEXT_SEL) : null;
  if (!el || isChrome(el)) return null;
  return el;
}

function rgbToHex(rgb) {
  const m = rgb && rgb.match(/\d+/g);
  if (!m) return '#000000';
  return `#${m.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('')}`;
}

function showPanel(on) {
  const panel = document.getElementById('edit-panel');
  if (panel) panel.classList.toggle('visible', on);
}

function syncPanel() {
  if (!selectedEl) return;
  const cs = getComputedStyle(selectedEl);
  const size = document.getElementById('edit-size');
  if (size) size.value = String(Math.round(parseFloat(cs.fontSize)));
  const color = document.getElementById('edit-color');
  if (color) color.value = rgbToHex(cs.color);
  const font = document.getElementById('edit-font');
  if (font) {
    const family = cs.fontFamily.toLowerCase();
    const match = FONTS.find(([, v]) => v && family.includes(v.split(',')[0].replace(/"/g, '').trim()));
    font.value = match ? match[1] : '';
  }
  document.querySelectorAll('#edit-panel .edit-align').forEach((b) => {
    b.classList.toggle('active', b.dataset.align === cs.textAlign);
  });
}

function select(el) {
  if (selectedEl && selectedEl !== el) selectedEl.classList.remove('edit-selected');
  selectedEl = el;
  if (el) el.classList.add('edit-selected');
  showPanel(!!el);
  syncPanel();
}

function deselect() {
  if (selectedEl) selectedEl.classList.remove('edit-selected');
  selectedEl = null;
  showPanel(false);
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

function resetElement() {
  if (!selectedEl) return;
  ['fontFamily', 'fontSize', 'textAlign', 'color', 'fontWeight'].forEach((p) => {
    selectedEl.style[p] = '';
  });
  syncPanel();
}

// In edit mode, select on click and stop links/buttons from activating.
function onClickCapture(e) {
  if (!editMode || isChrome(e.target)) return;
  const el = targetFrom(e.target);
  if (el && el !== editingEl) {
    e.preventDefault();
    e.stopPropagation();
    select(el);
  }
}

function onDblClick(e) {
  if (!editMode) return;
  const el = targetFrom(e.target);
  if (!el) return;
  e.preventDefault();
  select(el);
  startTextEdit(el);
}

function group(labelText, node) {
  const g = document.createElement('div');
  g.className = 'edit-group';
  const l = document.createElement('span');
  l.className = 'edit-group-label';
  l.textContent = labelText;
  g.append(l, node);
  return g;
}

function buildFontControl() {
  const font = document.createElement('select');
  font.id = 'edit-font';
  font.className = 'edit-control';
  FONTS.forEach(([label, value]) => {
    const o = document.createElement('option');
    o.value = value;
    o.textContent = label;
    font.append(o);
  });
  font.addEventListener('change', () => {
    if (selectedEl) selectedEl.style.fontFamily = font.value;
  });
  return font;
}

function buildSizeControl() {
  const size = document.createElement('select');
  size.id = 'edit-size';
  size.className = 'edit-control';
  SIZES.forEach((s) => {
    const o = document.createElement('option');
    o.value = String(s);
    o.textContent = `${s}px`;
    size.append(o);
  });
  size.addEventListener('change', () => {
    if (selectedEl) selectedEl.style.fontSize = `${size.value}px`;
  });
  return size;
}

function buildAlignControl() {
  const align = document.createElement('div');
  align.className = 'edit-align-group';
  ALIGNS.forEach(([val, label, title]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'edit-align';
    b.dataset.align = val;
    b.title = title;
    b.setAttribute('aria-label', title);
    b.textContent = label;
    b.addEventListener('click', () => {
      if (!selectedEl) return;
      selectedEl.style.textAlign = val;
      syncPanel();
    });
    align.append(b);
  });
  return align;
}

function buildColorControl() {
  const wrap = document.createElement('div');
  wrap.className = 'edit-swatches';
  SWATCHES.forEach((hex) => {
    const s = document.createElement('button');
    s.type = 'button';
    s.className = 'edit-swatch';
    s.style.background = hex;
    s.title = hex;
    s.setAttribute('aria-label', `Colour ${hex}`);
    s.addEventListener('click', () => {
      if (!selectedEl) return;
      selectedEl.style.color = hex;
      syncPanel();
    });
    wrap.append(s);
  });
  const color = document.createElement('input');
  color.type = 'color';
  color.id = 'edit-color';
  color.className = 'edit-swatch edit-swatch-custom';
  color.title = 'Custom colour';
  color.setAttribute('aria-label', 'Custom colour');
  color.addEventListener('input', () => {
    if (selectedEl) selectedEl.style.color = color.value;
  });
  wrap.append(color);
  return wrap;
}

function buildActions() {
  const actions = document.createElement('div');
  actions.className = 'edit-actions';
  const mkBtn = (label, title, fn) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'edit-action';
    b.textContent = label;
    b.title = title;
    b.setAttribute('aria-label', title);
    b.addEventListener('click', fn);
    return b;
  };
  actions.append(
    mkBtn('Edit text', 'Edit the wording', () => selectedEl && startTextEdit(selectedEl)),
    mkBtn('Reset', 'Undo style changes to this element', resetElement),
    mkBtn('✕', 'Close', () => { finishTextEdit(); deselect(); }),
  );
  return actions;
}

function buildPanel() {
  const panel = document.createElement('div');
  panel.id = 'edit-panel';
  panel.setAttribute('aria-label', 'Text style');
  panel.append(
    group('Font', buildFontControl()),
    group('Size', buildSizeControl()),
    group('Position', buildAlignControl()),
    group('Colour', buildColorControl()),
    buildActions(),
  );
  return panel;
}

function setEditMode(on) {
  editMode = on;
  document.body.classList.toggle('edit-mode', on);
  const toggle = document.getElementById('edit-toggle');
  if (toggle) {
    toggle.classList.toggle('active', on);
    toggle.textContent = on ? '✓ Styling' : '✎ Style';
  }
  if (!on) {
    finishTextEdit();
    deselect();
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
  toggle.textContent = '✎ Style';
  toggle.title = 'Toggle text styling';
  toggle.addEventListener('click', () => setEditMode(!editMode));

  document.body.append(toggle, buildPanel());

  document.addEventListener('click', onClickCapture, true);
  document.addEventListener('dblclick', onDblClick);
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !editMode) return;
    if (editingEl) finishTextEdit();
    else deselect();
  });
}
