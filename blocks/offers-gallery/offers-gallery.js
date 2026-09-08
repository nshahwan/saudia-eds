import { moveInstrumentation } from '../../scripts/scripts.js';

// Authorable "Exclusive Offers for You" bento gallery.
// Content comes from the block table. The container model is (title, link,
// linkText), so the first rows carry those fields; the remaining rows are the
// offer items (image, imageAlt, text, link):
//   row 1: title
//   row 2: link (the "Explore all offers" anchor; its text is the link label)
//   rows 3+: one offer each — image | text | link
// Per-tile bento size/position/color/font come from the "classes" model field
// in Universal Editor; in static content they default by tile position.

const DEFAULT_STYLES = [
  ['offers-size-feature', 'offers-pos-bottom-left'],
  ['offers-size-tall', 'offers-pos-bottom-left'],
  ['offers-size-small', 'offers-pos-top-left'],
  ['offers-size-small', 'offers-pos-bottom-left'],
];

/** Read a cell's trimmed text. */
function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

/** Extract any offers-* style classes present in the row (UE `classes` field). */
function styleClassesFor(row, index) {
  const authored = [...row.querySelectorAll('*')]
    .flatMap((el) => [...el.classList])
    .filter((c) => c.startsWith('offers-'));
  const fromText = cellText(row).split(/[\s,]+/).filter((c) => c.startsWith('offers-'));
  const classes = [...new Set([...authored, ...fromText])];
  const fallback = DEFAULT_STYLES[index] || DEFAULT_STYLES[DEFAULT_STYLES.length - 1];
  if (!classes.some((c) => c.startsWith('offers-size-'))) classes.push(fallback[0]);
  if (!classes.some((c) => c.startsWith('offers-pos-'))) classes.push(fallback[1]);
  if (!classes.some((c) => c.startsWith('offers-color-'))) classes.push('offers-color-white');
  if (!classes.some((c) => c.startsWith('offers-font-'))) classes.push('offers-font-default');
  return classes;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Row 1 = section title; row 2 = cta link. Both optional.
  const titleRow = rows[0];
  const ctaRow = rows[1];
  const offerRows = rows.slice(2);

  const section = document.createElement('div');
  section.className = 'exclusive-offers';

  // Header (title + "Explore all offers" link)
  const header = document.createElement('div');
  header.className = 'exclusive-offers-header';
  const heading = document.createElement('h2');
  heading.className = 'exclusive-offers-title';
  heading.textContent = cellText(titleRow?.querySelector(':scope > div')) || 'Exclusive Offers for You';
  header.append(heading);

  if (ctaRow) {
    const linkEl = ctaRow.querySelector('a');
    const label = (linkEl && linkEl.textContent.trim()) || cellText(ctaRow) || 'Explore all offers';
    const cta = document.createElement('a');
    cta.className = 'exclusive-offers-explore';
    cta.href = linkEl ? linkEl.getAttribute('href') : '#';
    cta.textContent = label;
    header.append(cta);
  }
  section.append(header);

  // Gallery of offer cards
  const gallery = document.createElement('div');
  gallery.className = 'exclusive-offers-gallery';

  offerRows.forEach((row, index) => {
    const cells = [...row.children];
    const picture = row.querySelector('picture');
    // Offer item cells: image | text | link.
    const linkEl = cells[2] ? cells[2].querySelector('a') : row.querySelector('a');

    const card = document.createElement('a');
    card.className = ['exclusive-offers-card', ...styleClassesFor(row, index)].join(' ');
    card.href = linkEl ? linkEl.getAttribute('href') : '#';
    moveInstrumentation(row, card);

    if (picture) {
      const pic = picture.cloneNode(true);
      card.append(pic);
    }

    const body = document.createElement('div');
    body.className = 'exclusive-offers-card-body';
    // cells[1] holds the richtext (title + optional description).
    const textCell = cells[1];
    if (textCell) {
      [...textCell.children].forEach((el) => {
        if (!el.querySelector || !el.querySelector('img')) body.append(el.cloneNode(true));
      });
      if (!body.children.length && cellText(textCell)) {
        const h = document.createElement('h3');
        h.textContent = cellText(textCell);
        body.append(h);
      }
    }
    card.append(body);

    const arrow = document.createElement('span');
    arrow.className = 'exclusive-offers-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    card.append(arrow);

    gallery.append(card);
  });

  section.append(gallery);

  block.textContent = '';
  block.append(section);
}
