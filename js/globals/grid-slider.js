import {IsInView} from '../globals/is-in-view';
import {DraggableSlider} from '../features/draggable-slider';

const selectors = {
  buttonArrow: '[data-button-arrow]',
  collectionImage: '[data-collection-image]',
  columnImage: '[data-column-image]',
  productImage: '[data-product-image]',
  slide: '[data-grid-item]',
  slider: '[data-grid-slider]',
};

const attributes = {
  buttonPrev: 'data-button-prev',
  buttonNext: 'data-button-next',
  alignArrows: 'align-arrows',
};

const classes = {
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
        this.slider = this.querySelector(selectors.slider);
        this.slides = this.querySelectorAll(selectors.slide);
        this.buttons = this.querySelectorAll(selectors.buttonArrow);
        this.slider.classList.add(classes.scrollSnapDisabled);
        this.toggleSlider();
        document.addEventListener('theme:resize:width', ()=> {
          this.toggleSlider();
        });

        window.theme
          .waitForAllAnimationsEnd(this)
          .then(() => {
            this.slider.classList.remove(classes.scrollSnapDisabled);
          })
          .catch(() => {
            this.slider.classList.remove(classes.scrollSnapDisabled);
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

          this.slidesObserver = new IsInView(this.slider, selectors.slide);

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
          buttonsWrap.classList.add(classes.arrows);
          buttonsWrap.innerHTML = theme.sliderArrows.prev + theme.sliderArrows.next;

          // Append buttons outside the slider element
          this.append(buttonsWrap);
          this.buttons = this.querySelectorAll(selectors.buttonArrow);
          this.buttonPrev = this.querySelector(`[${attributes.buttonPrev}]`);
          this.buttonNext = this.querySelector(`[${attributes.buttonNext}]`);
        }

        this.toggleArrowsObserver();

        if (this.hasAttribute(attributes.alignArrows)) {
          this.positionArrows();
          this.arrowsResizeObserver();
        }

        this.buttons.forEach((buttonArrow) => {
          buttonArrow.addEventListener('click', this.onButtonArrowClick);
        });
      }

      buttonArrowClickEvent(e) {
        e.preventDefault();

        const firstVisibleSlide = this.slider.querySelector(`${selectors.slide}.${classes.visible}`);
        let slide = null;

        if (e.target.hasAttribute(attributes.buttonPrev)) {
          slide = firstVisibleSlide?.previousElementSibling;
        }

        if (e.target.hasAttribute(attributes.buttonNext)) {
          slide = firstVisibleSlide?.nextElementSibling;
        }

        this.goToSlide(slide);
      }

      removeArrows() {
        this.querySelector(`.${classes.arrows}`)?.remove();
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
        return this.slider.querySelector(selectors.slide)?.getBoundingClientRect().width * this.slider.querySelectorAll(selectors.slide).length;
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
                const isDisabled = Boolean(slide.classList.contains(classes.visible));

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
          this.slider.querySelector(selectors.productImage) || this.slider.querySelector(selectors.collectionImage) || this.slider.querySelector(selectors.columnImage) || this.slider;

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
