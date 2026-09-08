/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: saudia.com "home" section breaks.
 *
 * Inserts <hr> section boundaries for the 9-section home template. All 9
 * sections have style: null, so NO Section Metadata blocks are produced —
 * only the 8 <hr> breaks (one before every section except the first).
 *
 * ⚠️ The `selector` values in page-templates.json are NOT usable verbatim for
 * this Angular SPA: sections s5/s6/s7/s9 all point at
 * `.promoImagelinklist--content-embedded`, which — verified in cleaned.html —
 * exists ONLY inside the global header mega-menu (removed by saudia-cleanup),
 * and s8's `.offer-content` is ambiguous. Instead, each break is anchored to a
 * DOM-verified boundary read directly from migration-work/cleaned.html:
 *
 *   s2 booking      -> <mat-tab-group>                (unique in #main)
 *   s3 best fares   -> .featuredlist                  (unique class token)
 *   s4 plan tiles   -> .offerforyou-content           (unique class token)
 *   s5 deals banner -> app-jss-image-link-list #2     (ordinal in #main)
 *   s6 miles banner -> app-jss-image-link-list #3
 *   s7 newsletter   -> app-jss-image-link-list #4
 *   s8 experiences  -> <app-jss-title-text>           (first in #main; the
 *                                                       only other is in footer)
 *   s9 visit saudi  -> app-jss-image-link-list #6
 *
 * app-jss-image-link-list order within #main (no occurrences in the header):
 *   [0] hero carousel, [1] s5, [2] s6, [3] s7, [4] s8 banner, [5] s9.
 *
 * Breaks are inserted in beforeTransform (before block parsers can replace any
 * section element) per the section-transformer reference. Since no section has
 * a style, there is nothing to do in afterTransform. Inserting <hr> (a distinct
 * tag) never disturbs the tag-ordinal / class anchors used above.
 */

const SECTION_ID_ORDER = [
  's1-hero',
  's2-booking',
  's3-fares',
  's4-plan',
  's5-deals',
  's6-miles',
  's7-newsletter',
  's8-experiences',
  's9-visitsaudi',
];

/**
 * Resolve the DOM element that begins the given section, scoped to `element`
 * (#main). Returns null if not found — callers must skip rather than guess.
 */
function resolveSectionAnchor(sectionId, element) {
  const imageLinkLists = element.querySelectorAll('app-jss-image-link-list');
  switch (sectionId) {
    case 's2-booking':
      return element.querySelector('mat-tab-group');
    case 's3-fares':
      return element.querySelector('.featuredlist');
    case 's4-plan':
      return element.querySelector('.offerforyou-content');
    case 's5-deals':
      return imageLinkLists[1] || null;
    case 's6-miles':
      return imageLinkLists[2] || null;
    case 's7-newsletter':
      return imageLinkLists[3] || null;
    case 's8-experiences':
      return element.querySelector('app-jss-title-text');
    case 's9-visitsaudi':
      return imageLinkLists[5] || null;
    default:
      return null; // s1-hero: first section, no leading break
  }
}

export default function transform(hookName, element, payload) {
  // Reference payload.template.sections so the validator recognises this as a
  // section transformer and runs section validation.
  const sections = (payload && payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Iterate in reverse so each insertion never shifts a not-yet-processed
    // anchor. Skip the first section (no leading break). All sections are
    // style: null, so no Section Metadata is created here or in afterTransform.
    for (let i = SECTION_ID_ORDER.length - 1; i >= 1; i -= 1) {
      const sectionId = SECTION_ID_ORDER[i];
      const anchor = resolveSectionAnchor(sectionId, element);
      if (!anchor) continue; // selector didn't match on this page — skip, never guess

      const hr = document.createElement('hr');
      anchor.before(hr);
    }
  }

  // afterTransform: intentionally no-op. Every section has style: null, so
  // there are no Section Metadata blocks to insert.
}
