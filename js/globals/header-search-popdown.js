const selectors = {
  details: 'details',
  popdown: '[data-popdown]',
  popdownClose: '[data-popdown-close]',
  input: 'input:not([type="hidden"])',
  mobileMenu: 'mobile-menu',
};

const attributes = {
  popdownUnderlay: 'data-popdown-underlay',
  scrollLocked: 'data-scroll-locked',
};

const classes = {
  open: 'is-open',
};
class SearchPopdown extends HTMLElement {
  constructor() {
    super();
    this.popdown = this.querySelector(selectors.popdown);
    this.popdownContainer = this.querySelector(selectors.details);
    this.popdownClose = this.querySelector(selectors.popdownClose);
    this.popdownTransitionCallback = this.popdownTransitionCallback.bind(this);
    this.detailsToggleCallback = this.detailsToggleCallback.bind(this);
    this.mobileMenu = this.closest(selectors.mobileMenu);
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

    if (!this.classList.contains(classes.open)) {
      this.popdownContainer.removeAttribute('open');
      this.a11y.removeTrapFocus();
    } else if (event.propertyName === 'transform' || event.propertyName === 'opacity') {
      // Wait for the 'transform' transition to complete in order to prevent jumping content issues because of the trapFocus
      this.a11y.trapFocus(this.popdown, {
        elementToFocus: this.popdown.querySelector(selectors.input),
      });
    }
  }

  onBodyClick(event) {
    if (!this.contains(event.target) || event.target.hasAttribute(attributes.popdownUnderlay)) this.close();
  }

  open() {
    this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);

    document.body.addEventListener('click', this.onBodyClickEvent);
    this.mobileMenu?.dispatchEvent(new CustomEvent('theme:search:open'));

    if (!document.documentElement.hasAttribute(attributes.scrollLocked)) {
      document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
    }

    requestAnimationFrame(() => {
      this.classList.add(classes.open);
    });
  }

  close() {
    this.classList.remove(classes.open);
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
