import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
/**
 * Restructures the default-content "Exceptional experiences with Saudia"
 * section into a two-column table: the title (and intro) on the left, the
 * experience items on the right. Each item lays out as image-left / text-right
 * (title, body, "Learn more" link).
 * @param {Element} main The container element
 */
function buildExceptionalExperiences(main) {
  const heading = [...main.querySelectorAll('h2')]
    .find((h) => /exceptional experiences/i.test(h.textContent));
  if (!heading) return;

  const section = heading.closest('.section') || heading.parentElement;
  if (!section || section.classList.contains('experiences-section')) return;

  const list = section.querySelector('ul');
  if (!list) return;

  section.classList.add('experiences-section');

  // Left column: heading + any intro paragraphs before the list.
  const left = document.createElement('div');
  left.className = 'experiences-title';
  let node = heading;
  const toMove = [];
  while (node && node !== list) {
    toMove.push(node);
    node = node.nextElementSibling;
  }
  toMove.forEach((el) => left.append(el));

  // Right column: each <li> becomes an image-left / text-right row.
  const right = document.createElement('div');
  right.className = 'experiences-items';
  [...list.children].forEach((li) => {
    const item = document.createElement('div');
    item.className = 'experiences-item';

    const media = document.createElement('div');
    media.className = 'experiences-item-media';
    const pic = li.querySelector('picture');
    if (pic) media.append(pic);

    const body = document.createElement('div');
    body.className = 'experiences-item-body';
    const itemHeading = li.querySelector('h3');
    if (itemHeading) body.append(itemHeading);
    // The body paragraph and the "Learn more" link are the remaining <p>s.
    [...li.querySelectorAll('p')].forEach((p) => {
      if (p.querySelector('picture')) return;
      const link = p.querySelector('a');
      if (link && /^\s*learn more\b/i.test(link.textContent)) {
        link.classList.add('experiences-learn-more');
        p.className = 'experiences-item-cta';
      }
      body.append(p);
    });

    item.append(media, body);
    right.append(item);
  });

  list.remove();
  section.textContent = '';
  const table = document.createElement('div');
  table.className = 'experiences-table';
  // Mark as an already-loaded block so EDS's decorateBlocks/loadBlock skips it
  // (a lone single-class div is otherwise mistaken for a block to lazy-load,
  // producing a "failed to load block experiences-table" console error).
  table.dataset.blockStatus = 'loaded';
  table.append(left, right);
  section.append(table);
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildExceptionalExperiences(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
export function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
