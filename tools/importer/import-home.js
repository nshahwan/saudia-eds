/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroPromoParser from './parsers/hero-promo.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import fragmentParser from './parsers/fragment.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/saudia-cleanup.js';
import sectionsTransformer from './transformers/saudia-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-promo': heroPromoParser,
  'cards-feature': cardsFeatureParser,
  'fragment': fragmentParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'Saudia homepage: hero promo carousel, booking widget, fare/offer card grids, and full-width promotional banners.',
  urls: [
    'https://www.saudia.com/',
  ],
  blocks: [
    {
      name: 'hero-promo',
      instances: ['.swiper-slide__content', '.promoImagelinklist.promoImagelinklist--content-embedded'],
    },
    {
      name: 'fragment',
      instances: ['mat-tab-group', '.booking-widget'],
    },
    {
      name: 'cards-feature',
      instances: ['.featuredlist', '.offer-content', '.offerforyou-content'],
    },
  ],
  sections: [
    { id: 's1-hero', name: 'Hero promo carousel', style: null },
    { id: 's2-booking', name: 'Flight search / booking widget', style: null },
    { id: 's3-fares', name: 'Best fares grid', style: null },
    { id: 's4-plan', name: 'Plan your next trip tiles', style: null },
    { id: 's5-deals', name: 'Flight + Hotel Deals banner', style: null },
    { id: 's6-miles', name: 'Shop with Miles banner', style: null },
    { id: 's7-newsletter', name: 'Be first to know newsletter banner', style: null },
    { id: 's8-experiences', name: 'Exceptional experiences articles', style: null },
    { id: 's9-visitsaudi', name: 'Visit Saudi co-brand banner', style: null },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks (afterTransform)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block; skip elements already replaced by an earlier parser
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate the document path.
    //    The Saudia root/homepage maps to the "en" homepage located under the
    //    site content folder: /dam/Saudia Airlines/site/en. The root pathname
    //    `/` would otherwise become '' and crash the bundled importer's path
    //    polyfill, so the root is mapped explicitly.
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const homePath = '/dam/Saudia Airlines/site/en';
    const path = rawPath === ''
      ? homePath
      : WebImporter.FileUtils.sanitizePath(rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
