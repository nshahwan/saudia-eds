// Hero-promo block. The first instance on the page is the hero carousel and
// gets a flight-booking engine overlaid on top of it; later instances are
// plain promotional banners.

/** Build the Saudia-style flight booking engine. */
function buildBookingEngine() {
  const engine = document.createElement('div');
  engine.className = 'hero-booking';

  const field = (labelText, control) => {
    const wrap = document.createElement('label');
    wrap.className = 'hero-booking-field';
    const span = document.createElement('span');
    span.className = 'hero-booking-label';
    span.textContent = labelText;
    wrap.append(span, control);
    return wrap;
  };

  const textInput = (name, placeholder) => {
    const input = document.createElement('input');
    input.type = 'text';
    input.name = name;
    input.placeholder = placeholder;
    input.className = 'hero-booking-input';
    return input;
  };

  const dateInput = (name) => {
    const input = document.createElement('input');
    input.type = 'date';
    input.name = name;
    input.className = 'hero-booking-input';
    return input;
  };

  // --- Panel: Book (flight search) --------------------------------------
  const buildBookPanel = () => {
    const panel = document.createElement('div');
    panel.className = 'hero-booking-panel';

    const tabs = document.createElement('div');
    tabs.className = 'hero-booking-tabs';
    ['Round trip', 'One way', 'Multi-city'].forEach((label, i) => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'hero-booking-tab';
      tab.textContent = label;
      if (i === 0) tab.setAttribute('aria-selected', 'true');
      tab.addEventListener('click', () => {
        tabs.querySelectorAll('.hero-booking-tab').forEach((t) => t.removeAttribute('aria-selected'));
        tab.setAttribute('aria-selected', 'true');
      });
      tabs.append(tab);
    });

    const form = document.createElement('form');
    form.className = 'hero-booking-form';
    form.action = '/en-US/Multicity/FlightSearch';

    const passengers = document.createElement('select');
    passengers.name = 'passengers';
    passengers.className = 'hero-booking-input';
    ['1 Passenger', '2 Passengers', '3 Passengers', '4+ Passengers'].forEach((p, i) => {
      const opt = document.createElement('option');
      opt.value = String(i + 1);
      opt.textContent = p;
      passengers.append(opt);
    });

    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'hero-booking-submit';
    submit.textContent = 'Search flights';

    form.append(
      field('From', textInput('from', 'City or airport')),
      field('To', textInput('to', 'City or airport')),
      field('Departure', dateInput('departure')),
      field('Return', dateInput('return')),
      field('Passengers', passengers),
      submit,
    );

    panel.append(tabs, form);
    return panel;
  };

  // --- Panel: Manage / Check-in (booking-reference lookup) --------------
  const buildLookupPanel = (action, submitLabel) => {
    const panel = document.createElement('div');
    panel.className = 'hero-booking-panel';

    // Booking reference / Frequent flyer radios
    const radios = document.createElement('div');
    radios.className = 'hero-booking-radios';
    [['Booking reference', true], ['Frequent flyer', false]].forEach(([label, checked], i) => {
      const wrap = document.createElement('label');
      wrap.className = 'hero-booking-radio';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `lookup-${action}`;
      input.value = label;
      if (checked) input.checked = true;
      const span = document.createElement('span');
      span.textContent = label;
      wrap.append(input, span);
      radios.append(wrap);
      if (i === 0) input.setAttribute('aria-label', label);
    });

    const form = document.createElement('form');
    form.className = 'hero-booking-form hero-booking-form-lookup';
    form.action = action;

    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'hero-booking-submit';
    submit.textContent = submitLabel;

    form.append(
      field('Booking reference or E-ticket number', textInput('reference', 'Booking reference or E-ticket number')),
      field('Last name', textInput('lastname', 'Last name')),
      submit,
    );

    const more = document.createElement('a');
    more.className = 'hero-booking-tellmore';
    more.href = '/en-SA/Support/HelpAndSupport/FAQs';
    more.textContent = 'Tell me more';

    panel.append(radios, form, more);
    return panel;
  };

  // --- Top row of tabs --------------------------------------------------
  const topRow = document.createElement('div');
  topRow.className = 'hero-booking-toprow';

  const leftGroup = document.createElement('div');
  leftGroup.className = 'hero-booking-toptabs-left';
  const rightGroup = document.createElement('div');
  rightGroup.className = 'hero-booking-toptabs-right';

  // Panel-switching tabs (left). Each builds its panel lazily on first show.
  const panelHost = document.createElement('div');
  panelHost.className = 'hero-booking-panels';

  const PANEL_TABS = [
    { label: 'Book', build: buildBookPanel },
    { label: 'Manage', build: () => buildLookupPanel('/en-SA/book-and-manage/manage/manage-booking', 'Manage booking') },
    { label: 'Check-in', build: () => buildLookupPanel('/en-SA/checkIn/checkInoverview/checkInStandAlone', 'Check in') },
  ];
  // Navigation tabs (left) — these go to their own pages.
  const NAV_TABS = [
    { label: 'Flight status', href: '/en-SA/flightstatus' },
    { label: 'Flight schedule', href: '/en-SA/flightschedule' },
  ];

  const showPanel = (index) => {
    leftGroup.querySelectorAll('.hero-booking-toptab').forEach((t) => t.removeAttribute('aria-selected'));
    const activeTab = leftGroup.querySelector(`[data-panel="${index}"]`);
    if (activeTab) activeTab.setAttribute('aria-selected', 'true');
    panelHost.textContent = '';
    panelHost.append(PANEL_TABS[index].build());
  };

  PANEL_TABS.forEach((t, i) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'hero-booking-toptab';
    tab.dataset.panel = String(i);
    tab.textContent = t.label;
    tab.addEventListener('click', () => showPanel(i));
    leftGroup.append(tab);
  });
  NAV_TABS.forEach((t) => {
    const link = document.createElement('a');
    link.className = 'hero-booking-toptab hero-booking-toptab-nav';
    link.href = t.href;
    link.textContent = t.label;
    leftGroup.append(link);
  });

  // Partner / service tabs (right) — external links.
  [
    { label: 'Flight + Hotel', href: '/en-US/package-deals' },
    { label: 'Umrah', href: 'https://www.saudia.com/umrah/' },
    { label: 'Hotels', href: 'https://www.expedia.com/Saudia' },
    { label: 'Cars', href: 'https://www.expedia.com/Saudia' },
  ].forEach(({ label, href }) => {
    const link = document.createElement('a');
    link.className = 'hero-booking-toptab';
    link.href = href;
    link.textContent = label;
    rightGroup.append(link);
  });

  topRow.append(leftGroup, rightGroup);
  engine.append(topRow, panelHost);

  // Info strip
  const info = document.createElement('a');
  info.className = 'hero-booking-info';
  info.href = '/en-SA/plan/before-you-fly/travel-requirements';
  info.innerHTML = '<span>Read more about the latest travel requirements for your next destination</span><span class="hero-booking-info-cta">Learn more ›</span>';
  engine.append(info);

  // Open the "Book" panel by default.
  showPanel(0);

  return engine;
}

// Best fares from Jeddah — sourced from saudia.com, deduplicated.
const BEST_FARES = [
  { city: 'AlUla', price: '1173', img: 'https://www.saudia.com/-/media/SaudiaWebApp/data/media/img/Live-images/Destinations/Batch-2/Large/AlUla/L-AlUla-1.ashx?rev=d031af8614364b659d4b5d2a3c00b5aa' },
  { city: 'Cairo', price: '1092', img: 'https://www.saudia.com/-/media/SaudiaWebApp/data/media/img/Live-images/Destinations/Batch-2/Large/Cairo/L-cairo-1.ashx?rev=d92e9ed466174eecbfeb6c49f0e6baa6' },
  { city: 'Istanbul', price: '1752', img: 'https://www.saudia.com/-/media/SaudiaWebApp/data/media/img/Live-images/Destinations/ffares-nov/L-istanbul-1.ashx?rev=7233038e594749f88f9a993255a90675' },
  { city: 'London', price: '3301', img: 'https://www.saudia.com/-/media/SaudiaWebApp/data/media/img/Live-images/Destinations/Batch-2/Large/London/Large-(1).ashx?rev=66b64e443c324d388acda1718e97cc0f' },
  { city: 'Paris', price: '3169', img: 'https://www.saudia.com/-/media/SaudiaWebApp/data/media/img/Live-images/Destinations/Batch-2/Large/Paris/Large-(2).ashx?rev=c12cb69d60f84a99a00003b41c1eaa19' },
];

/** Build the "Best fares from Jeddah" section with fare cards. */
function buildBestFares() {
  const section = document.createElement('div');
  section.className = 'best-fares';

  const heading = document.createElement('h2');
  heading.className = 'best-fares-title';
  heading.textContent = 'Best fares from Jeddah';
  section.append(heading);

  const grid = document.createElement('div');
  grid.className = 'best-fares-grid';

  BEST_FARES.forEach((fare) => {
    const card = document.createElement('a');
    card.className = 'best-fares-card';
    card.href = '/en-US/flight-deals';

    const pic = document.createElement('picture');
    const img = document.createElement('img');
    img.src = fare.img;
    img.alt = fare.city;
    img.loading = 'lazy';
    pic.append(img);

    const body = document.createElement('div');
    body.className = 'best-fares-card-body';
    const city = document.createElement('h3');
    city.textContent = fare.city;
    const price = document.createElement('p');
    price.className = 'best-fares-price';
    price.textContent = `From SAR ${fare.price}`;
    const sub = document.createElement('p');
    sub.className = 'best-fares-sub';
    sub.textContent = 'Round trip From Jeddah';
    body.append(city, price, sub);

    card.append(pic, body);
    grid.append(card);
  });

  section.append(grid);
  return section;
}

/**
 * Hide sections whose content this block reproduces, to avoid duplication:
 * the source "Plan your next trip" cards-feature carries the same three offers
 * now shown in "Exclusive Offers for You".
 */
function removeDuplicateSections() {
  document.querySelectorAll('.cards-feature').forEach((cf) => {
    const heading = cf.querySelector('h2');
    if (heading && /plan your next trip/i.test(heading.textContent)) {
      const wrapper = cf.closest('.section') || cf.closest('.cards-feature-wrapper') || cf;
      wrapper.remove();
    }
  });

  // The source booking-widget fragment (Stopover / Flight + Hotel / Umrah /
  // Hotels / Cars tabs + the travel-requirements info notice) is now replaced
  // by the hero booking engine, so remove its whole section.
  document.querySelectorAll('.fragment').forEach((fr) => {
    if (/\/fragments\/booking-widget/i.test(fr.textContent)) {
      const wrapper = fr.closest('.section') || fr.closest('.fragment-wrapper') || fr;
      wrapper.remove();
    }
  });
}

/**
 * Loads and decorates the hero-promo block.
 * @param {Element} block The hero-promo block element
 */
/** Turn a set of hero-promo blocks into an auto-rotating carousel. */
function buildCarousel(slides) {
  const carousel = document.createElement('div');
  carousel.className = 'hero-carousel';

  const track = document.createElement('div');
  track.className = 'hero-carousel-track';
  slides.forEach((slide) => {
    slide.classList.add('hero-carousel-slide');
    track.append(slide);
  });
  carousel.append(track);

  // Dots
  const dots = document.createElement('div');
  dots.className = 'hero-carousel-dots';
  const dotButtons = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero-carousel-dot';
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dots.append(dot);
    return dot;
  });
  carousel.append(dots);

  // Prev / next arrows
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'hero-carousel-arrow hero-carousel-prev';
  prev.setAttribute('aria-label', 'Previous slide');
  prev.textContent = '‹';
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'hero-carousel-arrow hero-carousel-next';
  next.setAttribute('aria-label', 'Next slide');
  next.textContent = '›';
  carousel.append(prev, next);

  let index = 0;
  let timer = null;
  const show = (i) => {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dotButtons.forEach((d, di) => d.setAttribute('aria-selected', di === index ? 'true' : 'false'));
  };
  const nextSlide = () => show(index + 1);
  const startAuto = () => { timer = window.setInterval(nextSlide, 6000); };
  const stopAuto = () => { if (timer) window.clearInterval(timer); timer = null; };
  const reset = () => { stopAuto(); startAuto(); };

  dotButtons.forEach((d, di) => d.addEventListener('click', () => { show(di); reset(); }));
  prev.addEventListener('click', () => { show(index - 1); reset(); });
  next.addEventListener('click', () => { show(index + 1); reset(); });
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);

  show(0);
  startAuto();
  return carousel;
}

/**
 * Loads and decorates the hero-promo block.
 * @param {Element} block The hero-promo block element
 */
export default function decorate(block) {
  // Only the page's very FIRST hero-promo becomes the hero carousel (with the
  // booking engine, fares, and offers). Every later hero-promo — the hero's
  // sibling slides AND the standalone promo banners further down the page — is
  // skipped so nothing (booking engine, sections) is ever built twice.
  if (document.querySelector('.hero-promo') !== block) return;

  // Gather the sibling hero-promo blocks in this hero section into the carousel.
  const section = block.closest('.section') || block.parentElement;
  const wrappers = [...section.querySelectorAll('.hero-promo-wrapper')];
  const blocks = wrappers
    .map((w) => w.querySelector('.hero-promo'))
    .filter(Boolean);

  // Build the carousel from all hero-promo blocks in this section and mount it
  // in the first wrapper (the others are emptied of their block).
  const firstWrapper = block.closest('.hero-promo-wrapper');
  const carousel = buildCarousel(blocks);
  firstWrapper.classList.add('hero-promo-has-booking');
  firstWrapper.prepend(carousel);
  // Remove everything else in the hero section: the now-empty sibling promo
  // wrappers AND the source's default-content strip (slide titles +
  // arrow_back/arrow_forward/pause carousel controls), which the carousel
  // replaces. Only the first wrapper (carousel + booking + sections) remains.
  [...section.children].forEach((child) => {
    if (child !== firstWrapper) child.remove();
  });

  // Booking engine overlaid on the carousel — exactly once on the page
  // (the first hero). Guard against any duplicate insertion.
  if (!document.querySelector('.hero-booking')) {
    firstWrapper.append(buildBookingEngine());
  }

  // "Best fares from Jeddah" — right below the booking engine (same wrapper),
  // with a 5cm gap. Guard against duplicates.
  if (!document.querySelector('.best-fares')) {
    firstWrapper.append(buildBestFares());
  }

  // "Exclusive Offers for You" is now an authorable `offers-gallery` block
  // (see blocks/offers-gallery). No longer injected here.

  // Remove sections whose content is now duplicated here. cards-feature blocks
  // decorate independently, so defer until the current task queue drains.
  removeDuplicateSections();
  window.setTimeout(removeDuplicateSections, 0);
}
