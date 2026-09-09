import { JSDOM } from '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts/node_modules/jsdom/lib/api.js';
import { md2jcr } from '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts/node_modules/@adobe/helix-importer/src/index.js';
import fs from 'fs';

const models = JSON.parse(fs.readFileSync('component-models.json', 'utf8'));
const definition = JSON.parse(fs.readFileSync('component-definition.json', 'utf8'));
const filters = JSON.parse(fs.readFileSync('component-filters.json', 'utf8'));

// first-class-token -> block title (block components only)
const titleByClass = {};
for (const g of definition.groups) {
  for (const c of g.components) {
    const tmpl = c.plugins?.xwalk?.page?.template || {};
    const key = tmpl.filter || tmpl.model;
    if (c.title && key) titleByClass[key] = c.title;
  }
}

const html = fs.readFileSync('content/en.plain.html', 'utf8');
const dom = new JSDOM(`<!DOCTYPE html><html><body><main>${html}</main></body></html>`);
const doc = dom.window.document;

function blockToTable(block) {
  const firstClass = block.className.trim().split(/\s+/)[0];
  const title = titleByClass[firstClass] || firstClass;
  const table = doc.createElement('table');
  const rows = [...block.children];
  const maxCols = Math.max(1, ...rows.map((r) => r.children.length || 1));
  const head = doc.createElement('tr');
  const th = doc.createElement('td');
  th.setAttribute('colspan', String(maxCols));
  th.textContent = title;
  head.append(th);
  table.append(head);
  rows.forEach((row) => {
    const tr = doc.createElement('tr');
    const cells = row.children.length ? [...row.children] : [row];
    cells.forEach((cell, ci) => {
      const td = doc.createElement('td');
      td.innerHTML = cell.innerHTML;
      if (cells.length < maxCols && ci === cells.length - 1) {
        td.setAttribute('colspan', String(maxCols - cells.length + 1));
      }
      tr.append(td);
    });
    table.append(tr);
  });
  return table;
}

[...doc.querySelectorAll('main > div')].forEach((section) => {
  [...section.children].forEach((child) => {
    if (child.tagName === 'DIV' && child.classList.length) {
      section.replaceChild(blockToTable(child), child);
    }
  });
});

const res = await md2jcr('https://example.com/en', doc, undefined, {}, { components: { models, definition, filters } });
const out = Array.isArray(res) ? res[0] : res;
let xml = out && (out.jcr || out.data || out);
if (Buffer.isBuffer(xml)) xml = xml.toString('utf8');
// keep image URLs site-relative
xml = xml.replace(/https:\/\/example\.com\/content\//g, '/content/').replace(/https:\/\/example\.com\//g, '/');
fs.writeFileSync('content/saudia-eds/en/.content.xml', xml);
const blocks = (xml.match(/components\/block\/v1\/block"/g) || []).length;
const items = (xml.match(/block\/item/g) || []).length;
console.log(`JCR written: ${xml.length} bytes | blocks: ${blocks} | items: ${items}`);
