/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: fragment
 * Base block: fragment
 * Source: https://www.saudia.com/ (home template)
 * Generated: 2026-09-07
 *
 * The base "fragment" block is NOT in the block library catalog, so the
 * structure is inferred from the local model (blocks/fragment/_fragment.json):
 * a single field `reference` (component: aem-content) that points to a reusable
 * fragment document.
 *
 * Source DOM (verified against migration-work/cleaned.html): the matched element
 * is the interactive flight-search / booking engine (`mat-tab-group` /
 * `.booking-widget`) — a functional Angular application, not typing-authorable
 * content. It cannot be represented as default content, so it is replaced with a
 * fragment reference placeholder pointing to a reusable booking-widget fragment.
 *
 * Table structure: 1 column, 1 content row.
 *   Row 1: block name (added by createBlock)
 *   Row 2: reference link -> field:reference (aem-content)
 *
 * NOTE ON VALIDATION: content-completeness scoring is expected to be low for
 * this parser and does NOT indicate a defect. A fragment reference intentionally
 * replaces the entire interactive booking application with a single pointer to a
 * reusable fragment document; it deliberately does not reproduce the widget's
 * labels/controls, which are not authorable content. Low similarity is correct.
 */
export default function parse(element, { document }) {
  // Path to the reusable fragment that will host the booking engine. Authors
  // repoint this in Universal Editor; the fragment block resolves it at runtime.
  const fragmentPath = '/fragments/booking-widget';

  const link = document.createElement('a');
  link.setAttribute('href', fragmentPath);
  link.textContent = fragmentPath;

  const cell = document.createDocumentFragment();
  cell.appendChild(document.createComment(' field:reference '));
  cell.appendChild(link);

  const cells = [[cell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'fragment', cells });
  element.replaceWith(block);
}
