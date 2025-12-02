(function () {
  'use strict';

  const selectors = {
    sliderLogos: '[data-slider-logos]',
    sliderText: '[data-slider-text]',
    slide: '[data-slide]',
  };

  const classes = {
    isSelected: 'is-selected',
    isInitialized: 'is-initialized',
    isEligible: 'is-eligible',
    flickityEnabled: 'flickity-enabled',
  };

  const attributes = {
    slideData: 'data-slide',
  };

  if (!customElements.get('logos-component')) {
    customElements.define(
      'logos-component',
      class LogoList extends HTMLElement {
        constructor() {
          super();
        }

        connectedCallback() {
          this.flkty = null;
          this.flktyNav = null;
          this.slideshowNav = this.querySelector(selectors.sliderLogos);
          this.slideshowText = this.querySelector(selectors.sliderText);
          this.logoSlides = this.slideshowNav.querySelectorAll(selectors.slide);
          this.setSlideshowNavStateOnResize = () => this.setSlideshowNavState();

          this.initSlideshowText();
          this.initSlideshowNav();
          this.bindEvents();

          this.setSlideshowNavState();

          document.addEventListener('theme:resize', this.setSlideshowNavStateOnResize);
        }

        getSlidesWidth() {
          const slidesCount = this.logoSlides.length;
          const slideWidth = 200; // 200px fixed width

          return slidesCount * slideWidth;
        }

        initSlideshowText() {
          if (!this.slideshowText) return;

          this.flkty = new window.theme.FlickityFade(this.slideshowText, {
            fade: true,
            autoPlay: false,
            prevNextButtons: false,
            cellAlign: 'left', // Prevents blurry text on Safari
            contain: true,
            pageDots: false,
            wrapAround: false,
            selectedAttraction: 0.2,
            friction: 0.6,
            draggable: false,
            accessibility: false,
            on: {
              ready: () => this.sliderAccessibility(),
              change: () => this.sliderAccessibility(),
            },
          });
        }

        sliderAccessibility() {
          const buttons = this.slideshowText.querySelectorAll(`${selectors.slide} a, ${selectors.slide} button`);

          if (buttons.length) {
            buttons.forEach((button) => {
              const slide = button.closest(selectors.slide);
              if (slide) {
                const tabIndex = slide.classList.contains(classes.isSelected) ? 0 : -1;
                button.setAttribute('tabindex', tabIndex);
              }
            });
          }
        }

        initSlideshowNav() {
          if (!this.slideshowNav) return;

          this.logoSlides?.forEach((logoItem) => {
            logoItem.addEventListener('click', () => {
              const hasSlider = this.slideshowNav.classList.contains(classes.flickityEnabled);
              const slideIndex = parseInt(Array.from(logoItem.parentNode.children).indexOf(logoItem));

              if (this.flkty) {
                this.flkty.select(slideIndex);
              }

              if (hasSlider) {
                this.flktyNav?.select(slideIndex);
                this.flktyNav?.playPlayer();
              } else {
                this.slideshowNav.querySelector(`.${classes.isSelected}`)?.classList.remove(classes.isSelected);
                logoItem.classList.add(classes.isSelected);
              }
            });
          });
        }

        setSlideshowNavState() {
          const isEligible = this.getSlidesWidth() > window.theme.getWindowWidth();

          this.slideshowNav.classList.toggle(classes.isEligible, isEligible);
          this.slideshowNav.querySelector(`.${classes.isSelected}`)?.classList.remove(classes.isSelected);

          this.logoSlides[0].classList.add(classes.isSelected);

          if (!this.flktyNav) {
            this.flktyNav = new window.theme.Flickity(this.slideshowNav, {
              autoPlay: 4000,
              prevNextButtons: false,
              contain: false,
              pageDots: false,
              wrapAround: true,
              watchCSS: true,
              selectedAttraction: 0.05,
              friction: 0.8,
              initialIndex: 0,
              on: {
                ready: () => {
                  this.slideshowNav.classList.add(classes.isInitialized);
                },
                change: (index) => this.flkty?.select(index),
                deactivate: () => {
                  this.slideshowNav.querySelector(selectors.slide).classList.add(classes.isSelected);
                  this.flkty?.select(0);
                },
              },
            });
          }
        }

        onBlockSelect(evt) {
          if (!this.slideshowNav) return;
          const slide = this.slideshowNav.querySelector(`[${attributes.slideData}="${evt.detail.blockId}"]`);
          const slideIndex = parseInt(Array.from(slide.parentNode.children).indexOf(slide));

          if (this.flktyNav) {
            this.flktyNav.select(slideIndex);
            this.flktyNav.stopPlayer();
          } else {
            slide.dispatchEvent(new Event('click'));
          }
        }

        onBlockDeselect() {
          this.flktyNav?.playPlayer();
        }

        bindEvents() {
          this.addEventListener('theme:slider-logos:select', (e) => this.onBlockSelect(e.detail.evt));
          this.addEventListener('theme:slider-logos:deselect', () => this.onBlockDeselect());
        }

        disconnectedCallback() {
          document.removeEventListener('theme:resize', this.setSlideshowNavStateOnResize);
        }
      }
    );
  }

})();
//# sourceMappingURL=logos.js.map
