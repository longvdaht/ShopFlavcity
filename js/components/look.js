const selectors = {
  slider: '[data-slider-mobile]',
  slide: '[data-slide]',
  thumb: '[data-slider-thumb]',
  popupContainer: '[data-popup-container]',
  popupClose: '[data-popup-close]',
};

const classes = {
  isAnimating: 'is-animating',
  isOpen: 'is-open',
};

const attributes = {
  thumbValue: 'data-slider-thumb',
};

if (!customElements.get('look-component')) {
  customElements.define(
    'look-component',
    class Look extends HTMLElement {
      constructor() {
        super();

        this.slider = this.querySelector(selectors.slider);
        this.slides = this.querySelectorAll(selectors.slide);
        this.thumbs = this.querySelectorAll(selectors.thumb);
        this.popupContainer = this.querySelector(selectors.popupContainer);
        this.popupClose = this.querySelectorAll(selectors.popupClose);
        this.popupCloseByEvent = this.popupCloseByEvent.bind(this);
      }

      connectedCallback() {
        if (this.slider && this.slides.length && this.thumbs.length) {
          this.popupContainer.addEventListener('transitionend', (e) => {
            if (e.target != this.popupContainer) return;

            this.popupContainer.classList.remove(classes.isAnimating);
            if (e.target.classList.contains(classes.isOpen)) {
              this.popupOpenCallback();
            } else {
              this.popupCloseCallback();
            }
          });

          this.popupContainer.addEventListener('transitionstart', (e) => {
            if (e.target != this.popupContainer) return;

            this.popupContainer.classList.add(classes.isAnimating);
          });

          this.popupClose.forEach((button) => {
            button.addEventListener('click', () => {
              this.popupContainer.classList.remove(classes.isOpen);
              document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
            });
          });

          this.thumbs.forEach((thumb, i) => {
            thumb.addEventListener('click', (e) => {
              e.preventDefault();
              const idx = thumb.hasAttribute(attributes.thumbValue) && thumb.getAttribute(attributes.thumbValue) !== '' ? parseInt(thumb.getAttribute(attributes.thumbValue)) : i;
              const slide = this.slides[idx];
              if (window.theme.isMobile()) {
                const parentPadding = parseInt(window.getComputedStyle(this.slider).paddingLeft);
                this.slider.scrollTo({
                  top: 0,
                  left: slide.offsetLeft - parentPadding,
                  behavior: 'auto',
                });
                document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
                this.popupContainer.classList.add(classes.isAnimating, classes.isOpen);
              } else {
                const {stickyHeaderHeight} = window.theme.readHeights();
                const slideTop = slide.getBoundingClientRect().top;
                const slideHeightHalf = slide.offsetHeight / 2;
                const windowHeight = window.innerHeight;
                const windowHeightHalf = windowHeight / 2;
                let scrollTarget = slideTop + slideHeightHalf - windowHeightHalf + window.scrollY;
                const sliderContainerTop = this.getBoundingClientRect().top + window.scrollY;
                const sliderContainerBottom = sliderContainerTop + this.offsetHeight;

                if (scrollTarget < sliderContainerTop) {
                  scrollTarget = sliderContainerTop - stickyHeaderHeight;
                } else if (scrollTarget + windowHeight > sliderContainerBottom) {
                  scrollTarget = sliderContainerBottom - windowHeight;
                }

                window.scrollTo({
                  top: scrollTarget,
                  left: 0,
                  behavior: 'smooth',
                });
              }
            });
          });
        }
      }

      popupCloseByEvent() {
        this.popupContainer.classList.remove(classes.isOpen);
      }

      popupOpenCallback() {
        document.addEventListener('theme:quick-add:open', this.popupCloseByEvent, {once: true});
        document.addEventListener('theme:product:added', this.popupCloseByEvent, {once: true});
      }

      popupCloseCallback() {
        document.removeEventListener('theme:quick-add:open', this.popupCloseByEvent, {once: true});
        document.removeEventListener('theme:product:added', this.popupCloseByEvent, {once: true});
      }
    }
  );
}
