import { moveInstrumentation } from '../../scripts/scripts.js';

// Authorable "Exceptional experiences with Saudia" — two-column layout:
// title/intro on the left, experience items on the right (image-left /
// text-right with a "Learn more" link).
// Block table (container model = title, intro):
//   row 1: title
//   row 2: intro
//   rows 3+: one experience each — image | text (heading + description) | link

function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

export default function decorate(block) {
  const rows = [...block.children];
  const titleRow = rows[0];
  const introRow = rows[1];
  const itemRows = rows.slice(2);

  // Left column: title + intro.
  const left = document.createElement('div');
  left.className = 'experiences-title';
  const heading = document.createElement('h2');
  heading.textContent = cellText(titleRow && titleRow.querySelector(':scope > div')) || 'Exceptional experiences with Saudia';
  left.append(heading);
  const introCell = introRow && introRow.querySelector(':scope > div');
  if (introCell) {
    [...introCell.children].forEach((el) => left.append(el.cloneNode(true)));
    if (!introCell.children.length && cellText(introCell)) {
      const p = document.createElement('p');
      p.textContent = cellText(introCell);
      left.append(p);
    }
  }

  // Right column: each item = image-left / text-right.
  const right = document.createElement('div');
  right.className = 'experiences-items';
  itemRows.forEach((row) => {
    const cells = [...row.children];
    const item = document.createElement('div');
    item.className = 'experiences-item';
    moveInstrumentation(row, item);

    const media = document.createElement('div');
    media.className = 'experiences-item-media';
    const pic = row.querySelector('picture');
    if (pic) media.append(pic.cloneNode(true));

    const body = document.createElement('div');
    body.className = 'experiences-item-body';
    const textCell = cells[1];
    if (textCell) {
      [...textCell.children].forEach((el) => {
        if (!el.querySelector || !el.querySelector('img')) body.append(el.cloneNode(true));
      });
    }
    const linkEl = cells[2] ? cells[2].querySelector('a') : null;
    if (linkEl) {
      const more = document.createElement('p');
      more.className = 'experiences-item-cta';
      const a = document.createElement('a');
      a.className = 'experiences-learn-more';
      a.href = linkEl.getAttribute('href') || '#';
      a.textContent = linkEl.textContent.trim() || 'Learn more';
      more.append(a);
      body.append(more);
    }

    item.append(media, body);
    right.append(item);
  });

  const table = document.createElement('div');
  table.className = 'experiences-table';
  table.append(left, right);

  block.textContent = '';
  block.append(table);
}
