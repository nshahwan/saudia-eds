// Saudia header — content-first megamenu navigation.
// All copy, links, and images live in /content/nav.plain.html; this module
// fetches that fragment, reads its DOM, and builds the interactive header.

const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetch the nav fragment. Metadata-independent dual-fetch:
 * /content first (localhost / aem up), then root (DA/EDS production).
 */
async function fetchNavFragment() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp;
}

/** Close all open megamenu panels. */
function closeAllPanels(navList) {
  navList.querySelectorAll('.nav-item[aria-expanded="true"]').forEach((li) => {
    li.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Build the primary navigation (top-level items + megamenu panels) from the
 * section that contains the <h2> menu labels.
 */
function buildPrimaryNav(section) {
  const navList = document.createElement('ul');
  navList.className = 'nav-list';

  // Each <h2> starts a new top-level menu; following h3/ul/p belong to it
  // until the next h2.
  const children = [...section.children];
  let currentItem = null;
  let currentPanel = null;

  const startMenu = (h2) => {
    currentItem = document.createElement('li');
    currentItem.className = 'nav-item';
    currentItem.setAttribute('aria-expanded', 'false');

    const trigger = document.createElement('button');
    trigger.className = 'nav-trigger';
    trigger.type = 'button';
    trigger.textContent = h2.textContent;
    trigger.setAttribute('aria-haspopup', 'true');
    currentItem.append(trigger);

    currentPanel = document.createElement('div');
    currentPanel.className = 'nav-panel';
    const cols = document.createElement('div');
    cols.className = 'nav-panel-cols';
    currentPanel.append(cols);
    currentItem.append(currentPanel);
    navList.append(currentItem);
  };

  const panelCols = () => currentPanel.querySelector('.nav-panel-cols');

  children.forEach((el) => {
    const tag = el.tagName;
    if (tag === 'H2') {
      startMenu(el);
      return;
    }
    if (!currentItem) return;

    if (tag === 'H3') {
      // Start a new group. The heading is a link to the group's landing page
      // (its href is filled from the group's first link once the list attaches).
      const group = document.createElement('div');
      group.className = 'nav-group';
      const h = document.createElement('h3');
      h.className = 'nav-group-header';
      const link = document.createElement('a');
      link.textContent = el.textContent;
      link.href = '#';
      h.append(link);
      group.append(h);
      panelCols().append(group);
    } else if (tag === 'UL') {
      const ul = el.cloneNode(true);
      ul.className = 'nav-links';
      const cols = panelCols();
      const lastGroup = cols.querySelector('.nav-group:last-child');
      if (lastGroup && !lastGroup.querySelector('.nav-links')) lastGroup.append(ul);
      else {
        const group = document.createElement('div');
        group.className = 'nav-group';
        group.append(ul);
        cols.append(group);
      }
      // Point the group heading at its first link's destination.
      const attachedGroup = ul.closest('.nav-group');
      const headerLink = attachedGroup && attachedGroup.querySelector('.nav-group-header a');
      const firstLink = ul.querySelector('a[href]');
      if (headerLink && firstLink && firstLink.getAttribute('href')) {
        headerLink.href = firstLink.getAttribute('href');
      }
    } else if (tag === 'P') {
      // Promo card fragments (image / title / description paragraphs). The card
      // is a container div; every piece (image, title, description) is rendered
      // as its own link so all promo text is clickable.
      const img = el.querySelector('img');
      let promo = currentPanel.querySelector('.nav-promo');
      if (!promo) {
        promo = document.createElement('div');
        promo.className = 'nav-promo';
        currentPanel.append(promo);
      }
      const link = el.querySelector('a');
      const href = (link && link.getAttribute('href')) || promo.dataset.href || '#';
      if (href && href !== '#') promo.dataset.href = href;

      const anchor = document.createElement('a');
      anchor.href = href;
      if (img) {
        anchor.className = 'nav-promo-image';
        anchor.append(img.cloneNode(true));
      } else {
        anchor.className = 'nav-promo-text';
        anchor.textContent = el.textContent;
      }
      promo.append(anchor);
    }
  });

  return navList;
}

/** Build the utility controls (search bar, locale, login). */
function buildUtility(section) {
  const tools = document.createElement('div');
  tools.className = 'nav-tools';

  // Search bar (real input + submit) replacing the icon-only search.
  const form = document.createElement('form');
  form.className = 'nav-search-form';
  form.setAttribute('role', 'search');
  form.action = '/en-SA/search';

  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.className = 'nav-search-input';
  input.placeholder = 'Search';
  input.setAttribute('aria-label', 'Search');

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'nav-search-submit';
  submit.setAttribute('aria-label', 'Search');
  submit.textContent = '⌕';

  form.append(input, submit);
  tools.append(form);

  // Locale selector (flag + label) read from the nav DOM
  const localeLink = section.querySelector('ul a');
  if (localeLink) {
    const locale = document.createElement('button');
    locale.type = 'button';
    locale.className = 'nav-tool nav-locale';
    locale.setAttribute('aria-label', 'Language');
    locale.innerHTML = localeLink.innerHTML;
    tools.append(locale);
  }

  // Login
  const login = [...section.querySelectorAll('a')].find((a) => /login/i.test(a.textContent));
  if (login) {
    const btn = document.createElement('a');
    btn.className = 'nav-login';
    btn.href = login.getAttribute('href') || '#';
    btn.textContent = login.textContent;
    tools.append(btn);
  }

  return tools;
}

/** Wire up desktop hover + click, and mobile tap behavior. */
function addBehavior(nav) {
  const navList = nav.querySelector('.nav-list');
  const hamburger = nav.querySelector('.nav-hamburger');

  // A small close-delay keeps the panel open while the pointer travels from the
  // trigger into the panel (and lets links be clicked), only closing once the
  // pointer has actually left both the trigger and its panel.
  let closeTimer = null;
  const cancelClose = () => {
    if (closeTimer) { window.clearTimeout(closeTimer); closeTimer = null; }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer = window.setTimeout(() => closeAllPanels(navList), 220);
  };

  navList.querySelectorAll('.nav-item').forEach((item) => {
    const trigger = item.querySelector('.nav-trigger');
    const panel = item.querySelector('.nav-panel');

    const openItem = () => {
      cancelClose();
      closeAllPanels(navList);
      item.setAttribute('aria-expanded', 'true');
    };

    // Desktop: open on hover of the trigger, and stay open while hovering the
    // panel. Closing is deferred so moving between them doesn't dismiss it.
    trigger.addEventListener('mouseenter', () => { if (isDesktop.matches) openItem(); });
    item.addEventListener('mouseenter', () => { if (isDesktop.matches) cancelClose(); });
    item.addEventListener('mouseleave', () => { if (isDesktop.matches) scheduleClose(); });
    if (panel) {
      panel.addEventListener('mouseenter', () => { if (isDesktop.matches) cancelClose(); });
      panel.addEventListener('mouseleave', () => { if (isDesktop.matches) scheduleClose(); });
    }

    // Click toggles (works on mobile and as a keyboard/click fallback)
    trigger.addEventListener('click', () => {
      cancelClose();
      const open = item.getAttribute('aria-expanded') === 'true';
      closeAllPanels(navList);
      item.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  // Close desktop panels when clicking outside
  document.addEventListener('click', (e) => {
    if (isDesktop.matches && !nav.contains(e.target)) closeAllPanels(navList);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllPanels(navList);
  });

  // Mobile hamburger toggle
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const open = nav.getAttribute('data-mobile-open') === 'true';
      nav.setAttribute('data-mobile-open', open ? 'false' : 'true');
      hamburger.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  }

  // Reset state when crossing the desktop/mobile breakpoint
  isDesktop.addEventListener('change', () => {
    closeAllPanels(navList);
    nav.setAttribute('data-mobile-open', 'false');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
  });

  // Transparent-over-hero: solid header once the page is scrolled.
  const onScroll = () => {
    nav.setAttribute('data-scrolled', window.scrollY > 10 ? 'true' : 'false');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * Loads and decorates the header.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const frag = await fetchNavFragment();
  block.textContent = '';
  if (!frag) return;

  const sections = [...frag.children].filter((el) => el.tagName === 'DIV');
  const brandSection = sections[0];
  const navSection = sections[1];
  const toolsSection = sections[2];

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');
  nav.setAttribute('data-mobile-open', 'false');

  // Brand (logo + skyteam)
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  if (brandSection) {
    brandSection.querySelectorAll('a, img').forEach((node) => {
      if (node.tagName === 'A' && node.querySelector('img')) brand.append(node.cloneNode(true));
      else if (node.tagName === 'IMG' && !node.closest('a')) brand.append(node.cloneNode(true));
    });
  }

  // Hamburger (mobile)
  const hamburger = document.createElement('button');
  hamburger.className = 'nav-hamburger';
  hamburger.type = 'button';
  hamburger.setAttribute('aria-label', 'Open menu');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span class="nav-hamburger-icon"></span>';

  // Primary nav + tools
  const primary = navSection ? buildPrimaryNav(navSection) : document.createElement('ul');
  const tools = toolsSection ? buildUtility(toolsSection) : document.createElement('div');

  nav.append(brand, hamburger, primary, tools);

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';
  wrapper.append(nav);
  block.append(wrapper);

  addBehavior(nav);
}
