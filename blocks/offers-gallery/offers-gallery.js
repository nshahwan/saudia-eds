import { moveInstrumentation } from '../../scripts/scripts.js';

// Authorable "Exclusive Offers for You" bento gallery.
// Content comes from the block table (Universal Editor authorable):
//   row 1: section title
//   row 2: link (anchor) | link text
//   rows 3+: one offer each — image | alt | text | link | classes (size,
//            text-position, color, font as space-separated CSS classes)

/** Read a cell's trimmed text. */
function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

export default function decorate(block) {
  const rows = [...block.children];

  // Row 1 = section title; row 2 = cta link + cta text. Both optional.
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
    const cells = [...ctaRow.children];
    const linkEl = ctaRow.querySelector('a');
    const label = cellText(cells[1]) || (linkEl && linkEl.textContent.trim()) || 'Explore all offers';
    const cta = document.createElement('a');
    cta.className = 'exclusive-offers-explore';
    cta.href = linkEl ? linkEl.getAttribute('href') : (cellText(cells[0]) || '#');
    cta.textContent = label;
    header.append(cta);
  }
  section.append(header);

  // Gallery of offer cards
  const gallery = document.createElement('div');
  gallery.className = 'exclusive-offers-gallery';

  offerRows.forEach((row) => {
    const cells = [...row.children];
    const picture = row.querySelector('picture');
    const linkEl = cells[3] ? cells[3].querySelector('a') : null;

    // Style classes authored in the last cell (space/comma separated). Provide
    // sensible defaults when none are chosen.
    const styleClasses = cellText(cells[4]).split(/[\s,]+/).filter(Boolean);
    if (!styleClasses.some((c) => c.startsWith('offers-size-'))) styleClasses.push('offers-size-small');
    if (!styleClasses.some((c) => c.startsWith('offers-pos-'))) styleClasses.push('offers-pos-bottom-left');
    if (!styleClasses.some((c) => c.startsWith('offers-color-'))) styleClasses.push('offers-color-white');
    if (!styleClasses.some((c) => c.startsWith('offers-font-'))) styleClasses.push('offers-font-default');

    const card = document.createElement('a');
    card.className = ['exclusive-offers-card', ...styleClasses].join(' ');
    card.href = linkEl ? linkEl.getAttribute('href') : '#';
    moveInstrumentation(row, card);

    if (picture) {
      const pic = picture.cloneNode(true);
      card.append(pic);
    }

    const body = document.createElement('div');
    body.className = 'exclusive-offers-card-body';
    // cells[2] holds the richtext (title + optional description).
    const textCell = cells[2];
    if (textCell) {
      [...textCell.children].forEach((el) => body.append(el.cloneNode(true)));
      if (!textCell.children.length && cellText(textCell)) {
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
