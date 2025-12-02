let screenOrientation = getScreenOrientation();
let firstLoad = true;

window.theme.readHeights = function () {
  const h = {};
  h.windowHeight = Math.min(window.screen.height, window.innerHeight);
  h.footerHeight = getHeight('[data-section-type*="footer"]');
  h.headerHeight = getHeight('[data-header-height]');
  h.headerRect = getElementRect('[data-header-height]');
  h.stickyHeaderHeight = document.querySelector('[data-header-sticky]') ? h.headerHeight : 0;
  h.collectionNavHeight = getHeight('[data-collection-nav]');
  h.logoHeight = getFooterLogoWithPadding();

  return h;
};

function setVars() {
  const {windowHeight, headerHeight, headerRect, logoHeight, footerHeight, collectionNavHeight} = window.theme.readHeights();
  const currentScreenOrientation = getScreenOrientation();

  if (!firstLoad || currentScreenOrientation !== screenOrientation || window.innerWidth > window.theme.sizes.mobile) {
    // Only update the heights on screen orientation change or larger than mobile devices
    document.documentElement.style.setProperty('--full-height', `${windowHeight}px`);
    document.documentElement.style.setProperty('--three-quarters', `${windowHeight * (3 / 4)}px`);
    document.documentElement.style.setProperty('--two-thirds', `${windowHeight * (2 / 3)}px`);
    document.documentElement.style.setProperty('--one-half', `${windowHeight / 2}px`);
    document.documentElement.style.setProperty('--one-third', `${windowHeight / 3}px`);

    // Update the screen orientation state
    screenOrientation = currentScreenOrientation;
    firstLoad = false;
  }

  document.documentElement.style.setProperty('--collection-nav-height', `${collectionNavHeight}px`);
  document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
  document.documentElement.style.setProperty('--header-bottom', `${headerRect?.bottom || 0}px`);
  document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
  document.documentElement.style.setProperty('--content-full', `${windowHeight - headerHeight - logoHeight / 2}px`);
  document.documentElement.style.setProperty('--content-min', `${windowHeight - headerHeight - footerHeight}px`);
}

function getScreenOrientation() {
  if (window.matchMedia('(orientation: portrait)').matches) {
    return 'portrait';
  }

  if (window.matchMedia('(orientation: landscape)').matches) {
    return 'landscape';
  }
}

function getHeight(selector) {
  const el = document.querySelector(selector);
  if (el) {
    return el.offsetHeight;
  } else {
    return 0;
  }
}

function getFooterLogoWithPadding() {
  const height = getHeight('[data-footer-logo]');
  if (height > 0) {
    return height + 20;
  } else {
    return 0;
  }
}

function getElementRect(selector) {
  const el = document.querySelector(selector);
  if (!el) return null;
  try {
    return el.getBoundingClientRect();
  } catch (e) {
    console.error('Error calculating element rect:', e);
    return null;
  }
}

setVars();

window.addEventListener('DOMContentLoaded', setVars);
document.addEventListener('theme:resize', setVars);
document.addEventListener('shopify:section:load', setVars);
