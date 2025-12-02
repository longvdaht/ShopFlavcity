import appendCartItems from '../globals/append-cart-items';
import floatLabels from '../globals/forms';
import resizeListener from '../globals/resize';
import scrollListener from '../globals/scroll';
import wrapElements from '../globals/wrap';
import isTouch from '../util/touch';
import {ariaToggle} from '../globals/aria-toggle';
import {loading} from '../globals/loading';
import {loadedImagesEventHook, removeLoadingClassFromLoadedImages} from '../globals/images';
import {initAnimations} from '../globals/animations';

// Safari requestIdleCallback polyfill
window.requestIdleCallback =
  window.requestIdleCallback ||
  function (cb) {
    var start = Date.now();
    return setTimeout(function () {
      cb({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - start));
        },
      });
    }, 1);
  };
window.cancelIdleCallback =
  window.cancelIdleCallback ||
  function (id) {
    clearTimeout(id);
  };

if (window.theme.settings.enableAnimations) {
  initAnimations();
}

resizeListener();
scrollListener();
isTouch();
loadedImagesEventHook();

window.addEventListener('DOMContentLoaded', () => {
  ariaToggle(document);
  floatLabels(document);
  wrapElements(document);
  removeLoadingClassFromLoadedImages(document);
  loading();
  appendCartItems();

  requestIdleCallback(() => {
    if (Shopify.visualPreviewMode) {
      document.documentElement.classList.add('preview-mode');
    }
  });
});

document.addEventListener('shopify:section:load', (e) => {
  const container = e.target;
  floatLabels(container);
  wrapElements(container);
  ariaToggle(document);
});
