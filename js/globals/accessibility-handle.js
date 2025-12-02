const classes = {
  focus: 'is-focused',
};

const selectors = {
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
    this.inPageLink = document.querySelector(selectors.inPageLink);
    this.linkesWithOnlyHash = document.querySelectorAll(selectors.linkesWithOnlyHash);

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
      this.body.classList.remove(classes.focus);
    });

    document.addEventListener('keyup', (event) => {
      if (event.code !== 'Tab') {
        return;
      }

      this.body.classList.add(classes.focus);
    });
  }
}

window.theme = window.theme || {};
window.theme.Accessibility = new Accessibility();
