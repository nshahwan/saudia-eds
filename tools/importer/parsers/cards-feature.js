/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-feature
 * Base block: cards
 * Source: https://www.saudia.com/ (home template)
 * Generated: 2026-09-07
 *
 * Structure (from library-description.txt): container block, 2 columns.
 *   Row 1: block name (added by createBlock)
 *   Each subsequent row = one card:
 *     Cell 1: image  -> field:image (+ collapsed field:imageAlt on the <img>)
 *     Cell 2: text (title + text + optional CTA) -> field:text (richtext)
 *   An image or text cell may be empty but must still be present.
 *
 * Source DOM (verified against migration-work/cleaned.html). Matched by three
 * selectors resolving to three shapes:
 *   A. `.featuredlist` (best-fares grid): a `.featuredlist__header` (section
 *      heading + description + "Explore all destinations" link) followed by
 *      cards `ul > li > a`, each with `.featuredlist__img img` and
 *      `.featuredlist__content` (h3 city, h3.price-info, p subtext). The whole
 *      card is wrapped in an anchor (the destination search URL).
 *   B. `.offerforyou-content` (plan-your-next-trip tiles): a `.title-offer-wrap`
 *      heading (default content) plus cards `.offer-col` and leaf
 *      `.offer-content`, each with `.offer-img img`, a decorative
 *      `.button` arrow glyph, and `.offer-txt` (h3 label, optional p).
 *   C. `.offer-content` (single tile): one card with `.offer-img img`, arrow
 *      glyph, and `.offer-txt`.
 */
function appendUniqueText(cell, seen, tag, node) {
  const txt = node.textContent.replace(/\s+/g, ' ').trim();
  if (!txt) return;
  const key = tag + ':' + txt;
  if (seen.has(key)) return;
  seen.add(key);
  const el = document.createElement(tag);
  el.textContent = txt;
  cell.appendChild(el);
}

function buildTextCell(document, headings, paragraphs, iconText, cta) {
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));
  const seen = new Set();
  // In the source, the decorative arrow glyph (a Material icon ligature) sits
  // before the text block (between image and `.offer-txt`). Emit it first, as a
  // block-level paragraph, so its word boundary survives markdown conversion and
  // source order is preserved.
  if (iconText && !cta) {
    const lead = document.createElement('p');
    lead.textContent = iconText;
    textCell.appendChild(lead);
  }
  headings.forEach((h) => {
    const txt = h.textContent.replace(/\s+/g, ' ').trim();
    if (!txt || seen.has('h:' + txt)) return;
    seen.add('h:' + txt);
    const tag = h.tagName.toLowerCase();
    const el = document.createElement(/^h[1-6]$/.test(tag) ? tag : 'h3');
    el.textContent = txt;
    textCell.appendChild(el);
  });
  paragraphs.forEach((p) => {
    const txt = p.textContent.replace(/\s+/g, ' ').trim();
    if (!txt || seen.has('p:' + txt)) return;
    seen.add('p:' + txt);
    const el = document.createElement('p');
    el.textContent = txt;
    textCell.appendChild(el);
  });
  if (cta && cta.getAttribute('href')) {
    textCell.appendChild(cta);
  }
  return textCell;
}

function buildCard(cardEl, document) {
  const img = cardEl.querySelector('.featuredlist__img img, .offer-img img, .imagelinklist__img img, img');

  const textSource = cardEl.querySelector('.featuredlist__content, .offer-txt, .imagelinklist__content')
    || cardEl;

  const headings = Array.from(textSource.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const paragraphs = Array.from(textSource.querySelectorAll('p'));

  // Decorative arrow icon button (offer tiles). Its glyph is real source text.
  const iconBtn = cardEl.querySelector(':scope > .button, .offer-img ~ .button, span.button.material-icons-outlined');
  const iconText = iconBtn ? iconBtn.textContent.replace(/\s+/g, ' ').trim() : '';

  // A CTA is only meaningful when it has a real (non-empty, non-js) href AND a
  // label distinct from the card body. Wrapping card anchors (whole tile linked)
  // are NOT treated as a separate CTA to avoid duplicating the card text.
  let cta = null;
  const innerLink = textSource.querySelector('a[href]');
  if (innerLink) {
    const href = innerLink.getAttribute('href');
    const label = innerLink.textContent.replace(/\s+/g, ' ').trim();
    const dupHeading = headings.some((h) => h.textContent.replace(/\s+/g, ' ').trim() === label);
    if (href && href !== '' && href !== 'javascript:void(0)' && !dupHeading) {
      cta = document.createElement('a');
      cta.setAttribute('href', href);
      cta.textContent = label || href;
    }
  }

  const imageCell = document.createDocumentFragment();
  imageCell.appendChild(document.createComment(' field:image '));
  if (img) imageCell.appendChild(img);

  const textCell = buildTextCell(document, headings, paragraphs, iconText, cta);

  return [imageCell, textCell];
}

export default function parse(element, { document }) {
  const cells = [];

  if (element.matches('.featuredlist') || element.querySelector('.featuredlist__img')) {
    // Shape A — best-fares grid.
    // Header row (section heading + description + "explore" link) kept as a
    // headless card (empty image cell) so its content is preserved.
    const header = element.querySelector('.featuredlist__header');
    if (header) {
      const hHeadings = Array.from(header.querySelectorAll('h1, h2, h3, h4, .featuredlist__title'));
      const hParas = Array.from(header.querySelectorAll('p'));
      const hLinkSrc = header.querySelector('a');
      let hCta = null;
      if (hLinkSrc) {
        const label = hLinkSrc.textContent.replace(/\s+/g, ' ').trim();
        if (label) {
          hCta = document.createElement('a');
          hCta.setAttribute('href', hLinkSrc.getAttribute('href') || '#');
          hCta.textContent = label;
        }
      }
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(' field:image '));
      const textCell = buildTextCell(document, hHeadings, hParas, '', hCta);
      cells.push([imageCell, textCell]);
    }
    Array.from(element.querySelectorAll(':scope ul > li')).forEach((li) => {
      if (li.querySelector('img') || li.querySelector('h1,h2,h3,h4,p')) {
        cells.push(buildCard(li, document));
      }
    });
  } else if (element.matches('.offer-content')) {
    // Shape C — single tile passed directly.
    cells.push(buildCard(element, document));
  } else if (element.querySelector('.offer-content, .offer-col')) {
    // Shape B — plan-your-next-trip tiles.
    // Section heading (`.title-offer-wrap`, e.g. "Plan your next trip") kept as
    // a headless card so its text is preserved.
    const titleWrap = element.querySelector('.title-offer-wrap');
    if (titleWrap) {
      const tHeadings = Array.from(titleWrap.querySelectorAll('h1, h2, h3, h4'));
      const tParas = Array.from(titleWrap.querySelectorAll('p'));
      if (tHeadings.length || tParas.length) {
        const imageCell = document.createDocumentFragment();
        imageCell.appendChild(document.createComment(' field:image '));
        const textCell = buildTextCell(document, tHeadings, tParas, '', null);
        cells.push([imageCell, textCell]);
      }
    }
    // Collect leaf `.offer-content` plus `.offer-col` tiles that don't wrap
    // other cards (avoids double-counting horizontal-row wrappers).
    const contents = Array.from(element.querySelectorAll('.offer-content'));
    const cols = Array.from(element.querySelectorAll('.offer-col'))
      .filter((c) => !c.querySelector('.offer-content') && !c.querySelector('.offer-col'));
    [...cols, ...contents].forEach((c) => {
      if (c.querySelector('img') || c.querySelector('h1,h2,h3,h4,p')) {
        cells.push(buildCard(c, document));
      }
    });
  } else {
    Array.from(element.querySelectorAll('.offer-content, .offer-col, ul > li')).forEach((c) => {
      if (c.querySelector('img') || c.querySelector('h1,h2,h3,h4,p')) {
        cells.push(buildCard(c, document));
      }
    });
  }

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
