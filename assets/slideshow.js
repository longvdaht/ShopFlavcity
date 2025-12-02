(function () {
  'use strict';

  if (!customElements.get('slideshow-component')) {
    customElements.define(
      'slideshow-component',
      class SliderComponent extends HTMLElement {
        constructor() {
          super();
          customElements.whenDefined('swiper-container').then(() => this.init());
        }

        init() {
          this.swiperContainer = this.querySelector('swiper-container');
          if (!this.swiperContainer) return;
          this.swiperInstance = this.swiperContainer.swiper;

          this.swiperInstance.on('slideChangeTransitionStart', () => this.handleCurrentSlide());
          this.swiperInstance.on('slidesUpdated', () => this.handleCurrentSlide());
          this.swiperInstance.update();
        }

        handleCurrentSlide() {
          // Change dots color based on the current slide text color
          const currentSlide = this.swiperInstance.slides[this.swiperInstance.activeIndex];
          const currentSlideTextColor = currentSlide.hasAttribute('data-slide-text-color') ? currentSlide.getAttribute('data-slide-text-color') : '';
          this.style.setProperty('--text', currentSlideTextColor);

          // Animate elements on slide change
          const elementsToAnimate = currentSlide.querySelectorAll('[data-aos]');
          elementsToAnimate?.forEach((el) => {
            el.classList.remove('aos-animate');
            requestAnimationFrame(() => el.classList.add('aos-animate'));
          });
        }
      }
    );
  }

})();
//# sourceMappingURL=slideshow.js.map
