/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: saudia.com site-wide cleanup.
 *
 * Source is an Angular SPA (Sitecore JSS). All selectors below were verified
 * by reading migration-work/cleaned.html — none are guessed.
 *
 * Non-authorable chrome removed: global header (logo, mega-navigation,
 * status-bar notice, mweb banner, cookie-consent overlay), global footer,
 * copyright, chat-bot widget, Kampyle feedback widget, and Angular CDK
 * accessibility helper containers (cdk-live-announcer / cdk-describedby).
 *
 * Residual Angular framework classes (ng-star-inserted, ng-tns-*, ng-trigger*)
 * are intentionally left in place: they carry no authorable meaning and are
 * discarded during the DOM→markdown conversion, so stripping them here only
 * adds churn without changing the imported output.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Modal / overlay chrome that would block or pollute block parsing.
    // Verified in cleaned.html: <app-cookie-policy>, <div class="cookie-policy-overlay">
    WebImporter.DOMUtils.remove(element, [
      'app-cookie-policy',
      '.cookie-policy-overlay',
      // Status-bar travel notice above the hero (app-jss-status-bar / #status-bar-present)
      'app-jss-status-bar',
      '#status-bar-present',
      // mWeb promo banner injected into the header shell
      'app-mweb-banner',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Global chrome and non-authorable widgets. Verified in cleaned.html:
    //   <header id="header" class="header header--sticky"> ... <nav> (mega menu)
    //   <footer id="global-footer" class="footer"> ... <app-jss-copyright>
    //   <app-jss-chat-bot>, <div id="webChatBar">, <div id="webchat">
    //   <span id="kampyleButtonContainer">, <button id="nebula_div_btn">,
    //   .kampyle_button / .kampyle_button-text
    //   .cdk-live-announcer-element, .cdk-describedby-message-container
    //   <app-visitor-identification> (empty tracking wrapper inside #main)
    WebImporter.DOMUtils.remove(element, [
      'header#header',
      'header',
      'nav',
      'footer#global-footer',
      'footer',
      'app-jss-new-footer',
      'app-jss-copyright',
      'app-jss-new-navigation',
      'app-jss-saudia-logo',
      'app-jss-language',
      'app-jss-login',
      'app-jss-chat-bot',
      '#webChatBar',
      '#webchat',
      '#kampyleButtonContainer',
      '#nebula_div_btn',
      '.kampyle_button',
      '.kampyle_button-text',
      '.cdk-live-announcer-element',
      '.cdk-describedby-message-container',
      'app-visitor-identification',
    ]);

    // Strip residual Angular framework classes so imported markup is clean.
    // Verified in cleaned.html: ng-star-inserted (482x), ng-tns-c*, ng-trigger*.
    element.querySelectorAll('[class]').forEach((el) => {
      const kept = Array.from(el.classList).filter((c) => (
        c !== 'ng-star-inserted'
        && !c.startsWith('ng-tns-')
        && !c.startsWith('ng-trigger')
        && !c.startsWith('ng-reflect')
        && !c.startsWith('_ngcontent')
        && !c.startsWith('_nghost')
      ));
      if (kept.length) {
        el.className = kept.join(' ');
      } else {
        el.removeAttribute('class');
      }
    });
  }
}
