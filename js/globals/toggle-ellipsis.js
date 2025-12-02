const selectors = {
  actions: '[data-actions]',
  content: '[data-content]',
  trigger: '[data-button]',
};

const attributes = {
  height: 'data-height',
};

const classes = {
  open: 'is-open',
  enabled: 'is-enabled',
};

class ToggleEllipsis extends HTMLElement {
  constructor() {
    super();

    this.initialHeight = this.getAttribute(attributes.height);
    this.content = this.querySelector(selectors.content);
    this.trigger = this.querySelector(selectors.trigger);
    this.actions = this.querySelector(selectors.actions);
    this.toggleActions = this.toggleActions.bind(this);
  }

  connectedCallback() {
    // Make sure the data attribute height value matches the CSS value
    this.setHeight(this.initialHeight);

    this.trigger.addEventListener('click', () => {
      this.setHeight(this.content.offsetHeight);
      this.classList.add(classes.open);
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
    this.classList.toggle(classes.enabled, this.content.offsetHeight + this.actions.offsetHeight > this.initialHeight);
  }
}

if (!customElements.get('toggle-ellipsis')) {
  customElements.define('toggle-ellipsis', ToggleEllipsis);
}
