import {PopupCookie} from './popup-cookie';

const selectors = {
  open: '[data-popup-open]',
  close: '[data-popup-close]',
  dialog: 'dialog',
  focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
  newsletterForm: '[data-newsletter-form]',
  newsletterHeading: '[data-newsletter-heading]',
  newsletterField: '[data-newsletter-field]',
};

const attributes = {
  closing: 'closing',
  delay: 'data-popup-delay',
  scrollLock: 'data-scroll-lock-required',
  cookieName: 'data-cookie-name',
  cookieValue: 'data-cookie-value',
  preventTopLayer: 'data-prevent-top-layer',
};

const classes = {
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

    this.popup = this.querySelector(selectors.dialog);
    this.preventTopLayer = this.popup.hasAttribute(attributes.preventTopLayer);
    this.enableScrollLock = this.popup.hasAttribute(attributes.scrollLock);
    this.buttonPopupOpen = this.querySelector(selectors.open);
    this.a11y = window.theme.a11y;
    this.isAnimating = false;
    this.cookie = new PopupCookie(this.popup.getAttribute(attributes.cookieName), this.popup.getAttribute(attributes.cookieValue));

    this.checkTargetReferrer();
    this.checkCookie();
    this.bindListeners();
  }

  checkTargetReferrer() {
    if (!this.popup.hasAttribute(attributes.referrer)) return;

    if (location.href.indexOf(this.popup.getAttribute(attributes.referrer)) === -1 && !window.Shopify.designMode) {
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
    this.popup.querySelectorAll(selectors.close)?.forEach((closeButton) => {
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

      const focusTarget = this.popup.querySelector('[autofocus]') || this.popup.querySelector(selectors.focusable);
      focusTarget?.focus();
    });
  }

  popupClose() {
    if (this.isAnimating || this.popup.hasAttribute('inert')) {
      return;
    }

    if (!this.popup.hasAttribute(attributes.closing)) {
      this.popup.setAttribute(attributes.closing, '');
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
    this.popup.removeAttribute(attributes.closing);

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

    this.delay = this.popup.hasAttribute(attributes.delay) ? this.popup.getAttribute(attributes.delay) : null;
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

    this.form = this.popup.querySelector(selectors.newsletterForm);
    this.heading = this.popup.querySelector(selectors.newsletterHeading);
    this.newsletterField = this.popup.querySelector(selectors.newsletterField);
  }

  connectedCallback() {
    const cookieExists = this.cookie?.read() !== false;
    const submissionSuccess = window.location.search.indexOf('?customer_posted=true') !== -1;
    const classesString = [...this.classList].toString();
    const isPositionBottom = classesString.includes(classes.bottom);
    const targetMobile = this.popup.classList.contains(classes.mobile);
    const targetDesktop = this.popup.classList.contains(classes.desktop);
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

      if (this.form && this.form.classList.contains(classes.success)) {
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

      if (this.form.classList.contains(classes.success)) {
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
    this.cartBar = document.getElementById(selectors.cartBar);

    if (!this.cartBar) return;

    const config = {attributes: true, childList: false, subtree: false};
    let isVisible = this.cartBar.classList.contains(classes.isVisible);
    document.body.classList.toggle(classes.cartBarVisible, isVisible);

    // Callback function to execute when mutations are observed
    const callback = (mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'attributes') {
          isVisible = mutation.target.classList.contains(classes.isVisible);
          document.body.classList.toggle(classes.cartBarVisible, isVisible);
        }
      }
    };

    this.observer = new MutationObserver(callback);
    this.observer.observe(this.cartBar, config);
  }

  showForm() {
    this.heading?.addEventListener('click', (event) => {
      event.preventDefault();

      this.heading.classList.add(classes.hidden);
      this.form.classList.remove(classes.hidden);
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
        this.popup.classList.add(classes.hasValue);
      }
    };

    const unsetClass = () => {
      // Reset timer if exists and is active
      if (this.resetClassTimer) {
        clearTimeout(this.resetClassTimer);
      }

      // Reset class
      this.resetClassTimer = setTimeout(() => {
        this.popup.classList.remove(classes.hasValue);
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
