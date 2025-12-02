const selectors = {
  collapsible: '[data-collapsible]',
  trigger: '[data-collapsible-trigger]',
  body: '[data-collapsible-body]',
  content: '[data-collapsible-content]',
};

const attributes = {
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

    this.collapsibles = this.querySelectorAll(selectors.collapsible);
    this.single = this.hasAttribute(attributes.single);
    this.toggle = this.toggle.bind(this);
  }

  connectedCallback() {
    this.toggle();
    document.addEventListener('theme:resize:width', this.toggle);

    this.init();
  }

  init() {
    // renew variable since we may have rerendered them
    this.collapsibles = this.querySelectorAll(selectors.collapsible);

    this.collapsibles.forEach((collapsible) => {
      const trigger = collapsible.querySelector(selectors.trigger);
      const body = collapsible.querySelector(selectors.body);

      if (trigger && !trigger._collapsibleClick) {
        trigger._collapsibleClick = (e) => this.onCollapsibleClick(e);
        trigger.addEventListener('click', trigger._collapsibleClick);
      }

      if (body && !body._transitionHandler) {
        body._transitionHandler = (event) => {
          if (event.target !== body) return;
          if (collapsible.getAttribute(attributes.open) == 'true') {
            this.setBodyHeight(body, 'auto');
          } else if (collapsible.getAttribute(attributes.open) == 'false') {
            collapsible.removeAttribute(attributes.open);
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

    this.querySelectorAll(selectors.trigger).forEach((trigger) => {
      if (trigger._collapsibleClick) {
        trigger.removeEventListener('click', trigger._collapsibleClick);
        trigger._collapsibleClick = null;
      }
    });

    this.querySelectorAll(selectors.body).forEach((body) => {
      if (body._transitionHandler) {
        body.removeEventListener('transitionend', body._transitionHandler);
        body._transitionHandler = null;
      }
    });
  }

  toggle() {
    const isDesktopView = !window.theme.isMobile();

    this.collapsibles.forEach((collapsible) => {
      if (!collapsible.hasAttribute(attributes.desktop) && !collapsible.hasAttribute(attributes.mobile)) return;

      const enableDesktop = collapsible.hasAttribute(attributes.desktop) ? collapsible.getAttribute(attributes.desktop) : 'true';
      const enableMobile = collapsible.hasAttribute(attributes.mobile) ? collapsible.getAttribute(attributes.mobile) : 'true';
      const isEligible = (isDesktopView && enableDesktop == 'true') || (!isDesktopView && enableMobile == 'true');
      const body = collapsible.querySelector(selectors.body);

      if (isEligible) {
        collapsible.removeAttribute(attributes.disabled);
        collapsible.querySelector(selectors.trigger).removeAttribute('tabindex');
        collapsible.removeAttribute(attributes.open);

        this.setBodyHeight(body, '');
      } else {
        collapsible.setAttribute(attributes.disabled, '');
        collapsible.setAttribute('open', true);
        collapsible.querySelector(selectors.trigger).setAttribute('tabindex', -1);
      }
    });
  }

  open(collapsible) {
    if (collapsible.getAttribute('open') == 'true') return;

    const body = collapsible.querySelector(selectors.body);
    const content = collapsible.querySelector(selectors.content);

    collapsible.setAttribute('open', true);

    this.setBodyHeight(body, content.offsetHeight);

    if (collapsible.hasAttribute(attributes.scrollToContent)) {
      setTimeout(() => content.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" }), 350)
    }
  }

  close(collapsible) {
    if (!collapsible.hasAttribute('open')) return;

    const body = collapsible.querySelector(selectors.body);
    const content = collapsible.querySelector(selectors.content);

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
    const collapsible = trigger.closest(selectors.collapsible);

    // When we want only one item expanded at the same time
    if (this.single) {
      this.collapsibles.forEach((otherCollapsible) => {
        // if otherCollapsible has attribute open and it's not the one we clicked on, remove the open attribute
        if (otherCollapsible.hasAttribute(attributes.open) && otherCollapsible != collapsible) {
          requestAnimationFrame(() => {
            this.close(otherCollapsible);
          });
        }
      });
    }

    if (collapsible.hasAttribute(attributes.open)) {
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
