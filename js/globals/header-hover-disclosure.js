const selectors = {
  link: '[data-top-link]',
  wrapper: '[data-header-wrapper]',
  stagger: '[data-stagger]',
  staggerPair: '[data-stagger-first]',
  staggerAfter: '[data-stagger-second]',
  focusable: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
};

const classes = {
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

        this.wrapper = this.closest(selectors.wrapper);
        this.key = this.getAttribute('aria-controls');
        this.link = this.querySelector(selectors.link);
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
          this.wrapper.classList.add(classes.meganavIsTransitioning);
        }

        if (this.grandparent) {
          this.wrapper.classList.add(classes.meganavVisible);
        } else {
          this.wrapper.classList.remove(classes.meganavVisible);
        }
        this.setAttribute('aria-expanded', true);
        this.classList.add(classes.isVisible);
        this.disclosure.classList.add(classes.isVisible);

        if (this.transitionTimeout) {
          clearTimeout(this.transitionTimeout);
        }

        this.transitionTimeout = setTimeout(() => {
          this.wrapper.classList.remove(classes.meganavIsTransitioning);
        }, 200);
      }

      hideDisclosure() {
        this.classList.remove(classes.isVisible);
        this.disclosure.classList.remove(classes.isVisible);
        this.setAttribute('aria-expanded', false);
        this.wrapper.classList.remove(classes.meganavVisible, classes.meganavIsTransitioning);
      }

      staggerChildAnimations() {
        const simple = this.querySelectorAll(selectors.stagger);
        let step = 50;
        simple.forEach((el, index) => {
          el.style.transitionDelay = `${index * step + 10}ms`;
          step *= 0.95;
        });

        const pairs = this.querySelectorAll(selectors.staggerPair);
        pairs.forEach((child, i) => {
          const d1 = i * 100;
          child.style.transitionDelay = `${d1}ms`;
          child.parentElement.querySelectorAll(selectors.staggerAfter).forEach((grandchild, i2) => {
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
            const isOpen = this.classList.contains(classes.isVisible);
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
