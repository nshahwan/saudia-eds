/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-promo.js
  function buildCta(sourceAnchor, document2, href) {
    if (!sourceAnchor && !href) return null;
    const a = document2.createElement("a");
    const finalHref = href || sourceAnchor.getAttribute("href") || "";
    if (!finalHref) return null;
    a.setAttribute("href", finalHref);
    if (sourceAnchor) {
      const clone = sourceAnchor.cloneNode(true);
      clone.querySelectorAll('.mat-ripple, .mat-button-ripple, .mat-button-focus-overlay, [class*="ripple"], [class*="focus-overlay"]').forEach((el) => el.remove());
      const label = clone.textContent.replace(/\s+/g, " ").trim();
      a.textContent = label;
    }
    return a.textContent ? a : null;
  }
  function parse(element, { document: document2 }) {
    const isMegaMenu = element.matches('.promoImagelinklist, [class*="promoImagelinklist"]') || !!element.querySelector(".promoImagelinklist__content, .promo-content");
    let bgImg;
    let heading;
    let desc;
    let cta;
    if (isMegaMenu) {
      const item = element.querySelector("li a, a") || element;
      bgImg = element.querySelector(".promoImagelinklist__img img, img");
      heading = element.querySelector(".promo-content__left h3, .promoImagelinklist__content h3, h1, h2, h3");
      desc = element.querySelector(".promo-content__left p, .promoImagelinklist__content p, p");
      const anchor = element.querySelector("li > a, a[href]");
      const href = anchor ? anchor.getAttribute("href") : "";
      cta = null;
      if (href) {
        const btn = element.querySelector(".promo-content__right button, .promo-content__right, button");
        const label = btn ? btn.textContent.replace(/\s+/g, " ").trim() : "";
        const a = document2.createElement("a");
        a.setAttribute("href", href);
        a.textContent = label || (heading ? heading.textContent.replace(/\s+/g, " ").trim() : href);
        cta = a.textContent ? a : null;
      }
    } else {
      const slide = element.closest(".swiper-slide") || element.parentElement || element;
      bgImg = slide.querySelector('.swiper-slide__image img, img[class*="image"], img');
      heading = element.querySelector('h1, h2, h3, [class*="title"]');
      desc = element.querySelector('.swiper-slide__desc, [class*="desc"]');
      const anchor = element.querySelector(".swiper-slide__button a, a.button, a[href]");
      cta = buildCta(anchor, document2);
    }
    if (!heading && !desc && !cta && !bgImg) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const imageCell = document2.createDocumentFragment();
    imageCell.appendChild(document2.createComment(" field:image "));
    if (bgImg) imageCell.appendChild(bgImg);
    cells.push([imageCell]);
    const textCell = document2.createDocumentFragment();
    textCell.appendChild(document2.createComment(" field:text "));
    if (heading) {
      const tag = heading.tagName.toLowerCase();
      const h = document2.createElement(/^h[1-6]$/.test(tag) ? tag : "h2");
      h.textContent = heading.textContent.replace(/\s+/g, " ").trim();
      if (h.textContent) textCell.appendChild(h);
    }
    if (desc) {
      const p = document2.createElement("p");
      p.textContent = desc.textContent.replace(/\s+/g, " ").trim();
      if (p.textContent) textCell.appendChild(p);
    }
    if (cta) textCell.appendChild(cta);
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function buildTextCell(document2, headings, paragraphs, iconText, cta) {
    const textCell = document2.createDocumentFragment();
    textCell.appendChild(document2.createComment(" field:text "));
    const seen = /* @__PURE__ */ new Set();
    if (iconText && !cta) {
      const lead = document2.createElement("p");
      lead.textContent = iconText;
      textCell.appendChild(lead);
    }
    headings.forEach((h) => {
      const txt = h.textContent.replace(/\s+/g, " ").trim();
      if (!txt || seen.has("h:" + txt)) return;
      seen.add("h:" + txt);
      const tag = h.tagName.toLowerCase();
      const el = document2.createElement(/^h[1-6]$/.test(tag) ? tag : "h3");
      el.textContent = txt;
      textCell.appendChild(el);
    });
    paragraphs.forEach((p) => {
      const txt = p.textContent.replace(/\s+/g, " ").trim();
      if (!txt || seen.has("p:" + txt)) return;
      seen.add("p:" + txt);
      const el = document2.createElement("p");
      el.textContent = txt;
      textCell.appendChild(el);
    });
    if (cta && cta.getAttribute("href")) {
      textCell.appendChild(cta);
    }
    return textCell;
  }
  function buildCard(cardEl, document2) {
    const img = cardEl.querySelector(".featuredlist__img img, .offer-img img, .imagelinklist__img img, img");
    const textSource = cardEl.querySelector(".featuredlist__content, .offer-txt, .imagelinklist__content") || cardEl;
    const headings = Array.from(textSource.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    const paragraphs = Array.from(textSource.querySelectorAll("p"));
    const iconBtn = cardEl.querySelector(":scope > .button, .offer-img ~ .button, span.button.material-icons-outlined");
    const iconText = iconBtn ? iconBtn.textContent.replace(/\s+/g, " ").trim() : "";
    let cta = null;
    const innerLink = textSource.querySelector("a[href]");
    if (innerLink) {
      const href = innerLink.getAttribute("href");
      const label = innerLink.textContent.replace(/\s+/g, " ").trim();
      const dupHeading = headings.some((h) => h.textContent.replace(/\s+/g, " ").trim() === label);
      if (href && href !== "" && href !== "javascript:void(0)" && !dupHeading) {
        cta = document2.createElement("a");
        cta.setAttribute("href", href);
        cta.textContent = label || href;
      }
    }
    const imageCell = document2.createDocumentFragment();
    imageCell.appendChild(document2.createComment(" field:image "));
    if (img) imageCell.appendChild(img);
    const textCell = buildTextCell(document2, headings, paragraphs, iconText, cta);
    return [imageCell, textCell];
  }
  function parse2(element, { document: document2 }) {
    const cells = [];
    if (element.matches(".featuredlist") || element.querySelector(".featuredlist__img")) {
      const header = element.querySelector(".featuredlist__header");
      if (header) {
        const hHeadings = Array.from(header.querySelectorAll("h1, h2, h3, h4, .featuredlist__title"));
        const hParas = Array.from(header.querySelectorAll("p"));
        const hLinkSrc = header.querySelector("a");
        let hCta = null;
        if (hLinkSrc) {
          const label = hLinkSrc.textContent.replace(/\s+/g, " ").trim();
          if (label) {
            hCta = document2.createElement("a");
            hCta.setAttribute("href", hLinkSrc.getAttribute("href") || "#");
            hCta.textContent = label;
          }
        }
        const imageCell = document2.createDocumentFragment();
        imageCell.appendChild(document2.createComment(" field:image "));
        const textCell = buildTextCell(document2, hHeadings, hParas, "", hCta);
        cells.push([imageCell, textCell]);
      }
      Array.from(element.querySelectorAll(":scope ul > li")).forEach((li) => {
        if (li.querySelector("img") || li.querySelector("h1,h2,h3,h4,p")) {
          cells.push(buildCard(li, document2));
        }
      });
    } else if (element.matches(".offer-content")) {
      cells.push(buildCard(element, document2));
    } else if (element.querySelector(".offer-content, .offer-col")) {
      const titleWrap = element.querySelector(".title-offer-wrap");
      if (titleWrap) {
        const tHeadings = Array.from(titleWrap.querySelectorAll("h1, h2, h3, h4"));
        const tParas = Array.from(titleWrap.querySelectorAll("p"));
        if (tHeadings.length || tParas.length) {
          const imageCell = document2.createDocumentFragment();
          imageCell.appendChild(document2.createComment(" field:image "));
          const textCell = buildTextCell(document2, tHeadings, tParas, "", null);
          cells.push([imageCell, textCell]);
        }
      }
      const contents = Array.from(element.querySelectorAll(".offer-content"));
      const cols = Array.from(element.querySelectorAll(".offer-col")).filter((c) => !c.querySelector(".offer-content") && !c.querySelector(".offer-col"));
      [...cols, ...contents].forEach((c) => {
        if (c.querySelector("img") || c.querySelector("h1,h2,h3,h4,p")) {
          cells.push(buildCard(c, document2));
        }
      });
    } else {
      Array.from(element.querySelectorAll(".offer-content, .offer-col, ul > li")).forEach((c) => {
        if (c.querySelector("img") || c.querySelector("h1,h2,h3,h4,p")) {
          cells.push(buildCard(c, document2));
        }
      });
    }
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/fragment.js
  function parse3(element, { document: document2 }) {
    const fragmentPath = "/fragments/booking-widget";
    const link = document2.createElement("a");
    link.setAttribute("href", fragmentPath);
    link.textContent = fragmentPath;
    const cell = document2.createDocumentFragment();
    cell.appendChild(document2.createComment(" field:reference "));
    cell.appendChild(link);
    const cells = [[cell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "fragment", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/saudia-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "app-cookie-policy",
        ".cookie-policy-overlay",
        // Status-bar travel notice above the hero (app-jss-status-bar / #status-bar-present)
        "app-jss-status-bar",
        "#status-bar-present",
        // mWeb promo banner injected into the header shell
        "app-mweb-banner"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header#header",
        "header",
        "nav",
        "footer#global-footer",
        "footer",
        "app-jss-new-footer",
        "app-jss-copyright",
        "app-jss-new-navigation",
        "app-jss-saudia-logo",
        "app-jss-language",
        "app-jss-login",
        "app-jss-chat-bot",
        "#webChatBar",
        "#webchat",
        "#kampyleButtonContainer",
        "#nebula_div_btn",
        ".kampyle_button",
        ".kampyle_button-text",
        ".cdk-live-announcer-element",
        ".cdk-describedby-message-container",
        "app-visitor-identification"
      ]);
      element.querySelectorAll("[class]").forEach((el) => {
        const kept = Array.from(el.classList).filter((c) => c !== "ng-star-inserted" && !c.startsWith("ng-tns-") && !c.startsWith("ng-trigger") && !c.startsWith("ng-reflect") && !c.startsWith("_ngcontent") && !c.startsWith("_nghost"));
        if (kept.length) {
          el.className = kept.join(" ");
        } else {
          el.removeAttribute("class");
        }
      });
    }
  }

  // tools/importer/transformers/saudia-sections.js
  var SECTION_ID_ORDER = [
    "s1-hero",
    "s2-booking",
    "s3-fares",
    "s4-plan",
    "s5-deals",
    "s6-miles",
    "s7-newsletter",
    "s8-experiences",
    "s9-visitsaudi"
  ];
  function resolveSectionAnchor(sectionId, element) {
    const imageLinkLists = element.querySelectorAll("app-jss-image-link-list");
    switch (sectionId) {
      case "s2-booking":
        return element.querySelector("mat-tab-group");
      case "s3-fares":
        return element.querySelector(".featuredlist");
      case "s4-plan":
        return element.querySelector(".offerforyou-content");
      case "s5-deals":
        return imageLinkLists[1] || null;
      case "s6-miles":
        return imageLinkLists[2] || null;
      case "s7-newsletter":
        return imageLinkLists[3] || null;
      case "s8-experiences":
        return element.querySelector("app-jss-title-text");
      case "s9-visitsaudi":
        return imageLinkLists[5] || null;
      default:
        return null;
    }
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = SECTION_ID_ORDER.length - 1; i >= 1; i -= 1) {
        const sectionId = SECTION_ID_ORDER[i];
        const anchor = resolveSectionAnchor(sectionId, element);
        if (!anchor) continue;
        const hr = document.createElement("hr");
        anchor.before(hr);
      }
    }
  }

  // tools/importer/import-home.js
  var parsers = {
    "hero-promo": parse,
    "cards-feature": parse2,
    "fragment": parse3
  };
  var PAGE_TEMPLATE = {
    name: "home",
    description: "Saudia homepage: hero promo carousel, booking widget, fare/offer card grids, and full-width promotional banners.",
    urls: [
      "https://www.saudia.com/"
    ],
    blocks: [
      {
        name: "hero-promo",
        instances: [".swiper-slide__content", ".promoImagelinklist.promoImagelinklist--content-embedded"]
      },
      {
        name: "fragment",
        instances: ["mat-tab-group", ".booking-widget"]
      },
      {
        name: "cards-feature",
        instances: [".featuredlist", ".offer-content", ".offerforyou-content"]
      }
    ],
    sections: [
      { id: "s1-hero", name: "Hero promo carousel", style: null },
      { id: "s2-booking", name: "Flight search / booking widget", style: null },
      { id: "s3-fares", name: "Best fares grid", style: null },
      { id: "s4-plan", name: "Plan your next trip tiles", style: null },
      { id: "s5-deals", name: "Flight + Hotel Deals banner", style: null },
      { id: "s6-miles", name: "Shop with Miles banner", style: null },
      { id: "s7-newsletter", name: "Be first to know newsletter banner", style: null },
      { id: "s8-experiences", name: "Exceptional experiences articles", style: null },
      { id: "s9-visitsaudi", name: "Visit Saudi co-brand banner", style: null }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const homePath = "/dam/Saudia Airlines/site/en";
      const path = rawPath === "" ? homePath : WebImporter.FileUtils.sanitizePath(rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
