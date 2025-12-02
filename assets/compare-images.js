(function () {
  'use strict';

  const selectors = {
    imagesContainer: '[data-images-container]',
    imageHolder: '[data-image-holder]',
    imageElement: '[data-image-element]',
    rangeButton: '[data-range-button]',
    rangeInput: '[data-range-input]',
  };

  if (!customElements.get('compare-images')) {
    customElements.define(
      'compare-images',
      class CompareImages extends HTMLElement {
        constructor() {
          super();

          this.imageHolder = this.querySelector(selectors.imageHolder);
          this.imageElement = this.querySelector(selectors.imageElement);
          this.rangeButton = this.querySelector(selectors.rangeButton);
          this.rangeInput = this.querySelector(selectors.rangeInput);
          this.setOverlapImageSize = this.setOverlapImageSize.bind(this);
        }

        connectedCallback() {
          this.setOverlapImageSize();
          this.setImagePosition();
          this.rangeInput.addEventListener('input', () => this.setImagePosition());

          document.addEventListener('theme:resize', this.setOverlapImageSize);
        }

        disconnectedCallback() {
          document.removeEventListener('theme:resize', this.setOverlapImageSize);
        }

        setImagePosition() {
          const value = this.rangeInput.value;
          const imageWidth = this.imageElement.offsetWidth;
          const buttonWidth = this.rangeButton.offsetWidth;

          this.rangeButton.style.left = `${value}%`;
          this.imageHolder.style.width = `${((imageWidth - buttonWidth) * (100 - value)) / 100 + buttonWidth / 2}px`;
        }

        setOverlapImageSize() {
          const containerWidth = this.offsetWidth;
          this.imageElement.style.width = `${containerWidth}px`;
          this.setImagePosition();
        }
      }
    );
  }

})();
//# sourceMappingURL=compare-images.js.map
