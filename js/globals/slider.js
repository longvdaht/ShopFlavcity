const selectors = {
  aos: '[data-aos]',
  collectionImage: '.collection-item__image',
  columnImage: '[data-column-image]',
  flickityNextArrow: '.flickity-button.next',
  flickityPrevArrow: '.flickity-button.previous',
  link: 'a:not(.btn)',
  productItemImage: '.product-item__image',
  section: '[data-section-type]',
  slide: '[data-slide]',
  slideValue: 'data-slide',
  sliderThumb: '[data-slider-thumb]',
};

const attributes = {
  arrowPositionMiddle: 'data-arrow-position-middle',
  sliderOptions: 'data-options',
  slideTextColor: 'data-slide-text-color',
};

const classes = {
  aosAnimate: 'aos-animate',
  desktop: 'desktop',
  focused: 'is-focused',
  flickityEnabled: 'flickity-enabled',
  heroContentTransparent: 'hero__content--transparent',
  hidden: 'hidden',
  initialized: 'is-initialized',
  isLoading: 'is-loading',
  isSelected: 'is-selected',
  mobile: 'mobile',
  singleSlide: 'single-slide',
};

if (!customElements.get('slider-component')) {
  customElements.define(
    'slider-component',
    class SliderComponent extends HTMLElement {
      constructor() {
        super();

        this.flkty = null;
        this.slides = this.querySelectorAll(selectors.slide);
        this.thumbs = this.querySelectorAll(selectors.sliderThumb);
        this.section = this.closest(selectors.section);
        this.bindEvents();
      }

      connectedCallback() {
        if (this.slides.length <= 1) return;

        if (this.hasAttribute(attributes.sliderOptions)) {
          this.customOptions = JSON.parse(decodeURIComponent(this.getAttribute(attributes.sliderOptions)));
        }

        this.classList.add(classes.isLoading);

        let slideSelector = selectors.slide;
        const isDesktopView = !window.theme.isMobile();
        const slideMobile = `${selectors.slide}:not(.${classes.mobile})`;
        const slideDesktop = `${selectors.slide}:not(.${classes.desktop})`;
        const hasDeviceSpecificSelectors = this.querySelectorAll(slideDesktop).length || this.querySelectorAll(slideMobile).length;

        if (hasDeviceSpecificSelectors) {
          if (isDesktopView) {
            slideSelector = slideMobile;
          } else {
            slideSelector = slideDesktop;
          }
        }

        if (this.querySelectorAll(slideSelector).length <= 1) {
          this.classList.add(classes.singleSlide);
          this.classList.remove(classes.isLoading);
        }

        this.sliderOptions = {
          cellSelector: slideSelector,
          contain: true,
          wrapAround: true,
          adaptiveHeight: true,
          ...this.customOptions,
          on: {
            ready: () => {
              requestAnimationFrame(() => {
                this.classList.add(classes.initialized);
                this.classList.remove(classes.isLoading);
                this.parentNode.dispatchEvent(
                  new CustomEvent('theme:slider:loaded', {
                    bubbles: true,
                    detail: {
                      slider: this,
                    },
                  })
                );
              });

              this.slideActions();

              if (this.sliderOptions.prevNextButtons) {
                this.positionArrows();
              }
            },
            change: (index) => {
              const slide = this.slides[index];
              if (!slide || this.sliderOptions.groupCells) return;

              const elementsToAnimate = slide.querySelectorAll(selectors.aos);
              if (elementsToAnimate.length) {
                elementsToAnimate.forEach((el) => {
                  el.classList.remove(classes.aosAnimate);
                  requestAnimationFrame(() => {
                    // setTimeout with `0` delay fixes functionality on Mobile and Firefox
                    setTimeout(() => {
                      el.classList.add(classes.aosAnimate);
                    }, 0);
                  });
                });
              }
            },
            resize: () => {
              if (this.sliderOptions.prevNextButtons) {
                this.positionArrows();
              }
            },
          },
        };

        this.initSlider();

        this.flkty.on('change', () => this.slideActions(true));

        this.thumbs?.forEach((thumb) => {
          thumb.addEventListener('click', (e) => {
            e.preventDefault();
            const slideIndex = [...thumb.parentElement.children].indexOf(thumb);
            this.flkty.select(slideIndex);
          });
        });

        if (!this.flkty || !this.flkty.isActive) {
          this.classList.remove(classes.isLoading);
        }
      }

      initSlider() {
        if (this.sliderOptions.fade) {
          this.flkty = new window.theme.FlickityFade(this, this.sliderOptions);
        } else {
          this.flkty = new window.theme.Flickity(this, this.sliderOptions);
        }
      }

      bindEvents() {
        this.addEventListener('theme:slider:init', () => {
          this.initSlider();
        });

        this.addEventListener('theme:slider:select', (e) => {
          this.flkty.selectCell(e.detail.index);
          this.flkty.stopPlayer();
        });

        this.addEventListener('theme:slider:deselect', () => {
          if (this.flkty && this.sliderOptions.hasOwnProperty('autoPlay') && this.sliderOptions.autoPlay) {
            this.flkty.playPlayer();
          }
        });

        this.addEventListener('theme:slider:reposition', () => {
          this.flkty?.reposition();
        });

        this.addEventListener('theme:slider:destroy', () => {
          this.flkty?.destroy();
        });

        this.addEventListener('theme:slider:remove-slide', (e) => {
          if (!e.detail.slide) return;

          this.flkty?.remove(e.detail.slide);

          if (this.flkty?.cells.length === 0) {
            this.section.classList.add(classes.hidden);
          }
        });
      }

      slideActions(changeEvent = false) {
        const currentSlide = this.querySelector(`.${classes.isSelected}`);
        if (!currentSlide) return;
        const currentSlideTextColor = currentSlide.hasAttribute(attributes.slideTextColor) ? currentSlide.getAttribute(attributes.slideTextColor) : '';
        const currentSlideLink = currentSlide.querySelector(selectors.link);
        const buttons = this.querySelectorAll(`${selectors.slide} a, ${selectors.slide} button`);

        if (document.body.classList.contains(classes.focused) && currentSlideLink && this.sliderOptions.groupCells && changeEvent) {
          currentSlideLink.focus();
        }

        if (buttons.length) {
          buttons.forEach((button) => {
            const slide = button.closest(selectors.slide);
            if (slide) {
              const tabIndex = slide.classList.contains(classes.isSelected) ? 0 : -1;
              button.setAttribute('tabindex', tabIndex);
            }
          });
        }

        this.style.setProperty('--text', currentSlideTextColor);
      }

      positionArrows() {
        if (this.hasAttribute(attributes.arrowPositionMiddle) && this.sliderOptions.prevNextButtons) {
          const itemImage = this.querySelector(selectors.collectionImage) || this.querySelector(selectors.productItemImage) || this.querySelector(selectors.columnImage);

          // Prevent 'clientHeight' of null error if no image
          if (!itemImage) return;

          this.querySelector(selectors.flickityPrevArrow).style.top = itemImage.clientHeight / 2 + 'px';
          this.querySelector(selectors.flickityNextArrow).style.top = itemImage.clientHeight / 2 + 'px';
        }
      }

      disconnectedCallback() {
        if (this.flkty) {
          this.flkty.options.watchCSS = false;
          this.flkty.destroy();
        }
      }
    }
  );
}
