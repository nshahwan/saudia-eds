import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation, textStyleClasses } from '../../scripts/scripts.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    // Author-selected text styling (font/size/color/position).
    const styles = textStyleClasses(row);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      const txt = (div.textContent || '').trim();
      const isStyleCell = txt && /^(txt-[a-z-]+[\s,]*)+$/.test(txt) && !div.querySelector('picture, a, img');
      if (isStyleCell) div.remove(); // "classes" cell — value already harvested
      else if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    const body = li.querySelector('.cards-card-body');
    if (body && styles.length) body.classList.add(...styles);
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.replaceChildren(ul);
}
