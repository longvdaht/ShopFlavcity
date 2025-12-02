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
