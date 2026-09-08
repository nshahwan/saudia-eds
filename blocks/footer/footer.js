// Saudia footer — content-first. Reads content/footer.plain.html and renders
// the newsletter, link columns, app/social/payment strip, and legal bar.

const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetch the footer fragment. Metadata-independent dual-fetch:
 * /content first (localhost / aem up), then root (DA/EDS production).
 */
async function fetchFooterFragment() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const tmp = document.createElement('div');
  tmp.innerHTML = await resp.text();
  return tmp;
}

/** Build the newsletter section (heading + copy + subscribe form). */
function buildNewsletter(section) {
  const wrap = document.createElement('div');
  wrap.className = 'footer-newsletter';

  const heading = section.querySelector('h2, h3');
  const copy = section.querySelector('p');
  const text = document.createElement('div');
  text.className = 'footer-newsletter-text';
  if (heading) text.append(heading.cloneNode(true));
  if (copy) text.append(copy.cloneNode(true));

  const form = document.createElement('form');
  form.className = 'footer-subscribe-form';
  form.action = 'https://www.saudia.com/Subscribe/';
  const input = document.createElement('input');
  input.type = 'email';
  input.name = 'email';
  input.placeholder = 'Enter your email';
  input.setAttribute('aria-label', 'Email address');
  input.className = 'footer-subscribe-input';
  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'footer-subscribe-button';
  button.textContent = 'Subscribe';
  form.append(input, button);

  wrap.append(text, form);
  return wrap;
}

/** Build the link columns as an accordion (mobile) / column grid (desktop). */
function buildLinkColumns(section) {
  const wrap = document.createElement('div');
  wrap.className = 'footer-columns';

  const children = [...section.children];
  let current = null;
  children.forEach((el) => {
    if (el.tagName === 'H3') {
      current = document.createElement('div');
      current.className = 'footer-column';
      const title = document.createElement('button');
      title.type = 'button';
      title.className = 'footer-column-title';
      title.textContent = el.textContent;
      title.setAttribute('aria-expanded', 'false');
      current.append(title);
      wrap.append(current);
    } else if (el.tagName === 'UL' && current) {
      current.append(el.cloneNode(true));
    }
  });

  // Accordion toggle (active on mobile; harmless on desktop where lists show).
  wrap.querySelectorAll('.footer-column-title').forEach((title) => {
    title.addEventListener('click', () => {
      if (isDesktop.matches) return;
      const open = title.getAttribute('aria-expanded') === 'true';
      title.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  return wrap;
}

/** Build the app / social / awards / payment strip from image groups. */
function buildMediaStrip(section) {
  const strip = document.createElement('div');
  strip.className = 'footer-media';

  // Each <h3> heads a group; the following <p> holds its images/links.
  const children = [...section.children];
  let group = null;
  children.forEach((el) => {
    if (el.tagName === 'H3') {
      group = document.createElement('div');
      group.className = 'footer-media-group';
      const h = document.createElement('h4');
      h.textContent = el.textContent;
      group.append(h);
      strip.append(group);
    } else if (el.tagName === 'P' && group) {
      const row = document.createElement('div');
      row.className = 'footer-media-row';
      [...el.children].forEach((node) => row.append(node.cloneNode(true)));
      group.append(row);
    }
  });

  return strip;
}

/** Build the bottom legal bar (links + copyright). */
function buildLegalBar(section) {
  const bar = document.createElement('div');
  bar.className = 'footer-legal';

  const list = section.querySelector('ul');
  if (list) {
    const nav = list.cloneNode(true);
    nav.className = 'footer-legal-links';
    bar.append(nav);
  }
  const copy = section.querySelector('p');
  if (copy) {
    const c = copy.cloneNode(true);
    c.className = 'footer-copyright';
    bar.append(c);
  }
  return bar;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const frag = await fetchFooterFragment();
  block.textContent = '';
  if (!frag) return;

  const sections = [...frag.children].filter((el) => el.tagName === 'DIV');
  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  if (sections[0]) footer.append(buildNewsletter(sections[0]));
  if (sections[1]) footer.append(buildLinkColumns(sections[1]));
  if (sections[2]) footer.append(buildMediaStrip(sections[2]));
  if (sections[3]) footer.append(buildLegalBar(sections[3]));

  block.append(footer);
}
