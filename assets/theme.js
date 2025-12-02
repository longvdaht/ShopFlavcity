
/*
* @license
* Carbon (c) Presidio Creative
*
* This file is included for advanced development by
* Shopify Agencies.  Modified versions of the theme
* code are not supported by Shopify or Presidio Creative.
*
* In order to use this file you will need to change
* theme.js to theme.dev.js in /layout/theme.liquid
*
*/

(function () {
    'use strict';

    (function() {
        const env = {"NODE_ENV":"development"};
        try {
            if (process) {
                process.env = Object.assign({}, process.env);
                Object.assign(process.env, env);
                return;
            }
        } catch (e) {} // avoid ReferenceError: process is not defined
        globalThis.process = { env:env };
    })();

    window.theme = window.theme || {};

    window.theme.sizes = {
      mobile: 480,
      small: 750,
      large: 990,
      widescreen: 1400,
    };

    window.theme.keyboardKeys = {
      TAB: 'Tab',
      ENTER: 'Enter',
      NUMPADENTER: 'NumpadEnter',
      ESCAPE: 'Escape',
      SPACE: 'Space',
      LEFTARROW: 'ArrowLeft',
      RIGHTARROW: 'ArrowRight',
    };

    window.theme.focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    window.theme.getWindowWidth = function () {
      return document.documentElement.clientWidth || document.body.clientWidth || window.innerWidth;
    };

    window.theme.getWindowHeight = function () {
      return document.documentElement.clientHeight || document.body.clientHeight || window.innerHeight;
    };

    window.theme.isMobile = function () {
      return window.theme.getWindowWidth() < window.theme.sizes.small;
    };

    /**
     * Currency Helpers
     * -----------------------------------------------------------------------------
     * A collection of useful functions that help with currency formatting
     *
     * Current contents
     * - formatMoney - Takes an amount in cents and returns it as a formatted dollar value.
     *
     */

    const moneyFormat = '${{amount}}';

    /**
     * Format money values based on your shop currency settings
     * @param  {Number|string} cents - value in cents or dollar amount e.g. 300 cents
     * or 3.00 dollars
     * @param  {String} format - shop money_format setting
     * @return {String} value - formatted value
     */
    window.theme.formatMoney = function (cents, format) {
      if (typeof cents === 'string') {
        cents = cents.replace('.', '');
      }
      let value = '';
      const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
      const formatString = format || moneyFormat;

      function formatWithDelimiters(number, precision = 2, thousands = ',', decimal = '.') {
        if (isNaN(number) || number == null) {
          return 0;
        }

        number = (number / 100.0).toFixed(precision);

        const parts = number.split('.');
        const dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${thousands}`);
        const centsAmount = parts[1] ? decimal + parts[1] : '';

        return dollarsAmount + centsAmount;
      }

      switch (formatString.match(placeholderRegex)[1]) {
        case 'amount':
          value = formatWithDelimiters(cents, 2);
          break;
        case 'amount_no_decimals':
          value = formatWithDelimiters(cents, 0);
          break;
        case 'amount_with_comma_separator':
          value = formatWithDelimiters(cents, 2, '.', ',');
          break;
        case 'amount_no_decimals_with_comma_separator':
          value = formatWithDelimiters(cents, 0, '.', ',');
          break;
        case 'amount_with_apostrophe_separator':
          value = formatWithDelimiters(cents, 2, "'", '.');
          break;
        case 'amount_no_decimals_with_space_separator':
          value = formatWithDelimiters(cents, 0, ' ', '');
          break;
        case 'amount_with_space_separator':
          value = formatWithDelimiters(cents, 2, ' ', ',');
          break;
        case 'amount_with_period_and_space_separator':
          value = formatWithDelimiters(cents, 2, ' ', '.');
          break;
      }

      return formatString.replace(placeholderRegex, value);
    };

    window.theme.debounce = function (fn, time) {
      let timeout;
      return function () {
        // eslint-disable-next-line prefer-rest-params
        if (fn) {
          const functionCall = () => fn.apply(this, arguments);
          clearTimeout(timeout);
          timeout = setTimeout(functionCall, time);
        }
      };
    };

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

    window.theme.scrollTo = (elementTop) => {
      const stickyHeaderHeight = document.querySelector('[data-header-sticky]') ? document.querySelector('[data-header-height]').offsetHeight : 0;

      window.scrollTo({
        top: elementTop + window.scrollY - stickyHeaderHeight,
        left: 0,
        behavior: 'smooth',
      });
    };

    /**
     * A11y Helpers
     * -----------------------------------------------------------------------------
     * A collection of useful functions that help make your theme more accessible
     */

    // Define trapFocusHandlers as a global variable within the module.
    const trapFocusHandlers = {};

    const a11y = {
      /**
       * Moves focus to an HTML element
       * @param {Element} element - The element to focus on.
       * @param {Object} options - Settings unique to your theme.
       * @param {string} options.className - Class name to apply to element on focus.
       */
      forceFocus(element, options) {
        options = options || {};

        var savedTabIndex = element.tabIndex;

        element.tabIndex = -1;
        element.dataset.tabIndex = savedTabIndex;
        element.focus();
        if (typeof options.className !== 'undefined') {
          element.classList.add(options.className);
        }
        element.addEventListener('blur', callback);

        function callback(event) {
          event.target.removeEventListener(event.type, callback);

          element.tabIndex = savedTabIndex;
          delete element.dataset.tabIndex;
          if (typeof options.className !== 'undefined') {
            element.classList.remove(options.className);
          }
        }
      },

      /**
       * Focus the appropriate element based on the URL hash.
       * @param {Object} options - Settings unique to your theme.
       */
      focusHash(options) {
        options = options || {};
        var hash = window.location.hash;
        var element = document.getElementById(hash.slice(1));

        if (element && options.ignore && element.matches(options.ignore)) {
          return false;
        }

        if (hash && element) {
          this.forceFocus(element, options);
        }
      },

      /**
       * Bind in-page links to focus the appropriate element.
       * @param {Object} options - Settings unique to your theme.
       */
      bindInPageLinks(options) {
        options = options || {};
        var links = Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]'));

        function queryCheck(selector) {
          return document.getElementById(selector) !== null;
        }

        return links.filter((link) => {
          if (link.hash === '#' || link.hash === '') {
            return false;
          }

          if (options.ignore && link.matches(options.ignore)) {
            return false;
          }

          if (!queryCheck(link.hash.substr(1))) {
            return false;
          }

          var element = document.querySelector(link.hash);

          if (!element) {
            return false;
          }

          link.addEventListener('click', () => {
            this.forceFocus(element, options);
          });

          return true;
        });
      },

      focusable(container) {
        var elements = Array.prototype.slice.call(
          container.querySelectorAll('[tabindex],' + '[draggable],' + 'a[href],' + 'area,' + 'button:enabled,' + 'input:not([type=hidden]):enabled,' + 'object,' + 'select:enabled,' + 'textarea:enabled')
        );

        return elements.filter((element) => !!((element.offsetWidth || element.offsetHeight || element.getClientRects().length) && this.isVisible(element)));
      },

      trapFocus(container, options) {
        options = options || {};
        var elements = this.focusable(container);
        var elementToFocus = options.elementToFocus || container;
        var first = elements[0];
        var last = elements[elements.length - 1];

        this.removeTrapFocus();

        trapFocusHandlers.focusin = function (event) {
          if (container !== event.target && !container.contains(event.target) && first && first === event.target) {
            first.focus();
          }

          if (event.target !== container && event.target !== last && event.target !== first) return;
          document.addEventListener('keydown', trapFocusHandlers.keydown);
        };

        trapFocusHandlers.focusout = function () {
          document.removeEventListener('keydown', trapFocusHandlers.keydown);
        };

        trapFocusHandlers.keydown = function (event) {
          if (event.code !== 'Tab') return;

          if (event.target === last && !event.shiftKey) {
            event.preventDefault();
            first.focus();
          }

          if ((event.target === container || event.target === first) && event.shiftKey) {
            event.preventDefault();
            last.focus();
          }
        };

        document.addEventListener('focusout', trapFocusHandlers.focusout);
        document.addEventListener('focusin', trapFocusHandlers.focusin);

        this.forceFocus(elementToFocus, options);
      },

      removeTrapFocus() {
        document.removeEventListener('focusin', trapFocusHandlers.focusin);
        document.removeEventListener('focusout', trapFocusHandlers.focusout);
        document.removeEventListener('keydown', trapFocusHandlers.keydown);
      },

      autoFocusLastElement() {
        if (window.theme.a11y.lastElement && document.body.classList.contains('is-focused')) {
          setTimeout(() => {
            window.theme.a11y.lastElement?.focus();
          });
        }
      },

      accessibleLinks(elements, options) {
        if (typeof elements !== 'string') {
          throw new TypeError(elements + ' is not a String.');
        }

        elements = document.querySelectorAll(elements);

        if (elements.length === 0) {
          return;
        }

        options = options || {};
        options.messages = options.messages || {};

        var messages = {
          newWindow: options.messages.newWindow || 'Opens in a new window.',
          external: options.messages.external || 'Opens external website.',
          newWindowExternal: options.messages.newWindowExternal || 'Opens external website in a new window.',
        };

        var prefix = options.prefix || 'a11y';

        var messageSelectors = {
          newWindow: prefix + '-new-window-message',
          external: prefix + '-external-message',
          newWindowExternal: prefix + '-new-window-external-message',
        };

        function generateHTML(messages) {
          var container = document.createElement('ul');
          var htmlMessages = Object.keys(messages).reduce((html, key) => {
            return (html += '<li id=' + messageSelectors[key] + '>' + messages[key] + '</li>');
          }, '');

          container.setAttribute('hidden', true);
          container.innerHTML = htmlMessages;

          document.body.appendChild(container);
        }

        function externalSite(link) {
          return link.hostname !== window.location.hostname;
        }

        elements.forEach((link) => {
          var target = link.getAttribute('target');
          var rel = link.getAttribute('rel');
          var isExternal = externalSite(link);
          var isTargetBlank = target === '_blank';
          var missingRelNoopener = rel === null || rel.indexOf('noopener') === -1;

          if (isTargetBlank && missingRelNoopener) {
            var relValue = rel === null ? 'noopener' : rel + ' noopener';
            link.setAttribute('rel', relValue);
          }

          if (isExternal && isTargetBlank) {
            link.setAttribute('aria-describedby', messageSelectors.newWindowExternal);
          } else if (isExternal) {
            link.setAttribute('aria-describedby', messageSelectors.external);
          } else if (isTargetBlank) {
            link.setAttribute('aria-describedby', messageSelectors.newWindow);
          }
        });

        generateHTML(messages);
      },

      isVisible(el) {
        var style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      },
    };

    window.theme = window.theme || {};
    window.theme.a11y = a11y;

    window.theme.throttle = (fn, wait) => {
      let prev, next;
      return function invokeFn(...args) {
        const now = Date.now();
        next = clearTimeout(next);
        if (!prev || now - prev >= wait) {
          // eslint-disable-next-line prefer-spread
          fn.apply(null, args);
          prev = now;
        } else {
          next = setTimeout(invokeFn.bind(null, ...args), wait - (now - prev));
        }
      };
    };

    const selectors$w = {
      ticker: 'ticker-bar',
      tickerSlide: '.announcement__slide',
    };

    if (!customElements.get('announcement-bar')) {
      customElements.define(
        'announcement-bar',
        class AnnouncementBar extends HTMLElement {
          constructor() {
            super();

            this.slidesCount = this.querySelectorAll(selectors$w.tickerSlide).length;
          }

          connectedCallback() {
            this.addEventListener('theme:countdown:hide', (e) => {
              if (window.Shopify.designMode) return;

              if (this.slidesCount === 1) {
                const tickerBar = this.querySelector(selectors$w.ticker);
                tickerBar.style.display = 'none';
              }

              const tickerText = e.target.closest(selectors$w.tickerSlide);
              this.removeTickerText(tickerText);
            });

            this.addEventListener('theme:countdown:expire', () => {
              this.querySelectorAll(selectors$w.ticker)?.forEach((ticker) => {
                ticker.dispatchEvent(new CustomEvent('theme:ticker:refresh'));
              });
            });

            document.dispatchEvent(new CustomEvent('theme:announcement:init', {bubbles: true}));
          }

          removeTickerText(tickerText) {
            const ticker = tickerText.closest(selectors$w.ticker);
            tickerText.remove();
            ticker.dispatchEvent(new CustomEvent('theme:ticker:refresh'));
          }

          disconnectedCallback() {
            document.removeEventListener('theme:resize:width', this.tickerResizeEvent);
          }
        }
      );
    }

    const htmlUpdate = {
      /**
       * Used to swap an HTML node with a new node.
       * The new node is inserted as a previous sibling to the old node, the old node is hidden, and then the old node is removed.
       */
      viewTransition(oldNode, newContent, preProcessCallbacks = [], postProcessCallbacks = []) {
        preProcessCallbacks?.forEach((callback) => callback(newContent));

        // Add timestamp to ensure unique IDs
        const timestamp = Date.now();
        // Update the main element's ID if it exists

        if (newContent.dataset.swapId === 'true' && newContent.id) {
          newContent.id = `${newContent.id}-${timestamp}`;
        }

        // Update all child elements' IDs, forms, and AOS anchors
        newContent.querySelectorAll('[id], [form], [data-aos-anchor]').forEach((element) => {
          // Update element ID if it exists
          element.id && (element.id = `${element.id}-${timestamp}`);
          // Update form reference if it exists

          if (element.form) {
            const formId = element.closest('form') ? element.closest('form').getAttribute('id') : `${element.form.getAttribute('id')}-${timestamp}`;
            element.setAttribute('form', formId);
          }

          // Update data-aos-anchor if it exists
          if (element.dataset.aosAnchor) {
            const anchorId = element.dataset.aosAnchor.replace('#', '');
            element.dataset.aosAnchor = `#${anchorId}-${timestamp}`;
          }
        });

        const newNodeWrapper = document.createElement('div');
        this.setInnerHTML(newNodeWrapper, newContent.outerHTML);
        const newNode = newNodeWrapper.firstChild;

        // dedupe IDs in the old node to avoid conflicts during transition
        if (oldNode.dataset.swapId === 'true' && oldNode.id) {
          oldNode.id = `${oldNode.id}-old-${timestamp}`;
        }

        oldNode.querySelectorAll('[id], [form], [data-aos-anchor]').forEach((element) => {
          // Update element ID if it exists
          element.id && (element.id = `${element.id}-old-${timestamp}`);
          // Update form reference if it exists

          if (element.form) {
            const formId = element.closest('form') ? element.closest('form').getAttribute('id') : `${element.form.getAttribute('id')}-old-${timestamp}`;
            element.setAttribute('form', formId);
          }

          // Update data-aos-anchor if it exists
          if (element.dataset.aosAnchor) {
            const anchorId = element.dataset.aosAnchor.replace('#', '');
            element.dataset.aosAnchor = `#${anchorId}-old-${timestamp}`;
          }
        });

        oldNode.style.display = 'none';
        oldNode.parentNode.insertBefore(newNode, oldNode);
        oldNode.remove();

        postProcessCallbacks?.forEach((callback) => callback(newNode));

        // setTimeout(() => oldNode.remove(), 500);
      },

      // Sets inner HTML and reinjects the script tags to allow execution. By default, scripts are disabled when using element.innerHTML.
      setInnerHTML(element, html) {
        element.innerHTML = html;
        element.querySelectorAll('script').forEach((oldScriptTag) => {
          const newScriptTag = document.createElement('script');
          Array.from(oldScriptTag.attributes).forEach((attribute) => {
            newScriptTag.setAttribute(attribute.name, attribute.value);
          });
          newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
          oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
        });
      },
    };

    window.theme = window.theme || {};
    window.theme.htmlUpdate = htmlUpdate;

    function ariaToggle(container) {
      const toggleButtons = container.querySelectorAll('[data-aria-toggle]');
      if (toggleButtons.length) {
        toggleButtons.forEach((element) => {
          element.addEventListener('click', function (event) {
            event.preventDefault();
            const currentTarget = event.currentTarget;
            currentTarget.setAttribute('aria-expanded', currentTarget.getAttribute('aria-expanded') == 'false' ? 'true' : 'false');
            const toggleID = currentTarget.getAttribute('aria-controls');
            const toggleElement = document.querySelector(`#${toggleID}`);
            const removeExpandingClass = () => {
              toggleElement.classList.remove('expanding');
              toggleElement.removeEventListener('transitionend', removeExpandingClass);
            };
            const addExpandingClass = () => {
              toggleElement.classList.add('expanding');
              toggleElement.removeEventListener('transitionstart', addExpandingClass);
            };

            toggleElement.addEventListener('transitionstart', addExpandingClass);
            toggleElement.addEventListener('transitionend', removeExpandingClass);

            toggleElement.classList.toggle('expanded');
          });
        });
      }
    }

    const classes$r = {
      focus: 'is-focused',
    };

    const selectors$v = {
      inPageLink: '[data-skip-content]',
      linkesWithOnlyHash: 'a[href="#"]',
    };

    class Accessibility {
      constructor() {
        this.init();
      }

      init() {
        this.a11y = window.theme.a11y;

        // DOM Elements
        this.html = document.documentElement;
        this.body = document.body;
        this.inPageLink = document.querySelector(selectors$v.inPageLink);
        this.linkesWithOnlyHash = document.querySelectorAll(selectors$v.linkesWithOnlyHash);

        // A11Y init methods
        this.a11y.focusHash();
        this.a11y.bindInPageLinks();

        // Events
        this.clickEvents();
        this.focusEvents();
      }

      /**
       * Clicked events accessibility
       *
       * @return  {Void}
       */

      clickEvents() {
        if (this.inPageLink) {
          this.inPageLink.addEventListener('click', (event) => {
            event.preventDefault();
          });
        }

        if (this.linkesWithOnlyHash) {
          this.linkesWithOnlyHash.forEach((item) => {
            item.addEventListener('click', (event) => {
              event.preventDefault();
            });
          });
        }
      }

      /**
       * Focus events
       *
       * @return  {Void}
       */

      focusEvents() {
        document.addEventListener('mousedown', () => {
          this.body.classList.remove(classes$r.focus);
        });

        document.addEventListener('keyup', (event) => {
          if (event.code !== 'Tab') {
            return;
          }

          this.body.classList.add(classes$r.focus);
        });
      }
    }

    window.theme = window.theme || {};
    window.theme.Accessibility = new Accessibility();

    /*
      Trigger event after animation completes
    */
    window.theme.waitForAnimationEnd = function (element) {
      return new Promise((resolve) => {
        function onAnimationEnd(event) {
          if (event.target != element) return;

          element.removeEventListener('animationend', onAnimationEnd);
          resolve();
        }

        element?.addEventListener('animationend', onAnimationEnd);
      });
    };

    /*
      Trigger event after all animations complete in a specific section
    */
    window.theme.waitForAllAnimationsEnd = function (section) {
      return new Promise((resolve, rejected) => {
        const animatedElements = section.querySelectorAll('[data-aos]');
        let animationCount = 0;

        function onAnimationEnd(event) {
          animationCount++;

          if (animationCount === animatedElements.length) {
            // All animations have ended
            resolve();
          }

          event.target.removeEventListener('animationend', onAnimationEnd);
        }

        animatedElements.forEach((element) => {
          element.addEventListener('animationend', onAnimationEnd);
        });

        if (!animationCount) rejected();
      });
    };

    function FetchError(object) {
      this.status = object.status || null;
      this.headers = object.headers || null;
      this.json = object.json || null;
      this.body = object.body || null;
    }
    FetchError.prototype = Error.prototype;

    const classes$q = {
      animated: 'is-animated',
      active: 'is-active',
      added: 'is-added',
      disabled: 'is-disabled',
      empty: 'is-empty',
      error: 'has-error',
      headerStuck: 'js__header__stuck',
      hidden: 'is-hidden',
      hiding: 'is-hiding',
      loading: 'is-loading',
      open: 'is-open',
      removed: 'is-removed',
      success: 'is-success',
      visible: 'is-visible',
      expanded: 'is-expanded',
      updated: 'is-updated',
      variantSoldOut: 'variant--soldout',
      variantUnavailable: 'variant--unavailable',
    };

    const selectors$u = {
      apiContent: '[data-api-content]',
      apiLineItems: '[data-api-line-items]',
      apiCartPrice: '[data-api-cart-price]',
      animation: '[data-animation]',
      additionalCheckoutButtons: '.additional-checkout-buttons',
      cartBarAdd: '[data-add-to-cart-bar]',
      cartCloseError: '[data-cart-error-close]',
      cartDrawer: 'cart-drawer',
      cartDrawerClose: '[data-cart-drawer-close]',
      cartEmpty: '[data-cart-empty]',
      cartErrors: '[data-cart-errors]',
      cartItemRemove: '[data-item-remove]',
      cartPage: '[data-cart-page]',
      cartForm: '[data-cart-form]',
      cartTermsCheckbox: '[data-cart-acceptance-checkbox]',
      cartCheckoutButtonWrapper: '[data-cart-checkout-buttons]',
      cartCheckoutButton: '[data-cart-checkout-button]',
      cartTotal: '[data-cart-total]',
      checkoutButtons: '[data-checkout-buttons]',
      errorMessage: '[data-error-message]',
      formCloseError: '[data-close-error]',
      formErrorsContainer: '[data-cart-errors-container]',
      formWrapper: '[data-form-wrapper]',
      freeShipping: '[data-free-shipping]',
      freeShippingGraph: '[data-progress-graph]',
      freeShippingProgress: '[data-progress-bar]',
      headerWrapper: '[data-header-wrapper]',
      item: '[data-item]',
      itemsHolder: '[data-items-holder]',
      leftToSpend: '[data-left-to-spend]',
      navDrawer: '[data-drawer]',
      outerSection: '[data-section-id]',
      priceHolder: '[data-cart-price-holder]',
      cartComplementaryProducts: '[data-cart-complementary-products]',
      cartPromotionBlock: '[data-cart-promotion-block]',
      quickAddHolder: '[data-quick-add-holder]',
      quickAddModal: '[data-quick-add-modal]',
      qtyInput: 'input[name="updates[]"]',
      termsErrorMessage: '[data-terms-error-message]',
      noscript: 'noscript',
    };

    const attributes$j = {
      cartTotal: 'data-cart-total',
      disabled: 'disabled',
      freeShipping: 'data-free-shipping',
      freeShippingLimit: 'data-free-shipping-limit',
      item: 'data-item',
      itemIndex: 'data-item-index',
      itemTitle: 'data-item-title',
      quickAddHolder: 'data-quick-add-holder',
      quickAddVariant: 'data-quick-add-variant',
      scrollLocked: 'data-scroll-locked',
      name: 'name',
    };

    class CartItems extends HTMLElement {
      constructor() {
        super();

        this.a11y = window.theme.a11y;
      }

      connectedCallback() {
        // DOM Elements
        this.cartPage = document.querySelector(selectors$u.cartPage);
        this.cartForm = document.querySelector(selectors$u.cartForm);
        this.cartDrawer = document.querySelector(selectors$u.cartDrawer);
        this.cartEmpty = document.querySelector(selectors$u.cartEmpty);
        this.cartTermsCheckbox = document.querySelector(selectors$u.cartTermsCheckbox);
        this.cartCheckoutButtonWrapper = document.querySelector(selectors$u.cartCheckoutButtonWrapper);
        this.cartCheckoutButton = document.querySelector(selectors$u.cartCheckoutButton);
        this.checkoutButtons = document.querySelector(selectors$u.checkoutButtons);
        this.itemsHolder = document.querySelector(selectors$u.itemsHolder);
        this.priceHolder = document.querySelector(selectors$u.priceHolder);
        this.cartComplementaryProducts = document.querySelector(selectors$u.cartComplementaryProducts);
        this.items = document.querySelectorAll(selectors$u.item);
        this.cartTotal = document.querySelector(selectors$u.cartTotal);
        this.freeShipping = document.querySelectorAll(selectors$u.freeShipping);
        this.cartErrorHolder = document.querySelector(selectors$u.cartErrors);
        this.cartCloseErrorMessage = document.querySelector(selectors$u.cartCloseError);
        this.headerWrapper = document.querySelector(selectors$u.headerWrapper);
        this.navDrawer = document.querySelector(selectors$u.navDrawer);
        this.subtotal = window.theme.subtotal;

        // Define Cart object depending on if we have cart drawer or cart page
        this.cart = this.cartDrawer || this.cartPage;
        window.theme.cart = this.cart;

        // Cart events
        this.animateItems = this.animateItems.bind(this);
        this.addToCart = this.addToCart.bind(this);
        this.cartAddEvent = this.cartAddEvent.bind(this);
        this.updateProgress = this.updateProgress.bind(this);
        this.onCartDrawerClose = this.onCartDrawerClose.bind(this);

        // Set global event listeners for "Add to cart" and Announcement bar wheel progress
        document.addEventListener('theme:cart:add', this.cartAddEvent);
        document.addEventListener('theme:announcement:init', this.updateProgress);

        if (theme.settings.cartType == 'drawer') {
          document.addEventListener('theme:cart-drawer:open', this.animateItems);
          document.addEventListener('theme:cart-drawer:close', this.onCartDrawerClose);
        }

        // Free Shipping values
        this.circumference = 28 * Math.PI; // radius - stroke * 4 * PI
        this.freeShippingLimit = this.freeShipping.length ? Number(this.freeShipping[0].getAttribute(attributes$j.freeShippingLimit)) * 100 * window.Shopify.currency.rate : 0;

        this.freeShippingMessageHandle(this.subtotal);
        this.updateProgress();

        this.build = this.build.bind(this);
        this.updateCart = this.updateCart.bind(this);
        this.productAddCallback = this.productAddCallback.bind(this);
        this.formSubmitHandler = window.theme.throttle(this.formSubmitHandler.bind(this), 50);

        if (this.cartPage) {
          this.animateItems();
        }

        if (this.cart) {
          // Checking
          this.hasItemsInCart = this.hasItemsInCart.bind(this);
          this.cartCount = this.getCartItemCount();
        }

        // Set classes
        this.toggleClassesOnContainers = this.toggleClassesOnContainers.bind(this);

        // Flags
        this.totalItems = this.items.length;

        this.cartUpdateFailed = false;

        // Cart Events
        this.cartEvents();
        this.cartRemoveEvents();
        this.cartUpdateEvents();

        document.addEventListener('theme:product:add', this.productAddCallback);
        document.addEventListener('theme:product:add-error', this.productAddCallback);
        document.addEventListener('theme:cart:refresh', this.getCart.bind(this));
      }

      disconnectedCallback() {
        document.removeEventListener('theme:cart:add', this.cartAddEvent);
        document.removeEventListener('theme:cart:refresh', this.cartAddEvent);
        document.removeEventListener('theme:announcement:init', this.updateProgress);
        document.removeEventListener('theme:product:add', this.productAddCallback);
        document.removeEventListener('theme:product:add-error', this.productAddCallback);

        if (document.documentElement.hasAttribute(attributes$j.scrollLocked)) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }
      }

      onCartDrawerClose() {
        this.resetAnimatedItems();

        if (this.cartDrawer?.classList.contains(classes$q.open)) {
          this.cart.classList.remove(classes$q.updated);
        }

        this.cartEmpty.classList.remove(classes$q.updated);
        this.cartErrorHolder.classList.remove(classes$q.expanded);
        this.cart.querySelectorAll(selectors$u.animation).forEach((item) => {
          const removeHidingClass = () => {
            item.classList.remove(classes$q.hiding);
            item.removeEventListener('animationend', removeHidingClass);
          };

          item.classList.add(classes$q.hiding);
          item.addEventListener('animationend', removeHidingClass);
        });
      }

      /**
       * Cart update event hook
       *
       * @return  {Void}
       */

      cartUpdateEvents() {
        this.items = document.querySelectorAll(selectors$u.item);

        delete window.complementaryGroupsExpected;
        delete window.complementaryGroupsLoaded;

        this.items.forEach((item) => {
          item.addEventListener('theme:cart:update', (event) => {
            this.updateCart(
              {
                id: event.detail.id,
                quantity: event.detail.quantity,
              },
              item
            );
          });
        });
      }

      /**
       * Cart events
       *
       * @return  {Void}
       */

      cartRemoveEvents() {
        const cartItemRemove = document.querySelectorAll(selectors$u.cartItemRemove);

        cartItemRemove.forEach((button) => {
          const item = button.closest(selectors$u.item);
          button.addEventListener('click', (event) => {
            event.preventDefault();

            if (button.classList.contains(classes$q.disabled)) return;

            this.updateCart(
              {
                id: button.dataset.id,
                quantity: 0,
              },
              item
            );
          });
        });

        if (this.cartCloseErrorMessage) {
          this.cartCloseErrorMessage.addEventListener('click', (event) => {
            event.preventDefault();

            this.cartErrorHolder.classList.remove(classes$q.expanded);
          });
        }
      }

      /**
       * Cart event add product to cart
       *
       * @return  {Void}
       */

      cartAddEvent(event) {
        let formData = '';
        let button = event.detail.button;

        if (button.hasAttribute('disabled')) return;
        const form = button.closest('form');
        // Validate form
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        formData = new FormData(form);

        const hasInputsInNoScript = [...form.elements].some((el) => el.closest(selectors$u.noscript));
        if (hasInputsInNoScript) {
          formData = this.handleFormDataDuplicates([...form.elements], formData);
        }

        if (form !== null && form.querySelector('[type="file"]')) {
          return;
        }
        if (theme.settings.cartType === 'drawer' && this.cartDrawer) {
          event.preventDefault();
        }
        this.addToCart(formData, button);
      }

      /**
       * Modify the `formData` object in case there are key/value pairs with an overlapping `key`
       *  - the presence of form input fields inside a `noscript` tag leads to a duplicate `key`, which overwrites the existing `value` when the `FormData` is constructed
       *  - such key/value pairs discrepancies occur in the Theme editor, when any setting is updated, and right before one presses the "Save" button
       *
       * @param   {Array}  A list of all `HTMLFormElement.elements` DOM nodes
       * @param   {Object}  `FormData` object, created with the `FormData()` constructor
       *
       * @return  {Object} Updated `FormData` object that does not contain any duplicate keys
       */
      handleFormDataDuplicates(elements, formData) {
        if (!elements.length || typeof formData !== 'object') return formData;

        elements.forEach((element) => {
          if (element.closest(selectors$u.noscript)) {
            const key = element.getAttribute(attributes$j.name);
            const value = element.value;

            if (key) {
              const values = formData.getAll(key);
              if (values.length > 1) values.splice(values.indexOf(value), 1);

              formData.delete(key);
              formData.set(key, values[0]);
            }
          }
        });

        return formData;
      }

      /**
       * Cart events
       *
       * @return  {Void}
       */

      cartEvents() {
        if (this.cartTermsCheckbox) {
          this.cartTermsCheckbox.removeEventListener('change', this.formSubmitHandler);
          this.cartCheckoutButtonWrapper.removeEventListener('click', this.formSubmitHandler);
          this.cartForm.removeEventListener('submit', this.formSubmitHandler);

          this.cartTermsCheckbox.addEventListener('change', this.formSubmitHandler);
          this.cartCheckoutButtonWrapper.addEventListener('click', this.formSubmitHandler);
          this.cartForm.addEventListener('submit', this.formSubmitHandler);
        }
      }

      formSubmitHandler() {
        const termsAccepted = document.querySelector(selectors$u.cartTermsCheckbox).checked;
        const termsError = document.querySelector(selectors$u.termsErrorMessage);

        // Disable form submit if terms and conditions are not accepted
        if (!termsAccepted) {
          if (document.querySelector(selectors$u.termsErrorMessage).length > 0) {
            return;
          }

          termsError.innerText = theme.strings.cartAcceptanceError;
          this.cartCheckoutButton.setAttribute(attributes$j.disabled, true);
          termsError.classList.add(classes$q.expanded);
        } else {
          termsError.classList.remove(classes$q.expanded);
          this.cartCheckoutButton.removeAttribute(attributes$j.disabled);
        }
      }

      /**
       * Cart event remove out of stock error
       *
       * @return  {Void}
       */

      formErrorsEvents(errorContainer) {
        const buttonErrorClose = errorContainer.querySelector(selectors$u.formCloseError);
        buttonErrorClose?.addEventListener('click', (e) => {
          e.preventDefault();

          if (errorContainer) {
            errorContainer.classList.remove(classes$q.visible);
          }
        });
      }

      /**
       * Get response from the cart
       *
       * @return  {Void}
       */

      getCart() {
        fetch(theme.routes.cart_url + '?section_id=api-cart-items')
          .then(this.cartErrorsHandler)
          .then((response) => response.text())
          .then((response) => {
            const element = document.createElement('div');
            element.innerHTML = response;

            const cleanResponse = element.querySelector(selectors$u.apiContent);
            this.build(cleanResponse);
          })
          .catch((error) => console.log(error));
      }

      /**
       * Add item(s) to the cart and show the added item(s)
       *
       * @param   {String}  formData
       * @param   {DOM Element}  button
       *
       * @return  {Void}
       */

      addToCart(formData, button) {
        if (this.cart) {
          this.cart.classList.add(classes$q.loading);
        }

        const quickAddHolder = button?.closest(selectors$u.quickAddHolder);

        if (button) {
          button.classList.add(classes$q.loading);
          button.disabled = true;
        }

        if (quickAddHolder) {
          quickAddHolder.classList.add(classes$q.visible);
        }

        fetch(theme.routes.cart_add_url, {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Accept: 'application/javascript',
          },
          body: formData,
        })
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              this.addToCartError(response, button);

              if (button) {
                button.classList.remove(classes$q.loading);
                button.disabled = false;
              }

              return;
            }

            if (this.cart) {
              if (button) {
                button.classList.remove(classes$q.loading);
                button.classList.add(classes$q.added);

                if (button.hasAttribute('data-add-to-cart-bundle') && document.querySelector('product-upsell-popup') !== null) {
                  document.querySelector('product-upsell-popup').modalOpen();
                }
                button.dispatchEvent(
                  new CustomEvent('theme:product:add', {
                    detail: {
                      response: response,
                      button: button,
                    },
                    bubbles: true,
                  })
                );
              }
              if (theme.settings.cartType === 'page') {
                window.location = theme.routes.cart_url;
              }
              this.getCart();
            } else {
              // Redirect to cart page if "Add to cart" is successful
              window.location = theme.routes.cart_url;
            }
          })
          .catch((error) => {
            this.addToCartError(error, button);
            this.enableCartButtons();
          });
      }

      /**
       * Update cart
       *
       * @param   {Object}  updateData
       *
       * @return  {Void}
       */

      updateCart(updateData = {}, currentItem = null) {
        this.cart.classList.add(classes$q.loading);

        let updatedQuantity = updateData.quantity;
        if (currentItem !== null) {
          if (updatedQuantity) {
            currentItem.classList.add(classes$q.loading);
          } else {
            currentItem.classList.add(classes$q.removed);
          }
        }
        this.disableCartButtons();

        const newItem = this.cart.querySelector(`[${attributes$j.item}="${updateData.id}"]`) || currentItem;
        const lineIndex = newItem?.hasAttribute(attributes$j.itemIndex) ? parseInt(newItem.getAttribute(attributes$j.itemIndex)) : 0;
        const itemTitle = newItem?.hasAttribute(attributes$j.itemTitle) ? newItem.getAttribute(attributes$j.itemTitle) : null;

        if (lineIndex === 0) return;

        const data = {
          line: lineIndex,
          quantity: updatedQuantity,
        };

        fetch(theme.routes.cart_change_url, {
          method: 'post',
          headers: {'Content-Type': 'application/json', Accept: 'application/json'},
          body: JSON.stringify(data),
        })
          .then((response) => {
            return response.text();
          })
          .then((state) => {
            const parsedState = JSON.parse(state);

            if (parsedState.errors) {
              this.cartUpdateFailed = true;
              this.updateErrorText(itemTitle);
              this.toggleErrorMessage();
              this.resetLineItem(currentItem);
              this.enableCartButtons();

              return;
            }

            this.getCart();
          })
          .catch((error) => {
            console.log(error);
            this.enableCartButtons();
          });
      }

      /**
       * Reset line item initial state
       *
       * @return  {Void}
       */
      resetLineItem(item) {
        const qtyInput = item.querySelector(selectors$u.qtyInput);
        const qty = qtyInput.getAttribute('value');
        qtyInput.value = qty;
        item.classList.remove(classes$q.loading);
      }

      /**
       * Disable cart buttons and inputs
       *
       * @return  {Void}
       */
      disableCartButtons() {
        const inputs = this.cart.querySelectorAll('input');
        const buttons = this.cart.querySelectorAll(`button, ${selectors$u.cartItemRemove}`);

        if (inputs.length) {
          inputs.forEach((item) => {
            item.classList.add(classes$q.disabled);
            item.blur();
            item.disabled = true;
          });
        }

        if (buttons.length) {
          buttons.forEach((item) => {
            item.setAttribute(attributes$j.disabled, true);
          });
        }
      }

      /**
       * Enable cart buttons and inputs
       *
       * @return  {Void}
       */
      enableCartButtons() {
        const inputs = this.cart.querySelectorAll('input');
        const buttons = this.cart.querySelectorAll(`button, ${selectors$u.cartItemRemove}`);

        if (inputs.length) {
          inputs.forEach((item) => {
            item.classList.remove(classes$q.disabled);
            item.disabled = false;
          });
        }

        if (buttons.length) {
          buttons.forEach((item) => {
            item.removeAttribute(attributes$j.disabled);
          });
        }

        this.cart.classList.remove(classes$q.loading);
      }

      /**
       * Update error text
       *
       * @param   {String}  itemTitle
       *
       * @return  {Void}
       */

      updateErrorText(itemTitle) {
        this.cartErrorHolder.querySelector(selectors$u.errorMessage).innerText = itemTitle;
      }

      /**
       * Toggle error message
       *
       * @return  {Void}
       */

      toggleErrorMessage() {
        if (!this.cartErrorHolder) return;

        this.cartErrorHolder.classList.toggle(classes$q.expanded, this.cartUpdateFailed);

        // Reset cart error events flag
        this.cartUpdateFailed = false;
      }

      /**
       * Handle errors
       *
       * @param   {Object}  response
       *
       * @return  {Object}
       */

      cartErrorsHandler(response) {
        if (!response.ok) {
          return response.json().then(function (json) {
            const e = new FetchError({
              status: response.statusText,
              headers: response.headers,
              json: json,
            });
            throw e;
          });
        }
        return response;
      }

      /**
       * Add to cart error handle
       *
       * @param   {Object}  data
       * @param   {DOM Element/Null} button
       *
       * @return  {Void}
       */

      addToCartError(data, button) {
        if (button !== null) {
          const outerContainer = button.closest(selectors$u.outerSection) || button.closest(selectors$u.quickAddHolder) || button.closest(selectors$u.quickAddModal);
          let errorContainer = outerContainer?.querySelector(selectors$u.formErrorsContainer);
          const buttonUpsellHolder = button.closest(selectors$u.quickAddHolder);

          if (buttonUpsellHolder && buttonUpsellHolder.querySelector(selectors$u.formErrorsContainer)) {
            errorContainer = buttonUpsellHolder.querySelector(selectors$u.formErrorsContainer);
          }

          if (errorContainer) {
            let errorMessage = `${data.message}: ${data.description}`;

            if (data.message == data.description) {
              errorMessage = data.message;
            }

            errorContainer.innerHTML = `<div class="errors">${errorMessage}<button type="button" class="errors__close" data-close-error><svg aria-hidden="true" focusable="false" role="presentation" width="24px" height="24px" stroke-width="1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="icon icon-cancel"><path d="M6.758 17.243L12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div>`;
            errorContainer.classList.add(classes$q.visible);
            this.formErrorsEvents(errorContainer);
          }

          button.dispatchEvent(
            new CustomEvent('theme:product:add-error', {
              detail: {
                response: data,
                button: button,
              },
              bubbles: true,
            })
          );
        }

        const quickAddHolder = button?.closest(selectors$u.quickAddHolder);

        if (quickAddHolder) {
          quickAddHolder.dispatchEvent(
            new CustomEvent('theme:cart:error', {
              bubbles: true,
              detail: {
                message: data.message,
                description: data.description,
                holder: quickAddHolder,
              },
            })
          );
        }

        this.cart?.classList.remove(classes$q.loading);
      }

      /**
       * Add product to cart events
       *
       * @return  {Void}
       */
      productAddCallback(event) {
        let buttons = [];
        let quickAddHolder = null;
        const hasError = event.type == 'theme:product:add-error';
        const buttonATC = event.detail.button;
        const cartBarButtonATC = document.querySelector(selectors$u.cartBarAdd);

        buttons.push(buttonATC);
        quickAddHolder = buttonATC.closest(selectors$u.quickAddHolder);

        if (cartBarButtonATC) {
          buttons.push(cartBarButtonATC);
        }

        buttons.forEach((button) => {
          button.classList.remove(classes$q.loading);
          if (!hasError) {
            button.classList.add(classes$q.added);
          }
        });

        setTimeout(() => {
          buttons.forEach((button) => {
            button.classList.remove(classes$q.added);
            const isVariantUnavailable =
              button.closest(selectors$u.formWrapper)?.classList.contains(classes$q.variantSoldOut) || button.closest(selectors$u.formWrapper)?.classList.contains(classes$q.variantUnavailable);

            if (!isVariantUnavailable) {
              button.disabled = false;
            }
          });

          quickAddHolder?.classList.remove(classes$q.visible);
        }, 1000);
      }

      /**
       * Toggle classes on different containers and messages
       *
       * @return  {Void}
       */

      toggleClassesOnContainers() {
        const hasItemsInCart = this.hasItemsInCart();

        this.cart.classList.toggle(classes$q.empty, !hasItemsInCart);

        if (!hasItemsInCart && this.cartDrawer) {
          setTimeout(() => {
            this.a11y.trapFocus(this.cartDrawer, {
              elementToFocus: this.cartDrawer.querySelector(selectors$u.cartDrawerClose),
            });
          }, 100);
        }
      }

      /**
       * Build cart depends on results
       *
       * @param   {Object}  data
       *
       * @return  {Void}
       */

      build(data) {
        const cartItemsData = data.querySelector(selectors$u.apiLineItems);
        const cartEmptyData = Boolean(cartItemsData === null);
        const priceData = data.querySelector(selectors$u.apiCartPrice);
        const cartTotal = data.querySelector(selectors$u.cartTotal);

        if (this.priceHolder && priceData) {
          this.priceHolder.innerHTML = priceData.innerHTML;
        }

        if (cartEmptyData) {
          this.itemsHolder.innerHTML = data.innerHTML;
        } else {
          this.itemsHolder.innerHTML = cartItemsData.innerHTML;
        }

        this.newTotalItems = cartItemsData && cartItemsData.querySelectorAll(selectors$u.item).length ? cartItemsData.querySelectorAll(selectors$u.item).length : 0;
        this.subtotal = cartTotal && cartTotal.hasAttribute(attributes$j.cartTotal) ? parseInt(cartTotal.getAttribute(attributes$j.cartTotal)) : 0;
        this.cartCount = this.getCartItemCount();

        document.dispatchEvent(
          new CustomEvent('theme:cart:change', {
            bubbles: true,
            detail: {
              cartCount: this.cartCount,
            },
          })
        );

        // Update cart total price
        this.cartTotal.innerHTML = this.subtotal === 0 ? window.theme.strings.free : window.theme.formatMoney(this.subtotal, theme.moneyWithCurrencyFormat);

        if (this.totalItems !== this.newTotalItems) {
          this.totalItems = this.newTotalItems;

          this.toggleClassesOnContainers();
        }

        // Add class "is-updated" line items holder to reduce cart items animation delay via CSS variables
        if (this.cartDrawer?.classList.contains(classes$q.open)) {
          this.cart.classList.add(classes$q.updated);
        }

        // Remove cart loading class
        this.cart.classList.remove(classes$q.loading);

        // Prepare empty cart buttons for animation
        if (!this.hasItemsInCart()) {
          this.cartEmpty.querySelectorAll(selectors$u.animation).forEach((item) => {
            item.classList.remove(classes$q.animated);
          });
        }

        this.closest('collapsible-elements')?.init();

        this.renderComplementaryProducts();
        this.freeShippingMessageHandle(this.subtotal);
        this.updatePromotionBlock();
        this.cartRemoveEvents();
        this.cartUpdateEvents();
        this.toggleErrorMessage();
        this.enableCartButtons();
        this.updateProgress();
        this.animateItems();

        document.dispatchEvent(
          new CustomEvent('theme:product:added', {
            bubbles: true,
          })
        );
      }

      /**
       * render complementary products
       *
       * @return  {Void}
       */

      updatePromotionBlock() {
        const sectionId = this.closest(selectors$u.outerSection).dataset.sectionId;
        const cartPromotionBlock = document.querySelector('[data-cart-promotion-block]');

        if (!sectionId) return;
        if (!cartPromotionBlock) return;

        fetch(`sections?section_id=${sectionId}`)
          .then(this.cartErrorsHandler)
          .then((response) => response.text())
          .then((response) => {
            // const promotionBlock = new DOMParser().parseFromString(response, 'text/html').querySelector(selectors.cartPromotionBlock).innerHTML;
            const element = document.createElement('div');
            element.innerHTML = response;
            const promotionBlock = element.querySelector(selectors$u.cartPromotionBlock);

            if (promotionBlock && cartPromotionBlock) {
              cartPromotionBlock.innerHTML = promotionBlock.innerHTML;
            }
          })
          .catch((error) => console.log(error));
      }

      renderComplementaryProducts() {
        const sectionId = this.closest(selectors$u.outerSection).dataset.sectionId;

        if (!sectionId) return;
        if (!this.cartComplementaryProducts) return;

        fetch(`sections?section_id=${sectionId}`)
          .then(this.cartErrorsHandler)
          .then((response) => response.text())
          .then((response) => {
            const element = document.createElement('div');
            element.innerHTML = response;

            const cartComplementaryProducts = element.querySelector(selectors$u.cartComplementaryProducts);

            if (this.cartComplementaryProducts && cartComplementaryProducts) {
              this.cartComplementaryProducts.innerHTML = cartComplementaryProducts.innerHTML;

              // init swiper after render
              this.cartComplementaryProducts.querySelector('swiper-container')?.initialize();

              // init collapsible-elements after render
              this.closest('cart-drawer')?.querySelector(`[data-drawer-body-collapsible-element="${sectionId}"]`)?.init();
            }
          })
          .catch((error) => console.log(error));
      }

      /**
       * Get cart item count
       *
       * @return  {Void}
       */

      getCartItemCount() {
        return Array.from(this.cart.querySelectorAll(selectors$u.qtyInput)).reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);
      }

      /**
       * Check for items in the cart
       *
       * @return  {Void}
       */

      hasItemsInCart() {
        return this.totalItems > 0;
      }

      /**
       * Show/hide free shipping message
       *
       * @param   {Number}  total
       *
       * @return  {Void}
       */

      freeShippingMessageHandle(total) {
        if (!this.freeShipping.length) return;

        this.freeShipping.forEach((message) => {
          const hasQualifiedShippingMessage = message.hasAttribute(attributes$j.freeShipping) && message.getAttribute(attributes$j.freeShipping) === 'true' && total >= 0;
          message.classList.toggle(classes$q.success, hasQualifiedShippingMessage && total >= this.freeShippingLimit);
        });
      }

      /**
       * Update progress when update cart
       *
       * @return  {Void}
       */

      updateProgress() {
        this.freeShipping = document.querySelectorAll(selectors$u.freeShipping);

        if (!this.freeShipping.length) return;

        const percentValue = isNaN(this.subtotal / this.freeShippingLimit) ? 100 : this.subtotal / this.freeShippingLimit;
        const percent = Math.min(percentValue * 100, 100);
        const dashoffset = this.circumference - ((percent / 100) * this.circumference) / 2;
        const leftToSpend = window.theme.formatMoney(this.freeShippingLimit - this.subtotal, theme.moneyFormat);

        this.freeShipping.forEach((item) => {
          const progressBar = item.querySelector(selectors$u.freeShippingProgress);
          const progressGraph = item.querySelector(selectors$u.freeShippingGraph);
          const leftToSpendMessage = item.querySelector(selectors$u.leftToSpend);

          if (leftToSpendMessage) {
            leftToSpendMessage.innerHTML = leftToSpend.replace('.00', '');
          }

          // Set progress bar value
          if (progressBar) {
            progressBar.value = percent;
          }

          // Set circle progress
          if (progressGraph) {
            progressGraph.style.setProperty('--stroke-dashoffset', `${dashoffset}`);
          }
        });
      }

      /**
       * Remove initially added AOS classes to allow animation on cart drawer open
       *
       * @return  {Void}
       */
      resetAnimatedItems() {
        this.cart.querySelectorAll(selectors$u.animation).forEach((item) => {
          item.classList.remove(classes$q.animated);
          item.classList.remove(classes$q.hiding);
        });
      }

      /**
       * Cart elements opening animation
       *
       * @return  {Void}
       */
      animateItems(e) {
        requestAnimationFrame(() => {
          let cart = this.cart;

          if (e && e.detail && e.detail.target) {
            cart = e.detail.target;
          }

          cart?.querySelectorAll(selectors$u.animation).forEach((item) => {
            item.classList.add(classes$q.animated);
          });
        });
      }
    }

    if (!customElements.get('cart-items')) {
      customElements.define('cart-items', CartItems);
    }

    const attributes$i = {
      count: 'data-cart-count',
      limit: 'data-limit',
    };

    class CartCount extends HTMLElement {
      constructor() {
        super();

        this.cartCount = null;
        this.limit = this.getAttribute(attributes$i.limit);
        this.onCartChangeCallback = this.onCartChange.bind(this);
      }

      connectedCallback() {
        document.addEventListener('theme:cart:change', this.onCartChangeCallback);
      }

      disconnectedCallback() {
        document.addEventListener('theme:cart:change', this.onCartChangeCallback);
      }

      onCartChange(event) {
        this.cartCount = event.detail.cartCount;
        this.update();
      }

      update() {
        if (this.cartCount !== null) {
          this.setAttribute(attributes$i.count, this.cartCount);
          let countValue = this.cartCount;

          if (this.limit && this.cartCount >= this.limit) {
            countValue = '9+';
          }

          this.innerText = countValue;
        }
      }
    }

    if (!customElements.get('cart-count')) {
      customElements.define('cart-count', CartCount);
    }

    function appendCartItems() {
      if (document.querySelector('cart-items')) return;

      // Add cart items tag when the cart drawer section is missing so we can still run the JS associated with the error handling
      const cartItems = document.createElement('cart-items');
      document.body.appendChild(cartItems);
    }

    const classes$p = {
      open: 'is-open',
      bodyOpen: 'cart-is-open',
      closing: 'is-closing',
      duplicate: 'drawer--duplicate',
      drawerEditorError: 'drawer-editor-error',
    };

    const selectors$t = {
      cartDrawer: 'cart-drawer',
      cartDrawerClose: '[data-cart-drawer-close]',
      cartDrawerSection: '[data-section-type="cart-drawer"]',
      cartDrawerInner: '[data-cart-drawer-inner]',
      shopifySection: '.shopify-section',
    };

    const attributes$h = {
      drawerUnderlay: 'data-drawer-underlay',
    };

    class CartDrawer extends HTMLElement {
      constructor() {
        super();

        this.cartDrawerIsOpen = false;

        this.cartDrawerClose = this.querySelector(selectors$t.cartDrawerClose);
        this.cartDrawerInner = this.querySelector(selectors$t.cartDrawerInner);
        this.openCartDrawer = this.openCartDrawer.bind(this);
        this.closeCartDrawer = this.closeCartDrawer.bind(this);
        this.toggleCartDrawer = this.toggleCartDrawer.bind(this);
        this.openCartDrawerOnProductAdded = this.openCartDrawerOnProductAdded.bind(this);
        this.openCartDrawerOnSelect = this.openCartDrawerOnSelect.bind(this);
        this.closeCartDrawerOnDeselect = this.closeCartDrawerOnDeselect.bind(this);
        this.cartDrawerSection = this.closest(selectors$t.shopifySection);
        this.a11y = window.theme.a11y;

        this.closeCartEvents();
        this.checkUrl();
      }

      connectedCallback() {
        const drawerSection = this.closest(selectors$t.shopifySection);

        /* Prevent duplicated cart drawers */
        if (window.theme.hasCartDrawer) {
          if (!window.Shopify.designMode) {
            drawerSection.remove();
            return;
          } else {
            const errorMessage = document.createElement('div');
            errorMessage.classList.add(classes$p.drawerEditorError);
            errorMessage.innerText = 'Cart drawer section already exists.';

            if (!this.querySelector(`.${classes$p.drawerEditorError}`)) {
              this.querySelector(selectors$t.cartDrawerInner).append(errorMessage);
            }

            this.classList.add(classes$p.duplicate);
          }
        }

        window.theme.hasCartDrawer = true;

        this.addEventListener('theme:cart-drawer:show', this.openCartDrawer);
        document.addEventListener('theme:cart:toggle', this.toggleCartDrawer);
        document.addEventListener('theme:quick-add:open', this.closeCartDrawer);
        document.addEventListener('theme:product:added', this.openCartDrawerOnProductAdded);
        document.addEventListener('shopify:block:select', this.openCartDrawerOnSelect);
        document.addEventListener('shopify:section:select', this.openCartDrawerOnSelect);
        document.addEventListener('shopify:section:deselect', this.closeCartDrawerOnDeselect);

        // Add hashchange event listener
        window.addEventListener('hashchange', (e) => this.onHashChange(e));
      }

      disconnectedCallback() {
        document.removeEventListener('theme:product:added', this.openCartDrawerOnProductAdded);
        document.removeEventListener('theme:cart:toggle', this.toggleCartDrawer);
        document.removeEventListener('theme:quick-add:open', this.closeCartDrawer);
        document.removeEventListener('shopify:block:select', this.openCartDrawerOnSelect);
        document.removeEventListener('shopify:section:select', this.openCartDrawerOnSelect);
        document.removeEventListener('shopify:section:deselect', this.closeCartDrawerOnDeselect);

        // Remove hashchange event listener
        window.removeEventListener('hashchange', () => this.onHashChange);

        if (document.querySelectorAll(selectors$t.cartDrawer).length <= 1) {
          window.theme.hasCartDrawer = false;
        }

        appendCartItems();
      }

      /**
       * Handle URL hash changes
       *
       * @param {Event} event - The hashchange event
       * @return {Void}
       */
      onHashChange(event) {
        if (window.location.hash === '#cart') {
          if (!this.cartDrawerIsOpen) {
            this.openCartDrawer();
          }
        } else {
          if (this.cartDrawerIsOpen) {
            this.closeCartDrawer();
          }
        }
      }

      /**
       * Open cart drawer when product is added to cart
       *
       * @return  {Void}
       */
      openCartDrawerOnProductAdded() {
        let productUpsellPopup = document.querySelector('product-upsell-popup dialog')?.hasAttribute('open');
        if (!this.cartDrawerIsOpen && !productUpsellPopup) {
          this.openCartDrawer();
        }
      }

      /**
       * Open cart drawer on block or section select
       *
       * @return  {Void}
       */
      openCartDrawerOnSelect(e) {
        const cartDrawerSection = e.target.querySelector(selectors$t.shopifySection) || e.target.closest(selectors$t.shopifySection) || e.target;

        if (cartDrawerSection === this.cartDrawerSection) {
          this.openCartDrawer(true);
        }
      }

      /**
       * Close cart drawer on section deselect
       *
       * @return  {Void}
       */
      closeCartDrawerOnDeselect() {
        if (this.cartDrawerIsOpen) {
          this.closeCartDrawer();
        }
      }

      /**
       * Open cart drawer and add class on body
       *
       * @return  {Void}
       */

      openCartDrawer(forceOpen = false) {
        if (!forceOpen && this.classList.contains(classes$p.duplicate)) return;

        this.cartDrawerIsOpen = true;

        // Add #cart to URL without page reload
        if (window.location.hash !== '#cart') {
          window.history.pushState(null, null, `${window.location.pathname}${window.location.search}#cart`);
        }

        this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);
        document.body.addEventListener('click', this.onBodyClickEvent);
        document.body.classList.add(classes$p.bodyOpen);

        document.dispatchEvent(
          new CustomEvent('theme:cart-drawer:open', {
            detail: {
              target: this,
            },
            bubbles: true,
          })
        );
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));

        this.classList.add(classes$p.open);

        // Observe Additional Checkout Buttons
        this.observeAdditionalCheckoutButtons();

        window.theme.waitForAnimationEnd(this.cartDrawerInner).then(() => {
          this.a11y.trapFocus(this, {
            elementToFocus: this.querySelector(selectors$t.cartDrawerClose),
          });
        });
      }

      /**
       * Close cart drawer and remove class on body
       *
       * @return  {Void}
       */

      closeCartDrawer() {
        if (!this.classList.contains(classes$p.open)) return;

        this.classList.add(classes$p.closing);
        this.classList.remove(classes$p.open);

        this.cartDrawerIsOpen = false;
        // Remove #cart from URL
        if (window.location.hash === '#cart') {
          window.history.pushState(null, null, window.location.pathname + window.location.search);
        }

        document.dispatchEvent(
          new CustomEvent('theme:cart-drawer:close', {
            bubbles: true,
          })
        );

        this.a11y.removeTrapFocus();
        this.a11y.autoFocusLastElement();

        document.body.removeEventListener('click', this.onBodyClickEvent);
        document.body.classList.remove(classes$p.bodyOpen);
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));

        window.theme.waitForAnimationEnd(this.cartDrawerInner).then(() => {
          this.classList.remove(classes$p.closing);
        });
      }

      /**
       * Toggle cart drawer
       *
       * @return  {Void}
       */

      toggleCartDrawer() {
        if (!this.cartDrawerIsOpen) {
          this.openCartDrawer();
        } else {
          this.closeCartDrawer();
        }
      }

      /**
       * Event click to element to close cart drawer
       *
       * @return  {Void}
       */

      closeCartEvents() {
        this.cartDrawerClose.addEventListener('click', (e) => {
          e.preventDefault();
          this.closeCartDrawer();
        });

        this.addEventListener('keyup', (e) => {
          if (e.code === 'Escape') {
            this.closeCartDrawer();
          }
        });
      }

      onBodyClick(e) {
        if (e.target.hasAttribute(attributes$h.drawerUnderlay)) this.closeCartDrawer();
      }

      observeAdditionalCheckoutButtons() {
        // identify an element to observe
        const additionalCheckoutButtons = this.querySelector(selectors$t.additionalCheckoutButtons);
        if (additionalCheckoutButtons) {
          // create a new instance of `MutationObserver` named `observer`,
          // passing it a callback function
          const observer = new MutationObserver(() => {
            this.a11y.trapFocus(this, {
              elementToFocus: this.querySelector(selectors$t.cartDrawerClose),
            });
            observer.disconnect();
          });

          // call `observe()` on that MutationObserver instance,
          // passing it the element to observe, and the options object
          observer.observe(additionalCheckoutButtons, {subtree: true, childList: true});
        }
      }

      checkUrl() {
        if (window.location.hash === '#cart') {
          this.openCartDrawer();
        }

        // const searchParams = new URLSearchParams(window.location.search);
        //
        // if (!searchParams.has('cart')) return;

        // searchParams.delete('cart');
        //
        // const deletePathName = searchParams.toString().length ? `?${searchParams.toString()}` : '' ;
        //
        // const newUrl = `${window.location.origin}${window.theme.routes.root}${deletePathName}`;
        // window.history.pushState(null, null, newUrl);

        // this.openCartDrawer();
      }
    }

    if (!customElements.get('cart-drawer')) {
      customElements.define('cart-drawer', CartDrawer);
    }

    const selectors$s = {
      collapsible: '[data-collapsible]',
      trigger: '[data-collapsible-trigger]',
      body: '[data-collapsible-body]',
      content: '[data-collapsible-content]',
    };

    const attributes$g = {
      desktop: 'desktop',
      disabled: 'disabled',
      mobile: 'mobile',
      open: 'open',
      single: 'single',
      scrollToContent: 'data-scroll-to-content',
    };

    class CollapsibleElements extends HTMLElement {
      constructor() {
        super();

        this.collapsibles = this.querySelectorAll(selectors$s.collapsible);
        this.single = this.hasAttribute(attributes$g.single);
        this.toggle = this.toggle.bind(this);
      }

      connectedCallback() {
        this.toggle();
        document.addEventListener('theme:resize:width', this.toggle);

        this.init();
      }

      init() {
        // renew variable since we may have rerendered them
        this.collapsibles = this.querySelectorAll(selectors$s.collapsible);

        this.collapsibles.forEach((collapsible) => {
          const trigger = collapsible.querySelector(selectors$s.trigger);
          const body = collapsible.querySelector(selectors$s.body);

          if (trigger && !trigger._collapsibleClick) {
            trigger._collapsibleClick = (e) => this.onCollapsibleClick(e);
            trigger.addEventListener('click', trigger._collapsibleClick);
          }

          if (body && !body._transitionHandler) {
            body._transitionHandler = (event) => {
              if (event.target !== body) return;
              if (collapsible.getAttribute(attributes$g.open) == 'true') {
                this.setBodyHeight(body, 'auto');
              } else if (collapsible.getAttribute(attributes$g.open) == 'false') {
                collapsible.removeAttribute(attributes$g.open);
                this.setBodyHeight(body, '');
              }
            };
            body.addEventListener('transitionend', body._transitionHandler);
          }
        });
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize:width', this.toggle);
        document.removeEventListener('theme:cart:refresh', this.onCartRefresh);

        this.querySelectorAll(selectors$s.trigger).forEach((trigger) => {
          if (trigger._collapsibleClick) {
            trigger.removeEventListener('click', trigger._collapsibleClick);
            trigger._collapsibleClick = null;
          }
        });

        this.querySelectorAll(selectors$s.body).forEach((body) => {
          if (body._transitionHandler) {
            body.removeEventListener('transitionend', body._transitionHandler);
            body._transitionHandler = null;
          }
        });
      }

      toggle() {
        const isDesktopView = !window.theme.isMobile();

        this.collapsibles.forEach((collapsible) => {
          if (!collapsible.hasAttribute(attributes$g.desktop) && !collapsible.hasAttribute(attributes$g.mobile)) return;

          const enableDesktop = collapsible.hasAttribute(attributes$g.desktop) ? collapsible.getAttribute(attributes$g.desktop) : 'true';
          const enableMobile = collapsible.hasAttribute(attributes$g.mobile) ? collapsible.getAttribute(attributes$g.mobile) : 'true';
          const isEligible = (isDesktopView && enableDesktop == 'true') || (!isDesktopView && enableMobile == 'true');
          const body = collapsible.querySelector(selectors$s.body);

          if (isEligible) {
            collapsible.removeAttribute(attributes$g.disabled);
            collapsible.querySelector(selectors$s.trigger).removeAttribute('tabindex');
            collapsible.removeAttribute(attributes$g.open);

            this.setBodyHeight(body, '');
          } else {
            collapsible.setAttribute(attributes$g.disabled, '');
            collapsible.setAttribute('open', true);
            collapsible.querySelector(selectors$s.trigger).setAttribute('tabindex', -1);
          }
        });
      }

      open(collapsible) {
        if (collapsible.getAttribute('open') == 'true') return;

        const body = collapsible.querySelector(selectors$s.body);
        const content = collapsible.querySelector(selectors$s.content);

        collapsible.setAttribute('open', true);

        this.setBodyHeight(body, content.offsetHeight);

        if (collapsible.hasAttribute(attributes$g.scrollToContent)) {
          setTimeout(() => content.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" }), 350);
        }
      }

      close(collapsible) {
        if (!collapsible.hasAttribute('open')) return;

        const body = collapsible.querySelector(selectors$s.body);
        const content = collapsible.querySelector(selectors$s.content);

        this.setBodyHeight(body, content.offsetHeight);

        collapsible.setAttribute('open', false);

        setTimeout(() => {
          requestAnimationFrame(() => {
            this.setBodyHeight(body, 0);
          });
        });
      }

      setBodyHeight(body, contentHeight) {
        body.style.height = contentHeight !== 'auto' && contentHeight !== '' ? `${contentHeight}px` : contentHeight;
      }

      onCollapsibleClick(event) {
        event.preventDefault();

        const trigger = event.target;
        const collapsible = trigger.closest(selectors$s.collapsible);

        // When we want only one item expanded at the same time
        if (this.single) {
          this.collapsibles.forEach((otherCollapsible) => {
            // if otherCollapsible has attribute open and it's not the one we clicked on, remove the open attribute
            if (otherCollapsible.hasAttribute(attributes$g.open) && otherCollapsible != collapsible) {
              requestAnimationFrame(() => {
                this.close(otherCollapsible);
              });
            }
          });
        }

        if (collapsible.hasAttribute(attributes$g.open)) {
          this.close(collapsible);
        } else {
          this.open(collapsible);
        }

        collapsible.dispatchEvent(
          new CustomEvent('theme:form:sticky', {
            bubbles: true,
            detail: {
              element: 'accordion',
            },
          })
        );
        collapsible.dispatchEvent(
          new CustomEvent('theme:collapsible:toggle', {
            bubbles: true,
          })
        );
      }
    }

    if (!customElements.get('collapsible-elements')) {
      customElements.define('collapsible-elements', CollapsibleElements);
    }

    const selectors$r = {
      deferredMediaButton: '[data-deferred-media-button]',
      media: 'video, model-viewer, iframe',
      youtube: '[data-host="youtube"]',
      vimeo: '[data-host="vimeo"]',
      template: 'template',
      video: 'video',
      productModel: 'product-model',
    };

    const attributes$f = {
      loaded: 'loaded',
      autoplay: 'autoplay',
    };

    class DeferredMedia extends HTMLElement {
      constructor() {
        super();

        const poster = this.querySelector(selectors$r.deferredMediaButton);
        poster?.addEventListener('click', this.loadContent.bind(this));
      }

      loadContent(focus = true) {
        this.pauseAllMedia();

        if (!this.getAttribute(attributes$f.loaded)) {
          const content = document.createElement('div');
          const templateContent = this.querySelector(selectors$r.template).content.firstElementChild.cloneNode(true);
          content.appendChild(templateContent);
          this.setAttribute(attributes$f.loaded, true);

          const mediaElement = this.appendChild(content.querySelector(selectors$r.media));
          if (focus) mediaElement.focus();
          if (mediaElement.nodeName == 'VIDEO' && mediaElement.getAttribute(attributes$f.autoplay)) {
            // Force autoplay on Safari browsers
            mediaElement.play();
          }
        }
      }

      pauseAllMedia() {
        document.querySelectorAll(selectors$r.youtube).forEach((video) => {
          video.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        });
        document.querySelectorAll(selectors$r.vimeo).forEach((video) => {
          video.contentWindow.postMessage('{"method":"pause"}', '*');
        });
        document.querySelectorAll(selectors$r.video).forEach((video) => video.pause());
        document.querySelectorAll(selectors$r.productModel).forEach((model) => {
          if (model.modelViewerUI) model.modelViewerUI.pause();
        });
      }
    }

    if (!customElements.get('deferred-media')) {
      customElements.define('deferred-media', DeferredMedia);
    }

    window.theme.DeferredMedia = window.theme.DeferredMedia || DeferredMedia;

    /*
      Observe whether or not elements are visible in their container.
      Used for sections with horizontal sliders built by native scrolling
    */

    const classes$o = {
      visible: 'is-visible',
    };

    class IsInView {
      constructor(container, itemSelector) {
        if (!container || !itemSelector) return;

        this.observer = null;
        this.container = container;
        this.itemSelector = itemSelector;

        this.init();
      }

      init() {
        const options = {
          root: this.container,
          threshold: [0.01, 0.5, 0.75, 0.99],
        };

        this.observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.intersectionRatio >= 0.99) {
              entry.target.classList.add(classes$o.visible);
            } else {
              entry.target.classList.remove(classes$o.visible);
            }
          });
        }, options);

        this.container.querySelectorAll(this.itemSelector)?.forEach((item) => {
          this.observer.observe(item);
        });
      }

      destroy() {
        this.observer.disconnect();
      }
    }

    const classes$n = {
      dragging: 'is-dragging',
      enabled: 'is-enabled',
      scrolling: 'is-scrolling',
      visible: 'is-visible',
    };

    const selectors$q = {
      image: 'img, svg',
      productImage: '[data-product-image]',
      slide: '[data-grid-item]',
      slider: '[data-grid-slider]',
    };

    class DraggableSlider {
      constructor(sliderElement) {
        this.slider = sliderElement;
        this.isDown = false;
        this.startX = 0;
        this.scrollLeft = 0;
        this.velX = 0;
        this.scrollAnimation = null;
        this.isScrolling = false;
        this.duration = 800; // Change this value if you want to increase or decrease the velocity

        this.scrollStep = this.scrollStep.bind(this);
        this.scrollToSlide = this.scrollToSlide.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseWheel = this.handleMouseWheel.bind(this);

        this.slider.addEventListener('mousedown', this.handleMouseDown);
        this.slider.addEventListener('mouseleave', this.handleMouseLeave);
        this.slider.addEventListener('mouseup', this.handleMouseUp);
        this.slider.addEventListener('mousemove', this.handleMouseMove);
        this.slider.addEventListener('wheel', this.handleMouseWheel, {passive: true});

        this.slider.classList.add(classes$n.enabled);
      }

      handleMouseDown(e) {
        e.preventDefault();
        this.isDown = true;
        this.startX = e.pageX - this.slider.offsetLeft;
        this.scrollLeft = this.slider.scrollLeft;
        this.cancelMomentumTracking();
      }

      handleMouseLeave() {
        if (!this.isDown) return;
        this.isDown = false;
        this.beginMomentumTracking();
      }

      handleMouseUp() {
        this.isDown = false;
        this.beginMomentumTracking();
      }

      handleMouseMove(e) {
        if (!this.isDown) return;
        e.preventDefault();

        const x = e.pageX - this.slider.offsetLeft;
        const ratio = 1; // Increase the number to make it scroll-fast
        const walk = (x - this.startX) * ratio;
        const prevScrollLeft = this.slider.scrollLeft;
        const direction = walk > 0 ? 1 : -1;

        this.slider.classList.add(classes$n.dragging, classes$n.scrolling);
        this.slider.scrollLeft = this.scrollLeft - walk;

        if (this.slider.scrollLeft !== prevScrollLeft) {
          this.velX = this.slider.scrollLeft - prevScrollLeft || direction;
        }
      }

      handleMouseWheel() {
        this.cancelMomentumTracking();
        this.slider.classList.remove(classes$n.scrolling);
      }

      beginMomentumTracking() {
        this.isScrolling = false;
        this.slider.classList.remove(classes$n.dragging);
        this.cancelMomentumTracking();
        this.scrollToSlide();
      }

      cancelMomentumTracking() {
        cancelAnimationFrame(this.scrollAnimation);
      }

      scrollToSlide() {
        if (!this.velX && !this.isScrolling) return;

        const slide = this.slider.querySelector(`${selectors$q.slide}.${classes$n.visible}`);
        if (!slide) return;

        const gap = parseInt(window.getComputedStyle(slide).marginRight) || 0;
        const slideWidth = slide.offsetWidth + gap;
        const targetPosition = slide.offsetLeft;
        const direction = this.velX > 0 ? 1 : -1;
        const slidesToScroll = Math.floor(Math.abs(this.velX) / 100) || 1;

        this.startPosition = this.slider.scrollLeft;
        this.distance = targetPosition - this.startPosition;
        this.startTime = performance.now();
        this.isScrolling = true;

        // Make sure it will move to the next slide if you don't drag far enough
        if (direction < 0 && this.velX < slideWidth) {
          this.distance -= slideWidth * slidesToScroll;
        }

        // Make sure it will move to the previous slide if you don't drag far enough
        if (direction > 0 && this.velX < slideWidth) {
          this.distance += slideWidth * slidesToScroll;
        }

        // Run scroll animation
        this.scrollAnimation = requestAnimationFrame(this.scrollStep);
      }

      scrollStep() {
        const currentTime = performance.now() - this.startTime;
        const scrollPosition = parseFloat(this.easeOutCubic(Math.min(currentTime, this.duration))).toFixed(1);

        this.slider.scrollLeft = scrollPosition;

        if (currentTime < this.duration) {
          this.scrollAnimation = requestAnimationFrame(this.scrollStep);
        } else {
          this.slider.classList.remove(classes$n.scrolling);

          // Reset velocity
          this.velX = 0;
          this.isScrolling = false;
        }
      }

      easeOutCubic(t) {
        t /= this.duration;
        t--;
        return this.distance * (t * t * t + 1) + this.startPosition;
      }

      destroy() {
        this.slider.classList.remove(classes$n.enabled);
        this.slider.removeEventListener('mousedown', this.handleMouseDown);
        this.slider.removeEventListener('mouseleave', this.handleMouseLeave);
        this.slider.removeEventListener('mouseup', this.handleMouseUp);
        this.slider.removeEventListener('mousemove', this.handleMouseMove);
        this.slider.removeEventListener('wheel', this.handleMouseWheel);
      }
    }

    const selectors$p = {
      buttonArrow: '[data-button-arrow]',
      collectionImage: '[data-collection-image]',
      columnImage: '[data-column-image]',
      productImage: '[data-product-image]',
      slide: '[data-grid-item]',
      slider: '[data-grid-slider]',
    };

    const attributes$e = {
      buttonPrev: 'data-button-prev',
      buttonNext: 'data-button-next',
      alignArrows: 'align-arrows',
    };

    const classes$m = {
      arrows: 'slider__arrows',
      visible: 'is-visible',
      scrollSnapDisabled: 'scroll-snap-disabled',
    };

    if (!customElements.get('grid-slider')) {
      customElements.define(
        'grid-slider',

        class GridSlider extends HTMLElement {
          constructor() {
            super();

            this.isInitialized = false;
            this.draggableSlider = null;
            this.positionArrows = this.positionArrows.bind(this);
            this.onButtonArrowClick = (e) => this.buttonArrowClickEvent(e);
            this.slidesObserver = null;
            this.firstLastSlidesObserver = null;
            this.isDragging = false;
            this.toggleSlider = this.toggleSlider.bind(this);
          }

          connectedCallback() {
            this.init();
            this.addEventListener('theme:grid-slider:init', this.init);
          }

          init() {
            this.slider = this.querySelector(selectors$p.slider);
            this.slides = this.querySelectorAll(selectors$p.slide);
            this.buttons = this.querySelectorAll(selectors$p.buttonArrow);
            this.slider.classList.add(classes$m.scrollSnapDisabled);
            this.toggleSlider();
            document.addEventListener('theme:resize:width', ()=> {
              this.toggleSlider();
            });

            window.theme
              .waitForAllAnimationsEnd(this)
              .then(() => {
                this.slider.classList.remove(classes$m.scrollSnapDisabled);
              })
              .catch(() => {
                this.slider.classList.remove(classes$m.scrollSnapDisabled);
              });
          }

          toggleSlider() {
            const sliderWidth = this.slider.getBoundingClientRect().width;
            const slidesWidth = this.getSlidesWidth();
            const isEnabled = sliderWidth < slidesWidth;
            // if (isEnabled && (!window.theme.isMobile() || !window.theme.touch)) {}
            if (isEnabled) {
              this.initArrows();

              if (this.isInitialized) return;

              this.slidesObserver = new IsInView(this.slider, selectors$p.slide);

              this.isInitialized = true;

              // Create an instance of DraggableSlider
              this.draggableSlider = new DraggableSlider(this.slider);
            } else {
              this.destroy();
            }
          }

          initArrows() {
            // Create arrow buttons if don't exist
            if (!this.buttons.length) {
              const buttonsWrap = document.createElement('div');
              buttonsWrap.classList.add(classes$m.arrows);
              buttonsWrap.innerHTML = theme.sliderArrows.prev + theme.sliderArrows.next;

              // Append buttons outside the slider element
              this.append(buttonsWrap);
              this.buttons = this.querySelectorAll(selectors$p.buttonArrow);
              this.buttonPrev = this.querySelector(`[${attributes$e.buttonPrev}]`);
              this.buttonNext = this.querySelector(`[${attributes$e.buttonNext}]`);
            }

            this.toggleArrowsObserver();

            if (this.hasAttribute(attributes$e.alignArrows)) {
              this.positionArrows();
              this.arrowsResizeObserver();
            }

            this.buttons.forEach((buttonArrow) => {
              buttonArrow.addEventListener('click', this.onButtonArrowClick);
            });
          }

          buttonArrowClickEvent(e) {
            e.preventDefault();

            const firstVisibleSlide = this.slider.querySelector(`${selectors$p.slide}.${classes$m.visible}`);
            let slide = null;

            if (e.target.hasAttribute(attributes$e.buttonPrev)) {
              slide = firstVisibleSlide?.previousElementSibling;
            }

            if (e.target.hasAttribute(attributes$e.buttonNext)) {
              slide = firstVisibleSlide?.nextElementSibling;
            }

            this.goToSlide(slide);
          }

          removeArrows() {
            this.querySelector(`.${classes$m.arrows}`)?.remove();
          }

          // Go to prev/next slide on arrow click
          goToSlide(slide) {
            if (!slide) return;

            this.slider.scrollTo({
              top: 0,
              left: slide.offsetLeft,
              behavior: 'smooth',
            });
          }

          getSlidesWidth() {
            return this.slider.querySelector(selectors$p.slide)?.getBoundingClientRect().width * this.slider.querySelectorAll(selectors$p.slide).length;
          }

          toggleArrowsObserver() {
            // Add disable class/attribute on prev/next button

            if (this.buttonPrev && this.buttonNext) {
              const slidesCount = this.slides.length;
              const firstSlide = this.slides[0];
              const lastSlide = this.slides[slidesCount - 1];

              const config = {
                attributes: true,
                childList: false,
                subtree: false,
              };

              const callback = (mutationList) => {
                for (const mutation of mutationList) {
                  if (mutation.type === 'attributes') {
                    const slide = mutation.target;
                    const isDisabled = Boolean(slide.classList.contains(classes$m.visible));

                    if (slide == firstSlide) {
                      this.buttonPrev.disabled = isDisabled;
                    }

                    if (slide == lastSlide) {
                      this.buttonNext.disabled = isDisabled;
                    }
                  }
                }
              };

              if (firstSlide && lastSlide) {
                this.firstLastSlidesObserver = new MutationObserver(callback);
                this.firstLastSlidesObserver.observe(firstSlide, config);
                this.firstLastSlidesObserver.observe(lastSlide, config);
              }
            }
          }

          positionArrows() {
            const targetElement =
              this.slider.querySelector(selectors$p.productImage) || this.slider.querySelector(selectors$p.collectionImage) || this.slider.querySelector(selectors$p.columnImage) || this.slider;

            if (!targetElement) return;

            this.style.setProperty('--button-position', `${targetElement.clientHeight / 2}px`);
          }

          arrowsResizeObserver() {
            document.addEventListener('theme:resize:width', this.positionArrows);
          }

          disconnectedCallback() {
            this.destroy();
            document.removeEventListener('theme:resize:width', this.toggleSlider);
          }

          destroy() {
            this.isInitialized = false;
            this.draggableSlider?.destroy();
            this.draggableSlider = null;
            this.slidesObserver?.destroy();
            this.slidesObserver = null;
            this.removeArrows();
            this.buttons = [];

            document.removeEventListener('theme:resize:width', this.positionArrows);
          }
        }
      );
    }

    /*
      Observe whether or not there are open modals that require scroll lock
    */

    window.theme.hasOpenModals = function () {
      const openModals = Boolean(document.querySelectorAll('dialog[open][data-scroll-lock-required]').length);
      const openDrawers = Boolean(document.querySelectorAll('.drawer.is-open').length);

      return openModals || openDrawers;
    };

    const selectors$o = {
      cartDrawer: 'cart-drawer',
      cartToggleButton: '[data-cart-toggle]',
      deadLink: '.navlink[href="#"]',
      desktop: '[data-header-desktop]',
      firstSectionOverlayHeader: '.main-content > .shopify-section.section-overlay-header:first-of-type',
      pageHeader: '.page-header',
      preventTransparent: '[data-prevent-transparent-header]',
      style: 'data-header-style',
      widthContent: '[data-child-takes-space]',
      widthContentWrapper: '[data-takes-space-wrapper]',
      wrapper: '[data-header-wrapper]',
    };

    const classes$l = {
      clone: 'js__header__clone',
      firstSectionOverlayHeader: 'has-first-section-overlay-header',
      headerGroup: 'shopify-section-group-header-group',
      showMobileClass: 'js__show__mobile',
      sticky: 'has-header-sticky',
      stuck: 'js__header__stuck',
      transparent: 'has-header-transparent',
      headerWrapper: 'header-wrapper',
    };

    const attributes$d = {
      drawer: 'data-drawer',
      drawerToggle: 'data-drawer-toggle',
      scrollLock: 'data-scroll-locked',
      stickyHeader: 'data-header-sticky',
      transparent: 'data-header-transparent',
    };

    if (!customElements.get('header-component')) {
      customElements.define(
        'header-component',
        class HeaderComponent extends HTMLElement {
          constructor() {
            super();

            this.style = this.dataset.style;
            this.desktop = this.querySelector(selectors$o.desktop);
            this.deadLinks = document.querySelectorAll(selectors$o.deadLink);
            this.resizeObserver = null;
            this.checkWidth = this.checkWidth.bind(this);
            this.isSticky = this.hasAttribute(attributes$d.stickyHeader);

            document.body.classList.toggle(classes$l.sticky, this.isSticky);

            // Fallback for CSS :has() selectors
            let enableTransparentHeader = false;
            const firstSectionOverlayHeader = document.querySelector(selectors$o.firstSectionOverlayHeader);
            if (firstSectionOverlayHeader && !firstSectionOverlayHeader.querySelector(selectors$o.preventTransparent)) {
              enableTransparentHeader = true;
            }

            document.body.classList.toggle(classes$l.transparent, this.hasAttribute(attributes$d.transparent));
            document.body.classList.toggle(classes$l.firstSectionOverlayHeader, enableTransparentHeader);
          }

          connectedCallback() {
            this.killDeadLinks();
            this.drawerToggleEvent();
            this.cartToggleEvent();
            this.initSticky();

            if (this.style !== 'drawer' && this.desktop) {
              this.minWidth = this.getMinWidth();
              this.listenWidth();
            }
          }

          listenWidth() {
            if ('ResizeObserver' in window) {
              this.resizeObserver = new ResizeObserver(this.checkWidth);
              this.resizeObserver.observe(this);
            } else {
              document.addEventListener('theme:resize', this.checkWidth);
            }
          }

          drawerToggleEvent() {
            this.querySelectorAll(`[${attributes$d.drawerToggle}]`)?.forEach((button) => {
              button.addEventListener('click', () => {
                let drawer;
                const key = button.hasAttribute(attributes$d.drawerToggle) ? button.getAttribute(attributes$d.drawerToggle) : '';
                const desktopDrawer = document.querySelector(`[${attributes$d.drawer}="${key}"]`);
                const mobileDrawer = document.querySelector(`mobile-menu > [${attributes$d.drawer}]`);
                !window.theme.isMobile();

                // if (isDesktopView) {
                //   drawer = desktopDrawer;
                // } else {
                //   drawer = theme.settings.mobileMenuType === 'new' ? mobileDrawer || desktopDrawer : desktopDrawer;
                // }

                drawer = theme.settings.mobileMenuType === 'new' ? mobileDrawer || desktopDrawer : desktopDrawer;

                drawer.dispatchEvent(
                  new CustomEvent('theme:drawer:toggle', {
                    bubbles: false,
                    detail: {
                      button: button,
                    },
                  })
                );
              });
            });
          }

          killDeadLinks() {
            this.deadLinks.forEach((el) => {
              el.onclick = (e) => {
                e.preventDefault();
              };
            });
          }

          checkWidth() {
            if (document.body.clientWidth < this.minWidth) {
              this.classList.add(classes$l.showMobileClass);

              // Update --header-height CSS variable when switching to a mobile nav
              const {headerHeight} = window.theme.readHeights();
              document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
            } else {
              this.classList.remove(classes$l.showMobileClass);
            }
          }

          getMinWidth() {
            const comparitor = document.createElement('div');
            comparitor.classList.add(classes$l.clone, classes$l.headerWrapper);
            comparitor.appendChild(this.querySelector('header').cloneNode(true));
            document.body.appendChild(comparitor);
            const widthWrappers = comparitor.querySelectorAll(selectors$o.widthContentWrapper);
            let minWidth = 0;
            let spaced = 0;

            widthWrappers.forEach((context) => {
              const wideElements = context.querySelectorAll(selectors$o.widthContent);
              let thisWidth = 0;
              if (wideElements.length === 3) {
                thisWidth = this._sumSplitWidths(wideElements);
              } else {
                thisWidth = this._sumWidths(wideElements);
              }
              if (thisWidth > minWidth) {
                minWidth = thisWidth;
                spaced = wideElements.length * 20;
              }
            });

            document.body.removeChild(comparitor);
            return minWidth + spaced;
          }

          cartToggleEvent() {
            if (theme.settings.cartType !== 'drawer') return;

            this.querySelectorAll(selectors$o.cartToggleButton)?.forEach((button) => {
              button.addEventListener('click', (e) => {
                const cartDrawer = document.querySelector(selectors$o.cartDrawer);

                if (cartDrawer) {
                  e.preventDefault();
                  cartDrawer.dispatchEvent(new CustomEvent('theme:cart-drawer:show'));
                  window.theme.a11y.lastElement = button;
                }
              });
            });
          }

          toggleButtonClick(e) {
            e.preventDefault();
            document.dispatchEvent(new CustomEvent('theme:cart:toggle', {bubbles: true}));
          }

          initSticky() {
            if (!this.isSticky) return;

            this.isStuck = false;
            this.cls = this.classList;
            this.headerOffset = document.querySelector(selectors$o.pageHeader)?.offsetTop;
            this.updateHeaderOffset = this.updateHeaderOffset.bind(this);
            this.scrollEvent = (e) => this.onScroll(e);

            this.listen();
            this.stickOnLoad();
          }

          listen() {
            document.addEventListener('theme:scroll', this.scrollEvent);
            document.addEventListener('shopify:section:load', this.updateHeaderOffset);
            document.addEventListener('shopify:section:unload', this.updateHeaderOffset);
          }

          onScroll(e) {
            if (e.detail.down) {
              if (!this.isStuck && e.detail.position > this.headerOffset) {
                this.stickSimple();
              }
            } else if (e.detail.position <= this.headerOffset) {
              this.unstickSimple();
            }
          }

          updateHeaderOffset(event) {
            if (!event.target.classList.contains(classes$l.headerGroup)) return;

            // Update header offset after any "Header group" section has been changed
            setTimeout(() => {
              this.headerOffset = document.querySelector(selectors$o.pageHeader)?.offsetTop;
            });
          }

          stickOnLoad() {
            if (window.scrollY > this.headerOffset) {
              this.stickSimple();
            }
          }

          stickSimple() {
            this.cls.add(classes$l.stuck);
            this.isStuck = true;
          }

          unstickSimple() {
            if (!document.documentElement.hasAttribute(attributes$d.scrollLock)) {
              // check for scroll lock
              this.cls.remove(classes$l.stuck);
              this.isStuck = false;
            }
          }

          _sumSplitWidths(nodes) {
            let arr = [];
            nodes.forEach((el) => {
              if (el.firstElementChild) {
                arr.push(el.firstElementChild.clientWidth);
              }
            });
            if (arr[0] > arr[2]) {
              arr[2] = arr[0];
            } else {
              arr[0] = arr[2];
            }
            const width = arr.reduce((a, b) => a + b);
            return width;
          }

          _sumWidths(nodes) {
            let width = 0;
            nodes.forEach((el) => {
              width += el.clientWidth;
            });
            return width;
          }

          disconnectedCallback() {
            if ('ResizeObserver' in window) {
              this.resizeObserver?.unobserve(this);
            } else {
              document.removeEventListener('theme:resize', this.checkWidth);
            }

            if (this.isSticky) {
              document.removeEventListener('theme:scroll', this.scrollEvent);
              document.removeEventListener('shopify:section:load', this.updateHeaderOffset);
              document.removeEventListener('shopify:section:unload', this.updateHeaderOffset);
            }
          }
        }
      );
    }

    const selectors$n = {
      link: '[data-top-link]',
      wrapper: '[data-header-wrapper]',
      stagger: '[data-stagger]',
      staggerPair: '[data-stagger-first]',
      staggerAfter: '[data-stagger-second]',
      focusable: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    };

    const classes$k = {
      isVisible: 'is-visible',
      meganavVisible: 'meganav--visible',
      meganavIsTransitioning: 'meganav--is-transitioning',
    };

    if (!customElements.get('hover-disclosure')) {
      customElements.define(
        'hover-disclosure',

        class HoverDisclosure extends HTMLElement {
          constructor() {
            super();

            this.wrapper = this.closest(selectors$n.wrapper);
            this.key = this.getAttribute('aria-controls');
            this.link = this.querySelector(selectors$n.link);
            this.grandparent = this.classList.contains('grandparent');
            this.disclosure = document.getElementById(this.key);
            this.transitionTimeout = 0;
          }

          connectedCallback() {
            this.setAttribute('aria-haspopup', true);
            this.setAttribute('aria-expanded', false);
            this.setAttribute('aria-controls', this.key);

            this.connectHoverToggle();
            this.handleTablets();
            this.staggerChildAnimations();

            this.addEventListener('theme:disclosure:show', (evt) => {
              this.showDisclosure(evt);
            });
            this.addEventListener('theme:disclosure:hide', (evt) => {
              this.hideDisclosure(evt);
            });
          }

          showDisclosure(e) {
            if (e && e.type && e.type === 'mouseenter') {
              this.wrapper.classList.add(classes$k.meganavIsTransitioning);
            }

            if (this.grandparent) {
              this.wrapper.classList.add(classes$k.meganavVisible);
            } else {
              this.wrapper.classList.remove(classes$k.meganavVisible);
            }
            this.setAttribute('aria-expanded', true);
            this.classList.add(classes$k.isVisible);
            this.disclosure.classList.add(classes$k.isVisible);

            if (this.transitionTimeout) {
              clearTimeout(this.transitionTimeout);
            }

            this.transitionTimeout = setTimeout(() => {
              this.wrapper.classList.remove(classes$k.meganavIsTransitioning);
            }, 200);
          }

          hideDisclosure() {
            this.classList.remove(classes$k.isVisible);
            this.disclosure.classList.remove(classes$k.isVisible);
            this.setAttribute('aria-expanded', false);
            this.wrapper.classList.remove(classes$k.meganavVisible, classes$k.meganavIsTransitioning);
          }

          staggerChildAnimations() {
            const simple = this.querySelectorAll(selectors$n.stagger);
            let step = 50;
            simple.forEach((el, index) => {
              el.style.transitionDelay = `${index * step + 10}ms`;
              step *= 0.95;
            });

            const pairs = this.querySelectorAll(selectors$n.staggerPair);
            pairs.forEach((child, i) => {
              const d1 = i * 100;
              child.style.transitionDelay = `${d1}ms`;
              child.parentElement.querySelectorAll(selectors$n.staggerAfter).forEach((grandchild, i2) => {
                const di1 = i2 + 1;
                const d2 = di1 * 20;
                grandchild.style.transitionDelay = `${d1 + d2}ms`;
              });
            });
          }

          handleTablets() {
            // first click opens the popup, second click opens the link
            this.addEventListener(
              'touchstart',
              function (e) {
                const isOpen = this.classList.contains(classes$k.isVisible);
                if (!isOpen) {
                  e.preventDefault();
                  this.showDisclosure(e);
                }
              }.bind(this),
              {passive: true}
            );
          }

          connectHoverToggle() {
            this.addEventListener('mouseenter', (e) => this.showDisclosure(e));
            this.link.addEventListener('focus', (e) => this.showDisclosure(e));

            this.addEventListener('mouseleave', () => this.hideDisclosure());
            this.addEventListener('focusout', (e) => {
              const inMenu = this.contains(e.relatedTarget);
              if (!inMenu) {
                this.hideDisclosure();
              }
            });
            this.addEventListener('keyup', (evt) => {
              if (evt.code !== 'Escape') {
                return;
              }
              this.hideDisclosure();
            });
          }
        }
      );
    }

    const selectors$m = {
      drawerInner: '[data-drawer-inner]',
      drawerClose: '[data-drawer-close]',
      underlay: '[data-drawer-underlay]',
      wrapper: '[data-header-wrapper]',
      focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
    };

    const classes$j = {
      animated: 'drawer--animated',
      open: 'is-open',
      closing: 'is-closing',
      isFocused: 'is-focused',
      headerStuck: 'js__header__stuck',
    };

    if (!customElements.get('header-drawer')) {
      customElements.define(
        'header-drawer',
        class HeaderDrawer extends HTMLElement {
          constructor() {
            super();

            this.a11y = window.theme.a11y;
            this.isAnimating = false;
            this.drawer = this;
            this.drawerInner = this.querySelector(selectors$m.drawerInner);
            this.underlay = this.querySelector(selectors$m.underlay);
            this.triggerButton = null;

            this.showDrawer = this.showDrawer.bind(this);
            this.hideDrawer = this.hideDrawer.bind(this);

            this.handleViewportChange = () => {
              if (this.classList.contains(classes$j.open) && !this.isAnimating) {
                this.hideDrawer();
              }
            };

            this.debouncedHandleViewportChange = window.theme.debounce(this.handleViewportChange, 100);

            this.connectDrawer();
            this.closers();

            window.addEventListener('resize', this.debouncedHandleViewportChange);
            if (screen.orientation?.addEventListener) {
              screen.orientation.addEventListener('change', this.handleViewportChange);
            }
            window.addEventListener('orientationchange', this.handleViewportChange);
          }

          connectDrawer() {
            this.addEventListener('theme:drawer:toggle', (e) => {
              this.triggerButton = e.detail?.button;

              if (this.classList.contains(classes$j.open)) {
                this.dispatchEvent(
                  new CustomEvent('theme:drawer:close', {
                    bubbles: true,
                  })
                );
              } else {
                this.dispatchEvent(
                  new CustomEvent('theme:drawer:open', {
                    bubbles: true,
                  })
                );
              }
            });

            this.addEventListener('theme:drawer:close', this.hideDrawer);
            this.addEventListener('theme:drawer:open', this.showDrawer);

            document.addEventListener('theme:cart-drawer:open', this.hideDrawer);
          }

          closers() {
            this.querySelectorAll(selectors$m.drawerClose)?.forEach((button) => {
              button.addEventListener('click', () => {
                this.hideDrawer();
              });
            });

            document.addEventListener('keyup', (event) => {
              if (event.code !== 'Escape') {
                return;
              }

              this.hideDrawer();
            });

            this.underlay.addEventListener('click', () => {
              this.hideDrawer();
            });
          }

          showDrawer() {
            if (this.isAnimating) return;

            this.isAnimating = true;

            this.triggerButton?.setAttribute('aria-expanded', true);
            this.classList.add(classes$j.open, classes$j.animated);

            document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));

            if (this.drawerInner) {
              this.a11y.removeTrapFocus();

              window.theme.waitForAnimationEnd(this.drawerInner).then(() => {
                this.isAnimating = false;

                this.a11y.trapFocus(this.drawerInner, {
                  elementToFocus: this.querySelector(selectors$m.focusable),
                });
              });
            }
          }

          hideDrawer() {
            if (this.isAnimating || !this.classList.contains(classes$j.open)) return;

            this.isAnimating = true;

            this.classList.add(classes$j.closing);
            this.classList.remove(classes$j.open);

            this.a11y.removeTrapFocus();

            if (this.triggerButton) {
              this.triggerButton.setAttribute('aria-expanded', false);

              if (document.body.classList.contains(classes$j.isFocused)) {
                this.triggerButton.focus();
              }
            }

            document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));

            window.theme.waitForAnimationEnd(this.drawerInner).then(() => {
              this.classList.remove(classes$j.closing, classes$j.animated);

              this.isAnimating = false;

              // Reset menu items state after drawer hiding animation completes
              document.dispatchEvent(new CustomEvent('theme:sliderule:close', {bubbles: false}));
            });
          }

          disconnectedCallback() {
            document.removeEventListener('theme:cart-drawer:open', this.hideDrawer);
            window.removeEventListener('resize', this.debouncedHandleViewportChange);
            if (screen.orientation?.addEventListener) {
              screen.orientation.removeEventListener('change', this.handleViewportChange);
            }
            window.removeEventListener('orientationchange', this.handleViewportChange);
          }
        }
      );
    }

    const selectors$l = {
      animates: 'data-animates',
      sliderule: '[data-sliderule]',
      slideruleOpen: 'data-sliderule-open',
      slideruleClose: 'data-sliderule-close',
      sliderulePane: 'data-sliderule-pane',
      drawerContent: '[data-drawer-content]',
      focusable: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      children: `:scope > [data-animates],
             :scope > * > [data-animates],
             :scope > * > * > [data-animates],
             :scope > * > .sliderule-grid  > *`,
    };

    const classes$i = {
      isVisible: 'is-visible',
      isHiding: 'is-hiding',
      isHidden: 'is-hidden',
      focused: 'is-focused',
      scrolling: 'is-scrolling',
    };

    if (!customElements.get('mobile-sliderule')) {
      customElements.define(
        'mobile-sliderule',

        class HeaderMobileSliderule extends HTMLElement {
          constructor() {
            super();

            this.key = this.id;
            this.sliderule = this.querySelector(selectors$l.sliderule);
            const btnSelector = `[${selectors$l.slideruleOpen}='${this.key}']`;
            this.exitSelector = `[${selectors$l.slideruleClose}='${this.key}']`;
            this.trigger = this.querySelector(btnSelector);
            this.exit = document.querySelectorAll(this.exitSelector);
            this.pane = this.trigger.closest(`[${selectors$l.sliderulePane}]`);
            this.childrenElements = this.querySelectorAll(selectors$l.children);
            this.drawerContent = this.closest(selectors$l.drawerContent);
            this.cachedButton = null;
            this.a11y = window.theme.a11y;

            this.trigger.setAttribute('aria-haspopup', true);
            this.trigger.setAttribute('aria-expanded', false);
            this.trigger.setAttribute('aria-controls', this.key);
            this.closeSliderule = this.closeSliderule.bind(this);

            this.clickEvents();
            this.keyboardEvents();

            document.addEventListener('theme:sliderule:close', this.closeSliderule);
          }

          clickEvents() {
            this.trigger.addEventListener('click', () => {
              this.cachedButton = this.trigger;
              this.showSliderule();
            });
            this.exit.forEach((element) => {
              element.addEventListener('click', () => {
                this.hideSliderule();
              });
            });
          }

          keyboardEvents() {
            this.addEventListener('keyup', (evt) => {
              evt.stopPropagation();
              if (evt.code !== 'Escape') {
                return;
              }

              this.hideSliderule();
            });
          }

          trapFocusSliderule(showSliderule = true) {
            const trapFocusButton = showSliderule ? this.querySelector(this.exitSelector) : this.cachedButton;

            this.a11y.removeTrapFocus();

            if (trapFocusButton && this.drawerContent) {
              this.a11y.trapFocus(this.drawerContent, {
                elementToFocus: document.body.classList.contains(classes$i.focused) ? trapFocusButton : null,
              });
            }
          }

          hideSliderule(close = false) {
            const newPosition = parseInt(this.pane.dataset.sliderulePane, 10) - 1;
            this.pane.setAttribute(selectors$l.sliderulePane, newPosition);
            this.pane.classList.add(classes$i.isHiding);
            this.sliderule.classList.add(classes$i.isHiding);
            const hiddenSelector = close ? `[${selectors$l.animates}].${classes$i.isHidden}` : `[${selectors$l.animates}="${newPosition}"]`;
            const hiddenItems = this.pane.querySelectorAll(hiddenSelector);
            if (hiddenItems.length) {
              hiddenItems.forEach((element) => {
                element.classList.remove(classes$i.isHidden);
              });
            }

            const children = close ? this.pane.querySelectorAll(`.${classes$i.isVisible}, .${classes$i.isHiding}`) : this.childrenElements;
            children.forEach((element, index) => {
              const lastElement = children.length - 1 == index;
              element.classList.remove(classes$i.isVisible);
              if (close) {
                element.classList.remove(classes$i.isHiding);
                this.pane.classList.remove(classes$i.isHiding);
              }
              const removeHidingClass = () => {
                if (parseInt(this.pane.getAttribute(selectors$l.sliderulePane)) === newPosition) {
                  this.sliderule.classList.remove(classes$i.isVisible);
                }
                this.sliderule.classList.remove(classes$i.isHiding);
                this.pane.classList.remove(classes$i.isHiding);

                if (lastElement) {
                  this.a11y.removeTrapFocus();
                  if (!close) {
                    this.trapFocusSliderule(false);
                  }
                }

                element.removeEventListener('animationend', removeHidingClass);
              };

              if (window.theme.settings.enableAnimations) {
                element.addEventListener('animationend', removeHidingClass);
              } else {
                removeHidingClass();
              }
            });
          }

          showSliderule() {
            let lastScrollableFrame = null;
            const parent = this.closest(`.${classes$i.isVisible}`);
            let lastScrollableElement = this.pane;

            if (parent) {
              lastScrollableElement = parent;
            }

            lastScrollableElement.scrollTo({
              top: 0,
              left: 0,
              behavior: 'smooth',
            });

            lastScrollableElement.classList.add(classes$i.scrolling);

            const lastScrollableIsScrolling = () => {
              if (lastScrollableElement.scrollTop <= 0) {
                lastScrollableElement.classList.remove(classes$i.scrolling);
                if (lastScrollableFrame) {
                  cancelAnimationFrame(lastScrollableFrame);
                }
              } else {
                lastScrollableFrame = requestAnimationFrame(lastScrollableIsScrolling);
              }
            };

            lastScrollableFrame = requestAnimationFrame(lastScrollableIsScrolling);

            const oldPosition = parseInt(this.pane.dataset.sliderulePane, 10);
            const newPosition = oldPosition + 1;
            this.sliderule.classList.add(classes$i.isVisible);
            this.pane.setAttribute(selectors$l.sliderulePane, newPosition);

            const hiddenItems = this.pane.querySelectorAll(`[${selectors$l.animates}="${oldPosition}"]`);
            if (hiddenItems.length) {
              hiddenItems.forEach((element, index) => {
                const lastElement = hiddenItems.length - 1 == index;
                element.classList.add(classes$i.isHiding);
                const removeHidingClass = () => {
                  element.classList.remove(classes$i.isHiding);
                  if (parseInt(this.pane.getAttribute(selectors$l.sliderulePane)) !== oldPosition) {
                    element.classList.add(classes$i.isHidden);
                  }

                  if (lastElement) {
                    this.trapFocusSliderule();
                  }
                  element.removeEventListener('animationend', removeHidingClass);
                };

                if (window.theme.settings.enableAnimations) {
                  element.addEventListener('animationend', removeHidingClass);
                } else {
                  removeHidingClass();
                }
              });
            }
          }

          closeSliderule() {
            if (this.pane && this.pane.hasAttribute(selectors$l.sliderulePane) && parseInt(this.pane.getAttribute(selectors$l.sliderulePane)) > 0) {
              this.hideSliderule(true);
              if (parseInt(this.pane.getAttribute(selectors$l.sliderulePane)) > 0) {
                this.pane.setAttribute(selectors$l.sliderulePane, 0);
              }
            }
          }

          disconnectedCallback() {
            document.removeEventListener('theme:sliderule:close', this.closeSliderule);
          }
        }
      );
    }

    const selectors$k = {
      details: 'details',
      popdown: '[data-popdown]',
      popdownClose: '[data-popdown-close]',
      input: 'input:not([type="hidden"])',
      mobileMenu: 'mobile-menu',
    };

    const attributes$c = {
      popdownUnderlay: 'data-popdown-underlay',
      scrollLocked: 'data-scroll-locked',
    };

    const classes$h = {
      open: 'is-open',
    };
    class SearchPopdown extends HTMLElement {
      constructor() {
        super();
        this.popdown = this.querySelector(selectors$k.popdown);
        this.popdownContainer = this.querySelector(selectors$k.details);
        this.popdownClose = this.querySelector(selectors$k.popdownClose);
        this.popdownTransitionCallback = this.popdownTransitionCallback.bind(this);
        this.detailsToggleCallback = this.detailsToggleCallback.bind(this);
        this.mobileMenu = this.closest(selectors$k.mobileMenu);
        this.a11y = window.theme.a11y;
      }

      connectedCallback() {
        this.popdown.addEventListener('transitionend', this.popdownTransitionCallback);
        this.popdownContainer.addEventListener('keyup', (event) => event.code.toUpperCase() === 'ESCAPE' && this.close());
        this.popdownContainer.addEventListener('toggle', this.detailsToggleCallback);
        this.popdownClose.addEventListener('click', this.close.bind(this));
      }

      detailsToggleCallback(event) {
        if (event.target.hasAttribute('open')) {
          this.open();
        }
      }

      popdownTransitionCallback(event) {
        if (event.target !== this.popdown) return;

        if (!this.classList.contains(classes$h.open)) {
          this.popdownContainer.removeAttribute('open');
          this.a11y.removeTrapFocus();
        } else if (event.propertyName === 'transform' || event.propertyName === 'opacity') {
          // Wait for the 'transform' transition to complete in order to prevent jumping content issues because of the trapFocus
          this.a11y.trapFocus(this.popdown, {
            elementToFocus: this.popdown.querySelector(selectors$k.input),
          });
        }
      }

      onBodyClick(event) {
        if (!this.contains(event.target) || event.target.hasAttribute(attributes$c.popdownUnderlay)) this.close();
      }

      open() {
        this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);

        document.body.addEventListener('click', this.onBodyClickEvent);
        this.mobileMenu?.dispatchEvent(new CustomEvent('theme:search:open'));

        if (!document.documentElement.hasAttribute(attributes$c.scrollLocked)) {
          document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
        }

        requestAnimationFrame(() => {
          this.classList.add(classes$h.open);
        });
      }

      close() {
        this.classList.remove(classes$h.open);
        this.mobileMenu?.dispatchEvent(new CustomEvent('theme:search:close'));

        document.body.removeEventListener('click', this.onBodyClickEvent);

        if (!this.mobileMenu) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }
      }
    }

    if (!customElements.get('header-search-popdown')) {
      customElements.define('header-search-popdown', SearchPopdown);
    }

    const selectors$j = {
      inputSearch: 'input[type="search"]',
      focusedElements: '[aria-selected="true"] a',
      resetButton: 'button[type="reset"]',
    };

    const classes$g = {
      hidden: 'hidden',
    };

    class HeaderSearchForm extends HTMLElement {
      constructor() {
        super();

        this.input = this.querySelector(selectors$j.inputSearch);
        this.resetButton = this.querySelector(selectors$j.resetButton);

        if (this.input) {
          this.input.form.addEventListener('reset', this.onFormReset.bind(this));
          this.input.addEventListener(
            'input',
            window.theme
              .debounce((event) => {
                this.onChange(event);
              }, 300)
              .bind(this)
          );
        }
      }

      toggleResetButton() {
        const resetIsHidden = this.resetButton.classList.contains(classes$g.hidden);
        if (this.input.value.length > 0 && resetIsHidden) {
          this.resetButton.classList.remove(classes$g.hidden);
        } else if (this.input.value.length === 0 && !resetIsHidden) {
          this.resetButton.classList.add(classes$g.hidden);
        }
      }

      onChange() {
        this.toggleResetButton();
      }

      shouldResetForm() {
        return !document.querySelector(selectors$j.focusedElements);
      }

      onFormReset(event) {
        // Prevent default so the form reset doesn't set the value gotten from the url on page load
        event.preventDefault();
        // Don't reset if the user has selected an element on the predictive search dropdown
        if (this.shouldResetForm()) {
          this.input.value = '';
          this.toggleResetButton();
          event.target.querySelector(selectors$j.inputSearch).focus();
        }
      }
    }

    customElements.define('header-search-form', HeaderSearchForm);

    const selectors$i = {
      inputSearch: 'input[type="search"]',
    };

    class MainSearch extends HeaderSearchForm {
      constructor() {
        super();

        this.allSearchInputs = document.querySelectorAll(selectors$i.inputSearch);
        this.setupEventListeners();
      }

      setupEventListeners() {
        let allSearchForms = [];
        this.allSearchInputs.forEach((input) => allSearchForms.push(input.form));
        this.input.addEventListener('focus', this.onInputFocus.bind(this));
        if (allSearchForms.length < 2) return;
        allSearchForms.forEach((form) => form.addEventListener('reset', this.onFormReset.bind(this)));
        this.allSearchInputs.forEach((input) => input.addEventListener('input', this.onInput.bind(this)));
      }

      onFormReset(event) {
        super.onFormReset(event);
        if (super.shouldResetForm()) {
          this.keepInSync('', this.input);
        }
      }

      onInput(event) {
        const target = event.target;
        this.keepInSync(target.value, target);
      }

      onInputFocus() {
        if (window.theme.isMobile()) {
          this.scrollIntoView({behavior: 'smooth'});
        }
      }

      keepInSync(value, target) {
        this.allSearchInputs.forEach((input) => {
          if (input !== target) {
            input.value = value;
          }
        });
      }
    }

    if (!customElements.get('main-search')) {
      customElements.define('main-search', MainSearch);
    }

    const selectors$h = {
      scrollbar: '[data-scrollbar]',
      scrollbarArrowPrev: '[data-scrollbar-arrow-prev]',
      scrollbarArrowNext: '[data-scrollbar-arrow-next]',
    };

    const classes$f = {
      hidden: 'is-hidden',
    };

    const attributes$b = {
      scrollbarSlider: 'data-scrollbar-slider',
      scrollbarSlideFullWidth: 'data-scrollbar-slide-fullwidth',
    };

    if (!customElements.get('native-scrollbar')) {
      customElements.define(
        'native-scrollbar',
        class NativeScrollbar extends HTMLElement {
          constructor() {
            super();

            this.scrollbar = this.querySelector(selectors$h.scrollbar);
            this.arrowNext = this.querySelector(selectors$h.scrollbarArrowNext);
            this.arrowPrev = this.querySelector(selectors$h.scrollbarArrowPrev);
            this.toggleNextArrow = this.toggleNextArrow.bind(this);
          }

          connectedCallback() {
            document.addEventListener('theme:resize', this.toggleNextArrow);

            if (this.scrollbar.hasAttribute(attributes$b.scrollbarSlider)) {
              this.scrollToVisibleElement();
            }

            if (this.arrowNext && this.arrowPrev) {
              this.toggleNextArrow();
              this.events();
            }
          }

          disconnectedCallback() {
            document.removeEventListener('theme:resize', this.toggleNextArrow);
          }

          events() {
            this.arrowNext.addEventListener('click', (event) => {
              event.preventDefault();

              this.goToNext();
            });

            this.arrowPrev.addEventListener('click', (event) => {
              event.preventDefault();

              this.goToPrev();
            });

            this.scrollbar.addEventListener('scroll', () => {
              this.togglePrevArrow();
              this.toggleNextArrow();
            });
          }

          goToNext() {
            const moveWith = this.scrollbar.hasAttribute(attributes$b.scrollbarSlideFullWidth) ? this.scrollbar.getBoundingClientRect().width : this.scrollbar.getBoundingClientRect().width / 2;
            const position = moveWith + this.scrollbar.scrollLeft;

            this.move(position);

            this.arrowPrev.classList.remove(classes$f.hidden);

            this.toggleNextArrow();
          }

          goToPrev() {
            const moveWith = this.scrollbar.hasAttribute(attributes$b.scrollbarSlideFullWidth) ? this.scrollbar.getBoundingClientRect().width : this.scrollbar.getBoundingClientRect().width / 2;
            const position = this.scrollbar.scrollLeft - moveWith;

            this.move(position);

            this.arrowNext.classList.remove(classes$f.hidden);

            this.togglePrevArrow();
          }

          toggleNextArrow() {
            requestAnimationFrame(() => {
              this.arrowNext?.classList.toggle(classes$f.hidden, Math.round(this.scrollbar.scrollLeft + this.scrollbar.getBoundingClientRect().width + 1) >= this.scrollbar.scrollWidth);
            });
          }

          togglePrevArrow() {
            requestAnimationFrame(() => {
              this.arrowPrev.classList.toggle(classes$f.hidden, this.scrollbar.scrollLeft <= 0);
            });
          }

          scrollToVisibleElement() {
            [].forEach.call(this.scrollbar.children, (element) => {
              element.addEventListener('click', (event) => {
                event.preventDefault();

                this.move(element.offsetLeft - element.clientWidth);
              });
            });
          }

          move(offsetLeft) {
            this.scrollbar.scrollTo({
              top: 0,
              left: offsetLeft,
              behavior: 'smooth',
            });
          }
        }
      );
    }

    const selectors$g = {
      popoutList: '[data-popout-list]',
      popoutToggle: '[data-popout-toggle]',
      popoutToggleText: '[data-popout-toggle-text]',
      popoutInput: '[data-popout-input]',
      popoutOptions: '[data-popout-option]',
      productGridImage: '[data-product-image]',
      productGridItem: '[data-grid-item]',
      section: '[data-section-type]',
    };

    const classes$e = {
      listVisible: 'popout-list--visible',
      visible: 'is-visible',
      active: 'is-active',
      popoutListTop: 'popout-list--top',
    };

    const attributes$a = {
      ariaExpanded: 'aria-expanded',
      ariaCurrent: 'aria-current',
      dataValue: 'data-value',
      popoutToggleText: 'data-popout-toggle-text',
      submit: 'submit',
    };

    if (!customElements.get('popout-select')) {
      customElements.define(
        'popout-select',
        class Popout extends HTMLElement {
          constructor() {
            super();
          }

          connectedCallback() {
            this.popoutList = this.querySelector(selectors$g.popoutList);
            this.popoutToggle = this.querySelector(selectors$g.popoutToggle);
            this.popoutToggleText = this.querySelector(selectors$g.popoutToggleText);
            this.popoutInput = this.querySelector(selectors$g.popoutInput) || this.parentNode.querySelector(selectors$g.popoutInput);
            this.popoutOptions = this.querySelectorAll(selectors$g.popoutOptions);
            this.productGridItem = this.popoutList.closest(selectors$g.productGridItem);
            this.fireSubmitEvent = this.hasAttribute(attributes$a.submit);

            this.popupToggleFocusoutEvent = (evt) => this.onPopupToggleFocusout(evt);
            this.popupListFocusoutEvent = (evt) => this.onPopupListFocusout(evt);
            this.popupToggleClickEvent = (evt) => this.onPopupToggleClick(evt);
            this.keyUpEvent = (evt) => this.onKeyUp(evt);
            this.bodyClickEvent = (evt) => this.onBodyClick(evt);

            this._connectOptions();
            this._connectToggle();
            this._onFocusOut();
            this.popupListSetDimensions();
          }

          onPopupToggleClick(evt) {
            const button = evt.currentTarget;
            const ariaExpanded = button.getAttribute(attributes$a.ariaExpanded) === 'true';

            if (this.productGridItem) {
              const productGridItemImage = this.productGridItem.querySelector(selectors$g.productGridImage);

              if (productGridItemImage) {
                productGridItemImage.classList.toggle(classes$e.visible, !ariaExpanded);
              }

              this.popoutList.style.maxHeight = `${Math.abs(this.popoutToggle.getBoundingClientRect().bottom - this.productGridItem.getBoundingClientRect().bottom)}px`;
            }

            evt.currentTarget.setAttribute(attributes$a.ariaExpanded, !ariaExpanded);
            this.popoutList.classList.toggle(classes$e.listVisible);
            this.popupListSetDimensions();
            this.toggleListPosition();

            document.body.addEventListener('click', this.bodyClickEvent);
          }

          onPopupToggleFocusout(evt) {
            this.contains(evt.relatedTarget);

            // TODO Hide condition for blog filters
            // if (!popoutLostFocus) {
            //   this._hideList();
            // }
          }

          onPopupListFocusout(evt) {
            evt.currentTarget.contains(evt.relatedTarget);
            this.popoutList.classList.contains(classes$e.listVisible);

            // TODO Hide condition for blog filters
            // if (isVisible && !childInFocus) {
            //   this._hideList();
            // }
          }

          toggleListPosition() {
            const button = this.querySelector(selectors$g.popoutToggle);
            const popoutTop = this.getBoundingClientRect().top + this.clientHeight;

            const removeTopClass = () => {
              if (button.getAttribute(attributes$a.ariaExpanded) !== 'true') {
                this.popoutList.classList.remove(classes$e.popoutListTop);
              }

              this.popoutList.removeEventListener('transitionend', removeTopClass);
            };

            if (button.getAttribute(attributes$a.ariaExpanded) === 'true') {
              if (window.innerHeight / 2 < popoutTop) {
                this.popoutList.classList.add(classes$e.popoutListTop);
              }
            } else {
              this.popoutList.addEventListener('transitionend', removeTopClass);
            }
          }

          popupListSetDimensions() {
            this.popoutList.style.setProperty('--max-width', '100vw');
            this.popoutList.style.setProperty('--max-height', '100vh');

            requestAnimationFrame(() => {
              this.popoutList.style.setProperty('--max-width', `${parseInt(document.body.clientWidth - this.popoutList.getBoundingClientRect().left)}px`);
              this.popoutList.style.setProperty('--max-height', `${parseInt(document.body.clientHeight - this.popoutList.getBoundingClientRect().top)}px`);
            });
          }

          popupOptionsClick(evt) {
            const link = evt.target.closest(selectors$g.popoutOptions);

            if (link.attributes.href?.value === '#') {
              console.log(link.attributes, 'link.attributes');
              evt.preventDefault();

              const attrValue = evt.currentTarget.hasAttribute(attributes$a.dataValue) ? evt.currentTarget.getAttribute(attributes$a.dataValue) : '';
              if (this.popoutInput) {
                this.popoutInput.value = attrValue;
                if (this.popoutInput.disabled) {
                  this.popoutInput.removeAttribute('disabled');
                }
              }

              if (this.fireSubmitEvent) {
                this._submitForm(attrValue);
              } else {
                const currentTarget = evt.currentTarget.parentElement;
                const listTargetElement = this.popoutList.querySelector(`.${classes$e.active}`);
                const targetAttribute = this.popoutList.querySelector(`[${attributes$a.ariaCurrent}]`);

                if (this.popoutInput) {
                  this.popoutInput.dispatchEvent(new Event('change'));
                  if (this.popoutInput.name == 'quantity' && !currentTarget.nextSibling) {
                    this.classList.add(classes$e.active);
                  }
                }

                if (listTargetElement) {
                  listTargetElement.classList.remove(classes$e.active);
                  currentTarget.classList.add(classes$e.active);
                }

                if (targetAttribute && targetAttribute.hasAttribute(`${attributes$a.ariaCurrent}`)) {
                  targetAttribute.removeAttribute(`${attributes$a.ariaCurrent}`);
                  evt.currentTarget.setAttribute(`${attributes$a.ariaCurrent}`, 'true');
                }

                if (attrValue !== '') {
                  this.popoutToggleText.innerHTML = attrValue;

                  if (this.popoutToggleText.hasAttribute(attributes$a.popoutToggleText) && this.popoutToggleText.getAttribute(attributes$a.popoutToggleText) !== '') {
                    this.popoutToggleText.setAttribute(attributes$a.popoutToggleText, attrValue);
                  }
                }
                this.onPopupToggleFocusout(evt);
                this.onPopupListFocusout(evt);
              }
            } else if (link.hasAttribute('data-custom-size-picker')) {
              const attrValue = evt.currentTarget.hasAttribute(attributes$a.dataValue) ? evt.currentTarget.getAttribute(attributes$a.dataValue) : '';

              if (attrValue !== '') {
                this.popoutToggleText.innerHTML = attrValue;

                if (this.popoutToggleText.hasAttribute(attributes$a.popoutToggleText) && this.popoutToggleText.getAttribute(attributes$a.popoutToggleText) !== '') {
                  this.popoutToggleText.setAttribute(attributes$a.popoutToggleText, attrValue);
                }
              }
              this.popoutList.classList.remove(classes$e.listVisible);
            }
          }

          onKeyUp(evt) {
            if (evt.code !== 'Escape') {
              return;
            }
            this._hideList();
            this.popoutToggle.focus();
          }

          onBodyClick(evt) {
            const isOption = this.contains(evt.target);
            const isVisible = this.popoutList.classList.contains(classes$e.listVisible);

            if (isVisible && !isOption) {
              this._hideList();
            }
          }

          _connectToggle() {
            this.popoutToggle.addEventListener('click', this.popupToggleClickEvent);
          }

          _connectOptions() {
            console.log(this.popoutOptions, 'this.popoutOptions');
            if (this.popoutOptions.length) {
              this.popoutOptions.forEach((element) => {
                element.addEventListener('click', (evt) => this.popupOptionsClick(evt));
              });
            }
          }

          _onFocusOut() {
            this.addEventListener('keyup', this.keyUpEvent);
            this.popoutToggle.addEventListener('focusout', this.popupToggleFocusoutEvent);
            this.popoutList.addEventListener('focusout', this.popupListFocusoutEvent);
          }

          _submitForm() {
            const form = this.closest('form');
            if (form) {
              form.submit();
            }
          }

          _hideList() {
            this.popoutList.classList.remove(classes$e.listVisible);
            this.popoutToggle.setAttribute(attributes$a.ariaExpanded, false);
            this.toggleListPosition();
            document.body.removeEventListener('click', this.bodyClickEvent);
          }
        }
      );
    }

    class PopupCookie {
      constructor(name, value, daysToExpire = 7) {
        const today = new Date();
        const expiresDate = new Date();
        expiresDate.setTime(today.getTime() + 3600000 * 24 * daysToExpire);

        this.config = {
          expires: expiresDate.toGMTString(), // session cookie
          path: '/',
          domain: window.location.hostname,
          sameSite: 'none',
          secure: true,
        };
        this.name = name;
        this.value = value;
      }

      write() {
        const hasCookie = document.cookie.indexOf('; ') !== -1 && !document.cookie.split('; ').find((row) => row.startsWith(this.name));

        if (hasCookie || document.cookie.indexOf('; ') === -1) {
          document.cookie = `${this.name}=${this.value}; expires=${this.config.expires}; path=${this.config.path}; domain=${this.config.domain}; sameSite=${this.config.sameSite}; secure=${this.config.secure}`;
        }
      }

      read() {
        if (document.cookie.indexOf('; ') !== -1 && document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
          const returnCookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(this.name))
            .split('=')[1];

          return returnCookie;
        } else {
          return false;
        }
      }

      destroy() {
        if (document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
          document.cookie = `${this.name}=null; expires=${this.config.expires}; path=${this.config.path}; domain=${this.config.domain}`;
        }
      }
    }

    const selectors$f = {
      open: '[data-popup-open]',
      close: '[data-popup-close]',
      dialog: 'dialog',
      focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
      newsletterForm: '[data-newsletter-form]',
      newsletterHeading: '[data-newsletter-heading]',
      newsletterField: '[data-newsletter-field]',
    };

    const attributes$9 = {
      closing: 'closing',
      delay: 'data-popup-delay',
      scrollLock: 'data-scroll-lock-required',
      cookieName: 'data-cookie-name',
      cookieValue: 'data-cookie-value',
      preventTopLayer: 'data-prevent-top-layer',
    };

    const classes$d = {
      hidden: 'hidden',
      hasValue: 'has-value',
      cartBarVisible: 'cart-bar-visible',
      isVisible: 'is-visible',
      success: 'has-success',
      mobile: 'mobile',
      desktop: 'desktop',
      bottom: 'bottom',
    };

    class PopupComponent extends HTMLElement {
      constructor() {
        super();

        this.popup = this.querySelector(selectors$f.dialog);
        this.preventTopLayer = this.popup.hasAttribute(attributes$9.preventTopLayer);
        this.enableScrollLock = this.popup.hasAttribute(attributes$9.scrollLock);
        this.buttonPopupOpen = this.querySelector(selectors$f.open);
        this.a11y = window.theme.a11y;
        this.isAnimating = false;
        this.cookie = new PopupCookie(this.popup.getAttribute(attributes$9.cookieName), this.popup.getAttribute(attributes$9.cookieValue));

        this.checkTargetReferrer();
        this.checkCookie();
        this.bindListeners();
      }

      checkTargetReferrer() {
        if (!this.popup.hasAttribute(attributes$9.referrer)) return;

        if (location.href.indexOf(this.popup.getAttribute(attributes$9.referrer)) === -1 && !window.Shopify.designMode) {
          this.popup.parentNode.removeChild(this.popup);
        }
      }

      checkCookie() {
        const cookieExists = this.cookie && this.cookie.read() !== false;

        if (!cookieExists) {
          this.showPopupEvents();

          this.popup.addEventListener('theme:popup:onclose', () => this.cookie.write());
        }
      }

      bindListeners() {
        // Open button click event
        this.buttonPopupOpen?.addEventListener('click', (e) => {
          e.preventDefault();
          this.popupOpen();
          window.theme.a11y.lastElement = this.buttonPopupOpen;
        });

        // Close button click event
        this.popup.querySelectorAll(selectors$f.close)?.forEach((closeButton) => {
          closeButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.popupClose();
          });
        });

        // Close dialog on click outside content
        this.popup.addEventListener('click', (event) => {
          if (event.target.nodeName === 'DIALOG' && event.type === 'click') {
            this.popupClose();
          }
        });

        // Close dialog on click ESC key pressed
        this.popup.addEventListener('keydown', (event) => {
          if (event.code === 'Escape') {
            event.preventDefault();
            this.popupClose();
          }
        });

        this.popup.addEventListener('close', () => this.popupCloseActions());
      }

      popupOpen() {
        this.isAnimating = true;

        // Check if browser supports Dialog tags
        if (typeof this.popup.showModal === 'function' && !this.preventTopLayer) {
          this.popup.showModal();
        } else if (typeof this.popup.show === 'function') {
          this.popup.show();
        } else {
          this.popup.setAttribute('open', '');
        }

        this.popup.removeAttribute('inert');
        this.popup.setAttribute('aria-hidden', false);
        this.popup.focus(); // Focus <dialog> tag element to prevent immediate closing on Escape keypress

        if (this.enableScrollLock) {
          document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
        }

        window.theme.waitForAnimationEnd(this.popup).then(() => {
          this.isAnimating = false;

          if (this.enableScrollLock) {
            this.a11y.trapFocus(this.popup);
          }

          const focusTarget = this.popup.querySelector('[autofocus]') || this.popup.querySelector(selectors$f.focusable);
          focusTarget?.focus();
        });
      }

      popupClose() {
        if (this.isAnimating || this.popup.hasAttribute('inert')) {
          return;
        }

        if (!this.popup.hasAttribute(attributes$9.closing)) {
          this.popup.setAttribute(attributes$9.closing, '');
          this.isAnimating = true;

          window.theme.waitForAnimationEnd(this.popup).then(() => {
            this.isAnimating = false;
            this.popupClose();
          });

          return;
        }

        // Check if browser supports Dialog tags
        if (typeof this.popup.close === 'function') {
          this.popup.close();
        } else {
          this.popup.removeAttribute('open');
          this.popup.setAttribute('aria-hidden', true);
        }

        this.popupCloseActions();
      }

      popupCloseActions() {
        if (this.popup.hasAttribute('inert')) return;

        this.popup.setAttribute('inert', '');
        this.popup.setAttribute('aria-hidden', true);
        this.popup.removeAttribute(attributes$9.closing);

        // Unlock scroll if no other popups & modals are open
        if (!window.theme.hasOpenModals() && this.enableScrollLock) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }

        this.popup.dispatchEvent(new CustomEvent('theme:popup:onclose', {bubbles: false}));

        if (this.enableScrollLock) {
          this.a11y.removeTrapFocus();
          this.a11y.autoFocusLastElement();
        }
      }

      showPopupEvents() {
        // Auto show popup if it has open attribute
        if (this.popup.hasAttribute('open') && this.popup.getAttribute('open') == true) {
          this.popupOpen();
        }

        this.delay = this.popup.hasAttribute(attributes$9.delay) ? this.popup.getAttribute(attributes$9.delay) : null;
        this.isSubmitted = window.location.href.indexOf('accepts_marketing') !== -1 || window.location.href.indexOf('customer_posted=true') !== -1;
        this.showOnScrollEvent = () => this.showOnScroll();

        if (this.delay === 'always' || this.isSubmitted) {
          this.popupOpen();
        }

        if (this.delay && this.delay.includes('delayed') && !this.isSubmitted) {
          this.showDelayed();
        }

        if (this.delay === 'bottom' && !this.isSubmitted) {
          this.showOnBottomReached();
        }

        if (this.delay === 'idle' && !this.isSubmitted) {
          this.showOnIdle();
        }
      }

      showDelayed() {
        const seconds = this.delay.includes('_') ? parseInt(this.delay.split('_')[1]) : 10;

        // Show popup after specific seconds
        setTimeout(() => {
          this.popupOpen();
        }, seconds * 1000);
      }

      showOnIdle() {
        let timer = 0;
        let idleTime = 60000;
        const documentEvents = ['mousemove', 'mousedown', 'click', 'touchmove', 'touchstart', 'touchend', 'keydown', 'keypress'];
        const windowEvents = ['load', 'resize', 'scroll'];

        const startTimer = () => {
          timer = setTimeout(() => {
            timer = 0;
            this.popupOpen();
          }, idleTime);

          documentEvents.forEach((eventType) => {
            document.addEventListener(eventType, resetTimer);
          });

          windowEvents.forEach((eventType) => {
            window.addEventListener(eventType, resetTimer);
          });
        };

        const resetTimer = () => {
          if (timer) {
            clearTimeout(timer);
          }
          e;
          documentEvents.forEach((eventType) => {
            document.removeEventListener(eventType, resetTimer);
          });

          windowEvents.forEach((eventType) => {
            window.removeEventListener(eventType, resetTimer);
          });

          startTimer();
        };

        startTimer();
      }

      showOnBottomReached() {
        document.addEventListener('theme:scroll', this.showOnScrollEvent);
      }

      showOnScroll() {
        if (window.scrollY + window.innerHeight >= document.body.clientHeight) {
          this.popupOpen();
          document.removeEventListener('theme:scroll', this.showOnScrollEvent);
        }
      }

      disconnectedCallback() {
        document.removeEventListener('theme:scroll', this.showOnScrollEvent);
      }
    }

    class PopupNewsletter extends PopupComponent {
      constructor() {
        super();

        this.form = this.popup.querySelector(selectors$f.newsletterForm);
        this.heading = this.popup.querySelector(selectors$f.newsletterHeading);
        this.newsletterField = this.popup.querySelector(selectors$f.newsletterField);
      }

      connectedCallback() {
        const cookieExists = this.cookie?.read() !== false;
        const submissionSuccess = window.location.search.indexOf('?customer_posted=true') !== -1;
        const classesString = [...this.classList].toString();
        const isPositionBottom = classesString.includes(classes$d.bottom);
        const targetMobile = this.popup.classList.contains(classes$d.mobile);
        const targetDesktop = this.popup.classList.contains(classes$d.desktop);
        const isMobileView = window.theme.isMobile();

        let targetMatches = true;

        if ((targetMobile && !isMobileView) || (targetDesktop && isMobileView)) {
          targetMatches = false;
        }

        if (!targetMatches) {
          super.a11y.removeTrapFocus();
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
          return;
        }

        if (!cookieExists || window.Shopify.designMode) {
          if (!window.Shopify.designMode && !window.location.pathname.endsWith('/challenge')) {
            super.showPopupEvents();
          }

          if (this.form && this.form.classList.contains(classes$d.success)) {
            super.popupOpen();
            this.cookie.write();
          }

          this.popup.addEventListener('theme:popup:onclose', () => this.cookie.write());
        }

        if (submissionSuccess) {
          this.delay = 0;
        }

        if (!cookieExists || window.Shopify.designMode) {
          this.show();

          if (this.form.classList.contains(classes$d.success)) {
            this.popupOpen();
            this.cookie.write();
          }
        }

        if (isPositionBottom) {
          this.observeCartBar();
        }
      }

      show() {
        if (!window.location.pathname.endsWith('/challenge')) {
          if (!window.Shopify.designMode) {
            super.showPopupEvents();
          } else {
            super.popupOpen();
          }
        }

        this.showForm();
        this.inputField();

        this.popup.addEventListener('theme:popup:onclose', () => this.cookie.write());
      }

      observeCartBar() {
        this.cartBar = document.getElementById(selectors$f.cartBar);

        if (!this.cartBar) return;

        const config = {attributes: true, childList: false, subtree: false};
        let isVisible = this.cartBar.classList.contains(classes$d.isVisible);
        document.body.classList.toggle(classes$d.cartBarVisible, isVisible);

        // Callback function to execute when mutations are observed
        const callback = (mutationList) => {
          for (const mutation of mutationList) {
            if (mutation.type === 'attributes') {
              isVisible = mutation.target.classList.contains(classes$d.isVisible);
              document.body.classList.toggle(classes$d.cartBarVisible, isVisible);
            }
          }
        };

        this.observer = new MutationObserver(callback);
        this.observer.observe(this.cartBar, config);
      }

      showForm() {
        this.heading?.addEventListener('click', (event) => {
          event.preventDefault();

          this.heading.classList.add(classes$d.hidden);
          this.form.classList.remove(classes$d.hidden);
          this.newsletterField.focus();
        });

        this.heading?.addEventListener('keyup', (event) => {
          if (event.code === 'Enter') {
            this.heading.dispatchEvent(new Event('click'));
          }
        });
      }

      inputField() {
        const setClass = () => {
          // Reset timer if exists and is active
          if (this.resetClassTimer) {
            clearTimeout(this.resetClassTimer);
          }

          if (this.newsletterField.value !== '') {
            this.popup.classList.add(classes$d.hasValue);
          }
        };

        const unsetClass = () => {
          // Reset timer if exists and is active
          if (this.resetClassTimer) {
            clearTimeout(this.resetClassTimer);
          }

          // Reset class
          this.resetClassTimer = setTimeout(() => {
            this.popup.classList.remove(classes$d.hasValue);
          }, 2000);
        };

        this.newsletterField.addEventListener('input', setClass);
        this.newsletterField.addEventListener('focus', setClass);
        this.newsletterField.addEventListener('focusout', unsetClass);
      }

      disconnectedCallback() {
        if (this.observer) {
          this.observer.disconnect();
        }
      }
    }

    if (!customElements.get('popup-component')) {
      customElements.define('popup-component', PopupComponent);
    }

    if (!customElements.get('popup-newsletter')) {
      customElements.define('popup-newsletter', PopupNewsletter);
    }

    const selectors$e = {
      allVisibleElements: '[role="option"]',
      ariaSelected: '[aria-selected="true"]',
      popularSearches: '[data-popular-searches]',
      predictiveSearch: 'predictive-search',
      predictiveSearchResults: '[data-predictive-search-results]',
      predictiveSearchStatus: '[data-predictive-search-status]',
      searchInput: 'input[type="search"]',
      searchPopdown: '[data-popdown]',
      searchResultsLiveRegion: '[data-predictive-search-live-region-count-value]',
      searchResultsGroupsWrapper: '[data-search-results-groups-wrapper]',
      searchForText: '[data-predictive-search-search-for-text]',
      sectionPredictiveSearch: '#shopify-section-predictive-search',
      selectedLink: '[aria-selected="true"] a',
      selectedOption: '[aria-selected="true"] a, button[aria-selected="true"]',
    };

    if (!customElements.get('predictive-search')) {
      customElements.define(
        'predictive-search',

        class PredictiveSearch extends HeaderSearchForm {
          constructor() {
            super();

            this.a11y = window.theme.a11y;
            this.abortController = new AbortController();
            this.allPredictiveSearchInstances = document.querySelectorAll(selectors$e.predictiveSearch);
            this.cachedResults = {};
            this.input = this.querySelector(selectors$e.searchInput);
            this.isOpen = false;
            this.predictiveSearchResults = this.querySelector(selectors$e.predictiveSearchResults);
            this.searchPopdown = this.closest(selectors$e.searchPopdown);
            this.popularSearches = this.searchPopdown?.querySelector(selectors$e.popularSearches);
            this.searchTerm = '';
          }

          connectedCallback() {
            this.input.addEventListener('focus', this.onFocus.bind(this));
            this.input.form.addEventListener('submit', this.onFormSubmit.bind(this));

            this.addEventListener('focusout', this.onFocusOut.bind(this));
            this.addEventListener('keyup', this.onKeyup.bind(this));
            this.addEventListener('keydown', this.onKeydown.bind(this));
          }

          getQuery() {
            return this.input.value.trim();
          }

          onChange() {
            super.onChange();
            const newSearchTerm = this.getQuery();

            if (!this.searchTerm || !newSearchTerm.startsWith(this.searchTerm)) {
              // Remove the results when they are no longer relevant for the new search term
              // so they don't show up when the dropdown opens again
              this.querySelector(selectors$e.searchResultsGroupsWrapper)?.remove();
            }

            // Update the term asap, don't wait for the predictive search query to finish loading
            this.updateSearchForTerm(this.searchTerm, newSearchTerm);

            this.searchTerm = newSearchTerm;

            if (!this.searchTerm.length) {
              this.reset();
              return;
            }

            this.getSearchResults(this.searchTerm);
          }

          onFormSubmit(event) {
            if (!this.getQuery().length || this.querySelector(selectors$e.selectedLink)) event.preventDefault();
          }

          onFormReset(event) {
            super.onFormReset(event);
            if (super.shouldResetForm()) {
              this.searchTerm = '';
              this.abortController.abort();
              this.abortController = new AbortController();
              this.closeResults(true);
            }
          }

          shouldResetForm() {
            return !document.querySelector(selectors$e.selectedLink);
          }

          onFocus() {
            const currentSearchTerm = this.getQuery();

            if (!currentSearchTerm.length) return;

            if (this.searchTerm !== currentSearchTerm) {
              // Search term was changed from other search input, treat it as a user change
              this.onChange();
            } else if (this.getAttribute('results') === 'true') {
              this.open();
            } else {
              this.getSearchResults(this.searchTerm);
            }
          }

          onFocusOut() {
            setTimeout(() => {
              if (!this.contains(document.activeElement)) this.close();
            });
          }

          onKeyup(event) {
            if (!this.getQuery().length) this.close(true);
            event.preventDefault();

            switch (event.code) {
              case 'ArrowUp':
                this.switchOption('up');
                break;
              case 'ArrowDown':
                this.switchOption('down');
                break;
              case 'Enter':
                this.selectOption();
                break;
            }
          }

          onKeydown(event) {
            // Prevent the cursor from moving in the input when using the up and down arrow keys
            if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
              event.preventDefault();
            }
          }

          updateSearchForTerm(previousTerm, newTerm) {
            const searchForTextElement = this.querySelector(selectors$e.searchForText);
            const currentButtonText = searchForTextElement?.innerText;

            if (currentButtonText) {
              if (currentButtonText.match(new RegExp(previousTerm, 'g'))?.length > 1) {
                // The new term matches part of the button text and not just the search term, do not replace to avoid mistakes
                return;
              }
              const newButtonText = currentButtonText.replace(previousTerm, newTerm);
              searchForTextElement.innerText = newButtonText;
            }
          }

          switchOption(direction) {
            if (!this.getAttribute('open')) return;

            const moveUp = direction === 'up';
            const selectedElement = this.querySelector(selectors$e.ariaSelected);

            // Filter out hidden elements (duplicated page and article resources) thanks
            // to this https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
            const allVisibleElements = Array.from(this.querySelectorAll(selectors$e.allVisibleElements)).filter((element) => element.offsetParent !== null);

            let activeElementIndex = 0;

            if (moveUp && !selectedElement) return;

            let selectedElementIndex = -1;
            let i = 0;

            while (selectedElementIndex === -1 && i <= allVisibleElements.length) {
              if (allVisibleElements[i] === selectedElement) {
                selectedElementIndex = i;
              }
              i++;
            }

            this.statusElement.textContent = '';

            if (!moveUp && selectedElement) {
              activeElementIndex = selectedElementIndex === allVisibleElements.length - 1 ? 0 : selectedElementIndex + 1;
            } else if (moveUp) {
              activeElementIndex = selectedElementIndex === 0 ? allVisibleElements.length - 1 : selectedElementIndex - 1;
            }

            if (activeElementIndex === selectedElementIndex) return;

            const activeElement = allVisibleElements[activeElementIndex];

            activeElement.setAttribute('aria-selected', true);
            if (selectedElement) selectedElement.setAttribute('aria-selected', false);

            this.input.setAttribute('aria-activedescendant', activeElement.id);
          }

          selectOption() {
            const selectedOption = this.querySelector(selectors$e.selectedOption);

            if (selectedOption) selectedOption.click();
          }

          getSearchResults(searchTerm) {
            const queryKey = searchTerm.replace(' ', '-').toLowerCase();
            this.setLiveRegionLoadingState();

            if (this.cachedResults[queryKey]) {
              this.renderSearchResults(this.cachedResults[queryKey]);
              return;
            }

            fetch(`${theme.routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&section_id=predictive-search`, {signal: this.abortController.signal})
              .then((response) => {
                if (!response.ok) {
                  var error = new Error(response.status);
                  this.close();
                  throw error;
                }

                return response.text();
              })
              .then((text) => {
                const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector(selectors$e.sectionPredictiveSearch).innerHTML;
                // Save bandwidth keeping the cache in all instances synced
                this.allPredictiveSearchInstances.forEach((predictiveSearchInstance) => {
                  predictiveSearchInstance.cachedResults[queryKey] = resultsMarkup;
                });
                this.renderSearchResults(resultsMarkup);
              })
              .catch((error) => {
                if (error?.code === 20) {
                  // Code 20 means the call was aborted
                  return;
                }
                this.close();
                throw error;
              });
          }

          setLiveRegionLoadingState() {
            this.statusElement = this.statusElement || this.querySelector(selectors$e.predictiveSearchStatus);
            this.loadingText = this.loadingText || this.getAttribute('data-loading-text');

            this.setLiveRegionText(this.loadingText);
            this.setAttribute('loading', true);
          }

          setLiveRegionText(statusText) {
            this.statusElement.setAttribute('aria-hidden', 'false');
            this.statusElement.textContent = statusText;

            setTimeout(() => {
              this.statusElement.setAttribute('aria-hidden', 'true');
            }, 1000);
          }

          renderSearchResults(resultsMarkup) {
            this.predictiveSearchResults.innerHTML = resultsMarkup;

            this.setAttribute('results', true);

            this.setLiveRegionResults();
            this.open();
          }

          setLiveRegionResults() {
            this.removeAttribute('loading');
            this.setLiveRegionText(this.querySelector(selectors$e.searchResultsLiveRegion).textContent);
          }

          open() {
            this.setAttribute('open', true);
            this.input.setAttribute('aria-expanded', true);
            this.isOpen = true;
            this.predictiveSearchResults.style.setProperty('--results-height', `${window.visualViewport.height - this.predictiveSearchResults.getBoundingClientRect().top}px`);
          }

          close(clearSearchTerm = false) {
            this.closeResults(clearSearchTerm);
            this.isOpen = false;
            this.predictiveSearchResults.style.removeProperty('--results-height');
          }

          closeResults(clearSearchTerm = false) {
            if (clearSearchTerm) {
              this.input.value = '';
              this.removeAttribute('results');
            }
            const selected = this.querySelector(selectors$e.ariaSelected);

            if (selected) selected.setAttribute('aria-selected', false);

            this.input.setAttribute('aria-activedescendant', '');
            this.removeAttribute('loading');
            this.removeAttribute('open');
            this.input.setAttribute('aria-expanded', false);
            this.predictiveSearchResults?.removeAttribute('style');
          }

          reset() {
            this.predictiveSearchResults.innerHTML = '';

            this.input.val = '';
            this.a11y.removeTrapFocus();

            if (this.popularSearches) {
              this.input.dispatchEvent(new Event('blur', {bubbles: false}));
              this.a11y.trapFocus(this.searchPopdown, {
                elementToFocus: this.input,
              });
            }
          }
        }
      );
    }

    function Listeners() {
      this.entries = [];
    }

    Listeners.prototype.add = function (element, event, fn) {
      this.entries.push({element: element, event: event, fn: fn});
      element.addEventListener(event, fn);
    };

    Listeners.prototype.removeAll = function () {
      this.entries = this.entries.filter(function (listener) {
        listener.element.removeEventListener(listener.event, listener.fn);
        return false;
      });
    };

    /**
     * Convert the Object (with 'name' and 'value' keys) into an Array of values, then find a match & return the variant (as an Object)
     * @param {Object} product Product JSON object
     * @param {Object} collection Object with 'name' and 'value' keys (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
     * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
     */
    function getVariantFromSerializedArray(product, collection) {
      _validateProductStructure(product);

      // If value is an array of options
      var optionArray = _createOptionArrayFromOptionCollection(product, collection);
      return getVariantFromOptionArray(product, optionArray);
    }

    /**
     * Find a match in the project JSON (using Array with option values) and return the variant (as an Object)
     * @param {Object} product Product JSON object
     * @param {Array} options List of submitted values (e.g. ['36', 'Black'])
     * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
     */
    function getVariantFromOptionArray(product, options) {
      _validateProductStructure(product);
      _validateOptionsArray(options);

      var result = product.variants.filter(function (variant) {
        return options.every(function (option, index) {
          return variant.options[index] === option;
        });
      });

      return result[0] || null;
    }

    /**
     * Creates an array of selected options from the object
     * Loops through the project.options and check if the "option name" exist (product.options.name) and matches the target
     * @param {Object} product Product JSON object
     * @param {Array} collection Array of object (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
     * @returns {Array} The result of the matched values. (e.g. ['36', 'Black'])
     */
    function _createOptionArrayFromOptionCollection(product, collection) {
      _validateProductStructure(product);
      _validateSerializedArray(collection);

      var optionArray = [];

      collection.forEach(function (option) {
        for (var i = 0; i < product.options.length; i++) {
          var name = product.options[i].name || product.options[i];
          if (name.toLowerCase() === option.name.toLowerCase()) {
            optionArray[i] = option.value;
            break;
          }
        }
      });

      return optionArray;
    }

    /**
     * Check if the product data is a valid JS object
     * Error will be thrown if type is invalid
     * @param {object} product Product JSON object
     */
    function _validateProductStructure(product) {
      if (typeof product !== 'object') {
        throw new TypeError(product + ' is not an object.');
      }

      if (Object.keys(product).length === 0 && product.constructor === Object) {
        throw new Error(product + ' is empty.');
      }
    }

    /**
     * Validate the structure of the array
     * It must be formatted like jQuery's serializeArray()
     * @param {Array} collection Array of object [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }]
     */
    function _validateSerializedArray(collection) {
      if (!Array.isArray(collection)) {
        throw new TypeError(collection + ' is not an array.');
      }

      if (collection.length === 0) {
        throw new Error(collection + ' is empty.');
      }

      if (collection[0].hasOwnProperty('name')) {
        if (typeof collection[0].name !== 'string') {
          throw new TypeError('Invalid value type passed for name of option ' + collection[0].name + '. Value should be string.');
        }
      } else {
        throw new Error(collection[0] + 'does not contain name key.');
      }
    }

    /**
     * Validate the structure of the array
     * It must be formatted as list of values
     * @param {Array} collection Array of object (e.g. ['36', 'Black'])
     */
    function _validateOptionsArray(options) {
      if (Array.isArray(options) && typeof options[0] === 'object') {
        throw new Error(options + 'is not a valid array of options.');
      }
    }

    var selectors$d = {
      idInput: '[name="id"]',
      planInput: '[name="selling_plan"]',
      optionInput: '[name^="options"]',
      quantityInput: '[name="quantity"]',
      propertyInput: '[name^="properties"]',
      subSelectors: '[data-subscription-selectors]',
      subsToggle: '[data-toggles-group]',
    };

    // Public Methods
    // -----------------------------------------------------------------------------

    /**
     * Returns a URL with a variant ID query parameter. Useful for updating window.history
     * with a new URL based on the currently select product variant.
     * @param {string} url - The URL you wish to append the variant ID to
     * @param {number} id  - The variant ID you wish to append to the URL
     * @returns {string} - The new url which includes the variant ID query parameter
     */

    function getUrlWithVariant(url, id) {
      if (/variant=/.test(url)) {
        return url.replace(/(variant=)[^&]+/, '$1' + id);
      } else if (/\?/.test(url)) {
        return url.concat('&variant=').concat(id);
      }

      return url.concat('?variant=').concat(id);
    }

    /**
     * Constructor class that creates a new instance of a product form controller.
     *
     * @param {Element} element - DOM element which is equal to the <form> node wrapping product form inputs
     * @param {Object} product - A product object
     * @param {Object} options - Optional options object
     * @param {Function} options.onOptionChange - Callback for whenever an option input changes
     * @param {Function} options.onPlanChange - Callback for changes to name=selling_plan
     * @param {Function} options.onQuantityChange - Callback for whenever an quantity input changes
     * @param {Function} options.onPropertyChange - Callback for whenever a property input changes
     * @param {Function} options.onFormSubmit - Callback for whenever the product form is submitted
     */
    class ProductFormReader {
      constructor(element, product, options) {
        this.element = element;
        this.product = this._validateProductObject(product);
        this.variantElement = this.element.querySelector(selectors$d.idInput);

        options = options || {};

        this._listeners = new Listeners();
        this._listeners.add(this.element, 'submit', this._onSubmit.bind(this, options));

        this.optionInputs = this._initInputs(selectors$d.optionInput, options.onOptionChange);

        this.planInputs = this._initInputs(selectors$d.planInput, options.onPlanChange);

        this.quantityInputs = this._initInputs(selectors$d.quantityInput, options.onQuantityChange);

        this.propertyInputs = this._initInputs(selectors$d.propertyInput, options.onPropertyChange);
      }

      /**
       * Cleans up all event handlers that were assigned when the Product Form was constructed.
       * Useful for use when a section needs to be reloaded in the theme editor.
       */
      destroy() {
        this._listeners.removeAll();
      }

      /**
       * Getter method which returns the array of currently selected option values
       *
       * @returns {Array} An array of option values
       */
      options() {
        return this._serializeInputValues(this.optionInputs, function (item) {
          var regex = /(?:^(options\[))(.*?)(?:\])/;
          item.name = regex.exec(item.name)[2]; // Use just the value between 'options[' and ']'
          return item;
        });
      }

      /**
       * Getter method which returns the currently selected variant, or `null` if variant
       * doesn't exist.
       *
       * @returns {Object|null} Variant object
       */
      variant() {
        const opts = this.options();
        if (opts.length) {
          return getVariantFromSerializedArray(this.product, opts);
        } else {
          return this.product.variants[0];
        }
      }

      /**
       * Getter method which returns the current selling plan, or `null` if plan
       * doesn't exist.
       *
       * @returns {Object|null} Variant object
       */
      plan(variant) {
        let plan = {
          allocation: null,
          group: null,
          detail: null,
        };

        const sellingPlanSelect = this.element.querySelector(`${selectors$d.planInput}`);
        const sellingPlanChecked = this.element.querySelector(`${selectors$d.subSelectors} ${selectors$d.subsToggle}:checked`);

        if (!sellingPlanChecked) return null;
        if (!sellingPlanChecked.value) return null;

        const sellingPlanCheckedValue = sellingPlanSelect.value;
        const id = sellingPlanCheckedValue && sellingPlanCheckedValue !== '' ? sellingPlanCheckedValue : null;

        if (id && variant) {
          plan.allocation = variant.selling_plan_allocations.find(function (item) {
            return item.selling_plan_id.toString() === id.toString();
          });
        }
        if (plan.allocation) {
          plan.group = this.product.selling_plan_groups.find(function (item) {
            return item.id.toString() === plan.allocation.selling_plan_group_id.toString();
          });
        }
        if (plan.group) {
          plan.detail = plan.group.selling_plans.find(function (item) {
            return item.id.toString() === id.toString();
          });
        }

        if (plan && plan.allocation && plan.detail && plan.allocation) {
          return plan;
        } else return null;
      }

      selectedOptionValues() {
        const selectedOptionValues = Array.from(this.element.querySelectorAll(`${selectors$d.optionInput}`)).map((input) => input.value);
        return {
          optionValues: selectedOptionValues,
        };
      }

      /**
       * Getter method which returns a collection of objects containing name and values
       * of property inputs
       *
       * @returns {Array} Collection of objects with name and value keys
       */
      properties() {
        return this._serializeInputValues(this.propertyInputs, function (item) {
          var regex = /(?:^(properties\[))(.*?)(?:\])/;
          item.name = regex.exec(item.name)[2]; // Use just the value between 'properties[' and ']'
          return item;
        });
      }

      /**
       * Getter method which returns the current quantity or 1 if no quantity input is
       * included in the form
       *
       * @returns {Array} Collection of objects with name and value keys
       */
      quantity() {
        return this.quantityInputs[0] ? Number.parseInt(this.quantityInputs[0].value, 10) : 1;
      }

      getFormState() {
        const variant = this.variant();
        return {
          options: this.options(),
          variant: variant,
          properties: this.properties(),
          quantity: this.quantity(),
          plan: this.plan(variant),
          selected: this.selectedOptionValues(),
        };
      }

      // Private Methods
      // -----------------------------------------------------------------------------
      _setIdInputValue(variant) {
        if (variant && variant.id) {
          this.variantElement.value = variant.id.toString();
        } else {
          this.variantElement.value = '';
        }

        this.variantElement.dispatchEvent(new Event('change'));
      }

      _onSubmit(options, event) {
        event.dataset = this.getFormState();
        if (options.onFormSubmit) {
          options.onFormSubmit(event);
        }
      }

      _onOptionChange(event) {
        this._setIdInputValue(event.dataset.variant);
      }

      _onFormEvent(cb) {
        if (typeof cb === 'undefined') {
          return Function.prototype.bind();
        }

        return function (event) {
          event.dataset = this.getFormState();
          this._setIdInputValue(event.dataset.variant);
          cb(event);
        }.bind(this);
      }

      _initInputs(selector, cb) {
        var elements = Array.prototype.slice.call(this.element.querySelectorAll(selector));

        return elements.map(
          function (element) {
            this._listeners.add(element, 'change', this._onFormEvent(cb));
            return element;
          }.bind(this)
        );
      }

      _serializeInputValues(inputs, transform) {
        return inputs.reduce(function (options, input) {
          if (
            input.checked || // If input is a checked (means type radio or checkbox)
            (input.type !== 'radio' && input.type !== 'checkbox') // Or if its any other type of input
          ) {
            options.push(transform({name: input.name, value: input.value}));
          }

          return options;
        }, []);
      }

      _validateProductObject(product) {
        if (typeof product !== 'object') {
          throw new TypeError(product + ' is not an object.');
        }

        if (typeof product.variants[0].options === 'undefined') {
          throw new TypeError('Product object is invalid. Make sure you use the product object that is output from {{ product | json }} or from the http://[your-product-url].js route');
        }
        return product;
      }
    }

    const selectors$c = {
      optionPosition: 'data-option-position',
      optionInput: '[name^="options"], [data-popout-option]',
      optionInputCurrent: '[name^="options"]:checked, [name^="options"][type="hidden"]',
      selectOptionValue: 'data-value',
      popout: '[data-popout]',
    };

    const classes$c = {
      soldOut: 'sold-out',
      unavailable: 'unavailable',
      sale: 'sale',
    };

    /**
     * Variant Sellout Precrime Click Preview
     * I think of this like the precrime machine in Minority report.  It gives a preview
     * of every possible click action, given the current form state.  The logic is:
     *
     * for each clickable name=options[] variant selection element
     * find the value of the form if the element were clicked
     * lookup the variant with those value in the product json
     * clear the classes, add .unavailable if it's not found,
     * and add .sold-out if it is out of stock
     *
     * Caveat: we rely on the option position so we don't need
     * to keep a complex map of keys and values.
     */

    class SelloutVariants {
      constructor(section, productJSON) {
        this.container = section;
        this.productJSON = productJSON;
        this.optionElements = this.container.querySelectorAll(selectors$c.optionInput);

        if (this.productJSON && this.optionElements.length) {
          this.init();
        }
      }

      init() {
        this.update();
      }

      update() {
        this.getCurrentState();

        this.optionElements.forEach((el) => {
          const parent = el.closest(`[${selectors$c.optionPosition}]`);
          if (!parent) return;
          const val = el.value || el.getAttribute(selectors$c.selectOptionValue);
          const positionString = parent.getAttribute(selectors$c.optionPosition);
          // subtract one because option.position in liquid does not count form zero, but JS arrays do
          const position = parseInt(positionString, 10) - 1;
          const selectPopout = el.closest(selectors$c.popout);

          let newVals = [...this.selections];
          newVals[position] = val;

          const found = this.productJSON.variants.find((element) => {
            // only return true if every option matches our hypothetical selection
            let perfectMatch = true;
            for (let index = 0; index < newVals.length; index++) {
              if (element.options[index] !== newVals[index]) {
                perfectMatch = false;
              }
            }
            return perfectMatch;
          });

          el.classList.remove(classes$c.soldOut, classes$c.unavailable);
          el.parentNode.classList.remove(classes$c.sale);

          if (selectPopout) {
            selectPopout.classList.remove(classes$c.soldOut, classes$c.unavailable, classes$c.sale);
          }

          if (typeof found === 'undefined') {
            el.classList.add(classes$c.unavailable);

            if (selectPopout) {
              selectPopout.classList.add(classes$c.unavailable);
            }
          } else if (found && found.available === false) {
            el.classList.add(classes$c.soldOut);

            if (selectPopout) {
              selectPopout.classList.add(classes$c.soldOut);
            }
          }

          if (found && found.compare_at_price > found.price && theme.settings.variantOnSale) {
            el.parentNode.classList.add(classes$c.sale);
          }
        });
      }

      getCurrentState() {
        this.selections = [];

        const options = this.container.querySelectorAll(selectors$c.optionInputCurrent);
        if (options.length) {
          options.forEach((element) => {
            const elemValue = element.value;
            if (elemValue && elemValue !== '') {
              this.selections.push(elemValue);
            }
          });
        }
      }
    }

    const selectors$b = {
      product: '[data-product]',
      productForm: '[data-product-form]',
      productNotification: 'product-notification',
      variantTitle: '[data-variant-title]',
      notificationProduct: '[data-notification-product]',
      addToCart: '[data-add-to-cart]',
      addToCartText: '[data-add-to-cart-text]',
      cartPage: '[data-cart-page]',
      comparePrice: '[data-compare-price]',
      comparePriceText: '[data-compare-text]',
      oneTimeDiscountBadge: '[data-one-time-discount-badge]',
      subscriptionDiscountBadge: '[data-subscription-discount-badge]',
      finalSaleBadge: '[data-final-sale-badge]',
      formWrapper: '[data-form-wrapper]',
      originalSelectorId: '[data-product-select]',
      priceWrapper: '[data-price-wrapper]',
      priceOneTimeWrapper: '[data-price-one-time-wrapper]',
      priceSubscriptionWrapper: '[data-price-subscription-wrapper]',
      productImages: 'product-images',
      productImagesWrapper: '.product__page-gallery',
      productImage: '[data-product-image]',
      productMediaList: '[data-product-media-list]',
      productJson: '[data-product-json]',
      productPrice: '[data-product-price]',
      unitPrice: '[data-product-unit-price]',
      unitBase: '[data-product-base]',
      unitWrapper: '[data-product-unit]',
      isPreOrder: '[data-product-preorder]',
      productSlide: '.product__slide',
      subPrices: '[data-subscription-watch-price]',
      subSelectors: '[data-subscription-selectors]',
      subsToggle: '[data-toggles-group]',
      subsChild: 'data-group-toggle',
      subDescription: '[data-plan-description]',
      section: '[data-section-type]',
      variantSku: '[data-variant-sku]',
      variantFinalSaleMeta: '[data-variant-final-sale-metafield]',
      variantButtons: '[data-variant-buttons]',
      variantOptionImage: '[data-variant-option-image]',
      quickAddModal: '[data-quick-add-modal]',
      priceOffAmount: '[data-price-off-amount]',
      priceOffBadge: '[data-price-off-badge]',
      priceOffType: '[data-price-off-type]',
      priceOffWrap: '[data-price-off]',
      remainingCount: '[data-remaining-count]',
      remainingMax: '[data-remaining-max]',
      remainingWrapper: '[data-remaining-wrapper]',
      remainingJSON: '[data-product-remaining-json]',
      optionValue: '[data-option-value]',
      optionPosition: '[data-option-position]',
      installment: '[data-product-form-installment]',
      inputId: 'input[name="id"]',
    };

    const classes$b = {
      hidden: 'hidden',
      variantSoldOut: 'variant--soldout',
      variantUnavailable: 'variant--unavailable',
      productPriceSale: 'product__price--sale',
      remainingLow: 'count-is-low',
      remainingIn: 'count-is-in',
      remainingOut: 'count-is-out',
      remainingUnavailable: 'count-is-unavailable',
    };

    const attributes$8 = {
      remainingMaxAttr: 'data-remaining-max',
      enableHistoryState: 'data-enable-history-state',
      notificationPopup: 'data-notification-popup',
      faderDesktop: 'data-fader-desktop',
      faderMobile: 'data-fader-mobile',
      optionPosition: 'data-option-position',
      imageId: 'data-image-id',
      mediaId: 'data-media-id',
      quickAddButton: 'data-quick-add-btn',
      finalSale: 'data-final-sale',
      variantImageScroll: 'data-variant-image-scroll',
    };

    class ProductForm extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        this.cartAddEvents();

        this.container = this.closest(selectors$b.section) || this.closest(selectors$b.quickAddModal);
        if (!this.container) return;

        this.sectionId = this.container.dataset.sectionId;
        this.product = this.container.querySelector(selectors$b.product);
        this.productForm = this.container.querySelector(selectors$b.productForm);
        this.productNotification = this.container.querySelector(selectors$b.productNotification);
        this.productImagesWrapper = this.container.querySelector(selectors$b.productImagesWrapper);
        this.productImages = this.productImagesWrapper?.querySelector(selectors$b.productImages);
        this.isQuickView = this.hasAttribute('data-quick-view');
        this.productMediaList = this.container.querySelector(selectors$b.productMediaList);
        this.installmentForm = this.container.querySelector(selectors$b.installment);
        this.skuWrapper = this.container.querySelector(selectors$b.variantSku);
        this.sellout = null;
        this.variantImageScroll = this.container.getAttribute(attributes$8.variantImageScroll) === 'true';

        this.priceOffWrap = this.container.querySelector(selectors$b.priceOffWrap);
        this.priceOffAmount = this.container.querySelector(selectors$b.priceOffAmount);
        this.priceOffType = this.container.querySelector(selectors$b.priceOffType);
        this.planDescription = this.container.querySelector(selectors$b.subDescription);

        this.remainingWrapper = this.container.querySelector(selectors$b.remainingWrapper);

        if (this.remainingWrapper) {
          const remainingMaxWrap = this.container.querySelector(selectors$b.remainingMax);
          if (remainingMaxWrap) {
            this.remainingMaxInt = parseInt(remainingMaxWrap.getAttribute(attributes$8.remainingMaxAttr), 10);
            this.remainingCount = this.container.querySelector(selectors$b.remainingCount);
            this.remainingJSONWrapper = this.container.querySelector(selectors$b.remainingJSON);
            this.remainingJSON = null;

            if (this.remainingJSONWrapper && this.remainingJSONWrapper.innerHTML !== '') {
              this.remainingJSON = JSON.parse(this.remainingJSONWrapper.innerHTML);
            } else {
              console.warn('Missing product quantity JSON');
            }
          }
        }

        this.enableHistoryState = this.container.getAttribute(attributes$8.enableHistoryState) === 'true';
        this.hasUnitPricing = this.container.querySelector(selectors$b.unitWrapper);
        this.subSelectors = this.container.querySelector(selectors$b.subSelectors);
        this.subPrices = this.container.querySelector(selectors$b.subPrices);
        this.isPreOrder = this.container.querySelector(selectors$b.isPreOrder);

        let productJSON = null;
        const productElemJSON = this.container.querySelector(selectors$b.productJson);
        if (productElemJSON) {
          productJSON = productElemJSON.innerHTML;
        }
        if (productJSON) {
          this.productJSON = JSON.parse(productJSON);
          this.linkForm();
          this.sellout = new SelloutVariants(this.container, this.productJSON);
        } else {
          console.error('Missing product JSON');
        }

        this.variantOptionImages = this.container.querySelectorAll(selectors$b.variantOptionImage);
        this.variantButtons = this.container.querySelectorAll(selectors$b.variantButtons);
        if (this.variantOptionImages.length > 1) {
          this.optionImagesWidth();
        }
      }

      cartAddEvents() {
        this.buttonATC = this.querySelector(selectors$b.addToCart);

        this.buttonATC.addEventListener('click', (e) => {
          e.preventDefault();

          document.dispatchEvent(
            new CustomEvent('theme:cart:add', {
              detail: {
                button: this.buttonATC,
              },
              bubbles: false,
            })
          );

          if (!this.closest(selectors$b.quickAddModal)) {
            window.theme.a11y.lastElement = this.buttonATC;
          }
        });
      }

      destroy() {
        this.productForm.destroy();
      }

      linkForm() {
        this.productForm = new ProductFormReader(this.container, this.productJSON, {
          onOptionChange: this.onOptionChange.bind(this),
          onPlanChange: this.onPlanChange.bind(this),
        });
        this.pushState(this.productForm.getFormState(), true);
        this.subsToggleListeners();
      }

      onOptionChange(evt) {
        this.pushState(evt.dataset);
      }

      onPlanChange(evt) {
        if (this.subPrices) {
          this.pushState(evt.dataset);
        }
      }

      pushState(formState, init = false) {
        this.productState = this.setProductState(formState);
        this.updateAddToCartState(formState);
        this.updateNotificationForm(formState);
        this.updateProductPrices(formState);
        this.updateProductImage(formState);
        this.updateProductGallery(formState);
        this.updateSaleText(formState);
        this.updateSku(formState);
        this.updateSubscriptionText(formState);
        this.updateRemaining(formState);
        this.updateLegend(formState);
        this.fireHookEvent(formState);
        this.sellout?.update(formState);

        if (this.enableHistoryState && !init) {
          this.updateHistoryState(formState);
        }
      }

      updateAddToCartState(formState) {
        const variant = formState.variant;
        let addText = theme.strings.addToCart;
        const priceWrapper = this.container.querySelectorAll(selectors$b.priceWrapper);
        const addToCart = this.container.querySelectorAll(selectors$b.addToCart);
        const addToCartText = this.container.querySelectorAll(selectors$b.addToCartText);
        const formWrapper = this.container.querySelectorAll(selectors$b.formWrapper);

        if (this.installmentForm && variant) {
          const installmentInput = this.installmentForm.querySelector(selectors$b.inputId);
          installmentInput.value = variant.id;
          installmentInput.dispatchEvent(new Event('change', {bubbles: true}));
        }

        if (this.isPreOrder) {
          addText = theme.strings.preOrder;
        }

        if (priceWrapper.length && variant) {
          priceWrapper.forEach((element) => {
            element.classList.remove(classes$b.hidden);
          });
        }

        addToCart?.forEach((button) => {
          if (button.hasAttribute(attributes$8.quickAddButton)) return;

          if (variant) {
            if (variant.available) {
              button.disabled = false;
            } else {
              button.disabled = true;
            }
          } else {
            button.disabled = true;
          }
        });

        addToCartText?.forEach((element) => {
          let btnText = addText;
          if (variant) {
            if (!variant.available) {
              btnText = theme.strings.soldOut;
            }
          } else {
            btnText = theme.strings.unavailable;
          }

          element.textContent = btnText;
        });

        if (formWrapper.length) {
          formWrapper.forEach((element) => {
            if (variant) {
              if (variant.available) {
                element.classList.remove(classes$b.variantSoldOut, classes$b.variantUnavailable);
              } else {
                element.classList.add(classes$b.variantSoldOut);
                element.classList.remove(classes$b.variantUnavailable);
              }

              const formSelect = element.querySelector(selectors$b.originalSelectorId);
              if (formSelect) {
                formSelect.value = variant.id;
              }

              const inputId = element.querySelector(`${selectors$b.inputId}[form]`);
              if (inputId) {
                inputId.value = variant.id;
                inputId.dispatchEvent(new Event('change'));
              }
            } else {
              element.classList.add(classes$b.variantUnavailable);
              element.classList.remove(classes$b.variantSoldOut);
            }
          });
        }
      }

      updateNotificationForm(formState) {
        if (!this.productNotification) return;

        const variantTitle = this.productNotification.querySelector(selectors$b.variantTitle);
        const notificationProduct = this.productNotification.querySelector(selectors$b.notificationProduct);
        if (variantTitle != null) {
          variantTitle.textContent = formState.variant.title;
          notificationProduct.value = formState.variant.name;
        }
      }

      updateHistoryState(formState) {
        const variant = formState.variant;
        const plan = formState.plan;
        const location = window.location.href;
        if (variant && location.includes('/product')) {
          const url = new window.URL(location);
          const params = url.searchParams;
          params.set('variant', variant.id);
          if (plan && plan.detail && plan.detail.id && this.productState.hasPlan) {
            params.set('selling_plan', plan.detail.id);
          } else {
            params.delete('selling_plan');
          }
          url.search = params.toString();
          const urlString = url.toString();
          window.history.replaceState({path: urlString}, '', urlString);
        }
      }

      updateRemaining(formState) {
        const variant = formState.variant;

        this.remainingWrapper?.classList.remove(classes$b.remainingIn, classes$b.remainingOut, classes$b.remainingUnavailable, classes$b.remainingLow);

        if (variant && this.remainingWrapper && this.remainingJSON) {
          const remaining = this.remainingJSON[variant.id];

          if (remaining === 'out' || remaining < 1) {
            this.remainingWrapper.classList.add(classes$b.remainingOut);
          }

          if (remaining === 'in' || remaining >= this.remainingMaxInt) {
            this.remainingWrapper.classList.add(classes$b.remainingIn);
          }

          if (remaining === 'low' || (remaining > 0 && remaining < this.remainingMaxInt)) {
            this.remainingWrapper.classList.add(classes$b.remainingLow);

            if (this.remainingCount) {
              this.remainingCount.innerHTML = remaining;
            }
          }
        } else if (!variant && this.remainingWrapper) {
          this.remainingWrapper.classList.add(classes$b.remainingUnavailable);
        }
      }

      optionImagesWidth() {
        if (!this.variantButtons) return;

        let maxItemWidth = 0;

        requestAnimationFrame(() => {
          this.variantOptionImages.forEach((item) => {
            const itemWidth = item.clientWidth;
            if (itemWidth > maxItemWidth) {
              maxItemWidth = itemWidth;
            }
          });

          this.variantButtons.forEach((item) => {
            item.style?.setProperty('--option-image-width', maxItemWidth + 'px');
          });
        });
      }

      getBaseUnit(variant) {
        return variant.unit_price_measurement.reference_value === 1
          ? variant.unit_price_measurement.reference_unit
          : variant.unit_price_measurement.reference_value + variant.unit_price_measurement.reference_unit;
      }

      subsToggleListeners() {
        const toggles = this.container.querySelectorAll(selectors$b.subsToggle);
        this.subSelectors = this.container.querySelector(selectors$b.subSelectors);

        if (!this.subSelectors) return;

        const select = this.subSelectors.querySelector(`select[name="selling_plan"]`);

        toggles.forEach((toggle) => {
          toggle.addEventListener(
            'change',
            function (e) {
              const val = e.target.value.toString();
              const selected = this.container.querySelector(`[${selectors$b.subsChild}="${val}"]`);
              const groups = this.container.querySelectorAll(`[${selectors$b.subsChild}]`);

              if (selected) {
                // selected.classList.remove(classes.hidden);
                select.removeAttribute('disabled');
                select.dispatchEvent(new Event('change'), { bubbles: true });
              } else {
                select.setAttribute('disabled', true);
              }

              groups.forEach((group) => {
                if (group !== selected) {
                  // group.classList.add(classes.hidden);
                  const plans = group.querySelectorAll(`[name="selling_plan"]`);
                  plans.forEach((plan) => {
                    plan.checked = false;
                    plan.dispatchEvent(new Event('change'));
                  });
                }
              });
            }.bind(this)
          );
        });
      }

      updateSaleText(formState) {
        if (!this.priceOffWrap) return;

        if (this.productState.planSale) {
          this.updateSaleTextSubscription(formState);
        } else if (this.productState.onSale) {
          this.updateSaleTextStandard(formState);
        } else {
          this.priceOffWrap.classList.add(classes$b.hidden);
        }
      }

      isVariantFinalSale(variant) {
        const metafieldsData = document.querySelector(selectors$b.variantFinalSaleMeta)?.textContent;
        if (!metafieldsData) return;

        const variantsMetafields = JSON.parse(metafieldsData);
        let variantIsFinalSale = false;

        variantsMetafields.forEach((variantMetafield) => {
          if (Number(variantMetafield.variant_id) === variant.id) {
            variantIsFinalSale = variantMetafield.metafield_value === 'true';
          }
        });

        return variantIsFinalSale;
      }

      updateSaleTextStandard(formState) {
        const variant = formState.variant;
        const finalSaleBadge = this.priceOffWrap?.querySelector(selectors$b.finalSaleBadge);
        const priceOffBadge = this.priceOffWrap?.querySelector(selectors$b.priceOffBadge);
        const comparePrice = variant?.compare_at_price;
        const salePrice = variant?.price;

        // Set sale type text if element exists
        if (this.priceOffType) {
          this.priceOffType.innerHTML = window.theme.strings.sale || 'sale';
        }

        // If priceOffBadge or priceOffAmount are missing, hide priceOffBadge and exit early
        if (!priceOffBadge || !this.priceOffAmount || !comparePrice || comparePrice <= salePrice) {
          priceOffBadge?.classList.add(classes$b.hidden);
        } else {
          // Calculate and display discount percentage
          const discountInt = Math.round(((comparePrice - salePrice) / comparePrice) * 100);
          this.priceOffAmount.innerHTML = `${discountInt}%`;
          priceOffBadge.classList.remove(classes$b.hidden);
        }

        // Display or hide the final sale badge
        const isFinalSale = this.priceOffWrap?.hasAttribute(attributes$8.finalSale) || this.isVariantFinalSale(variant);
        if (finalSaleBadge) {
          finalSaleBadge.classList.toggle(classes$b.hidden, !isFinalSale);
        }

        this.priceOffWrap.classList.remove(classes$b.hidden);
      }

      updateSubscriptionText(formState) {
        if (formState.plan && this.planDescription) {
          this.planDescription.innerHTML = formState.plan.detail.description;
          this.planDescription.classList.remove(classes$b.hidden);
        } else if (this.planDescription) {
          this.planDescription.classList.add(classes$b.hidden);
        }
      }

      updateSaleTextSubscription(formState) {
        if (this.priceOffType) {
          this.priceOffType.innerHTML = window.theme.strings.subscription || 'subscripton';
        }

        if (this.priceOffAmount && this.priceOffWrap) {
          const adjustment = formState.plan.detail.price_adjustments[0];
          const discount = adjustment.value;
          if (adjustment && adjustment.value_type === 'percentage') {
            this.priceOffAmount.innerHTML = `${discount}%`;
          } else {
            this.priceOffAmount.innerHTML = window.theme.formatMoney(discount, theme.moneyFormat);
          }
          this.priceOffWrap.classList.remove(classes$b.hidden);
        }
      }

      updateProductPrices(formState) {
        const variant = formState.variant;
        const plan = formState.plan;
        const priceWrappers = this.container.querySelectorAll(`${selectors$b.priceWrapper}`);
        const priceOneTimeWrappers = this.container.querySelectorAll(`${selectors$b.priceOneTimeWrapper}`);
        const priceSubscriptionWrapper = this.container.querySelectorAll(`${selectors$b.priceSubscriptionWrapper}`);

        priceOneTimeWrappers.forEach((wrap) => {
          let price = variant.price;
          wrap.innerHTML = price === 0 ? window.theme.strings.free : window.theme.formatMoney(price, theme.moneyFormat);
        });

        priceSubscriptionWrapper.forEach((wrap) => {
          let price = variant.selling_plan_allocations[0].price_adjustments[0].price;

          wrap.innerHTML = price === 0 ? window.theme.strings.free : window.theme.formatMoney(price, theme.moneyFormat);
        });

        priceWrappers.forEach((wrap) => {
          const comparePriceEl = wrap.querySelector(selectors$b.comparePrice);
          const productPriceEl = wrap.querySelector(selectors$b.productPrice);
          const comparePriceText = wrap.querySelector(selectors$b.comparePriceText);
          const oneTimeDiscountBadge = wrap.querySelector(selectors$b.oneTimeDiscountBadge);
          const subscriptionDiscountBadge = wrap.querySelector(selectors$b.subscriptionDiscountBadge);

          let comparePrice = '';
          let price = '';

          if (this.productState.available) {
            comparePrice = variant.compare_at_price;
            price = variant.price;
          }

          if (this.productState.hasPlan) {
            price = plan.allocation.price;
          }

          if (this.productState.planSale) {
            comparePrice = plan.allocation.compare_at_price;
            price = plan.allocation.price;
          }

          if (comparePriceEl) {
            if (this.productState.onSale || this.productState.planSale) {
              comparePriceEl.classList.remove(classes$b.hidden);
              comparePriceText.classList.remove(classes$b.hidden);
              productPriceEl.classList.add(classes$b.productPriceSale);
            } else {
              comparePriceEl.classList.add(classes$b.hidden);
              comparePriceText.classList.add(classes$b.hidden);
            }
            comparePriceEl.innerHTML = window.theme.formatMoney(comparePrice, theme.moneyFormat);
          }

          if (plan) {
            oneTimeDiscountBadge?.classList.add(classes$b.hidden);
            subscriptionDiscountBadge?.classList.remove(classes$b.hidden);
          } else {
            oneTimeDiscountBadge?.classList.remove(classes$b.hidden);
            subscriptionDiscountBadge?.classList.add(classes$b.hidden);
          }

          productPriceEl.innerHTML = price === 0 ? window.theme.strings.free : window.theme.formatMoney(price, theme.moneyFormat);
        });

        if (this.hasUnitPricing) {
          this.updateProductUnits(formState);
        }
      }

      updateProductUnits(formState) {
        const variant = formState.variant;
        const plan = formState.plan;
        let unitPrice = null;

        if (variant && variant.unit_price) {
          unitPrice = variant.unit_price;
        }
        if (plan && plan.allocation && plan.allocation.unit_price) {
          unitPrice = plan.allocation.unit_price;
        }

        if (unitPrice) {
          const base = this.getBaseUnit(variant);
          const formattedPrice = window.theme.formatMoney(unitPrice, theme.moneyFormat);
          this.container.querySelector(selectors$b.unitPrice).innerHTML = formattedPrice;
          this.container.querySelector(selectors$b.unitBase).innerHTML = base;
          this.container.querySelector(selectors$b.unitWrapper).classList.remove(classes$b.hidden);
        } else {
          this.container.querySelector(selectors$b.unitWrapper).classList.add(classes$b.hidden);
        }
      }

      updateSku(formState) {
        if (!this.skuWrapper) return;

        this.skuWrapper.innerHTML = `${theme.strings.sku}: ${formState.variant.sku}`;
      }

      fireHookEvent(formState) {
        const variant = formState.variant;
        const selected = formState.selected;
        this.container.dispatchEvent(new CustomEvent('theme:variant:change', {detail: {variant, selected}, bubbles: true}));
      }

      /**
       * Tracks aspects of the product state that are relevant to UI updates
       * @param {object} evt - variant change event
       * @return {object} productState - represents state of variant + plans
       *  productState.available - current variant and selling plan options result in valid offer
       *  productState.soldOut - variant is sold out
       *  productState.onSale - variant is on sale
       *  productState.showUnitPrice - variant has unit price
       *  productState.requiresPlan - all the product variants requires a selling plan
       *  productState.hasPlan - there is a valid selling plan
       *  productState.planSale - plan has a discount to show next to price
       *  productState.planPerDelivery - plan price does not equal per_delivery_price - a prepaid subscription
       */
      setProductState(dataset) {
        const variant = dataset.variant;
        const plan = dataset.plan;

        const productState = {
          available: true,
          soldOut: false,
          onSale: false,
          showUnitPrice: false,
          requiresPlan: false,
          hasPlan: false,
          planPerDelivery: false,
          planSale: false,
        };

        this.variantUpdated = false;

        if (this.variant?.id !== variant?.id) {
          this.variant = variant;
          this.variantUpdated = true;
        }

        if (!variant || (variant.requires_selling_plan && !plan)) {
          productState.available = false;
        } else {
          if (!variant.available) {
            productState.soldOut = true;
          }

          if (variant.compare_at_price > variant.price) {
            productState.onSale = true;
          }

          if (variant.unit_price) {
            productState.showUnitPrice = true;
          }

          if (this.product && this.product.requires_selling_plan) {
            productState.requiresPlan = true;
          }

          if (plan && this.subPrices) {
            productState.hasPlan = true;
            if (plan.allocation.per_delivery_price !== plan.allocation.price) {
              productState.planPerDelivery = true;
            }
            if (variant.price > plan.allocation.price) {
              productState.planSale = true;
            }
          }
        }
        return productState;
      }

      updateProductImage(evt) {
        const variant = evt.dataset?.variant || evt.variant;

        if (variant) {
          // Update variant image, if one is set
          if (variant.featured_media) {
            const selectedImage = this.container.querySelector(`[${attributes$8.imageId}="${variant.featured_media.id}"]`);
            // If we have a mobile breakpoint or the tall layout is disabled,
            // just switch the slideshow.

            if (selectedImage) {
              const selectedImageId = selectedImage.getAttribute(attributes$8.mediaId);
              const isDesktopView = !window.theme.isMobile();

              selectedImage.dispatchEvent(
                new CustomEvent('theme:media:select', {
                  bubbles: true,
                  detail: {
                    id: selectedImageId,
                  },
                })
              );

              if (isDesktopView && !this.productImages.hasAttribute(attributes$8.faderDesktop) && this.variantImageScroll) {
                const selectedImageTop = selectedImage.getBoundingClientRect().top;

                // Scroll to variant image
                document.dispatchEvent(
                  new CustomEvent('theme:tooltip:close', {
                    bubbles: false,
                    detail: {
                      hideTransition: false,
                    },
                  })
                );

                window.theme.scrollTo(selectedImageTop);
              }

              if (!isDesktopView && !this.productImages.hasAttribute(attributes$8.faderMobile)) {
                this.productMediaList.scrollTo({
                  left: selectedImage.offsetLeft,
                });
              }
            }
          }
        }
      }

      updateProductGallery(evt) {
        const variant = evt.dataset?.variant || evt.variant;

        if (!variant || !this.productJSON || !this.variantUpdated) return;

        const gallerySection = this.isQuickView ? 'api-product-upsell' : this.sectionId;
        const productUrl = `${window.location.origin}/products/${this.productJSON.handle}`;
        const requestUrl = `${productUrl}?variant=${variant.id}&section_id=${gallerySection}`;

        // Skip fetching if already cached
        const cacheKey = this.isQuickView ? `quick-view-gallery-${variant.id}` : `pdp-gallery-${variant.id}`;
        if (sessionStorage.getItem(cacheKey) && this.productImagesWrapper) {
          this.updateInnerHtml(this.productImagesWrapper, sessionStorage.getItem(cacheKey));
          this.productImages = this.productImagesWrapper.querySelector(selectors$b.productImages);
          return;
        }

        // Prefetch and cache the HTML
        fetch(requestUrl)
            .then((response) => response.text())
            .then((responseText) => {
              const html = new DOMParser().parseFromString(responseText, 'text/html').querySelector(selectors$b.productImagesWrapper)?.innerHTML;
              if (html && this.productImagesWrapper) {
                this.updateInnerHtml(this.productImagesWrapper, html);
                this.productImages = this.productImagesWrapper.querySelector(selectors$b.productImages);

                const bytes = new TextEncoder().encode(html).length;
                const megabytes = bytes / (1024 * 1024);
                // Only cache if less than 4MB
                if (megabytes < 4) {
                  sessionStorage.setItem(cacheKey, html);
                }
              }
            })
            .catch((error) => console.error('Prefetch error:', error));
      }

      updateInnerHtml(element, html) {
        if (html && element) {
          element.innerHTML = html;
        }
      }

      updateLegend(formState) {
        const variant = formState.variant;
        if (variant) {
          const optionValues = this.container.querySelectorAll(selectors$b.optionValue);
          if (optionValues.length) {
            optionValues.forEach((optionValue) => {
              const selectorWrapper = optionValue.closest(selectors$b.optionPosition);
              if (selectorWrapper) {
                const optionPosition = selectorWrapper.getAttribute(attributes$8.optionPosition);
                const optionIndex = parseInt(optionPosition, 10) - 1;
                const selectedOptionValue = variant.options[optionIndex];
                optionValue.innerHTML = selectedOptionValue;
              }
            });
          }
        }
      }
    }

    if (!customElements.get('product-form')) {
      customElements.define('product-form', ProductForm);
    }

    function fetchProduct(handle) {
      const requestRoute = `${window.theme.routes.root}products/${handle}.js`;

      return window
        .fetch(requestRoute)
        .then((response) => {
          return response.json();
        })
        .catch((e) => {
          console.error(e);
        });
    }

    const selectors$a = {
      gridSwatchForm: '[data-grid-swatch-form]',
      input: '[data-swatch-input]',
      productItem: '[data-grid-item]',
      productInfo: '[data-product-information]',
      sectionId: '[data-section-id]',
      productImage: '[data-product-image]',
      swatchButton: '[data-swatch-button]',
      swatchLink: '[data-swatch-link]',
      swatchText: '[data-swatch-text]',
      template: '[data-swatch-template]',
    };

    const classes$a = {
      visible: 'is-visible',
      hidden: 'hidden',
      stopEvents: 'no-events',
      swatch: 'swatch',
    };

    const attributes$7 = {
      image: 'data-swatch-image',
      handle: 'data-swatch-handle',
      label: 'data-swatch-label',
      scrollbar: 'data-scrollbar',
      swatchCount: 'data-swatch-count',
      variant: 'data-swatch-variant',
      variantName: 'data-swatch-variant-name',
      variantTitle: 'data-variant-title',
      swatchValues: 'data-swatch-values',
    };

    class GridSwatch extends HTMLElement {
      constructor() {
        super();

        this.productItemMouseLeaveEvent = () => this.hideVariantImages();
        this.showVariantImageEvent = (swatchButton) => this.showVariantImage(swatchButton);
      }

      connectedCallback() {
        this.handle = this.getAttribute(attributes$7.handle);
        this.productItem = this.closest(selectors$a.productItem);
        this.productInfo = this.closest(selectors$a.productInfo);
        this.productImage = this.productItem.querySelector(selectors$a.productImage);
        this.template = document.querySelector(selectors$a.template).innerHTML;
        this.swatchesJSON = this.getSwatchesJSON();
        this.swatchesStyle = theme.settings.collectionSwatchStyle;

        const label = this.getAttribute(attributes$7.label).trim().toLowerCase();

        fetchProduct(this.handle).then((product) => {
          this.product = product;
          this.colorOption = product.options.find(function (element) {
            return element.name.toLowerCase() === label || null;
          });

          if (this.colorOption) {
            this.swatches = this.colorOption.values;
            this.init();
          }
        });
      }

      init() {
        this.innerHTML = '';
        this.count = 0;
        this.limitedCount = 0;

        this.swatches.forEach((swatch) => {
          let variant = null;
          let variantAvailable = false;
          let image = '';

          for (const productVariant of this.product.variants) {
            const optionWithSwatch = productVariant.options.includes(swatch);

            if (!variant && optionWithSwatch) {
              variant = productVariant;
            }

            // Use a variant with image if exists
            if (optionWithSwatch && productVariant.featured_media) {
              image = productVariant.featured_media.preview_image.src;
              variant = productVariant;
              break;
            }
          }

          for (const productVariant of this.product.variants) {
            const optionWithSwatch = productVariant.options.includes(swatch);

            if (optionWithSwatch && productVariant.available) {
              variantAvailable = true;
              break;
            }
          }

          if (variant) {
            const swatchTemplate = document.createElement('div');
            swatchTemplate.innerHTML = this.template;
            const swatchButton = swatchTemplate.querySelector(selectors$a.swatchButton);
            const swatchLink = swatchTemplate.querySelector(selectors$a.swatchLink);
            const swatchText = swatchTemplate.querySelector(selectors$a.swatchText);
            const swatchHandle = this.swatchesJSON[swatch];
            const variantTitle = variant.title.replaceAll('"', "'");

            swatchButton.style = `--animation-delay: ${(100 * this.count) / 1250}s`;
            swatchButton.classList.add(`${classes$a.swatch}-${swatchHandle}`);
            swatchButton.dataset.tooltip = swatch;
            swatchButton.dataset.swatchVariant = variant.id;
            swatchButton.dataset.swatchVariantName = variantTitle;
            swatchButton.dataset.swatchImage = image;
            swatchButton.dataset.variant = variant.id;
            swatchButton.style.setProperty('--swatch', swatchHandle);
            swatchLink.href = getUrlWithVariant(this.product.url, variant.id);
            swatchLink.dataset.swatch = swatch;
            swatchLink.disabled = !variantAvailable;
            swatchText.innerText = swatch;

            if (this.swatchesStyle != 'limited') {
              this.innerHTML += swatchTemplate.innerHTML;
            } else if (this.count <= 4) {
              this.innerHTML += swatchTemplate.innerHTML;
              this.limitedCount++;
            }
            this.count++;
          }
        });

        this.swatchCount = this.productInfo.querySelector(`[${attributes$7.swatchCount}]`);
        this.swatchElements = this.querySelectorAll(selectors$a.swatchLink);
        this.swatchForm = this.productInfo.querySelector(selectors$a.gridSwatchForm);
        this.hideSwatchesTimer = 0;

        if (this.swatchCount.hasAttribute(attributes$7.swatchCount)) {
          if (this.swatchesStyle == 'text' || this.swatchesStyle == 'text-slider') {
            this.swatchCount.innerText = `${this.count} ${this.count > 1 ? theme.strings.otherColor : theme.strings.oneColor}`;

            if (this.swatchesStyle == 'text') return;

            this.swatchCount.addEventListener('mouseenter', () => {
              if (this.hideSwatchesTimer) clearTimeout(this.hideSwatchesTimer);

              this.productInfo.classList.add(classes$a.stopEvents);
              this.swatchForm.classList.add(classes$a.visible);
            });

            // Prevent color swatches blinking on mouse move
            this.productInfo.addEventListener('mouseleave', () => {
              this.hideSwatchesTimer = setTimeout(() => {
                this.productInfo.classList.remove(classes$a.stopEvents);
                this.swatchForm.classList.remove(classes$a.visible);
              }, 100);
            });
          }

          if (this.swatchesStyle == 'slider' || this.swatchesStyle == 'grid') {
            this.swatchForm.classList.add(classes$a.visible);
          }

          if (this.swatchesStyle == 'limited') {
            const swatchesLeft = this.count - this.limitedCount;

            this.swatchForm.classList.add(classes$a.visible);

            if (swatchesLeft > 0) {
              this.innerHTML += `<div class="swatch-limited">+${swatchesLeft}</div>`;
            }
          }
        }

        this.bindSwatchButtonEvents();
      }

      bindSwatchButtonEvents() {
        this.querySelectorAll(selectors$a.swatchButton)?.forEach((swatchButton) => {
          // Show variant image when hover on color swatch
          swatchButton.addEventListener('mouseenter', this.showVariantImageEvent);
        });

        this.productItem.addEventListener('mouseleave', this.productItemMouseLeaveEvent);
      }

      showVariantImage(event) {
        const swatchButton = event.target;
        const variantName = swatchButton.getAttribute(attributes$7.variantName)?.replaceAll('"', "'");
        const variantImages = this.productImage.querySelectorAll(`[${attributes$7.variantTitle}]`);
        const variantImageSelected = this.productImage.querySelector(`[${attributes$7.variantTitle}="${variantName}"]`);

        // Hide all variant images
        variantImages?.forEach((image) => {
          image.classList.remove(classes$a.visible);
        });

        // Show selected variant image
        variantImageSelected?.classList.add(classes$a.visible);
      }

      hideVariantImages() {
        // Hide all variant images
        this.productImage.querySelectorAll(`[${attributes$7.variantTitle}].${classes$a.visible}`)?.forEach((image) => {
          image.classList.remove(classes$a.visible);
        });
      }

      getSwatchesJSON() {
        if (!this.hasAttribute(attributes$7.swatchValues)) return {};

        // Splitting the string by commas to get individual key-value pairs
        const pairs = this.getAttribute(attributes$7.swatchValues).split(',');

        // Creating an empty object to store the key-value pairs
        const jsonObject = {};

        // Iterating through the pairs and constructing the JSON object
        pairs?.forEach((pair) => {
          const [key, value] = pair.split(':');
          jsonObject[key.trim()] = value.trim();
        });

        return jsonObject;
      }
    }

    const selectors$9 = {
      flickityButton: '.flickity-prev-next-button',
      productLink: '[data-product-link]',
      slide: '[data-hover-slide]',
      slideTouch: '[data-hover-slide-touch]',
      slider: '[data-hover-slider]',
      video: 'video',
      vimeo: '[data-host="vimeo"]',
      youtube: '[data-host="youtube"]',
    };

    class HoverImages extends HTMLElement {
      constructor() {
        super();

        this.flkty = null;
        this.slider = this.querySelector(selectors$9.slider);
        this.handleScroll = this.handleScroll.bind(this);
        this.hovered = false;

        this.mouseEnterEvent = () => this.mouseEnterActions();
        this.mouseLeaveEvent = () => this.mouseLeaveActions();

        this.addEventListener('mouseenter', this.mouseEnterEvent);
        this.addEventListener('mouseleave', this.mouseLeaveEvent);
      }

      connectedCallback() {
        if (window.theme.touch) {
          this.initTouch();
        } else {
          this.initFlickity();
        }
      }

      disconnectedCallback() {
        if (this.flkty) {
          this.flkty.options.watchCSS = false;
          this.flkty.destroy();
        }

        this.removeEventListener('mouseenter', this.mouseEnterEvent);
        this.removeEventListener('mouseleave', this.mouseLeaveEvent);
      }

      initTouch() {
        this.style.setProperty('--slides-count', this.querySelectorAll(selectors$9.slideTouch).length);
        this.slider.addEventListener('scroll', this.handleScroll);
      }

      handleScroll() {
        const slideIndex = this.slider.scrollLeft / this.slider.clientWidth;
        this.style.setProperty('--slider-index', slideIndex);
      }

      initFlickity() {
        if (this.querySelectorAll(selectors$9.slide).length < 2) return;

        this.flkty = new window.theme.Flickity(this.slider, {
          cellSelector: selectors$9.slide,
          contain: true,
          wrapAround: true,
          watchCSS: true,
          autoPlay: false,
          draggable: false,
          pageDots: false,
          prevNextButtons: true,
        });

        this.flkty.pausePlayer();

        this.addEventListener('mouseenter', () => {
          this.flkty.unpausePlayer();
        });

        this.addEventListener('mouseleave', () => {
          this.flkty.pausePlayer();
        });

        // Prevent page redirect on Flickity arrow click
        this.closest(selectors$9.productLink).addEventListener('click', (e) => {
          if (e.target.matches(selectors$9.flickityButton)) {
            e.preventDefault();
          }
        });
      }

      mouseEnterActions() {
        this.hovered = true;

        this.videoActions();
      }

      mouseLeaveActions() {
        this.hovered = false;

        this.videoActions();
      }

      videoActions() {
        const youtube = this.querySelector(selectors$9.youtube);
        const vimeo = this.querySelector(selectors$9.vimeo);
        const mediaExternal = youtube || vimeo;
        const mediaNative = this.querySelector(selectors$9.video);

        if (mediaExternal) {
          let action = this.hovered ? 'playVideo' : 'pauseVideo';
          let string = `{"event":"command","func":"${action}","args":""}`;

          if (vimeo) {
            action = this.hovered ? 'play' : 'pause';
            string = `{"method":"${action}"}`;
          }

          mediaExternal.contentWindow.postMessage(string, '*');

          mediaExternal.addEventListener('load', (e) => {
            // Call videoActions() again when iframe is loaded to prevent autoplay being triggered if it loads after the "mouseleave" event
            this.videoActions();
          });
        } else if (mediaNative) {
          if (this.hovered) {
            mediaNative.play();
          } else {
            mediaNative.pause();
          }
        }
      }
    }

    const wrap = (toWrap, wrapperClass = '', wrapperOption) => {
      const wrapper = wrapperOption || document.createElement('div');
      wrapper.classList.add(wrapperClass);
      toWrap.parentNode.insertBefore(wrapper, toWrap);
      return wrapper.appendChild(toWrap);
    };

    function wrapElements(container) {
      // Target tables to make them scrollable
      const tableSelectors = '.rte table';
      const tables = container.querySelectorAll(tableSelectors);
      tables.forEach((table) => {
        wrap(table, 'rte__table-wrapper');
        table.setAttribute('data-scroll-lock-scrollable', '');
      });

      // Target iframes to make them responsive
      const iframeSelectors = '.rte iframe[src*="youtube.com/embed"], .rte iframe[src*="player.vimeo"], .rte iframe#admin_bar_iframe';
      const frames = container.querySelectorAll(iframeSelectors);
      frames.forEach((frame) => {
        wrap(frame, 'rte__video-wrapper');
      });
    }

    const classes$9 = {
      added: 'is-added',
      animated: 'is-animated',
      disabled: 'is-disabled',
      error: 'has-error',
      loading: 'is-loading',
      open: 'is-open',
      visible: 'is-visible',
    };

    const settings = {
      errorDelay: 3000,
    };

    const selectors$8 = {
      animation: '[data-animation]',
      apiContent: '[data-api-content]',
      buttonQuickAdd: '[data-quick-add-btn]',
      buttonAddToCart: '[data-add-to-cart]',
      cartDrawer: 'cart-drawer',
      cartPage: '[data-cart-page]',
      cartLineItems: '[data-line-items]',
      dialog: 'dialog',
      focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
      messageError: '[data-message-error]',
      modalButton: '[data-quick-add-modal-handle]',
      modalContainer: '[data-product-upsell-container]',
      modalContent: '[data-product-upsell-ajax]',
      modalClose: '[data-quick-add-modal-close]',
      productGridItem: 'data-grid-item',
      productInformationHolder: '[data-product-information]',
      quickAddHolder: '[data-quick-add-holder]',
      quickAddModal: '[data-quick-add-modal]',
      quickAddModalTemplate: '[data-quick-add-modal-template]',
    };

    const attributes$6 = {
      closing: 'closing',
      productId: 'data-product-id',
      modalHandle: 'data-quick-add-modal-handle',
      quickAddHolder: 'data-quick-add-holder',
    };

    class QuickAddProduct extends HTMLElement {
      constructor() {
        super();

        this.quickAddHolder = this.querySelector(selectors$8.quickAddHolder);
        this.modal = null;
        this.productId = this.quickAddHolder.getAttribute(attributes$6.quickAddHolder);
        this.modalButton = this.quickAddHolder.querySelector(selectors$8.modalButton);
        this.handle = this.modalButton?.getAttribute(attributes$6.modalHandle);
        this.buttonQuickAdd = this.quickAddHolder.querySelector(selectors$8.buttonQuickAdd);
        this.buttonATC = this.quickAddHolder.querySelector(selectors$8.buttonAddToCart);
        this.button = this.modalButton || this.buttonATC;
        this.modalClose = this.modalClose.bind(this);
        this.modalCloseOnProductAdded = this.modalCloseOnProductAdded.bind(this);
        this.a11y = window.theme.a11y;
        this.isAnimating = false;

        this.modalButtonClickEvent = this.modalButtonClickEvent.bind(this);
        this.quickAddLoadingToggle = this.quickAddLoadingToggle.bind(this);
      }

      connectedCallback() {
        /**
         * Modal button works for multiple variants products
         */
        if (this.modalButton) {
          this.modalButton.addEventListener('click', this.modalButtonClickEvent);
        }

        /**
         * Quick add button works for single variant products
         */
        if (this.buttonATC) {
          this.buttonATC.addEventListener('click', (e) => {
            e.preventDefault();

            window.theme.a11y.lastElement = this.buttonATC;

            document.dispatchEvent(
              new CustomEvent('theme:cart:add', {
                detail: {
                  button: this.buttonATC,
                },
              })
            );
          });
        }

        if (this.quickAddHolder) {
          this.quickAddHolder.addEventListener('animationend', this.quickAddLoadingToggle);
          this.errorHandler();
        }
      }

      modalButtonClickEvent(e) {
        e.preventDefault();

        this.modalButton.classList.add(classes$9.loading);
        this.modalButton.disabled = true;

        this.renderModal();
      }

      modalCreate(response) {
        const cachedModal = document.querySelector(`${selectors$8.quickAddModal}[${attributes$6.productId}="${this.productId}"]`);

        if (cachedModal) {
          this.modal = cachedModal;
          this.modalOpen();
        } else {
          const modalTemplate = this.quickAddHolder.querySelector(selectors$8.quickAddModalTemplate);
          if (!modalTemplate) return;

          const htmlObject = document.createElement('div');
          htmlObject.innerHTML = modalTemplate.innerHTML;

          // Add dialog to the body
          document.body.appendChild(htmlObject.querySelector(selectors$8.quickAddModal));
          modalTemplate.remove();

          this.modal = document.querySelector(`${selectors$8.quickAddModal}[${attributes$6.productId}="${this.productId}"]`);
          this.modal.querySelector(selectors$8.modalContent).innerHTML = new DOMParser().parseFromString(response, 'text/html').querySelector(selectors$8.apiContent).innerHTML;

          this.modalCreatedCallback();
        }
      }

      modalOpen() {
        // Check if browser supports Dialog tags
        if (typeof this.modal.show === 'function') {
          this.modal.show();
        }

        this.modal.setAttribute('open', true);
        this.modal.removeAttribute('inert');

        this.quickAddHolder.classList.add(classes$9.disabled);

        if (this.modalButton) {
          this.modalButton.classList.remove(classes$9.loading);
          this.modalButton.disabled = false;
          window.theme.a11y.lastElement = this.modalButton;
        }

        // Animate items
        requestAnimationFrame(() => {
          this.modal.querySelectorAll(selectors$8.animation).forEach((item) => {
            item.classList.add(classes$9.animated);
          });
        });

        document.dispatchEvent(new CustomEvent('theme:quick-add:open', {bubbles: true}));
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
        document.addEventListener('theme:product:added', this.modalCloseOnProductAdded, {once: true});
      }

      modalClose() {
        if (this.isAnimating) {
          return;
        }

        if (!this.modal.hasAttribute(attributes$6.closing)) {
          this.modal.setAttribute(attributes$6.closing, '');
          this.isAnimating = true;
          return;
        }

        // Check if browser supports Dialog tags
        if (typeof this.modal.close === 'function') {
          this.modal.close();
        } else {
          this.modal.removeAttribute('open');
        }

        this.modal.removeAttribute(attributes$6.closing);
        this.modal.setAttribute('inert', '');
        this.modal.classList.remove(classes$9.loading);

        if (this.modalButton) {
          this.modalButton.disabled = false;
        }

        if (this.quickAddHolder && this.quickAddHolder.classList.contains(classes$9.disabled)) {
          this.quickAddHolder.classList.remove(classes$9.disabled);
        }

        this.resetAnimatedItems();

        // Unlock scroll if no other drawers & modals are open
        if (!window.theme.hasOpenModals()) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }

        document.removeEventListener('theme:product:added', this.modalCloseOnProductAdded);

        this.a11y.removeTrapFocus();
        this.a11y.autoFocusLastElement();
      }

      modalEvents() {
        // Close button click event
        this.modal.querySelector(selectors$8.modalClose)?.addEventListener('click', (e) => {
          e.preventDefault();
          this.modalClose();
        });

        // Close dialog on click outside content
        this.modal.addEventListener('click', (event) => {
          if (event.target.nodeName === 'DIALOG' && event.type === 'click') {
            this.modalClose();
          }
        });

        // Close dialog on click ESC key pressed
        this.modal.addEventListener('keydown', (event) => {
          if (event.code == 'Escape') {
            event.preventDefault();
            this.modalClose();
          }
        });

        // Close dialog after animation completes
        this.modal.addEventListener('animationend', (event) => {
          if (event.target !== this.modal) return;
          this.isAnimating = false;

          if (this.modal.hasAttribute(attributes$6.closing)) {
            this.modalClose();
          } else {
            setTimeout(() => {
              this.a11y.trapFocus(this.modal);
              const focusTarget = this.modal.querySelector('[autofocus]') || this.modal.querySelector(selectors$8.focusable);
              focusTarget?.focus();
            }, 50);
          }
        });
      }

      modalCloseOnProductAdded() {
        this.resetQuickAddButtons();
        if (this.modal && this.modal.hasAttribute('open')) {
          this.modalClose();
        }
      }

      quickAddLoadingToggle(e) {
        if (e.target != this.quickAddHolder) return;

        this.quickAddHolder.classList.remove(classes$9.disabled);
      }

      /**
       * Handle error cart response
       */
      errorHandler() {
        this.quickAddHolder.addEventListener('theme:cart:error', (event) => {
          const holder = event.detail.holder;
          const parentProduct = holder.closest(`[${selectors$8.productGridItem}]`);
          if (!parentProduct) return;

          const errorMessageHolder = holder.querySelector(selectors$8.messageError);
          parentProduct.querySelector(selectors$8.productInformationHolder);
          const button = holder.querySelector(selectors$8.buttonAddToCart);

          if (button) {
            button.classList.remove(classes$9.added, classes$9.loading);
            holder.classList.add(classes$9.error);
          }

          if (errorMessageHolder) {
            errorMessageHolder.innerText = event.detail.description;
          }

          setTimeout(() => {
            this.resetQuickAddButtons();
          }, settings.errorDelay);
        });
      }

      /**
       * Reset buttons to default states
       */
      resetQuickAddButtons() {
        if (this.quickAddHolder) {
          this.quickAddHolder.classList.remove(classes$9.visible, classes$9.error);
        }

        if (this.buttonQuickAdd) {
          this.buttonQuickAdd.classList.remove(classes$9.added);
          this.buttonQuickAdd.disabled = false;
        }
      }

      renderModal() {
        if (this.modal) {
          this.modalOpen();
        } else {
          window
            .fetch(`${window.theme.routes.root}products/${this.handle}?section_id=api-product-upsell`)
            .then(this.upsellErrorsHandler)
            .then((response) => {
              return response.text();
            })
            .then((response) => {
              this.modalCreate(response);
            });
        }
      }

      modalCreatedCallback() {
        this.modalEvents();
        this.modalOpen();

        wrapElements(this.modal);
      }

      upsellErrorsHandler(response) {
        if (!response.ok) {
          return response.json().then(function (json) {
            const e = new FetchError({
              status: response.statusText,
              headers: response.headers,
              json: json,
            });
            throw e;
          });
        }
        return response;
      }

      resetAnimatedItems() {
        this.modal?.querySelectorAll(selectors$8.animation).forEach((item) => {
          item.classList.remove(classes$9.animated);
        });
      }
    }

    if (!customElements.get('quick-add-product')) {
      customElements.define('quick-add-product', QuickAddProduct);
    }

    if (!customElements.get('grid-swatch')) {
      customElements.define('grid-swatch', GridSwatch);
    }

    if (!customElements.get('hover-images')) {
      customElements.define('hover-images', HoverImages);
    }

    const selectors$7 = {
      buttonArrow: '[data-button-arrow]',
      deferredMediaButton: '[data-deferred-media-button]',
      focusedElement: 'model-viewer, video, iframe, button, [href], input, [tabindex]',
      productMedia: '[data-image-id]',
      productMediaList: '[data-product-media-list]',
      section: '[data-section-type]',
      // thumbs: '[data-product-thumbs]',
    };

    const classes$8 = {
      arrows: 'slider__arrows',
      dragging: 'is-dragging',
      hidden: 'hidden',
      isFocused: 'is-focused',
      mediaActive: 'media--active',
      mediaHidden: 'media--hidden',
      mediaHiding: 'media--hiding',
    };

    const attributes$5 = {
      activeMedia: 'data-active-media',
      buttonPrev: 'data-button-prev',
      buttonNext: 'data-button-next',
      imageId: 'data-image-id',
      mediaId: 'data-media-id',
      type: 'data-type',
      faderDesktop: 'data-fader-desktop',
      faderMobile: 'data-fader-mobile',
    };

    if (!customElements.get('product-images')) {
      customElements.define(
        'product-images',
        class ProductImages extends HTMLElement {
          constructor() {
            super();

            this.initialized = false;
            this.buttons = false;
            this.isDown = false;
            this.startX = 0;
            this.startY = 0;
            this.scrollLeft = 0;
            this.onButtonArrowClick = (e) => this.buttonArrowClickEvent(e);
            this.container = this.closest(selectors$7.section);
            this.handleMouseDown = this.handleMouseDown.bind(this);
            this.handleMouseLeave = this.handleMouseLeave.bind(this);
            this.handleMouseUp = this.handleMouseUp.bind(this);
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.handleKeyUp = this.handleKeyUp.bind(this);
            this.productMediaItems = this.querySelectorAll(selectors$7.productMedia);
            this.productMediaList = this.querySelector(selectors$7.productMediaList);
            this.setHeight = this.setHeight.bind(this);
            this.toggleEvents = this.toggleEvents.bind(this);
            this.selectMediaEvent = (e) => this.showMediaOnVariantSelect(e);

            this.isProgrammaticScroll = false;      // блокуємо реакцію на власний скрол
            this.onScroll = this.onScroll.bind(this);
            this.onScrollEnd = this.onScrollEnd.bind(this);
            this.scrollEndTimer = null;
            // this.thumbs = document.querySelector(selectors.thumbs);
          }

          connectedCallback() {
            if (Object.keys(this.productMediaItems).length <= 1) return;

            this.productMediaObserver();
            this.toggleEvents();
            this.listen();
            this.setHeight();

            // setTimeout(() => {
            //   console.log(1,this.thumbs);
            //   // this.selectMedia('template--19389511598312__main-36848874225896')
            //   // this.thumbs?.setAttribute('data-active-media', 'template--19389511598312__main-36848874225896');
            //
            //   this.setActiveMedia('template--19389511598312__main-36848874225896');
            // }, 5000);
          }

          disconnectedCallback() {
            this.unlisten();
          }

          listen() {
            document.addEventListener('theme:resize:width', this.toggleEvents);
            document.addEventListener('theme:resize:width', this.setHeight);
            this.addEventListener('theme:media:select', this.selectMediaEvent);
          }

          unlisten() {
            document.removeEventListener('theme:resize:width', this.toggleEvents);
            document.removeEventListener('theme:resize:width', this.setHeight);
            this.removeEventListener('theme:media:select', this.selectMediaEvent);
          }

          toggleEvents() {
            const isMobileView = window.theme.isMobile();

            if ((isMobileView && this.hasAttribute(attributes$5.faderMobile)) || (!isMobileView && this.hasAttribute(attributes$5.faderDesktop))) {
              this.bindEventListeners();
            } else {
              this.unbindEventListeners();
            }
          }

          bindEventListeners() {
            if (this.initialized) return;

            this.productMediaList.addEventListener('mousedown', this.handleMouseDown);
            this.productMediaList.addEventListener('mouseleave', this.handleMouseLeave);
            this.productMediaList.addEventListener('mouseup', this.handleMouseUp);
            this.productMediaList.addEventListener('mousemove', this.handleMouseMove);
            this.productMediaList.addEventListener('touchstart', this.handleMouseDown, {passive: true});
            this.productMediaList.addEventListener('touchend', this.handleMouseUp, {passive: true});
            this.productMediaList.addEventListener('touchmove', this.handleMouseMove, {passive: true});
            this.productMediaList.addEventListener('keyup', this.handleKeyUp);
            this.productMediaList.addEventListener('scroll', this.onScroll, { passive: true });
            this.initArrows();
            this.resetScrollPosition();

            this.initialized = true;
          }

          unbindEventListeners() {
            if (!this.initialized) return;

            this.productMediaList.removeEventListener('mousedown', this.handleMouseDown);
            this.productMediaList.removeEventListener('mouseleave', this.handleMouseLeave);
            this.productMediaList.removeEventListener('mouseup', this.handleMouseUp);
            this.productMediaList.removeEventListener('mousemove', this.handleMouseMove);
            this.productMediaList.removeEventListener('touchstart', this.handleMouseDown);
            this.productMediaList.removeEventListener('touchend', this.handleMouseUp);
            this.productMediaList.removeEventListener('touchmove', this.handleMouseMove);
            this.productMediaList.removeEventListener('keyup', this.handleKeyUp);
            this.productMediaList.removeEventListener('scroll', this.onScroll);

            this.removeArrows();

            this.initialized = false;
          }

          handleMouseDown(e) {
            this.isDown = true;
            this.startX = (e.pageX || e.changedTouches[0].screenX) - this.offsetLeft;
            this.startY = (e.pageY || e.changedTouches[0].screenY) - this.offsetTop;
          }

          handleMouseLeave() {
            if (!this.isDown) return;
            this.isDown = false;
          }

          handleMouseUp(e) {
            const x = (e.pageX || e.changedTouches[0].screenX) - this.offsetLeft;
            const y = (e.pageY || e.changedTouches[0].screenY) - this.offsetTop;
            const distanceX = x - this.startX;
            const distanceY = y - this.startY;
            const direction = distanceX > 0 ? 1 : -1;
            const isImage = this.getCurrentMedia().hasAttribute(attributes$5.type) && this.getCurrentMedia().getAttribute(attributes$5.type) === 'image';

            if (Math.abs(distanceX) > 10 && Math.abs(distanceX) > Math.abs(distanceY) && isImage) {
              direction < 0 ? this.showNextImage() : this.showPreviousImage();
            }

            this.isDown = false;

            requestAnimationFrame(() => {
              this.classList.remove(classes$8.dragging);
            });
          }

          handleMouseMove() {
            if (!this.isDown) return;

            this.classList.add(classes$8.dragging);
          }

          handleKeyUp(e) {
            if (e.code === 'ArrowLeft') {
              this.showPreviousImage();
            }

            if (e.code === 'ArrowRight') {
              this.showNextImage();
            }
          }

          handleArrowsClickEvent() {
            this.querySelectorAll(selectors$7.buttonArrow)?.forEach((button) => {
              button.addEventListener('click', (e) => {
                e.preventDefault();

                if (e.target.hasAttribute(attributes$5.buttonPrev)) {
                  this.showPreviousImage();
                }

                if (e.target.hasAttribute(attributes$5.buttonNext)) {
                  this.showNextImage();
                }
              });
            });
          }

          // When changing from Mobile do Desktop view
          resetScrollPosition() {
            if (this.productMediaList.scrollLeft !== 0) {
              this.productMediaList.scrollLeft = 0;
            }
          }

          initArrows() {
            // Create arrow buttons if don't exist
            if (!this.buttons.length) {
              const buttonsWrap = document.createElement('div');
              buttonsWrap.classList.add(classes$8.arrows);
              buttonsWrap.innerHTML = theme.sliderArrows.prev + theme.sliderArrows.next;

              // Append buttons outside the slider element
              this.productMediaList.append(buttonsWrap);
              this.buttons = this.querySelectorAll(selectors$7.buttonArrow);
              this.buttonPrev = this.querySelector(`[${attributes$5.buttonPrev}]`);
              this.buttonNext = this.querySelector(`[${attributes$5.buttonNext}]`);
            }

            this.handleArrowsClickEvent();
            this.preloadImageOnArrowHover();
          }

          removeArrows() {
            this.querySelector(`.${classes$8.arrows}`)?.remove();
          }

          preloadImageOnArrowHover() {
            this.buttonPrev?.addEventListener('mouseover', () => {
              const id = this.getPreviousMediaId();
              this.preloadImage(id);
            });

            this.buttonNext?.addEventListener('mouseover', () => {
              const id = this.getNextMediaId();
              this.preloadImage(id);
            });
          }

          preloadImage(id) {
            this.querySelector(`[${attributes$5.mediaId}="${id}"] img`)?.setAttribute('loading', 'eager');
          }

          showMediaOnVariantSelect(e) {
            const id = e.detail.id;
            this.setActiveMedia(id);
          }

          getCurrentMedia() {
            return this.querySelector(`${selectors$7.productMedia}.${classes$8.mediaActive}`);
          }

          getNextMediaId() {
            const currentMedia = this.getCurrentMedia();
            const nextMedia = currentMedia?.nextElementSibling.hasAttribute(attributes$5.imageId) ? currentMedia?.nextElementSibling : this.querySelector(selectors$7.productMedia);

            return nextMedia?.getAttribute(attributes$5.mediaId);
          }

          getPreviousMediaId() {
            const currentMedia = this.getCurrentMedia();
            const lastIndex = this.productMediaItems.length - 1;
            const previousMedia = currentMedia?.previousElementSibling || this.productMediaItems[lastIndex];

            return previousMedia?.getAttribute(attributes$5.mediaId);
          }

          showNextImage() {
            const id = this.getNextMediaId();
            this.selectMedia(id);
          }

          showPreviousImage() {
            const id = this.getPreviousMediaId();
            this.selectMedia(id);
          }

          selectMedia(id) {
            this.dispatchEvent(
              new CustomEvent('theme:media:select', {
                detail: {
                  id: id,
                },
              })
            );
          }

          setActiveMedia(id, opts = {}) {
            if (!id) return;

            const { fromScroll = false } = opts;   // ← дістаємо прапорець

            this.setAttribute(attributes$5.activeMedia, id);

            const activeImage = this.querySelector(`${selectors$7.productMedia}.${classes$8.mediaActive}`);
            const selectedImage = this.querySelector(`[${attributes$5.mediaId}="${id}"]`);
            const selectedImageFocus = selectedImage?.querySelector(selectors$7.focusedElement);
            const deferredMedia = selectedImage.querySelector('deferred-media');
            const container = selectedImage.closest('[data-product-media-list]');
            selectedImage.getAttribute('data-media-id');

            activeImage?.classList.add(classes$8.mediaHiding);
            activeImage?.classList.remove(classes$8.mediaActive);
            selectedImage?.classList.remove(classes$8.mediaHiding, classes$8.mediaHidden);
            selectedImage?.classList.add(classes$8.mediaActive);


            // скролимо тільки якщо подія НЕ з onScrollEnd
            if (!fromScroll && container) {
              this.isProgrammaticScroll = true;
              this.scrollToStart(container, selectedImage);
              this.waitForScrollEnd(container).then(() => {
                this.isProgrammaticScroll = false; // знімаємо блок тільки після завершення скролу
              });
            }


            // Force media loading if slide becomes visible
            if (deferredMedia && deferredMedia.getAttribute('loaded') !== true) {
              selectedImage.querySelector(selectors$7.deferredMediaButton)?.dispatchEvent(new Event('click', {bubbles: false}));
            }

            requestAnimationFrame(() => {
              this.setHeight();

              // Move focus to the selected media
              if (document.body.classList.contains(classes$8.isFocused)) {
                selectedImageFocus?.focus();
              }
            });
          }

          onScroll() {
            if (this.isProgrammaticScroll) return;         // ігноруємо власний скрол
            clearTimeout(this.scrollEndTimer);
            // «scrollend» не всюди є, тому робимо полілаг через debounce
            this.scrollEndTimer = setTimeout(this.onScrollEnd, 120);
          }

          onScrollEnd = () => {
            if (this.isProgrammaticScroll) return;

            const snapped = this.getSnappedMedia();
            if (snapped) {
              const id = snapped.getAttribute(attributes$5.mediaId);
              if (id && id !== this.getAttribute(attributes$5.activeMedia)) {
                this.setActiveMedia(id, { fromScroll: true });
              }
            }
          }

          /** Визначає елемент, вирівняний по snap-align:start */
          getSnappedMedia() {
            const container = this.productMediaList;
            if (!container) return null;

            const cs = getComputedStyle(container);
            const padLeft = parseFloat(cs.paddingLeft) || 0;
            const scrollPadLeft =
              parseFloat(cs.scrollPaddingLeft || cs.getPropertyValue('scroll-padding-left')) || 0;

            const cRect = container.getBoundingClientRect();
            const probeX = cRect.left + padLeft + scrollPadLeft + 1;   // 1px усередині snap-порту
            const probeY = cRect.top + cRect.height / 2;

            // 1) primary: елемент під «лівою лінійкою»
            let el = document.elementFromPoint(probeX, probeY)?.closest('[data-image-id]');
            if (el && this.contains(el)) return el;

            // 2) fallback: найближчий по логічній позиції (без суворого EPS)
            let best = null, bestDelta = Infinity;
            this.productMediaItems.forEach(node => {
              const left = this.getOffsetLeftWithin(node, container);
              const delta = Math.abs(left - (container.scrollLeft + padLeft + scrollPadLeft));
              if (delta < bestDelta) { bestDelta = delta; best = node; }
            });
            return best || null;
          }


          waitForScrollEnd(el) {
            return new Promise((resolve) => {
              if ('onscrollend' in window) {
                const handler = () => resolve();
                el.addEventListener('scrollend', handler, { once: true });
              } else {
                let t;
                const onScroll = () => {
                  clearTimeout(t);
                  t = setTimeout(() => {
                    el.removeEventListener('scroll', onScroll);
                    resolve();
                  }, 120);
                };
                el.addEventListener('scroll', onScroll);
              }
            });
          }

          // 2) Точний fallback на випадок, якщо хочеш повний контроль
          getOffsetLeftWithin(el, ancestor) {
            let x = 0, node = el;
            while (node && node !== ancestor) {
              x += node.offsetLeft;
              node = node.offsetParent;
            }
            return x;
          }


          getOffsetLeftWithin(el, ancestor) {
            let x = 0, n = el;
            while (n && n !== ancestor) { x += n.offsetLeft; n = n.offsetParent; }
            return x;
          }

          scrollToStart(containerEl, itemEl, behavior = 'smooth') {
            if (!containerEl || !itemEl) return;

            const cs = getComputedStyle(containerEl);
            const padLeft = parseFloat(cs.paddingLeft) || 0;
            const scrollPadLeft =
              parseFloat(cs.scrollPaddingLeft || cs.getPropertyValue('scroll-padding-left')) || 0;

            const itemLeft = this.getOffsetLeftWithin(itemEl, containerEl);
            const target = itemLeft - padLeft - scrollPadLeft;

            const max = containerEl.scrollWidth - containerEl.clientWidth;
            const clamped = Math.max(0, Math.min(target, max));

            containerEl.scrollTo({ left: clamped, behavior });
          }

          // Set current product image height variable to product images container
          setHeight() {
            const mediaHeight = this.querySelector(`${selectors$7.productMedia}.${classes$8.mediaActive}`)?.offsetHeight || this.productMediaItems[0]?.offsetHeight;
            this.style.setProperty('--height', `${mediaHeight}px`);
          }

          productMediaObserver() {
            this.productMediaItems.forEach((media) => {
              media.addEventListener('transitionend', (e) => {
                if (e.target == media && media.classList.contains(classes$8.mediaHiding)) {
                  media.classList.remove(classes$8.mediaHiding);
                  media.classList.add(classes$8.mediaHidden);
                }
              });
              media.addEventListener('transitioncancel', (e) => {
                if (e.target == media && media.classList.contains(classes$8.mediaHiding)) {
                  media.classList.remove(classes$8.mediaHiding);
                  media.classList.add(classes$8.mediaHidden);
                }
              });
            });
          }
        }
      );
    }

    /**
     * Module to show Recently Viewed Products
     *
     * Copyright (c) 2014 Caroline Schnapp (11heavens.com)
     * Dual licensed under the MIT and GPL licenses:
     * http://www.opensource.org/licenses/mit-license.php
     * http://www.gnu.org/licenses/gpl.html
     *
     */

    Shopify.Products = (function () {
      const config = {
        howManyToShow: 4,
        howManyToStoreInMemory: 10,
        wrapperId: 'recently-viewed-products',
        section: null,
        target: 'api-product-grid-item',
        onComplete: null,
      };

      let productHandleQueue = [];
      let wrapper = null;
      let howManyToShowItems = null;

      const today = new Date();
      const expiresDate = new Date();
      const daysToExpire = 90;
      expiresDate.setTime(today.getTime() + 3600000 * 24 * daysToExpire);

      const cookie = {
        configuration: {
          expires: expiresDate.toGMTString(),
          path: '/',
          domain: window.location.hostname,
          sameSite: 'none',
          secure: true,
        },
        name: 'shopify_recently_viewed',
        write: function (recentlyViewed) {
          const recentlyViewedString = encodeURIComponent(recentlyViewed.join(' '));
          document.cookie = `${this.name}=${recentlyViewedString}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}; sameSite=${this.configuration.sameSite}; secure=${this.configuration.secure}`;
        },
        read: function () {
          let recentlyViewed = [];
          let cookieValue = null;

          if (document.cookie.indexOf('; ') !== -1 && document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
            cookieValue = document.cookie
              .split('; ')
              .find((row) => row.startsWith(this.name))
              .split('=')[1];
          }

          if (cookieValue !== null) {
            recentlyViewed = decodeURIComponent(cookieValue).split(' ');
          }

          return recentlyViewed;
        },
        destroy: function () {
          const cookieVal = null;
          document.cookie = `${this.name}=${cookieVal}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}`;
        },
        remove: function (productHandle) {
          const recentlyViewed = this.read();
          const position = recentlyViewed.indexOf(productHandle);
          if (position !== -1) {
            recentlyViewed.splice(position, 1);
            this.write(recentlyViewed);
          }
        },
      };

      const finalize = (wrapper, section) => {
        wrapper.classList.remove('hidden');
        const cookieItemsLength = cookie.read().length;

        if (Shopify.recentlyViewed && howManyToShowItems && cookieItemsLength && cookieItemsLength < howManyToShowItems && wrapper.children.length) {
          let allClassesArr = [];
          let addClassesArr = [];
          let objCounter = 0;
          for (const property in Shopify.recentlyViewed) {
            objCounter += 1;
            const objString = Shopify.recentlyViewed[property];
            const objArr = objString.split(' ');
            const propertyIdx = parseInt(property.split('_')[1]);
            allClassesArr = [...allClassesArr, ...objArr];

            if (cookie.read().length === propertyIdx || (objCounter === Object.keys(Shopify.recentlyViewed).length && !addClassesArr.length)) {
              addClassesArr = [...addClassesArr, ...objArr];
            }
          }

          for (let i = 0; i < wrapper.children.length; i++) {
            const element = wrapper.children[i];
            if (allClassesArr.length) {
              element.classList.remove(...allClassesArr);
            }

            if (addClassesArr.length) {
              element.classList.add(...addClassesArr);
            }
          }
        }

        // If we have a callback.
        if (config.onComplete) {
          try {
            config.onComplete(wrapper, section);
          } catch (error) {
            console.log(error);
          }
        }
      };

      const moveAlong = (shown, productHandleQueue, wrapper, section, target, howManyToShow) => {
        if (productHandleQueue.length && shown < howManyToShow) {
          fetch(`${window.theme.routes.root}products/${productHandleQueue[0]}?section_id=${target}`)
            .then((response) => response.text())
            .then((product) => {
              const aosDelay = shown * 100;
              const aosAnchor = wrapper.id ? `#${wrapper.id}` : '';
              const fresh = document.createElement('div');
              fresh.innerHTML = product;

              const content = fresh.querySelector('[data-api-content]');

              const isAvailable =
                !content.querySelector('[data-available="false"]') &&
                !content.innerHTML.toLowerCase().includes('sold out');

              if (isAvailable) {
                let productHTML = content.innerHTML
                  .replaceAll('||itemAnimationDelay||', aosDelay)
                  .replaceAll('||itemAnimationAnchor||', aosAnchor);

                wrapper.innerHTML += productHTML;

                shown++;
              }

              productHandleQueue.shift();
              moveAlong(shown, productHandleQueue, wrapper, section, target, howManyToShow);
            })
            .catch(() => {
              cookie.remove(productHandleQueue[0]);
              productHandleQueue.shift();
              moveAlong(shown, productHandleQueue, wrapper, section, target, howManyToShow);
            });
        } else {
          finalize(wrapper, section);
        }
      };

      return {
        showRecentlyViewed: function (params) {
          const paramsNew = params || {};
          const shown = 0;

          // Update defaults.
          Object.assign(config, paramsNew);

          // Read cookie.
          productHandleQueue = cookie.read();

          // Element where to insert.
          wrapper = document.querySelector(`#${config.wrapperId}`);

          // How many products to show.
          howManyToShowItems = config.howManyToShow;
          config.howManyToShow = Math.min(productHandleQueue.length, config.howManyToShow);

          // If we have any to show.
          if (config.howManyToShow && wrapper) {
            // Getting each product with an Ajax call and rendering it on the page.
            moveAlong(shown, productHandleQueue, wrapper, config.section, config.target, howManyToShowItems);
          }
        },

        getConfig: function () {
          return config;
        },

        clearList: function () {
          cookie.destroy();
        },

        recordRecentlyViewed: function (params) {
          const paramsNew = params || {};
          Object.assign(config, paramsNew);

          // Read cookie.
          let recentlyViewed = cookie.read();

          // If we are on a product page.
          if (window.location.pathname.indexOf('/products/') !== -1) {
            // What is the product handle on this page.
            let productHandle = decodeURIComponent(window.location.pathname)
              .match(
                /\/products\/([a-z0-9\-]|[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|[\u203B]|[\w\u0430-\u044f]|[\u0400-\u04FF]|[\u0900-\u097F]|[\u0590-\u05FF\u200f\u200e]|[\u0621-\u064A\u0660-\u0669 ])+/
              )[0]
              .split('/products/')[1];

            if (config.handle) {
              productHandle = config.handle;
            }

            // In what position is that product in memory.
            const position = recentlyViewed.indexOf(productHandle);

            // If not in memory.
            if (position === -1) {
              // Add product at the start of the list.
              recentlyViewed.unshift(productHandle);
              // Only keep what we need.

              recentlyViewed = recentlyViewed.splice(0, config.howManyToStoreInMemory);
            } else {
              // Remove the product and place it at start of list.
              recentlyViewed.splice(position, 1);
              recentlyViewed.unshift(productHandle);
            }

            // Update cookie.
            cookie.write(recentlyViewed);
          }
        },

        hasProducts: cookie.read().length > 0,
      };
    })();

    const selectors$6 = {
      aos: '[data-aos]',
      collectionImage: '.collection-item__image',
      columnImage: '[data-column-image]',
      flickityNextArrow: '.flickity-button.next',
      flickityPrevArrow: '.flickity-button.previous',
      link: 'a:not(.btn)',
      productItemImage: '.product-item__image',
      section: '[data-section-type]',
      slide: '[data-slide]',
      slideValue: 'data-slide',
      sliderThumb: '[data-slider-thumb]',
    };

    const attributes$4 = {
      arrowPositionMiddle: 'data-arrow-position-middle',
      sliderOptions: 'data-options',
      slideTextColor: 'data-slide-text-color',
    };

    const classes$7 = {
      aosAnimate: 'aos-animate',
      desktop: 'desktop',
      focused: 'is-focused',
      flickityEnabled: 'flickity-enabled',
      heroContentTransparent: 'hero__content--transparent',
      hidden: 'hidden',
      initialized: 'is-initialized',
      isLoading: 'is-loading',
      isSelected: 'is-selected',
      mobile: 'mobile',
      singleSlide: 'single-slide',
    };

    if (!customElements.get('slider-component')) {
      customElements.define(
        'slider-component',
        class SliderComponent extends HTMLElement {
          constructor() {
            super();

            this.flkty = null;
            this.slides = this.querySelectorAll(selectors$6.slide);
            this.thumbs = this.querySelectorAll(selectors$6.sliderThumb);
            this.section = this.closest(selectors$6.section);
            this.bindEvents();
          }

          connectedCallback() {
            if (this.slides.length <= 1) return;

            if (this.hasAttribute(attributes$4.sliderOptions)) {
              this.customOptions = JSON.parse(decodeURIComponent(this.getAttribute(attributes$4.sliderOptions)));
            }

            this.classList.add(classes$7.isLoading);

            let slideSelector = selectors$6.slide;
            const isDesktopView = !window.theme.isMobile();
            const slideMobile = `${selectors$6.slide}:not(.${classes$7.mobile})`;
            const slideDesktop = `${selectors$6.slide}:not(.${classes$7.desktop})`;
            const hasDeviceSpecificSelectors = this.querySelectorAll(slideDesktop).length || this.querySelectorAll(slideMobile).length;

            if (hasDeviceSpecificSelectors) {
              if (isDesktopView) {
                slideSelector = slideMobile;
              } else {
                slideSelector = slideDesktop;
              }
            }

            if (this.querySelectorAll(slideSelector).length <= 1) {
              this.classList.add(classes$7.singleSlide);
              this.classList.remove(classes$7.isLoading);
            }

            this.sliderOptions = {
              cellSelector: slideSelector,
              contain: true,
              wrapAround: true,
              adaptiveHeight: true,
              ...this.customOptions,
              on: {
                ready: () => {
                  requestAnimationFrame(() => {
                    this.classList.add(classes$7.initialized);
                    this.classList.remove(classes$7.isLoading);
                    this.parentNode.dispatchEvent(
                      new CustomEvent('theme:slider:loaded', {
                        bubbles: true,
                        detail: {
                          slider: this,
                        },
                      })
                    );
                  });

                  this.slideActions();

                  if (this.sliderOptions.prevNextButtons) {
                    this.positionArrows();
                  }
                },
                change: (index) => {
                  const slide = this.slides[index];
                  if (!slide || this.sliderOptions.groupCells) return;

                  const elementsToAnimate = slide.querySelectorAll(selectors$6.aos);
                  if (elementsToAnimate.length) {
                    elementsToAnimate.forEach((el) => {
                      el.classList.remove(classes$7.aosAnimate);
                      requestAnimationFrame(() => {
                        // setTimeout with `0` delay fixes functionality on Mobile and Firefox
                        setTimeout(() => {
                          el.classList.add(classes$7.aosAnimate);
                        }, 0);
                      });
                    });
                  }
                },
                resize: () => {
                  if (this.sliderOptions.prevNextButtons) {
                    this.positionArrows();
                  }
                },
              },
            };

            this.initSlider();

            this.flkty.on('change', () => this.slideActions(true));

            this.thumbs?.forEach((thumb) => {
              thumb.addEventListener('click', (e) => {
                e.preventDefault();
                const slideIndex = [...thumb.parentElement.children].indexOf(thumb);
                this.flkty.select(slideIndex);
              });
            });

            if (!this.flkty || !this.flkty.isActive) {
              this.classList.remove(classes$7.isLoading);
            }
          }

          initSlider() {
            if (this.sliderOptions.fade) {
              this.flkty = new window.theme.FlickityFade(this, this.sliderOptions);
            } else {
              this.flkty = new window.theme.Flickity(this, this.sliderOptions);
            }
          }

          bindEvents() {
            this.addEventListener('theme:slider:init', () => {
              this.initSlider();
            });

            this.addEventListener('theme:slider:select', (e) => {
              this.flkty.selectCell(e.detail.index);
              this.flkty.stopPlayer();
            });

            this.addEventListener('theme:slider:deselect', () => {
              if (this.flkty && this.sliderOptions.hasOwnProperty('autoPlay') && this.sliderOptions.autoPlay) {
                this.flkty.playPlayer();
              }
            });

            this.addEventListener('theme:slider:reposition', () => {
              this.flkty?.reposition();
            });

            this.addEventListener('theme:slider:destroy', () => {
              this.flkty?.destroy();
            });

            this.addEventListener('theme:slider:remove-slide', (e) => {
              if (!e.detail.slide) return;

              this.flkty?.remove(e.detail.slide);

              if (this.flkty?.cells.length === 0) {
                this.section.classList.add(classes$7.hidden);
              }
            });
          }

          slideActions(changeEvent = false) {
            const currentSlide = this.querySelector(`.${classes$7.isSelected}`);
            if (!currentSlide) return;
            const currentSlideTextColor = currentSlide.hasAttribute(attributes$4.slideTextColor) ? currentSlide.getAttribute(attributes$4.slideTextColor) : '';
            const currentSlideLink = currentSlide.querySelector(selectors$6.link);
            const buttons = this.querySelectorAll(`${selectors$6.slide} a, ${selectors$6.slide} button`);

            if (document.body.classList.contains(classes$7.focused) && currentSlideLink && this.sliderOptions.groupCells && changeEvent) {
              currentSlideLink.focus();
            }

            if (buttons.length) {
              buttons.forEach((button) => {
                const slide = button.closest(selectors$6.slide);
                if (slide) {
                  const tabIndex = slide.classList.contains(classes$7.isSelected) ? 0 : -1;
                  button.setAttribute('tabindex', tabIndex);
                }
              });
            }

            this.style.setProperty('--text', currentSlideTextColor);
          }

          positionArrows() {
            if (this.hasAttribute(attributes$4.arrowPositionMiddle) && this.sliderOptions.prevNextButtons) {
              const itemImage = this.querySelector(selectors$6.collectionImage) || this.querySelector(selectors$6.productItemImage) || this.querySelector(selectors$6.columnImage);

              // Prevent 'clientHeight' of null error if no image
              if (!itemImage) return;

              this.querySelector(selectors$6.flickityPrevArrow).style.top = itemImage.clientHeight / 2 + 'px';
              this.querySelector(selectors$6.flickityNextArrow).style.top = itemImage.clientHeight / 2 + 'px';
            }
          }

          disconnectedCallback() {
            if (this.flkty) {
              this.flkty.options.watchCSS = false;
              this.flkty.destroy();
            }
          }
        }
      );
    }

    const selectors$5 = {
      relatedSection: '[data-related-section]',
      aos: '[data-aos]',
      tabsLi: '[data-tab]',
      tabLink: '.tab-link',
      tabLinkRecent: '.tab-link__recent',
      tabContent: '.tab-content',
    };

    const classes$6 = {
      current: 'current',
      hidden: 'hidden',
      aosAnimate: 'aos-animate',
      aosNoTransition: 'aos-no-transition',
      focused: 'is-focused',
    };

    const attributes$3 = {
      dataTab: 'data-tab',
      dataTabIndex: 'data-tab-index',
    };

    if (!customElements.get('tabs-component')) {
      customElements.define(
        'tabs-component',
        class GlobalTabs extends HTMLElement {
          constructor() {
            super();

            this.a11y = window.theme.a11y;
          }

          connectedCallback() {
            const tabsNavList = this.querySelectorAll(selectors$5.tabsLi);

            this.addEventListener('theme:tab:check', () => this.checkRecentTab());
            this.addEventListener('theme:tab:hide', () => this.hideRelatedTab());

            tabsNavList?.forEach((element) => {
              const tabId = parseInt(element.getAttribute(attributes$3.dataTab));
              const tab = this.querySelector(`${selectors$5.tabContent}-${tabId}`);

              element.addEventListener('click', () => {
                this.tabChange(element, tab);
              });

              element.addEventListener('keyup', (event) => {
                if ((event.code === 'Space' || event.code === 'Enter') && document.body.classList.contains(classes$6.focused)) {
                  this.tabChange(element, tab);
                }
              });
            });
          }

          tabChange(element, tab) {
            if (element.classList.contains(classes$6.current)) {
              return;
            }

            const currentTab = this.querySelector(`${selectors$5.tabsLi}.${classes$6.current}`);
            const currentTabContent = this.querySelector(`${selectors$5.tabContent}.${classes$6.current}`);

            currentTab?.classList.remove(classes$6.current);
            currentTabContent?.classList.remove(classes$6.current);

            element.classList.add(classes$6.current);
            tab.classList.add(classes$6.current);

            if (element.classList.contains(classes$6.hidden)) {
              tab.classList.add(classes$6.hidden);
            }

            this.a11y.removeTrapFocus();

            this.dispatchEvent(new CustomEvent('theme:tab:change', {bubbles: true}));

            element.dispatchEvent(
              new CustomEvent('theme:form:sticky', {
                bubbles: true,
                detail: {
                  element: 'tab',
                },
              })
            );

            this.animateItems(tab);
          }

          animateItems(tab, animated = true) {
            const animatedItems = tab.querySelectorAll(selectors$5.aos);

            if (animatedItems.length) {
              animatedItems.forEach((animatedItem) => {
                animatedItem.classList.remove(classes$6.aosAnimate);

                if (animated) {
                  animatedItem.classList.add(classes$6.aosNoTransition);

                  requestAnimationFrame(() => {
                    animatedItem.classList.remove(classes$6.aosNoTransition);
                    animatedItem.classList.add(classes$6.aosAnimate);
                  });
                }
              });
            }
          }

          checkRecentTab() {
            const tabLink = this.querySelector(selectors$5.tabLinkRecent);

            if (tabLink) {
              tabLink.classList.remove(classes$6.hidden);
              const tabLinkIdx = parseInt(tabLink.getAttribute(attributes$3.dataTab));
              const tabContent = this.querySelector(`${selectors$5.tabContent}[${attributes$3.dataTabIndex}="${tabLinkIdx}"]`);

              if (tabContent) {
                tabContent.classList.remove(classes$6.hidden);

                this.animateItems(tabContent, false);
              }
            }
          }

          hideRelatedTab() {
            const relatedSection = this.querySelector(selectors$5.relatedSection);
            if (!relatedSection) {
              return;
            }

            const parentTabContent = relatedSection.closest(`${selectors$5.tabContent}.${classes$6.current}`);
            if (!parentTabContent) {
              return;
            }
            const parentTabContentIdx = parseInt(parentTabContent.getAttribute(attributes$3.dataTabIndex));
            const tabsNavList = this.querySelectorAll(selectors$5.tabsLi);

            if (tabsNavList.length > parentTabContentIdx) {
              const nextTabsNavLink = tabsNavList[parentTabContentIdx].nextSibling;

              if (nextTabsNavLink) {
                tabsNavList[parentTabContentIdx].classList.add(classes$6.hidden);
                nextTabsNavLink.dispatchEvent(new Event('click'));
              }
            }
          }
        }
      );
    }

    const selectors$4 = {
      actions: '[data-actions]',
      content: '[data-content]',
      trigger: '[data-button]',
    };

    const attributes$2 = {
      height: 'data-height',
    };

    const classes$5 = {
      open: 'is-open',
      enabled: 'is-enabled',
    };

    class ToggleEllipsis extends HTMLElement {
      constructor() {
        super();

        this.initialHeight = this.getAttribute(attributes$2.height);
        this.content = this.querySelector(selectors$4.content);
        this.trigger = this.querySelector(selectors$4.trigger);
        this.actions = this.querySelector(selectors$4.actions);
        this.toggleActions = this.toggleActions.bind(this);
      }

      connectedCallback() {
        // Make sure the data attribute height value matches the CSS value
        this.setHeight(this.initialHeight);

        this.trigger.addEventListener('click', () => {
          this.setHeight(this.content.offsetHeight);
          this.classList.add(classes$5.open);
        });

        this.setHeight(this.initialHeight);
        this.toggleActions();

        document.addEventListener('theme:resize', this.toggleActions);
        document.addEventListener('theme:collapsible:toggle', this.toggleActions);
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize', this.toggleActions);
        document.removeEventListener('theme:collapsible:toggle', this.toggleActions);
      }

      setHeight(contentHeight) {
        this.style.setProperty('--height', `${contentHeight}px`);
      }

      toggleActions() {
        this.classList.toggle(classes$5.enabled, this.content.offsetHeight + this.actions.offsetHeight > this.initialHeight);
      }
    }

    if (!customElements.get('toggle-ellipsis')) {
      customElements.define('toggle-ellipsis', ToggleEllipsis);
    }

    const selectors$3 = {
      sectionId: '[data-section-id]',
      tooltip: 'data-tooltip',
      tooltipStopMouseEnter: 'data-tooltip-stop-mouseenter',
    };

    const classes$4 = {
      tooltipDefault: 'tooltip-default',
      visible: 'is-visible',
      hiding: 'is-hiding',
    };

    if (!customElements.get('tooltip-component')) {
      customElements.define(
        'tooltip-component',
        class Tooltip extends HTMLElement {
          constructor() {
            super();

            this.label = this.hasAttribute(selectors$3.tooltip) ? this.getAttribute(selectors$3.tooltip) : '';
            this.transitionSpeed = 200;
            this.hideTransitionTimeout = 0;
            this.addPinEvent = () => this.addPin();
            this.addPinMouseEvent = () => this.addPin(true);
            this.removePinEvent = (event) => window.theme.throttle(this.removePin(event), 50);
            this.removePinMouseEvent = (event) => this.removePin(event, true, true);
          }

          connectedCallback() {
            if (!document.querySelector(`.${classes$4.tooltipDefault}`)) {
              const tooltipTemplate = `<div class="${classes$4.tooltipDefault}__arrow"></div><div class="${classes$4.tooltipDefault}__inner"><div class="${classes$4.tooltipDefault}__text"></div></div>`;
              const tooltipElement = document.createElement('div');
              tooltipElement.className = classes$4.tooltipDefault;
              tooltipElement.innerHTML = tooltipTemplate;
              document.body.appendChild(tooltipElement);
            }

            this.addEventListener('mouseenter', this.addPinMouseEvent);
            this.addEventListener('mouseleave', this.removePinMouseEvent);
            this.addEventListener('theme:tooltip:init', this.addPinEvent);
            document.addEventListener('theme:tooltip:close', this.removePinEvent);
          }

          addPin(stopMouseEnter = false) {
            const tooltipTarget = document.querySelector(`.${classes$4.tooltipDefault}`);

            const section = this.closest(selectors$3.sectionId);
            const colorSchemeClass = Array.from(section.classList).find((cls) => cls.startsWith('color-scheme-'));
            tooltipTarget?.classList.add(colorSchemeClass); // add the section's color scheme class to the tooltip

            if (this.label && tooltipTarget && ((stopMouseEnter && !this.hasAttribute(selectors$3.tooltipStopMouseEnter)) || !stopMouseEnter)) {
              const tooltipTargetArrow = tooltipTarget.querySelector(`.${classes$4.tooltipDefault}__arrow`);
              const tooltipTargetInner = tooltipTarget.querySelector(`.${classes$4.tooltipDefault}__inner`);
              const tooltipTargetText = tooltipTarget.querySelector(`.${classes$4.tooltipDefault}__text`);
              tooltipTargetText.innerHTML = this.label;

              const tooltipTargetWidth = tooltipTargetInner.offsetWidth;
              const tooltipRect = this.getBoundingClientRect();
              const tooltipTop = tooltipRect.top;
              const tooltipWidth = tooltipRect.width;
              const tooltipHeight = tooltipRect.height;
              const tooltipTargetPositionTop = tooltipTop + tooltipHeight + window.scrollY;
              let tooltipTargetPositionLeft = tooltipRect.left - tooltipTargetWidth / 2 + tooltipWidth / 2;
              const tooltipLeftWithWidth = tooltipTargetPositionLeft + tooltipTargetWidth;
              const sideOffset = 24;
              const tooltipTargetWindowDifference = tooltipLeftWithWidth - window.theme.getWindowWidth() + sideOffset;

              if (tooltipTargetWindowDifference > 0) {
                tooltipTargetPositionLeft -= tooltipTargetWindowDifference;
              }

              if (tooltipTargetPositionLeft < 0) {
                tooltipTargetPositionLeft = 0;
              }

              tooltipTargetArrow.style.left = `${tooltipRect.left + tooltipWidth / 2}px`;
              tooltipTarget.style.setProperty('--tooltip-top', `${tooltipTargetPositionTop}px`);

              tooltipTargetInner.style.transform = `translateX(${tooltipTargetPositionLeft}px)`;
              tooltipTarget.classList.remove(classes$4.hiding);
              tooltipTarget.classList.add(classes$4.visible);

              document.addEventListener('theme:scroll', this.removePinEvent);
            }
          }

          removePin(event, stopMouseEnter = false, hideTransition = false) {
            const tooltipTarget = document.querySelector(`.${classes$4.tooltipDefault}`);
            const tooltipVisible = tooltipTarget.classList.contains(classes$4.visible);

            if (tooltipTarget && ((stopMouseEnter && !this.hasAttribute(selectors$3.tooltipStopMouseEnter)) || !stopMouseEnter)) {
              if (tooltipVisible && (hideTransition || event.detail.hideTransition)) {
                tooltipTarget.classList.add(classes$4.hiding);

                if (this.hideTransitionTimeout) {
                  clearTimeout(this.hideTransitionTimeout);
                }

                this.hideTransitionTimeout = setTimeout(() => {
                  tooltipTarget.classList.remove(classes$4.hiding);
                }, this.transitionSpeed);
              }

              tooltipTarget.classList.remove(classes$4.visible);

              document.removeEventListener('theme:scroll', this.removePinEvent);
            }
          }

          disconnectedCallback() {
            this.removeEventListener('mouseenter', this.addPinMouseEvent);
            this.removeEventListener('mouseleave', this.removePinMouseEvent);
            this.removeEventListener('theme:tooltip:init', this.addPinEvent);
            document.removeEventListener('theme:tooltip:close', this.removePinEvent);
            document.removeEventListener('theme:scroll', this.removePinEvent);
          }
        }
      );
    }

    /**
     * SSR Window 5.0.0
     * Better handling for window object in SSR environment
     * https://github.com/nolimits4web/ssr-window
     *
     * Copyright 2025, Vladimir Kharlampidi
     *
     * Licensed under MIT
     *
     * Released on: February 12, 2025
     */
    /* eslint-disable no-param-reassign */
    function isObject$2(obj) {
      return obj !== null && typeof obj === 'object' && 'constructor' in obj && obj.constructor === Object;
    }
    function extend$2(target, src) {
      if (target === void 0) {
        target = {};
      }
      if (src === void 0) {
        src = {};
      }
      const noExtend = ['__proto__', 'constructor', 'prototype'];
      Object.keys(src).filter(key => noExtend.indexOf(key) < 0).forEach(key => {
        if (typeof target[key] === 'undefined') target[key] = src[key];else if (isObject$2(src[key]) && isObject$2(target[key]) && Object.keys(src[key]).length > 0) {
          extend$2(target[key], src[key]);
        }
      });
    }
    const ssrDocument = {
      body: {},
      addEventListener() {},
      removeEventListener() {},
      activeElement: {
        blur() {},
        nodeName: ''
      },
      querySelector() {
        return null;
      },
      querySelectorAll() {
        return [];
      },
      getElementById() {
        return null;
      },
      createEvent() {
        return {
          initEvent() {}
        };
      },
      createElement() {
        return {
          children: [],
          childNodes: [],
          style: {},
          setAttribute() {},
          getElementsByTagName() {
            return [];
          }
        };
      },
      createElementNS() {
        return {};
      },
      importNode() {
        return null;
      },
      location: {
        hash: '',
        host: '',
        hostname: '',
        href: '',
        origin: '',
        pathname: '',
        protocol: '',
        search: ''
      }
    };
    function getDocument() {
      const doc = typeof document !== 'undefined' ? document : {};
      extend$2(doc, ssrDocument);
      return doc;
    }
    const ssrWindow = {
      document: ssrDocument,
      navigator: {
        userAgent: ''
      },
      location: {
        hash: '',
        host: '',
        hostname: '',
        href: '',
        origin: '',
        pathname: '',
        protocol: '',
        search: ''
      },
      history: {
        replaceState() {},
        pushState() {},
        go() {},
        back() {}
      },
      CustomEvent: function CustomEvent() {
        return this;
      },
      addEventListener() {},
      removeEventListener() {},
      getComputedStyle() {
        return {
          getPropertyValue() {
            return '';
          }
        };
      },
      Image() {},
      Date() {},
      screen: {},
      setTimeout() {},
      clearTimeout() {},
      matchMedia() {
        return {};
      },
      requestAnimationFrame(callback) {
        if (typeof setTimeout === 'undefined') {
          callback();
          return null;
        }
        return setTimeout(callback, 0);
      },
      cancelAnimationFrame(id) {
        if (typeof setTimeout === 'undefined') {
          return;
        }
        clearTimeout(id);
      }
    };
    function getWindow() {
      const win = typeof window !== 'undefined' ? window : {};
      extend$2(win, ssrWindow);
      return win;
    }

    function classesToTokens(classes) {
      if (classes === void 0) {
        classes = '';
      }
      return classes.trim().split(' ').filter(c => !!c.trim());
    }

    function deleteProps(obj) {
      const object = obj;
      Object.keys(object).forEach(key => {
        try {
          object[key] = null;
        } catch (e) {
          // no getter for object
        }
        try {
          delete object[key];
        } catch (e) {
          // something got wrong
        }
      });
    }
    function nextTick(callback, delay) {
      if (delay === void 0) {
        delay = 0;
      }
      return setTimeout(callback, delay);
    }
    function now() {
      return Date.now();
    }
    function getComputedStyle$1(el) {
      const window = getWindow();
      let style;
      if (window.getComputedStyle) {
        style = window.getComputedStyle(el, null);
      }
      if (!style && el.currentStyle) {
        style = el.currentStyle;
      }
      if (!style) {
        style = el.style;
      }
      return style;
    }
    function getTranslate(el, axis) {
      if (axis === void 0) {
        axis = 'x';
      }
      const window = getWindow();
      let matrix;
      let curTransform;
      let transformMatrix;
      const curStyle = getComputedStyle$1(el);
      if (window.WebKitCSSMatrix) {
        curTransform = curStyle.transform || curStyle.webkitTransform;
        if (curTransform.split(',').length > 6) {
          curTransform = curTransform.split(', ').map(a => a.replace(',', '.')).join(', ');
        }
        // Some old versions of Webkit choke when 'none' is passed; pass
        // empty string instead in this case
        transformMatrix = new window.WebKitCSSMatrix(curTransform === 'none' ? '' : curTransform);
      } else {
        transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
        matrix = transformMatrix.toString().split(',');
      }
      if (axis === 'x') {
        // Latest Chrome and webkits Fix
        if (window.WebKitCSSMatrix) curTransform = transformMatrix.m41;
        // Crazy IE10 Matrix
        else if (matrix.length === 16) curTransform = parseFloat(matrix[12]);
        // Normal Browsers
        else curTransform = parseFloat(matrix[4]);
      }
      if (axis === 'y') {
        // Latest Chrome and webkits Fix
        if (window.WebKitCSSMatrix) curTransform = transformMatrix.m42;
        // Crazy IE10 Matrix
        else if (matrix.length === 16) curTransform = parseFloat(matrix[13]);
        // Normal Browsers
        else curTransform = parseFloat(matrix[5]);
      }
      return curTransform || 0;
    }
    function isObject$1(o) {
      return typeof o === 'object' && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === 'Object';
    }
    function isNode(node) {
      // eslint-disable-next-line
      if (typeof window !== 'undefined' && typeof window.HTMLElement !== 'undefined') {
        return node instanceof HTMLElement;
      }
      return node && (node.nodeType === 1 || node.nodeType === 11);
    }
    function extend$1() {
      const to = Object(arguments.length <= 0 ? undefined : arguments[0]);
      const noExtend = ['__proto__', 'constructor', 'prototype'];
      for (let i = 1; i < arguments.length; i += 1) {
        const nextSource = i < 0 || arguments.length <= i ? undefined : arguments[i];
        if (nextSource !== undefined && nextSource !== null && !isNode(nextSource)) {
          const keysArray = Object.keys(Object(nextSource)).filter(key => noExtend.indexOf(key) < 0);
          for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
            const nextKey = keysArray[nextIndex];
            const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
              if (isObject$1(to[nextKey]) && isObject$1(nextSource[nextKey])) {
                if (nextSource[nextKey].__swiper__) {
                  to[nextKey] = nextSource[nextKey];
                } else {
                  extend$1(to[nextKey], nextSource[nextKey]);
                }
              } else if (!isObject$1(to[nextKey]) && isObject$1(nextSource[nextKey])) {
                to[nextKey] = {};
                if (nextSource[nextKey].__swiper__) {
                  to[nextKey] = nextSource[nextKey];
                } else {
                  extend$1(to[nextKey], nextSource[nextKey]);
                }
              } else {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
      }
      return to;
    }
    function setCSSProperty(el, varName, varValue) {
      el.style.setProperty(varName, varValue);
    }
    function animateCSSModeScroll(_ref) {
      let {
        swiper,
        targetPosition,
        side
      } = _ref;
      const window = getWindow();
      const startPosition = -swiper.translate;
      let startTime = null;
      let time;
      const duration = swiper.params.speed;
      swiper.wrapperEl.style.scrollSnapType = 'none';
      window.cancelAnimationFrame(swiper.cssModeFrameID);
      const dir = targetPosition > startPosition ? 'next' : 'prev';
      const isOutOfBound = (current, target) => {
        return dir === 'next' && current >= target || dir === 'prev' && current <= target;
      };
      const animate = () => {
        time = new Date().getTime();
        if (startTime === null) {
          startTime = time;
        }
        const progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
        const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
        let currentPosition = startPosition + easeProgress * (targetPosition - startPosition);
        if (isOutOfBound(currentPosition, targetPosition)) {
          currentPosition = targetPosition;
        }
        swiper.wrapperEl.scrollTo({
          [side]: currentPosition
        });
        if (isOutOfBound(currentPosition, targetPosition)) {
          swiper.wrapperEl.style.overflow = 'hidden';
          swiper.wrapperEl.style.scrollSnapType = '';
          setTimeout(() => {
            swiper.wrapperEl.style.overflow = '';
            swiper.wrapperEl.scrollTo({
              [side]: currentPosition
            });
          });
          window.cancelAnimationFrame(swiper.cssModeFrameID);
          return;
        }
        swiper.cssModeFrameID = window.requestAnimationFrame(animate);
      };
      animate();
    }
    function getSlideTransformEl(slideEl) {
      return slideEl.querySelector('.swiper-slide-transform') || slideEl.shadowRoot && slideEl.shadowRoot.querySelector('.swiper-slide-transform') || slideEl;
    }
    function elementChildren(element, selector) {
      if (selector === void 0) {
        selector = '';
      }
      const window = getWindow();
      const children = [...element.children];
      if (window.HTMLSlotElement && element instanceof HTMLSlotElement) {
        children.push(...element.assignedElements());
      }
      if (!selector) {
        return children;
      }
      return children.filter(el => el.matches(selector));
    }
    function elementIsChildOfSlot(el, slot) {
      // Breadth-first search through all parent's children and assigned elements
      const elementsQueue = [slot];
      while (elementsQueue.length > 0) {
        const elementToCheck = elementsQueue.shift();
        if (el === elementToCheck) {
          return true;
        }
        elementsQueue.push(...elementToCheck.children, ...(elementToCheck.shadowRoot ? elementToCheck.shadowRoot.children : []), ...(elementToCheck.assignedElements ? elementToCheck.assignedElements() : []));
      }
    }
    function elementIsChildOf(el, parent) {
      const window = getWindow();
      let isChild = parent.contains(el);
      if (!isChild && window.HTMLSlotElement && parent instanceof HTMLSlotElement) {
        const children = [...parent.assignedElements()];
        isChild = children.includes(el);
        if (!isChild) {
          isChild = elementIsChildOfSlot(el, parent);
        }
      }
      return isChild;
    }
    function showWarning(text) {
      try {
        console.warn(text);
        return;
      } catch (err) {
        // err
      }
    }
    function createElement(tag, classes) {
      if (classes === void 0) {
        classes = [];
      }
      const el = document.createElement(tag);
      el.classList.add(...(Array.isArray(classes) ? classes : classesToTokens(classes)));
      return el;
    }
    function elementOffset(el) {
      const window = getWindow();
      const document = getDocument();
      const box = el.getBoundingClientRect();
      const body = document.body;
      const clientTop = el.clientTop || body.clientTop || 0;
      const clientLeft = el.clientLeft || body.clientLeft || 0;
      const scrollTop = el === window ? window.scrollY : el.scrollTop;
      const scrollLeft = el === window ? window.scrollX : el.scrollLeft;
      return {
        top: box.top + scrollTop - clientTop,
        left: box.left + scrollLeft - clientLeft
      };
    }
    function elementPrevAll(el, selector) {
      const prevEls = [];
      while (el.previousElementSibling) {
        const prev = el.previousElementSibling; // eslint-disable-line
        if (selector) {
          if (prev.matches(selector)) prevEls.push(prev);
        } else prevEls.push(prev);
        el = prev;
      }
      return prevEls;
    }
    function elementNextAll(el, selector) {
      const nextEls = [];
      while (el.nextElementSibling) {
        const next = el.nextElementSibling; // eslint-disable-line
        if (selector) {
          if (next.matches(selector)) nextEls.push(next);
        } else nextEls.push(next);
        el = next;
      }
      return nextEls;
    }
    function elementStyle(el, prop) {
      const window = getWindow();
      return window.getComputedStyle(el, null).getPropertyValue(prop);
    }
    function elementIndex(el) {
      let child = el;
      let i;
      if (child) {
        i = 0;
        // eslint-disable-next-line
        while ((child = child.previousSibling) !== null) {
          if (child.nodeType === 1) i += 1;
        }
        return i;
      }
      return undefined;
    }
    function elementParents(el, selector) {
      const parents = []; // eslint-disable-line
      let parent = el.parentElement; // eslint-disable-line
      while (parent) {
        if (selector) {
          if (parent.matches(selector)) parents.push(parent);
        } else {
          parents.push(parent);
        }
        parent = parent.parentElement;
      }
      return parents;
    }
    function elementTransitionEnd(el, callback) {
      function fireCallBack(e) {
        if (e.target !== el) return;
        callback.call(el, e);
        el.removeEventListener('transitionend', fireCallBack);
      }
      if (callback) {
        el.addEventListener('transitionend', fireCallBack);
      }
    }
    function elementOuterSize(el, size, includeMargins) {
      const window = getWindow();
      if (includeMargins) {
        return el[size === 'width' ? 'offsetWidth' : 'offsetHeight'] + parseFloat(window.getComputedStyle(el, null).getPropertyValue(size === 'width' ? 'margin-right' : 'margin-top')) + parseFloat(window.getComputedStyle(el, null).getPropertyValue(size === 'width' ? 'margin-left' : 'margin-bottom'));
      }
      return el.offsetWidth;
    }
    function makeElementsArray(el) {
      return (Array.isArray(el) ? el : [el]).filter(e => !!e);
    }
    function getRotateFix(swiper) {
      return v => {
        if (Math.abs(v) > 0 && swiper.browser && swiper.browser.need3dFix && Math.abs(v) % 90 === 0) {
          return v + 0.001;
        }
        return v;
      };
    }

    let support;
    function calcSupport() {
      const window = getWindow();
      const document = getDocument();
      return {
        smoothScroll: document.documentElement && document.documentElement.style && 'scrollBehavior' in document.documentElement.style,
        touch: !!('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch)
      };
    }
    function getSupport() {
      if (!support) {
        support = calcSupport();
      }
      return support;
    }

    let deviceCached;
    function calcDevice(_temp) {
      let {
        userAgent
      } = _temp === void 0 ? {} : _temp;
      const support = getSupport();
      const window = getWindow();
      const platform = window.navigator.platform;
      const ua = userAgent || window.navigator.userAgent;
      const device = {
        ios: false,
        android: false
      };
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/); // eslint-disable-line
      let ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
      const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
      const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
      const windows = platform === 'Win32';
      let macos = platform === 'MacIntel';

      // iPadOs 13 fix
      const iPadScreens = ['1024x1366', '1366x1024', '834x1194', '1194x834', '834x1112', '1112x834', '768x1024', '1024x768', '820x1180', '1180x820', '810x1080', '1080x810'];
      if (!ipad && macos && support.touch && iPadScreens.indexOf(`${screenWidth}x${screenHeight}`) >= 0) {
        ipad = ua.match(/(Version)\/([\d.]+)/);
        if (!ipad) ipad = [0, 1, '13_0_0'];
        macos = false;
      }

      // Android
      if (android && !windows) {
        device.os = 'android';
        device.android = true;
      }
      if (ipad || iphone || ipod) {
        device.os = 'ios';
        device.ios = true;
      }

      // Export object
      return device;
    }
    function getDevice(overrides) {
      if (overrides === void 0) {
        overrides = {};
      }
      if (!deviceCached) {
        deviceCached = calcDevice(overrides);
      }
      return deviceCached;
    }

    let browser;
    function calcBrowser() {
      const window = getWindow();
      const device = getDevice();
      let needPerspectiveFix = false;
      function isSafari() {
        const ua = window.navigator.userAgent.toLowerCase();
        return ua.indexOf('safari') >= 0 && ua.indexOf('chrome') < 0 && ua.indexOf('android') < 0;
      }
      if (isSafari()) {
        const ua = String(window.navigator.userAgent);
        if (ua.includes('Version/')) {
          const [major, minor] = ua.split('Version/')[1].split(' ')[0].split('.').map(num => Number(num));
          needPerspectiveFix = major < 16 || major === 16 && minor < 2;
        }
      }
      const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window.navigator.userAgent);
      const isSafariBrowser = isSafari();
      const need3dFix = isSafariBrowser || isWebView && device.ios;
      return {
        isSafari: needPerspectiveFix || isSafariBrowser,
        needPerspectiveFix,
        need3dFix,
        isWebView
      };
    }
    function getBrowser() {
      if (!browser) {
        browser = calcBrowser();
      }
      return browser;
    }

    function Resize(_ref) {
      let {
        swiper,
        on,
        emit
      } = _ref;
      const window = getWindow();
      let observer = null;
      let animationFrame = null;
      const resizeHandler = () => {
        if (!swiper || swiper.destroyed || !swiper.initialized) return;
        emit('beforeResize');
        emit('resize');
      };
      const createObserver = () => {
        if (!swiper || swiper.destroyed || !swiper.initialized) return;
        observer = new ResizeObserver(entries => {
          animationFrame = window.requestAnimationFrame(() => {
            const {
              width,
              height
            } = swiper;
            let newWidth = width;
            let newHeight = height;
            entries.forEach(_ref2 => {
              let {
                contentBoxSize,
                contentRect,
                target
              } = _ref2;
              if (target && target !== swiper.el) return;
              newWidth = contentRect ? contentRect.width : (contentBoxSize[0] || contentBoxSize).inlineSize;
              newHeight = contentRect ? contentRect.height : (contentBoxSize[0] || contentBoxSize).blockSize;
            });
            if (newWidth !== width || newHeight !== height) {
              resizeHandler();
            }
          });
        });
        observer.observe(swiper.el);
      };
      const removeObserver = () => {
        if (animationFrame) {
          window.cancelAnimationFrame(animationFrame);
        }
        if (observer && observer.unobserve && swiper.el) {
          observer.unobserve(swiper.el);
          observer = null;
        }
      };
      const orientationChangeHandler = () => {
        if (!swiper || swiper.destroyed || !swiper.initialized) return;
        emit('orientationchange');
      };
      on('init', () => {
        if (swiper.params.resizeObserver && typeof window.ResizeObserver !== 'undefined') {
          createObserver();
          return;
        }
        window.addEventListener('resize', resizeHandler);
        window.addEventListener('orientationchange', orientationChangeHandler);
      });
      on('destroy', () => {
        removeObserver();
        window.removeEventListener('resize', resizeHandler);
        window.removeEventListener('orientationchange', orientationChangeHandler);
      });
    }

    function Observer(_ref) {
      let {
        swiper,
        extendParams,
        on,
        emit
      } = _ref;
      const observers = [];
      const window = getWindow();
      const attach = function (target, options) {
        if (options === void 0) {
          options = {};
        }
        const ObserverFunc = window.MutationObserver || window.WebkitMutationObserver;
        const observer = new ObserverFunc(mutations => {
          // The observerUpdate event should only be triggered
          // once despite the number of mutations.  Additional
          // triggers are redundant and are very costly
          if (swiper.__preventObserver__) return;
          if (mutations.length === 1) {
            emit('observerUpdate', mutations[0]);
            return;
          }
          const observerUpdate = function observerUpdate() {
            emit('observerUpdate', mutations[0]);
          };
          if (window.requestAnimationFrame) {
            window.requestAnimationFrame(observerUpdate);
          } else {
            window.setTimeout(observerUpdate, 0);
          }
        });
        observer.observe(target, {
          attributes: typeof options.attributes === 'undefined' ? true : options.attributes,
          childList: swiper.isElement || (typeof options.childList === 'undefined' ? true : options).childList,
          characterData: typeof options.characterData === 'undefined' ? true : options.characterData
        });
        observers.push(observer);
      };
      const init = () => {
        if (!swiper.params.observer) return;
        if (swiper.params.observeParents) {
          const containerParents = elementParents(swiper.hostEl);
          for (let i = 0; i < containerParents.length; i += 1) {
            attach(containerParents[i]);
          }
        }
        // Observe container
        attach(swiper.hostEl, {
          childList: swiper.params.observeSlideChildren
        });

        // Observe wrapper
        attach(swiper.wrapperEl, {
          attributes: false
        });
      };
      const destroy = () => {
        observers.forEach(observer => {
          observer.disconnect();
        });
        observers.splice(0, observers.length);
      };
      extendParams({
        observer: false,
        observeParents: false,
        observeSlideChildren: false
      });
      on('init', init);
      on('destroy', destroy);
    }

    /* eslint-disable no-underscore-dangle */

    var eventsEmitter = {
      on(events, handler, priority) {
        const self = this;
        if (!self.eventsListeners || self.destroyed) return self;
        if (typeof handler !== 'function') return self;
        const method = priority ? 'unshift' : 'push';
        events.split(' ').forEach(event => {
          if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
          self.eventsListeners[event][method](handler);
        });
        return self;
      },
      once(events, handler, priority) {
        const self = this;
        if (!self.eventsListeners || self.destroyed) return self;
        if (typeof handler !== 'function') return self;
        function onceHandler() {
          self.off(events, onceHandler);
          if (onceHandler.__emitterProxy) {
            delete onceHandler.__emitterProxy;
          }
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          handler.apply(self, args);
        }
        onceHandler.__emitterProxy = handler;
        return self.on(events, onceHandler, priority);
      },
      onAny(handler, priority) {
        const self = this;
        if (!self.eventsListeners || self.destroyed) return self;
        if (typeof handler !== 'function') return self;
        const method = priority ? 'unshift' : 'push';
        if (self.eventsAnyListeners.indexOf(handler) < 0) {
          self.eventsAnyListeners[method](handler);
        }
        return self;
      },
      offAny(handler) {
        const self = this;
        if (!self.eventsListeners || self.destroyed) return self;
        if (!self.eventsAnyListeners) return self;
        const index = self.eventsAnyListeners.indexOf(handler);
        if (index >= 0) {
          self.eventsAnyListeners.splice(index, 1);
        }
        return self;
      },
      off(events, handler) {
        const self = this;
        if (!self.eventsListeners || self.destroyed) return self;
        if (!self.eventsListeners) return self;
        events.split(' ').forEach(event => {
          if (typeof handler === 'undefined') {
            self.eventsListeners[event] = [];
          } else if (self.eventsListeners[event]) {
            self.eventsListeners[event].forEach((eventHandler, index) => {
              if (eventHandler === handler || eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler) {
                self.eventsListeners[event].splice(index, 1);
              }
            });
          }
        });
        return self;
      },
      emit() {
        const self = this;
        if (!self.eventsListeners || self.destroyed) return self;
        if (!self.eventsListeners) return self;
        let events;
        let data;
        let context;
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }
        if (typeof args[0] === 'string' || Array.isArray(args[0])) {
          events = args[0];
          data = args.slice(1, args.length);
          context = self;
        } else {
          events = args[0].events;
          data = args[0].data;
          context = args[0].context || self;
        }
        data.unshift(context);
        const eventsArray = Array.isArray(events) ? events : events.split(' ');
        eventsArray.forEach(event => {
          if (self.eventsAnyListeners && self.eventsAnyListeners.length) {
            self.eventsAnyListeners.forEach(eventHandler => {
              eventHandler.apply(context, [event, ...data]);
            });
          }
          if (self.eventsListeners && self.eventsListeners[event]) {
            self.eventsListeners[event].forEach(eventHandler => {
              eventHandler.apply(context, data);
            });
          }
        });
        return self;
      }
    };

    function updateSize() {
      const swiper = this;
      let width;
      let height;
      const el = swiper.el;
      if (typeof swiper.params.width !== 'undefined' && swiper.params.width !== null) {
        width = swiper.params.width;
      } else {
        width = el.clientWidth;
      }
      if (typeof swiper.params.height !== 'undefined' && swiper.params.height !== null) {
        height = swiper.params.height;
      } else {
        height = el.clientHeight;
      }
      if (width === 0 && swiper.isHorizontal() || height === 0 && swiper.isVertical()) {
        return;
      }

      // Subtract paddings
      width = width - parseInt(elementStyle(el, 'padding-left') || 0, 10) - parseInt(elementStyle(el, 'padding-right') || 0, 10);
      height = height - parseInt(elementStyle(el, 'padding-top') || 0, 10) - parseInt(elementStyle(el, 'padding-bottom') || 0, 10);
      if (Number.isNaN(width)) width = 0;
      if (Number.isNaN(height)) height = 0;
      Object.assign(swiper, {
        width,
        height,
        size: swiper.isHorizontal() ? width : height
      });
    }

    function updateSlides() {
      const swiper = this;
      function getDirectionPropertyValue(node, label) {
        return parseFloat(node.getPropertyValue(swiper.getDirectionLabel(label)) || 0);
      }
      const params = swiper.params;
      const {
        wrapperEl,
        slidesEl,
        size: swiperSize,
        rtlTranslate: rtl,
        wrongRTL
      } = swiper;
      const isVirtual = swiper.virtual && params.virtual.enabled;
      const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
      const slides = elementChildren(slidesEl, `.${swiper.params.slideClass}, swiper-slide`);
      const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
      let snapGrid = [];
      const slidesGrid = [];
      const slidesSizesGrid = [];
      let offsetBefore = params.slidesOffsetBefore;
      if (typeof offsetBefore === 'function') {
        offsetBefore = params.slidesOffsetBefore.call(swiper);
      }
      let offsetAfter = params.slidesOffsetAfter;
      if (typeof offsetAfter === 'function') {
        offsetAfter = params.slidesOffsetAfter.call(swiper);
      }
      const previousSnapGridLength = swiper.snapGrid.length;
      const previousSlidesGridLength = swiper.slidesGrid.length;
      let spaceBetween = params.spaceBetween;
      let slidePosition = -offsetBefore;
      let prevSlideSize = 0;
      let index = 0;
      if (typeof swiperSize === 'undefined') {
        return;
      }
      if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
        spaceBetween = parseFloat(spaceBetween.replace('%', '')) / 100 * swiperSize;
      } else if (typeof spaceBetween === 'string') {
        spaceBetween = parseFloat(spaceBetween);
      }
      swiper.virtualSize = -spaceBetween;

      // reset margins
      slides.forEach(slideEl => {
        if (rtl) {
          slideEl.style.marginLeft = '';
        } else {
          slideEl.style.marginRight = '';
        }
        slideEl.style.marginBottom = '';
        slideEl.style.marginTop = '';
      });

      // reset cssMode offsets
      if (params.centeredSlides && params.cssMode) {
        setCSSProperty(wrapperEl, '--swiper-centered-offset-before', '');
        setCSSProperty(wrapperEl, '--swiper-centered-offset-after', '');
      }
      const gridEnabled = params.grid && params.grid.rows > 1 && swiper.grid;
      if (gridEnabled) {
        swiper.grid.initSlides(slides);
      } else if (swiper.grid) {
        swiper.grid.unsetSlides();
      }

      // Calc slides
      let slideSize;
      const shouldResetSlideSize = params.slidesPerView === 'auto' && params.breakpoints && Object.keys(params.breakpoints).filter(key => {
        return typeof params.breakpoints[key].slidesPerView !== 'undefined';
      }).length > 0;
      for (let i = 0; i < slidesLength; i += 1) {
        slideSize = 0;
        let slide;
        if (slides[i]) slide = slides[i];
        if (gridEnabled) {
          swiper.grid.updateSlide(i, slide, slides);
        }
        if (slides[i] && elementStyle(slide, 'display') === 'none') continue; // eslint-disable-line

        if (params.slidesPerView === 'auto') {
          if (shouldResetSlideSize) {
            slides[i].style[swiper.getDirectionLabel('width')] = ``;
          }
          const slideStyles = getComputedStyle(slide);
          const currentTransform = slide.style.transform;
          const currentWebKitTransform = slide.style.webkitTransform;
          if (currentTransform) {
            slide.style.transform = 'none';
          }
          if (currentWebKitTransform) {
            slide.style.webkitTransform = 'none';
          }
          if (params.roundLengths) {
            slideSize = swiper.isHorizontal() ? elementOuterSize(slide, 'width', true) : elementOuterSize(slide, 'height', true);
          } else {
            // eslint-disable-next-line
            const width = getDirectionPropertyValue(slideStyles, 'width');
            const paddingLeft = getDirectionPropertyValue(slideStyles, 'padding-left');
            const paddingRight = getDirectionPropertyValue(slideStyles, 'padding-right');
            const marginLeft = getDirectionPropertyValue(slideStyles, 'margin-left');
            const marginRight = getDirectionPropertyValue(slideStyles, 'margin-right');
            const boxSizing = slideStyles.getPropertyValue('box-sizing');
            if (boxSizing && boxSizing === 'border-box') {
              slideSize = width + marginLeft + marginRight;
            } else {
              const {
                clientWidth,
                offsetWidth
              } = slide;
              slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight + (offsetWidth - clientWidth);
            }
          }
          if (currentTransform) {
            slide.style.transform = currentTransform;
          }
          if (currentWebKitTransform) {
            slide.style.webkitTransform = currentWebKitTransform;
          }
          if (params.roundLengths) slideSize = Math.floor(slideSize);
        } else {
          slideSize = (swiperSize - (params.slidesPerView - 1) * spaceBetween) / params.slidesPerView;
          if (params.roundLengths) slideSize = Math.floor(slideSize);
          if (slides[i]) {
            slides[i].style[swiper.getDirectionLabel('width')] = `${slideSize}px`;
          }
        }
        if (slides[i]) {
          slides[i].swiperSlideSize = slideSize;
        }
        slidesSizesGrid.push(slideSize);
        if (params.centeredSlides) {
          slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
          if (prevSlideSize === 0 && i !== 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
          if (i === 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
          if (Math.abs(slidePosition) < 1 / 1000) slidePosition = 0;
          if (params.roundLengths) slidePosition = Math.floor(slidePosition);
          if (index % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
          slidesGrid.push(slidePosition);
        } else {
          if (params.roundLengths) slidePosition = Math.floor(slidePosition);
          if ((index - Math.min(swiper.params.slidesPerGroupSkip, index)) % swiper.params.slidesPerGroup === 0) snapGrid.push(slidePosition);
          slidesGrid.push(slidePosition);
          slidePosition = slidePosition + slideSize + spaceBetween;
        }
        swiper.virtualSize += slideSize + spaceBetween;
        prevSlideSize = slideSize;
        index += 1;
      }
      swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;
      if (rtl && wrongRTL && (params.effect === 'slide' || params.effect === 'coverflow')) {
        wrapperEl.style.width = `${swiper.virtualSize + spaceBetween}px`;
      }
      if (params.setWrapperSize) {
        wrapperEl.style[swiper.getDirectionLabel('width')] = `${swiper.virtualSize + spaceBetween}px`;
      }
      if (gridEnabled) {
        swiper.grid.updateWrapperSize(slideSize, snapGrid);
      }

      // Remove last grid elements depending on width
      if (!params.centeredSlides) {
        const newSlidesGrid = [];
        for (let i = 0; i < snapGrid.length; i += 1) {
          let slidesGridItem = snapGrid[i];
          if (params.roundLengths) slidesGridItem = Math.floor(slidesGridItem);
          if (snapGrid[i] <= swiper.virtualSize - swiperSize) {
            newSlidesGrid.push(slidesGridItem);
          }
        }
        snapGrid = newSlidesGrid;
        if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) {
          snapGrid.push(swiper.virtualSize - swiperSize);
        }
      }
      if (isVirtual && params.loop) {
        const size = slidesSizesGrid[0] + spaceBetween;
        if (params.slidesPerGroup > 1) {
          const groups = Math.ceil((swiper.virtual.slidesBefore + swiper.virtual.slidesAfter) / params.slidesPerGroup);
          const groupSize = size * params.slidesPerGroup;
          for (let i = 0; i < groups; i += 1) {
            snapGrid.push(snapGrid[snapGrid.length - 1] + groupSize);
          }
        }
        for (let i = 0; i < swiper.virtual.slidesBefore + swiper.virtual.slidesAfter; i += 1) {
          if (params.slidesPerGroup === 1) {
            snapGrid.push(snapGrid[snapGrid.length - 1] + size);
          }
          slidesGrid.push(slidesGrid[slidesGrid.length - 1] + size);
          swiper.virtualSize += size;
        }
      }
      if (snapGrid.length === 0) snapGrid = [0];
      if (spaceBetween !== 0) {
        const key = swiper.isHorizontal() && rtl ? 'marginLeft' : swiper.getDirectionLabel('marginRight');
        slides.filter((_, slideIndex) => {
          if (!params.cssMode || params.loop) return true;
          if (slideIndex === slides.length - 1) {
            return false;
          }
          return true;
        }).forEach(slideEl => {
          slideEl.style[key] = `${spaceBetween}px`;
        });
      }
      if (params.centeredSlides && params.centeredSlidesBounds) {
        let allSlidesSize = 0;
        slidesSizesGrid.forEach(slideSizeValue => {
          allSlidesSize += slideSizeValue + (spaceBetween || 0);
        });
        allSlidesSize -= spaceBetween;
        const maxSnap = allSlidesSize > swiperSize ? allSlidesSize - swiperSize : 0;
        snapGrid = snapGrid.map(snap => {
          if (snap <= 0) return -offsetBefore;
          if (snap > maxSnap) return maxSnap + offsetAfter;
          return snap;
        });
      }
      if (params.centerInsufficientSlides) {
        let allSlidesSize = 0;
        slidesSizesGrid.forEach(slideSizeValue => {
          allSlidesSize += slideSizeValue + (spaceBetween || 0);
        });
        allSlidesSize -= spaceBetween;
        const offsetSize = (params.slidesOffsetBefore || 0) + (params.slidesOffsetAfter || 0);
        if (allSlidesSize + offsetSize < swiperSize) {
          const allSlidesOffset = (swiperSize - allSlidesSize - offsetSize) / 2;
          snapGrid.forEach((snap, snapIndex) => {
            snapGrid[snapIndex] = snap - allSlidesOffset;
          });
          slidesGrid.forEach((snap, snapIndex) => {
            slidesGrid[snapIndex] = snap + allSlidesOffset;
          });
        }
      }
      Object.assign(swiper, {
        slides,
        snapGrid,
        slidesGrid,
        slidesSizesGrid
      });
      if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
        setCSSProperty(wrapperEl, '--swiper-centered-offset-before', `${-snapGrid[0]}px`);
        setCSSProperty(wrapperEl, '--swiper-centered-offset-after', `${swiper.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
        const addToSnapGrid = -swiper.snapGrid[0];
        const addToSlidesGrid = -swiper.slidesGrid[0];
        swiper.snapGrid = swiper.snapGrid.map(v => v + addToSnapGrid);
        swiper.slidesGrid = swiper.slidesGrid.map(v => v + addToSlidesGrid);
      }
      if (slidesLength !== previousSlidesLength) {
        swiper.emit('slidesLengthChange');
      }
      if (snapGrid.length !== previousSnapGridLength) {
        if (swiper.params.watchOverflow) swiper.checkOverflow();
        swiper.emit('snapGridLengthChange');
      }
      if (slidesGrid.length !== previousSlidesGridLength) {
        swiper.emit('slidesGridLengthChange');
      }
      if (params.watchSlidesProgress) {
        swiper.updateSlidesOffset();
      }
      swiper.emit('slidesUpdated');
      if (!isVirtual && !params.cssMode && (params.effect === 'slide' || params.effect === 'fade')) {
        const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
        const hasClassBackfaceClassAdded = swiper.el.classList.contains(backFaceHiddenClass);
        if (slidesLength <= params.maxBackfaceHiddenSlides) {
          if (!hasClassBackfaceClassAdded) swiper.el.classList.add(backFaceHiddenClass);
        } else if (hasClassBackfaceClassAdded) {
          swiper.el.classList.remove(backFaceHiddenClass);
        }
      }
    }

    function updateAutoHeight(speed) {
      const swiper = this;
      const activeSlides = [];
      const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
      let newHeight = 0;
      let i;
      if (typeof speed === 'number') {
        swiper.setTransition(speed);
      } else if (speed === true) {
        swiper.setTransition(swiper.params.speed);
      }
      const getSlideByIndex = index => {
        if (isVirtual) {
          return swiper.slides[swiper.getSlideIndexByData(index)];
        }
        return swiper.slides[index];
      };
      // Find slides currently in view
      if (swiper.params.slidesPerView !== 'auto' && swiper.params.slidesPerView > 1) {
        if (swiper.params.centeredSlides) {
          (swiper.visibleSlides || []).forEach(slide => {
            activeSlides.push(slide);
          });
        } else {
          for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
            const index = swiper.activeIndex + i;
            if (index > swiper.slides.length && !isVirtual) break;
            activeSlides.push(getSlideByIndex(index));
          }
        }
      } else {
        activeSlides.push(getSlideByIndex(swiper.activeIndex));
      }

      // Find new height from highest slide in view
      for (i = 0; i < activeSlides.length; i += 1) {
        if (typeof activeSlides[i] !== 'undefined') {
          const height = activeSlides[i].offsetHeight;
          newHeight = height > newHeight ? height : newHeight;
        }
      }

      // Update Height
      if (newHeight || newHeight === 0) swiper.wrapperEl.style.height = `${newHeight}px`;
    }

    function updateSlidesOffset() {
      const swiper = this;
      const slides = swiper.slides;
      // eslint-disable-next-line
      const minusOffset = swiper.isElement ? swiper.isHorizontal() ? swiper.wrapperEl.offsetLeft : swiper.wrapperEl.offsetTop : 0;
      for (let i = 0; i < slides.length; i += 1) {
        slides[i].swiperSlideOffset = (swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop) - minusOffset - swiper.cssOverflowAdjustment();
      }
    }

    const toggleSlideClasses$1 = (slideEl, condition, className) => {
      if (condition && !slideEl.classList.contains(className)) {
        slideEl.classList.add(className);
      } else if (!condition && slideEl.classList.contains(className)) {
        slideEl.classList.remove(className);
      }
    };
    function updateSlidesProgress(translate) {
      if (translate === void 0) {
        translate = this && this.translate || 0;
      }
      const swiper = this;
      const params = swiper.params;
      const {
        slides,
        rtlTranslate: rtl,
        snapGrid
      } = swiper;
      if (slides.length === 0) return;
      if (typeof slides[0].swiperSlideOffset === 'undefined') swiper.updateSlidesOffset();
      let offsetCenter = -translate;
      if (rtl) offsetCenter = translate;
      swiper.visibleSlidesIndexes = [];
      swiper.visibleSlides = [];
      let spaceBetween = params.spaceBetween;
      if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
        spaceBetween = parseFloat(spaceBetween.replace('%', '')) / 100 * swiper.size;
      } else if (typeof spaceBetween === 'string') {
        spaceBetween = parseFloat(spaceBetween);
      }
      for (let i = 0; i < slides.length; i += 1) {
        const slide = slides[i];
        let slideOffset = slide.swiperSlideOffset;
        if (params.cssMode && params.centeredSlides) {
          slideOffset -= slides[0].swiperSlideOffset;
        }
        const slideProgress = (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + spaceBetween);
        const originalSlideProgress = (offsetCenter - snapGrid[0] + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + spaceBetween);
        const slideBefore = -(offsetCenter - slideOffset);
        const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
        const isFullyVisible = slideBefore >= 0 && slideBefore <= swiper.size - swiper.slidesSizesGrid[i];
        const isVisible = slideBefore >= 0 && slideBefore < swiper.size - 1 || slideAfter > 1 && slideAfter <= swiper.size || slideBefore <= 0 && slideAfter >= swiper.size;
        if (isVisible) {
          swiper.visibleSlides.push(slide);
          swiper.visibleSlidesIndexes.push(i);
        }
        toggleSlideClasses$1(slide, isVisible, params.slideVisibleClass);
        toggleSlideClasses$1(slide, isFullyVisible, params.slideFullyVisibleClass);
        slide.progress = rtl ? -slideProgress : slideProgress;
        slide.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
      }
    }

    function updateProgress(translate) {
      const swiper = this;
      if (typeof translate === 'undefined') {
        const multiplier = swiper.rtlTranslate ? -1 : 1;
        // eslint-disable-next-line
        translate = swiper && swiper.translate && swiper.translate * multiplier || 0;
      }
      const params = swiper.params;
      const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
      let {
        progress,
        isBeginning,
        isEnd,
        progressLoop
      } = swiper;
      const wasBeginning = isBeginning;
      const wasEnd = isEnd;
      if (translatesDiff === 0) {
        progress = 0;
        isBeginning = true;
        isEnd = true;
      } else {
        progress = (translate - swiper.minTranslate()) / translatesDiff;
        const isBeginningRounded = Math.abs(translate - swiper.minTranslate()) < 1;
        const isEndRounded = Math.abs(translate - swiper.maxTranslate()) < 1;
        isBeginning = isBeginningRounded || progress <= 0;
        isEnd = isEndRounded || progress >= 1;
        if (isBeginningRounded) progress = 0;
        if (isEndRounded) progress = 1;
      }
      if (params.loop) {
        const firstSlideIndex = swiper.getSlideIndexByData(0);
        const lastSlideIndex = swiper.getSlideIndexByData(swiper.slides.length - 1);
        const firstSlideTranslate = swiper.slidesGrid[firstSlideIndex];
        const lastSlideTranslate = swiper.slidesGrid[lastSlideIndex];
        const translateMax = swiper.slidesGrid[swiper.slidesGrid.length - 1];
        const translateAbs = Math.abs(translate);
        if (translateAbs >= firstSlideTranslate) {
          progressLoop = (translateAbs - firstSlideTranslate) / translateMax;
        } else {
          progressLoop = (translateAbs + translateMax - lastSlideTranslate) / translateMax;
        }
        if (progressLoop > 1) progressLoop -= 1;
      }
      Object.assign(swiper, {
        progress,
        progressLoop,
        isBeginning,
        isEnd
      });
      if (params.watchSlidesProgress || params.centeredSlides && params.autoHeight) swiper.updateSlidesProgress(translate);
      if (isBeginning && !wasBeginning) {
        swiper.emit('reachBeginning toEdge');
      }
      if (isEnd && !wasEnd) {
        swiper.emit('reachEnd toEdge');
      }
      if (wasBeginning && !isBeginning || wasEnd && !isEnd) {
        swiper.emit('fromEdge');
      }
      swiper.emit('progress', progress);
    }

    const toggleSlideClasses = (slideEl, condition, className) => {
      if (condition && !slideEl.classList.contains(className)) {
        slideEl.classList.add(className);
      } else if (!condition && slideEl.classList.contains(className)) {
        slideEl.classList.remove(className);
      }
    };
    function updateSlidesClasses() {
      const swiper = this;
      const {
        slides,
        params,
        slidesEl,
        activeIndex
      } = swiper;
      const isVirtual = swiper.virtual && params.virtual.enabled;
      const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
      const getFilteredSlide = selector => {
        return elementChildren(slidesEl, `.${params.slideClass}${selector}, swiper-slide${selector}`)[0];
      };
      let activeSlide;
      let prevSlide;
      let nextSlide;
      if (isVirtual) {
        if (params.loop) {
          let slideIndex = activeIndex - swiper.virtual.slidesBefore;
          if (slideIndex < 0) slideIndex = swiper.virtual.slides.length + slideIndex;
          if (slideIndex >= swiper.virtual.slides.length) slideIndex -= swiper.virtual.slides.length;
          activeSlide = getFilteredSlide(`[data-swiper-slide-index="${slideIndex}"]`);
        } else {
          activeSlide = getFilteredSlide(`[data-swiper-slide-index="${activeIndex}"]`);
        }
      } else {
        if (gridEnabled) {
          activeSlide = slides.find(slideEl => slideEl.column === activeIndex);
          nextSlide = slides.find(slideEl => slideEl.column === activeIndex + 1);
          prevSlide = slides.find(slideEl => slideEl.column === activeIndex - 1);
        } else {
          activeSlide = slides[activeIndex];
        }
      }
      if (activeSlide) {
        if (!gridEnabled) {
          // Next Slide
          nextSlide = elementNextAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
          if (params.loop && !nextSlide) {
            nextSlide = slides[0];
          }

          // Prev Slide
          prevSlide = elementPrevAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
          if (params.loop && !prevSlide === 0) {
            prevSlide = slides[slides.length - 1];
          }
        }
      }
      slides.forEach(slideEl => {
        toggleSlideClasses(slideEl, slideEl === activeSlide, params.slideActiveClass);
        toggleSlideClasses(slideEl, slideEl === nextSlide, params.slideNextClass);
        toggleSlideClasses(slideEl, slideEl === prevSlide, params.slidePrevClass);
      });
      swiper.emitSlidesClasses();
    }

    const processLazyPreloader = (swiper, imageEl) => {
      if (!swiper || swiper.destroyed || !swiper.params) return;
      const slideSelector = () => swiper.isElement ? `swiper-slide` : `.${swiper.params.slideClass}`;
      const slideEl = imageEl.closest(slideSelector());
      if (slideEl) {
        let lazyEl = slideEl.querySelector(`.${swiper.params.lazyPreloaderClass}`);
        if (!lazyEl && swiper.isElement) {
          if (slideEl.shadowRoot) {
            lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
          } else {
            // init later
            requestAnimationFrame(() => {
              if (slideEl.shadowRoot) {
                lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
                if (lazyEl) lazyEl.remove();
              }
            });
          }
        }
        if (lazyEl) lazyEl.remove();
      }
    };
    const unlazy = (swiper, index) => {
      if (!swiper.slides[index]) return;
      const imageEl = swiper.slides[index].querySelector('[loading="lazy"]');
      if (imageEl) imageEl.removeAttribute('loading');
    };
    const preload = swiper => {
      if (!swiper || swiper.destroyed || !swiper.params) return;
      let amount = swiper.params.lazyPreloadPrevNext;
      const len = swiper.slides.length;
      if (!len || !amount || amount < 0) return;
      amount = Math.min(amount, len);
      const slidesPerView = swiper.params.slidesPerView === 'auto' ? swiper.slidesPerViewDynamic() : Math.ceil(swiper.params.slidesPerView);
      const activeIndex = swiper.activeIndex;
      if (swiper.params.grid && swiper.params.grid.rows > 1) {
        const activeColumn = activeIndex;
        const preloadColumns = [activeColumn - amount];
        preloadColumns.push(...Array.from({
          length: amount
        }).map((_, i) => {
          return activeColumn + slidesPerView + i;
        }));
        swiper.slides.forEach((slideEl, i) => {
          if (preloadColumns.includes(slideEl.column)) unlazy(swiper, i);
        });
        return;
      }
      const slideIndexLastInView = activeIndex + slidesPerView - 1;
      if (swiper.params.rewind || swiper.params.loop) {
        for (let i = activeIndex - amount; i <= slideIndexLastInView + amount; i += 1) {
          const realIndex = (i % len + len) % len;
          if (realIndex < activeIndex || realIndex > slideIndexLastInView) unlazy(swiper, realIndex);
        }
      } else {
        for (let i = Math.max(activeIndex - amount, 0); i <= Math.min(slideIndexLastInView + amount, len - 1); i += 1) {
          if (i !== activeIndex && (i > slideIndexLastInView || i < activeIndex)) {
            unlazy(swiper, i);
          }
        }
      }
    };

    function getActiveIndexByTranslate(swiper) {
      const {
        slidesGrid,
        params
      } = swiper;
      const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
      let activeIndex;
      for (let i = 0; i < slidesGrid.length; i += 1) {
        if (typeof slidesGrid[i + 1] !== 'undefined') {
          if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) {
            activeIndex = i;
          } else if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1]) {
            activeIndex = i + 1;
          }
        } else if (translate >= slidesGrid[i]) {
          activeIndex = i;
        }
      }
      // Normalize slideIndex
      if (params.normalizeSlideIndex) {
        if (activeIndex < 0 || typeof activeIndex === 'undefined') activeIndex = 0;
      }
      return activeIndex;
    }
    function updateActiveIndex(newActiveIndex) {
      const swiper = this;
      const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
      const {
        snapGrid,
        params,
        activeIndex: previousIndex,
        realIndex: previousRealIndex,
        snapIndex: previousSnapIndex
      } = swiper;
      let activeIndex = newActiveIndex;
      let snapIndex;
      const getVirtualRealIndex = aIndex => {
        let realIndex = aIndex - swiper.virtual.slidesBefore;
        if (realIndex < 0) {
          realIndex = swiper.virtual.slides.length + realIndex;
        }
        if (realIndex >= swiper.virtual.slides.length) {
          realIndex -= swiper.virtual.slides.length;
        }
        return realIndex;
      };
      if (typeof activeIndex === 'undefined') {
        activeIndex = getActiveIndexByTranslate(swiper);
      }
      if (snapGrid.indexOf(translate) >= 0) {
        snapIndex = snapGrid.indexOf(translate);
      } else {
        const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
        snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
      }
      if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
      if (activeIndex === previousIndex && !swiper.params.loop) {
        if (snapIndex !== previousSnapIndex) {
          swiper.snapIndex = snapIndex;
          swiper.emit('snapIndexChange');
        }
        return;
      }
      if (activeIndex === previousIndex && swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) {
        swiper.realIndex = getVirtualRealIndex(activeIndex);
        return;
      }
      const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;

      // Get real index
      let realIndex;
      if (swiper.virtual && params.virtual.enabled && params.loop) {
        realIndex = getVirtualRealIndex(activeIndex);
      } else if (gridEnabled) {
        const firstSlideInColumn = swiper.slides.find(slideEl => slideEl.column === activeIndex);
        let activeSlideIndex = parseInt(firstSlideInColumn.getAttribute('data-swiper-slide-index'), 10);
        if (Number.isNaN(activeSlideIndex)) {
          activeSlideIndex = Math.max(swiper.slides.indexOf(firstSlideInColumn), 0);
        }
        realIndex = Math.floor(activeSlideIndex / params.grid.rows);
      } else if (swiper.slides[activeIndex]) {
        const slideIndex = swiper.slides[activeIndex].getAttribute('data-swiper-slide-index');
        if (slideIndex) {
          realIndex = parseInt(slideIndex, 10);
        } else {
          realIndex = activeIndex;
        }
      } else {
        realIndex = activeIndex;
      }
      Object.assign(swiper, {
        previousSnapIndex,
        snapIndex,
        previousRealIndex,
        realIndex,
        previousIndex,
        activeIndex
      });
      if (swiper.initialized) {
        preload(swiper);
      }
      swiper.emit('activeIndexChange');
      swiper.emit('snapIndexChange');
      if (swiper.initialized || swiper.params.runCallbacksOnInit) {
        if (previousRealIndex !== realIndex) {
          swiper.emit('realIndexChange');
        }
        swiper.emit('slideChange');
      }
    }

    function updateClickedSlide(el, path) {
      const swiper = this;
      const params = swiper.params;
      let slide = el.closest(`.${params.slideClass}, swiper-slide`);
      if (!slide && swiper.isElement && path && path.length > 1 && path.includes(el)) {
        [...path.slice(path.indexOf(el) + 1, path.length)].forEach(pathEl => {
          if (!slide && pathEl.matches && pathEl.matches(`.${params.slideClass}, swiper-slide`)) {
            slide = pathEl;
          }
        });
      }
      let slideFound = false;
      let slideIndex;
      if (slide) {
        for (let i = 0; i < swiper.slides.length; i += 1) {
          if (swiper.slides[i] === slide) {
            slideFound = true;
            slideIndex = i;
            break;
          }
        }
      }
      if (slide && slideFound) {
        swiper.clickedSlide = slide;
        if (swiper.virtual && swiper.params.virtual.enabled) {
          swiper.clickedIndex = parseInt(slide.getAttribute('data-swiper-slide-index'), 10);
        } else {
          swiper.clickedIndex = slideIndex;
        }
      } else {
        swiper.clickedSlide = undefined;
        swiper.clickedIndex = undefined;
        return;
      }
      if (params.slideToClickedSlide && swiper.clickedIndex !== undefined && swiper.clickedIndex !== swiper.activeIndex) {
        swiper.slideToClickedSlide();
      }
    }

    var update = {
      updateSize,
      updateSlides,
      updateAutoHeight,
      updateSlidesOffset,
      updateSlidesProgress,
      updateProgress,
      updateSlidesClasses,
      updateActiveIndex,
      updateClickedSlide
    };

    function getSwiperTranslate(axis) {
      if (axis === void 0) {
        axis = this.isHorizontal() ? 'x' : 'y';
      }
      const swiper = this;
      const {
        params,
        rtlTranslate: rtl,
        translate,
        wrapperEl
      } = swiper;
      if (params.virtualTranslate) {
        return rtl ? -translate : translate;
      }
      if (params.cssMode) {
        return translate;
      }
      let currentTranslate = getTranslate(wrapperEl, axis);
      currentTranslate += swiper.cssOverflowAdjustment();
      if (rtl) currentTranslate = -currentTranslate;
      return currentTranslate || 0;
    }

    function setTranslate(translate, byController) {
      const swiper = this;
      const {
        rtlTranslate: rtl,
        params,
        wrapperEl,
        progress
      } = swiper;
      let x = 0;
      let y = 0;
      const z = 0;
      if (swiper.isHorizontal()) {
        x = rtl ? -translate : translate;
      } else {
        y = translate;
      }
      if (params.roundLengths) {
        x = Math.floor(x);
        y = Math.floor(y);
      }
      swiper.previousTranslate = swiper.translate;
      swiper.translate = swiper.isHorizontal() ? x : y;
      if (params.cssMode) {
        wrapperEl[swiper.isHorizontal() ? 'scrollLeft' : 'scrollTop'] = swiper.isHorizontal() ? -x : -y;
      } else if (!params.virtualTranslate) {
        if (swiper.isHorizontal()) {
          x -= swiper.cssOverflowAdjustment();
        } else {
          y -= swiper.cssOverflowAdjustment();
        }
        wrapperEl.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
      }

      // Check if we need to update progress
      let newProgress;
      const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
      if (translatesDiff === 0) {
        newProgress = 0;
      } else {
        newProgress = (translate - swiper.minTranslate()) / translatesDiff;
      }
      if (newProgress !== progress) {
        swiper.updateProgress(translate);
      }
      swiper.emit('setTranslate', swiper.translate, byController);
    }

    function minTranslate() {
      return -this.snapGrid[0];
    }

    function maxTranslate() {
      return -this.snapGrid[this.snapGrid.length - 1];
    }

    function translateTo(translate, speed, runCallbacks, translateBounds, internal) {
      if (translate === void 0) {
        translate = 0;
      }
      if (speed === void 0) {
        speed = this.params.speed;
      }
      if (runCallbacks === void 0) {
        runCallbacks = true;
      }
      if (translateBounds === void 0) {
        translateBounds = true;
      }
      const swiper = this;
      const {
        params,
        wrapperEl
      } = swiper;
      if (swiper.animating && params.preventInteractionOnTransition) {
        return false;
      }
      const minTranslate = swiper.minTranslate();
      const maxTranslate = swiper.maxTranslate();
      let newTranslate;
      if (translateBounds && translate > minTranslate) newTranslate = minTranslate;else if (translateBounds && translate < maxTranslate) newTranslate = maxTranslate;else newTranslate = translate;

      // Update progress
      swiper.updateProgress(newTranslate);
      if (params.cssMode) {
        const isH = swiper.isHorizontal();
        if (speed === 0) {
          wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = -newTranslate;
        } else {
          if (!swiper.support.smoothScroll) {
            animateCSSModeScroll({
              swiper,
              targetPosition: -newTranslate,
              side: isH ? 'left' : 'top'
            });
            return true;
          }
          wrapperEl.scrollTo({
            [isH ? 'left' : 'top']: -newTranslate,
            behavior: 'smooth'
          });
        }
        return true;
      }
      if (speed === 0) {
        swiper.setTransition(0);
        swiper.setTranslate(newTranslate);
        if (runCallbacks) {
          swiper.emit('beforeTransitionStart', speed, internal);
          swiper.emit('transitionEnd');
        }
      } else {
        swiper.setTransition(speed);
        swiper.setTranslate(newTranslate);
        if (runCallbacks) {
          swiper.emit('beforeTransitionStart', speed, internal);
          swiper.emit('transitionStart');
        }
        if (!swiper.animating) {
          swiper.animating = true;
          if (!swiper.onTranslateToWrapperTransitionEnd) {
            swiper.onTranslateToWrapperTransitionEnd = function transitionEnd(e) {
              if (!swiper || swiper.destroyed) return;
              if (e.target !== this) return;
              swiper.wrapperEl.removeEventListener('transitionend', swiper.onTranslateToWrapperTransitionEnd);
              swiper.onTranslateToWrapperTransitionEnd = null;
              delete swiper.onTranslateToWrapperTransitionEnd;
              swiper.animating = false;
              if (runCallbacks) {
                swiper.emit('transitionEnd');
              }
            };
          }
          swiper.wrapperEl.addEventListener('transitionend', swiper.onTranslateToWrapperTransitionEnd);
        }
      }
      return true;
    }

    var translate = {
      getTranslate: getSwiperTranslate,
      setTranslate,
      minTranslate,
      maxTranslate,
      translateTo
    };

    function setTransition(duration, byController) {
      const swiper = this;
      if (!swiper.params.cssMode) {
        swiper.wrapperEl.style.transitionDuration = `${duration}ms`;
        swiper.wrapperEl.style.transitionDelay = duration === 0 ? `0ms` : '';
      }
      swiper.emit('setTransition', duration, byController);
    }

    function transitionEmit(_ref) {
      let {
        swiper,
        runCallbacks,
        direction,
        step
      } = _ref;
      const {
        activeIndex,
        previousIndex
      } = swiper;
      let dir = direction;
      if (!dir) {
        if (activeIndex > previousIndex) dir = 'next';else if (activeIndex < previousIndex) dir = 'prev';else dir = 'reset';
      }
      swiper.emit(`transition${step}`);
      if (runCallbacks && activeIndex !== previousIndex) {
        if (dir === 'reset') {
          swiper.emit(`slideResetTransition${step}`);
          return;
        }
        swiper.emit(`slideChangeTransition${step}`);
        if (dir === 'next') {
          swiper.emit(`slideNextTransition${step}`);
        } else {
          swiper.emit(`slidePrevTransition${step}`);
        }
      }
    }

    function transitionStart(runCallbacks, direction) {
      if (runCallbacks === void 0) {
        runCallbacks = true;
      }
      const swiper = this;
      const {
        params
      } = swiper;
      if (params.cssMode) return;
      if (params.autoHeight) {
        swiper.updateAutoHeight();
      }
      transitionEmit({
        swiper,
        runCallbacks,
        direction,
        step: 'Start'
      });
    }

    function transitionEnd(runCallbacks, direction) {
      if (runCallbacks === void 0) {
        runCallbacks = true;
      }
      const swiper = this;
      const {
        params
      } = swiper;
      swiper.animating = false;
      if (params.cssMode) return;
      swiper.setTransition(0);
      transitionEmit({
        swiper,
        runCallbacks,
        direction,
        step: 'End'
      });
    }

    var transition = {
      setTransition,
      transitionStart,
      transitionEnd
    };

    function slideTo(index, speed, runCallbacks, internal, initial) {
      if (index === void 0) {
        index = 0;
      }
      if (runCallbacks === void 0) {
        runCallbacks = true;
      }
      if (typeof index === 'string') {
        index = parseInt(index, 10);
      }
      const swiper = this;
      let slideIndex = index;
      if (slideIndex < 0) slideIndex = 0;
      const {
        params,
        snapGrid,
        slidesGrid,
        previousIndex,
        activeIndex,
        rtlTranslate: rtl,
        wrapperEl,
        enabled
      } = swiper;
      if (!enabled && !internal && !initial || swiper.destroyed || swiper.animating && params.preventInteractionOnTransition) {
        return false;
      }
      if (typeof speed === 'undefined') {
        speed = swiper.params.speed;
      }
      const skip = Math.min(swiper.params.slidesPerGroupSkip, slideIndex);
      let snapIndex = skip + Math.floor((slideIndex - skip) / swiper.params.slidesPerGroup);
      if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
      const translate = -snapGrid[snapIndex];
      // Normalize slideIndex
      if (params.normalizeSlideIndex) {
        for (let i = 0; i < slidesGrid.length; i += 1) {
          const normalizedTranslate = -Math.floor(translate * 100);
          const normalizedGrid = Math.floor(slidesGrid[i] * 100);
          const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);
          if (typeof slidesGrid[i + 1] !== 'undefined') {
            if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) {
              slideIndex = i;
            } else if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext) {
              slideIndex = i + 1;
            }
          } else if (normalizedTranslate >= normalizedGrid) {
            slideIndex = i;
          }
        }
      }
      // Directions locks
      if (swiper.initialized && slideIndex !== activeIndex) {
        if (!swiper.allowSlideNext && (rtl ? translate > swiper.translate && translate > swiper.minTranslate() : translate < swiper.translate && translate < swiper.minTranslate())) {
          return false;
        }
        if (!swiper.allowSlidePrev && translate > swiper.translate && translate > swiper.maxTranslate()) {
          if ((activeIndex || 0) !== slideIndex) {
            return false;
          }
        }
      }
      if (slideIndex !== (previousIndex || 0) && runCallbacks) {
        swiper.emit('beforeSlideChangeStart');
      }

      // Update progress
      swiper.updateProgress(translate);
      let direction;
      if (slideIndex > activeIndex) direction = 'next';else if (slideIndex < activeIndex) direction = 'prev';else direction = 'reset';

      // initial virtual
      const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
      const isInitialVirtual = isVirtual && initial;
      // Update Index
      if (!isInitialVirtual && (rtl && -translate === swiper.translate || !rtl && translate === swiper.translate)) {
        swiper.updateActiveIndex(slideIndex);
        // Update Height
        if (params.autoHeight) {
          swiper.updateAutoHeight();
        }
        swiper.updateSlidesClasses();
        if (params.effect !== 'slide') {
          swiper.setTranslate(translate);
        }
        if (direction !== 'reset') {
          swiper.transitionStart(runCallbacks, direction);
          swiper.transitionEnd(runCallbacks, direction);
        }
        return false;
      }
      if (params.cssMode) {
        const isH = swiper.isHorizontal();
        const t = rtl ? translate : -translate;
        if (speed === 0) {
          if (isVirtual) {
            swiper.wrapperEl.style.scrollSnapType = 'none';
            swiper._immediateVirtual = true;
          }
          if (isVirtual && !swiper._cssModeVirtualInitialSet && swiper.params.initialSlide > 0) {
            swiper._cssModeVirtualInitialSet = true;
            requestAnimationFrame(() => {
              wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = t;
            });
          } else {
            wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = t;
          }
          if (isVirtual) {
            requestAnimationFrame(() => {
              swiper.wrapperEl.style.scrollSnapType = '';
              swiper._immediateVirtual = false;
            });
          }
        } else {
          if (!swiper.support.smoothScroll) {
            animateCSSModeScroll({
              swiper,
              targetPosition: t,
              side: isH ? 'left' : 'top'
            });
            return true;
          }
          wrapperEl.scrollTo({
            [isH ? 'left' : 'top']: t,
            behavior: 'smooth'
          });
        }
        return true;
      }
      const browser = getBrowser();
      const isSafari = browser.isSafari;
      if (isVirtual && !initial && isSafari && swiper.isElement) {
        swiper.virtual.update(false, false, slideIndex);
      }
      swiper.setTransition(speed);
      swiper.setTranslate(translate);
      swiper.updateActiveIndex(slideIndex);
      swiper.updateSlidesClasses();
      swiper.emit('beforeTransitionStart', speed, internal);
      swiper.transitionStart(runCallbacks, direction);
      if (speed === 0) {
        swiper.transitionEnd(runCallbacks, direction);
      } else if (!swiper.animating) {
        swiper.animating = true;
        if (!swiper.onSlideToWrapperTransitionEnd) {
          swiper.onSlideToWrapperTransitionEnd = function transitionEnd(e) {
            if (!swiper || swiper.destroyed) return;
            if (e.target !== this) return;
            swiper.wrapperEl.removeEventListener('transitionend', swiper.onSlideToWrapperTransitionEnd);
            swiper.onSlideToWrapperTransitionEnd = null;
            delete swiper.onSlideToWrapperTransitionEnd;
            swiper.transitionEnd(runCallbacks, direction);
          };
        }
        swiper.wrapperEl.addEventListener('transitionend', swiper.onSlideToWrapperTransitionEnd);
      }
      return true;
    }

    function slideToLoop(index, speed, runCallbacks, internal) {
      if (index === void 0) {
        index = 0;
      }
      if (runCallbacks === void 0) {
        runCallbacks = true;
      }
      if (typeof index === 'string') {
        const indexAsNumber = parseInt(index, 10);
        index = indexAsNumber;
      }
      const swiper = this;
      if (swiper.destroyed) return;
      if (typeof speed === 'undefined') {
        speed = swiper.params.speed;
      }
      const gridEnabled = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
      let newIndex = index;
      if (swiper.params.loop) {
        if (swiper.virtual && swiper.params.virtual.enabled) {
          // eslint-disable-next-line
          newIndex = newIndex + swiper.virtual.slidesBefore;
        } else {
          let targetSlideIndex;
          if (gridEnabled) {
            const slideIndex = newIndex * swiper.params.grid.rows;
            targetSlideIndex = swiper.slides.find(slideEl => slideEl.getAttribute('data-swiper-slide-index') * 1 === slideIndex).column;
          } else {
            targetSlideIndex = swiper.getSlideIndexByData(newIndex);
          }
          const cols = gridEnabled ? Math.ceil(swiper.slides.length / swiper.params.grid.rows) : swiper.slides.length;
          const {
            centeredSlides
          } = swiper.params;
          let slidesPerView = swiper.params.slidesPerView;
          if (slidesPerView === 'auto') {
            slidesPerView = swiper.slidesPerViewDynamic();
          } else {
            slidesPerView = Math.ceil(parseFloat(swiper.params.slidesPerView, 10));
            if (centeredSlides && slidesPerView % 2 === 0) {
              slidesPerView = slidesPerView + 1;
            }
          }
          let needLoopFix = cols - targetSlideIndex < slidesPerView;
          if (centeredSlides) {
            needLoopFix = needLoopFix || targetSlideIndex < Math.ceil(slidesPerView / 2);
          }
          if (internal && centeredSlides && swiper.params.slidesPerView !== 'auto' && !gridEnabled) {
            needLoopFix = false;
          }
          if (needLoopFix) {
            const direction = centeredSlides ? targetSlideIndex < swiper.activeIndex ? 'prev' : 'next' : targetSlideIndex - swiper.activeIndex - 1 < swiper.params.slidesPerView ? 'next' : 'prev';
            swiper.loopFix({
              direction,
              slideTo: true,
              activeSlideIndex: direction === 'next' ? targetSlideIndex + 1 : targetSlideIndex - cols + 1,
              slideRealIndex: direction === 'next' ? swiper.realIndex : undefined
            });
          }
          if (gridEnabled) {
            const slideIndex = newIndex * swiper.params.grid.rows;
            newIndex = swiper.slides.find(slideEl => slideEl.getAttribute('data-swiper-slide-index') * 1 === slideIndex).column;
          } else {
            newIndex = swiper.getSlideIndexByData(newIndex);
          }
        }
      }
      requestAnimationFrame(() => {
        swiper.slideTo(newIndex, speed, runCallbacks, internal);
      });
      return swiper;
    }

    /* eslint no-unused-vars: "off" */
    function slideNext(speed, runCallbacks, internal) {
      if (runCallbacks === void 0) {
        runCallbacks = true;
      }
      const swiper = this;
      const {
        enabled,
        params,
        animating
      } = swiper;
      if (!enabled || swiper.destroyed) return swiper;
      if (typeof speed === 'undefined') {
        speed = swiper.params.speed;
      }
      let perGroup = params.slidesPerGroup;
      if (params.slidesPerView === 'auto' && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
        perGroup = Math.max(swiper.slidesPerViewDynamic('current', true), 1);
      }
      const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;
      const isVirtual = swiper.virtual && params.virtual.enabled;
      if (params.loop) {
        if (animating && !isVirtual && params.loopPreventsSliding) return false;
        swiper.loopFix({
          direction: 'next'
        });
        // eslint-disable-next-line
        swiper._clientLeft = swiper.wrapperEl.clientLeft;
        if (swiper.activeIndex === swiper.slides.length - 1 && params.cssMode) {
          requestAnimationFrame(() => {
            swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
          });
          return true;
        }
      }
      if (params.rewind && swiper.isEnd) {
        return swiper.slideTo(0, speed, runCallbacks, internal);
      }
      return swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
    }

    /* eslint no-unused-vars: "off" */
    function slidePrev(speed, runCallbacks, internal) {
      if (runCallbacks === void 0) {
        runCallbacks = true;
      }
      const swiper = this;
      const {
        params,
        snapGrid,
        slidesGrid,
        rtlTranslate,
        enabled,
        animating
      } = swiper;
      if (!enabled || swiper.destroyed) return swiper;
      if (typeof speed === 'undefined') {
        speed = swiper.params.speed;
      }
      const isVirtual = swiper.virtual && params.virtual.enabled;
      if (params.loop) {
        if (animating && !isVirtual && params.loopPreventsSliding) return false;
        swiper.loopFix({
          direction: 'prev'
        });
        // eslint-disable-next-line
        swiper._clientLeft = swiper.wrapperEl.clientLeft;
      }
      const translate = rtlTranslate ? swiper.translate : -swiper.translate;
      function normalize(val) {
        if (val < 0) return -Math.floor(Math.abs(val));
        return Math.floor(val);
      }
      const normalizedTranslate = normalize(translate);
      const normalizedSnapGrid = snapGrid.map(val => normalize(val));
      const isFreeMode = params.freeMode && params.freeMode.enabled;
      let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
      if (typeof prevSnap === 'undefined' && (params.cssMode || isFreeMode)) {
        let prevSnapIndex;
        snapGrid.forEach((snap, snapIndex) => {
          if (normalizedTranslate >= snap) {
            // prevSnap = snap;
            prevSnapIndex = snapIndex;
          }
        });
        if (typeof prevSnapIndex !== 'undefined') {
          prevSnap = isFreeMode ? snapGrid[prevSnapIndex] : snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
        }
      }
      let prevIndex = 0;
      if (typeof prevSnap !== 'undefined') {
        prevIndex = slidesGrid.indexOf(prevSnap);
        if (prevIndex < 0) prevIndex = swiper.activeIndex - 1;
        if (params.slidesPerView === 'auto' && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
          prevIndex = prevIndex - swiper.slidesPerViewDynamic('previous', true) + 1;
          prevIndex = Math.max(prevIndex, 0);
        }
      }
      if (params.rewind && swiper.isBeginning) {
        const lastIndex = swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
        return swiper.slideTo(lastIndex, speed, runCallbacks, internal);
      } else if (params.loop && swiper.activeIndex === 0 && params.cssMode) {
        requestAnimationFrame(() => {
          swiper.slideTo(prevIndex, speed, runCallbacks, internal);
        });
        return true;
      }
      return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
    }

    /* eslint no-unused-vars: "off" */
    function slideReset(speed, runCallbacks, internal) {
      if (runCallbacks === void 0) {
        runCallbacks = true;
      }
      const swiper = this;
      if (swiper.destroyed) return;
      if (typeof speed === 'undefined') {
        speed = swiper.params.speed;
      }
      return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
    }

    /* eslint no-unused-vars: "off" */
    function slideToClosest(speed, runCallbacks, internal, threshold) {
      if (runCallbacks === void 0) {
        runCallbacks = true;
      }
      if (threshold === void 0) {
        threshold = 0.5;
      }
      const swiper = this;
      if (swiper.destroyed) return;
      if (typeof speed === 'undefined') {
        speed = swiper.params.speed;
      }
      let index = swiper.activeIndex;
      const skip = Math.min(swiper.params.slidesPerGroupSkip, index);
      const snapIndex = skip + Math.floor((index - skip) / swiper.params.slidesPerGroup);
      const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
      if (translate >= swiper.snapGrid[snapIndex]) {
        // The current translate is on or after the current snap index, so the choice
        // is between the current index and the one after it.
        const currentSnap = swiper.snapGrid[snapIndex];
        const nextSnap = swiper.snapGrid[snapIndex + 1];
        if (translate - currentSnap > (nextSnap - currentSnap) * threshold) {
          index += swiper.params.slidesPerGroup;
        }
      } else {
        // The current translate is before the current snap index, so the choice
        // is between the current index and the one before it.
        const prevSnap = swiper.snapGrid[snapIndex - 1];
        const currentSnap = swiper.snapGrid[snapIndex];
        if (translate - prevSnap <= (currentSnap - prevSnap) * threshold) {
          index -= swiper.params.slidesPerGroup;
        }
      }
      index = Math.max(index, 0);
      index = Math.min(index, swiper.slidesGrid.length - 1);
      return swiper.slideTo(index, speed, runCallbacks, internal);
    }

    function slideToClickedSlide() {
      const swiper = this;
      if (swiper.destroyed) return;
      const {
        params,
        slidesEl
      } = swiper;
      const slidesPerView = params.slidesPerView === 'auto' ? swiper.slidesPerViewDynamic() : params.slidesPerView;
      let slideToIndex = swiper.clickedIndex;
      let realIndex;
      const slideSelector = swiper.isElement ? `swiper-slide` : `.${params.slideClass}`;
      if (params.loop) {
        if (swiper.animating) return;
        realIndex = parseInt(swiper.clickedSlide.getAttribute('data-swiper-slide-index'), 10);
        if (params.centeredSlides) {
          if (slideToIndex < swiper.loopedSlides - slidesPerView / 2 || slideToIndex > swiper.slides.length - swiper.loopedSlides + slidesPerView / 2) {
            swiper.loopFix();
            slideToIndex = swiper.getSlideIndex(elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
            nextTick(() => {
              swiper.slideTo(slideToIndex);
            });
          } else {
            swiper.slideTo(slideToIndex);
          }
        } else if (slideToIndex > swiper.slides.length - slidesPerView) {
          swiper.loopFix();
          slideToIndex = swiper.getSlideIndex(elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
          nextTick(() => {
            swiper.slideTo(slideToIndex);
          });
        } else {
          swiper.slideTo(slideToIndex);
        }
      } else {
        swiper.slideTo(slideToIndex);
      }
    }

    var slide = {
      slideTo,
      slideToLoop,
      slideNext,
      slidePrev,
      slideReset,
      slideToClosest,
      slideToClickedSlide
    };

    function loopCreate(slideRealIndex, initial) {
      const swiper = this;
      const {
        params,
        slidesEl
      } = swiper;
      if (!params.loop || swiper.virtual && swiper.params.virtual.enabled) return;
      const initSlides = () => {
        const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
        slides.forEach((el, index) => {
          el.setAttribute('data-swiper-slide-index', index);
        });
      };
      const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
      const slidesPerGroup = params.slidesPerGroup * (gridEnabled ? params.grid.rows : 1);
      const shouldFillGroup = swiper.slides.length % slidesPerGroup !== 0;
      const shouldFillGrid = gridEnabled && swiper.slides.length % params.grid.rows !== 0;
      const addBlankSlides = amountOfSlides => {
        for (let i = 0; i < amountOfSlides; i += 1) {
          const slideEl = swiper.isElement ? createElement('swiper-slide', [params.slideBlankClass]) : createElement('div', [params.slideClass, params.slideBlankClass]);
          swiper.slidesEl.append(slideEl);
        }
      };
      if (shouldFillGroup) {
        if (params.loopAddBlankSlides) {
          const slidesToAdd = slidesPerGroup - swiper.slides.length % slidesPerGroup;
          addBlankSlides(slidesToAdd);
          swiper.recalcSlides();
          swiper.updateSlides();
        } else {
          showWarning('Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)');
        }
        initSlides();
      } else if (shouldFillGrid) {
        if (params.loopAddBlankSlides) {
          const slidesToAdd = params.grid.rows - swiper.slides.length % params.grid.rows;
          addBlankSlides(slidesToAdd);
          swiper.recalcSlides();
          swiper.updateSlides();
        } else {
          showWarning('Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)');
        }
        initSlides();
      } else {
        initSlides();
      }
      swiper.loopFix({
        slideRealIndex,
        direction: params.centeredSlides ? undefined : 'next',
        initial
      });
    }

    function loopFix(_temp) {
      let {
        slideRealIndex,
        slideTo = true,
        direction,
        setTranslate,
        activeSlideIndex,
        initial,
        byController,
        byMousewheel
      } = _temp === void 0 ? {} : _temp;
      const swiper = this;
      if (!swiper.params.loop) return;
      swiper.emit('beforeLoopFix');
      const {
        slides,
        allowSlidePrev,
        allowSlideNext,
        slidesEl,
        params
      } = swiper;
      const {
        centeredSlides,
        initialSlide
      } = params;
      swiper.allowSlidePrev = true;
      swiper.allowSlideNext = true;
      if (swiper.virtual && params.virtual.enabled) {
        if (slideTo) {
          if (!params.centeredSlides && swiper.snapIndex === 0) {
            swiper.slideTo(swiper.virtual.slides.length, 0, false, true);
          } else if (params.centeredSlides && swiper.snapIndex < params.slidesPerView) {
            swiper.slideTo(swiper.virtual.slides.length + swiper.snapIndex, 0, false, true);
          } else if (swiper.snapIndex === swiper.snapGrid.length - 1) {
            swiper.slideTo(swiper.virtual.slidesBefore, 0, false, true);
          }
        }
        swiper.allowSlidePrev = allowSlidePrev;
        swiper.allowSlideNext = allowSlideNext;
        swiper.emit('loopFix');
        return;
      }
      let slidesPerView = params.slidesPerView;
      if (slidesPerView === 'auto') {
        slidesPerView = swiper.slidesPerViewDynamic();
      } else {
        slidesPerView = Math.ceil(parseFloat(params.slidesPerView, 10));
        if (centeredSlides && slidesPerView % 2 === 0) {
          slidesPerView = slidesPerView + 1;
        }
      }
      const slidesPerGroup = params.slidesPerGroupAuto ? slidesPerView : params.slidesPerGroup;
      let loopedSlides = slidesPerGroup;
      if (loopedSlides % slidesPerGroup !== 0) {
        loopedSlides += slidesPerGroup - loopedSlides % slidesPerGroup;
      }
      loopedSlides += params.loopAdditionalSlides;
      swiper.loopedSlides = loopedSlides;
      const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
      if (slides.length < slidesPerView + loopedSlides || swiper.params.effect === 'cards' && slides.length < slidesPerView + loopedSlides * 2) {
        showWarning('Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled or not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters');
      } else if (gridEnabled && params.grid.fill === 'row') {
        showWarning('Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`');
      }
      const prependSlidesIndexes = [];
      const appendSlidesIndexes = [];
      const cols = gridEnabled ? Math.ceil(slides.length / params.grid.rows) : slides.length;
      const isInitialOverflow = initial && cols - initialSlide < slidesPerView && !centeredSlides;
      let activeIndex = isInitialOverflow ? initialSlide : swiper.activeIndex;
      if (typeof activeSlideIndex === 'undefined') {
        activeSlideIndex = swiper.getSlideIndex(slides.find(el => el.classList.contains(params.slideActiveClass)));
      } else {
        activeIndex = activeSlideIndex;
      }
      const isNext = direction === 'next' || !direction;
      const isPrev = direction === 'prev' || !direction;
      let slidesPrepended = 0;
      let slidesAppended = 0;
      const activeColIndex = gridEnabled ? slides[activeSlideIndex].column : activeSlideIndex;
      const activeColIndexWithShift = activeColIndex + (centeredSlides && typeof setTranslate === 'undefined' ? -slidesPerView / 2 + 0.5 : 0);
      // prepend last slides before start
      if (activeColIndexWithShift < loopedSlides) {
        slidesPrepended = Math.max(loopedSlides - activeColIndexWithShift, slidesPerGroup);
        for (let i = 0; i < loopedSlides - activeColIndexWithShift; i += 1) {
          const index = i - Math.floor(i / cols) * cols;
          if (gridEnabled) {
            const colIndexToPrepend = cols - index - 1;
            for (let i = slides.length - 1; i >= 0; i -= 1) {
              if (slides[i].column === colIndexToPrepend) prependSlidesIndexes.push(i);
            }
            // slides.forEach((slide, slideIndex) => {
            //   if (slide.column === colIndexToPrepend) prependSlidesIndexes.push(slideIndex);
            // });
          } else {
            prependSlidesIndexes.push(cols - index - 1);
          }
        }
      } else if (activeColIndexWithShift + slidesPerView > cols - loopedSlides) {
        slidesAppended = Math.max(activeColIndexWithShift - (cols - loopedSlides * 2), slidesPerGroup);
        if (isInitialOverflow) {
          slidesAppended = Math.max(slidesAppended, slidesPerView - cols + initialSlide + 1);
        }
        for (let i = 0; i < slidesAppended; i += 1) {
          const index = i - Math.floor(i / cols) * cols;
          if (gridEnabled) {
            slides.forEach((slide, slideIndex) => {
              if (slide.column === index) appendSlidesIndexes.push(slideIndex);
            });
          } else {
            appendSlidesIndexes.push(index);
          }
        }
      }
      swiper.__preventObserver__ = true;
      requestAnimationFrame(() => {
        swiper.__preventObserver__ = false;
      });
      if (swiper.params.effect === 'cards' && slides.length < slidesPerView + loopedSlides * 2) {
        if (appendSlidesIndexes.includes(activeSlideIndex)) {
          appendSlidesIndexes.splice(appendSlidesIndexes.indexOf(activeSlideIndex), 1);
        }
        if (prependSlidesIndexes.includes(activeSlideIndex)) {
          prependSlidesIndexes.splice(prependSlidesIndexes.indexOf(activeSlideIndex), 1);
        }
      }
      if (isPrev) {
        prependSlidesIndexes.forEach(index => {
          slides[index].swiperLoopMoveDOM = true;
          slidesEl.prepend(slides[index]);
          slides[index].swiperLoopMoveDOM = false;
        });
      }
      if (isNext) {
        appendSlidesIndexes.forEach(index => {
          slides[index].swiperLoopMoveDOM = true;
          slidesEl.append(slides[index]);
          slides[index].swiperLoopMoveDOM = false;
        });
      }
      swiper.recalcSlides();
      if (params.slidesPerView === 'auto') {
        swiper.updateSlides();
      } else if (gridEnabled && (prependSlidesIndexes.length > 0 && isPrev || appendSlidesIndexes.length > 0 && isNext)) {
        swiper.slides.forEach((slide, slideIndex) => {
          swiper.grid.updateSlide(slideIndex, slide, swiper.slides);
        });
      }
      if (params.watchSlidesProgress) {
        swiper.updateSlidesOffset();
      }
      if (slideTo) {
        if (prependSlidesIndexes.length > 0 && isPrev) {
          if (typeof slideRealIndex === 'undefined') {
            const currentSlideTranslate = swiper.slidesGrid[activeIndex];
            const newSlideTranslate = swiper.slidesGrid[activeIndex + slidesPrepended];
            const diff = newSlideTranslate - currentSlideTranslate;
            if (byMousewheel) {
              swiper.setTranslate(swiper.translate - diff);
            } else {
              swiper.slideTo(activeIndex + Math.ceil(slidesPrepended), 0, false, true);
              if (setTranslate) {
                swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
                swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
              }
            }
          } else {
            if (setTranslate) {
              const shift = gridEnabled ? prependSlidesIndexes.length / params.grid.rows : prependSlidesIndexes.length;
              swiper.slideTo(swiper.activeIndex + shift, 0, false, true);
              swiper.touchEventsData.currentTranslate = swiper.translate;
            }
          }
        } else if (appendSlidesIndexes.length > 0 && isNext) {
          if (typeof slideRealIndex === 'undefined') {
            const currentSlideTranslate = swiper.slidesGrid[activeIndex];
            const newSlideTranslate = swiper.slidesGrid[activeIndex - slidesAppended];
            const diff = newSlideTranslate - currentSlideTranslate;
            if (byMousewheel) {
              swiper.setTranslate(swiper.translate - diff);
            } else {
              swiper.slideTo(activeIndex - slidesAppended, 0, false, true);
              if (setTranslate) {
                swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
                swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
              }
            }
          } else {
            const shift = gridEnabled ? appendSlidesIndexes.length / params.grid.rows : appendSlidesIndexes.length;
            swiper.slideTo(swiper.activeIndex - shift, 0, false, true);
          }
        }
      }
      swiper.allowSlidePrev = allowSlidePrev;
      swiper.allowSlideNext = allowSlideNext;
      if (swiper.controller && swiper.controller.control && !byController) {
        const loopParams = {
          slideRealIndex,
          direction,
          setTranslate,
          activeSlideIndex,
          byController: true
        };
        if (Array.isArray(swiper.controller.control)) {
          swiper.controller.control.forEach(c => {
            if (!c.destroyed && c.params.loop) c.loopFix({
              ...loopParams,
              slideTo: c.params.slidesPerView === params.slidesPerView ? slideTo : false
            });
          });
        } else if (swiper.controller.control instanceof swiper.constructor && swiper.controller.control.params.loop) {
          swiper.controller.control.loopFix({
            ...loopParams,
            slideTo: swiper.controller.control.params.slidesPerView === params.slidesPerView ? slideTo : false
          });
        }
      }
      swiper.emit('loopFix');
    }

    function loopDestroy() {
      const swiper = this;
      const {
        params,
        slidesEl
      } = swiper;
      if (!params.loop || !slidesEl || swiper.virtual && swiper.params.virtual.enabled) return;
      swiper.recalcSlides();
      const newSlidesOrder = [];
      swiper.slides.forEach(slideEl => {
        const index = typeof slideEl.swiperSlideIndex === 'undefined' ? slideEl.getAttribute('data-swiper-slide-index') * 1 : slideEl.swiperSlideIndex;
        newSlidesOrder[index] = slideEl;
      });
      swiper.slides.forEach(slideEl => {
        slideEl.removeAttribute('data-swiper-slide-index');
      });
      newSlidesOrder.forEach(slideEl => {
        slidesEl.append(slideEl);
      });
      swiper.recalcSlides();
      swiper.slideTo(swiper.realIndex, 0);
    }

    var loop = {
      loopCreate,
      loopFix,
      loopDestroy
    };

    function setGrabCursor(moving) {
      const swiper = this;
      if (!swiper.params.simulateTouch || swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
      const el = swiper.params.touchEventsTarget === 'container' ? swiper.el : swiper.wrapperEl;
      if (swiper.isElement) {
        swiper.__preventObserver__ = true;
      }
      el.style.cursor = 'move';
      el.style.cursor = moving ? 'grabbing' : 'grab';
      if (swiper.isElement) {
        requestAnimationFrame(() => {
          swiper.__preventObserver__ = false;
        });
      }
    }

    function unsetGrabCursor() {
      const swiper = this;
      if (swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) {
        return;
      }
      if (swiper.isElement) {
        swiper.__preventObserver__ = true;
      }
      swiper[swiper.params.touchEventsTarget === 'container' ? 'el' : 'wrapperEl'].style.cursor = '';
      if (swiper.isElement) {
        requestAnimationFrame(() => {
          swiper.__preventObserver__ = false;
        });
      }
    }

    var grabCursor = {
      setGrabCursor,
      unsetGrabCursor
    };

    // Modified from https://stackoverflow.com/questions/54520554/custom-element-getrootnode-closest-function-crossing-multiple-parent-shadowd
    function closestElement(selector, base) {
      if (base === void 0) {
        base = this;
      }
      function __closestFrom(el) {
        if (!el || el === getDocument() || el === getWindow()) return null;
        if (el.assignedSlot) el = el.assignedSlot;
        const found = el.closest(selector);
        if (!found && !el.getRootNode) {
          return null;
        }
        return found || __closestFrom(el.getRootNode().host);
      }
      return __closestFrom(base);
    }
    function preventEdgeSwipe(swiper, event, startX) {
      const window = getWindow();
      const {
        params
      } = swiper;
      const edgeSwipeDetection = params.edgeSwipeDetection;
      const edgeSwipeThreshold = params.edgeSwipeThreshold;
      if (edgeSwipeDetection && (startX <= edgeSwipeThreshold || startX >= window.innerWidth - edgeSwipeThreshold)) {
        if (edgeSwipeDetection === 'prevent') {
          event.preventDefault();
          return true;
        }
        return false;
      }
      return true;
    }
    function onTouchStart(event) {
      const swiper = this;
      const document = getDocument();
      let e = event;
      if (e.originalEvent) e = e.originalEvent;
      const data = swiper.touchEventsData;
      if (e.type === 'pointerdown') {
        if (data.pointerId !== null && data.pointerId !== e.pointerId) {
          return;
        }
        data.pointerId = e.pointerId;
      } else if (e.type === 'touchstart' && e.targetTouches.length === 1) {
        data.touchId = e.targetTouches[0].identifier;
      }
      if (e.type === 'touchstart') {
        // don't proceed touch event
        preventEdgeSwipe(swiper, e, e.targetTouches[0].pageX);
        return;
      }
      const {
        params,
        touches,
        enabled
      } = swiper;
      if (!enabled) return;
      if (!params.simulateTouch && e.pointerType === 'mouse') return;
      if (swiper.animating && params.preventInteractionOnTransition) {
        return;
      }
      if (!swiper.animating && params.cssMode && params.loop) {
        swiper.loopFix();
      }
      let targetEl = e.target;
      if (params.touchEventsTarget === 'wrapper') {
        if (!elementIsChildOf(targetEl, swiper.wrapperEl)) return;
      }
      if ('which' in e && e.which === 3) return;
      if ('button' in e && e.button > 0) return;
      if (data.isTouched && data.isMoved) return;

      // change target el for shadow root component
      const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== '';
      // eslint-disable-next-line
      const eventPath = e.composedPath ? e.composedPath() : e.path;
      if (swipingClassHasValue && e.target && e.target.shadowRoot && eventPath) {
        targetEl = eventPath[0];
      }
      const noSwipingSelector = params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`;
      const isTargetShadow = !!(e.target && e.target.shadowRoot);

      // use closestElement for shadow root element to get the actual closest for nested shadow root element
      if (params.noSwiping && (isTargetShadow ? closestElement(noSwipingSelector, targetEl) : targetEl.closest(noSwipingSelector))) {
        swiper.allowClick = true;
        return;
      }
      if (params.swipeHandler) {
        if (!targetEl.closest(params.swipeHandler)) return;
      }
      touches.currentX = e.pageX;
      touches.currentY = e.pageY;
      const startX = touches.currentX;
      const startY = touches.currentY;

      // Do NOT start if iOS edge swipe is detected. Otherwise iOS app cannot swipe-to-go-back anymore

      if (!preventEdgeSwipe(swiper, e, startX)) {
        return;
      }
      Object.assign(data, {
        isTouched: true,
        isMoved: false,
        allowTouchCallbacks: true,
        isScrolling: undefined,
        startMoving: undefined
      });
      touches.startX = startX;
      touches.startY = startY;
      data.touchStartTime = now();
      swiper.allowClick = true;
      swiper.updateSize();
      swiper.swipeDirection = undefined;
      if (params.threshold > 0) data.allowThresholdMove = false;
      let preventDefault = true;
      if (targetEl.matches(data.focusableElements)) {
        preventDefault = false;
        if (targetEl.nodeName === 'SELECT') {
          data.isTouched = false;
        }
      }
      if (document.activeElement && document.activeElement.matches(data.focusableElements) && document.activeElement !== targetEl && (e.pointerType === 'mouse' || e.pointerType !== 'mouse' && !targetEl.matches(data.focusableElements))) {
        document.activeElement.blur();
      }
      const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;
      if ((params.touchStartForcePreventDefault || shouldPreventDefault) && !targetEl.isContentEditable) {
        e.preventDefault();
      }
      if (params.freeMode && params.freeMode.enabled && swiper.freeMode && swiper.animating && !params.cssMode) {
        swiper.freeMode.onTouchStart();
      }
      swiper.emit('touchStart', e);
    }

    function onTouchMove(event) {
      const document = getDocument();
      const swiper = this;
      const data = swiper.touchEventsData;
      const {
        params,
        touches,
        rtlTranslate: rtl,
        enabled
      } = swiper;
      if (!enabled) return;
      if (!params.simulateTouch && event.pointerType === 'mouse') return;
      let e = event;
      if (e.originalEvent) e = e.originalEvent;
      if (e.type === 'pointermove') {
        if (data.touchId !== null) return; // return from pointer if we use touch
        const id = e.pointerId;
        if (id !== data.pointerId) return;
      }
      let targetTouch;
      if (e.type === 'touchmove') {
        targetTouch = [...e.changedTouches].find(t => t.identifier === data.touchId);
        if (!targetTouch || targetTouch.identifier !== data.touchId) return;
      } else {
        targetTouch = e;
      }
      if (!data.isTouched) {
        if (data.startMoving && data.isScrolling) {
          swiper.emit('touchMoveOpposite', e);
        }
        return;
      }
      const pageX = targetTouch.pageX;
      const pageY = targetTouch.pageY;
      if (e.preventedByNestedSwiper) {
        touches.startX = pageX;
        touches.startY = pageY;
        return;
      }
      if (!swiper.allowTouchMove) {
        if (!e.target.matches(data.focusableElements)) {
          swiper.allowClick = false;
        }
        if (data.isTouched) {
          Object.assign(touches, {
            startX: pageX,
            startY: pageY,
            currentX: pageX,
            currentY: pageY
          });
          data.touchStartTime = now();
        }
        return;
      }
      if (params.touchReleaseOnEdges && !params.loop) {
        if (swiper.isVertical()) {
          // Vertical
          if (pageY < touches.startY && swiper.translate <= swiper.maxTranslate() || pageY > touches.startY && swiper.translate >= swiper.minTranslate()) {
            data.isTouched = false;
            data.isMoved = false;
            return;
          }
        } else if (rtl && (pageX > touches.startX && -swiper.translate <= swiper.maxTranslate() || pageX < touches.startX && -swiper.translate >= swiper.minTranslate())) {
          return;
        } else if (!rtl && (pageX < touches.startX && swiper.translate <= swiper.maxTranslate() || pageX > touches.startX && swiper.translate >= swiper.minTranslate())) {
          return;
        }
      }
      if (document.activeElement && document.activeElement.matches(data.focusableElements) && document.activeElement !== e.target && e.pointerType !== 'mouse') {
        document.activeElement.blur();
      }
      if (document.activeElement) {
        if (e.target === document.activeElement && e.target.matches(data.focusableElements)) {
          data.isMoved = true;
          swiper.allowClick = false;
          return;
        }
      }
      if (data.allowTouchCallbacks) {
        swiper.emit('touchMove', e);
      }
      touches.previousX = touches.currentX;
      touches.previousY = touches.currentY;
      touches.currentX = pageX;
      touches.currentY = pageY;
      const diffX = touches.currentX - touches.startX;
      const diffY = touches.currentY - touches.startY;
      if (swiper.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper.params.threshold) return;
      if (typeof data.isScrolling === 'undefined') {
        let touchAngle;
        if (swiper.isHorizontal() && touches.currentY === touches.startY || swiper.isVertical() && touches.currentX === touches.startX) {
          data.isScrolling = false;
        } else {
          // eslint-disable-next-line
          if (diffX * diffX + diffY * diffY >= 25) {
            touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
            data.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : 90 - touchAngle > params.touchAngle;
          }
        }
      }
      if (data.isScrolling) {
        swiper.emit('touchMoveOpposite', e);
      }
      if (typeof data.startMoving === 'undefined') {
        if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) {
          data.startMoving = true;
        }
      }
      if (data.isScrolling || e.type === 'touchmove' && data.preventTouchMoveFromPointerMove) {
        data.isTouched = false;
        return;
      }
      if (!data.startMoving) {
        return;
      }
      swiper.allowClick = false;
      if (!params.cssMode && e.cancelable) {
        e.preventDefault();
      }
      if (params.touchMoveStopPropagation && !params.nested) {
        e.stopPropagation();
      }
      let diff = swiper.isHorizontal() ? diffX : diffY;
      let touchesDiff = swiper.isHorizontal() ? touches.currentX - touches.previousX : touches.currentY - touches.previousY;
      if (params.oneWayMovement) {
        diff = Math.abs(diff) * (rtl ? 1 : -1);
        touchesDiff = Math.abs(touchesDiff) * (rtl ? 1 : -1);
      }
      touches.diff = diff;
      diff *= params.touchRatio;
      if (rtl) {
        diff = -diff;
        touchesDiff = -touchesDiff;
      }
      const prevTouchesDirection = swiper.touchesDirection;
      swiper.swipeDirection = diff > 0 ? 'prev' : 'next';
      swiper.touchesDirection = touchesDiff > 0 ? 'prev' : 'next';
      const isLoop = swiper.params.loop && !params.cssMode;
      const allowLoopFix = swiper.touchesDirection === 'next' && swiper.allowSlideNext || swiper.touchesDirection === 'prev' && swiper.allowSlidePrev;
      if (!data.isMoved) {
        if (isLoop && allowLoopFix) {
          swiper.loopFix({
            direction: swiper.swipeDirection
          });
        }
        data.startTranslate = swiper.getTranslate();
        swiper.setTransition(0);
        if (swiper.animating) {
          const evt = new window.CustomEvent('transitionend', {
            bubbles: true,
            cancelable: true,
            detail: {
              bySwiperTouchMove: true
            }
          });
          swiper.wrapperEl.dispatchEvent(evt);
        }
        data.allowMomentumBounce = false;
        // Grab Cursor
        if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
          swiper.setGrabCursor(true);
        }
        swiper.emit('sliderFirstMove', e);
      }
      let loopFixed;
      new Date().getTime();
      if (params._loopSwapReset !== false && data.isMoved && data.allowThresholdMove && prevTouchesDirection !== swiper.touchesDirection && isLoop && allowLoopFix && Math.abs(diff) >= 1) {
        Object.assign(touches, {
          startX: pageX,
          startY: pageY,
          currentX: pageX,
          currentY: pageY,
          startTranslate: data.currentTranslate
        });
        data.loopSwapReset = true;
        data.startTranslate = data.currentTranslate;
        return;
      }
      swiper.emit('sliderMove', e);
      data.isMoved = true;
      data.currentTranslate = diff + data.startTranslate;
      let disableParentSwiper = true;
      let resistanceRatio = params.resistanceRatio;
      if (params.touchReleaseOnEdges) {
        resistanceRatio = 0;
      }
      if (diff > 0) {
        if (isLoop && allowLoopFix && !loopFixed && data.allowThresholdMove && data.currentTranslate > (params.centeredSlides ? swiper.minTranslate() - swiper.slidesSizesGrid[swiper.activeIndex + 1] - (params.slidesPerView !== 'auto' && swiper.slides.length - params.slidesPerView >= 2 ? swiper.slidesSizesGrid[swiper.activeIndex + 1] + swiper.params.spaceBetween : 0) - swiper.params.spaceBetween : swiper.minTranslate())) {
          swiper.loopFix({
            direction: 'prev',
            setTranslate: true,
            activeSlideIndex: 0
          });
        }
        if (data.currentTranslate > swiper.minTranslate()) {
          disableParentSwiper = false;
          if (params.resistance) {
            data.currentTranslate = swiper.minTranslate() - 1 + (-swiper.minTranslate() + data.startTranslate + diff) ** resistanceRatio;
          }
        }
      } else if (diff < 0) {
        if (isLoop && allowLoopFix && !loopFixed && data.allowThresholdMove && data.currentTranslate < (params.centeredSlides ? swiper.maxTranslate() + swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] + swiper.params.spaceBetween + (params.slidesPerView !== 'auto' && swiper.slides.length - params.slidesPerView >= 2 ? swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] + swiper.params.spaceBetween : 0) : swiper.maxTranslate())) {
          swiper.loopFix({
            direction: 'next',
            setTranslate: true,
            activeSlideIndex: swiper.slides.length - (params.slidesPerView === 'auto' ? swiper.slidesPerViewDynamic() : Math.ceil(parseFloat(params.slidesPerView, 10)))
          });
        }
        if (data.currentTranslate < swiper.maxTranslate()) {
          disableParentSwiper = false;
          if (params.resistance) {
            data.currentTranslate = swiper.maxTranslate() + 1 - (swiper.maxTranslate() - data.startTranslate - diff) ** resistanceRatio;
          }
        }
      }
      if (disableParentSwiper) {
        e.preventedByNestedSwiper = true;
      }

      // Directions locks
      if (!swiper.allowSlideNext && swiper.swipeDirection === 'next' && data.currentTranslate < data.startTranslate) {
        data.currentTranslate = data.startTranslate;
      }
      if (!swiper.allowSlidePrev && swiper.swipeDirection === 'prev' && data.currentTranslate > data.startTranslate) {
        data.currentTranslate = data.startTranslate;
      }
      if (!swiper.allowSlidePrev && !swiper.allowSlideNext) {
        data.currentTranslate = data.startTranslate;
      }

      // Threshold
      if (params.threshold > 0) {
        if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
          if (!data.allowThresholdMove) {
            data.allowThresholdMove = true;
            touches.startX = touches.currentX;
            touches.startY = touches.currentY;
            data.currentTranslate = data.startTranslate;
            touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
            return;
          }
        } else {
          data.currentTranslate = data.startTranslate;
          return;
        }
      }
      if (!params.followFinger || params.cssMode) return;

      // Update active index in free mode
      if (params.freeMode && params.freeMode.enabled && swiper.freeMode || params.watchSlidesProgress) {
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
      }
      if (params.freeMode && params.freeMode.enabled && swiper.freeMode) {
        swiper.freeMode.onTouchMove();
      }
      // Update progress
      swiper.updateProgress(data.currentTranslate);
      // Update translate
      swiper.setTranslate(data.currentTranslate);
    }

    function onTouchEnd(event) {
      const swiper = this;
      const data = swiper.touchEventsData;
      let e = event;
      if (e.originalEvent) e = e.originalEvent;
      let targetTouch;
      const isTouchEvent = e.type === 'touchend' || e.type === 'touchcancel';
      if (!isTouchEvent) {
        if (data.touchId !== null) return; // return from pointer if we use touch
        if (e.pointerId !== data.pointerId) return;
        targetTouch = e;
      } else {
        targetTouch = [...e.changedTouches].find(t => t.identifier === data.touchId);
        if (!targetTouch || targetTouch.identifier !== data.touchId) return;
      }
      if (['pointercancel', 'pointerout', 'pointerleave', 'contextmenu'].includes(e.type)) {
        const proceed = ['pointercancel', 'contextmenu'].includes(e.type) && (swiper.browser.isSafari || swiper.browser.isWebView);
        if (!proceed) {
          return;
        }
      }
      data.pointerId = null;
      data.touchId = null;
      const {
        params,
        touches,
        rtlTranslate: rtl,
        slidesGrid,
        enabled
      } = swiper;
      if (!enabled) return;
      if (!params.simulateTouch && e.pointerType === 'mouse') return;
      if (data.allowTouchCallbacks) {
        swiper.emit('touchEnd', e);
      }
      data.allowTouchCallbacks = false;
      if (!data.isTouched) {
        if (data.isMoved && params.grabCursor) {
          swiper.setGrabCursor(false);
        }
        data.isMoved = false;
        data.startMoving = false;
        return;
      }

      // Return Grab Cursor
      if (params.grabCursor && data.isMoved && data.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
        swiper.setGrabCursor(false);
      }

      // Time diff
      const touchEndTime = now();
      const timeDiff = touchEndTime - data.touchStartTime;

      // Tap, doubleTap, Click
      if (swiper.allowClick) {
        const pathTree = e.path || e.composedPath && e.composedPath();
        swiper.updateClickedSlide(pathTree && pathTree[0] || e.target, pathTree);
        swiper.emit('tap click', e);
        if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) {
          swiper.emit('doubleTap doubleClick', e);
        }
      }
      data.lastClickTime = now();
      nextTick(() => {
        if (!swiper.destroyed) swiper.allowClick = true;
      });
      if (!data.isTouched || !data.isMoved || !swiper.swipeDirection || touches.diff === 0 && !data.loopSwapReset || data.currentTranslate === data.startTranslate && !data.loopSwapReset) {
        data.isTouched = false;
        data.isMoved = false;
        data.startMoving = false;
        return;
      }
      data.isTouched = false;
      data.isMoved = false;
      data.startMoving = false;
      let currentPos;
      if (params.followFinger) {
        currentPos = rtl ? swiper.translate : -swiper.translate;
      } else {
        currentPos = -data.currentTranslate;
      }
      if (params.cssMode) {
        return;
      }
      if (params.freeMode && params.freeMode.enabled) {
        swiper.freeMode.onTouchEnd({
          currentPos
        });
        return;
      }

      // Find current slide
      const swipeToLast = currentPos >= -swiper.maxTranslate() && !swiper.params.loop;
      let stopIndex = 0;
      let groupSize = swiper.slidesSizesGrid[0];
      for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
        const increment = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
        if (typeof slidesGrid[i + increment] !== 'undefined') {
          if (swipeToLast || currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment]) {
            stopIndex = i;
            groupSize = slidesGrid[i + increment] - slidesGrid[i];
          }
        } else if (swipeToLast || currentPos >= slidesGrid[i]) {
          stopIndex = i;
          groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
        }
      }
      let rewindFirstIndex = null;
      let rewindLastIndex = null;
      if (params.rewind) {
        if (swiper.isBeginning) {
          rewindLastIndex = params.virtual && params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
        } else if (swiper.isEnd) {
          rewindFirstIndex = 0;
        }
      }
      // Find current slide size
      const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
      const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
      if (timeDiff > params.longSwipesMs) {
        // Long touches
        if (!params.longSwipes) {
          swiper.slideTo(swiper.activeIndex);
          return;
        }
        if (swiper.swipeDirection === 'next') {
          if (ratio >= params.longSwipesRatio) swiper.slideTo(params.rewind && swiper.isEnd ? rewindFirstIndex : stopIndex + increment);else swiper.slideTo(stopIndex);
        }
        if (swiper.swipeDirection === 'prev') {
          if (ratio > 1 - params.longSwipesRatio) {
            swiper.slideTo(stopIndex + increment);
          } else if (rewindLastIndex !== null && ratio < 0 && Math.abs(ratio) > params.longSwipesRatio) {
            swiper.slideTo(rewindLastIndex);
          } else {
            swiper.slideTo(stopIndex);
          }
        }
      } else {
        // Short swipes
        if (!params.shortSwipes) {
          swiper.slideTo(swiper.activeIndex);
          return;
        }
        const isNavButtonTarget = swiper.navigation && (e.target === swiper.navigation.nextEl || e.target === swiper.navigation.prevEl);
        if (!isNavButtonTarget) {
          if (swiper.swipeDirection === 'next') {
            swiper.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
          }
          if (swiper.swipeDirection === 'prev') {
            swiper.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
          }
        } else if (e.target === swiper.navigation.nextEl) {
          swiper.slideTo(stopIndex + increment);
        } else {
          swiper.slideTo(stopIndex);
        }
      }
    }

    function onResize() {
      const swiper = this;
      const {
        params,
        el
      } = swiper;
      if (el && el.offsetWidth === 0) return;

      // Breakpoints
      if (params.breakpoints) {
        swiper.setBreakpoint();
      }

      // Save locks
      const {
        allowSlideNext,
        allowSlidePrev,
        snapGrid
      } = swiper;
      const isVirtual = swiper.virtual && swiper.params.virtual.enabled;

      // Disable locks on resize
      swiper.allowSlideNext = true;
      swiper.allowSlidePrev = true;
      swiper.updateSize();
      swiper.updateSlides();
      swiper.updateSlidesClasses();
      const isVirtualLoop = isVirtual && params.loop;
      if ((params.slidesPerView === 'auto' || params.slidesPerView > 1) && swiper.isEnd && !swiper.isBeginning && !swiper.params.centeredSlides && !isVirtualLoop) {
        swiper.slideTo(swiper.slides.length - 1, 0, false, true);
      } else {
        if (swiper.params.loop && !isVirtual) {
          swiper.slideToLoop(swiper.realIndex, 0, false, true);
        } else {
          swiper.slideTo(swiper.activeIndex, 0, false, true);
        }
      }
      if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
        clearTimeout(swiper.autoplay.resizeTimeout);
        swiper.autoplay.resizeTimeout = setTimeout(() => {
          if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
            swiper.autoplay.resume();
          }
        }, 500);
      }
      // Return locks after resize
      swiper.allowSlidePrev = allowSlidePrev;
      swiper.allowSlideNext = allowSlideNext;
      if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) {
        swiper.checkOverflow();
      }
    }

    function onClick(e) {
      const swiper = this;
      if (!swiper.enabled) return;
      if (!swiper.allowClick) {
        if (swiper.params.preventClicks) e.preventDefault();
        if (swiper.params.preventClicksPropagation && swiper.animating) {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      }
    }

    function onScroll() {
      const swiper = this;
      const {
        wrapperEl,
        rtlTranslate,
        enabled
      } = swiper;
      if (!enabled) return;
      swiper.previousTranslate = swiper.translate;
      if (swiper.isHorizontal()) {
        swiper.translate = -wrapperEl.scrollLeft;
      } else {
        swiper.translate = -wrapperEl.scrollTop;
      }
      // eslint-disable-next-line
      if (swiper.translate === 0) swiper.translate = 0;
      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();
      let newProgress;
      const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
      if (translatesDiff === 0) {
        newProgress = 0;
      } else {
        newProgress = (swiper.translate - swiper.minTranslate()) / translatesDiff;
      }
      if (newProgress !== swiper.progress) {
        swiper.updateProgress(rtlTranslate ? -swiper.translate : swiper.translate);
      }
      swiper.emit('setTranslate', swiper.translate, false);
    }

    function onLoad(e) {
      const swiper = this;
      processLazyPreloader(swiper, e.target);
      if (swiper.params.cssMode || swiper.params.slidesPerView !== 'auto' && !swiper.params.autoHeight) {
        return;
      }
      swiper.update();
    }

    function onDocumentTouchStart() {
      const swiper = this;
      if (swiper.documentTouchHandlerProceeded) return;
      swiper.documentTouchHandlerProceeded = true;
      if (swiper.params.touchReleaseOnEdges) {
        swiper.el.style.touchAction = 'auto';
      }
    }

    const events = (swiper, method) => {
      const document = getDocument();
      const {
        params,
        el,
        wrapperEl,
        device
      } = swiper;
      const capture = !!params.nested;
      const domMethod = method === 'on' ? 'addEventListener' : 'removeEventListener';
      const swiperMethod = method;
      if (!el || typeof el === 'string') return;

      // Touch Events
      document[domMethod]('touchstart', swiper.onDocumentTouchStart, {
        passive: false,
        capture
      });
      el[domMethod]('touchstart', swiper.onTouchStart, {
        passive: false
      });
      el[domMethod]('pointerdown', swiper.onTouchStart, {
        passive: false
      });
      document[domMethod]('touchmove', swiper.onTouchMove, {
        passive: false,
        capture
      });
      document[domMethod]('pointermove', swiper.onTouchMove, {
        passive: false,
        capture
      });
      document[domMethod]('touchend', swiper.onTouchEnd, {
        passive: true
      });
      document[domMethod]('pointerup', swiper.onTouchEnd, {
        passive: true
      });
      document[domMethod]('pointercancel', swiper.onTouchEnd, {
        passive: true
      });
      document[domMethod]('touchcancel', swiper.onTouchEnd, {
        passive: true
      });
      document[domMethod]('pointerout', swiper.onTouchEnd, {
        passive: true
      });
      document[domMethod]('pointerleave', swiper.onTouchEnd, {
        passive: true
      });
      document[domMethod]('contextmenu', swiper.onTouchEnd, {
        passive: true
      });

      // Prevent Links Clicks
      if (params.preventClicks || params.preventClicksPropagation) {
        el[domMethod]('click', swiper.onClick, true);
      }
      if (params.cssMode) {
        wrapperEl[domMethod]('scroll', swiper.onScroll);
      }

      // Resize handler
      if (params.updateOnWindowResize) {
        swiper[swiperMethod](device.ios || device.android ? 'resize orientationchange observerUpdate' : 'resize observerUpdate', onResize, true);
      } else {
        swiper[swiperMethod]('observerUpdate', onResize, true);
      }

      // Images loader
      el[domMethod]('load', swiper.onLoad, {
        capture: true
      });
    };
    function attachEvents() {
      const swiper = this;
      const {
        params
      } = swiper;
      swiper.onTouchStart = onTouchStart.bind(swiper);
      swiper.onTouchMove = onTouchMove.bind(swiper);
      swiper.onTouchEnd = onTouchEnd.bind(swiper);
      swiper.onDocumentTouchStart = onDocumentTouchStart.bind(swiper);
      if (params.cssMode) {
        swiper.onScroll = onScroll.bind(swiper);
      }
      swiper.onClick = onClick.bind(swiper);
      swiper.onLoad = onLoad.bind(swiper);
      events(swiper, 'on');
    }
    function detachEvents() {
      const swiper = this;
      events(swiper, 'off');
    }
    var events$1 = {
      attachEvents,
      detachEvents
    };

    const isGridEnabled = (swiper, params) => {
      return swiper.grid && params.grid && params.grid.rows > 1;
    };
    function setBreakpoint() {
      const swiper = this;
      const {
        realIndex,
        initialized,
        params,
        el
      } = swiper;
      const breakpoints = params.breakpoints;
      if (!breakpoints || breakpoints && Object.keys(breakpoints).length === 0) return;
      const document = getDocument();

      // Get breakpoint for window/container width and update parameters
      const breakpointsBase = params.breakpointsBase === 'window' || !params.breakpointsBase ? params.breakpointsBase : 'container';
      const breakpointContainer = ['window', 'container'].includes(params.breakpointsBase) || !params.breakpointsBase ? swiper.el : document.querySelector(params.breakpointsBase);
      const breakpoint = swiper.getBreakpoint(breakpoints, breakpointsBase, breakpointContainer);
      if (!breakpoint || swiper.currentBreakpoint === breakpoint) return;
      const breakpointOnlyParams = breakpoint in breakpoints ? breakpoints[breakpoint] : undefined;
      const breakpointParams = breakpointOnlyParams || swiper.originalParams;
      const wasMultiRow = isGridEnabled(swiper, params);
      const isMultiRow = isGridEnabled(swiper, breakpointParams);
      const wasGrabCursor = swiper.params.grabCursor;
      const isGrabCursor = breakpointParams.grabCursor;
      const wasEnabled = params.enabled;
      if (wasMultiRow && !isMultiRow) {
        el.classList.remove(`${params.containerModifierClass}grid`, `${params.containerModifierClass}grid-column`);
        swiper.emitContainerClasses();
      } else if (!wasMultiRow && isMultiRow) {
        el.classList.add(`${params.containerModifierClass}grid`);
        if (breakpointParams.grid.fill && breakpointParams.grid.fill === 'column' || !breakpointParams.grid.fill && params.grid.fill === 'column') {
          el.classList.add(`${params.containerModifierClass}grid-column`);
        }
        swiper.emitContainerClasses();
      }
      if (wasGrabCursor && !isGrabCursor) {
        swiper.unsetGrabCursor();
      } else if (!wasGrabCursor && isGrabCursor) {
        swiper.setGrabCursor();
      }

      // Toggle navigation, pagination, scrollbar
      ['navigation', 'pagination', 'scrollbar'].forEach(prop => {
        if (typeof breakpointParams[prop] === 'undefined') return;
        const wasModuleEnabled = params[prop] && params[prop].enabled;
        const isModuleEnabled = breakpointParams[prop] && breakpointParams[prop].enabled;
        if (wasModuleEnabled && !isModuleEnabled) {
          swiper[prop].disable();
        }
        if (!wasModuleEnabled && isModuleEnabled) {
          swiper[prop].enable();
        }
      });
      const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
      const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);
      const wasLoop = params.loop;
      if (directionChanged && initialized) {
        swiper.changeDirection();
      }
      extend$1(swiper.params, breakpointParams);
      const isEnabled = swiper.params.enabled;
      const hasLoop = swiper.params.loop;
      Object.assign(swiper, {
        allowTouchMove: swiper.params.allowTouchMove,
        allowSlideNext: swiper.params.allowSlideNext,
        allowSlidePrev: swiper.params.allowSlidePrev
      });
      if (wasEnabled && !isEnabled) {
        swiper.disable();
      } else if (!wasEnabled && isEnabled) {
        swiper.enable();
      }
      swiper.currentBreakpoint = breakpoint;
      swiper.emit('_beforeBreakpoint', breakpointParams);
      if (initialized) {
        if (needsReLoop) {
          swiper.loopDestroy();
          swiper.loopCreate(realIndex);
          swiper.updateSlides();
        } else if (!wasLoop && hasLoop) {
          swiper.loopCreate(realIndex);
          swiper.updateSlides();
        } else if (wasLoop && !hasLoop) {
          swiper.loopDestroy();
        }
      }
      swiper.emit('breakpoint', breakpointParams);
    }

    function getBreakpoint(breakpoints, base, containerEl) {
      if (base === void 0) {
        base = 'window';
      }
      if (!breakpoints || base === 'container' && !containerEl) return undefined;
      let breakpoint = false;
      const window = getWindow();
      const currentHeight = base === 'window' ? window.innerHeight : containerEl.clientHeight;
      const points = Object.keys(breakpoints).map(point => {
        if (typeof point === 'string' && point.indexOf('@') === 0) {
          const minRatio = parseFloat(point.substr(1));
          const value = currentHeight * minRatio;
          return {
            value,
            point
          };
        }
        return {
          value: point,
          point
        };
      });
      points.sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));
      for (let i = 0; i < points.length; i += 1) {
        const {
          point,
          value
        } = points[i];
        if (base === 'window') {
          if (window.matchMedia(`(min-width: ${value}px)`).matches) {
            breakpoint = point;
          }
        } else if (value <= containerEl.clientWidth) {
          breakpoint = point;
        }
      }
      return breakpoint || 'max';
    }

    var breakpoints = {
      setBreakpoint,
      getBreakpoint
    };

    function prepareClasses(entries, prefix) {
      const resultClasses = [];
      entries.forEach(item => {
        if (typeof item === 'object') {
          Object.keys(item).forEach(classNames => {
            if (item[classNames]) {
              resultClasses.push(prefix + classNames);
            }
          });
        } else if (typeof item === 'string') {
          resultClasses.push(prefix + item);
        }
      });
      return resultClasses;
    }
    function addClasses() {
      const swiper = this;
      const {
        classNames,
        params,
        rtl,
        el,
        device
      } = swiper;
      // prettier-ignore
      const suffixes = prepareClasses(['initialized', params.direction, {
        'free-mode': swiper.params.freeMode && params.freeMode.enabled
      }, {
        'autoheight': params.autoHeight
      }, {
        'rtl': rtl
      }, {
        'grid': params.grid && params.grid.rows > 1
      }, {
        'grid-column': params.grid && params.grid.rows > 1 && params.grid.fill === 'column'
      }, {
        'android': device.android
      }, {
        'ios': device.ios
      }, {
        'css-mode': params.cssMode
      }, {
        'centered': params.cssMode && params.centeredSlides
      }, {
        'watch-progress': params.watchSlidesProgress
      }], params.containerModifierClass);
      classNames.push(...suffixes);
      el.classList.add(...classNames);
      swiper.emitContainerClasses();
    }

    function removeClasses() {
      const swiper = this;
      const {
        el,
        classNames
      } = swiper;
      if (!el || typeof el === 'string') return;
      el.classList.remove(...classNames);
      swiper.emitContainerClasses();
    }

    var classes$3 = {
      addClasses,
      removeClasses
    };

    function checkOverflow() {
      const swiper = this;
      const {
        isLocked: wasLocked,
        params
      } = swiper;
      const {
        slidesOffsetBefore
      } = params;
      if (slidesOffsetBefore) {
        const lastSlideIndex = swiper.slides.length - 1;
        const lastSlideRightEdge = swiper.slidesGrid[lastSlideIndex] + swiper.slidesSizesGrid[lastSlideIndex] + slidesOffsetBefore * 2;
        swiper.isLocked = swiper.size > lastSlideRightEdge;
      } else {
        swiper.isLocked = swiper.snapGrid.length === 1;
      }
      if (params.allowSlideNext === true) {
        swiper.allowSlideNext = !swiper.isLocked;
      }
      if (params.allowSlidePrev === true) {
        swiper.allowSlidePrev = !swiper.isLocked;
      }
      if (wasLocked && wasLocked !== swiper.isLocked) {
        swiper.isEnd = false;
      }
      if (wasLocked !== swiper.isLocked) {
        swiper.emit(swiper.isLocked ? 'lock' : 'unlock');
      }
    }
    var checkOverflow$1 = {
      checkOverflow
    };

    var defaults = {
      init: true,
      direction: 'horizontal',
      oneWayMovement: false,
      swiperElementNodeName: 'SWIPER-CONTAINER',
      touchEventsTarget: 'wrapper',
      initialSlide: 0,
      speed: 300,
      cssMode: false,
      updateOnWindowResize: true,
      resizeObserver: true,
      nested: false,
      createElements: false,
      eventsPrefix: 'swiper',
      enabled: true,
      focusableElements: 'input, select, option, textarea, button, video, label',
      // Overrides
      width: null,
      height: null,
      //
      preventInteractionOnTransition: false,
      // ssr
      userAgent: null,
      url: null,
      // To support iOS's swipe-to-go-back gesture (when being used in-app).
      edgeSwipeDetection: false,
      edgeSwipeThreshold: 20,
      // Autoheight
      autoHeight: false,
      // Set wrapper width
      setWrapperSize: false,
      // Virtual Translate
      virtualTranslate: false,
      // Effects
      effect: 'slide',
      // 'slide' or 'fade' or 'cube' or 'coverflow' or 'flip'

      // Breakpoints
      breakpoints: undefined,
      breakpointsBase: 'window',
      // Slides grid
      spaceBetween: 0,
      slidesPerView: 1,
      slidesPerGroup: 1,
      slidesPerGroupSkip: 0,
      slidesPerGroupAuto: false,
      centeredSlides: false,
      centeredSlidesBounds: false,
      slidesOffsetBefore: 0,
      // in px
      slidesOffsetAfter: 0,
      // in px
      normalizeSlideIndex: true,
      centerInsufficientSlides: false,
      // Disable swiper and hide navigation when container not overflow
      watchOverflow: true,
      // Round length
      roundLengths: false,
      // Touches
      touchRatio: 1,
      touchAngle: 45,
      simulateTouch: true,
      shortSwipes: true,
      longSwipes: true,
      longSwipesRatio: 0.5,
      longSwipesMs: 300,
      followFinger: true,
      allowTouchMove: true,
      threshold: 5,
      touchMoveStopPropagation: false,
      touchStartPreventDefault: true,
      touchStartForcePreventDefault: false,
      touchReleaseOnEdges: false,
      // Unique Navigation Elements
      uniqueNavElements: true,
      // Resistance
      resistance: true,
      resistanceRatio: 0.85,
      // Progress
      watchSlidesProgress: false,
      // Cursor
      grabCursor: false,
      // Clicks
      preventClicks: true,
      preventClicksPropagation: true,
      slideToClickedSlide: false,
      // loop
      loop: false,
      loopAddBlankSlides: true,
      loopAdditionalSlides: 0,
      loopPreventsSliding: true,
      // rewind
      rewind: false,
      // Swiping/no swiping
      allowSlidePrev: true,
      allowSlideNext: true,
      swipeHandler: null,
      // '.swipe-handler',
      noSwiping: true,
      noSwipingClass: 'swiper-no-swiping',
      noSwipingSelector: null,
      // Passive Listeners
      passiveListeners: true,
      maxBackfaceHiddenSlides: 10,
      // NS
      containerModifierClass: 'swiper-',
      // NEW
      slideClass: 'swiper-slide',
      slideBlankClass: 'swiper-slide-blank',
      slideActiveClass: 'swiper-slide-active',
      slideVisibleClass: 'swiper-slide-visible',
      slideFullyVisibleClass: 'swiper-slide-fully-visible',
      slideNextClass: 'swiper-slide-next',
      slidePrevClass: 'swiper-slide-prev',
      wrapperClass: 'swiper-wrapper',
      lazyPreloaderClass: 'swiper-lazy-preloader',
      lazyPreloadPrevNext: 0,
      // Callbacks
      runCallbacksOnInit: true,
      // Internals
      _emitClasses: false
    };

    function moduleExtendParams(params, allModulesParams) {
      return function extendParams(obj) {
        if (obj === void 0) {
          obj = {};
        }
        const moduleParamName = Object.keys(obj)[0];
        const moduleParams = obj[moduleParamName];
        if (typeof moduleParams !== 'object' || moduleParams === null) {
          extend$1(allModulesParams, obj);
          return;
        }
        if (params[moduleParamName] === true) {
          params[moduleParamName] = {
            enabled: true
          };
        }
        if (moduleParamName === 'navigation' && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].prevEl && !params[moduleParamName].nextEl) {
          params[moduleParamName].auto = true;
        }
        if (['pagination', 'scrollbar'].indexOf(moduleParamName) >= 0 && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].el) {
          params[moduleParamName].auto = true;
        }
        if (!(moduleParamName in params && 'enabled' in moduleParams)) {
          extend$1(allModulesParams, obj);
          return;
        }
        if (typeof params[moduleParamName] === 'object' && !('enabled' in params[moduleParamName])) {
          params[moduleParamName].enabled = true;
        }
        if (!params[moduleParamName]) params[moduleParamName] = {
          enabled: false
        };
        extend$1(allModulesParams, obj);
      };
    }

    /* eslint no-param-reassign: "off" */
    const prototypes = {
      eventsEmitter,
      update,
      translate,
      transition,
      slide,
      loop,
      grabCursor,
      events: events$1,
      breakpoints,
      checkOverflow: checkOverflow$1,
      classes: classes$3
    };
    const extendedDefaults = {};
    class Swiper {
      constructor() {
        let el;
        let params;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        if (args.length === 1 && args[0].constructor && Object.prototype.toString.call(args[0]).slice(8, -1) === 'Object') {
          params = args[0];
        } else {
          [el, params] = args;
        }
        if (!params) params = {};
        params = extend$1({}, params);
        if (el && !params.el) params.el = el;
        const document = getDocument();
        if (params.el && typeof params.el === 'string' && document.querySelectorAll(params.el).length > 1) {
          const swipers = [];
          document.querySelectorAll(params.el).forEach(containerEl => {
            const newParams = extend$1({}, params, {
              el: containerEl
            });
            swipers.push(new Swiper(newParams));
          });
          // eslint-disable-next-line no-constructor-return
          return swipers;
        }

        // Swiper Instance
        const swiper = this;
        swiper.__swiper__ = true;
        swiper.support = getSupport();
        swiper.device = getDevice({
          userAgent: params.userAgent
        });
        swiper.browser = getBrowser();
        swiper.eventsListeners = {};
        swiper.eventsAnyListeners = [];
        swiper.modules = [...swiper.__modules__];
        if (params.modules && Array.isArray(params.modules)) {
          swiper.modules.push(...params.modules);
        }
        const allModulesParams = {};
        swiper.modules.forEach(mod => {
          mod({
            params,
            swiper,
            extendParams: moduleExtendParams(params, allModulesParams),
            on: swiper.on.bind(swiper),
            once: swiper.once.bind(swiper),
            off: swiper.off.bind(swiper),
            emit: swiper.emit.bind(swiper)
          });
        });

        // Extend defaults with modules params
        const swiperParams = extend$1({}, defaults, allModulesParams);

        // Extend defaults with passed params
        swiper.params = extend$1({}, swiperParams, extendedDefaults, params);
        swiper.originalParams = extend$1({}, swiper.params);
        swiper.passedParams = extend$1({}, params);

        // add event listeners
        if (swiper.params && swiper.params.on) {
          Object.keys(swiper.params.on).forEach(eventName => {
            swiper.on(eventName, swiper.params.on[eventName]);
          });
        }
        if (swiper.params && swiper.params.onAny) {
          swiper.onAny(swiper.params.onAny);
        }

        // Extend Swiper
        Object.assign(swiper, {
          enabled: swiper.params.enabled,
          el,
          // Classes
          classNames: [],
          // Slides
          slides: [],
          slidesGrid: [],
          snapGrid: [],
          slidesSizesGrid: [],
          // isDirection
          isHorizontal() {
            return swiper.params.direction === 'horizontal';
          },
          isVertical() {
            return swiper.params.direction === 'vertical';
          },
          // Indexes
          activeIndex: 0,
          realIndex: 0,
          //
          isBeginning: true,
          isEnd: false,
          // Props
          translate: 0,
          previousTranslate: 0,
          progress: 0,
          velocity: 0,
          animating: false,
          cssOverflowAdjustment() {
            // Returns 0 unless `translate` is > 2**23
            // Should be subtracted from css values to prevent overflow
            return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
          },
          // Locks
          allowSlideNext: swiper.params.allowSlideNext,
          allowSlidePrev: swiper.params.allowSlidePrev,
          // Touch Events
          touchEventsData: {
            isTouched: undefined,
            isMoved: undefined,
            allowTouchCallbacks: undefined,
            touchStartTime: undefined,
            isScrolling: undefined,
            currentTranslate: undefined,
            startTranslate: undefined,
            allowThresholdMove: undefined,
            // Form elements to match
            focusableElements: swiper.params.focusableElements,
            // Last click time
            lastClickTime: 0,
            clickTimeout: undefined,
            // Velocities
            velocities: [],
            allowMomentumBounce: undefined,
            startMoving: undefined,
            pointerId: null,
            touchId: null
          },
          // Clicks
          allowClick: true,
          // Touches
          allowTouchMove: swiper.params.allowTouchMove,
          touches: {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            diff: 0
          },
          // Images
          imagesToLoad: [],
          imagesLoaded: 0
        });
        swiper.emit('_swiper');

        // Init
        if (swiper.params.init) {
          swiper.init();
        }

        // Return app instance
        // eslint-disable-next-line no-constructor-return
        return swiper;
      }
      getDirectionLabel(property) {
        if (this.isHorizontal()) {
          return property;
        }
        // prettier-ignore
        return {
          'width': 'height',
          'margin-top': 'margin-left',
          'margin-bottom ': 'margin-right',
          'margin-left': 'margin-top',
          'margin-right': 'margin-bottom',
          'padding-left': 'padding-top',
          'padding-right': 'padding-bottom',
          'marginRight': 'marginBottom'
        }[property];
      }
      getSlideIndex(slideEl) {
        const {
          slidesEl,
          params
        } = this;
        const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
        const firstSlideIndex = elementIndex(slides[0]);
        return elementIndex(slideEl) - firstSlideIndex;
      }
      getSlideIndexByData(index) {
        return this.getSlideIndex(this.slides.find(slideEl => slideEl.getAttribute('data-swiper-slide-index') * 1 === index));
      }
      recalcSlides() {
        const swiper = this;
        const {
          slidesEl,
          params
        } = swiper;
        swiper.slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
      }
      enable() {
        const swiper = this;
        if (swiper.enabled) return;
        swiper.enabled = true;
        if (swiper.params.grabCursor) {
          swiper.setGrabCursor();
        }
        swiper.emit('enable');
      }
      disable() {
        const swiper = this;
        if (!swiper.enabled) return;
        swiper.enabled = false;
        if (swiper.params.grabCursor) {
          swiper.unsetGrabCursor();
        }
        swiper.emit('disable');
      }
      setProgress(progress, speed) {
        const swiper = this;
        progress = Math.min(Math.max(progress, 0), 1);
        const min = swiper.minTranslate();
        const max = swiper.maxTranslate();
        const current = (max - min) * progress + min;
        swiper.translateTo(current, typeof speed === 'undefined' ? 0 : speed);
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
      }
      emitContainerClasses() {
        const swiper = this;
        if (!swiper.params._emitClasses || !swiper.el) return;
        const cls = swiper.el.className.split(' ').filter(className => {
          return className.indexOf('swiper') === 0 || className.indexOf(swiper.params.containerModifierClass) === 0;
        });
        swiper.emit('_containerClasses', cls.join(' '));
      }
      getSlideClasses(slideEl) {
        const swiper = this;
        if (swiper.destroyed) return '';
        return slideEl.className.split(' ').filter(className => {
          return className.indexOf('swiper-slide') === 0 || className.indexOf(swiper.params.slideClass) === 0;
        }).join(' ');
      }
      emitSlidesClasses() {
        const swiper = this;
        if (!swiper.params._emitClasses || !swiper.el) return;
        const updates = [];
        swiper.slides.forEach(slideEl => {
          const classNames = swiper.getSlideClasses(slideEl);
          updates.push({
            slideEl,
            classNames
          });
          swiper.emit('_slideClass', slideEl, classNames);
        });
        swiper.emit('_slideClasses', updates);
      }
      slidesPerViewDynamic(view, exact) {
        if (view === void 0) {
          view = 'current';
        }
        if (exact === void 0) {
          exact = false;
        }
        const swiper = this;
        const {
          params,
          slides,
          slidesGrid,
          slidesSizesGrid,
          size: swiperSize,
          activeIndex
        } = swiper;
        let spv = 1;
        if (typeof params.slidesPerView === 'number') return params.slidesPerView;
        if (params.centeredSlides) {
          let slideSize = slides[activeIndex] ? Math.ceil(slides[activeIndex].swiperSlideSize) : 0;
          let breakLoop;
          for (let i = activeIndex + 1; i < slides.length; i += 1) {
            if (slides[i] && !breakLoop) {
              slideSize += Math.ceil(slides[i].swiperSlideSize);
              spv += 1;
              if (slideSize > swiperSize) breakLoop = true;
            }
          }
          for (let i = activeIndex - 1; i >= 0; i -= 1) {
            if (slides[i] && !breakLoop) {
              slideSize += slides[i].swiperSlideSize;
              spv += 1;
              if (slideSize > swiperSize) breakLoop = true;
            }
          }
        } else {
          // eslint-disable-next-line
          if (view === 'current') {
            for (let i = activeIndex + 1; i < slides.length; i += 1) {
              const slideInView = exact ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize;
              if (slideInView) {
                spv += 1;
              }
            }
          } else {
            // previous
            for (let i = activeIndex - 1; i >= 0; i -= 1) {
              const slideInView = slidesGrid[activeIndex] - slidesGrid[i] < swiperSize;
              if (slideInView) {
                spv += 1;
              }
            }
          }
        }
        return spv;
      }
      update() {
        const swiper = this;
        if (!swiper || swiper.destroyed) return;
        const {
          snapGrid,
          params
        } = swiper;
        // Breakpoints
        if (params.breakpoints) {
          swiper.setBreakpoint();
        }
        [...swiper.el.querySelectorAll('[loading="lazy"]')].forEach(imageEl => {
          if (imageEl.complete) {
            processLazyPreloader(swiper, imageEl);
          }
        });
        swiper.updateSize();
        swiper.updateSlides();
        swiper.updateProgress();
        swiper.updateSlidesClasses();
        function setTranslate() {
          const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
          const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
          swiper.setTranslate(newTranslate);
          swiper.updateActiveIndex();
          swiper.updateSlidesClasses();
        }
        let translated;
        if (params.freeMode && params.freeMode.enabled && !params.cssMode) {
          setTranslate();
          if (params.autoHeight) {
            swiper.updateAutoHeight();
          }
        } else {
          if ((params.slidesPerView === 'auto' || params.slidesPerView > 1) && swiper.isEnd && !params.centeredSlides) {
            const slides = swiper.virtual && params.virtual.enabled ? swiper.virtual.slides : swiper.slides;
            translated = swiper.slideTo(slides.length - 1, 0, false, true);
          } else {
            translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
          }
          if (!translated) {
            setTranslate();
          }
        }
        if (params.watchOverflow && snapGrid !== swiper.snapGrid) {
          swiper.checkOverflow();
        }
        swiper.emit('update');
      }
      changeDirection(newDirection, needUpdate) {
        if (needUpdate === void 0) {
          needUpdate = true;
        }
        const swiper = this;
        const currentDirection = swiper.params.direction;
        if (!newDirection) {
          // eslint-disable-next-line
          newDirection = currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
        }
        if (newDirection === currentDirection || newDirection !== 'horizontal' && newDirection !== 'vertical') {
          return swiper;
        }
        swiper.el.classList.remove(`${swiper.params.containerModifierClass}${currentDirection}`);
        swiper.el.classList.add(`${swiper.params.containerModifierClass}${newDirection}`);
        swiper.emitContainerClasses();
        swiper.params.direction = newDirection;
        swiper.slides.forEach(slideEl => {
          if (newDirection === 'vertical') {
            slideEl.style.width = '';
          } else {
            slideEl.style.height = '';
          }
        });
        swiper.emit('changeDirection');
        if (needUpdate) swiper.update();
        return swiper;
      }
      changeLanguageDirection(direction) {
        const swiper = this;
        if (swiper.rtl && direction === 'rtl' || !swiper.rtl && direction === 'ltr') return;
        swiper.rtl = direction === 'rtl';
        swiper.rtlTranslate = swiper.params.direction === 'horizontal' && swiper.rtl;
        if (swiper.rtl) {
          swiper.el.classList.add(`${swiper.params.containerModifierClass}rtl`);
          swiper.el.dir = 'rtl';
        } else {
          swiper.el.classList.remove(`${swiper.params.containerModifierClass}rtl`);
          swiper.el.dir = 'ltr';
        }
        swiper.update();
      }
      mount(element) {
        const swiper = this;
        if (swiper.mounted) return true;

        // Find el
        let el = element || swiper.params.el;
        if (typeof el === 'string') {
          el = document.querySelector(el);
        }
        if (!el) {
          return false;
        }
        el.swiper = swiper;
        if (el.parentNode && el.parentNode.host && el.parentNode.host.nodeName === swiper.params.swiperElementNodeName.toUpperCase()) {
          swiper.isElement = true;
        }
        const getWrapperSelector = () => {
          return `.${(swiper.params.wrapperClass || '').trim().split(' ').join('.')}`;
        };
        const getWrapper = () => {
          if (el && el.shadowRoot && el.shadowRoot.querySelector) {
            const res = el.shadowRoot.querySelector(getWrapperSelector());
            // Children needs to return slot items
            return res;
          }
          return elementChildren(el, getWrapperSelector())[0];
        };
        // Find Wrapper
        let wrapperEl = getWrapper();
        if (!wrapperEl && swiper.params.createElements) {
          wrapperEl = createElement('div', swiper.params.wrapperClass);
          el.append(wrapperEl);
          elementChildren(el, `.${swiper.params.slideClass}`).forEach(slideEl => {
            wrapperEl.append(slideEl);
          });
        }
        Object.assign(swiper, {
          el,
          wrapperEl,
          slidesEl: swiper.isElement && !el.parentNode.host.slideSlots ? el.parentNode.host : wrapperEl,
          hostEl: swiper.isElement ? el.parentNode.host : el,
          mounted: true,
          // RTL
          rtl: el.dir.toLowerCase() === 'rtl' || elementStyle(el, 'direction') === 'rtl',
          rtlTranslate: swiper.params.direction === 'horizontal' && (el.dir.toLowerCase() === 'rtl' || elementStyle(el, 'direction') === 'rtl'),
          wrongRTL: elementStyle(wrapperEl, 'display') === '-webkit-box'
        });
        return true;
      }
      init(el) {
        const swiper = this;
        if (swiper.initialized) return swiper;
        const mounted = swiper.mount(el);
        if (mounted === false) return swiper;
        swiper.emit('beforeInit');

        // Set breakpoint
        if (swiper.params.breakpoints) {
          swiper.setBreakpoint();
        }

        // Add Classes
        swiper.addClasses();

        // Update size
        swiper.updateSize();

        // Update slides
        swiper.updateSlides();
        if (swiper.params.watchOverflow) {
          swiper.checkOverflow();
        }

        // Set Grab Cursor
        if (swiper.params.grabCursor && swiper.enabled) {
          swiper.setGrabCursor();
        }

        // Slide To Initial Slide
        if (swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) {
          swiper.slideTo(swiper.params.initialSlide + swiper.virtual.slidesBefore, 0, swiper.params.runCallbacksOnInit, false, true);
        } else {
          swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit, false, true);
        }

        // Create loop
        if (swiper.params.loop) {
          swiper.loopCreate(undefined, true);
        }

        // Attach events
        swiper.attachEvents();
        const lazyElements = [...swiper.el.querySelectorAll('[loading="lazy"]')];
        if (swiper.isElement) {
          lazyElements.push(...swiper.hostEl.querySelectorAll('[loading="lazy"]'));
        }
        lazyElements.forEach(imageEl => {
          if (imageEl.complete) {
            processLazyPreloader(swiper, imageEl);
          } else {
            imageEl.addEventListener('load', e => {
              processLazyPreloader(swiper, e.target);
            });
          }
        });
        preload(swiper);

        // Init Flag
        swiper.initialized = true;
        preload(swiper);

        // Emit
        swiper.emit('init');
        swiper.emit('afterInit');
        return swiper;
      }
      destroy(deleteInstance, cleanStyles) {
        if (deleteInstance === void 0) {
          deleteInstance = true;
        }
        if (cleanStyles === void 0) {
          cleanStyles = true;
        }
        const swiper = this;
        const {
          params,
          el,
          wrapperEl,
          slides
        } = swiper;
        if (typeof swiper.params === 'undefined' || swiper.destroyed) {
          return null;
        }
        swiper.emit('beforeDestroy');

        // Init Flag
        swiper.initialized = false;

        // Detach events
        swiper.detachEvents();

        // Destroy loop
        if (params.loop) {
          swiper.loopDestroy();
        }

        // Cleanup styles
        if (cleanStyles) {
          swiper.removeClasses();
          if (el && typeof el !== 'string') {
            el.removeAttribute('style');
          }
          if (wrapperEl) {
            wrapperEl.removeAttribute('style');
          }
          if (slides && slides.length) {
            slides.forEach(slideEl => {
              slideEl.classList.remove(params.slideVisibleClass, params.slideFullyVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass);
              slideEl.removeAttribute('style');
              slideEl.removeAttribute('data-swiper-slide-index');
            });
          }
        }
        swiper.emit('destroy');

        // Detach emitter events
        Object.keys(swiper.eventsListeners).forEach(eventName => {
          swiper.off(eventName);
        });
        if (deleteInstance !== false) {
          if (swiper.el && typeof swiper.el !== 'string') {
            swiper.el.swiper = null;
          }
          deleteProps(swiper);
        }
        swiper.destroyed = true;
        return null;
      }
      static extendDefaults(newDefaults) {
        extend$1(extendedDefaults, newDefaults);
      }
      static get extendedDefaults() {
        return extendedDefaults;
      }
      static get defaults() {
        return defaults;
      }
      static installModule(mod) {
        if (!Swiper.prototype.__modules__) Swiper.prototype.__modules__ = [];
        const modules = Swiper.prototype.__modules__;
        if (typeof mod === 'function' && modules.indexOf(mod) < 0) {
          modules.push(mod);
        }
      }
      static use(module) {
        if (Array.isArray(module)) {
          module.forEach(m => Swiper.installModule(m));
          return Swiper;
        }
        Swiper.installModule(module);
        return Swiper;
      }
    }
    Object.keys(prototypes).forEach(prototypeGroup => {
      Object.keys(prototypes[prototypeGroup]).forEach(protoMethod => {
        Swiper.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
      });
    });
    Swiper.use([Resize, Observer]);

    function Virtual(_ref) {
      let {
        swiper,
        extendParams,
        on,
        emit
      } = _ref;
      extendParams({
        virtual: {
          enabled: false,
          slides: [],
          cache: true,
          renderSlide: null,
          renderExternal: null,
          renderExternalUpdate: true,
          addSlidesBefore: 0,
          addSlidesAfter: 0
        }
      });
      let cssModeTimeout;
      const document = getDocument();
      swiper.virtual = {
        cache: {},
        from: undefined,
        to: undefined,
        slides: [],
        offset: 0,
        slidesGrid: []
      };
      const tempDOM = document.createElement('div');
      function renderSlide(slide, index) {
        const params = swiper.params.virtual;
        if (params.cache && swiper.virtual.cache[index]) {
          return swiper.virtual.cache[index];
        }
        // eslint-disable-next-line
        let slideEl;
        if (params.renderSlide) {
          slideEl = params.renderSlide.call(swiper, slide, index);
          if (typeof slideEl === 'string') {
            tempDOM.innerHTML = slideEl;
            slideEl = tempDOM.children[0];
          }
        } else if (swiper.isElement) {
          slideEl = createElement('swiper-slide');
        } else {
          slideEl = createElement('div', swiper.params.slideClass);
        }
        slideEl.setAttribute('data-swiper-slide-index', index);
        if (!params.renderSlide) {
          slideEl.innerHTML = slide;
        }
        if (params.cache) {
          swiper.virtual.cache[index] = slideEl;
        }
        return slideEl;
      }
      function update(force, beforeInit, forceActiveIndex) {
        const {
          slidesPerView,
          slidesPerGroup,
          centeredSlides,
          loop: isLoop,
          initialSlide
        } = swiper.params;
        if (beforeInit && !isLoop && initialSlide > 0) {
          return;
        }
        const {
          addSlidesBefore,
          addSlidesAfter
        } = swiper.params.virtual;
        const {
          from: previousFrom,
          to: previousTo,
          slides,
          slidesGrid: previousSlidesGrid,
          offset: previousOffset
        } = swiper.virtual;
        if (!swiper.params.cssMode) {
          swiper.updateActiveIndex();
        }
        const activeIndex = typeof forceActiveIndex === 'undefined' ? swiper.activeIndex || 0 : forceActiveIndex;
        let offsetProp;
        if (swiper.rtlTranslate) offsetProp = 'right';else offsetProp = swiper.isHorizontal() ? 'left' : 'top';
        let slidesAfter;
        let slidesBefore;
        if (centeredSlides) {
          slidesAfter = Math.floor(slidesPerView / 2) + slidesPerGroup + addSlidesAfter;
          slidesBefore = Math.floor(slidesPerView / 2) + slidesPerGroup + addSlidesBefore;
        } else {
          slidesAfter = slidesPerView + (slidesPerGroup - 1) + addSlidesAfter;
          slidesBefore = (isLoop ? slidesPerView : slidesPerGroup) + addSlidesBefore;
        }
        let from = activeIndex - slidesBefore;
        let to = activeIndex + slidesAfter;
        if (!isLoop) {
          from = Math.max(from, 0);
          to = Math.min(to, slides.length - 1);
        }
        let offset = (swiper.slidesGrid[from] || 0) - (swiper.slidesGrid[0] || 0);
        if (isLoop && activeIndex >= slidesBefore) {
          from -= slidesBefore;
          if (!centeredSlides) offset += swiper.slidesGrid[0];
        } else if (isLoop && activeIndex < slidesBefore) {
          from = -slidesBefore;
          if (centeredSlides) offset += swiper.slidesGrid[0];
        }
        Object.assign(swiper.virtual, {
          from,
          to,
          offset,
          slidesGrid: swiper.slidesGrid,
          slidesBefore,
          slidesAfter
        });
        function onRendered() {
          swiper.updateSlides();
          swiper.updateProgress();
          swiper.updateSlidesClasses();
          emit('virtualUpdate');
        }
        if (previousFrom === from && previousTo === to && !force) {
          if (swiper.slidesGrid !== previousSlidesGrid && offset !== previousOffset) {
            swiper.slides.forEach(slideEl => {
              slideEl.style[offsetProp] = `${offset - Math.abs(swiper.cssOverflowAdjustment())}px`;
            });
          }
          swiper.updateProgress();
          emit('virtualUpdate');
          return;
        }
        if (swiper.params.virtual.renderExternal) {
          swiper.params.virtual.renderExternal.call(swiper, {
            offset,
            from,
            to,
            slides: function getSlides() {
              const slidesToRender = [];
              for (let i = from; i <= to; i += 1) {
                slidesToRender.push(slides[i]);
              }
              return slidesToRender;
            }()
          });
          if (swiper.params.virtual.renderExternalUpdate) {
            onRendered();
          } else {
            emit('virtualUpdate');
          }
          return;
        }
        const prependIndexes = [];
        const appendIndexes = [];
        const getSlideIndex = index => {
          let slideIndex = index;
          if (index < 0) {
            slideIndex = slides.length + index;
          } else if (slideIndex >= slides.length) {
            // eslint-disable-next-line
            slideIndex = slideIndex - slides.length;
          }
          return slideIndex;
        };
        if (force) {
          swiper.slides.filter(el => el.matches(`.${swiper.params.slideClass}, swiper-slide`)).forEach(slideEl => {
            slideEl.remove();
          });
        } else {
          for (let i = previousFrom; i <= previousTo; i += 1) {
            if (i < from || i > to) {
              const slideIndex = getSlideIndex(i);
              swiper.slides.filter(el => el.matches(`.${swiper.params.slideClass}[data-swiper-slide-index="${slideIndex}"], swiper-slide[data-swiper-slide-index="${slideIndex}"]`)).forEach(slideEl => {
                slideEl.remove();
              });
            }
          }
        }
        const loopFrom = isLoop ? -slides.length : 0;
        const loopTo = isLoop ? slides.length * 2 : slides.length;
        for (let i = loopFrom; i < loopTo; i += 1) {
          if (i >= from && i <= to) {
            const slideIndex = getSlideIndex(i);
            if (typeof previousTo === 'undefined' || force) {
              appendIndexes.push(slideIndex);
            } else {
              if (i > previousTo) appendIndexes.push(slideIndex);
              if (i < previousFrom) prependIndexes.push(slideIndex);
            }
          }
        }
        appendIndexes.forEach(index => {
          swiper.slidesEl.append(renderSlide(slides[index], index));
        });
        if (isLoop) {
          for (let i = prependIndexes.length - 1; i >= 0; i -= 1) {
            const index = prependIndexes[i];
            swiper.slidesEl.prepend(renderSlide(slides[index], index));
          }
        } else {
          prependIndexes.sort((a, b) => b - a);
          prependIndexes.forEach(index => {
            swiper.slidesEl.prepend(renderSlide(slides[index], index));
          });
        }
        elementChildren(swiper.slidesEl, '.swiper-slide, swiper-slide').forEach(slideEl => {
          slideEl.style[offsetProp] = `${offset - Math.abs(swiper.cssOverflowAdjustment())}px`;
        });
        onRendered();
      }
      function appendSlide(slides) {
        if (typeof slides === 'object' && 'length' in slides) {
          for (let i = 0; i < slides.length; i += 1) {
            if (slides[i]) swiper.virtual.slides.push(slides[i]);
          }
        } else {
          swiper.virtual.slides.push(slides);
        }
        update(true);
      }
      function prependSlide(slides) {
        const activeIndex = swiper.activeIndex;
        let newActiveIndex = activeIndex + 1;
        let numberOfNewSlides = 1;
        if (Array.isArray(slides)) {
          for (let i = 0; i < slides.length; i += 1) {
            if (slides[i]) swiper.virtual.slides.unshift(slides[i]);
          }
          newActiveIndex = activeIndex + slides.length;
          numberOfNewSlides = slides.length;
        } else {
          swiper.virtual.slides.unshift(slides);
        }
        if (swiper.params.virtual.cache) {
          const cache = swiper.virtual.cache;
          const newCache = {};
          Object.keys(cache).forEach(cachedIndex => {
            const cachedEl = cache[cachedIndex];
            const cachedElIndex = cachedEl.getAttribute('data-swiper-slide-index');
            if (cachedElIndex) {
              cachedEl.setAttribute('data-swiper-slide-index', parseInt(cachedElIndex, 10) + numberOfNewSlides);
            }
            newCache[parseInt(cachedIndex, 10) + numberOfNewSlides] = cachedEl;
          });
          swiper.virtual.cache = newCache;
        }
        update(true);
        swiper.slideTo(newActiveIndex, 0);
      }
      function removeSlide(slidesIndexes) {
        if (typeof slidesIndexes === 'undefined' || slidesIndexes === null) return;
        let activeIndex = swiper.activeIndex;
        if (Array.isArray(slidesIndexes)) {
          for (let i = slidesIndexes.length - 1; i >= 0; i -= 1) {
            if (swiper.params.virtual.cache) {
              delete swiper.virtual.cache[slidesIndexes[i]];
              // shift cache indexes
              Object.keys(swiper.virtual.cache).forEach(key => {
                if (key > slidesIndexes) {
                  swiper.virtual.cache[key - 1] = swiper.virtual.cache[key];
                  swiper.virtual.cache[key - 1].setAttribute('data-swiper-slide-index', key - 1);
                  delete swiper.virtual.cache[key];
                }
              });
            }
            swiper.virtual.slides.splice(slidesIndexes[i], 1);
            if (slidesIndexes[i] < activeIndex) activeIndex -= 1;
            activeIndex = Math.max(activeIndex, 0);
          }
        } else {
          if (swiper.params.virtual.cache) {
            delete swiper.virtual.cache[slidesIndexes];
            // shift cache indexes
            Object.keys(swiper.virtual.cache).forEach(key => {
              if (key > slidesIndexes) {
                swiper.virtual.cache[key - 1] = swiper.virtual.cache[key];
                swiper.virtual.cache[key - 1].setAttribute('data-swiper-slide-index', key - 1);
                delete swiper.virtual.cache[key];
              }
            });
          }
          swiper.virtual.slides.splice(slidesIndexes, 1);
          if (slidesIndexes < activeIndex) activeIndex -= 1;
          activeIndex = Math.max(activeIndex, 0);
        }
        update(true);
        swiper.slideTo(activeIndex, 0);
      }
      function removeAllSlides() {
        swiper.virtual.slides = [];
        if (swiper.params.virtual.cache) {
          swiper.virtual.cache = {};
        }
        update(true);
        swiper.slideTo(0, 0);
      }
      on('beforeInit', () => {
        if (!swiper.params.virtual.enabled) return;
        let domSlidesAssigned;
        if (typeof swiper.passedParams.virtual.slides === 'undefined') {
          const slides = [...swiper.slidesEl.children].filter(el => el.matches(`.${swiper.params.slideClass}, swiper-slide`));
          if (slides && slides.length) {
            swiper.virtual.slides = [...slides];
            domSlidesAssigned = true;
            slides.forEach((slideEl, slideIndex) => {
              slideEl.setAttribute('data-swiper-slide-index', slideIndex);
              swiper.virtual.cache[slideIndex] = slideEl;
              slideEl.remove();
            });
          }
        }
        if (!domSlidesAssigned) {
          swiper.virtual.slides = swiper.params.virtual.slides;
        }
        swiper.classNames.push(`${swiper.params.containerModifierClass}virtual`);
        swiper.params.watchSlidesProgress = true;
        swiper.originalParams.watchSlidesProgress = true;
        update(false, true);
      });
      on('setTranslate', () => {
        if (!swiper.params.virtual.enabled) return;
        if (swiper.params.cssMode && !swiper._immediateVirtual) {
          clearTimeout(cssModeTimeout);
          cssModeTimeout = setTimeout(() => {
            update();
          }, 100);
        } else {
          update();
        }
      });
      on('init update resize', () => {
        if (!swiper.params.virtual.enabled) return;
        if (swiper.params.cssMode) {
          setCSSProperty(swiper.wrapperEl, '--swiper-virtual-size', `${swiper.virtualSize}px`);
        }
      });
      Object.assign(swiper.virtual, {
        appendSlide,
        prependSlide,
        removeSlide,
        removeAllSlides,
        update
      });
    }

    /* eslint-disable consistent-return */
    function Keyboard(_ref) {
      let {
        swiper,
        extendParams,
        on,
        emit
      } = _ref;
      const document = getDocument();
      const window = getWindow();
      swiper.keyboard = {
        enabled: false
      };
      extendParams({
        keyboard: {
          enabled: false,
          onlyInViewport: true,
          pageUpDown: true
        }
      });
      function handle(event) {
        if (!swiper.enabled) return;
        const {
          rtlTranslate: rtl
        } = swiper;
        let e = event;
        if (e.originalEvent) e = e.originalEvent; // jquery fix
        const kc = e.keyCode || e.charCode;
        const pageUpDown = swiper.params.keyboard.pageUpDown;
        const isPageUp = pageUpDown && kc === 33;
        const isPageDown = pageUpDown && kc === 34;
        const isArrowLeft = kc === 37;
        const isArrowRight = kc === 39;
        const isArrowUp = kc === 38;
        const isArrowDown = kc === 40;
        // Directions locks
        if (!swiper.allowSlideNext && (swiper.isHorizontal() && isArrowRight || swiper.isVertical() && isArrowDown || isPageDown)) {
          return false;
        }
        if (!swiper.allowSlidePrev && (swiper.isHorizontal() && isArrowLeft || swiper.isVertical() && isArrowUp || isPageUp)) {
          return false;
        }
        if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) {
          return undefined;
        }
        if (document.activeElement && document.activeElement.nodeName && (document.activeElement.nodeName.toLowerCase() === 'input' || document.activeElement.nodeName.toLowerCase() === 'textarea')) {
          return undefined;
        }
        if (swiper.params.keyboard.onlyInViewport && (isPageUp || isPageDown || isArrowLeft || isArrowRight || isArrowUp || isArrowDown)) {
          let inView = false;
          // Check that swiper should be inside of visible area of window
          if (elementParents(swiper.el, `.${swiper.params.slideClass}, swiper-slide`).length > 0 && elementParents(swiper.el, `.${swiper.params.slideActiveClass}`).length === 0) {
            return undefined;
          }
          const el = swiper.el;
          const swiperWidth = el.clientWidth;
          const swiperHeight = el.clientHeight;
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;
          const swiperOffset = elementOffset(el);
          if (rtl) swiperOffset.left -= el.scrollLeft;
          const swiperCoord = [[swiperOffset.left, swiperOffset.top], [swiperOffset.left + swiperWidth, swiperOffset.top], [swiperOffset.left, swiperOffset.top + swiperHeight], [swiperOffset.left + swiperWidth, swiperOffset.top + swiperHeight]];
          for (let i = 0; i < swiperCoord.length; i += 1) {
            const point = swiperCoord[i];
            if (point[0] >= 0 && point[0] <= windowWidth && point[1] >= 0 && point[1] <= windowHeight) {
              if (point[0] === 0 && point[1] === 0) continue; // eslint-disable-line
              inView = true;
            }
          }
          if (!inView) return undefined;
        }
        if (swiper.isHorizontal()) {
          if (isPageUp || isPageDown || isArrowLeft || isArrowRight) {
            if (e.preventDefault) e.preventDefault();else e.returnValue = false;
          }
          if ((isPageDown || isArrowRight) && !rtl || (isPageUp || isArrowLeft) && rtl) swiper.slideNext();
          if ((isPageUp || isArrowLeft) && !rtl || (isPageDown || isArrowRight) && rtl) swiper.slidePrev();
        } else {
          if (isPageUp || isPageDown || isArrowUp || isArrowDown) {
            if (e.preventDefault) e.preventDefault();else e.returnValue = false;
          }
          if (isPageDown || isArrowDown) swiper.slideNext();
          if (isPageUp || isArrowUp) swiper.slidePrev();
        }
        emit('keyPress', kc);
        return undefined;
      }
      function enable() {
        if (swiper.keyboard.enabled) return;
        document.addEventListener('keydown', handle);
        swiper.keyboard.enabled = true;
      }
      function disable() {
        if (!swiper.keyboard.enabled) return;
        document.removeEventListener('keydown', handle);
        swiper.keyboard.enabled = false;
      }
      on('init', () => {
        if (swiper.params.keyboard.enabled) {
          enable();
        }
      });
      on('destroy', () => {
        if (swiper.keyboard.enabled) {
          disable();
        }
      });
      Object.assign(swiper.keyboard, {
        enable,
        disable
      });
    }

    /* eslint-disable consistent-return */
    function Mousewheel(_ref) {
      let {
        swiper,
        extendParams,
        on,
        emit
      } = _ref;
      const window = getWindow();
      extendParams({
        mousewheel: {
          enabled: false,
          releaseOnEdges: false,
          invert: false,
          forceToAxis: false,
          sensitivity: 1,
          eventsTarget: 'container',
          thresholdDelta: null,
          thresholdTime: null,
          noMousewheelClass: 'swiper-no-mousewheel'
        }
      });
      swiper.mousewheel = {
        enabled: false
      };
      let timeout;
      let lastScrollTime = now();
      let lastEventBeforeSnap;
      const recentWheelEvents = [];
      function normalize(e) {
        // Reasonable defaults
        const PIXEL_STEP = 10;
        const LINE_HEIGHT = 40;
        const PAGE_HEIGHT = 800;
        let sX = 0;
        let sY = 0; // spinX, spinY
        let pX = 0;
        let pY = 0; // pixelX, pixelY

        // Legacy
        if ('detail' in e) {
          sY = e.detail;
        }
        if ('wheelDelta' in e) {
          sY = -e.wheelDelta / 120;
        }
        if ('wheelDeltaY' in e) {
          sY = -e.wheelDeltaY / 120;
        }
        if ('wheelDeltaX' in e) {
          sX = -e.wheelDeltaX / 120;
        }

        // side scrolling on FF with DOMMouseScroll
        if ('axis' in e && e.axis === e.HORIZONTAL_AXIS) {
          sX = sY;
          sY = 0;
        }
        pX = sX * PIXEL_STEP;
        pY = sY * PIXEL_STEP;
        if ('deltaY' in e) {
          pY = e.deltaY;
        }
        if ('deltaX' in e) {
          pX = e.deltaX;
        }
        if (e.shiftKey && !pX) {
          // if user scrolls with shift he wants horizontal scroll
          pX = pY;
          pY = 0;
        }
        if ((pX || pY) && e.deltaMode) {
          if (e.deltaMode === 1) {
            // delta in LINE units
            pX *= LINE_HEIGHT;
            pY *= LINE_HEIGHT;
          } else {
            // delta in PAGE units
            pX *= PAGE_HEIGHT;
            pY *= PAGE_HEIGHT;
          }
        }

        // Fall-back if spin cannot be determined
        if (pX && !sX) {
          sX = pX < 1 ? -1 : 1;
        }
        if (pY && !sY) {
          sY = pY < 1 ? -1 : 1;
        }
        return {
          spinX: sX,
          spinY: sY,
          pixelX: pX,
          pixelY: pY
        };
      }
      function handleMouseEnter() {
        if (!swiper.enabled) return;
        swiper.mouseEntered = true;
      }
      function handleMouseLeave() {
        if (!swiper.enabled) return;
        swiper.mouseEntered = false;
      }
      function animateSlider(newEvent) {
        if (swiper.params.mousewheel.thresholdDelta && newEvent.delta < swiper.params.mousewheel.thresholdDelta) {
          // Prevent if delta of wheel scroll delta is below configured threshold
          return false;
        }
        if (swiper.params.mousewheel.thresholdTime && now() - lastScrollTime < swiper.params.mousewheel.thresholdTime) {
          // Prevent if time between scrolls is below configured threshold
          return false;
        }

        // If the movement is NOT big enough and
        // if the last time the user scrolled was too close to the current one (avoid continuously triggering the slider):
        //   Don't go any further (avoid insignificant scroll movement).
        if (newEvent.delta >= 6 && now() - lastScrollTime < 60) {
          // Return false as a default
          return true;
        }
        // If user is scrolling towards the end:
        //   If the slider hasn't hit the latest slide or
        //   if the slider is a loop and
        //   if the slider isn't moving right now:
        //     Go to next slide and
        //     emit a scroll event.
        // Else (the user is scrolling towards the beginning) and
        // if the slider hasn't hit the first slide or
        // if the slider is a loop and
        // if the slider isn't moving right now:
        //   Go to prev slide and
        //   emit a scroll event.
        if (newEvent.direction < 0) {
          if ((!swiper.isEnd || swiper.params.loop) && !swiper.animating) {
            swiper.slideNext();
            emit('scroll', newEvent.raw);
          }
        } else if ((!swiper.isBeginning || swiper.params.loop) && !swiper.animating) {
          swiper.slidePrev();
          emit('scroll', newEvent.raw);
        }
        // If you got here is because an animation has been triggered so store the current time
        lastScrollTime = new window.Date().getTime();
        // Return false as a default
        return false;
      }
      function releaseScroll(newEvent) {
        const params = swiper.params.mousewheel;
        if (newEvent.direction < 0) {
          if (swiper.isEnd && !swiper.params.loop && params.releaseOnEdges) {
            // Return true to animate scroll on edges
            return true;
          }
        } else if (swiper.isBeginning && !swiper.params.loop && params.releaseOnEdges) {
          // Return true to animate scroll on edges
          return true;
        }
        return false;
      }
      function handle(event) {
        let e = event;
        let disableParentSwiper = true;
        if (!swiper.enabled) return;

        // Ignore event if the target or its parents have the swiper-no-mousewheel class
        if (event.target.closest(`.${swiper.params.mousewheel.noMousewheelClass}`)) return;
        const params = swiper.params.mousewheel;
        if (swiper.params.cssMode) {
          e.preventDefault();
        }
        let targetEl = swiper.el;
        if (swiper.params.mousewheel.eventsTarget !== 'container') {
          targetEl = document.querySelector(swiper.params.mousewheel.eventsTarget);
        }
        const targetElContainsTarget = targetEl && targetEl.contains(e.target);
        if (!swiper.mouseEntered && !targetElContainsTarget && !params.releaseOnEdges) return true;
        if (e.originalEvent) e = e.originalEvent; // jquery fix
        let delta = 0;
        const rtlFactor = swiper.rtlTranslate ? -1 : 1;
        const data = normalize(e);
        if (params.forceToAxis) {
          if (swiper.isHorizontal()) {
            if (Math.abs(data.pixelX) > Math.abs(data.pixelY)) delta = -data.pixelX * rtlFactor;else return true;
          } else if (Math.abs(data.pixelY) > Math.abs(data.pixelX)) delta = -data.pixelY;else return true;
        } else {
          delta = Math.abs(data.pixelX) > Math.abs(data.pixelY) ? -data.pixelX * rtlFactor : -data.pixelY;
        }
        if (delta === 0) return true;
        if (params.invert) delta = -delta;

        // Get the scroll positions
        let positions = swiper.getTranslate() + delta * params.sensitivity;
        if (positions >= swiper.minTranslate()) positions = swiper.minTranslate();
        if (positions <= swiper.maxTranslate()) positions = swiper.maxTranslate();

        // When loop is true:
        //     the disableParentSwiper will be true.
        // When loop is false:
        //     if the scroll positions is not on edge,
        //     then the disableParentSwiper will be true.
        //     if the scroll on edge positions,
        //     then the disableParentSwiper will be false.
        disableParentSwiper = swiper.params.loop ? true : !(positions === swiper.minTranslate() || positions === swiper.maxTranslate());
        if (disableParentSwiper && swiper.params.nested) e.stopPropagation();
        if (!swiper.params.freeMode || !swiper.params.freeMode.enabled) {
          // Register the new event in a variable which stores the relevant data
          const newEvent = {
            time: now(),
            delta: Math.abs(delta),
            direction: Math.sign(delta),
            raw: event
          };

          // Keep the most recent events
          if (recentWheelEvents.length >= 2) {
            recentWheelEvents.shift(); // only store the last N events
          }

          const prevEvent = recentWheelEvents.length ? recentWheelEvents[recentWheelEvents.length - 1] : undefined;
          recentWheelEvents.push(newEvent);

          // If there is at least one previous recorded event:
          //   If direction has changed or
          //   if the scroll is quicker than the previous one:
          //     Animate the slider.
          // Else (this is the first time the wheel is moved):
          //     Animate the slider.
          if (prevEvent) {
            if (newEvent.direction !== prevEvent.direction || newEvent.delta > prevEvent.delta || newEvent.time > prevEvent.time + 150) {
              animateSlider(newEvent);
            }
          } else {
            animateSlider(newEvent);
          }

          // If it's time to release the scroll:
          //   Return now so you don't hit the preventDefault.
          if (releaseScroll(newEvent)) {
            return true;
          }
        } else {
          // Freemode or scrollContainer:

          // If we recently snapped after a momentum scroll, then ignore wheel events
          // to give time for the deceleration to finish. Stop ignoring after 500 msecs
          // or if it's a new scroll (larger delta or inverse sign as last event before
          // an end-of-momentum snap).
          const newEvent = {
            time: now(),
            delta: Math.abs(delta),
            direction: Math.sign(delta)
          };
          const ignoreWheelEvents = lastEventBeforeSnap && newEvent.time < lastEventBeforeSnap.time + 500 && newEvent.delta <= lastEventBeforeSnap.delta && newEvent.direction === lastEventBeforeSnap.direction;
          if (!ignoreWheelEvents) {
            lastEventBeforeSnap = undefined;
            let position = swiper.getTranslate() + delta * params.sensitivity;
            const wasBeginning = swiper.isBeginning;
            const wasEnd = swiper.isEnd;
            if (position >= swiper.minTranslate()) position = swiper.minTranslate();
            if (position <= swiper.maxTranslate()) position = swiper.maxTranslate();
            swiper.setTransition(0);
            swiper.setTranslate(position);
            swiper.updateProgress();
            swiper.updateActiveIndex();
            swiper.updateSlidesClasses();
            if (!wasBeginning && swiper.isBeginning || !wasEnd && swiper.isEnd) {
              swiper.updateSlidesClasses();
            }
            if (swiper.params.loop) {
              swiper.loopFix({
                direction: newEvent.direction < 0 ? 'next' : 'prev',
                byMousewheel: true
              });
            }
            if (swiper.params.freeMode.sticky) {
              // When wheel scrolling starts with sticky (aka snap) enabled, then detect
              // the end of a momentum scroll by storing recent (N=15?) wheel events.
              // 1. do all N events have decreasing or same (absolute value) delta?
              // 2. did all N events arrive in the last M (M=500?) msecs?
              // 3. does the earliest event have an (absolute value) delta that's
              //    at least P (P=1?) larger than the most recent event's delta?
              // 4. does the latest event have a delta that's smaller than Q (Q=6?) pixels?
              // If 1-4 are "yes" then we're near the end of a momentum scroll deceleration.
              // Snap immediately and ignore remaining wheel events in this scroll.
              // See comment above for "remaining wheel events in this scroll" determination.
              // If 1-4 aren't satisfied, then wait to snap until 500ms after the last event.
              clearTimeout(timeout);
              timeout = undefined;
              if (recentWheelEvents.length >= 15) {
                recentWheelEvents.shift(); // only store the last N events
              }

              const prevEvent = recentWheelEvents.length ? recentWheelEvents[recentWheelEvents.length - 1] : undefined;
              const firstEvent = recentWheelEvents[0];
              recentWheelEvents.push(newEvent);
              if (prevEvent && (newEvent.delta > prevEvent.delta || newEvent.direction !== prevEvent.direction)) {
                // Increasing or reverse-sign delta means the user started scrolling again. Clear the wheel event log.
                recentWheelEvents.splice(0);
              } else if (recentWheelEvents.length >= 15 && newEvent.time - firstEvent.time < 500 && firstEvent.delta - newEvent.delta >= 1 && newEvent.delta <= 6) {
                // We're at the end of the deceleration of a momentum scroll, so there's no need
                // to wait for more events. Snap ASAP on the next tick.
                // Also, because there's some remaining momentum we'll bias the snap in the
                // direction of the ongoing scroll because it's better UX for the scroll to snap
                // in the same direction as the scroll instead of reversing to snap.  Therefore,
                // if it's already scrolled more than 20% in the current direction, keep going.
                const snapToThreshold = delta > 0 ? 0.8 : 0.2;
                lastEventBeforeSnap = newEvent;
                recentWheelEvents.splice(0);
                timeout = nextTick(() => {
                  if (swiper.destroyed || !swiper.params) return;
                  swiper.slideToClosest(swiper.params.speed, true, undefined, snapToThreshold);
                }, 0); // no delay; move on next tick
              }

              if (!timeout) {
                // if we get here, then we haven't detected the end of a momentum scroll, so
                // we'll consider a scroll "complete" when there haven't been any wheel events
                // for 500ms.
                timeout = nextTick(() => {
                  if (swiper.destroyed || !swiper.params) return;
                  const snapToThreshold = 0.5;
                  lastEventBeforeSnap = newEvent;
                  recentWheelEvents.splice(0);
                  swiper.slideToClosest(swiper.params.speed, true, undefined, snapToThreshold);
                }, 500);
              }
            }

            // Emit event
            if (!ignoreWheelEvents) emit('scroll', e);

            // Stop autoplay
            if (swiper.params.autoplay && swiper.params.autoplay.disableOnInteraction) swiper.autoplay.stop();
            // Return page scroll on edge positions
            if (params.releaseOnEdges && (position === swiper.minTranslate() || position === swiper.maxTranslate())) {
              return true;
            }
          }
        }
        if (e.preventDefault) e.preventDefault();else e.returnValue = false;
        return false;
      }
      function events(method) {
        let targetEl = swiper.el;
        if (swiper.params.mousewheel.eventsTarget !== 'container') {
          targetEl = document.querySelector(swiper.params.mousewheel.eventsTarget);
        }
        targetEl[method]('mouseenter', handleMouseEnter);
        targetEl[method]('mouseleave', handleMouseLeave);
        targetEl[method]('wheel', handle);
      }
      function enable() {
        if (swiper.params.cssMode) {
          swiper.wrapperEl.removeEventListener('wheel', handle);
          return true;
        }
        if (swiper.mousewheel.enabled) return false;
        events('addEventListener');
        swiper.mousewheel.enabled = true;
        return true;
      }
      function disable() {
        if (swiper.params.cssMode) {
          swiper.wrapperEl.addEventListener(event, handle);
          return true;
        }
        if (!swiper.mousewheel.enabled) return false;
        events('removeEventListener');
        swiper.mousewheel.enabled = false;
        return true;
      }
      on('init', () => {
        if (!swiper.params.mousewheel.enabled && swiper.params.cssMode) {
          disable();
        }
        if (swiper.params.mousewheel.enabled) enable();
      });
      on('destroy', () => {
        if (swiper.params.cssMode) {
          enable();
        }
        if (swiper.mousewheel.enabled) disable();
      });
      Object.assign(swiper.mousewheel, {
        enable,
        disable
      });
    }

    function createElementIfNotDefined(swiper, originalParams, params, checkProps) {
      if (swiper.params.createElements) {
        Object.keys(checkProps).forEach(key => {
          if (!params[key] && params.auto === true) {
            let element = elementChildren(swiper.el, `.${checkProps[key]}`)[0];
            if (!element) {
              element = createElement('div', checkProps[key]);
              element.className = checkProps[key];
              swiper.el.append(element);
            }
            params[key] = element;
            originalParams[key] = element;
          }
        });
      }
      return params;
    }

    function Navigation(_ref) {
      let {
        swiper,
        extendParams,
        on,
        emit
      } = _ref;
      extendParams({
        navigation: {
          nextEl: null,
          prevEl: null,
          hideOnClick: false,
          disabledClass: 'swiper-button-disabled',
          hiddenClass: 'swiper-button-hidden',
          lockClass: 'swiper-button-lock',
          navigationDisabledClass: 'swiper-navigation-disabled'
        }
      });
      swiper.navigation = {
        nextEl: null,
        prevEl: null
      };
      function getEl(el) {
        let res;
        if (el && typeof el === 'string' && swiper.isElement) {
          res = swiper.el.querySelector(el) || swiper.hostEl.querySelector(el);
          if (res) return res;
        }
        if (el) {
          if (typeof el === 'string') res = [...document.querySelectorAll(el)];
          if (swiper.params.uniqueNavElements && typeof el === 'string' && res && res.length > 1 && swiper.el.querySelectorAll(el).length === 1) {
            res = swiper.el.querySelector(el);
          } else if (res && res.length === 1) {
            res = res[0];
          }
        }
        if (el && !res) return el;
        // if (Array.isArray(res) && res.length === 1) res = res[0];
        return res;
      }
      function toggleEl(el, disabled) {
        const params = swiper.params.navigation;
        el = makeElementsArray(el);
        el.forEach(subEl => {
          if (subEl) {
            subEl.classList[disabled ? 'add' : 'remove'](...params.disabledClass.split(' '));
            if (subEl.tagName === 'BUTTON') subEl.disabled = disabled;
            if (swiper.params.watchOverflow && swiper.enabled) {
              subEl.classList[swiper.isLocked ? 'add' : 'remove'](params.lockClass);
            }
          }
        });
      }
      function update() {
        // Update Navigation Buttons
        const {
          nextEl,
          prevEl
        } = swiper.navigation;
        if (swiper.params.loop) {
          toggleEl(prevEl, false);
          toggleEl(nextEl, false);
          return;
        }
        toggleEl(prevEl, swiper.isBeginning && !swiper.params.rewind);
        toggleEl(nextEl, swiper.isEnd && !swiper.params.rewind);
      }
      function onPrevClick(e) {
        e.preventDefault();
        if (swiper.isBeginning && !swiper.params.loop && !swiper.params.rewind) return;
        swiper.slidePrev();
        emit('navigationPrev');
      }
      function onNextClick(e) {
        e.preventDefault();
        if (swiper.isEnd && !swiper.params.loop && !swiper.params.rewind) return;
        swiper.slideNext();
        emit('navigationNext');
      }
      function init() {
        const params = swiper.params.navigation;
        swiper.params.navigation = createElementIfNotDefined(swiper, swiper.originalParams.navigation, swiper.params.navigation, {
          nextEl: 'swiper-button-next',
          prevEl: 'swiper-button-prev'
        });
        if (!(params.nextEl || params.prevEl)) return;
        let nextEl = getEl(params.nextEl);
        let prevEl = getEl(params.prevEl);
        Object.assign(swiper.navigation, {
          nextEl,
          prevEl
        });
        nextEl = makeElementsArray(nextEl);
        prevEl = makeElementsArray(prevEl);
        const initButton = (el, dir) => {
          if (el) {
            el.addEventListener('click', dir === 'next' ? onNextClick : onPrevClick);
          }
          if (!swiper.enabled && el) {
            el.classList.add(...params.lockClass.split(' '));
          }
        };
        nextEl.forEach(el => initButton(el, 'next'));
        prevEl.forEach(el => initButton(el, 'prev'));
      }
      function destroy() {
        let {
          nextEl,
          prevEl
        } = swiper.navigation;
        nextEl = makeElementsArray(nextEl);
        prevEl = makeElementsArray(prevEl);
        const destroyButton = (el, dir) => {
          el.removeEventListener('click', dir === 'next' ? onNextClick : onPrevClick);
          el.classList.remove(...swiper.params.navigation.disabledClass.split(' '));
        };
        nextEl.forEach(el => destroyButton(el, 'next'));
        prevEl.forEach(el => destroyButton(el, 'prev'));
      }
      on('init', () => {
        if (swiper.params.navigation.enabled === false) {
          // eslint-disable-next-line
          disable();
        } else {
          init();
          update();
        }
      });
      on('toEdge fromEdge lock unlock', () => {
        update();
      });
      on('destroy', () => {
        destroy();
      });
      on('enable disable', () => {
        let {
          nextEl,
          prevEl
        } = swiper.navigation;
        nextEl = makeElementsArray(nextEl);
        prevEl = makeElementsArray(prevEl);
        if (swiper.enabled) {
          update();
          return;
        }
        [...nextEl, ...prevEl].filter(el => !!el).forEach(el => el.classList.add(swiper.params.navigation.lockClass));
      });
      on('click', (_s, e) => {
        let {
          nextEl,
          prevEl
        } = swiper.navigation;
        nextEl = makeElementsArray(nextEl);
        prevEl = makeElementsArray(prevEl);
        const targetEl = e.target;
        let targetIsButton = prevEl.includes(targetEl) || nextEl.includes(targetEl);
        if (swiper.isElement && !targetIsButton) {
          const path = e.path || e.composedPath && e.composedPath();
          if (path) {
            targetIsButton = path.find(pathEl => nextEl.includes(pathEl) || prevEl.includes(pathEl));
          }
        }
        if (swiper.params.navigation.hideOnClick && !targetIsButton) {
          if (swiper.pagination && swiper.params.pagination && swiper.params.pagination.clickable && (swiper.pagination.el === targetEl || swiper.pagination.el.contains(targetEl))) return;
          let isHidden;
          if (nextEl.length) {
            isHidden = nextEl[0].classList.contains(swiper.params.navigation.hiddenClass);
          } else if (prevEl.length) {
            isHidden = prevEl[0].classList.contains(swiper.params.navigation.hiddenClass);
          }
          if (isHidden === true) {
            emit('navigationShow');
          } else {
            emit('navigationHide');
          }
          [...nextEl, ...prevEl].filter(el => !!el).forEach(el => el.classList.toggle(swiper.params.navigation.hiddenClass));
        }
      });
      const enable = () => {
        swiper.el.classList.remove(...swiper.params.navigation.navigationDisabledClass.split(' '));
        init();
        update();
      };
      const disable = () => {
        swiper.el.classList.add(...swiper.params.navigation.navigationDisabledClass.split(' '));
        destroy();
      };
      Object.assign(swiper.navigation, {
        enable,
        disable,
        update,
        init,
        destroy
      });
    }

    function classesToSelector(classes) {
      if (classes === void 0) {
        classes = '';
      }
      return `.${classes.trim().replace(/([\.:!+\/])/g, '\\$1') // eslint-disable-line
  .replace(/ /g, '.')}`;
    }

    function Pagination(_ref) {
      let {
        swiper,
        extendParams,
        on,
        emit
      } = _ref;
      const pfx = 'swiper-pagination';
      extendParams({
        pagination: {
          el: null,
          bulletElement: 'span',
          clickable: false,
          hideOnClick: false,
          renderBullet: null,
          renderProgressbar: null,
          renderFraction: null,
          renderCustom: null,
          progressbarOpposite: false,
          type: 'bullets',
          // 'bullets' or 'progressbar' or 'fraction' or 'custom'
          dynamicBullets: false,
          dynamicMainBullets: 1,
          formatFractionCurrent: number => number,
          formatFractionTotal: number => number,
          bulletClass: `${pfx}-bullet`,
          bulletActiveClass: `${pfx}-bullet-active`,
          modifierClass: `${pfx}-`,
          currentClass: `${pfx}-current`,
          totalClass: `${pfx}-total`,
          hiddenClass: `${pfx}-hidden`,
          progressbarFillClass: `${pfx}-progressbar-fill`,
          progressbarOppositeClass: `${pfx}-progressbar-opposite`,
          clickableClass: `${pfx}-clickable`,
          lockClass: `${pfx}-lock`,
          horizontalClass: `${pfx}-horizontal`,
          verticalClass: `${pfx}-vertical`,
          paginationDisabledClass: `${pfx}-disabled`
        }
      });
      swiper.pagination = {
        el: null,
        bullets: []
      };
      let bulletSize;
      let dynamicBulletIndex = 0;
      function isPaginationDisabled() {
        return !swiper.params.pagination.el || !swiper.pagination.el || Array.isArray(swiper.pagination.el) && swiper.pagination.el.length === 0;
      }
      function setSideBullets(bulletEl, position) {
        const {
          bulletActiveClass
        } = swiper.params.pagination;
        if (!bulletEl) return;
        bulletEl = bulletEl[`${position === 'prev' ? 'previous' : 'next'}ElementSibling`];
        if (bulletEl) {
          bulletEl.classList.add(`${bulletActiveClass}-${position}`);
          bulletEl = bulletEl[`${position === 'prev' ? 'previous' : 'next'}ElementSibling`];
          if (bulletEl) {
            bulletEl.classList.add(`${bulletActiveClass}-${position}-${position}`);
          }
        }
      }
      function getMoveDirection(prevIndex, nextIndex, length) {
        prevIndex = prevIndex % length;
        nextIndex = nextIndex % length;
        if (nextIndex === prevIndex + 1) {
          return 'next';
        } else if (nextIndex === prevIndex - 1) {
          return 'previous';
        }
        return;
      }
      function onBulletClick(e) {
        const bulletEl = e.target.closest(classesToSelector(swiper.params.pagination.bulletClass));
        if (!bulletEl) {
          return;
        }
        e.preventDefault();
        const index = elementIndex(bulletEl) * swiper.params.slidesPerGroup;
        if (swiper.params.loop) {
          if (swiper.realIndex === index) return;
          const moveDirection = getMoveDirection(swiper.realIndex, index, swiper.slides.length);
          if (moveDirection === 'next') {
            swiper.slideNext();
          } else if (moveDirection === 'previous') {
            swiper.slidePrev();
          } else {
            swiper.slideToLoop(index);
          }
        } else {
          swiper.slideTo(index);
        }
      }
      function update() {
        // Render || Update Pagination bullets/items
        const rtl = swiper.rtl;
        const params = swiper.params.pagination;
        if (isPaginationDisabled()) return;
        let el = swiper.pagination.el;
        el = makeElementsArray(el);
        // Current/Total
        let current;
        let previousIndex;
        const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
        const total = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
        if (swiper.params.loop) {
          previousIndex = swiper.previousRealIndex || 0;
          current = swiper.params.slidesPerGroup > 1 ? Math.floor(swiper.realIndex / swiper.params.slidesPerGroup) : swiper.realIndex;
        } else if (typeof swiper.snapIndex !== 'undefined') {
          current = swiper.snapIndex;
          previousIndex = swiper.previousSnapIndex;
        } else {
          previousIndex = swiper.previousIndex || 0;
          current = swiper.activeIndex || 0;
        }
        // Types
        if (params.type === 'bullets' && swiper.pagination.bullets && swiper.pagination.bullets.length > 0) {
          const bullets = swiper.pagination.bullets;
          let firstIndex;
          let lastIndex;
          let midIndex;
          if (params.dynamicBullets) {
            bulletSize = elementOuterSize(bullets[0], swiper.isHorizontal() ? 'width' : 'height', true);
            el.forEach(subEl => {
              subEl.style[swiper.isHorizontal() ? 'width' : 'height'] = `${bulletSize * (params.dynamicMainBullets + 4)}px`;
            });
            if (params.dynamicMainBullets > 1 && previousIndex !== undefined) {
              dynamicBulletIndex += current - (previousIndex || 0);
              if (dynamicBulletIndex > params.dynamicMainBullets - 1) {
                dynamicBulletIndex = params.dynamicMainBullets - 1;
              } else if (dynamicBulletIndex < 0) {
                dynamicBulletIndex = 0;
              }
            }
            firstIndex = Math.max(current - dynamicBulletIndex, 0);
            lastIndex = firstIndex + (Math.min(bullets.length, params.dynamicMainBullets) - 1);
            midIndex = (lastIndex + firstIndex) / 2;
          }
          bullets.forEach(bulletEl => {
            const classesToRemove = [...['', '-next', '-next-next', '-prev', '-prev-prev', '-main'].map(suffix => `${params.bulletActiveClass}${suffix}`)].map(s => typeof s === 'string' && s.includes(' ') ? s.split(' ') : s).flat();
            bulletEl.classList.remove(...classesToRemove);
          });
          if (el.length > 1) {
            bullets.forEach(bullet => {
              const bulletIndex = elementIndex(bullet);
              if (bulletIndex === current) {
                bullet.classList.add(...params.bulletActiveClass.split(' '));
              } else if (swiper.isElement) {
                bullet.setAttribute('part', 'bullet');
              }
              if (params.dynamicBullets) {
                if (bulletIndex >= firstIndex && bulletIndex <= lastIndex) {
                  bullet.classList.add(...`${params.bulletActiveClass}-main`.split(' '));
                }
                if (bulletIndex === firstIndex) {
                  setSideBullets(bullet, 'prev');
                }
                if (bulletIndex === lastIndex) {
                  setSideBullets(bullet, 'next');
                }
              }
            });
          } else {
            const bullet = bullets[current];
            if (bullet) {
              bullet.classList.add(...params.bulletActiveClass.split(' '));
            }
            if (swiper.isElement) {
              bullets.forEach((bulletEl, bulletIndex) => {
                bulletEl.setAttribute('part', bulletIndex === current ? 'bullet-active' : 'bullet');
              });
            }
            if (params.dynamicBullets) {
              const firstDisplayedBullet = bullets[firstIndex];
              const lastDisplayedBullet = bullets[lastIndex];
              for (let i = firstIndex; i <= lastIndex; i += 1) {
                if (bullets[i]) {
                  bullets[i].classList.add(...`${params.bulletActiveClass}-main`.split(' '));
                }
              }
              setSideBullets(firstDisplayedBullet, 'prev');
              setSideBullets(lastDisplayedBullet, 'next');
            }
          }
          if (params.dynamicBullets) {
            const dynamicBulletsLength = Math.min(bullets.length, params.dynamicMainBullets + 4);
            const bulletsOffset = (bulletSize * dynamicBulletsLength - bulletSize) / 2 - midIndex * bulletSize;
            const offsetProp = rtl ? 'right' : 'left';
            bullets.forEach(bullet => {
              bullet.style[swiper.isHorizontal() ? offsetProp : 'top'] = `${bulletsOffset}px`;
            });
          }
        }
        el.forEach((subEl, subElIndex) => {
          if (params.type === 'fraction') {
            subEl.querySelectorAll(classesToSelector(params.currentClass)).forEach(fractionEl => {
              fractionEl.textContent = params.formatFractionCurrent(current + 1);
            });
            subEl.querySelectorAll(classesToSelector(params.totalClass)).forEach(totalEl => {
              totalEl.textContent = params.formatFractionTotal(total);
            });
          }
          if (params.type === 'progressbar') {
            let progressbarDirection;
            if (params.progressbarOpposite) {
              progressbarDirection = swiper.isHorizontal() ? 'vertical' : 'horizontal';
            } else {
              progressbarDirection = swiper.isHorizontal() ? 'horizontal' : 'vertical';
            }
            const scale = (current + 1) / total;
            let scaleX = 1;
            let scaleY = 1;
            if (progressbarDirection === 'horizontal') {
              scaleX = scale;
            } else {
              scaleY = scale;
            }
            subEl.querySelectorAll(classesToSelector(params.progressbarFillClass)).forEach(progressEl => {
              progressEl.style.transform = `translate3d(0,0,0) scaleX(${scaleX}) scaleY(${scaleY})`;
              progressEl.style.transitionDuration = `${swiper.params.speed}ms`;
            });
          }
          if (params.type === 'custom' && params.renderCustom) {
            subEl.innerHTML = params.renderCustom(swiper, current + 1, total);
            if (subElIndex === 0) emit('paginationRender', subEl);
          } else {
            if (subElIndex === 0) emit('paginationRender', subEl);
            emit('paginationUpdate', subEl);
          }
          if (swiper.params.watchOverflow && swiper.enabled) {
            subEl.classList[swiper.isLocked ? 'add' : 'remove'](params.lockClass);
          }
        });
      }
      function render() {
        // Render Container
        const params = swiper.params.pagination;
        if (isPaginationDisabled()) return;
        const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.grid && swiper.params.grid.rows > 1 ? swiper.slides.length / Math.ceil(swiper.params.grid.rows) : swiper.slides.length;
        let el = swiper.pagination.el;
        el = makeElementsArray(el);
        let paginationHTML = '';
        if (params.type === 'bullets') {
          let numberOfBullets = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
          if (swiper.params.freeMode && swiper.params.freeMode.enabled && numberOfBullets > slidesLength) {
            numberOfBullets = slidesLength;
          }
          for (let i = 0; i < numberOfBullets; i += 1) {
            if (params.renderBullet) {
              paginationHTML += params.renderBullet.call(swiper, i, params.bulletClass);
            } else {
              // prettier-ignore
              paginationHTML += `<${params.bulletElement} ${swiper.isElement ? 'part="bullet"' : ''} class="${params.bulletClass}"></${params.bulletElement}>`;
            }
          }
        }
        if (params.type === 'fraction') {
          if (params.renderFraction) {
            paginationHTML = params.renderFraction.call(swiper, params.currentClass, params.totalClass);
          } else {
            paginationHTML = `<span class="${params.currentClass}"></span>` + ' / ' + `<span class="${params.totalClass}"></span>`;
          }
        }
        if (params.type === 'progressbar') {
          if (params.renderProgressbar) {
            paginationHTML = params.renderProgressbar.call(swiper, params.progressbarFillClass);
          } else {
            paginationHTML = `<span class="${params.progressbarFillClass}"></span>`;
          }
        }
        swiper.pagination.bullets = [];
        el.forEach(subEl => {
          if (params.type !== 'custom') {
            subEl.innerHTML = paginationHTML || '';
          }
          if (params.type === 'bullets') {
            swiper.pagination.bullets.push(...subEl.querySelectorAll(classesToSelector(params.bulletClass)));
          }
        });
        if (params.type !== 'custom') {
          emit('paginationRender', el[0]);
        }
      }
      function init() {
        swiper.params.pagination = createElementIfNotDefined(swiper, swiper.originalParams.pagination, swiper.params.pagination, {
          el: 'swiper-pagination'
        });
        const params = swiper.params.pagination;
        if (!params.el) return;
        let el;
        if (typeof params.el === 'string' && swiper.isElement) {
          el = swiper.el.querySelector(params.el);
        }
        if (!el && typeof params.el === 'string') {
          el = [...document.querySelectorAll(params.el)];
        }
        if (!el) {
          el = params.el;
        }
        if (!el || el.length === 0) return;
        if (swiper.params.uniqueNavElements && typeof params.el === 'string' && Array.isArray(el) && el.length > 1) {
          el = [...swiper.el.querySelectorAll(params.el)];
          // check if it belongs to another nested Swiper
          if (el.length > 1) {
            el = el.find(subEl => {
              if (elementParents(subEl, '.swiper')[0] !== swiper.el) return false;
              return true;
            });
          }
        }
        if (Array.isArray(el) && el.length === 1) el = el[0];
        Object.assign(swiper.pagination, {
          el
        });
        el = makeElementsArray(el);
        el.forEach(subEl => {
          if (params.type === 'bullets' && params.clickable) {
            subEl.classList.add(...(params.clickableClass || '').split(' '));
          }
          subEl.classList.add(params.modifierClass + params.type);
          subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
          if (params.type === 'bullets' && params.dynamicBullets) {
            subEl.classList.add(`${params.modifierClass}${params.type}-dynamic`);
            dynamicBulletIndex = 0;
            if (params.dynamicMainBullets < 1) {
              params.dynamicMainBullets = 1;
            }
          }
          if (params.type === 'progressbar' && params.progressbarOpposite) {
            subEl.classList.add(params.progressbarOppositeClass);
          }
          if (params.clickable) {
            subEl.addEventListener('click', onBulletClick);
          }
          if (!swiper.enabled) {
            subEl.classList.add(params.lockClass);
          }
        });
      }
      function destroy() {
        const params = swiper.params.pagination;
        if (isPaginationDisabled()) return;
        let el = swiper.pagination.el;
        if (el) {
          el = makeElementsArray(el);
          el.forEach(subEl => {
            subEl.classList.remove(params.hiddenClass);
            subEl.classList.remove(params.modifierClass + params.type);
            subEl.classList.remove(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
            if (params.clickable) {
              subEl.classList.remove(...(params.clickableClass || '').split(' '));
              subEl.removeEventListener('click', onBulletClick);
            }
          });
        }
        if (swiper.pagination.bullets) swiper.pagination.bullets.forEach(subEl => subEl.classList.remove(...params.bulletActiveClass.split(' ')));
      }
      on('changeDirection', () => {
        if (!swiper.pagination || !swiper.pagination.el) return;
        const params = swiper.params.pagination;
        let {
          el
        } = swiper.pagination;
        el = makeElementsArray(el);
        el.forEach(subEl => {
          subEl.classList.remove(params.horizontalClass, params.verticalClass);
          subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
        });
      });
      on('init', () => {
        if (swiper.params.pagination.enabled === false) {
          // eslint-disable-next-line
          disable();
        } else {
          init();
          render();
          update();
        }
      });
      on('activeIndexChange', () => {
        if (typeof swiper.snapIndex === 'undefined') {
          update();
        }
      });
      on('snapIndexChange', () => {
        update();
      });
      on('snapGridLengthChange', () => {
        render();
        update();
      });
      on('destroy', () => {
        destroy();
      });
      on('enable disable', () => {
        let {
          el
        } = swiper.pagination;
        if (el) {
          el = makeElementsArray(el);
          el.forEach(subEl => subEl.classList[swiper.enabled ? 'remove' : 'add'](swiper.params.pagination.lockClass));
        }
      });
      on('lock unlock', () => {
        update();
      });
      on('click', (_s, e) => {
        const targetEl = e.target;
        const el = makeElementsArray(swiper.pagination.el);
        if (swiper.params.pagination.el && swiper.params.pagination.hideOnClick && el && el.length > 0 && !targetEl.classList.contains(swiper.params.pagination.bulletClass)) {
          if (swiper.navigation && (swiper.navigation.nextEl && targetEl === swiper.navigation.nextEl || swiper.navigation.prevEl && targetEl === swiper.navigation.prevEl)) return;
          const isHidden = el[0].classList.contains(swiper.params.pagination.hiddenClass);
          if (isHidden === true) {
            emit('paginationShow');
          } else {
            emit('paginationHide');
          }
          el.forEach(subEl => subEl.classList.toggle(swiper.params.pagination.hiddenClass));
        }
      });
      const enable = () => {
        swiper.el.classList.remove(swiper.params.pagination.paginationDisabledClass);
        let {
          el
        } = swiper.pagination;
        if (el) {
          el = makeElementsArray(el);
          el.forEach(subEl => subEl.classList.remove(swiper.params.pagination.paginationDisabledClass));
        }
        init();
        render();
        update();
      };
      const disable = () => {
        swiper.el.classList.add(swiper.params.pagination.paginationDisabledClass);
        let {
          el
        } = swiper.pagination;
        if (el) {
          el = makeElementsArray(el);
          el.forEach(subEl => subEl.classList.add(swiper.params.pagination.paginationDisabledClass));
        }
        destroy();
      };
      Object.assign(swiper.pagination, {
        enable,
        disable,
        render,
        update,
        init,
        destroy
      });
    }

    function Scrollbar(_ref) {
      let {
        swiper,
        extendParams,
        on,
        emit
      } = _ref;
      const document = getDocument();
      let isTouched = false;
      let timeout = null;
      let dragTimeout = null;
      let dragStartPos;
      let dragSize;
      let trackSize;
      let divider;
      extendParams({
        scrollbar: {
          el: null,
          dragSize: 'auto',
          hide: false,
          draggable: false,
          snapOnRelease: true,
          lockClass: 'swiper-scrollbar-lock',
          dragClass: 'swiper-scrollbar-drag',
          scrollbarDisabledClass: 'swiper-scrollbar-disabled',
          horizontalClass: `swiper-scrollbar-horizontal`,
          verticalClass: `swiper-scrollbar-vertical`
        }
      });
      swiper.scrollbar = {
        el: null,
        dragEl: null
      };
      function setTranslate() {
        if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;
        const {
          scrollbar,
          rtlTranslate: rtl
        } = swiper;
        const {
          dragEl,
          el
        } = scrollbar;
        const params = swiper.params.scrollbar;
        const progress = swiper.params.loop ? swiper.progressLoop : swiper.progress;
        let newSize = dragSize;
        let newPos = (trackSize - dragSize) * progress;
        if (rtl) {
          newPos = -newPos;
          if (newPos > 0) {
            newSize = dragSize - newPos;
            newPos = 0;
          } else if (-newPos + dragSize > trackSize) {
            newSize = trackSize + newPos;
          }
        } else if (newPos < 0) {
          newSize = dragSize + newPos;
          newPos = 0;
        } else if (newPos + dragSize > trackSize) {
          newSize = trackSize - newPos;
        }
        if (swiper.isHorizontal()) {
          dragEl.style.transform = `translate3d(${newPos}px, 0, 0)`;
          dragEl.style.width = `${newSize}px`;
        } else {
          dragEl.style.transform = `translate3d(0px, ${newPos}px, 0)`;
          dragEl.style.height = `${newSize}px`;
        }
        if (params.hide) {
          clearTimeout(timeout);
          el.style.opacity = 1;
          timeout = setTimeout(() => {
            el.style.opacity = 0;
            el.style.transitionDuration = '400ms';
          }, 1000);
        }
      }
      function setTransition(duration) {
        if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;
        swiper.scrollbar.dragEl.style.transitionDuration = `${duration}ms`;
      }
      function updateSize() {
        if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;
        const {
          scrollbar
        } = swiper;
        const {
          dragEl,
          el
        } = scrollbar;
        dragEl.style.width = '';
        dragEl.style.height = '';
        trackSize = swiper.isHorizontal() ? el.offsetWidth : el.offsetHeight;
        divider = swiper.size / (swiper.virtualSize + swiper.params.slidesOffsetBefore - (swiper.params.centeredSlides ? swiper.snapGrid[0] : 0));
        if (swiper.params.scrollbar.dragSize === 'auto') {
          dragSize = trackSize * divider;
        } else {
          dragSize = parseInt(swiper.params.scrollbar.dragSize, 10);
        }
        if (swiper.isHorizontal()) {
          dragEl.style.width = `${dragSize}px`;
        } else {
          dragEl.style.height = `${dragSize}px`;
        }
        if (divider >= 1) {
          el.style.display = 'none';
        } else {
          el.style.display = '';
        }
        if (swiper.params.scrollbar.hide) {
          el.style.opacity = 0;
        }
        if (swiper.params.watchOverflow && swiper.enabled) {
          scrollbar.el.classList[swiper.isLocked ? 'add' : 'remove'](swiper.params.scrollbar.lockClass);
        }
      }
      function getPointerPosition(e) {
        return swiper.isHorizontal() ? e.clientX : e.clientY;
      }
      function setDragPosition(e) {
        const {
          scrollbar,
          rtlTranslate: rtl
        } = swiper;
        const {
          el
        } = scrollbar;
        let positionRatio;
        positionRatio = (getPointerPosition(e) - elementOffset(el)[swiper.isHorizontal() ? 'left' : 'top'] - (dragStartPos !== null ? dragStartPos : dragSize / 2)) / (trackSize - dragSize);
        positionRatio = Math.max(Math.min(positionRatio, 1), 0);
        if (rtl) {
          positionRatio = 1 - positionRatio;
        }
        const position = swiper.minTranslate() + (swiper.maxTranslate() - swiper.minTranslate()) * positionRatio;
        swiper.updateProgress(position);
        swiper.setTranslate(position);
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
      }
      function onDragStart(e) {
        const params = swiper.params.scrollbar;
        const {
          scrollbar,
          wrapperEl
        } = swiper;
        const {
          el,
          dragEl
        } = scrollbar;
        isTouched = true;
        dragStartPos = e.target === dragEl ? getPointerPosition(e) - e.target.getBoundingClientRect()[swiper.isHorizontal() ? 'left' : 'top'] : null;
        e.preventDefault();
        e.stopPropagation();
        wrapperEl.style.transitionDuration = '100ms';
        dragEl.style.transitionDuration = '100ms';
        setDragPosition(e);
        clearTimeout(dragTimeout);
        el.style.transitionDuration = '0ms';
        if (params.hide) {
          el.style.opacity = 1;
        }
        if (swiper.params.cssMode) {
          swiper.wrapperEl.style['scroll-snap-type'] = 'none';
        }
        emit('scrollbarDragStart', e);
      }
      function onDragMove(e) {
        const {
          scrollbar,
          wrapperEl
        } = swiper;
        const {
          el,
          dragEl
        } = scrollbar;
        if (!isTouched) return;
        if (e.preventDefault && e.cancelable) e.preventDefault();else e.returnValue = false;
        setDragPosition(e);
        wrapperEl.style.transitionDuration = '0ms';
        el.style.transitionDuration = '0ms';
        dragEl.style.transitionDuration = '0ms';
        emit('scrollbarDragMove', e);
      }
      function onDragEnd(e) {
        const params = swiper.params.scrollbar;
        const {
          scrollbar,
          wrapperEl
        } = swiper;
        const {
          el
        } = scrollbar;
        if (!isTouched) return;
        isTouched = false;
        if (swiper.params.cssMode) {
          swiper.wrapperEl.style['scroll-snap-type'] = '';
          wrapperEl.style.transitionDuration = '';
        }
        if (params.hide) {
          clearTimeout(dragTimeout);
          dragTimeout = nextTick(() => {
            el.style.opacity = 0;
            el.style.transitionDuration = '400ms';
          }, 1000);
        }
        emit('scrollbarDragEnd', e);
        if (params.snapOnRelease) {
          swiper.slideToClosest();
        }
      }
      function events(method) {
        const {
          scrollbar,
          params
        } = swiper;
        const el = scrollbar.el;
        if (!el) return;
        const target = el;
        const activeListener = params.passiveListeners ? {
          passive: false,
          capture: false
        } : false;
        const passiveListener = params.passiveListeners ? {
          passive: true,
          capture: false
        } : false;
        if (!target) return;
        const eventMethod = method === 'on' ? 'addEventListener' : 'removeEventListener';
        target[eventMethod]('pointerdown', onDragStart, activeListener);
        document[eventMethod]('pointermove', onDragMove, activeListener);
        document[eventMethod]('pointerup', onDragEnd, passiveListener);
      }
      function enableDraggable() {
        if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;
        events('on');
      }
      function disableDraggable() {
        if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;
        events('off');
      }
      function init() {
        const {
          scrollbar,
          el: swiperEl
        } = swiper;
        swiper.params.scrollbar = createElementIfNotDefined(swiper, swiper.originalParams.scrollbar, swiper.params.scrollbar, {
          el: 'swiper-scrollbar'
        });
        const params = swiper.params.scrollbar;
        if (!params.el) return;
        let el;
        if (typeof params.el === 'string' && swiper.isElement) {
          el = swiper.el.querySelector(params.el);
        }
        if (!el && typeof params.el === 'string') {
          el = document.querySelectorAll(params.el);
          if (!el.length) return;
        } else if (!el) {
          el = params.el;
        }
        if (swiper.params.uniqueNavElements && typeof params.el === 'string' && el.length > 1 && swiperEl.querySelectorAll(params.el).length === 1) {
          el = swiperEl.querySelector(params.el);
        }
        if (el.length > 0) el = el[0];
        el.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
        let dragEl;
        if (el) {
          dragEl = el.querySelector(classesToSelector(swiper.params.scrollbar.dragClass));
          if (!dragEl) {
            dragEl = createElement('div', swiper.params.scrollbar.dragClass);
            el.append(dragEl);
          }
        }
        Object.assign(scrollbar, {
          el,
          dragEl
        });
        if (params.draggable) {
          enableDraggable();
        }
        if (el) {
          el.classList[swiper.enabled ? 'remove' : 'add'](...classesToTokens(swiper.params.scrollbar.lockClass));
        }
      }
      function destroy() {
        const params = swiper.params.scrollbar;
        const el = swiper.scrollbar.el;
        if (el) {
          el.classList.remove(...classesToTokens(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass));
        }
        disableDraggable();
      }
      on('changeDirection', () => {
        if (!swiper.scrollbar || !swiper.scrollbar.el) return;
        const params = swiper.params.scrollbar;
        let {
          el
        } = swiper.scrollbar;
        el = makeElementsArray(el);
        el.forEach(subEl => {
          subEl.classList.remove(params.horizontalClass, params.verticalClass);
          subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
        });
      });
      on('init', () => {
        if (swiper.params.scrollbar.enabled === false) {
          // eslint-disable-next-line
          disable();
        } else {
          init();
          updateSize();
          setTranslate();
        }
      });
      on('update resize observerUpdate lock unlock changeDirection', () => {
        updateSize();
      });
      on('setTranslate', () => {
        setTranslate();
      });
      on('setTransition', (_s, duration) => {
        setTransition(duration);
      });
      on('enable disable', () => {
        const {
          el
        } = swiper.scrollbar;
        if (el) {
          el.classList[swiper.enabled ? 'remove' : 'add'](...classesToTokens(swiper.params.scrollbar.lockClass));
        }
      });
      on('destroy', () => {
        destroy();
      });
      const enable = () => {
        swiper.el.classList.remove(...classesToTokens(swiper.params.scrollbar.scrollbarDisabledClass));
        if (swiper.scrollbar.el) {
          swiper.scrollbar.el.classList.remove(...classesToTokens(swiper.params.scrollbar.scrollbarDisabledClass));
        }
        init();
        updateSize();
        setTranslate();
      };
      const disable = () => {
        swiper.el.classList.add(...classesToTokens(swiper.params.scrollbar.scrollbarDisabledClass));
        if (swiper.scrollbar.el) {
          swiper.scrollbar.el.classList.add(...classesToTokens(swiper.params.scrollbar.scrollbarDisabledClass));
        }
        destroy();
      };
      Object.assign(swiper.scrollbar, {
        enable,
        disable,
        updateSize,
        setTranslate,
        init,
        destroy
      });
    }

    function Parallax(_ref) {
      let {
        swiper,
        extendParams,
        on
      } = _ref;
      extendParams({
        parallax: {
          enabled: false
        }
      });
      const elementsSelector = '[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]';
      const setTransform = (el, progress) => {
        const {
          rtl
        } = swiper;
        const rtlFactor = rtl ? -1 : 1;
        const p = el.getAttribute('data-swiper-parallax') || '0';
        let x = el.getAttribute('data-swiper-parallax-x');
        let y = el.getAttribute('data-swiper-parallax-y');
        const scale = el.getAttribute('data-swiper-parallax-scale');
        const opacity = el.getAttribute('data-swiper-parallax-opacity');
        const rotate = el.getAttribute('data-swiper-parallax-rotate');
        if (x || y) {
          x = x || '0';
          y = y || '0';
        } else if (swiper.isHorizontal()) {
          x = p;
          y = '0';
        } else {
          y = p;
          x = '0';
        }
        if (x.indexOf('%') >= 0) {
          x = `${parseInt(x, 10) * progress * rtlFactor}%`;
        } else {
          x = `${x * progress * rtlFactor}px`;
        }
        if (y.indexOf('%') >= 0) {
          y = `${parseInt(y, 10) * progress}%`;
        } else {
          y = `${y * progress}px`;
        }
        if (typeof opacity !== 'undefined' && opacity !== null) {
          const currentOpacity = opacity - (opacity - 1) * (1 - Math.abs(progress));
          el.style.opacity = currentOpacity;
        }
        let transform = `translate3d(${x}, ${y}, 0px)`;
        if (typeof scale !== 'undefined' && scale !== null) {
          const currentScale = scale - (scale - 1) * (1 - Math.abs(progress));
          transform += ` scale(${currentScale})`;
        }
        if (rotate && typeof rotate !== 'undefined' && rotate !== null) {
          const currentRotate = rotate * progress * -1;
          transform += ` rotate(${currentRotate}deg)`;
        }
        el.style.transform = transform;
      };
      const setTranslate = () => {
        const {
          el,
          slides,
          progress,
          snapGrid,
          isElement
        } = swiper;
        const elements = elementChildren(el, elementsSelector);
        if (swiper.isElement) {
          elements.push(...elementChildren(swiper.hostEl, elementsSelector));
        }
        elements.forEach(subEl => {
          setTransform(subEl, progress);
        });
        slides.forEach((slideEl, slideIndex) => {
          let slideProgress = slideEl.progress;
          if (swiper.params.slidesPerGroup > 1 && swiper.params.slidesPerView !== 'auto') {
            slideProgress += Math.ceil(slideIndex / 2) - progress * (snapGrid.length - 1);
          }
          slideProgress = Math.min(Math.max(slideProgress, -1), 1);
          slideEl.querySelectorAll(`${elementsSelector}, [data-swiper-parallax-rotate]`).forEach(subEl => {
            setTransform(subEl, slideProgress);
          });
        });
      };
      const setTransition = function (duration) {
        if (duration === void 0) {
          duration = swiper.params.speed;
        }
        const {
          el,
          hostEl
        } = swiper;
        const elements = [...el.querySelectorAll(elementsSelector)];
        if (swiper.isElement) {
          elements.push(...hostEl.querySelectorAll(elementsSelector));
        }
        elements.forEach(parallaxEl => {
          let parallaxDuration = parseInt(parallaxEl.getAttribute('data-swiper-parallax-duration'), 10) || duration;
          if (duration === 0) parallaxDuration = 0;
          parallaxEl.style.transitionDuration = `${parallaxDuration}ms`;
        });
      };
      on('beforeInit', () => {
        if (!swiper.params.parallax.enabled) return;
        swiper.params.watchSlidesProgress = true;
        swiper.originalParams.watchSlidesProgress = true;
      });
      on('init', () => {
        if (!swiper.params.parallax.enabled) return;
        setTranslate();
      });
      on('setTranslate', () => {
        if (!swiper.params.parallax.enabled) return;
        setTranslate();
      });
      on('setTransition', (_swiper, duration) => {
        if (!swiper.params.parallax.enabled) return;
        setTransition(duration);
      });
    }

    function Zoom(_ref) {
      let {
        swiper,
        extendParams,
        on,
        emit
      } = _ref;
      const window = getWindow();
      extendParams({
        zoom: {
          enabled: false,
          limitToOriginalSize: false,
          maxRatio: 3,
          minRatio: 1,
          panOnMouseMove: false,
          toggle: true,
          containerClass: 'swiper-zoom-container',
          zoomedSlideClass: 'swiper-slide-zoomed'
        }
      });
      swiper.zoom = {
        enabled: false
      };
      let currentScale = 1;
      let isScaling = false;
      let isPanningWithMouse = false;
      let mousePanStart = {
        x: 0,
        y: 0
      };
      const mousePanSensitivity = -3; // Negative to invert pan direction
      let fakeGestureTouched;
      let fakeGestureMoved;
      const evCache = [];
      const gesture = {
        originX: 0,
        originY: 0,
        slideEl: undefined,
        slideWidth: undefined,
        slideHeight: undefined,
        imageEl: undefined,
        imageWrapEl: undefined,
        maxRatio: 3
      };
      const image = {
        isTouched: undefined,
        isMoved: undefined,
        currentX: undefined,
        currentY: undefined,
        minX: undefined,
        minY: undefined,
        maxX: undefined,
        maxY: undefined,
        width: undefined,
        height: undefined,
        startX: undefined,
        startY: undefined,
        touchesStart: {},
        touchesCurrent: {}
      };
      const velocity = {
        x: undefined,
        y: undefined,
        prevPositionX: undefined,
        prevPositionY: undefined,
        prevTime: undefined
      };
      let scale = 1;
      Object.defineProperty(swiper.zoom, 'scale', {
        get() {
          return scale;
        },
        set(value) {
          if (scale !== value) {
            const imageEl = gesture.imageEl;
            const slideEl = gesture.slideEl;
            emit('zoomChange', value, imageEl, slideEl);
          }
          scale = value;
        }
      });
      function getDistanceBetweenTouches() {
        if (evCache.length < 2) return 1;
        const x1 = evCache[0].pageX;
        const y1 = evCache[0].pageY;
        const x2 = evCache[1].pageX;
        const y2 = evCache[1].pageY;
        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        return distance;
      }
      function getMaxRatio() {
        const params = swiper.params.zoom;
        const maxRatio = gesture.imageWrapEl.getAttribute('data-swiper-zoom') || params.maxRatio;
        if (params.limitToOriginalSize && gesture.imageEl && gesture.imageEl.naturalWidth) {
          const imageMaxRatio = gesture.imageEl.naturalWidth / gesture.imageEl.offsetWidth;
          return Math.min(imageMaxRatio, maxRatio);
        }
        return maxRatio;
      }
      function getScaleOrigin() {
        if (evCache.length < 2) return {
          x: null,
          y: null
        };
        const box = gesture.imageEl.getBoundingClientRect();
        return [(evCache[0].pageX + (evCache[1].pageX - evCache[0].pageX) / 2 - box.x - window.scrollX) / currentScale, (evCache[0].pageY + (evCache[1].pageY - evCache[0].pageY) / 2 - box.y - window.scrollY) / currentScale];
      }
      function getSlideSelector() {
        return swiper.isElement ? `swiper-slide` : `.${swiper.params.slideClass}`;
      }
      function eventWithinSlide(e) {
        const slideSelector = getSlideSelector();
        if (e.target.matches(slideSelector)) return true;
        if (swiper.slides.filter(slideEl => slideEl.contains(e.target)).length > 0) return true;
        return false;
      }
      function eventWithinZoomContainer(e) {
        const selector = `.${swiper.params.zoom.containerClass}`;
        if (e.target.matches(selector)) return true;
        if ([...swiper.hostEl.querySelectorAll(selector)].filter(containerEl => containerEl.contains(e.target)).length > 0) return true;
        return false;
      }

      // Events
      function onGestureStart(e) {
        if (e.pointerType === 'mouse') {
          evCache.splice(0, evCache.length);
        }
        if (!eventWithinSlide(e)) return;
        const params = swiper.params.zoom;
        fakeGestureTouched = false;
        fakeGestureMoved = false;
        evCache.push(e);
        if (evCache.length < 2) {
          return;
        }
        fakeGestureTouched = true;
        gesture.scaleStart = getDistanceBetweenTouches();
        if (!gesture.slideEl) {
          gesture.slideEl = e.target.closest(`.${swiper.params.slideClass}, swiper-slide`);
          if (!gesture.slideEl) gesture.slideEl = swiper.slides[swiper.activeIndex];
          let imageEl = gesture.slideEl.querySelector(`.${params.containerClass}`);
          if (imageEl) {
            imageEl = imageEl.querySelectorAll('picture, img, svg, canvas, .swiper-zoom-target')[0];
          }
          gesture.imageEl = imageEl;
          if (imageEl) {
            gesture.imageWrapEl = elementParents(gesture.imageEl, `.${params.containerClass}`)[0];
          } else {
            gesture.imageWrapEl = undefined;
          }
          if (!gesture.imageWrapEl) {
            gesture.imageEl = undefined;
            return;
          }
          gesture.maxRatio = getMaxRatio();
        }
        if (gesture.imageEl) {
          const [originX, originY] = getScaleOrigin();
          gesture.originX = originX;
          gesture.originY = originY;
          gesture.imageEl.style.transitionDuration = '0ms';
        }
        isScaling = true;
      }
      function onGestureChange(e) {
        if (!eventWithinSlide(e)) return;
        const params = swiper.params.zoom;
        const zoom = swiper.zoom;
        const pointerIndex = evCache.findIndex(cachedEv => cachedEv.pointerId === e.pointerId);
        if (pointerIndex >= 0) evCache[pointerIndex] = e;
        if (evCache.length < 2) {
          return;
        }
        fakeGestureMoved = true;
        gesture.scaleMove = getDistanceBetweenTouches();
        if (!gesture.imageEl) {
          return;
        }
        zoom.scale = gesture.scaleMove / gesture.scaleStart * currentScale;
        if (zoom.scale > gesture.maxRatio) {
          zoom.scale = gesture.maxRatio - 1 + (zoom.scale - gesture.maxRatio + 1) ** 0.5;
        }
        if (zoom.scale < params.minRatio) {
          zoom.scale = params.minRatio + 1 - (params.minRatio - zoom.scale + 1) ** 0.5;
        }
        gesture.imageEl.style.transform = `translate3d(0,0,0) scale(${zoom.scale})`;
      }
      function onGestureEnd(e) {
        if (!eventWithinSlide(e)) return;
        if (e.pointerType === 'mouse' && e.type === 'pointerout') return;
        const params = swiper.params.zoom;
        const zoom = swiper.zoom;
        const pointerIndex = evCache.findIndex(cachedEv => cachedEv.pointerId === e.pointerId);
        if (pointerIndex >= 0) evCache.splice(pointerIndex, 1);
        if (!fakeGestureTouched || !fakeGestureMoved) {
          return;
        }
        fakeGestureTouched = false;
        fakeGestureMoved = false;
        if (!gesture.imageEl) return;
        zoom.scale = Math.max(Math.min(zoom.scale, gesture.maxRatio), params.minRatio);
        gesture.imageEl.style.transitionDuration = `${swiper.params.speed}ms`;
        gesture.imageEl.style.transform = `translate3d(0,0,0) scale(${zoom.scale})`;
        currentScale = zoom.scale;
        isScaling = false;
        if (zoom.scale > 1 && gesture.slideEl) {
          gesture.slideEl.classList.add(`${params.zoomedSlideClass}`);
        } else if (zoom.scale <= 1 && gesture.slideEl) {
          gesture.slideEl.classList.remove(`${params.zoomedSlideClass}`);
        }
        if (zoom.scale === 1) {
          gesture.originX = 0;
          gesture.originY = 0;
          gesture.slideEl = undefined;
        }
      }
      let allowTouchMoveTimeout;
      function allowTouchMove() {
        swiper.touchEventsData.preventTouchMoveFromPointerMove = false;
      }
      function preventTouchMove() {
        clearTimeout(allowTouchMoveTimeout);
        swiper.touchEventsData.preventTouchMoveFromPointerMove = true;
        allowTouchMoveTimeout = setTimeout(() => {
          if (swiper.destroyed) return;
          allowTouchMove();
        });
      }
      function onTouchStart(e) {
        const device = swiper.device;
        if (!gesture.imageEl) return;
        if (image.isTouched) return;
        if (device.android && e.cancelable) e.preventDefault();
        image.isTouched = true;
        const event = evCache.length > 0 ? evCache[0] : e;
        image.touchesStart.x = event.pageX;
        image.touchesStart.y = event.pageY;
      }
      function onTouchMove(e) {
        const isMouseEvent = e.pointerType === 'mouse';
        const isMousePan = isMouseEvent && swiper.params.zoom.panOnMouseMove;
        if (!eventWithinSlide(e) || !eventWithinZoomContainer(e)) {
          return;
        }
        const zoom = swiper.zoom;
        if (!gesture.imageEl) {
          return;
        }
        if (!image.isTouched || !gesture.slideEl) {
          if (isMousePan) onMouseMove(e);
          return;
        }
        if (isMousePan) {
          onMouseMove(e);
          return;
        }
        if (!image.isMoved) {
          image.width = gesture.imageEl.offsetWidth || gesture.imageEl.clientWidth;
          image.height = gesture.imageEl.offsetHeight || gesture.imageEl.clientHeight;
          image.startX = getTranslate(gesture.imageWrapEl, 'x') || 0;
          image.startY = getTranslate(gesture.imageWrapEl, 'y') || 0;
          gesture.slideWidth = gesture.slideEl.offsetWidth;
          gesture.slideHeight = gesture.slideEl.offsetHeight;
          gesture.imageWrapEl.style.transitionDuration = '0ms';
        }
        // Define if we need image drag
        const scaledWidth = image.width * zoom.scale;
        const scaledHeight = image.height * zoom.scale;
        image.minX = Math.min(gesture.slideWidth / 2 - scaledWidth / 2, 0);
        image.maxX = -image.minX;
        image.minY = Math.min(gesture.slideHeight / 2 - scaledHeight / 2, 0);
        image.maxY = -image.minY;
        image.touchesCurrent.x = evCache.length > 0 ? evCache[0].pageX : e.pageX;
        image.touchesCurrent.y = evCache.length > 0 ? evCache[0].pageY : e.pageY;
        const touchesDiff = Math.max(Math.abs(image.touchesCurrent.x - image.touchesStart.x), Math.abs(image.touchesCurrent.y - image.touchesStart.y));
        if (touchesDiff > 5) {
          swiper.allowClick = false;
        }
        if (!image.isMoved && !isScaling) {
          if (swiper.isHorizontal() && (Math.floor(image.minX) === Math.floor(image.startX) && image.touchesCurrent.x < image.touchesStart.x || Math.floor(image.maxX) === Math.floor(image.startX) && image.touchesCurrent.x > image.touchesStart.x)) {
            image.isTouched = false;
            allowTouchMove();
            return;
          }
          if (!swiper.isHorizontal() && (Math.floor(image.minY) === Math.floor(image.startY) && image.touchesCurrent.y < image.touchesStart.y || Math.floor(image.maxY) === Math.floor(image.startY) && image.touchesCurrent.y > image.touchesStart.y)) {
            image.isTouched = false;
            allowTouchMove();
            return;
          }
        }
        if (e.cancelable) {
          e.preventDefault();
        }
        e.stopPropagation();
        preventTouchMove();
        image.isMoved = true;
        const scaleRatio = (zoom.scale - currentScale) / (gesture.maxRatio - swiper.params.zoom.minRatio);
        const {
          originX,
          originY
        } = gesture;
        image.currentX = image.touchesCurrent.x - image.touchesStart.x + image.startX + scaleRatio * (image.width - originX * 2);
        image.currentY = image.touchesCurrent.y - image.touchesStart.y + image.startY + scaleRatio * (image.height - originY * 2);
        if (image.currentX < image.minX) {
          image.currentX = image.minX + 1 - (image.minX - image.currentX + 1) ** 0.8;
        }
        if (image.currentX > image.maxX) {
          image.currentX = image.maxX - 1 + (image.currentX - image.maxX + 1) ** 0.8;
        }
        if (image.currentY < image.minY) {
          image.currentY = image.minY + 1 - (image.minY - image.currentY + 1) ** 0.8;
        }
        if (image.currentY > image.maxY) {
          image.currentY = image.maxY - 1 + (image.currentY - image.maxY + 1) ** 0.8;
        }

        // Velocity
        if (!velocity.prevPositionX) velocity.prevPositionX = image.touchesCurrent.x;
        if (!velocity.prevPositionY) velocity.prevPositionY = image.touchesCurrent.y;
        if (!velocity.prevTime) velocity.prevTime = Date.now();
        velocity.x = (image.touchesCurrent.x - velocity.prevPositionX) / (Date.now() - velocity.prevTime) / 2;
        velocity.y = (image.touchesCurrent.y - velocity.prevPositionY) / (Date.now() - velocity.prevTime) / 2;
        if (Math.abs(image.touchesCurrent.x - velocity.prevPositionX) < 2) velocity.x = 0;
        if (Math.abs(image.touchesCurrent.y - velocity.prevPositionY) < 2) velocity.y = 0;
        velocity.prevPositionX = image.touchesCurrent.x;
        velocity.prevPositionY = image.touchesCurrent.y;
        velocity.prevTime = Date.now();
        gesture.imageWrapEl.style.transform = `translate3d(${image.currentX}px, ${image.currentY}px,0)`;
      }
      function onTouchEnd() {
        const zoom = swiper.zoom;
        evCache.length = 0;
        if (!gesture.imageEl) return;
        if (!image.isTouched || !image.isMoved) {
          image.isTouched = false;
          image.isMoved = false;
          return;
        }
        image.isTouched = false;
        image.isMoved = false;
        let momentumDurationX = 300;
        let momentumDurationY = 300;
        const momentumDistanceX = velocity.x * momentumDurationX;
        const newPositionX = image.currentX + momentumDistanceX;
        const momentumDistanceY = velocity.y * momentumDurationY;
        const newPositionY = image.currentY + momentumDistanceY;

        // Fix duration
        if (velocity.x !== 0) momentumDurationX = Math.abs((newPositionX - image.currentX) / velocity.x);
        if (velocity.y !== 0) momentumDurationY = Math.abs((newPositionY - image.currentY) / velocity.y);
        const momentumDuration = Math.max(momentumDurationX, momentumDurationY);
        image.currentX = newPositionX;
        image.currentY = newPositionY;
        // Define if we need image drag
        const scaledWidth = image.width * zoom.scale;
        const scaledHeight = image.height * zoom.scale;
        image.minX = Math.min(gesture.slideWidth / 2 - scaledWidth / 2, 0);
        image.maxX = -image.minX;
        image.minY = Math.min(gesture.slideHeight / 2 - scaledHeight / 2, 0);
        image.maxY = -image.minY;
        image.currentX = Math.max(Math.min(image.currentX, image.maxX), image.minX);
        image.currentY = Math.max(Math.min(image.currentY, image.maxY), image.minY);
        gesture.imageWrapEl.style.transitionDuration = `${momentumDuration}ms`;
        gesture.imageWrapEl.style.transform = `translate3d(${image.currentX}px, ${image.currentY}px,0)`;
      }
      function onTransitionEnd() {
        const zoom = swiper.zoom;
        if (gesture.slideEl && swiper.activeIndex !== swiper.slides.indexOf(gesture.slideEl)) {
          if (gesture.imageEl) {
            gesture.imageEl.style.transform = 'translate3d(0,0,0) scale(1)';
          }
          if (gesture.imageWrapEl) {
            gesture.imageWrapEl.style.transform = 'translate3d(0,0,0)';
          }
          gesture.slideEl.classList.remove(`${swiper.params.zoom.zoomedSlideClass}`);
          zoom.scale = 1;
          currentScale = 1;
          gesture.slideEl = undefined;
          gesture.imageEl = undefined;
          gesture.imageWrapEl = undefined;
          gesture.originX = 0;
          gesture.originY = 0;
        }
      }
      function onMouseMove(e) {
        // Only pan if zoomed in and mouse panning is enabled
        if (currentScale <= 1 || !gesture.imageWrapEl) return;
        if (!eventWithinSlide(e) || !eventWithinZoomContainer(e)) return;
        const currentTransform = window.getComputedStyle(gesture.imageWrapEl).transform;
        const matrix = new window.DOMMatrix(currentTransform);
        if (!isPanningWithMouse) {
          isPanningWithMouse = true;
          mousePanStart.x = e.clientX;
          mousePanStart.y = e.clientY;
          image.startX = matrix.e;
          image.startY = matrix.f;
          image.width = gesture.imageEl.offsetWidth || gesture.imageEl.clientWidth;
          image.height = gesture.imageEl.offsetHeight || gesture.imageEl.clientHeight;
          gesture.slideWidth = gesture.slideEl.offsetWidth;
          gesture.slideHeight = gesture.slideEl.offsetHeight;
          return;
        }
        const deltaX = (e.clientX - mousePanStart.x) * mousePanSensitivity;
        const deltaY = (e.clientY - mousePanStart.y) * mousePanSensitivity;
        const scaledWidth = image.width * currentScale;
        const scaledHeight = image.height * currentScale;
        const slideWidth = gesture.slideWidth;
        const slideHeight = gesture.slideHeight;
        const minX = Math.min(slideWidth / 2 - scaledWidth / 2, 0);
        const maxX = -minX;
        const minY = Math.min(slideHeight / 2 - scaledHeight / 2, 0);
        const maxY = -minY;
        const newX = Math.max(Math.min(image.startX + deltaX, maxX), minX);
        const newY = Math.max(Math.min(image.startY + deltaY, maxY), minY);
        gesture.imageWrapEl.style.transitionDuration = '0ms';
        gesture.imageWrapEl.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
        mousePanStart.x = e.clientX;
        mousePanStart.y = e.clientY;
        image.startX = newX;
        image.startY = newY;
        image.currentX = newX;
        image.currentY = newY;
      }
      function zoomIn(e) {
        const zoom = swiper.zoom;
        const params = swiper.params.zoom;
        if (!gesture.slideEl) {
          if (e && e.target) {
            gesture.slideEl = e.target.closest(`.${swiper.params.slideClass}, swiper-slide`);
          }
          if (!gesture.slideEl) {
            if (swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual) {
              gesture.slideEl = elementChildren(swiper.slidesEl, `.${swiper.params.slideActiveClass}`)[0];
            } else {
              gesture.slideEl = swiper.slides[swiper.activeIndex];
            }
          }
          let imageEl = gesture.slideEl.querySelector(`.${params.containerClass}`);
          if (imageEl) {
            imageEl = imageEl.querySelectorAll('picture, img, svg, canvas, .swiper-zoom-target')[0];
          }
          gesture.imageEl = imageEl;
          if (imageEl) {
            gesture.imageWrapEl = elementParents(gesture.imageEl, `.${params.containerClass}`)[0];
          } else {
            gesture.imageWrapEl = undefined;
          }
        }
        if (!gesture.imageEl || !gesture.imageWrapEl) return;
        if (swiper.params.cssMode) {
          swiper.wrapperEl.style.overflow = 'hidden';
          swiper.wrapperEl.style.touchAction = 'none';
        }
        gesture.slideEl.classList.add(`${params.zoomedSlideClass}`);
        let touchX;
        let touchY;
        let offsetX;
        let offsetY;
        let diffX;
        let diffY;
        let translateX;
        let translateY;
        let imageWidth;
        let imageHeight;
        let scaledWidth;
        let scaledHeight;
        let translateMinX;
        let translateMinY;
        let translateMaxX;
        let translateMaxY;
        let slideWidth;
        let slideHeight;
        if (typeof image.touchesStart.x === 'undefined' && e) {
          touchX = e.pageX;
          touchY = e.pageY;
        } else {
          touchX = image.touchesStart.x;
          touchY = image.touchesStart.y;
        }
        const prevScale = currentScale;
        const forceZoomRatio = typeof e === 'number' ? e : null;
        if (currentScale === 1 && forceZoomRatio) {
          touchX = undefined;
          touchY = undefined;
          image.touchesStart.x = undefined;
          image.touchesStart.y = undefined;
        }
        const maxRatio = getMaxRatio();
        zoom.scale = forceZoomRatio || maxRatio;
        currentScale = forceZoomRatio || maxRatio;
        if (e && !(currentScale === 1 && forceZoomRatio)) {
          slideWidth = gesture.slideEl.offsetWidth;
          slideHeight = gesture.slideEl.offsetHeight;
          offsetX = elementOffset(gesture.slideEl).left + window.scrollX;
          offsetY = elementOffset(gesture.slideEl).top + window.scrollY;
          diffX = offsetX + slideWidth / 2 - touchX;
          diffY = offsetY + slideHeight / 2 - touchY;
          imageWidth = gesture.imageEl.offsetWidth || gesture.imageEl.clientWidth;
          imageHeight = gesture.imageEl.offsetHeight || gesture.imageEl.clientHeight;
          scaledWidth = imageWidth * zoom.scale;
          scaledHeight = imageHeight * zoom.scale;
          translateMinX = Math.min(slideWidth / 2 - scaledWidth / 2, 0);
          translateMinY = Math.min(slideHeight / 2 - scaledHeight / 2, 0);
          translateMaxX = -translateMinX;
          translateMaxY = -translateMinY;
          if (prevScale > 0 && forceZoomRatio && typeof image.currentX === 'number' && typeof image.currentY === 'number') {
            translateX = image.currentX * zoom.scale / prevScale;
            translateY = image.currentY * zoom.scale / prevScale;
          } else {
            translateX = diffX * zoom.scale;
            translateY = diffY * zoom.scale;
          }
          if (translateX < translateMinX) {
            translateX = translateMinX;
          }
          if (translateX > translateMaxX) {
            translateX = translateMaxX;
          }
          if (translateY < translateMinY) {
            translateY = translateMinY;
          }
          if (translateY > translateMaxY) {
            translateY = translateMaxY;
          }
        } else {
          translateX = 0;
          translateY = 0;
        }
        if (forceZoomRatio && zoom.scale === 1) {
          gesture.originX = 0;
          gesture.originY = 0;
        }
        image.currentX = translateX;
        image.currentY = translateY;
        gesture.imageWrapEl.style.transitionDuration = '300ms';
        gesture.imageWrapEl.style.transform = `translate3d(${translateX}px, ${translateY}px,0)`;
        gesture.imageEl.style.transitionDuration = '300ms';
        gesture.imageEl.style.transform = `translate3d(0,0,0) scale(${zoom.scale})`;
      }
      function zoomOut() {
        const zoom = swiper.zoom;
        const params = swiper.params.zoom;
        if (!gesture.slideEl) {
          if (swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual) {
            gesture.slideEl = elementChildren(swiper.slidesEl, `.${swiper.params.slideActiveClass}`)[0];
          } else {
            gesture.slideEl = swiper.slides[swiper.activeIndex];
          }
          let imageEl = gesture.slideEl.querySelector(`.${params.containerClass}`);
          if (imageEl) {
            imageEl = imageEl.querySelectorAll('picture, img, svg, canvas, .swiper-zoom-target')[0];
          }
          gesture.imageEl = imageEl;
          if (imageEl) {
            gesture.imageWrapEl = elementParents(gesture.imageEl, `.${params.containerClass}`)[0];
          } else {
            gesture.imageWrapEl = undefined;
          }
        }
        if (!gesture.imageEl || !gesture.imageWrapEl) return;
        if (swiper.params.cssMode) {
          swiper.wrapperEl.style.overflow = '';
          swiper.wrapperEl.style.touchAction = '';
        }
        zoom.scale = 1;
        currentScale = 1;
        image.currentX = undefined;
        image.currentY = undefined;
        image.touchesStart.x = undefined;
        image.touchesStart.y = undefined;
        gesture.imageWrapEl.style.transitionDuration = '300ms';
        gesture.imageWrapEl.style.transform = 'translate3d(0,0,0)';
        gesture.imageEl.style.transitionDuration = '300ms';
        gesture.imageEl.style.transform = 'translate3d(0,0,0) scale(1)';
        gesture.slideEl.classList.remove(`${params.zoomedSlideClass}`);
        gesture.slideEl = undefined;
        gesture.originX = 0;
        gesture.originY = 0;
        if (swiper.params.zoom.panOnMouseMove) {
          mousePanStart = {
            x: 0,
            y: 0
          };
          if (isPanningWithMouse) {
            isPanningWithMouse = false;
            image.startX = 0;
            image.startY = 0;
          }
        }
      }

      // Toggle Zoom
      function zoomToggle(e) {
        const zoom = swiper.zoom;
        if (zoom.scale && zoom.scale !== 1) {
          // Zoom Out
          zoomOut();
        } else {
          // Zoom In
          zoomIn(e);
        }
      }
      function getListeners() {
        const passiveListener = swiper.params.passiveListeners ? {
          passive: true,
          capture: false
        } : false;
        const activeListenerWithCapture = swiper.params.passiveListeners ? {
          passive: false,
          capture: true
        } : true;
        return {
          passiveListener,
          activeListenerWithCapture
        };
      }

      // Attach/Detach Events
      function enable() {
        const zoom = swiper.zoom;
        if (zoom.enabled) return;
        zoom.enabled = true;
        const {
          passiveListener,
          activeListenerWithCapture
        } = getListeners();

        // Scale image
        swiper.wrapperEl.addEventListener('pointerdown', onGestureStart, passiveListener);
        swiper.wrapperEl.addEventListener('pointermove', onGestureChange, activeListenerWithCapture);
        ['pointerup', 'pointercancel', 'pointerout'].forEach(eventName => {
          swiper.wrapperEl.addEventListener(eventName, onGestureEnd, passiveListener);
        });

        // Move image
        swiper.wrapperEl.addEventListener('pointermove', onTouchMove, activeListenerWithCapture);
      }
      function disable() {
        const zoom = swiper.zoom;
        if (!zoom.enabled) return;
        zoom.enabled = false;
        const {
          passiveListener,
          activeListenerWithCapture
        } = getListeners();

        // Scale image
        swiper.wrapperEl.removeEventListener('pointerdown', onGestureStart, passiveListener);
        swiper.wrapperEl.removeEventListener('pointermove', onGestureChange, activeListenerWithCapture);
        ['pointerup', 'pointercancel', 'pointerout'].forEach(eventName => {
          swiper.wrapperEl.removeEventListener(eventName, onGestureEnd, passiveListener);
        });

        // Move image
        swiper.wrapperEl.removeEventListener('pointermove', onTouchMove, activeListenerWithCapture);
      }
      on('init', () => {
        if (swiper.params.zoom.enabled) {
          enable();
        }
      });
      on('destroy', () => {
        disable();
      });
      on('touchStart', (_s, e) => {
        if (!swiper.zoom.enabled) return;
        onTouchStart(e);
      });
      on('touchEnd', (_s, e) => {
        if (!swiper.zoom.enabled) return;
        onTouchEnd();
      });
      on('doubleTap', (_s, e) => {
        if (!swiper.animating && swiper.params.zoom.enabled && swiper.zoom.enabled && swiper.params.zoom.toggle) {
          zoomToggle(e);
        }
      });
      on('transitionEnd', () => {
        if (swiper.zoom.enabled && swiper.params.zoom.enabled) {
          onTransitionEnd();
        }
      });
      on('slideChange', () => {
        if (swiper.zoom.enabled && swiper.params.zoom.enabled && swiper.params.cssMode) {
          onTransitionEnd();
        }
      });
      Object.assign(swiper.zoom, {
        enable,
        disable,
        in: zoomIn,
        out: zoomOut,
        toggle: zoomToggle
      });
    }

    /* eslint no-bitwise: ["error", { "allow": [">>"] }] */
    function Controller(_ref) {
      let {
        swiper,
        extendParams,
        on
      } = _ref;
      extendParams({
        controller: {
          control: undefined,
          inverse: false,
          by: 'slide' // or 'container'
        }
      });

      swiper.controller = {
        control: undefined
      };
      function LinearSpline(x, y) {
        const binarySearch = function search() {
          let maxIndex;
          let minIndex;
          let guess;
          return (array, val) => {
            minIndex = -1;
            maxIndex = array.length;
            while (maxIndex - minIndex > 1) {
              guess = maxIndex + minIndex >> 1;
              if (array[guess] <= val) {
                minIndex = guess;
              } else {
                maxIndex = guess;
              }
            }
            return maxIndex;
          };
        }();
        this.x = x;
        this.y = y;
        this.lastIndex = x.length - 1;
        // Given an x value (x2), return the expected y2 value:
        // (x1,y1) is the known point before given value,
        // (x3,y3) is the known point after given value.
        let i1;
        let i3;
        this.interpolate = function interpolate(x2) {
          if (!x2) return 0;

          // Get the indexes of x1 and x3 (the array indexes before and after given x2):
          i3 = binarySearch(this.x, x2);
          i1 = i3 - 1;

          // We have our indexes i1 & i3, so we can calculate already:
          // y2 := ((x2−x1) × (y3−y1)) ÷ (x3−x1) + y1
          return (x2 - this.x[i1]) * (this.y[i3] - this.y[i1]) / (this.x[i3] - this.x[i1]) + this.y[i1];
        };
        return this;
      }
      function getInterpolateFunction(c) {
        swiper.controller.spline = swiper.params.loop ? new LinearSpline(swiper.slidesGrid, c.slidesGrid) : new LinearSpline(swiper.snapGrid, c.snapGrid);
      }
      function setTranslate(_t, byController) {
        const controlled = swiper.controller.control;
        let multiplier;
        let controlledTranslate;
        const Swiper = swiper.constructor;
        function setControlledTranslate(c) {
          if (c.destroyed) return;

          // this will create an Interpolate function based on the snapGrids
          // x is the Grid of the scrolled scroller and y will be the controlled scroller
          // it makes sense to create this only once and recall it for the interpolation
          // the function does a lot of value caching for performance
          const translate = swiper.rtlTranslate ? -swiper.translate : swiper.translate;
          if (swiper.params.controller.by === 'slide') {
            getInterpolateFunction(c);
            // i am not sure why the values have to be multiplicated this way, tried to invert the snapGrid
            // but it did not work out
            controlledTranslate = -swiper.controller.spline.interpolate(-translate);
          }
          if (!controlledTranslate || swiper.params.controller.by === 'container') {
            multiplier = (c.maxTranslate() - c.minTranslate()) / (swiper.maxTranslate() - swiper.minTranslate());
            if (Number.isNaN(multiplier) || !Number.isFinite(multiplier)) {
              multiplier = 1;
            }
            controlledTranslate = (translate - swiper.minTranslate()) * multiplier + c.minTranslate();
          }
          if (swiper.params.controller.inverse) {
            controlledTranslate = c.maxTranslate() - controlledTranslate;
          }
          c.updateProgress(controlledTranslate);
          c.setTranslate(controlledTranslate, swiper);
          c.updateActiveIndex();
          c.updateSlidesClasses();
        }
        if (Array.isArray(controlled)) {
          for (let i = 0; i < controlled.length; i += 1) {
            if (controlled[i] !== byController && controlled[i] instanceof Swiper) {
              setControlledTranslate(controlled[i]);
            }
          }
        } else if (controlled instanceof Swiper && byController !== controlled) {
          setControlledTranslate(controlled);
        }
      }
      function setTransition(duration, byController) {
        const Swiper = swiper.constructor;
        const controlled = swiper.controller.control;
        let i;
        function setControlledTransition(c) {
          if (c.destroyed) return;
          c.setTransition(duration, swiper);
          if (duration !== 0) {
            c.transitionStart();
            if (c.params.autoHeight) {
              nextTick(() => {
                c.updateAutoHeight();
              });
            }
            elementTransitionEnd(c.wrapperEl, () => {
              if (!controlled) return;
              c.transitionEnd();
            });
          }
        }
        if (Array.isArray(controlled)) {
          for (i = 0; i < controlled.length; i += 1) {
            if (controlled[i] !== byController && controlled[i] instanceof Swiper) {
              setControlledTransition(controlled[i]);
            }
          }
        } else if (controlled instanceof Swiper && byController !== controlled) {
          setControlledTransition(controlled);
        }
      }
      function removeSpline() {
        if (!swiper.controller.control) return;
        if (swiper.controller.spline) {
          swiper.controller.spline = undefined;
          delete swiper.controller.spline;
        }
      }
      on('beforeInit', () => {
        if (typeof window !== 'undefined' && (
        // eslint-disable-line
        typeof swiper.params.controller.control === 'string' || swiper.params.controller.control instanceof HTMLElement)) {
          const controlElements = typeof swiper.params.controller.control === 'string' ? [...document.querySelectorAll(swiper.params.controller.control)] : [swiper.params.controller.control];
          controlElements.forEach(controlElement => {
            if (!swiper.controller.control) swiper.controller.control = [];
            if (controlElement && controlElement.swiper) {
              swiper.controller.control.push(controlElement.swiper);
            } else if (controlElement) {
              const eventName = `${swiper.params.eventsPrefix}init`;
              const onControllerSwiper = e => {
                swiper.controller.control.push(e.detail[0]);
                swiper.update();
                controlElement.removeEventListener(eventName, onControllerSwiper);
              };
              controlElement.addEventListener(eventName, onControllerSwiper);
            }
          });
          return;
        }
        swiper.controller.control = swiper.params.controller.control;
      });
      on('update', () => {
        removeSpline();
      });
      on('resize', () => {
        removeSpline();
      });
      on('observerUpdate', () => {
        removeSpline();
      });
      on('setTranslate', (_s, translate, byController) => {
        if (!swiper.controller.control || swiper.controller.control.destroyed) return;
        swiper.controller.setTranslate(translate, byController);
      });
      on('setTransition', (_s, duration, byController) => {
        if (!swiper.controller.control || swiper.controller.control.destroyed) return;
        swiper.controller.setTransition(duration, byController);
      });
      Object.assign(swiper.controller, {
        setTranslate,
        setTransition
      });
    }

    function A11y(_ref) {
      let {
        swiper,
        extendParams,
        on
      } = _ref;
      extendParams({
        a11y: {
          enabled: true,
          notificationClass: 'swiper-notification',
          prevSlideMessage: 'Previous slide',
          nextSlideMessage: 'Next slide',
          firstSlideMessage: 'This is the first slide',
          lastSlideMessage: 'This is the last slide',
          paginationBulletMessage: 'Go to slide {{index}}',
          slideLabelMessage: '{{index}} / {{slidesLength}}',
          containerMessage: null,
          containerRoleDescriptionMessage: null,
          containerRole: null,
          itemRoleDescriptionMessage: null,
          slideRole: 'group',
          id: null,
          scrollOnFocus: true
        }
      });
      swiper.a11y = {
        clicked: false
      };
      let liveRegion = null;
      let preventFocusHandler;
      let focusTargetSlideEl;
      let visibilityChangedTimestamp = new Date().getTime();
      function notify(message) {
        const notification = liveRegion;
        if (notification.length === 0) return;
        notification.innerHTML = '';
        notification.innerHTML = message;
      }
      function getRandomNumber(size) {
        if (size === void 0) {
          size = 16;
        }
        const randomChar = () => Math.round(16 * Math.random()).toString(16);
        return 'x'.repeat(size).replace(/x/g, randomChar);
      }
      function makeElFocusable(el) {
        el = makeElementsArray(el);
        el.forEach(subEl => {
          subEl.setAttribute('tabIndex', '0');
        });
      }
      function makeElNotFocusable(el) {
        el = makeElementsArray(el);
        el.forEach(subEl => {
          subEl.setAttribute('tabIndex', '-1');
        });
      }
      function addElRole(el, role) {
        el = makeElementsArray(el);
        el.forEach(subEl => {
          subEl.setAttribute('role', role);
        });
      }
      function addElRoleDescription(el, description) {
        el = makeElementsArray(el);
        el.forEach(subEl => {
          subEl.setAttribute('aria-roledescription', description);
        });
      }
      function addElControls(el, controls) {
        el = makeElementsArray(el);
        el.forEach(subEl => {
          subEl.setAttribute('aria-controls', controls);
        });
      }
      function addElLabel(el, label) {
        el = makeElementsArray(el);
        el.forEach(subEl => {
          subEl.setAttribute('aria-label', label);
        });
      }
      function addElId(el, id) {
        el = makeElementsArray(el);
        el.forEach(subEl => {
          subEl.setAttribute('id', id);
        });
      }
      function addElLive(el, live) {
        el = makeElementsArray(el);
        el.forEach(subEl => {
          subEl.setAttribute('aria-live', live);
        });
      }
      function disableEl(el) {
        el = makeElementsArray(el);
        el.forEach(subEl => {
          subEl.setAttribute('aria-disabled', true);
        });
      }
      function enableEl(el) {
        el = makeElementsArray(el);
        el.forEach(subEl => {
          subEl.setAttribute('aria-disabled', false);
        });
      }
      function onEnterOrSpaceKey(e) {
        if (e.keyCode !== 13 && e.keyCode !== 32) return;
        const params = swiper.params.a11y;
        const targetEl = e.target;
        if (swiper.pagination && swiper.pagination.el && (targetEl === swiper.pagination.el || swiper.pagination.el.contains(e.target))) {
          if (!e.target.matches(classesToSelector(swiper.params.pagination.bulletClass))) return;
        }
        if (swiper.navigation && swiper.navigation.prevEl && swiper.navigation.nextEl) {
          const prevEls = makeElementsArray(swiper.navigation.prevEl);
          const nextEls = makeElementsArray(swiper.navigation.nextEl);
          if (nextEls.includes(targetEl)) {
            if (!(swiper.isEnd && !swiper.params.loop)) {
              swiper.slideNext();
            }
            if (swiper.isEnd) {
              notify(params.lastSlideMessage);
            } else {
              notify(params.nextSlideMessage);
            }
          }
          if (prevEls.includes(targetEl)) {
            if (!(swiper.isBeginning && !swiper.params.loop)) {
              swiper.slidePrev();
            }
            if (swiper.isBeginning) {
              notify(params.firstSlideMessage);
            } else {
              notify(params.prevSlideMessage);
            }
          }
        }
        if (swiper.pagination && targetEl.matches(classesToSelector(swiper.params.pagination.bulletClass))) {
          targetEl.click();
        }
      }
      function updateNavigation() {
        if (swiper.params.loop || swiper.params.rewind || !swiper.navigation) return;
        const {
          nextEl,
          prevEl
        } = swiper.navigation;
        if (prevEl) {
          if (swiper.isBeginning) {
            disableEl(prevEl);
            makeElNotFocusable(prevEl);
          } else {
            enableEl(prevEl);
            makeElFocusable(prevEl);
          }
        }
        if (nextEl) {
          if (swiper.isEnd) {
            disableEl(nextEl);
            makeElNotFocusable(nextEl);
          } else {
            enableEl(nextEl);
            makeElFocusable(nextEl);
          }
        }
      }
      function hasPagination() {
        return swiper.pagination && swiper.pagination.bullets && swiper.pagination.bullets.length;
      }
      function hasClickablePagination() {
        return hasPagination() && swiper.params.pagination.clickable;
      }
      function updatePagination() {
        const params = swiper.params.a11y;
        if (!hasPagination()) return;
        swiper.pagination.bullets.forEach(bulletEl => {
          if (swiper.params.pagination.clickable) {
            makeElFocusable(bulletEl);
            if (!swiper.params.pagination.renderBullet) {
              addElRole(bulletEl, 'button');
              addElLabel(bulletEl, params.paginationBulletMessage.replace(/\{\{index\}\}/, elementIndex(bulletEl) + 1));
            }
          }
          if (bulletEl.matches(classesToSelector(swiper.params.pagination.bulletActiveClass))) {
            bulletEl.setAttribute('aria-current', 'true');
          } else {
            bulletEl.removeAttribute('aria-current');
          }
        });
      }
      const initNavEl = (el, wrapperId, message) => {
        makeElFocusable(el);
        if (el.tagName !== 'BUTTON') {
          addElRole(el, 'button');
          el.addEventListener('keydown', onEnterOrSpaceKey);
        }
        addElLabel(el, message);
        addElControls(el, wrapperId);
      };
      const handlePointerDown = e => {
        if (focusTargetSlideEl && focusTargetSlideEl !== e.target && !focusTargetSlideEl.contains(e.target)) {
          preventFocusHandler = true;
        }
        swiper.a11y.clicked = true;
      };
      const handlePointerUp = () => {
        preventFocusHandler = false;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!swiper.destroyed) {
              swiper.a11y.clicked = false;
            }
          });
        });
      };
      const onVisibilityChange = e => {
        visibilityChangedTimestamp = new Date().getTime();
      };
      const handleFocus = e => {
        if (swiper.a11y.clicked || !swiper.params.a11y.scrollOnFocus) return;
        if (new Date().getTime() - visibilityChangedTimestamp < 100) return;
        const slideEl = e.target.closest(`.${swiper.params.slideClass}, swiper-slide`);
        if (!slideEl || !swiper.slides.includes(slideEl)) return;
        focusTargetSlideEl = slideEl;
        const isActive = swiper.slides.indexOf(slideEl) === swiper.activeIndex;
        const isVisible = swiper.params.watchSlidesProgress && swiper.visibleSlides && swiper.visibleSlides.includes(slideEl);
        if (isActive || isVisible) return;
        if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
        if (swiper.isHorizontal()) {
          swiper.el.scrollLeft = 0;
        } else {
          swiper.el.scrollTop = 0;
        }
        requestAnimationFrame(() => {
          if (preventFocusHandler) return;
          if (swiper.params.loop) {
            swiper.slideToLoop(parseInt(slideEl.getAttribute('data-swiper-slide-index')), 0);
          } else {
            swiper.slideTo(swiper.slides.indexOf(slideEl), 0);
          }
          preventFocusHandler = false;
        });
      };
      const initSlides = () => {
        const params = swiper.params.a11y;
        if (params.itemRoleDescriptionMessage) {
          addElRoleDescription(swiper.slides, params.itemRoleDescriptionMessage);
        }
        if (params.slideRole) {
          addElRole(swiper.slides, params.slideRole);
        }
        const slidesLength = swiper.slides.length;
        if (params.slideLabelMessage) {
          swiper.slides.forEach((slideEl, index) => {
            const slideIndex = swiper.params.loop ? parseInt(slideEl.getAttribute('data-swiper-slide-index'), 10) : index;
            const ariaLabelMessage = params.slideLabelMessage.replace(/\{\{index\}\}/, slideIndex + 1).replace(/\{\{slidesLength\}\}/, slidesLength);
            addElLabel(slideEl, ariaLabelMessage);
          });
        }
      };
      const init = () => {
        const params = swiper.params.a11y;
        swiper.el.append(liveRegion);

        // Container
        const containerEl = swiper.el;
        if (params.containerRoleDescriptionMessage) {
          addElRoleDescription(containerEl, params.containerRoleDescriptionMessage);
        }
        if (params.containerMessage) {
          addElLabel(containerEl, params.containerMessage);
        }
        if (params.containerRole) {
          addElRole(containerEl, params.containerRole);
        }

        // Wrapper
        const wrapperEl = swiper.wrapperEl;
        const wrapperId = params.id || wrapperEl.getAttribute('id') || `swiper-wrapper-${getRandomNumber(16)}`;
        const live = swiper.params.autoplay && swiper.params.autoplay.enabled ? 'off' : 'polite';
        addElId(wrapperEl, wrapperId);
        addElLive(wrapperEl, live);

        // Slide
        initSlides();

        // Navigation
        let {
          nextEl,
          prevEl
        } = swiper.navigation ? swiper.navigation : {};
        nextEl = makeElementsArray(nextEl);
        prevEl = makeElementsArray(prevEl);
        if (nextEl) {
          nextEl.forEach(el => initNavEl(el, wrapperId, params.nextSlideMessage));
        }
        if (prevEl) {
          prevEl.forEach(el => initNavEl(el, wrapperId, params.prevSlideMessage));
        }

        // Pagination
        if (hasClickablePagination()) {
          const paginationEl = makeElementsArray(swiper.pagination.el);
          paginationEl.forEach(el => {
            el.addEventListener('keydown', onEnterOrSpaceKey);
          });
        }

        // Tab focus
        const document = getDocument();
        document.addEventListener('visibilitychange', onVisibilityChange);
        swiper.el.addEventListener('focus', handleFocus, true);
        swiper.el.addEventListener('focus', handleFocus, true);
        swiper.el.addEventListener('pointerdown', handlePointerDown, true);
        swiper.el.addEventListener('pointerup', handlePointerUp, true);
      };
      function destroy() {
        if (liveRegion) liveRegion.remove();
        let {
          nextEl,
          prevEl
        } = swiper.navigation ? swiper.navigation : {};
        nextEl = makeElementsArray(nextEl);
        prevEl = makeElementsArray(prevEl);
        if (nextEl) {
          nextEl.forEach(el => el.removeEventListener('keydown', onEnterOrSpaceKey));
        }
        if (prevEl) {
          prevEl.forEach(el => el.removeEventListener('keydown', onEnterOrSpaceKey));
        }

        // Pagination
        if (hasClickablePagination()) {
          const paginationEl = makeElementsArray(swiper.pagination.el);
          paginationEl.forEach(el => {
            el.removeEventListener('keydown', onEnterOrSpaceKey);
          });
        }
        const document = getDocument();
        document.removeEventListener('visibilitychange', onVisibilityChange);
        // Tab focus
        if (swiper.el && typeof swiper.el !== 'string') {
          swiper.el.removeEventListener('focus', handleFocus, true);
          swiper.el.removeEventListener('pointerdown', handlePointerDown, true);
          swiper.el.removeEventListener('pointerup', handlePointerUp, true);
        }
      }
      on('beforeInit', () => {
        liveRegion = createElement('span', swiper.params.a11y.notificationClass);
        liveRegion.setAttribute('aria-live', 'assertive');
        liveRegion.setAttribute('aria-atomic', 'true');
      });
      on('afterInit', () => {
        if (!swiper.params.a11y.enabled) return;
        init();
      });
      on('slidesLengthChange snapGridLengthChange slidesGridLengthChange', () => {
        if (!swiper.params.a11y.enabled) return;
        initSlides();
      });
      on('fromEdge toEdge afterInit lock unlock', () => {
        if (!swiper.params.a11y.enabled) return;
        updateNavigation();
      });
      on('paginationUpdate', () => {
        if (!swiper.params.a11y.enabled) return;
        updatePagination();
      });
      on('destroy', () => {
        if (!swiper.params.a11y.enabled) return;
        destroy();
      });
    }

    function History(_ref) {
      let {
        swiper,
        extendParams,
        on
      } = _ref;
      extendParams({
        history: {
          enabled: false,
          root: '',
          replaceState: false,
          key: 'slides',
          keepQuery: false
        }
      });
      let initialized = false;
      let paths = {};
      const slugify = text => {
        return text.toString().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
      };
      const getPathValues = urlOverride => {
        const window = getWindow();
        let location;
        if (urlOverride) {
          location = new URL(urlOverride);
        } else {
          location = window.location;
        }
        const pathArray = location.pathname.slice(1).split('/').filter(part => part !== '');
        const total = pathArray.length;
        const key = pathArray[total - 2];
        const value = pathArray[total - 1];
        return {
          key,
          value
        };
      };
      const setHistory = (key, index) => {
        const window = getWindow();
        if (!initialized || !swiper.params.history.enabled) return;
        let location;
        if (swiper.params.url) {
          location = new URL(swiper.params.url);
        } else {
          location = window.location;
        }
        const slide = swiper.virtual && swiper.params.virtual.enabled ? swiper.slidesEl.querySelector(`[data-swiper-slide-index="${index}"]`) : swiper.slides[index];
        let value = slugify(slide.getAttribute('data-history'));
        if (swiper.params.history.root.length > 0) {
          let root = swiper.params.history.root;
          if (root[root.length - 1] === '/') root = root.slice(0, root.length - 1);
          value = `${root}/${key ? `${key}/` : ''}${value}`;
        } else if (!location.pathname.includes(key)) {
          value = `${key ? `${key}/` : ''}${value}`;
        }
        if (swiper.params.history.keepQuery) {
          value += location.search;
        }
        const currentState = window.history.state;
        if (currentState && currentState.value === value) {
          return;
        }
        if (swiper.params.history.replaceState) {
          window.history.replaceState({
            value
          }, null, value);
        } else {
          window.history.pushState({
            value
          }, null, value);
        }
      };
      const scrollToSlide = (speed, value, runCallbacks) => {
        if (value) {
          for (let i = 0, length = swiper.slides.length; i < length; i += 1) {
            const slide = swiper.slides[i];
            const slideHistory = slugify(slide.getAttribute('data-history'));
            if (slideHistory === value) {
              const index = swiper.getSlideIndex(slide);
              swiper.slideTo(index, speed, runCallbacks);
            }
          }
        } else {
          swiper.slideTo(0, speed, runCallbacks);
        }
      };
      const setHistoryPopState = () => {
        paths = getPathValues(swiper.params.url);
        scrollToSlide(swiper.params.speed, paths.value, false);
      };
      const init = () => {
        const window = getWindow();
        if (!swiper.params.history) return;
        if (!window.history || !window.history.pushState) {
          swiper.params.history.enabled = false;
          swiper.params.hashNavigation.enabled = true;
          return;
        }
        initialized = true;
        paths = getPathValues(swiper.params.url);
        if (!paths.key && !paths.value) {
          if (!swiper.params.history.replaceState) {
            window.addEventListener('popstate', setHistoryPopState);
          }
          return;
        }
        scrollToSlide(0, paths.value, swiper.params.runCallbacksOnInit);
        if (!swiper.params.history.replaceState) {
          window.addEventListener('popstate', setHistoryPopState);
        }
      };
      const destroy = () => {
        const window = getWindow();
        if (!swiper.params.history.replaceState) {
          window.removeEventListener('popstate', setHistoryPopState);
        }
      };
      on('init', () => {
        if (swiper.params.history.enabled) {
          init();
        }
      });
      on('destroy', () => {
        if (swiper.params.history.enabled) {
          destroy();
        }
      });
      on('transitionEnd _freeModeNoMomentumRelease', () => {
        if (initialized) {
          setHistory(swiper.params.history.key, swiper.activeIndex);
        }
      });
      on('slideChange', () => {
        if (initialized && swiper.params.cssMode) {
          setHistory(swiper.params.history.key, swiper.activeIndex);
        }
      });
    }

    function HashNavigation(_ref) {
      let {
        swiper,
        extendParams,
        emit,
        on
      } = _ref;
      let initialized = false;
      const document = getDocument();
      const window = getWindow();
      extendParams({
        hashNavigation: {
          enabled: false,
          replaceState: false,
          watchState: false,
          getSlideIndex(_s, hash) {
            if (swiper.virtual && swiper.params.virtual.enabled) {
              const slideWithHash = swiper.slides.find(slideEl => slideEl.getAttribute('data-hash') === hash);
              if (!slideWithHash) return 0;
              const index = parseInt(slideWithHash.getAttribute('data-swiper-slide-index'), 10);
              return index;
            }
            return swiper.getSlideIndex(elementChildren(swiper.slidesEl, `.${swiper.params.slideClass}[data-hash="${hash}"], swiper-slide[data-hash="${hash}"]`)[0]);
          }
        }
      });
      const onHashChange = () => {
        emit('hashChange');
        const newHash = document.location.hash.replace('#', '');
        const activeSlideEl = swiper.virtual && swiper.params.virtual.enabled ? swiper.slidesEl.querySelector(`[data-swiper-slide-index="${swiper.activeIndex}"]`) : swiper.slides[swiper.activeIndex];
        const activeSlideHash = activeSlideEl ? activeSlideEl.getAttribute('data-hash') : '';
        if (newHash !== activeSlideHash) {
          const newIndex = swiper.params.hashNavigation.getSlideIndex(swiper, newHash);
          if (typeof newIndex === 'undefined' || Number.isNaN(newIndex)) return;
          swiper.slideTo(newIndex);
        }
      };
      const setHash = () => {
        if (!initialized || !swiper.params.hashNavigation.enabled) return;
        const activeSlideEl = swiper.virtual && swiper.params.virtual.enabled ? swiper.slidesEl.querySelector(`[data-swiper-slide-index="${swiper.activeIndex}"]`) : swiper.slides[swiper.activeIndex];
        const activeSlideHash = activeSlideEl ? activeSlideEl.getAttribute('data-hash') || activeSlideEl.getAttribute('data-history') : '';
        if (swiper.params.hashNavigation.replaceState && window.history && window.history.replaceState) {
          window.history.replaceState(null, null, `#${activeSlideHash}` || '');
          emit('hashSet');
        } else {
          document.location.hash = activeSlideHash || '';
          emit('hashSet');
        }
      };
      const init = () => {
        if (!swiper.params.hashNavigation.enabled || swiper.params.history && swiper.params.history.enabled) return;
        initialized = true;
        const hash = document.location.hash.replace('#', '');
        if (hash) {
          const speed = 0;
          const index = swiper.params.hashNavigation.getSlideIndex(swiper, hash);
          swiper.slideTo(index || 0, speed, swiper.params.runCallbacksOnInit, true);
        }
        if (swiper.params.hashNavigation.watchState) {
          window.addEventListener('hashchange', onHashChange);
        }
      };
      const destroy = () => {
        if (swiper.params.hashNavigation.watchState) {
          window.removeEventListener('hashchange', onHashChange);
        }
      };
      on('init', () => {
        if (swiper.params.hashNavigation.enabled) {
          init();
        }
      });
      on('destroy', () => {
        if (swiper.params.hashNavigation.enabled) {
          destroy();
        }
      });
      on('transitionEnd _freeModeNoMomentumRelease', () => {
        if (initialized) {
          setHash();
        }
      });
      on('slideChange', () => {
        if (initialized && swiper.params.cssMode) {
          setHash();
        }
      });
    }

    /* eslint no-underscore-dangle: "off" */
    /* eslint no-use-before-define: "off" */
    function Autoplay(_ref) {
      let {
        swiper,
        extendParams,
        on,
        emit,
        params
      } = _ref;
      swiper.autoplay = {
        running: false,
        paused: false,
        timeLeft: 0
      };
      extendParams({
        autoplay: {
          enabled: false,
          delay: 3000,
          waitForTransition: true,
          disableOnInteraction: false,
          stopOnLastSlide: false,
          reverseDirection: false,
          pauseOnMouseEnter: false
        }
      });
      let timeout;
      let raf;
      let autoplayDelayTotal = params && params.autoplay ? params.autoplay.delay : 3000;
      let autoplayDelayCurrent = params && params.autoplay ? params.autoplay.delay : 3000;
      let autoplayTimeLeft;
      let autoplayStartTime = new Date().getTime();
      let wasPaused;
      let isTouched;
      let pausedByTouch;
      let touchStartTimeout;
      let slideChanged;
      let pausedByInteraction;
      let pausedByPointerEnter;
      function onTransitionEnd(e) {
        if (!swiper || swiper.destroyed || !swiper.wrapperEl) return;
        if (e.target !== swiper.wrapperEl) return;
        swiper.wrapperEl.removeEventListener('transitionend', onTransitionEnd);
        if (pausedByPointerEnter || e.detail && e.detail.bySwiperTouchMove) {
          return;
        }
        resume();
      }
      const calcTimeLeft = () => {
        if (swiper.destroyed || !swiper.autoplay.running) return;
        if (swiper.autoplay.paused) {
          wasPaused = true;
        } else if (wasPaused) {
          autoplayDelayCurrent = autoplayTimeLeft;
          wasPaused = false;
        }
        const timeLeft = swiper.autoplay.paused ? autoplayTimeLeft : autoplayStartTime + autoplayDelayCurrent - new Date().getTime();
        swiper.autoplay.timeLeft = timeLeft;
        emit('autoplayTimeLeft', timeLeft, timeLeft / autoplayDelayTotal);
        raf = requestAnimationFrame(() => {
          calcTimeLeft();
        });
      };
      const getSlideDelay = () => {
        let activeSlideEl;
        if (swiper.virtual && swiper.params.virtual.enabled) {
          activeSlideEl = swiper.slides.find(slideEl => slideEl.classList.contains('swiper-slide-active'));
        } else {
          activeSlideEl = swiper.slides[swiper.activeIndex];
        }
        if (!activeSlideEl) return undefined;
        const currentSlideDelay = parseInt(activeSlideEl.getAttribute('data-swiper-autoplay'), 10);
        return currentSlideDelay;
      };
      const run = delayForce => {
        if (swiper.destroyed || !swiper.autoplay.running) return;
        cancelAnimationFrame(raf);
        calcTimeLeft();
        let delay = typeof delayForce === 'undefined' ? swiper.params.autoplay.delay : delayForce;
        autoplayDelayTotal = swiper.params.autoplay.delay;
        autoplayDelayCurrent = swiper.params.autoplay.delay;
        const currentSlideDelay = getSlideDelay();
        if (!Number.isNaN(currentSlideDelay) && currentSlideDelay > 0 && typeof delayForce === 'undefined') {
          delay = currentSlideDelay;
          autoplayDelayTotal = currentSlideDelay;
          autoplayDelayCurrent = currentSlideDelay;
        }
        autoplayTimeLeft = delay;
        const speed = swiper.params.speed;
        const proceed = () => {
          if (!swiper || swiper.destroyed) return;
          if (swiper.params.autoplay.reverseDirection) {
            if (!swiper.isBeginning || swiper.params.loop || swiper.params.rewind) {
              swiper.slidePrev(speed, true, true);
              emit('autoplay');
            } else if (!swiper.params.autoplay.stopOnLastSlide) {
              swiper.slideTo(swiper.slides.length - 1, speed, true, true);
              emit('autoplay');
            }
          } else {
            if (!swiper.isEnd || swiper.params.loop || swiper.params.rewind) {
              swiper.slideNext(speed, true, true);
              emit('autoplay');
            } else if (!swiper.params.autoplay.stopOnLastSlide) {
              swiper.slideTo(0, speed, true, true);
              emit('autoplay');
            }
          }
          if (swiper.params.cssMode) {
            autoplayStartTime = new Date().getTime();
            requestAnimationFrame(() => {
              run();
            });
          }
        };
        if (delay > 0) {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            proceed();
          }, delay);
        } else {
          requestAnimationFrame(() => {
            proceed();
          });
        }

        // eslint-disable-next-line
        return delay;
      };
      const start = () => {
        autoplayStartTime = new Date().getTime();
        swiper.autoplay.running = true;
        run();
        emit('autoplayStart');
      };
      const stop = () => {
        swiper.autoplay.running = false;
        clearTimeout(timeout);
        cancelAnimationFrame(raf);
        emit('autoplayStop');
      };
      const pause = (internal, reset) => {
        if (swiper.destroyed || !swiper.autoplay.running) return;
        clearTimeout(timeout);
        if (!internal) {
          pausedByInteraction = true;
        }
        const proceed = () => {
          emit('autoplayPause');
          if (swiper.params.autoplay.waitForTransition) {
            swiper.wrapperEl.addEventListener('transitionend', onTransitionEnd);
          } else {
            resume();
          }
        };
        swiper.autoplay.paused = true;
        if (reset) {
          if (slideChanged) {
            autoplayTimeLeft = swiper.params.autoplay.delay;
          }
          slideChanged = false;
          proceed();
          return;
        }
        const delay = autoplayTimeLeft || swiper.params.autoplay.delay;
        autoplayTimeLeft = delay - (new Date().getTime() - autoplayStartTime);
        if (swiper.isEnd && autoplayTimeLeft < 0 && !swiper.params.loop) return;
        if (autoplayTimeLeft < 0) autoplayTimeLeft = 0;
        proceed();
      };
      const resume = () => {
        if (swiper.isEnd && autoplayTimeLeft < 0 && !swiper.params.loop || swiper.destroyed || !swiper.autoplay.running) return;
        autoplayStartTime = new Date().getTime();
        if (pausedByInteraction) {
          pausedByInteraction = false;
          run(autoplayTimeLeft);
        } else {
          run();
        }
        swiper.autoplay.paused = false;
        emit('autoplayResume');
      };
      const onVisibilityChange = () => {
        if (swiper.destroyed || !swiper.autoplay.running) return;
        const document = getDocument();
        if (document.visibilityState === 'hidden') {
          pausedByInteraction = true;
          pause(true);
        }
        if (document.visibilityState === 'visible') {
          resume();
        }
      };
      const onPointerEnter = e => {
        if (e.pointerType !== 'mouse') return;
        pausedByInteraction = true;
        pausedByPointerEnter = true;
        if (swiper.animating || swiper.autoplay.paused) return;
        pause(true);
      };
      const onPointerLeave = e => {
        if (e.pointerType !== 'mouse') return;
        pausedByPointerEnter = false;
        if (swiper.autoplay.paused) {
          resume();
        }
      };
      const attachMouseEvents = () => {
        if (swiper.params.autoplay.pauseOnMouseEnter) {
          swiper.el.addEventListener('pointerenter', onPointerEnter);
          swiper.el.addEventListener('pointerleave', onPointerLeave);
        }
      };
      const detachMouseEvents = () => {
        if (swiper.el && typeof swiper.el !== 'string') {
          swiper.el.removeEventListener('pointerenter', onPointerEnter);
          swiper.el.removeEventListener('pointerleave', onPointerLeave);
        }
      };
      const attachDocumentEvents = () => {
        const document = getDocument();
        document.addEventListener('visibilitychange', onVisibilityChange);
      };
      const detachDocumentEvents = () => {
        const document = getDocument();
        document.removeEventListener('visibilitychange', onVisibilityChange);
      };
      on('init', () => {
        if (swiper.params.autoplay.enabled) {
          attachMouseEvents();
          attachDocumentEvents();
          start();
        }
      });
      on('destroy', () => {
        detachMouseEvents();
        detachDocumentEvents();
        if (swiper.autoplay.running) {
          stop();
        }
      });
      on('_freeModeStaticRelease', () => {
        if (pausedByTouch || pausedByInteraction) {
          resume();
        }
      });
      on('_freeModeNoMomentumRelease', () => {
        if (!swiper.params.autoplay.disableOnInteraction) {
          pause(true, true);
        } else {
          stop();
        }
      });
      on('beforeTransitionStart', (_s, speed, internal) => {
        if (swiper.destroyed || !swiper.autoplay.running) return;
        if (internal || !swiper.params.autoplay.disableOnInteraction) {
          pause(true, true);
        } else {
          stop();
        }
      });
      on('sliderFirstMove', () => {
        if (swiper.destroyed || !swiper.autoplay.running) return;
        if (swiper.params.autoplay.disableOnInteraction) {
          stop();
          return;
        }
        isTouched = true;
        pausedByTouch = false;
        pausedByInteraction = false;
        touchStartTimeout = setTimeout(() => {
          pausedByInteraction = true;
          pausedByTouch = true;
          pause(true);
        }, 200);
      });
      on('touchEnd', () => {
        if (swiper.destroyed || !swiper.autoplay.running || !isTouched) return;
        clearTimeout(touchStartTimeout);
        clearTimeout(timeout);
        if (swiper.params.autoplay.disableOnInteraction) {
          pausedByTouch = false;
          isTouched = false;
          return;
        }
        if (pausedByTouch && swiper.params.cssMode) resume();
        pausedByTouch = false;
        isTouched = false;
      });
      on('slideChange', () => {
        if (swiper.destroyed || !swiper.autoplay.running) return;
        slideChanged = true;
      });
      Object.assign(swiper.autoplay, {
        start,
        stop,
        pause,
        resume
      });
    }

    function Thumb(_ref) {
      let {
        swiper,
        extendParams,
        on
      } = _ref;
      extendParams({
        thumbs: {
          swiper: null,
          multipleActiveThumbs: true,
          autoScrollOffset: 0,
          slideThumbActiveClass: 'swiper-slide-thumb-active',
          thumbsContainerClass: 'swiper-thumbs'
        }
      });
      let initialized = false;
      let swiperCreated = false;
      swiper.thumbs = {
        swiper: null
      };
      function onThumbClick() {
        const thumbsSwiper = swiper.thumbs.swiper;
        if (!thumbsSwiper || thumbsSwiper.destroyed) return;
        const clickedIndex = thumbsSwiper.clickedIndex;
        const clickedSlide = thumbsSwiper.clickedSlide;
        if (clickedSlide && clickedSlide.classList.contains(swiper.params.thumbs.slideThumbActiveClass)) return;
        if (typeof clickedIndex === 'undefined' || clickedIndex === null) return;
        let slideToIndex;
        if (thumbsSwiper.params.loop) {
          slideToIndex = parseInt(thumbsSwiper.clickedSlide.getAttribute('data-swiper-slide-index'), 10);
        } else {
          slideToIndex = clickedIndex;
        }
        if (swiper.params.loop) {
          swiper.slideToLoop(slideToIndex);
        } else {
          swiper.slideTo(slideToIndex);
        }
      }
      function init() {
        const {
          thumbs: thumbsParams
        } = swiper.params;
        if (initialized) return false;
        initialized = true;
        const SwiperClass = swiper.constructor;
        if (thumbsParams.swiper instanceof SwiperClass) {
          if (thumbsParams.swiper.destroyed) {
            initialized = false;
            return false;
          }
          swiper.thumbs.swiper = thumbsParams.swiper;
          Object.assign(swiper.thumbs.swiper.originalParams, {
            watchSlidesProgress: true,
            slideToClickedSlide: false
          });
          Object.assign(swiper.thumbs.swiper.params, {
            watchSlidesProgress: true,
            slideToClickedSlide: false
          });
          swiper.thumbs.swiper.update();
        } else if (isObject$1(thumbsParams.swiper)) {
          const thumbsSwiperParams = Object.assign({}, thumbsParams.swiper);
          Object.assign(thumbsSwiperParams, {
            watchSlidesProgress: true,
            slideToClickedSlide: false
          });
          swiper.thumbs.swiper = new SwiperClass(thumbsSwiperParams);
          swiperCreated = true;
        }
        swiper.thumbs.swiper.el.classList.add(swiper.params.thumbs.thumbsContainerClass);
        swiper.thumbs.swiper.on('tap', onThumbClick);
        return true;
      }
      function update(initial) {
        const thumbsSwiper = swiper.thumbs.swiper;
        if (!thumbsSwiper || thumbsSwiper.destroyed) return;
        const slidesPerView = thumbsSwiper.params.slidesPerView === 'auto' ? thumbsSwiper.slidesPerViewDynamic() : thumbsSwiper.params.slidesPerView;

        // Activate thumbs
        let thumbsToActivate = 1;
        const thumbActiveClass = swiper.params.thumbs.slideThumbActiveClass;
        if (swiper.params.slidesPerView > 1 && !swiper.params.centeredSlides) {
          thumbsToActivate = swiper.params.slidesPerView;
        }
        if (!swiper.params.thumbs.multipleActiveThumbs) {
          thumbsToActivate = 1;
        }
        thumbsToActivate = Math.floor(thumbsToActivate);
        thumbsSwiper.slides.forEach(slideEl => slideEl.classList.remove(thumbActiveClass));
        if (thumbsSwiper.params.loop || thumbsSwiper.params.virtual && thumbsSwiper.params.virtual.enabled) {
          for (let i = 0; i < thumbsToActivate; i += 1) {
            elementChildren(thumbsSwiper.slidesEl, `[data-swiper-slide-index="${swiper.realIndex + i}"]`).forEach(slideEl => {
              slideEl.classList.add(thumbActiveClass);
            });
          }
        } else {
          for (let i = 0; i < thumbsToActivate; i += 1) {
            if (thumbsSwiper.slides[swiper.realIndex + i]) {
              thumbsSwiper.slides[swiper.realIndex + i].classList.add(thumbActiveClass);
            }
          }
        }
        const autoScrollOffset = swiper.params.thumbs.autoScrollOffset;
        const useOffset = autoScrollOffset && !thumbsSwiper.params.loop;
        if (swiper.realIndex !== thumbsSwiper.realIndex || useOffset) {
          const currentThumbsIndex = thumbsSwiper.activeIndex;
          let newThumbsIndex;
          let direction;
          if (thumbsSwiper.params.loop) {
            const newThumbsSlide = thumbsSwiper.slides.find(slideEl => slideEl.getAttribute('data-swiper-slide-index') === `${swiper.realIndex}`);
            newThumbsIndex = thumbsSwiper.slides.indexOf(newThumbsSlide);
            direction = swiper.activeIndex > swiper.previousIndex ? 'next' : 'prev';
          } else {
            newThumbsIndex = swiper.realIndex;
            direction = newThumbsIndex > swiper.previousIndex ? 'next' : 'prev';
          }
          if (useOffset) {
            newThumbsIndex += direction === 'next' ? autoScrollOffset : -1 * autoScrollOffset;
          }
          if (thumbsSwiper.visibleSlidesIndexes && thumbsSwiper.visibleSlidesIndexes.indexOf(newThumbsIndex) < 0) {
            if (thumbsSwiper.params.centeredSlides) {
              if (newThumbsIndex > currentThumbsIndex) {
                newThumbsIndex = newThumbsIndex - Math.floor(slidesPerView / 2) + 1;
              } else {
                newThumbsIndex = newThumbsIndex + Math.floor(slidesPerView / 2) - 1;
              }
            } else if (newThumbsIndex > currentThumbsIndex && thumbsSwiper.params.slidesPerGroup === 1) ;
            thumbsSwiper.slideTo(newThumbsIndex, initial ? 0 : undefined);
          }
        }
      }
      on('beforeInit', () => {
        const {
          thumbs
        } = swiper.params;
        if (!thumbs || !thumbs.swiper) return;
        if (typeof thumbs.swiper === 'string' || thumbs.swiper instanceof HTMLElement) {
          const document = getDocument();
          const getThumbsElementAndInit = () => {
            const thumbsElement = typeof thumbs.swiper === 'string' ? document.querySelector(thumbs.swiper) : thumbs.swiper;
            if (thumbsElement && thumbsElement.swiper) {
              thumbs.swiper = thumbsElement.swiper;
              init();
              update(true);
            } else if (thumbsElement) {
              const eventName = `${swiper.params.eventsPrefix}init`;
              const onThumbsSwiper = e => {
                thumbs.swiper = e.detail[0];
                thumbsElement.removeEventListener(eventName, onThumbsSwiper);
                init();
                update(true);
                thumbs.swiper.update();
                swiper.update();
              };
              thumbsElement.addEventListener(eventName, onThumbsSwiper);
            }
            return thumbsElement;
          };
          const watchForThumbsToAppear = () => {
            if (swiper.destroyed) return;
            const thumbsElement = getThumbsElementAndInit();
            if (!thumbsElement) {
              requestAnimationFrame(watchForThumbsToAppear);
            }
          };
          requestAnimationFrame(watchForThumbsToAppear);
        } else {
          init();
          update(true);
        }
      });
      on('slideChange update resize observerUpdate', () => {
        update();
      });
      on('setTransition', (_s, duration) => {
        const thumbsSwiper = swiper.thumbs.swiper;
        if (!thumbsSwiper || thumbsSwiper.destroyed) return;
        thumbsSwiper.setTransition(duration);
      });
      on('beforeDestroy', () => {
        const thumbsSwiper = swiper.thumbs.swiper;
        if (!thumbsSwiper || thumbsSwiper.destroyed) return;
        if (swiperCreated) {
          thumbsSwiper.destroy();
        }
      });
      Object.assign(swiper.thumbs, {
        init,
        update
      });
    }

    function freeMode(_ref) {
      let {
        swiper,
        extendParams,
        emit,
        once
      } = _ref;
      extendParams({
        freeMode: {
          enabled: false,
          momentum: true,
          momentumRatio: 1,
          momentumBounce: true,
          momentumBounceRatio: 1,
          momentumVelocityRatio: 1,
          sticky: false,
          minimumVelocity: 0.02
        }
      });
      function onTouchStart() {
        if (swiper.params.cssMode) return;
        const translate = swiper.getTranslate();
        swiper.setTranslate(translate);
        swiper.setTransition(0);
        swiper.touchEventsData.velocities.length = 0;
        swiper.freeMode.onTouchEnd({
          currentPos: swiper.rtl ? swiper.translate : -swiper.translate
        });
      }
      function onTouchMove() {
        if (swiper.params.cssMode) return;
        const {
          touchEventsData: data,
          touches
        } = swiper;
        // Velocity
        if (data.velocities.length === 0) {
          data.velocities.push({
            position: touches[swiper.isHorizontal() ? 'startX' : 'startY'],
            time: data.touchStartTime
          });
        }
        data.velocities.push({
          position: touches[swiper.isHorizontal() ? 'currentX' : 'currentY'],
          time: now()
        });
      }
      function onTouchEnd(_ref2) {
        let {
          currentPos
        } = _ref2;
        if (swiper.params.cssMode) return;
        const {
          params,
          wrapperEl,
          rtlTranslate: rtl,
          snapGrid,
          touchEventsData: data
        } = swiper;
        // Time diff
        const touchEndTime = now();
        const timeDiff = touchEndTime - data.touchStartTime;
        if (currentPos < -swiper.minTranslate()) {
          swiper.slideTo(swiper.activeIndex);
          return;
        }
        if (currentPos > -swiper.maxTranslate()) {
          if (swiper.slides.length < snapGrid.length) {
            swiper.slideTo(snapGrid.length - 1);
          } else {
            swiper.slideTo(swiper.slides.length - 1);
          }
          return;
        }
        if (params.freeMode.momentum) {
          if (data.velocities.length > 1) {
            const lastMoveEvent = data.velocities.pop();
            const velocityEvent = data.velocities.pop();
            const distance = lastMoveEvent.position - velocityEvent.position;
            const time = lastMoveEvent.time - velocityEvent.time;
            swiper.velocity = distance / time;
            swiper.velocity /= 2;
            if (Math.abs(swiper.velocity) < params.freeMode.minimumVelocity) {
              swiper.velocity = 0;
            }
            // this implies that the user stopped moving a finger then released.
            // There would be no events with distance zero, so the last event is stale.
            if (time > 150 || now() - lastMoveEvent.time > 300) {
              swiper.velocity = 0;
            }
          } else {
            swiper.velocity = 0;
          }
          swiper.velocity *= params.freeMode.momentumVelocityRatio;
          data.velocities.length = 0;
          let momentumDuration = 1000 * params.freeMode.momentumRatio;
          const momentumDistance = swiper.velocity * momentumDuration;
          let newPosition = swiper.translate + momentumDistance;
          if (rtl) newPosition = -newPosition;
          let doBounce = false;
          let afterBouncePosition;
          const bounceAmount = Math.abs(swiper.velocity) * 20 * params.freeMode.momentumBounceRatio;
          let needsLoopFix;
          if (newPosition < swiper.maxTranslate()) {
            if (params.freeMode.momentumBounce) {
              if (newPosition + swiper.maxTranslate() < -bounceAmount) {
                newPosition = swiper.maxTranslate() - bounceAmount;
              }
              afterBouncePosition = swiper.maxTranslate();
              doBounce = true;
              data.allowMomentumBounce = true;
            } else {
              newPosition = swiper.maxTranslate();
            }
            if (params.loop && params.centeredSlides) needsLoopFix = true;
          } else if (newPosition > swiper.minTranslate()) {
            if (params.freeMode.momentumBounce) {
              if (newPosition - swiper.minTranslate() > bounceAmount) {
                newPosition = swiper.minTranslate() + bounceAmount;
              }
              afterBouncePosition = swiper.minTranslate();
              doBounce = true;
              data.allowMomentumBounce = true;
            } else {
              newPosition = swiper.minTranslate();
            }
            if (params.loop && params.centeredSlides) needsLoopFix = true;
          } else if (params.freeMode.sticky) {
            let nextSlide;
            for (let j = 0; j < snapGrid.length; j += 1) {
              if (snapGrid[j] > -newPosition) {
                nextSlide = j;
                break;
              }
            }
            if (Math.abs(snapGrid[nextSlide] - newPosition) < Math.abs(snapGrid[nextSlide - 1] - newPosition) || swiper.swipeDirection === 'next') {
              newPosition = snapGrid[nextSlide];
            } else {
              newPosition = snapGrid[nextSlide - 1];
            }
            newPosition = -newPosition;
          }
          if (needsLoopFix) {
            once('transitionEnd', () => {
              swiper.loopFix();
            });
          }
          // Fix duration
          if (swiper.velocity !== 0) {
            if (rtl) {
              momentumDuration = Math.abs((-newPosition - swiper.translate) / swiper.velocity);
            } else {
              momentumDuration = Math.abs((newPosition - swiper.translate) / swiper.velocity);
            }
            if (params.freeMode.sticky) {
              // If freeMode.sticky is active and the user ends a swipe with a slow-velocity
              // event, then durations can be 20+ seconds to slide one (or zero!) slides.
              // It's easy to see this when simulating touch with mouse events. To fix this,
              // limit single-slide swipes to the default slide duration. This also has the
              // nice side effect of matching slide speed if the user stopped moving before
              // lifting finger or mouse vs. moving slowly before lifting the finger/mouse.
              // For faster swipes, also apply limits (albeit higher ones).
              const moveDistance = Math.abs((rtl ? -newPosition : newPosition) - swiper.translate);
              const currentSlideSize = swiper.slidesSizesGrid[swiper.activeIndex];
              if (moveDistance < currentSlideSize) {
                momentumDuration = params.speed;
              } else if (moveDistance < 2 * currentSlideSize) {
                momentumDuration = params.speed * 1.5;
              } else {
                momentumDuration = params.speed * 2.5;
              }
            }
          } else if (params.freeMode.sticky) {
            swiper.slideToClosest();
            return;
          }
          if (params.freeMode.momentumBounce && doBounce) {
            swiper.updateProgress(afterBouncePosition);
            swiper.setTransition(momentumDuration);
            swiper.setTranslate(newPosition);
            swiper.transitionStart(true, swiper.swipeDirection);
            swiper.animating = true;
            elementTransitionEnd(wrapperEl, () => {
              if (!swiper || swiper.destroyed || !data.allowMomentumBounce) return;
              emit('momentumBounce');
              swiper.setTransition(params.speed);
              setTimeout(() => {
                swiper.setTranslate(afterBouncePosition);
                elementTransitionEnd(wrapperEl, () => {
                  if (!swiper || swiper.destroyed) return;
                  swiper.transitionEnd();
                });
              }, 0);
            });
          } else if (swiper.velocity) {
            emit('_freeModeNoMomentumRelease');
            swiper.updateProgress(newPosition);
            swiper.setTransition(momentumDuration);
            swiper.setTranslate(newPosition);
            swiper.transitionStart(true, swiper.swipeDirection);
            if (!swiper.animating) {
              swiper.animating = true;
              elementTransitionEnd(wrapperEl, () => {
                if (!swiper || swiper.destroyed) return;
                swiper.transitionEnd();
              });
            }
          } else {
            swiper.updateProgress(newPosition);
          }
          swiper.updateActiveIndex();
          swiper.updateSlidesClasses();
        } else if (params.freeMode.sticky) {
          swiper.slideToClosest();
          return;
        } else if (params.freeMode) {
          emit('_freeModeNoMomentumRelease');
        }
        if (!params.freeMode.momentum || timeDiff >= params.longSwipesMs) {
          emit('_freeModeStaticRelease');
          swiper.updateProgress();
          swiper.updateActiveIndex();
          swiper.updateSlidesClasses();
        }
      }
      Object.assign(swiper, {
        freeMode: {
          onTouchStart,
          onTouchMove,
          onTouchEnd
        }
      });
    }

    function Grid(_ref) {
      let {
        swiper,
        extendParams,
        on
      } = _ref;
      extendParams({
        grid: {
          rows: 1,
          fill: 'column'
        }
      });
      let slidesNumberEvenToRows;
      let slidesPerRow;
      let numFullColumns;
      let wasMultiRow;
      const getSpaceBetween = () => {
        let spaceBetween = swiper.params.spaceBetween;
        if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
          spaceBetween = parseFloat(spaceBetween.replace('%', '')) / 100 * swiper.size;
        } else if (typeof spaceBetween === 'string') {
          spaceBetween = parseFloat(spaceBetween);
        }
        return spaceBetween;
      };
      const initSlides = slides => {
        const {
          slidesPerView
        } = swiper.params;
        const {
          rows,
          fill
        } = swiper.params.grid;
        const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : slides.length;
        numFullColumns = Math.floor(slidesLength / rows);
        if (Math.floor(slidesLength / rows) === slidesLength / rows) {
          slidesNumberEvenToRows = slidesLength;
        } else {
          slidesNumberEvenToRows = Math.ceil(slidesLength / rows) * rows;
        }
        if (slidesPerView !== 'auto' && fill === 'row') {
          slidesNumberEvenToRows = Math.max(slidesNumberEvenToRows, slidesPerView * rows);
        }
        slidesPerRow = slidesNumberEvenToRows / rows;
      };
      const unsetSlides = () => {
        if (swiper.slides) {
          swiper.slides.forEach(slide => {
            if (slide.swiperSlideGridSet) {
              slide.style.height = '';
              slide.style[swiper.getDirectionLabel('margin-top')] = '';
            }
          });
        }
      };
      const updateSlide = (i, slide, slides) => {
        const {
          slidesPerGroup
        } = swiper.params;
        const spaceBetween = getSpaceBetween();
        const {
          rows,
          fill
        } = swiper.params.grid;
        const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : slides.length;
        // Set slides order
        let newSlideOrderIndex;
        let column;
        let row;
        if (fill === 'row' && slidesPerGroup > 1) {
          const groupIndex = Math.floor(i / (slidesPerGroup * rows));
          const slideIndexInGroup = i - rows * slidesPerGroup * groupIndex;
          const columnsInGroup = groupIndex === 0 ? slidesPerGroup : Math.min(Math.ceil((slidesLength - groupIndex * rows * slidesPerGroup) / rows), slidesPerGroup);
          row = Math.floor(slideIndexInGroup / columnsInGroup);
          column = slideIndexInGroup - row * columnsInGroup + groupIndex * slidesPerGroup;
          newSlideOrderIndex = column + row * slidesNumberEvenToRows / rows;
          slide.style.order = newSlideOrderIndex;
        } else if (fill === 'column') {
          column = Math.floor(i / rows);
          row = i - column * rows;
          if (column > numFullColumns || column === numFullColumns && row === rows - 1) {
            row += 1;
            if (row >= rows) {
              row = 0;
              column += 1;
            }
          }
        } else {
          row = Math.floor(i / slidesPerRow);
          column = i - row * slidesPerRow;
        }
        slide.row = row;
        slide.column = column;
        slide.style.height = `calc((100% - ${(rows - 1) * spaceBetween}px) / ${rows})`;
        slide.style[swiper.getDirectionLabel('margin-top')] = row !== 0 ? spaceBetween && `${spaceBetween}px` : '';
        slide.swiperSlideGridSet = true;
      };
      const updateWrapperSize = (slideSize, snapGrid) => {
        const {
          centeredSlides,
          roundLengths
        } = swiper.params;
        const spaceBetween = getSpaceBetween();
        const {
          rows
        } = swiper.params.grid;
        swiper.virtualSize = (slideSize + spaceBetween) * slidesNumberEvenToRows;
        swiper.virtualSize = Math.ceil(swiper.virtualSize / rows) - spaceBetween;
        if (!swiper.params.cssMode) {
          swiper.wrapperEl.style[swiper.getDirectionLabel('width')] = `${swiper.virtualSize + spaceBetween}px`;
        }
        if (centeredSlides) {
          const newSlidesGrid = [];
          for (let i = 0; i < snapGrid.length; i += 1) {
            let slidesGridItem = snapGrid[i];
            if (roundLengths) slidesGridItem = Math.floor(slidesGridItem);
            if (snapGrid[i] < swiper.virtualSize + snapGrid[0]) newSlidesGrid.push(slidesGridItem);
          }
          snapGrid.splice(0, snapGrid.length);
          snapGrid.push(...newSlidesGrid);
        }
      };
      const onInit = () => {
        wasMultiRow = swiper.params.grid && swiper.params.grid.rows > 1;
      };
      const onUpdate = () => {
        const {
          params,
          el
        } = swiper;
        const isMultiRow = params.grid && params.grid.rows > 1;
        if (wasMultiRow && !isMultiRow) {
          el.classList.remove(`${params.containerModifierClass}grid`, `${params.containerModifierClass}grid-column`);
          numFullColumns = 1;
          swiper.emitContainerClasses();
        } else if (!wasMultiRow && isMultiRow) {
          el.classList.add(`${params.containerModifierClass}grid`);
          if (params.grid.fill === 'column') {
            el.classList.add(`${params.containerModifierClass}grid-column`);
          }
          swiper.emitContainerClasses();
        }
        wasMultiRow = isMultiRow;
      };
      on('init', onInit);
      on('update', onUpdate);
      swiper.grid = {
        initSlides,
        unsetSlides,
        updateSlide,
        updateWrapperSize
      };
    }

    function appendSlide(slides) {
      const swiper = this;
      const {
        params,
        slidesEl
      } = swiper;
      if (params.loop) {
        swiper.loopDestroy();
      }
      const appendElement = slideEl => {
        if (typeof slideEl === 'string') {
          const tempDOM = document.createElement('div');
          tempDOM.innerHTML = slideEl;
          slidesEl.append(tempDOM.children[0]);
          tempDOM.innerHTML = '';
        } else {
          slidesEl.append(slideEl);
        }
      };
      if (typeof slides === 'object' && 'length' in slides) {
        for (let i = 0; i < slides.length; i += 1) {
          if (slides[i]) appendElement(slides[i]);
        }
      } else {
        appendElement(slides);
      }
      swiper.recalcSlides();
      if (params.loop) {
        swiper.loopCreate();
      }
      if (!params.observer || swiper.isElement) {
        swiper.update();
      }
    }

    function prependSlide(slides) {
      const swiper = this;
      const {
        params,
        activeIndex,
        slidesEl
      } = swiper;
      if (params.loop) {
        swiper.loopDestroy();
      }
      let newActiveIndex = activeIndex + 1;
      const prependElement = slideEl => {
        if (typeof slideEl === 'string') {
          const tempDOM = document.createElement('div');
          tempDOM.innerHTML = slideEl;
          slidesEl.prepend(tempDOM.children[0]);
          tempDOM.innerHTML = '';
        } else {
          slidesEl.prepend(slideEl);
        }
      };
      if (typeof slides === 'object' && 'length' in slides) {
        for (let i = 0; i < slides.length; i += 1) {
          if (slides[i]) prependElement(slides[i]);
        }
        newActiveIndex = activeIndex + slides.length;
      } else {
        prependElement(slides);
      }
      swiper.recalcSlides();
      if (params.loop) {
        swiper.loopCreate();
      }
      if (!params.observer || swiper.isElement) {
        swiper.update();
      }
      swiper.slideTo(newActiveIndex, 0, false);
    }

    function addSlide(index, slides) {
      const swiper = this;
      const {
        params,
        activeIndex,
        slidesEl
      } = swiper;
      let activeIndexBuffer = activeIndex;
      if (params.loop) {
        activeIndexBuffer -= swiper.loopedSlides;
        swiper.loopDestroy();
        swiper.recalcSlides();
      }
      const baseLength = swiper.slides.length;
      if (index <= 0) {
        swiper.prependSlide(slides);
        return;
      }
      if (index >= baseLength) {
        swiper.appendSlide(slides);
        return;
      }
      let newActiveIndex = activeIndexBuffer > index ? activeIndexBuffer + 1 : activeIndexBuffer;
      const slidesBuffer = [];
      for (let i = baseLength - 1; i >= index; i -= 1) {
        const currentSlide = swiper.slides[i];
        currentSlide.remove();
        slidesBuffer.unshift(currentSlide);
      }
      if (typeof slides === 'object' && 'length' in slides) {
        for (let i = 0; i < slides.length; i += 1) {
          if (slides[i]) slidesEl.append(slides[i]);
        }
        newActiveIndex = activeIndexBuffer > index ? activeIndexBuffer + slides.length : activeIndexBuffer;
      } else {
        slidesEl.append(slides);
      }
      for (let i = 0; i < slidesBuffer.length; i += 1) {
        slidesEl.append(slidesBuffer[i]);
      }
      swiper.recalcSlides();
      if (params.loop) {
        swiper.loopCreate();
      }
      if (!params.observer || swiper.isElement) {
        swiper.update();
      }
      if (params.loop) {
        swiper.slideTo(newActiveIndex + swiper.loopedSlides, 0, false);
      } else {
        swiper.slideTo(newActiveIndex, 0, false);
      }
    }

    function removeSlide(slidesIndexes) {
      const swiper = this;
      const {
        params,
        activeIndex
      } = swiper;
      let activeIndexBuffer = activeIndex;
      if (params.loop) {
        activeIndexBuffer -= swiper.loopedSlides;
        swiper.loopDestroy();
      }
      let newActiveIndex = activeIndexBuffer;
      let indexToRemove;
      if (typeof slidesIndexes === 'object' && 'length' in slidesIndexes) {
        for (let i = 0; i < slidesIndexes.length; i += 1) {
          indexToRemove = slidesIndexes[i];
          if (swiper.slides[indexToRemove]) swiper.slides[indexToRemove].remove();
          if (indexToRemove < newActiveIndex) newActiveIndex -= 1;
        }
        newActiveIndex = Math.max(newActiveIndex, 0);
      } else {
        indexToRemove = slidesIndexes;
        if (swiper.slides[indexToRemove]) swiper.slides[indexToRemove].remove();
        if (indexToRemove < newActiveIndex) newActiveIndex -= 1;
        newActiveIndex = Math.max(newActiveIndex, 0);
      }
      swiper.recalcSlides();
      if (params.loop) {
        swiper.loopCreate();
      }
      if (!params.observer || swiper.isElement) {
        swiper.update();
      }
      if (params.loop) {
        swiper.slideTo(newActiveIndex + swiper.loopedSlides, 0, false);
      } else {
        swiper.slideTo(newActiveIndex, 0, false);
      }
    }

    function removeAllSlides() {
      const swiper = this;
      const slidesIndexes = [];
      for (let i = 0; i < swiper.slides.length; i += 1) {
        slidesIndexes.push(i);
      }
      swiper.removeSlide(slidesIndexes);
    }

    function Manipulation(_ref) {
      let {
        swiper
      } = _ref;
      Object.assign(swiper, {
        appendSlide: appendSlide.bind(swiper),
        prependSlide: prependSlide.bind(swiper),
        addSlide: addSlide.bind(swiper),
        removeSlide: removeSlide.bind(swiper),
        removeAllSlides: removeAllSlides.bind(swiper)
      });
    }

    function effectInit(params) {
      const {
        effect,
        swiper,
        on,
        setTranslate,
        setTransition,
        overwriteParams,
        perspective,
        recreateShadows,
        getEffectParams
      } = params;
      on('beforeInit', () => {
        if (swiper.params.effect !== effect) return;
        swiper.classNames.push(`${swiper.params.containerModifierClass}${effect}`);
        if (perspective && perspective()) {
          swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
        }
        const overwriteParamsResult = overwriteParams ? overwriteParams() : {};
        Object.assign(swiper.params, overwriteParamsResult);
        Object.assign(swiper.originalParams, overwriteParamsResult);
      });
      on('setTranslate', () => {
        if (swiper.params.effect !== effect) return;
        setTranslate();
      });
      on('setTransition', (_s, duration) => {
        if (swiper.params.effect !== effect) return;
        setTransition(duration);
      });
      on('transitionEnd', () => {
        if (swiper.params.effect !== effect) return;
        if (recreateShadows) {
          if (!getEffectParams || !getEffectParams().slideShadows) return;
          // remove shadows
          swiper.slides.forEach(slideEl => {
            slideEl.querySelectorAll('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').forEach(shadowEl => shadowEl.remove());
          });
          // create new one
          recreateShadows();
        }
      });
      let requireUpdateOnVirtual;
      on('virtualUpdate', () => {
        if (swiper.params.effect !== effect) return;
        if (!swiper.slides.length) {
          requireUpdateOnVirtual = true;
        }
        requestAnimationFrame(() => {
          if (requireUpdateOnVirtual && swiper.slides && swiper.slides.length) {
            setTranslate();
            requireUpdateOnVirtual = false;
          }
        });
      });
    }

    function effectTarget(effectParams, slideEl) {
      const transformEl = getSlideTransformEl(slideEl);
      if (transformEl !== slideEl) {
        transformEl.style.backfaceVisibility = 'hidden';
        transformEl.style['-webkit-backface-visibility'] = 'hidden';
      }
      return transformEl;
    }

    function effectVirtualTransitionEnd(_ref) {
      let {
        swiper,
        duration,
        transformElements,
        allSlides
      } = _ref;
      const {
        activeIndex
      } = swiper;
      const getSlide = el => {
        if (!el.parentElement) {
          // assume shadow root
          const slide = swiper.slides.find(slideEl => slideEl.shadowRoot && slideEl.shadowRoot === el.parentNode);
          return slide;
        }
        return el.parentElement;
      };
      if (swiper.params.virtualTranslate && duration !== 0) {
        let eventTriggered = false;
        let transitionEndTarget;
        if (allSlides) {
          transitionEndTarget = transformElements;
        } else {
          transitionEndTarget = transformElements.filter(transformEl => {
            const el = transformEl.classList.contains('swiper-slide-transform') ? getSlide(transformEl) : transformEl;
            return swiper.getSlideIndex(el) === activeIndex;
          });
        }
        transitionEndTarget.forEach(el => {
          elementTransitionEnd(el, () => {
            if (eventTriggered) return;
            if (!swiper || swiper.destroyed) return;
            eventTriggered = true;
            swiper.animating = false;
            const evt = new window.CustomEvent('transitionend', {
              bubbles: true,
              cancelable: true
            });
            swiper.wrapperEl.dispatchEvent(evt);
          });
        });
      }
    }

    function EffectFade(_ref) {
      let {
        swiper,
        extendParams,
        on
      } = _ref;
      extendParams({
        fadeEffect: {
          crossFade: false
        }
      });
      const setTranslate = () => {
        const {
          slides
        } = swiper;
        const params = swiper.params.fadeEffect;
        for (let i = 0; i < slides.length; i += 1) {
          const slideEl = swiper.slides[i];
          const offset = slideEl.swiperSlideOffset;
          let tx = -offset;
          if (!swiper.params.virtualTranslate) tx -= swiper.translate;
          let ty = 0;
          if (!swiper.isHorizontal()) {
            ty = tx;
            tx = 0;
          }
          const slideOpacity = swiper.params.fadeEffect.crossFade ? Math.max(1 - Math.abs(slideEl.progress), 0) : 1 + Math.min(Math.max(slideEl.progress, -1), 0);
          const targetEl = effectTarget(params, slideEl);
          targetEl.style.opacity = slideOpacity;
          targetEl.style.transform = `translate3d(${tx}px, ${ty}px, 0px)`;
        }
      };
      const setTransition = duration => {
        const transformElements = swiper.slides.map(slideEl => getSlideTransformEl(slideEl));
        transformElements.forEach(el => {
          el.style.transitionDuration = `${duration}ms`;
        });
        effectVirtualTransitionEnd({
          swiper,
          duration,
          transformElements,
          allSlides: true
        });
      };
      effectInit({
        effect: 'fade',
        swiper,
        on,
        setTranslate,
        setTransition,
        overwriteParams: () => ({
          slidesPerView: 1,
          slidesPerGroup: 1,
          watchSlidesProgress: true,
          spaceBetween: 0,
          virtualTranslate: !swiper.params.cssMode
        })
      });
    }

    function EffectCube(_ref) {
      let {
        swiper,
        extendParams,
        on
      } = _ref;
      extendParams({
        cubeEffect: {
          slideShadows: true,
          shadow: true,
          shadowOffset: 20,
          shadowScale: 0.94
        }
      });
      const createSlideShadows = (slideEl, progress, isHorizontal) => {
        let shadowBefore = isHorizontal ? slideEl.querySelector('.swiper-slide-shadow-left') : slideEl.querySelector('.swiper-slide-shadow-top');
        let shadowAfter = isHorizontal ? slideEl.querySelector('.swiper-slide-shadow-right') : slideEl.querySelector('.swiper-slide-shadow-bottom');
        if (!shadowBefore) {
          shadowBefore = createElement('div', `swiper-slide-shadow-cube swiper-slide-shadow-${isHorizontal ? 'left' : 'top'}`.split(' '));
          slideEl.append(shadowBefore);
        }
        if (!shadowAfter) {
          shadowAfter = createElement('div', `swiper-slide-shadow-cube swiper-slide-shadow-${isHorizontal ? 'right' : 'bottom'}`.split(' '));
          slideEl.append(shadowAfter);
        }
        if (shadowBefore) shadowBefore.style.opacity = Math.max(-progress, 0);
        if (shadowAfter) shadowAfter.style.opacity = Math.max(progress, 0);
      };
      const recreateShadows = () => {
        // create new ones
        const isHorizontal = swiper.isHorizontal();
        swiper.slides.forEach(slideEl => {
          const progress = Math.max(Math.min(slideEl.progress, 1), -1);
          createSlideShadows(slideEl, progress, isHorizontal);
        });
      };
      const setTranslate = () => {
        const {
          el,
          wrapperEl,
          slides,
          width: swiperWidth,
          height: swiperHeight,
          rtlTranslate: rtl,
          size: swiperSize,
          browser
        } = swiper;
        const r = getRotateFix(swiper);
        const params = swiper.params.cubeEffect;
        const isHorizontal = swiper.isHorizontal();
        const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
        let wrapperRotate = 0;
        let cubeShadowEl;
        if (params.shadow) {
          if (isHorizontal) {
            cubeShadowEl = swiper.wrapperEl.querySelector('.swiper-cube-shadow');
            if (!cubeShadowEl) {
              cubeShadowEl = createElement('div', 'swiper-cube-shadow');
              swiper.wrapperEl.append(cubeShadowEl);
            }
            cubeShadowEl.style.height = `${swiperWidth}px`;
          } else {
            cubeShadowEl = el.querySelector('.swiper-cube-shadow');
            if (!cubeShadowEl) {
              cubeShadowEl = createElement('div', 'swiper-cube-shadow');
              el.append(cubeShadowEl);
            }
          }
        }
        for (let i = 0; i < slides.length; i += 1) {
          const slideEl = slides[i];
          let slideIndex = i;
          if (isVirtual) {
            slideIndex = parseInt(slideEl.getAttribute('data-swiper-slide-index'), 10);
          }
          let slideAngle = slideIndex * 90;
          let round = Math.floor(slideAngle / 360);
          if (rtl) {
            slideAngle = -slideAngle;
            round = Math.floor(-slideAngle / 360);
          }
          const progress = Math.max(Math.min(slideEl.progress, 1), -1);
          let tx = 0;
          let ty = 0;
          let tz = 0;
          if (slideIndex % 4 === 0) {
            tx = -round * 4 * swiperSize;
            tz = 0;
          } else if ((slideIndex - 1) % 4 === 0) {
            tx = 0;
            tz = -round * 4 * swiperSize;
          } else if ((slideIndex - 2) % 4 === 0) {
            tx = swiperSize + round * 4 * swiperSize;
            tz = swiperSize;
          } else if ((slideIndex - 3) % 4 === 0) {
            tx = -swiperSize;
            tz = 3 * swiperSize + swiperSize * 4 * round;
          }
          if (rtl) {
            tx = -tx;
          }
          if (!isHorizontal) {
            ty = tx;
            tx = 0;
          }
          const transform = `rotateX(${r(isHorizontal ? 0 : -slideAngle)}deg) rotateY(${r(isHorizontal ? slideAngle : 0)}deg) translate3d(${tx}px, ${ty}px, ${tz}px)`;
          if (progress <= 1 && progress > -1) {
            wrapperRotate = slideIndex * 90 + progress * 90;
            if (rtl) wrapperRotate = -slideIndex * 90 - progress * 90;
          }
          slideEl.style.transform = transform;
          if (params.slideShadows) {
            createSlideShadows(slideEl, progress, isHorizontal);
          }
        }
        wrapperEl.style.transformOrigin = `50% 50% -${swiperSize / 2}px`;
        wrapperEl.style['-webkit-transform-origin'] = `50% 50% -${swiperSize / 2}px`;
        if (params.shadow) {
          if (isHorizontal) {
            cubeShadowEl.style.transform = `translate3d(0px, ${swiperWidth / 2 + params.shadowOffset}px, ${-swiperWidth / 2}px) rotateX(89.99deg) rotateZ(0deg) scale(${params.shadowScale})`;
          } else {
            const shadowAngle = Math.abs(wrapperRotate) - Math.floor(Math.abs(wrapperRotate) / 90) * 90;
            const multiplier = 1.5 - (Math.sin(shadowAngle * 2 * Math.PI / 360) / 2 + Math.cos(shadowAngle * 2 * Math.PI / 360) / 2);
            const scale1 = params.shadowScale;
            const scale2 = params.shadowScale / multiplier;
            const offset = params.shadowOffset;
            cubeShadowEl.style.transform = `scale3d(${scale1}, 1, ${scale2}) translate3d(0px, ${swiperHeight / 2 + offset}px, ${-swiperHeight / 2 / scale2}px) rotateX(-89.99deg)`;
          }
        }
        const zFactor = (browser.isSafari || browser.isWebView) && browser.needPerspectiveFix ? -swiperSize / 2 : 0;
        wrapperEl.style.transform = `translate3d(0px,0,${zFactor}px) rotateX(${r(swiper.isHorizontal() ? 0 : wrapperRotate)}deg) rotateY(${r(swiper.isHorizontal() ? -wrapperRotate : 0)}deg)`;
        wrapperEl.style.setProperty('--swiper-cube-translate-z', `${zFactor}px`);
      };
      const setTransition = duration => {
        const {
          el,
          slides
        } = swiper;
        slides.forEach(slideEl => {
          slideEl.style.transitionDuration = `${duration}ms`;
          slideEl.querySelectorAll('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').forEach(subEl => {
            subEl.style.transitionDuration = `${duration}ms`;
          });
        });
        if (swiper.params.cubeEffect.shadow && !swiper.isHorizontal()) {
          const shadowEl = el.querySelector('.swiper-cube-shadow');
          if (shadowEl) shadowEl.style.transitionDuration = `${duration}ms`;
        }
      };
      effectInit({
        effect: 'cube',
        swiper,
        on,
        setTranslate,
        setTransition,
        recreateShadows,
        getEffectParams: () => swiper.params.cubeEffect,
        perspective: () => true,
        overwriteParams: () => ({
          slidesPerView: 1,
          slidesPerGroup: 1,
          watchSlidesProgress: true,
          resistanceRatio: 0,
          spaceBetween: 0,
          centeredSlides: false,
          virtualTranslate: true
        })
      });
    }

    function createShadow(suffix, slideEl, side) {
      const shadowClass = `swiper-slide-shadow${side ? `-${side}` : ''}${suffix ? ` swiper-slide-shadow-${suffix}` : ''}`;
      const shadowContainer = getSlideTransformEl(slideEl);
      let shadowEl = shadowContainer.querySelector(`.${shadowClass.split(' ').join('.')}`);
      if (!shadowEl) {
        shadowEl = createElement('div', shadowClass.split(' '));
        shadowContainer.append(shadowEl);
      }
      return shadowEl;
    }

    function EffectFlip(_ref) {
      let {
        swiper,
        extendParams,
        on
      } = _ref;
      extendParams({
        flipEffect: {
          slideShadows: true,
          limitRotation: true
        }
      });
      const createSlideShadows = (slideEl, progress) => {
        let shadowBefore = swiper.isHorizontal() ? slideEl.querySelector('.swiper-slide-shadow-left') : slideEl.querySelector('.swiper-slide-shadow-top');
        let shadowAfter = swiper.isHorizontal() ? slideEl.querySelector('.swiper-slide-shadow-right') : slideEl.querySelector('.swiper-slide-shadow-bottom');
        if (!shadowBefore) {
          shadowBefore = createShadow('flip', slideEl, swiper.isHorizontal() ? 'left' : 'top');
        }
        if (!shadowAfter) {
          shadowAfter = createShadow('flip', slideEl, swiper.isHorizontal() ? 'right' : 'bottom');
        }
        if (shadowBefore) shadowBefore.style.opacity = Math.max(-progress, 0);
        if (shadowAfter) shadowAfter.style.opacity = Math.max(progress, 0);
      };
      const recreateShadows = () => {
        // Set shadows
        swiper.params.flipEffect;
        swiper.slides.forEach(slideEl => {
          let progress = slideEl.progress;
          if (swiper.params.flipEffect.limitRotation) {
            progress = Math.max(Math.min(slideEl.progress, 1), -1);
          }
          createSlideShadows(slideEl, progress);
        });
      };
      const setTranslate = () => {
        const {
          slides,
          rtlTranslate: rtl
        } = swiper;
        const params = swiper.params.flipEffect;
        const rotateFix = getRotateFix(swiper);
        for (let i = 0; i < slides.length; i += 1) {
          const slideEl = slides[i];
          let progress = slideEl.progress;
          if (swiper.params.flipEffect.limitRotation) {
            progress = Math.max(Math.min(slideEl.progress, 1), -1);
          }
          const offset = slideEl.swiperSlideOffset;
          const rotate = -180 * progress;
          let rotateY = rotate;
          let rotateX = 0;
          let tx = swiper.params.cssMode ? -offset - swiper.translate : -offset;
          let ty = 0;
          if (!swiper.isHorizontal()) {
            ty = tx;
            tx = 0;
            rotateX = -rotateY;
            rotateY = 0;
          } else if (rtl) {
            rotateY = -rotateY;
          }
          slideEl.style.zIndex = -Math.abs(Math.round(progress)) + slides.length;
          if (params.slideShadows) {
            createSlideShadows(slideEl, progress);
          }
          const transform = `translate3d(${tx}px, ${ty}px, 0px) rotateX(${rotateFix(rotateX)}deg) rotateY(${rotateFix(rotateY)}deg)`;
          const targetEl = effectTarget(params, slideEl);
          targetEl.style.transform = transform;
        }
      };
      const setTransition = duration => {
        const transformElements = swiper.slides.map(slideEl => getSlideTransformEl(slideEl));
        transformElements.forEach(el => {
          el.style.transitionDuration = `${duration}ms`;
          el.querySelectorAll('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').forEach(shadowEl => {
            shadowEl.style.transitionDuration = `${duration}ms`;
          });
        });
        effectVirtualTransitionEnd({
          swiper,
          duration,
          transformElements
        });
      };
      effectInit({
        effect: 'flip',
        swiper,
        on,
        setTranslate,
        setTransition,
        recreateShadows,
        getEffectParams: () => swiper.params.flipEffect,
        perspective: () => true,
        overwriteParams: () => ({
          slidesPerView: 1,
          slidesPerGroup: 1,
          watchSlidesProgress: true,
          spaceBetween: 0,
          virtualTranslate: !swiper.params.cssMode
        })
      });
    }

    function EffectCoverflow(_ref) {
      let {
        swiper,
        extendParams,
        on
      } = _ref;
      extendParams({
        coverflowEffect: {
          rotate: 50,
          stretch: 0,
          depth: 100,
          scale: 1,
          modifier: 1,
          slideShadows: true
        }
      });
      const setTranslate = () => {
        const {
          width: swiperWidth,
          height: swiperHeight,
          slides,
          slidesSizesGrid
        } = swiper;
        const params = swiper.params.coverflowEffect;
        const isHorizontal = swiper.isHorizontal();
        const transform = swiper.translate;
        const center = isHorizontal ? -transform + swiperWidth / 2 : -transform + swiperHeight / 2;
        const rotate = isHorizontal ? params.rotate : -params.rotate;
        const translate = params.depth;
        const r = getRotateFix(swiper);
        // Each slide offset from center
        for (let i = 0, length = slides.length; i < length; i += 1) {
          const slideEl = slides[i];
          const slideSize = slidesSizesGrid[i];
          const slideOffset = slideEl.swiperSlideOffset;
          const centerOffset = (center - slideOffset - slideSize / 2) / slideSize;
          const offsetMultiplier = typeof params.modifier === 'function' ? params.modifier(centerOffset) : centerOffset * params.modifier;
          let rotateY = isHorizontal ? rotate * offsetMultiplier : 0;
          let rotateX = isHorizontal ? 0 : rotate * offsetMultiplier;
          // var rotateZ = 0
          let translateZ = -translate * Math.abs(offsetMultiplier);
          let stretch = params.stretch;
          // Allow percentage to make a relative stretch for responsive sliders
          if (typeof stretch === 'string' && stretch.indexOf('%') !== -1) {
            stretch = parseFloat(params.stretch) / 100 * slideSize;
          }
          let translateY = isHorizontal ? 0 : stretch * offsetMultiplier;
          let translateX = isHorizontal ? stretch * offsetMultiplier : 0;
          let scale = 1 - (1 - params.scale) * Math.abs(offsetMultiplier);

          // Fix for ultra small values
          if (Math.abs(translateX) < 0.001) translateX = 0;
          if (Math.abs(translateY) < 0.001) translateY = 0;
          if (Math.abs(translateZ) < 0.001) translateZ = 0;
          if (Math.abs(rotateY) < 0.001) rotateY = 0;
          if (Math.abs(rotateX) < 0.001) rotateX = 0;
          if (Math.abs(scale) < 0.001) scale = 0;
          const slideTransform = `translate3d(${translateX}px,${translateY}px,${translateZ}px)  rotateX(${r(rotateX)}deg) rotateY(${r(rotateY)}deg) scale(${scale})`;
          const targetEl = effectTarget(params, slideEl);
          targetEl.style.transform = slideTransform;
          slideEl.style.zIndex = -Math.abs(Math.round(offsetMultiplier)) + 1;
          if (params.slideShadows) {
            // Set shadows
            let shadowBeforeEl = isHorizontal ? slideEl.querySelector('.swiper-slide-shadow-left') : slideEl.querySelector('.swiper-slide-shadow-top');
            let shadowAfterEl = isHorizontal ? slideEl.querySelector('.swiper-slide-shadow-right') : slideEl.querySelector('.swiper-slide-shadow-bottom');
            if (!shadowBeforeEl) {
              shadowBeforeEl = createShadow('coverflow', slideEl, isHorizontal ? 'left' : 'top');
            }
            if (!shadowAfterEl) {
              shadowAfterEl = createShadow('coverflow', slideEl, isHorizontal ? 'right' : 'bottom');
            }
            if (shadowBeforeEl) shadowBeforeEl.style.opacity = offsetMultiplier > 0 ? offsetMultiplier : 0;
            if (shadowAfterEl) shadowAfterEl.style.opacity = -offsetMultiplier > 0 ? -offsetMultiplier : 0;
          }
        }
      };
      const setTransition = duration => {
        const transformElements = swiper.slides.map(slideEl => getSlideTransformEl(slideEl));
        transformElements.forEach(el => {
          el.style.transitionDuration = `${duration}ms`;
          el.querySelectorAll('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').forEach(shadowEl => {
            shadowEl.style.transitionDuration = `${duration}ms`;
          });
        });
      };
      effectInit({
        effect: 'coverflow',
        swiper,
        on,
        setTranslate,
        setTransition,
        perspective: () => true,
        overwriteParams: () => ({
          watchSlidesProgress: true
        })
      });
    }

    function EffectCreative(_ref) {
      let {
        swiper,
        extendParams,
        on
      } = _ref;
      extendParams({
        creativeEffect: {
          limitProgress: 1,
          shadowPerProgress: false,
          progressMultiplier: 1,
          perspective: true,
          prev: {
            translate: [0, 0, 0],
            rotate: [0, 0, 0],
            opacity: 1,
            scale: 1
          },
          next: {
            translate: [0, 0, 0],
            rotate: [0, 0, 0],
            opacity: 1,
            scale: 1
          }
        }
      });
      const getTranslateValue = value => {
        if (typeof value === 'string') return value;
        return `${value}px`;
      };
      const setTranslate = () => {
        const {
          slides,
          wrapperEl,
          slidesSizesGrid
        } = swiper;
        const params = swiper.params.creativeEffect;
        const {
          progressMultiplier: multiplier
        } = params;
        const isCenteredSlides = swiper.params.centeredSlides;
        const rotateFix = getRotateFix(swiper);
        if (isCenteredSlides) {
          const margin = slidesSizesGrid[0] / 2 - swiper.params.slidesOffsetBefore || 0;
          wrapperEl.style.transform = `translateX(calc(50% - ${margin}px))`;
        }
        for (let i = 0; i < slides.length; i += 1) {
          const slideEl = slides[i];
          const slideProgress = slideEl.progress;
          const progress = Math.min(Math.max(slideEl.progress, -params.limitProgress), params.limitProgress);
          let originalProgress = progress;
          if (!isCenteredSlides) {
            originalProgress = Math.min(Math.max(slideEl.originalProgress, -params.limitProgress), params.limitProgress);
          }
          const offset = slideEl.swiperSlideOffset;
          const t = [swiper.params.cssMode ? -offset - swiper.translate : -offset, 0, 0];
          const r = [0, 0, 0];
          let custom = false;
          if (!swiper.isHorizontal()) {
            t[1] = t[0];
            t[0] = 0;
          }
          let data = {
            translate: [0, 0, 0],
            rotate: [0, 0, 0],
            scale: 1,
            opacity: 1
          };
          if (progress < 0) {
            data = params.next;
            custom = true;
          } else if (progress > 0) {
            data = params.prev;
            custom = true;
          }
          // set translate
          t.forEach((value, index) => {
            t[index] = `calc(${value}px + (${getTranslateValue(data.translate[index])} * ${Math.abs(progress * multiplier)}))`;
          });
          // set rotates
          r.forEach((value, index) => {
            let val = data.rotate[index] * Math.abs(progress * multiplier);
            r[index] = val;
          });
          slideEl.style.zIndex = -Math.abs(Math.round(slideProgress)) + slides.length;
          const translateString = t.join(', ');
          const rotateString = `rotateX(${rotateFix(r[0])}deg) rotateY(${rotateFix(r[1])}deg) rotateZ(${rotateFix(r[2])}deg)`;
          const scaleString = originalProgress < 0 ? `scale(${1 + (1 - data.scale) * originalProgress * multiplier})` : `scale(${1 - (1 - data.scale) * originalProgress * multiplier})`;
          const opacityString = originalProgress < 0 ? 1 + (1 - data.opacity) * originalProgress * multiplier : 1 - (1 - data.opacity) * originalProgress * multiplier;
          const transform = `translate3d(${translateString}) ${rotateString} ${scaleString}`;

          // Set shadows
          if (custom && data.shadow || !custom) {
            let shadowEl = slideEl.querySelector('.swiper-slide-shadow');
            if (!shadowEl && data.shadow) {
              shadowEl = createShadow('creative', slideEl);
            }
            if (shadowEl) {
              const shadowOpacity = params.shadowPerProgress ? progress * (1 / params.limitProgress) : progress;
              shadowEl.style.opacity = Math.min(Math.max(Math.abs(shadowOpacity), 0), 1);
            }
          }
          const targetEl = effectTarget(params, slideEl);
          targetEl.style.transform = transform;
          targetEl.style.opacity = opacityString;
          if (data.origin) {
            targetEl.style.transformOrigin = data.origin;
          }
        }
      };
      const setTransition = duration => {
        const transformElements = swiper.slides.map(slideEl => getSlideTransformEl(slideEl));
        transformElements.forEach(el => {
          el.style.transitionDuration = `${duration}ms`;
          el.querySelectorAll('.swiper-slide-shadow').forEach(shadowEl => {
            shadowEl.style.transitionDuration = `${duration}ms`;
          });
        });
        effectVirtualTransitionEnd({
          swiper,
          duration,
          transformElements,
          allSlides: true
        });
      };
      effectInit({
        effect: 'creative',
        swiper,
        on,
        setTranslate,
        setTransition,
        perspective: () => swiper.params.creativeEffect.perspective,
        overwriteParams: () => ({
          watchSlidesProgress: true,
          virtualTranslate: !swiper.params.cssMode
        })
      });
    }

    function EffectCards(_ref) {
      let {
        swiper,
        extendParams,
        on
      } = _ref;
      extendParams({
        cardsEffect: {
          slideShadows: true,
          rotate: true,
          perSlideRotate: 2,
          perSlideOffset: 8
        }
      });
      const setTranslate = () => {
        const {
          slides,
          activeIndex,
          rtlTranslate: rtl
        } = swiper;
        const params = swiper.params.cardsEffect;
        const {
          startTranslate,
          isTouched
        } = swiper.touchEventsData;
        const currentTranslate = rtl ? -swiper.translate : swiper.translate;
        for (let i = 0; i < slides.length; i += 1) {
          const slideEl = slides[i];
          const slideProgress = slideEl.progress;
          const progress = Math.min(Math.max(slideProgress, -4), 4);
          let offset = slideEl.swiperSlideOffset;
          if (swiper.params.centeredSlides && !swiper.params.cssMode) {
            swiper.wrapperEl.style.transform = `translateX(${swiper.minTranslate()}px)`;
          }
          if (swiper.params.centeredSlides && swiper.params.cssMode) {
            offset -= slides[0].swiperSlideOffset;
          }
          let tX = swiper.params.cssMode ? -offset - swiper.translate : -offset;
          let tY = 0;
          const tZ = -100 * Math.abs(progress);
          let scale = 1;
          let rotate = -params.perSlideRotate * progress;
          let tXAdd = params.perSlideOffset - Math.abs(progress) * 0.75;
          const slideIndex = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.from + i : i;
          const isSwipeToNext = (slideIndex === activeIndex || slideIndex === activeIndex - 1) && progress > 0 && progress < 1 && (isTouched || swiper.params.cssMode) && currentTranslate < startTranslate;
          const isSwipeToPrev = (slideIndex === activeIndex || slideIndex === activeIndex + 1) && progress < 0 && progress > -1 && (isTouched || swiper.params.cssMode) && currentTranslate > startTranslate;
          if (isSwipeToNext || isSwipeToPrev) {
            const subProgress = (1 - Math.abs((Math.abs(progress) - 0.5) / 0.5)) ** 0.5;
            rotate += -28 * progress * subProgress;
            scale += -0.5 * subProgress;
            tXAdd += 96 * subProgress;
            tY = `${-25 * subProgress * Math.abs(progress)}%`;
          }
          if (progress < 0) {
            // next
            tX = `calc(${tX}px ${rtl ? '-' : '+'} (${tXAdd * Math.abs(progress)}%))`;
          } else if (progress > 0) {
            // prev
            tX = `calc(${tX}px ${rtl ? '-' : '+'} (-${tXAdd * Math.abs(progress)}%))`;
          } else {
            tX = `${tX}px`;
          }
          if (!swiper.isHorizontal()) {
            const prevY = tY;
            tY = tX;
            tX = prevY;
          }
          const scaleString = progress < 0 ? `${1 + (1 - scale) * progress}` : `${1 - (1 - scale) * progress}`;

          /* eslint-disable */
          const transform = `
        translate3d(${tX}, ${tY}, ${tZ}px)
        rotateZ(${params.rotate ? rtl ? -rotate : rotate : 0}deg)
        scale(${scaleString})
      `;
          /* eslint-enable */

          if (params.slideShadows) {
            // Set shadows
            let shadowEl = slideEl.querySelector('.swiper-slide-shadow');
            if (!shadowEl) {
              shadowEl = createShadow('cards', slideEl);
            }
            if (shadowEl) shadowEl.style.opacity = Math.min(Math.max((Math.abs(progress) - 0.5) / 0.5, 0), 1);
          }
          slideEl.style.zIndex = -Math.abs(Math.round(slideProgress)) + slides.length;
          const targetEl = effectTarget(params, slideEl);
          targetEl.style.transform = transform;
        }
      };
      const setTransition = duration => {
        const transformElements = swiper.slides.map(slideEl => getSlideTransformEl(slideEl));
        transformElements.forEach(el => {
          el.style.transitionDuration = `${duration}ms`;
          el.querySelectorAll('.swiper-slide-shadow').forEach(shadowEl => {
            shadowEl.style.transitionDuration = `${duration}ms`;
          });
        });
        effectVirtualTransitionEnd({
          swiper,
          duration,
          transformElements
        });
      };
      effectInit({
        effect: 'cards',
        swiper,
        on,
        setTranslate,
        setTransition,
        perspective: () => true,
        overwriteParams: () => ({
          _loopSwapReset: false,
          watchSlidesProgress: true,
          loopAdditionalSlides: swiper.params.cardsEffect.rotate ? 3 : 2,
          centeredSlides: true,
          virtualTranslate: !swiper.params.cssMode
        })
      });
    }

    // Swiper Class
    const modules = [Virtual, Keyboard, Mousewheel, Navigation, Pagination, Scrollbar, Parallax, Zoom, Controller, A11y, History, HashNavigation, Autoplay, Thumb, freeMode, Grid, Manipulation, EffectFade, EffectCube, EffectFlip, EffectCoverflow, EffectCreative, EffectCards];
    Swiper.use(modules);

    /* underscore in name -> watch for changes */
    const paramsList = ['eventsPrefix', 'injectStyles', 'injectStylesUrls', 'modules', 'init', '_direction', 'oneWayMovement', 'swiperElementNodeName', 'touchEventsTarget', 'initialSlide', '_speed', 'cssMode', 'updateOnWindowResize', 'resizeObserver', 'nested', 'focusableElements', '_enabled', '_width', '_height', 'preventInteractionOnTransition', 'userAgent', 'url', '_edgeSwipeDetection', '_edgeSwipeThreshold', '_freeMode', '_autoHeight', 'setWrapperSize', 'virtualTranslate', '_effect', 'breakpoints', 'breakpointsBase', '_spaceBetween', '_slidesPerView', 'maxBackfaceHiddenSlides', '_grid', '_slidesPerGroup', '_slidesPerGroupSkip', '_slidesPerGroupAuto', '_centeredSlides', '_centeredSlidesBounds', '_slidesOffsetBefore', '_slidesOffsetAfter', 'normalizeSlideIndex', '_centerInsufficientSlides', '_watchOverflow', 'roundLengths', 'touchRatio', 'touchAngle', 'simulateTouch', '_shortSwipes', '_longSwipes', 'longSwipesRatio', 'longSwipesMs', '_followFinger', 'allowTouchMove', '_threshold', 'touchMoveStopPropagation', 'touchStartPreventDefault', 'touchStartForcePreventDefault', 'touchReleaseOnEdges', 'uniqueNavElements', '_resistance', '_resistanceRatio', '_watchSlidesProgress', '_grabCursor', 'preventClicks', 'preventClicksPropagation', '_slideToClickedSlide', '_loop', 'loopAdditionalSlides', 'loopAddBlankSlides', 'loopPreventsSliding', '_rewind', '_allowSlidePrev', '_allowSlideNext', '_swipeHandler', '_noSwiping', 'noSwipingClass', 'noSwipingSelector', 'passiveListeners', 'containerModifierClass', 'slideClass', 'slideActiveClass', 'slideVisibleClass', 'slideFullyVisibleClass', 'slideNextClass', 'slidePrevClass', 'slideBlankClass', 'wrapperClass', 'lazyPreloaderClass', 'lazyPreloadPrevNext', 'runCallbacksOnInit', 'observer', 'observeParents', 'observeSlideChildren',
    // modules
    'a11y', '_autoplay', '_controller', 'coverflowEffect', 'cubeEffect', 'fadeEffect', 'flipEffect', 'creativeEffect', 'cardsEffect', 'hashNavigation', 'history', 'keyboard', 'mousewheel', '_navigation', '_pagination', 'parallax', '_scrollbar', '_thumbs', 'virtual', 'zoom', 'control'];

    function isObject(o) {
      return typeof o === 'object' && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === 'Object' && !o.__swiper__;
    }
    function extend(target, src) {
      const noExtend = ['__proto__', 'constructor', 'prototype'];
      Object.keys(src).filter(key => noExtend.indexOf(key) < 0).forEach(key => {
        if (typeof target[key] === 'undefined') target[key] = src[key];else if (isObject(src[key]) && isObject(target[key]) && Object.keys(src[key]).length > 0) {
          if (src[key].__swiper__) target[key] = src[key];else extend(target[key], src[key]);
        } else {
          target[key] = src[key];
        }
      });
    }
    function needsNavigation(params) {
      if (params === void 0) {
        params = {};
      }
      return params.navigation && typeof params.navigation.nextEl === 'undefined' && typeof params.navigation.prevEl === 'undefined';
    }
    function needsPagination(params) {
      if (params === void 0) {
        params = {};
      }
      return params.pagination && typeof params.pagination.el === 'undefined';
    }
    function needsScrollbar(params) {
      if (params === void 0) {
        params = {};
      }
      return params.scrollbar && typeof params.scrollbar.el === 'undefined';
    }
    function attrToProp(attrName) {
      if (attrName === void 0) {
        attrName = '';
      }
      return attrName.replace(/-[a-z]/g, l => l.toUpperCase().replace('-', ''));
    }

    function updateSwiper(_ref) {
      let {
        swiper,
        slides,
        passedParams,
        changedParams,
        nextEl,
        prevEl,
        scrollbarEl,
        paginationEl
      } = _ref;
      const updateParams = changedParams.filter(key => key !== 'children' && key !== 'direction' && key !== 'wrapperClass');
      const {
        params: currentParams,
        pagination,
        navigation,
        scrollbar,
        virtual,
        thumbs
      } = swiper;
      let needThumbsInit;
      let needControllerInit;
      let needPaginationInit;
      let needScrollbarInit;
      let needNavigationInit;
      let loopNeedDestroy;
      let loopNeedEnable;
      let loopNeedReloop;
      if (changedParams.includes('thumbs') && passedParams.thumbs && passedParams.thumbs.swiper && !passedParams.thumbs.swiper.destroyed && currentParams.thumbs && (!currentParams.thumbs.swiper || currentParams.thumbs.swiper.destroyed)) {
        needThumbsInit = true;
      }
      if (changedParams.includes('controller') && passedParams.controller && passedParams.controller.control && currentParams.controller && !currentParams.controller.control) {
        needControllerInit = true;
      }
      if (changedParams.includes('pagination') && passedParams.pagination && (passedParams.pagination.el || paginationEl) && (currentParams.pagination || currentParams.pagination === false) && pagination && !pagination.el) {
        needPaginationInit = true;
      }
      if (changedParams.includes('scrollbar') && passedParams.scrollbar && (passedParams.scrollbar.el || scrollbarEl) && (currentParams.scrollbar || currentParams.scrollbar === false) && scrollbar && !scrollbar.el) {
        needScrollbarInit = true;
      }
      if (changedParams.includes('navigation') && passedParams.navigation && (passedParams.navigation.prevEl || prevEl) && (passedParams.navigation.nextEl || nextEl) && (currentParams.navigation || currentParams.navigation === false) && navigation && !navigation.prevEl && !navigation.nextEl) {
        needNavigationInit = true;
      }
      const destroyModule = mod => {
        if (!swiper[mod]) return;
        swiper[mod].destroy();
        if (mod === 'navigation') {
          if (swiper.isElement) {
            swiper[mod].prevEl.remove();
            swiper[mod].nextEl.remove();
          }
          currentParams[mod].prevEl = undefined;
          currentParams[mod].nextEl = undefined;
          swiper[mod].prevEl = undefined;
          swiper[mod].nextEl = undefined;
        } else {
          if (swiper.isElement) {
            swiper[mod].el.remove();
          }
          currentParams[mod].el = undefined;
          swiper[mod].el = undefined;
        }
      };
      if (changedParams.includes('loop') && swiper.isElement) {
        if (currentParams.loop && !passedParams.loop) {
          loopNeedDestroy = true;
        } else if (!currentParams.loop && passedParams.loop) {
          loopNeedEnable = true;
        } else {
          loopNeedReloop = true;
        }
      }
      updateParams.forEach(key => {
        if (isObject(currentParams[key]) && isObject(passedParams[key])) {
          Object.assign(currentParams[key], passedParams[key]);
          if ((key === 'navigation' || key === 'pagination' || key === 'scrollbar') && 'enabled' in passedParams[key] && !passedParams[key].enabled) {
            destroyModule(key);
          }
        } else {
          const newValue = passedParams[key];
          if ((newValue === true || newValue === false) && (key === 'navigation' || key === 'pagination' || key === 'scrollbar')) {
            if (newValue === false) {
              destroyModule(key);
            }
          } else {
            currentParams[key] = passedParams[key];
          }
        }
      });
      if (updateParams.includes('controller') && !needControllerInit && swiper.controller && swiper.controller.control && currentParams.controller && currentParams.controller.control) {
        swiper.controller.control = currentParams.controller.control;
      }
      if (changedParams.includes('children') && slides && virtual && currentParams.virtual.enabled) {
        virtual.slides = slides;
        virtual.update(true);
      } else if (changedParams.includes('virtual') && virtual && currentParams.virtual.enabled) {
        if (slides) virtual.slides = slides;
        virtual.update(true);
      }
      if (changedParams.includes('children') && slides && currentParams.loop) {
        loopNeedReloop = true;
      }
      if (needThumbsInit) {
        const initialized = thumbs.init();
        if (initialized) thumbs.update(true);
      }
      if (needControllerInit) {
        swiper.controller.control = currentParams.controller.control;
      }
      if (needPaginationInit) {
        if (swiper.isElement && (!paginationEl || typeof paginationEl === 'string')) {
          paginationEl = document.createElement('div');
          paginationEl.classList.add('swiper-pagination');
          paginationEl.part.add('pagination');
          swiper.el.appendChild(paginationEl);
        }
        if (paginationEl) currentParams.pagination.el = paginationEl;
        pagination.init();
        pagination.render();
        pagination.update();
      }
      if (needScrollbarInit) {
        if (swiper.isElement && (!scrollbarEl || typeof scrollbarEl === 'string')) {
          scrollbarEl = document.createElement('div');
          scrollbarEl.classList.add('swiper-scrollbar');
          scrollbarEl.part.add('scrollbar');
          swiper.el.appendChild(scrollbarEl);
        }
        if (scrollbarEl) currentParams.scrollbar.el = scrollbarEl;
        scrollbar.init();
        scrollbar.updateSize();
        scrollbar.setTranslate();
      }
      if (needNavigationInit) {
        if (swiper.isElement) {
          if (!nextEl || typeof nextEl === 'string') {
            nextEl = document.createElement('div');
            nextEl.classList.add('swiper-button-next');
            nextEl.innerHTML = swiper.hostEl.constructor.nextButtonSvg;
            nextEl.part.add('button-next');
            swiper.el.appendChild(nextEl);
          }
          if (!prevEl || typeof prevEl === 'string') {
            prevEl = document.createElement('div');
            prevEl.classList.add('swiper-button-prev');
            prevEl.innerHTML = swiper.hostEl.constructor.prevButtonSvg;
            prevEl.part.add('button-prev');
            swiper.el.appendChild(prevEl);
          }
        }
        if (nextEl) currentParams.navigation.nextEl = nextEl;
        if (prevEl) currentParams.navigation.prevEl = prevEl;
        navigation.init();
        navigation.update();
      }
      if (changedParams.includes('allowSlideNext')) {
        swiper.allowSlideNext = passedParams.allowSlideNext;
      }
      if (changedParams.includes('allowSlidePrev')) {
        swiper.allowSlidePrev = passedParams.allowSlidePrev;
      }
      if (changedParams.includes('direction')) {
        swiper.changeDirection(passedParams.direction, false);
      }
      if (loopNeedDestroy || loopNeedReloop) {
        swiper.loopDestroy();
      }
      if (loopNeedEnable || loopNeedReloop) {
        swiper.loopCreate();
      }
      swiper.update();
    }

    const formatValue = val => {
      if (parseFloat(val) === Number(val)) return Number(val);
      if (val === 'true') return true;
      if (val === '') return true;
      if (val === 'false') return false;
      if (val === 'null') return null;
      if (val === 'undefined') return undefined;
      if (typeof val === 'string' && val.includes('{') && val.includes('}') && val.includes('"')) {
        let v;
        try {
          v = JSON.parse(val);
        } catch (err) {
          v = val;
        }
        return v;
      }
      return val;
    };
    const modulesParamsList = ['a11y', 'autoplay', 'controller', 'cards-effect', 'coverflow-effect', 'creative-effect', 'cube-effect', 'fade-effect', 'flip-effect', 'free-mode', 'grid', 'hash-navigation', 'history', 'keyboard', 'mousewheel', 'navigation', 'pagination', 'parallax', 'scrollbar', 'thumbs', 'virtual', 'zoom'];
    function getParams(element, propName, propValue) {
      const params = {};
      const passedParams = {};
      extend(params, defaults);
      const localParamsList = [...paramsList, 'on'];
      const allowedParams = localParamsList.map(key => key.replace(/_/, ''));

      // First check props
      localParamsList.forEach(paramName => {
        paramName = paramName.replace('_', '');
        if (typeof element[paramName] !== 'undefined') {
          passedParams[paramName] = element[paramName];
        }
      });

      // Attributes
      const attrsList = [...element.attributes];
      if (typeof propName === 'string' && typeof propValue !== 'undefined') {
        attrsList.push({
          name: propName,
          value: isObject(propValue) ? {
            ...propValue
          } : propValue
        });
      }
      attrsList.forEach(attr => {
        const moduleParam = modulesParamsList.find(mParam => attr.name.startsWith(`${mParam}-`));
        if (moduleParam) {
          const parentObjName = attrToProp(moduleParam);
          const subObjName = attrToProp(attr.name.split(`${moduleParam}-`)[1]);
          if (typeof passedParams[parentObjName] === 'undefined') passedParams[parentObjName] = {};
          if (passedParams[parentObjName] === true) {
            passedParams[parentObjName] = {
              enabled: true
            };
          }
          passedParams[parentObjName][subObjName] = formatValue(attr.value);
        } else {
          const name = attrToProp(attr.name);
          if (!allowedParams.includes(name)) return;
          const value = formatValue(attr.value);
          if (passedParams[name] && modulesParamsList.includes(attr.name) && !isObject(value)) {
            if (passedParams[name].constructor !== Object) {
              passedParams[name] = {};
            }
            passedParams[name].enabled = !!value;
          } else {
            passedParams[name] = value;
          }
        }
      });
      extend(params, passedParams);
      if (params.navigation) {
        params.navigation = {
          prevEl: '.swiper-button-prev',
          nextEl: '.swiper-button-next',
          ...(params.navigation !== true ? params.navigation : {})
        };
      } else if (params.navigation === false) {
        delete params.navigation;
      }
      if (params.scrollbar) {
        params.scrollbar = {
          el: '.swiper-scrollbar',
          ...(params.scrollbar !== true ? params.scrollbar : {})
        };
      } else if (params.scrollbar === false) {
        delete params.scrollbar;
      }
      if (params.pagination) {
        params.pagination = {
          el: '.swiper-pagination',
          ...(params.pagination !== true ? params.pagination : {})
        };
      } else if (params.pagination === false) {
        delete params.pagination;
      }
      return {
        params,
        passedParams
      };
    }

    /* eslint-disable spaced-comment */

    const SwiperCSS = `:host{--swiper-theme-color:#007aff}:host{position:relative;display:block;margin-left:auto;margin-right:auto;z-index:1}.swiper{width:100%;height:100%;margin-left:auto;margin-right:auto;position:relative;overflow:hidden;list-style:none;padding:0;z-index:1;display:block}.swiper-vertical>.swiper-wrapper{flex-direction:column}.swiper-wrapper{position:relative;width:100%;height:100%;z-index:1;display:flex;transition-property:transform;transition-timing-function:var(--swiper-wrapper-transition-timing-function,initial);box-sizing:content-box}.swiper-android ::slotted(swiper-slide),.swiper-ios ::slotted(swiper-slide),.swiper-wrapper{transform:translate3d(0px,0,0)}.swiper-horizontal{touch-action:pan-y}.swiper-vertical{touch-action:pan-x}::slotted(swiper-slide){flex-shrink:0;width:100%;height:100%;position:relative;transition-property:transform;display:block}::slotted(.swiper-slide-invisible-blank){visibility:hidden}.swiper-autoheight,.swiper-autoheight ::slotted(swiper-slide){height:auto}.swiper-autoheight .swiper-wrapper{align-items:flex-start;transition-property:transform,height}.swiper-backface-hidden ::slotted(swiper-slide){transform:translateZ(0);-webkit-backface-visibility:hidden;backface-visibility:hidden}.swiper-3d.swiper-css-mode .swiper-wrapper{perspective:1200px}.swiper-3d .swiper-wrapper{transform-style:preserve-3d}.swiper-3d{perspective:1200px}.swiper-3d .swiper-cube-shadow,.swiper-3d ::slotted(swiper-slide){transform-style:preserve-3d}.swiper-css-mode>.swiper-wrapper{overflow:auto;scrollbar-width:none;-ms-overflow-style:none}.swiper-css-mode>.swiper-wrapper::-webkit-scrollbar{display:none}.swiper-css-mode ::slotted(swiper-slide){scroll-snap-align:start start}.swiper-css-mode.swiper-horizontal>.swiper-wrapper{scroll-snap-type:x mandatory}.swiper-css-mode.swiper-vertical>.swiper-wrapper{scroll-snap-type:y mandatory}.swiper-css-mode.swiper-free-mode>.swiper-wrapper{scroll-snap-type:none}.swiper-css-mode.swiper-free-mode ::slotted(swiper-slide){scroll-snap-align:none}.swiper-css-mode.swiper-centered>.swiper-wrapper::before{content:'';flex-shrink:0;order:9999}.swiper-css-mode.swiper-centered ::slotted(swiper-slide){scroll-snap-align:center center;scroll-snap-stop:always}.swiper-css-mode.swiper-centered.swiper-horizontal ::slotted(swiper-slide):first-child{margin-inline-start:var(--swiper-centered-offset-before)}.swiper-css-mode.swiper-centered.swiper-horizontal>.swiper-wrapper::before{height:100%;min-height:1px;width:var(--swiper-centered-offset-after)}.swiper-css-mode.swiper-centered.swiper-vertical ::slotted(swiper-slide):first-child{margin-block-start:var(--swiper-centered-offset-before)}.swiper-css-mode.swiper-centered.swiper-vertical>.swiper-wrapper::before{width:100%;min-width:1px;height:var(--swiper-centered-offset-after)}.swiper-virtual ::slotted(swiper-slide){-webkit-backface-visibility:hidden;transform:translateZ(0)}.swiper-virtual.swiper-css-mode .swiper-wrapper::after{content:'';position:absolute;left:0;top:0;pointer-events:none}.swiper-virtual.swiper-css-mode.swiper-horizontal .swiper-wrapper::after{height:1px;width:var(--swiper-virtual-size)}.swiper-virtual.swiper-css-mode.swiper-vertical .swiper-wrapper::after{width:1px;height:var(--swiper-virtual-size)}:host{--swiper-navigation-size:44px}.swiper-button-next,.swiper-button-prev{position:absolute;top:var(--swiper-navigation-top-offset,50%);width:calc(var(--swiper-navigation-size)/ 44 * 27);height:var(--swiper-navigation-size);margin-top:calc(0px - (var(--swiper-navigation-size)/ 2));z-index:10;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--swiper-navigation-color,var(--swiper-theme-color))}.swiper-button-next.swiper-button-disabled,.swiper-button-prev.swiper-button-disabled{opacity:.35;cursor:auto;pointer-events:none}.swiper-button-next.swiper-button-hidden,.swiper-button-prev.swiper-button-hidden{opacity:0;cursor:auto;pointer-events:none}.swiper-navigation-disabled .swiper-button-next,.swiper-navigation-disabled .swiper-button-prev{display:none!important}.swiper-button-next svg,.swiper-button-prev svg{width:100%;height:100%;object-fit:contain;transform-origin:center}.swiper-rtl .swiper-button-next svg,.swiper-rtl .swiper-button-prev svg{transform:rotate(180deg)}.swiper-button-prev,.swiper-rtl .swiper-button-next{left:var(--swiper-navigation-sides-offset,10px);right:auto}.swiper-button-next,.swiper-rtl .swiper-button-prev{right:var(--swiper-navigation-sides-offset,10px);left:auto}.swiper-button-lock{display:none}.swiper-pagination{position:absolute;text-align:center;transition:.3s opacity;transform:translate3d(0,0,0);z-index:10}.swiper-pagination.swiper-pagination-hidden{opacity:0}.swiper-pagination-disabled>.swiper-pagination,.swiper-pagination.swiper-pagination-disabled{display:none!important}.swiper-horizontal>.swiper-pagination-bullets,.swiper-pagination-bullets.swiper-pagination-horizontal,.swiper-pagination-custom,.swiper-pagination-fraction{bottom:var(--swiper-pagination-bottom,8px);top:var(--swiper-pagination-top,auto);left:0;width:100%}.swiper-pagination-bullets-dynamic{overflow:hidden;font-size:0}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet{transform:scale(.33);position:relative}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active{transform:scale(1)}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-main{transform:scale(1)}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-prev{transform:scale(.66)}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-prev-prev{transform:scale(.33)}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-next{transform:scale(.66)}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-next-next{transform:scale(.33)}.swiper-pagination-bullet{width:var(--swiper-pagination-bullet-width,var(--swiper-pagination-bullet-size,8px));height:var(--swiper-pagination-bullet-height,var(--swiper-pagination-bullet-size,8px));display:inline-block;border-radius:var(--swiper-pagination-bullet-border-radius,50%);background:var(--swiper-pagination-bullet-inactive-color,#000);opacity:var(--swiper-pagination-bullet-inactive-opacity, .2)}button.swiper-pagination-bullet{border:none;margin:0;padding:0;box-shadow:none;-webkit-appearance:none;appearance:none}.swiper-pagination-clickable .swiper-pagination-bullet{cursor:pointer}.swiper-pagination-bullet:only-child{display:none!important}.swiper-pagination-bullet-active{opacity:var(--swiper-pagination-bullet-opacity, 1);background:var(--swiper-pagination-color,var(--swiper-theme-color))}.swiper-pagination-vertical.swiper-pagination-bullets,.swiper-vertical>.swiper-pagination-bullets{right:var(--swiper-pagination-right,8px);left:var(--swiper-pagination-left,auto);top:50%;transform:translate3d(0px,-50%,0)}.swiper-pagination-vertical.swiper-pagination-bullets .swiper-pagination-bullet,.swiper-vertical>.swiper-pagination-bullets .swiper-pagination-bullet{margin:var(--swiper-pagination-bullet-vertical-gap,6px) 0;display:block}.swiper-pagination-vertical.swiper-pagination-bullets.swiper-pagination-bullets-dynamic,.swiper-vertical>.swiper-pagination-bullets.swiper-pagination-bullets-dynamic{top:50%;transform:translateY(-50%);width:8px}.swiper-pagination-vertical.swiper-pagination-bullets.swiper-pagination-bullets-dynamic .swiper-pagination-bullet,.swiper-vertical>.swiper-pagination-bullets.swiper-pagination-bullets-dynamic .swiper-pagination-bullet{display:inline-block;transition:.2s transform,.2s top}.swiper-horizontal>.swiper-pagination-bullets .swiper-pagination-bullet,.swiper-pagination-horizontal.swiper-pagination-bullets .swiper-pagination-bullet{margin:0 var(--swiper-pagination-bullet-horizontal-gap,4px)}.swiper-horizontal>.swiper-pagination-bullets.swiper-pagination-bullets-dynamic,.swiper-pagination-horizontal.swiper-pagination-bullets.swiper-pagination-bullets-dynamic{left:50%;transform:translateX(-50%);white-space:nowrap}.swiper-horizontal>.swiper-pagination-bullets.swiper-pagination-bullets-dynamic .swiper-pagination-bullet,.swiper-pagination-horizontal.swiper-pagination-bullets.swiper-pagination-bullets-dynamic .swiper-pagination-bullet{transition:.2s transform,.2s left}.swiper-horizontal.swiper-rtl>.swiper-pagination-bullets-dynamic .swiper-pagination-bullet{transition:.2s transform,.2s right}.swiper-pagination-fraction{color:var(--swiper-pagination-fraction-color,inherit)}.swiper-pagination-progressbar{background:var(--swiper-pagination-progressbar-bg-color,rgba(0,0,0,.25));position:absolute}.swiper-pagination-progressbar .swiper-pagination-progressbar-fill{background:var(--swiper-pagination-color,var(--swiper-theme-color));position:absolute;left:0;top:0;width:100%;height:100%;transform:scale(0);transform-origin:left top}.swiper-rtl .swiper-pagination-progressbar .swiper-pagination-progressbar-fill{transform-origin:right top}.swiper-horizontal>.swiper-pagination-progressbar,.swiper-pagination-progressbar.swiper-pagination-horizontal,.swiper-pagination-progressbar.swiper-pagination-vertical.swiper-pagination-progressbar-opposite,.swiper-vertical>.swiper-pagination-progressbar.swiper-pagination-progressbar-opposite{width:100%;height:var(--swiper-pagination-progressbar-size,4px);left:0;top:0}.swiper-horizontal>.swiper-pagination-progressbar.swiper-pagination-progressbar-opposite,.swiper-pagination-progressbar.swiper-pagination-horizontal.swiper-pagination-progressbar-opposite,.swiper-pagination-progressbar.swiper-pagination-vertical,.swiper-vertical>.swiper-pagination-progressbar{width:var(--swiper-pagination-progressbar-size,4px);height:100%;left:0;top:0}.swiper-pagination-lock{display:none}.swiper-scrollbar{border-radius:var(--swiper-scrollbar-border-radius,10px);position:relative;touch-action:none;background:var(--swiper-scrollbar-bg-color,rgba(0,0,0,.1))}.swiper-scrollbar-disabled>.swiper-scrollbar,.swiper-scrollbar.swiper-scrollbar-disabled{display:none!important}.swiper-horizontal>.swiper-scrollbar,.swiper-scrollbar.swiper-scrollbar-horizontal{position:absolute;left:var(--swiper-scrollbar-sides-offset,1%);bottom:var(--swiper-scrollbar-bottom,4px);top:var(--swiper-scrollbar-top,auto);z-index:50;height:var(--swiper-scrollbar-size,4px);width:calc(100% - 2 * var(--swiper-scrollbar-sides-offset,1%))}.swiper-scrollbar.swiper-scrollbar-vertical,.swiper-vertical>.swiper-scrollbar{position:absolute;left:var(--swiper-scrollbar-left,auto);right:var(--swiper-scrollbar-right,4px);top:var(--swiper-scrollbar-sides-offset,1%);z-index:50;width:var(--swiper-scrollbar-size,4px);height:calc(100% - 2 * var(--swiper-scrollbar-sides-offset,1%))}.swiper-scrollbar-drag{height:100%;width:100%;position:relative;background:var(--swiper-scrollbar-drag-bg-color,rgba(0,0,0,.5));border-radius:var(--swiper-scrollbar-border-radius,10px);left:0;top:0}.swiper-scrollbar-cursor-drag{cursor:move}.swiper-scrollbar-lock{display:none}::slotted(.swiper-slide-zoomed){cursor:move;touch-action:none}.swiper .swiper-notification{position:absolute;left:0;top:0;pointer-events:none;opacity:0;z-index:-1000}.swiper-free-mode>.swiper-wrapper{transition-timing-function:ease-out;margin:0 auto}.swiper-grid>.swiper-wrapper{flex-wrap:wrap}.swiper-grid-column>.swiper-wrapper{flex-wrap:wrap;flex-direction:column}.swiper-fade.swiper-free-mode ::slotted(swiper-slide){transition-timing-function:ease-out}.swiper-fade ::slotted(swiper-slide){pointer-events:none;transition-property:opacity}.swiper-fade ::slotted(swiper-slide) ::slotted(swiper-slide){pointer-events:none}.swiper-fade ::slotted(.swiper-slide-active){pointer-events:auto}.swiper-fade ::slotted(.swiper-slide-active) ::slotted(.swiper-slide-active){pointer-events:auto}.swiper.swiper-cube{overflow:visible}.swiper-cube ::slotted(swiper-slide){pointer-events:none;-webkit-backface-visibility:hidden;backface-visibility:hidden;z-index:1;visibility:hidden;transform-origin:0 0;width:100%;height:100%}.swiper-cube ::slotted(swiper-slide) ::slotted(swiper-slide){pointer-events:none}.swiper-cube.swiper-rtl ::slotted(swiper-slide){transform-origin:100% 0}.swiper-cube ::slotted(.swiper-slide-active),.swiper-cube ::slotted(.swiper-slide-active) ::slotted(.swiper-slide-active){pointer-events:auto}.swiper-cube ::slotted(.swiper-slide-active),.swiper-cube ::slotted(.swiper-slide-next),.swiper-cube ::slotted(.swiper-slide-prev){pointer-events:auto;visibility:visible}.swiper-cube .swiper-cube-shadow{position:absolute;left:0;bottom:0px;width:100%;height:100%;opacity:.6;z-index:0}.swiper-cube .swiper-cube-shadow:before{content:'';background:#000;position:absolute;left:0;top:0;bottom:0;right:0;filter:blur(50px)}.swiper-cube ::slotted(.swiper-slide-next)+::slotted(swiper-slide){pointer-events:auto;visibility:visible}.swiper.swiper-flip{overflow:visible}.swiper-flip ::slotted(swiper-slide){pointer-events:none;-webkit-backface-visibility:hidden;backface-visibility:hidden;z-index:1}.swiper-flip ::slotted(swiper-slide) ::slotted(swiper-slide){pointer-events:none}.swiper-flip ::slotted(.swiper-slide-active),.swiper-flip ::slotted(.swiper-slide-active) ::slotted(.swiper-slide-active){pointer-events:auto}.swiper-creative ::slotted(swiper-slide){-webkit-backface-visibility:hidden;backface-visibility:hidden;overflow:hidden;transition-property:transform,opacity,height}.swiper.swiper-cards{overflow:visible}.swiper-cards ::slotted(swiper-slide){transform-origin:center bottom;-webkit-backface-visibility:hidden;backface-visibility:hidden;overflow:hidden}`;
    const SwiperSlideCSS = `::slotted(.swiper-slide-shadow),::slotted(.swiper-slide-shadow-bottom),::slotted(.swiper-slide-shadow-left),::slotted(.swiper-slide-shadow-right),::slotted(.swiper-slide-shadow-top){position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:10}::slotted(.swiper-slide-shadow){background:rgba(0,0,0,.15)}::slotted(.swiper-slide-shadow-left){background-image:linear-gradient(to left,rgba(0,0,0,.5),rgba(0,0,0,0))}::slotted(.swiper-slide-shadow-right){background-image:linear-gradient(to right,rgba(0,0,0,.5),rgba(0,0,0,0))}::slotted(.swiper-slide-shadow-top){background-image:linear-gradient(to top,rgba(0,0,0,.5),rgba(0,0,0,0))}::slotted(.swiper-slide-shadow-bottom){background-image:linear-gradient(to bottom,rgba(0,0,0,.5),rgba(0,0,0,0))}.swiper-lazy-preloader{animation:swiper-preloader-spin 1s infinite linear;width:42px;height:42px;position:absolute;left:50%;top:50%;margin-left:-21px;margin-top:-21px;z-index:10;transform-origin:50%;box-sizing:border-box;border:4px solid var(--swiper-preloader-color,var(--swiper-theme-color));border-radius:50%;border-top-color:transparent}@keyframes swiper-preloader-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}::slotted(.swiper-slide-shadow-cube.swiper-slide-shadow-bottom),::slotted(.swiper-slide-shadow-cube.swiper-slide-shadow-left),::slotted(.swiper-slide-shadow-cube.swiper-slide-shadow-right),::slotted(.swiper-slide-shadow-cube.swiper-slide-shadow-top){z-index:0;-webkit-backface-visibility:hidden;backface-visibility:hidden}::slotted(.swiper-slide-shadow-flip.swiper-slide-shadow-bottom),::slotted(.swiper-slide-shadow-flip.swiper-slide-shadow-left),::slotted(.swiper-slide-shadow-flip.swiper-slide-shadow-right),::slotted(.swiper-slide-shadow-flip.swiper-slide-shadow-top){z-index:0;-webkit-backface-visibility:hidden;backface-visibility:hidden}::slotted(.swiper-zoom-container){width:100%;height:100%;display:flex;justify-content:center;align-items:center;text-align:center}::slotted(.swiper-zoom-container)>canvas,::slotted(.swiper-zoom-container)>img,::slotted(.swiper-zoom-container)>svg{max-width:100%;max-height:100%;object-fit:contain}`;

    class DummyHTMLElement {}
    const ClassToExtend = typeof window === 'undefined' || typeof HTMLElement === 'undefined' ? DummyHTMLElement : HTMLElement;
    const arrowSvg = `<svg width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.38296 20.0762C0.111788 19.805 0.111788 19.3654 0.38296 19.0942L9.19758 10.2796L0.38296 1.46497C0.111788 1.19379 0.111788 0.754138 0.38296 0.482966C0.654131 0.211794 1.09379 0.211794 1.36496 0.482966L10.4341 9.55214C10.8359 9.9539 10.8359 10.6053 10.4341 11.007L1.36496 20.0762C1.09379 20.3474 0.654131 20.3474 0.38296 20.0762Z" fill="currentColor"/></svg>
    `;
    const addStyle = (shadowRoot, styles) => {
      if (typeof CSSStyleSheet !== 'undefined' && shadowRoot.adoptedStyleSheets) {
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(styles);
        shadowRoot.adoptedStyleSheets = [styleSheet];
      } else {
        const style = document.createElement('style');
        style.rel = 'stylesheet';
        style.textContent = styles;
        shadowRoot.appendChild(style);
      }
    };
    class SwiperContainer extends ClassToExtend {
      constructor() {
        super();
        this.attachShadow({
          mode: 'open'
        });
      }
      static get nextButtonSvg() {
        return arrowSvg;
      }
      static get prevButtonSvg() {
        return arrowSvg.replace('/></svg>', ' transform-origin="center" transform="rotate(180)"/></svg>');
      }
      cssStyles() {
        return [SwiperCSS,
        // eslint-disable-line
        ...(this.injectStyles && Array.isArray(this.injectStyles) ? this.injectStyles : [])].join('\n');
      }
      cssLinks() {
        return this.injectStylesUrls || [];
      }
      calcSlideSlots() {
        const currentSideSlots = this.slideSlots || 0;
        // slide slots
        const slideSlotChildren = [...this.querySelectorAll(`[slot^=slide-]`)].map(child => {
          return parseInt(child.getAttribute('slot').split('slide-')[1], 10);
        });
        this.slideSlots = slideSlotChildren.length ? Math.max(...slideSlotChildren) + 1 : 0;
        if (!this.rendered) return;
        if (this.slideSlots > currentSideSlots) {
          for (let i = currentSideSlots; i < this.slideSlots; i += 1) {
            const slideEl = document.createElement('swiper-slide');
            slideEl.setAttribute('part', `slide slide-${i + 1}`);
            const slotEl = document.createElement('slot');
            slotEl.setAttribute('name', `slide-${i + 1}`);
            slideEl.appendChild(slotEl);
            this.shadowRoot.querySelector('.swiper-wrapper').appendChild(slideEl);
          }
        } else if (this.slideSlots < currentSideSlots) {
          const slides = this.swiper.slides;
          for (let i = slides.length - 1; i >= 0; i -= 1) {
            if (i > this.slideSlots) {
              slides[i].remove();
            }
          }
        }
      }
      render() {
        if (this.rendered) return;
        this.calcSlideSlots();

        // local styles
        let localStyles = this.cssStyles();
        if (this.slideSlots > 0) {
          localStyles = localStyles.replace(/::slotted\(([a-z-0-9.]*)\)/g, '$1');
        }
        if (localStyles.length) {
          addStyle(this.shadowRoot, localStyles);
        }
        this.cssLinks().forEach(url => {
          const linkExists = this.shadowRoot.querySelector(`link[href="${url}"]`);
          if (linkExists) return;
          const linkEl = document.createElement('link');
          linkEl.rel = 'stylesheet';
          linkEl.href = url;
          this.shadowRoot.appendChild(linkEl);
        });
        // prettier-ignore
        const el = document.createElement('div');
        el.classList.add('swiper');
        el.part = 'container';

        // prettier-ignore
        el.innerHTML = `
      <slot name="container-start"></slot>
      <div class="swiper-wrapper" part="wrapper">
        <slot></slot>
        ${Array.from({
      length: this.slideSlots
    }).map((_, index) => `
        <swiper-slide part="slide slide-${index}">
          <slot name="slide-${index}"></slot>
        </swiper-slide>
        `).join('')}
      </div>
      <slot name="container-end"></slot>
      ${needsNavigation(this.passedParams) ? `
        <div part="button-prev" class="swiper-button-prev">${this.constructor.prevButtonSvg}</div>
        <div part="button-next" class="swiper-button-next">${this.constructor.nextButtonSvg}</div>
      ` : ''}
      ${needsPagination(this.passedParams) ? `
        <div part="pagination" class="swiper-pagination"></div>
      ` : ''}
      ${needsScrollbar(this.passedParams) ? `
        <div part="scrollbar" class="swiper-scrollbar"></div>
      ` : ''}
    `;
        this.shadowRoot.appendChild(el);
        this.rendered = true;
      }
      initialize() {
        var _this = this;
        if (this.swiper && this.swiper.initialized) return;
        const {
          params: swiperParams,
          passedParams
        } = getParams(this);
        this.swiperParams = swiperParams;
        this.passedParams = passedParams;
        delete this.swiperParams.init;
        this.render();

        // eslint-disable-next-line
        this.swiper = new Swiper(this.shadowRoot.querySelector('.swiper'), {
          ...(swiperParams.virtual ? {} : {
            observer: true
          }),
          ...swiperParams,
          touchEventsTarget: 'container',
          onAny: function (name) {
            if (name === 'observerUpdate') {
              _this.calcSlideSlots();
            }
            const eventName = swiperParams.eventsPrefix ? `${swiperParams.eventsPrefix}${name.toLowerCase()}` : name.toLowerCase();
            for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
              args[_key - 1] = arguments[_key];
            }
            const event = new CustomEvent(eventName, {
              detail: args,
              bubbles: name !== 'hashChange',
              cancelable: true
            });
            _this.dispatchEvent(event);
          }
        });
      }
      connectedCallback() {
        if (this.swiper && this.swiper.initialized && this.nested && this.closest('swiper-slide') && this.closest('swiper-slide').swiperLoopMoveDOM) {
          return;
        }
        if (this.init === false || this.getAttribute('init') === 'false') {
          return;
        }
        this.initialize();
      }
      disconnectedCallback() {
        if (this.nested && this.closest('swiper-slide') && this.closest('swiper-slide').swiperLoopMoveDOM) {
          return;
        }
        if (this.swiper && this.swiper.destroy) {
          this.swiper.destroy();
        }
      }
      updateSwiperOnPropChange(propName, propValue) {
        const {
          params: swiperParams,
          passedParams
        } = getParams(this, propName, propValue);
        this.passedParams = passedParams;
        this.swiperParams = swiperParams;
        if (this.swiper && this.swiper.params[propName] === propValue) {
          return;
        }
        updateSwiper({
          swiper: this.swiper,
          passedParams: this.passedParams,
          changedParams: [attrToProp(propName)],
          ...(propName === 'navigation' && passedParams[propName] ? {
            prevEl: '.swiper-button-prev',
            nextEl: '.swiper-button-next'
          } : {}),
          ...(propName === 'pagination' && passedParams[propName] ? {
            paginationEl: '.swiper-pagination'
          } : {}),
          ...(propName === 'scrollbar' && passedParams[propName] ? {
            scrollbarEl: '.swiper-scrollbar'
          } : {})
        });
      }
      attributeChangedCallback(attr, prevValue, newValue) {
        if (!(this.swiper && this.swiper.initialized)) return;
        if (prevValue === 'true' && newValue === null) {
          newValue = false;
        }
        this.updateSwiperOnPropChange(attr, newValue);
      }
      static get observedAttributes() {
        const attrs = paramsList.filter(param => param.includes('_')).map(param => param.replace(/[A-Z]/g, v => `-${v}`).replace('_', '').toLowerCase());
        return attrs;
      }
    }
    paramsList.forEach(paramName => {
      if (paramName === 'init') return;
      paramName = paramName.replace('_', '');
      Object.defineProperty(SwiperContainer.prototype, paramName, {
        configurable: true,
        get() {
          return (this.passedParams || {})[paramName];
        },
        set(value) {
          if (!this.passedParams) this.passedParams = {};
          this.passedParams[paramName] = value;
          if (!(this.swiper && this.swiper.initialized)) return;
          this.updateSwiperOnPropChange(paramName, value);
        }
      });
    });
    class SwiperSlide extends ClassToExtend {
      constructor() {
        super();
        this.attachShadow({
          mode: 'open'
        });
      }
      render() {
        const lazy = this.lazy || this.getAttribute('lazy') === '' || this.getAttribute('lazy') === 'true';
        addStyle(this.shadowRoot, SwiperSlideCSS);
        this.shadowRoot.appendChild(document.createElement('slot'));
        if (lazy) {
          const lazyDiv = document.createElement('div');
          lazyDiv.classList.add('swiper-lazy-preloader');
          lazyDiv.part.add('preloader');
          this.shadowRoot.appendChild(lazyDiv);
        }
      }
      initialize() {
        this.render();
      }
      connectedCallback() {
        if (this.swiperLoopMoveDOM) {
          return;
        }
        this.initialize();
      }
    }

    // eslint-disable-next-line
    const register = () => {
      if (typeof window === 'undefined') return;
      if (!window.customElements.get('swiper-container')) window.customElements.define('swiper-container', SwiperContainer);
      if (!window.customElements.get('swiper-slide')) window.customElements.define('swiper-slide', SwiperSlide);
    };
    if (typeof window !== 'undefined') {
      window.SwiperElementRegisterParams = params => {
        paramsList.push(...params);
      };
    }

    // import { Navigation, Pagination } from 'swiper/modules';

    // register Swiper custom elements
    register();

    // const swiperElements = document.querySelectorAll('swiper-container');
    //
    // const params = {
    //   // array with CSS styles
    //   injectStyles: [
    //     `
    //       .swiper {
    //         overflow: var(--overflow-state);
    //       }
    //       `,
    //   ],
    //
    //   // array with CSS urls
    //   // injectStylesUrls: ['path/to/one.css', 'path/to/two.css'],
    // };
    //
    // swiperElements.forEach((swiperElement) => {
    //   Object.assign(swiperElement, params);
    //
    //   swiperElement.initialize();
    // });

    const classes$2 = {
      added: 'is-added',
      animated: 'is-animated',
      disabled: 'is-disabled',
      error: 'has-error',
      loading: 'is-loading',
      open: 'is-open',
      visible: 'is-visible',
    };

    const selectors$2 = {
      modalClose: '[data-product-upsell-close]',
      keepShopping: '[data-product-upsell-keep-shopping]',
      goToCart: '[data-product-upsell-go-to-cart]',
      addToCart: '[data-add-to-cart]',
      cartDrawer: 'cart-drawer',
    };

    const attributes$1 = {
      closing: 'closing',
    };

    if (!customElements.get('product-upsell-popup')) {
      customElements.define(
        'product-upsell-popup',

        class ProductUpsellPopup extends HTMLElement {
          constructor() {
            super();
            this.a11y = window.theme.a11y;
            this.modalClose = this.modalClose.bind(this);
            this.modal = this.querySelector('dialog');

            this.init();
          }

          init() {
            this.modal.querySelector(selectors$2.modalClose)?.addEventListener('click', (e) => {
              e.preventDefault();
              this.modalClose();
            });
            this.modal.querySelector(selectors$2.keepShopping)?.addEventListener('click', (e) => {
              e.preventDefault();
              this.modalClose();
            });
            this.modal.querySelector(selectors$2.goToCart)?.addEventListener('click', (e) => {
              e.preventDefault();
              this.goToCart();
            });
            this.modal.querySelector(selectors$2.addToCart)?.addEventListener('click', (e) => {
              e.preventDefault();
              setTimeout(() => {
                this.goToCart();
              }, 2000);
            });
          }

          goToCart() {
            if (theme.settings.cartType !== 'drawer') return;
            this.modalClose();
            const cartDrawer = document.querySelector(selectors$2.cartDrawer);

            if (cartDrawer) {
              cartDrawer.dispatchEvent(new CustomEvent('theme:cart-drawer:show'));
              window.theme.a11y.lastElement = selectors$2.goToCart;
            }
          }

          modalOpen() {
            // Check if browser supports Dialog tags
            if (typeof this.modal.show === 'function') {
              this.modal.show();
            }

            this.modal.setAttribute('open', true);
            this.modal.removeAttribute('inert');

            document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
          }

          modalClose() {

            // Check if browser supports Dialog tags
            if (typeof this.modal.close === 'function') {
              this.modal.close();
            } else {
              this.modal.removeAttribute('open');
            }

            this.modal.removeAttribute(attributes$1.closing);
            this.modal.setAttribute('inert', '');
            this.modal.classList.remove(classes$2.loading);

            // Unlock scroll if no other drawers & modals are open
            if (!window.theme.hasOpenModals()) {
              document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
            }

            this.a11y.removeTrapFocus();
            this.a11y.autoFocusLastElement();
          }
        }
      );
    }

    class DecorativeElement extends HTMLElement {
      constructor() {
        super();
        this.animationLayout = this.dataset?.animationLayout || 'desktop';
        this.animationElement = this.querySelector('[data-animation-element]');
        this.scrollAnimation = this.dataset?.scrollAnimation || 'none';
        this.scrollDirection = this.dataset?.scrollDirection || 'down';
        this.rotateEffect = this.dataset?.rotateEffect === 'true';
        this.rotateFrom = this.dataset?.rotateEffectFrom;
        this.rotateTo = this.dataset?.rotateEffectTo;
        this.scrollPercentage = parseFloat(this.dataset?.scrollPercentage || '0');

        if (!this.animationElement) return;
        this.init();
      }

      init() {
        if (this.scrollAnimation !== 'none') {
          this.setupScrollAnimation();
        }
      }

      setupScrollAnimation() {
        this.viewportHeight = window.innerHeight;
        this.boundHandleScroll = this.handleScroll.bind(this);
        this.boundHandleResize = this.handleResize.bind(this);

        window.addEventListener('scroll', this.boundHandleScroll, {passive: true});
        window.addEventListener('resize', this.boundHandleResize);

        this.handleScroll();
      }

      handleResize() {
        this.viewportHeight = window.innerHeight;
        this.handleScroll();
      }

      handleScroll() {
        const currentScroll = window.scrollY;
        const elementRect = this.getBoundingClientRect();
        const elementTop = elementRect.top + window.scrollY;

        if (currentScroll < elementRect.top || currentScroll === 0) {
          this.resetTransform();
          return;
        }

        if (!this.isInViewport()) {
          return;
        }


        const scrollStart = elementTop - this.viewportHeight;
        const scrollDistance = elementRect.height + this.viewportHeight;
        let scrollProgress = Math.min(Math.max((currentScroll - scrollStart) / scrollDistance, 0), 1);
        this.updateScrollTransform(scrollProgress);
      }

      isInViewport() {
        const rect = this.getBoundingClientRect();
        return (rect.bottom >= -100 && rect.top <= window.innerHeight + 100);
      }

      resetTransform() {
        if (this.animationElement) {
          this.animationElement.style.transform = '';
        }
      }

      updateScrollTransform(progress) {
        if (!this.animationElement) return;

        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
        }

        this.animationFrameId = requestAnimationFrame(() => {
          let translateValue = Math.round((this.scrollPercentage * progress) / 5) * 5;
          let translateX = 0;
          let translateY = 0;
          let rotate = '';
          const direction = this.scrollDirection || 'down';
          const rotateFrom = parseFloat(this.rotateFrom);
          const rotateTo = parseFloat(this.rotateTo);
          const currentDeg = rotateFrom + (rotateTo - rotateFrom) * progress;

          if (direction.includes('up')) {
            translateY = -translateValue;
          } else if (direction.includes('down')) {
            translateY = translateValue;
          }

          if (direction.includes('left')) {
            translateX = -translateValue;
            if (this.rotateEffect && this.rotateFrom === this.rotateTo) {
              rotate = `scale(1.1) rotate(${this.rotateFrom}deg)`;
            } else if (this.rotateEffect && this.rotateFrom !== this.rotateTo){
              rotate = `scale(1) rotate(${currentDeg}deg)`;
            }
          } else if (direction.includes('right')) {
            translateX = translateValue;
            if (this.rotateEffect && this.rotateFrom === this.rotateTo) {
              rotate = `scale(1.1) rotate(${this.rotateTo}deg)`;
            } else if (this.rotateEffect && this.rotateFrom !== this.rotateTo){
              rotate = `scale(1) rotate(${currentDeg}deg)`;
            }
          }


          if ((direction.includes('up') || direction.includes('down')) &&
              (direction.includes('left') || direction.includes('right'))) {
            translateX = translateX * 0.7071;
            translateY = translateY * 0.7071;
          }

          this.animationElement.style.transform = `translate(${translateX}%, ${translateY}%) ${rotate}`;
        });
      }

      disconnectedCallback() {
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
        }

        if (this.scrollAnimation !== 'none') {
          window.removeEventListener('scroll', this.boundHandleScroll);
          window.removeEventListener('resize', this.boundHandleResize);
        }
      }
    }

    if (!customElements.get('decorative-element')) {
      customElements.define('decorative-element', DecorativeElement);
    }

    // List of attributes: 
    // orientation:  String | up - right - down - left - up left - up right - down left - left right
    // scale: Number | need to be above 1.0
    // overflow: Boolean
    // delay: Number | the delay is in second
    // transition: any CSS transition
    // maxTransition: it should be a percentage between 1 and 99
    // src: String
    // customContainer: String or Node
    // customWrapper: String

    const attributes = {
      simpleParallaxElement: 'data-simple-parallax-element',
      orientation: 'data-parallax-orientation',
      scale: 'data-parallax-scale',
      overflow: 'data-parallax-overflow',
      delay: 'data-parallax-delay',
      transition: 'data-parallax-transition',
      maxTransition: 'data-parallax-max-transition',
      src: 'data-parallax-src',
      customContainer: 'data-parallax-custom-container',
      customWrapper: 'data-parallax-custom-wrapper',
    };

    function initSimpleParallax() {
      const parallaxElements = document.querySelectorAll(`[${attributes.simpleParallaxElement}]`);

      if (!parallaxElements.length) return;

      parallaxElements.forEach((element) => {
        const orientation = element.getAttribute(attributes.orientation);
        const scale = Number(element.getAttribute(attributes.scale));
        const overflow = element.getAttribute(attributes.overflow);
        const delay = Number(element.getAttribute(attributes.delay));
        const transition = element.getAttribute(attributes.transition);
        const maxTransition = Number(element.getAttribute(attributes.maxTransition));
        const src = element.getAttribute(attributes.src);
        const customContainer = element.getAttribute(attributes.customContainer);
        const customWrapper = element.getAttribute(attributes.customWrapper);

        const options = {};

        if (orientation) options.orientation = orientation;
        if (scale) options.scale = scale;
        if (overflow === 'true' || overflow === 'false') options.overflow = overflow === 'true';
        if (delay) options.delay = delay;
        if (transition) options.transition = transition;
        if (maxTransition) options.maxTransition = maxTransition;
        if (src) options.src = src;
        if (customContainer) options.customContainer = customContainer;
        if (customWrapper) options.customWrapper = customWrapper;

        new window.theme.SimpleParallax(element, options);
      });
    }

    document.addEventListener('DOMContentLoaded', () => {
      initSimpleParallax();
    });

    function getScript(url, callback, callbackError) {
      let head = document.getElementsByTagName('head')[0];
      let done = false;
      let script = document.createElement('script');
      script.src = url;

      // Attach handlers for all browsers
      script.onload = script.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
          done = true;
          callback();
        } else {
          callbackError();
        }
      };

      head.appendChild(script);
    }

    const loaders = {};

    function loadScript(options = {}) {
      if (!options.type) {
        options.type = 'json';
      }

      if (options.url) {
        if (loaders[options.url]) {
          return loaders[options.url];
        } else {
          return getScriptWithPromise(options.url, options.type);
        }
      } else if (options.json) {
        if (loaders[options.json]) {
          return Promise.resolve(loaders[options.json]);
        } else {
          return window
            .fetch(options.json)
            .then((response) => {
              return response.json();
            })
            .then((response) => {
              loaders[options.json] = response;
              return response;
            });
        }
      } else if (options.name) {
        const key = ''.concat(options.name, options.version);
        if (loaders[key]) {
          return loaders[key];
        } else {
          return loadShopifyWithPromise(options);
        }
      } else {
        return Promise.reject();
      }
    }

    function getScriptWithPromise(url, type) {
      const loader = new Promise((resolve, reject) => {
        if (type === 'text') {
          fetch(url)
            .then((response) => response.text())
            .then((data) => {
              resolve(data);
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          getScript(
            url,
            function () {
              resolve();
            },
            function () {
              reject();
            }
          );
        }
      });

      loaders[url] = loader;
      return loader;
    }

    function loadShopifyWithPromise(options) {
      const key = ''.concat(options.name, options.version);
      const loader = new Promise((resolve, reject) => {
        try {
          window.Shopify.loadFeatures([
            {
              name: options.name,
              version: options.version,
              onLoad: (err) => {
                onLoadFromShopify(resolve, reject, err);
              },
            },
          ]);
        } catch (err) {
          reject(err);
        }
      });
      loaders[key] = loader;
      return loader;
    }

    function onLoadFromShopify(resolve, reject, err) {
      if (err) {
        return reject(err);
      } else {
        return resolve();
      }
    }

    document.addEventListener('DOMContentLoaded', function () {
      // Scroll to top button
      const scrollTopButton = document.querySelector('[data-scroll-top-button]');
      if (scrollTopButton) {
        scrollTopButton.addEventListener('click', () => {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
          });
        });
        document.addEventListener('theme:scroll', () => {
          scrollTopButton.classList.toggle('is-visible', window.scrollY > window.innerHeight);
        });
      }

      if (window.self !== window.top) {
        document.querySelector('html').classList.add('iframe');
      }

      // Safari smoothscroll polyfill
      let hasNativeSmoothScroll = 'scrollBehavior' in document.documentElement.style;
      if (!hasNativeSmoothScroll) {
        loadScript({url: window.theme.assets.smoothscroll});
      }
    });

    // Apply a specific class to the html element for browser support of cookies.
    if (window.navigator.cookieEnabled) {
      document.documentElement.className = document.documentElement.className.replace('supports-no-cookies', 'supports-cookies');
    }

    function floatLabels(container) {
      const floats = container.querySelectorAll('.form-field');
      floats.forEach((element) => {
        const label = element.querySelector('label');
        const input = element.querySelector('input, textarea');
        if (label && input) {
          input.addEventListener('keyup', (event) => {
            if (event.target.value !== '') {
              label.classList.add('label--float');
            } else {
              label.classList.remove('label--float');
            }
          });
          if (input.value && input.value.length) {
            label.classList.add('label--float');
          }
        }
      });
    }

    let lastWindowWidth = window.theme.getWindowWidth();
    let lastWindowHeight = window.theme.getWindowHeight();

    function dispatch$1() {
      document.dispatchEvent(
        new CustomEvent('theme:resize', {
          bubbles: true,
        })
      );

      if (lastWindowWidth !== window.theme.getWindowWidth()) {
        document.dispatchEvent(
          new CustomEvent('theme:resize:width', {
            bubbles: true,
          })
        );

        lastWindowWidth = window.theme.getWindowWidth();
      }

      if (lastWindowHeight !== window.theme.getWindowHeight()) {
        document.dispatchEvent(
          new CustomEvent('theme:resize:height', {
            bubbles: true,
          })
        );

        lastWindowHeight = window.theme.getWindowHeight();
      }
    }

    function resizeListener() {
      window.addEventListener(
        'resize',
        window.theme.debounce(function () {
          dispatch$1();
        }, 50)
      );
    }

    let prev = window.scrollY;
    let up = null;
    let down = null;
    let wasUp = null;
    let wasDown = null;
    let scrollLockTimer = 0;

    function dispatch() {
      const position = window.scrollY;
      if (position > prev) {
        down = true;
        up = false;
      } else if (position < prev) {
        down = false;
        up = true;
      } else {
        up = null;
        down = null;
      }
      prev = position;
      document.dispatchEvent(
        new CustomEvent('theme:scroll', {
          detail: {
            up,
            down,
            position,
          },
          bubbles: false,
        })
      );
      if (up && !wasUp) {
        document.dispatchEvent(
          new CustomEvent('theme:scroll:up', {
            detail: {position},
            bubbles: false,
          })
        );
      }
      if (down && !wasDown) {
        document.dispatchEvent(
          new CustomEvent('theme:scroll:down', {
            detail: {position},
            bubbles: false,
          })
        );
      }
      wasDown = down;
      wasUp = up;
    }

    function lock(e) {
      // Prevent body scroll lock race conditions
      setTimeout(() => {
        if (scrollLockTimer) {
          clearTimeout(scrollLockTimer);
        }

        window.theme.ScrollLock.disablePageScroll(e.detail, {
          allowTouchMove: (el) => el.tagName === 'TEXTAREA',
        });

        document.documentElement.setAttribute('data-scroll-locked', '');
      });
    }

    function unlock(e) {
      const timeout = e.detail;

      if (timeout) {
        scrollLockTimer = setTimeout(removeScrollLock, timeout);
      } else {
        removeScrollLock();
      }
    }

    function removeScrollLock() {
      window.theme.ScrollLock.clearQueueScrollLocks();
      window.theme.ScrollLock.enablePageScroll();
      document.documentElement.removeAttribute('data-scroll-locked');
    }

    function scrollListener() {
      let timeout;
      window.addEventListener(
        'scroll',
        function () {
          if (timeout) {
            window.cancelAnimationFrame(timeout);
          }
          timeout = window.requestAnimationFrame(function () {
            dispatch();
          });
        },
        {passive: true}
      );

      window.addEventListener('theme:scroll:lock', lock);
      window.addEventListener('theme:scroll:unlock', unlock);
    }

    function isTouchDevice() {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }

    function isTouch() {
      if (isTouchDevice()) {
        document.documentElement.className = document.documentElement.className.replace('no-touch', 'supports-touch');
        window.theme.touch = true;
      } else {
        window.theme.touch = false;
      }
    }

    function loading() {
      document.body.classList.add('is-loaded');
    }

    const classes$1 = {
      loading: 'is-loading',
    };

    const selectors$1 = {
      img: 'img.is-loading',
    };

    /*
      Catch images loaded events and add class "is-loaded" to them and their containers
    */
    function loadedImagesEventHook() {
      document.addEventListener(
        'load',
        (e) => {
          if (e.target.tagName.toLowerCase() == 'img' && e.target.classList.contains(classes$1.loading)) {
            e.target.classList.remove(classes$1.loading);
            e.target.parentNode.classList.remove(classes$1.loading);

            if (e.target.parentNode.parentNode.classList.contains(classes$1.loading)) {
              e.target.parentNode.parentNode.classList.remove(classes$1.loading);
            }
          }
        },
        true
      );
    }

    /*
      Remove "is-loading" class to the loaded images and their containers
    */
    function removeLoadingClassFromLoadedImages(container) {
      container.querySelectorAll(selectors$1.img).forEach((img) => {
        if (img.complete) {
          img.classList.remove(classes$1.loading);
          img.parentNode.classList.remove(classes$1.loading);

          if (img.parentNode.parentNode.classList.contains(classes$1.loading)) {
            img.parentNode.parentNode.classList.remove(classes$1.loading);
          }
        }
      });
    }

    const selectors = {
      aos: '[data-aos]:not(.aos-animate)',
      aosAnchor: '[data-aos-anchor]',
      aosIndividual: '[data-aos]:not([data-aos-anchor]):not(.aos-animate)',
    };

    const classes = {
      aosAnimate: 'aos-animate',
    };

    const observerConfig = {
      attributes: false,
      childList: true,
      subtree: true,
    };

    let anchorContainers = [];

    const mutationCallback = (mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          const element = mutation.target;
          const elementsToAnimate = element.querySelectorAll(selectors.aos);
          const anchors = element.querySelectorAll(selectors.aosAnchor);

          if (elementsToAnimate.length) {
            elementsToAnimate.forEach((element) => {
              aosItemObserver.observe(element);
            });
          }

          if (anchors.length) {
            // Get all anchors and attach observers
            initAnchorObservers(anchors);
          }
        }
      }
    };

    /*
      Observe each element that needs to be animated
    */
    const aosItemObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(classes.aosAnimate);

            // Stop observing element after it was animated
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    /*
      Observe anchor elements
    */
    const aosAnchorObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio) {
            const elementsToAnimate = entry.target.querySelectorAll(selectors.aos);

            if (elementsToAnimate.length) {
              elementsToAnimate.forEach((item) => {
                item.classList.add(classes.aosAnimate);
              });
            }

            // Stop observing anchor element after inner elements were animated
            observer.unobserve(entry.target);

            // Remove the container from the anchorContainers array
            const sectionIndex = anchorContainers.indexOf('#' + entry.target.id);
            if (sectionIndex !== -1) {
              anchorContainers.splice(sectionIndex, 1);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: [0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    /*
      Watch for mutations in the body and start observing the newly added animated elements and anchors
    */
    function bodyMutationObserver() {
      const bodyObserver = new MutationObserver(mutationCallback);
      bodyObserver.observe(document.body, observerConfig);
    }

    /*
      Observe animated elements that have attribute [data-aos]
    */
    function elementsIntersectionObserver() {
      const elementsToAnimate = document.querySelectorAll(selectors.aosIndividual);

      if (elementsToAnimate.length) {
        elementsToAnimate.forEach((element) => {
          aosItemObserver.observe(element);
        });
      }
    }

    /*
      Observe animated elements that have attribute [data-aos]
    */
    function anchorsIntersectionObserver() {
      const anchors = document.querySelectorAll(selectors.aosAnchor);

      if (anchors.length) {
        // Get all anchors and attach observers
        initAnchorObservers(anchors);
      }
    }

    function initAnchorObservers(anchors) {
      if (!anchors.length) return;

      anchors.forEach((anchor) => {
        const containerId = anchor.dataset.aosAnchor;

        // Avoid adding multiple observers to the same element
        if (containerId && anchorContainers.indexOf(containerId) === -1) {
          const container = document.querySelector(containerId);

          if (container) {
            aosAnchorObserver.observe(container);
            anchorContainers.push(containerId);
          }
        }
      });
    }

    function initAnimations() {
      elementsIntersectionObserver();
      anchorsIntersectionObserver();
      bodyMutationObserver();

      // Remove unloaded section from the anchors array on section:unload event
      document.addEventListener('shopify:section:unload', (e) => {
        const sectionId = '#' + e.target.querySelector('[data-section-id]')?.id;
        const sectionIndex = anchorContainers.indexOf(sectionId);

        if (sectionIndex !== -1) {
          anchorContainers.splice(sectionIndex, 1);
        }
      });
    }

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

})();
//# sourceMappingURL=theme.js.map
