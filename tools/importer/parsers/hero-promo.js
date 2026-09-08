/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero-promo
 * Base block: hero
 * Source: https://www.saudia.com/ (home template)
 * Generated: 2026-09-07
 *
 * Structure (from library-description.txt): 1 column, 3 rows.
 *   Row 1: block name (added by createBlock)
 *   Row 2: background image  -> field:image (+ collapsed field:imageAlt on the <img>)
 *   Row 3: title + optional subheading + optional CTA -> field:text (richtext)
 *
 * Source DOM (verified against migration-work/cleaned.html). This block is
 * matched by two selectors that resolve to two different DOM shapes:
 *
 *   Shape A — hero carousel / main-content promo teasers
 *     (`.swiper-slide__content`, built from `app-jss-image-link-list`):
 *       - background image is a SIBLING at `.swiper-slide__image img`
 *       - heading: `h1|h2|h3` (span-wrapped)
 *       - subheading: `.swiper-slide__desc`
 *       - CTA: `.swiper-slide__button a`
 *
 *   Shape B — header mega-menu promo tiles
 *     (`.promoImagelinklist.promoImagelinklist--content-embedded`):
 *       - the whole tile is a wrapping `li > a`
 *       - background image: `.promoImagelinklist__img img`
 *       - heading: `.promo-content__left h3`, subheading: `.promo-content__left p`
 *       - CTA link href is on the wrapping `<a>`; button is icon-only
 *
 * The CTA anchor is cloned and stripped of purely decorative Material ripple /
 * focus-overlay spans; its remaining label text (button text + arrow glyph) is
 * preserved to keep source fidelity.
 */
function buildCta(sourceAnchor, document, href) {
  if (!sourceAnchor && !href) return null;
  const a = document.createElement('a');
  const finalHref = href || sourceAnchor.getAttribute('href') || '';
  if (!finalHref) return null;
  a.setAttribute('href', finalHref);
  if (sourceAnchor) {
    const clone = sourceAnchor.cloneNode(true);
    // Remove decorative Material Design artefacts that carry no content.
    clone
      .querySelectorAll('.mat-ripple, .mat-button-ripple, .mat-button-focus-overlay, [class*="ripple"], [class*="focus-overlay"]')
      .forEach((el) => el.remove());
    const label = clone.textContent.replace(/\s+/g, ' ').trim();
    a.textContent = label;
  }
  return a.textContent ? a : null;
}

export default function parse(element, { document }) {
  const isMegaMenu = element.matches('.promoImagelinklist, [class*="promoImagelinklist"]')
    || !!element.querySelector('.promoImagelinklist__content, .promo-content');

  let bgImg;
  let heading;
  let desc;
  let cta;

  if (isMegaMenu) {
    // Shape B — mega-menu promo tile.
    const item = element.querySelector('li a, a') || element;
    bgImg = element.querySelector('.promoImagelinklist__img img, img');
    heading = element.querySelector('.promo-content__left h3, .promoImagelinklist__content h3, h1, h2, h3');
    desc = element.querySelector('.promo-content__left p, .promoImagelinklist__content p, p');
    const anchor = element.querySelector('li > a, a[href]');
    const href = anchor ? anchor.getAttribute('href') : '';
    // The wrapping anchor holds heading + paragraph + an icon-only button whose
    // Material glyph text ("arrow_forward") is real source text. Use only the
    // button's own text as the CTA label so heading/paragraph are not duplicated
    // while still preserving the glyph token.
    cta = null;
    if (href) {
      const btn = element.querySelector('.promo-content__right button, .promo-content__right, button');
      const label = btn ? btn.textContent.replace(/\s+/g, ' ').trim() : '';
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = label || (heading ? heading.textContent.replace(/\s+/g, ' ').trim() : href);
      cta = a.textContent ? a : null;
    }
  } else {
    // Shape A — carousel slide / promo teaser.
    const slide = element.closest('.swiper-slide') || element.parentElement || element;
    bgImg = slide.querySelector('.swiper-slide__image img, img[class*="image"], img');
    heading = element.querySelector('h1, h2, h3, [class*="title"]');
    desc = element.querySelector('.swiper-slide__desc, [class*="desc"]');
    const anchor = element.querySelector('.swiper-slide__button a, a.button, a[href]');
    cta = buildCta(anchor, document);
  }

  // Empty-block guard.
  if (!heading && !desc && !cta && !bgImg) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image cell (field:image; imageAlt collapses onto <img alt>).
  const imageCell = document.createDocumentFragment();
  imageCell.appendChild(document.createComment(' field:image '));
  if (bgImg) imageCell.appendChild(bgImg);
  cells.push([imageCell]);

  // Row 3: richtext content cell (field:text).
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));
  if (heading) {
    const tag = heading.tagName.toLowerCase();
    const h = document.createElement(/^h[1-6]$/.test(tag) ? tag : 'h2');
    h.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
    if (h.textContent) textCell.appendChild(h);
  }
  if (desc) {
    const p = document.createElement('p');
    p.textContent = desc.textContent.replace(/\s+/g, ' ').trim();
    if (p.textContent) textCell.appendChild(p);
  }
  if (cta) textCell.appendChild(cta);
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-promo', cells });
  element.replaceWith(block);
}
