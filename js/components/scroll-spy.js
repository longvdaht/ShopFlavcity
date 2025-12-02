/*
  [data-scroll-trigger-point] sets the position that the observed element should reach.
  Accepted values:
    "top", "middle", "bottom"
*/

const selectors = {
  scrollSpy: '[data-scroll-spy]',
};

const classes = {
  selected: 'is-selected',
};

const attributes = {
  scrollSpyContainer: 'data-scroll-spy-container',
  scrollSpy: 'data-scroll-spy',
  mobile: 'data-scroll-spy-mobile',
  desktop: 'data-scroll-spy-desktop',
  triggerPoint: 'data-scroll-trigger-point',
};

if (!customElements.get('scroll-spy')) {
  customElements.define(
    'scroll-spy',
    class ScrollSpy extends HTMLElement {
      constructor() {
        super();

        this.container = this?.closest(this?.getAttribute(attributes.scrollSpyContainer)) || document;
        this.scrollSpyButton = this.querySelector(selectors.scrollSpy);
        this.elementToSpy = this.container.querySelector(this.scrollSpyButton.getAttribute(attributes.scrollSpy));
        this.anchorSelector = `[${attributes.scrollSpy}="#${this.elementToSpy.id}"]`;
        this.anchor = this.container.querySelector(this.anchorSelector);
        this.anchorSiblings = this.container.querySelectorAll(`[${attributes.scrollSpy}]`);
        this.initialized = false;

        if (!this.anchor) return;

        this.triggerPoint = this.anchor.getAttribute(attributes.triggerPoint);

        this.scrollCallback = () => this.onScroll();
        this.toggleScrollObserver = this.toggleScrollObserver.bind(this);
      }

      connectedCallback() {
        this.toggleScrollObserver();
        document.addEventListener('theme:resize:width', this.toggleScrollObserver);
      }

      toggleScrollObserver() {
        if (this.isEligible()) {
          if (!this.initialized) {
            document.addEventListener('theme:scroll', this.scrollCallback);
            this.initialized = true;
          }
        } else {
          document.removeEventListener('theme:scroll', this.scrollCallback);
          this.initialized = false;
        }
      }

      isEligible() {
        const isDesktopView = !window.theme.isMobile();
        const isMobileView = !isDesktopView;
        return (
          (isMobileView && this.anchor.hasAttribute(attributes.mobile)) ||
          (isDesktopView && this.anchor.hasAttribute(attributes.desktop)) ||
          (!this.anchor.hasAttribute(attributes.desktop) && !this.anchor.hasAttribute(attributes.mobile))
        );
      }

      onScroll() {
        this.top = this.elementToSpy.getBoundingClientRect().top;

        // Check element's visibility in the viewport
        const windowHeight = Math.round(window.innerHeight);
        const scrollTop = Math.round(window.scrollY);
        const scrollBottom = scrollTop + windowHeight;
        const elementOffsetTopPoint = Math.round(this.top + scrollTop);
        const elementHeight = this.elementToSpy.offsetHeight;
        const elementOffsetBottomPoint = elementOffsetTopPoint + elementHeight;
        const isBottomOfElementPassed = elementOffsetBottomPoint < scrollTop;
        const isTopOfElementReached = elementOffsetTopPoint < scrollBottom;
        const isInView = isTopOfElementReached && !isBottomOfElementPassed;

        if (!isInView) return;
        if (!this.triggerPointReached()) return;

        // Update active classes
        this.anchorSiblings.forEach((anchor) => {
          if (!anchor.matches(this.anchorSelector)) {
            anchor.classList.remove(classes.selected);
          }
        });

        this.anchor.classList.add(classes.selected);
      }

      triggerPointReached() {
        let triggerPointReached = false;

        switch (this.triggerPoint) {
          case 'top':
            triggerPointReached = this.top <= 0;
            break;

          case 'middle':
            triggerPointReached = this.top <= window.innerHeight / 2;
            break;

          case 'bottom':
            triggerPointReached = this.top <= window.innerHeight;
            break;

          default:
            triggerPointReached = this.top <= 0;
        }

        return triggerPointReached;
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize:width', this.toggleScrollObserver);
        document.removeEventListener('theme:scroll', this.scrollCallback);
      }
    }
  );
}
