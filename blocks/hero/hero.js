// Hero block — background image with a flight-booking engine overlaid on top.

/** Build the Saudia-style flight booking engine. */
function buildBookingEngine() {
  const engine = document.createElement('div');
  engine.className = 'hero-booking';

  // Trip-type tabs
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

  // Search form
  const form = document.createElement('form');
  form.className = 'hero-booking-form';
  form.action = '/en-US/Multicity/FlightSearch';

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

  engine.append(tabs, form);
  return engine;
}

/**
 * Loads and decorates the hero.
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  block.append(buildBookingEngine());
}
