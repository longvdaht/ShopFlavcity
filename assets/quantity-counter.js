(function () {
  'use strict';

  if (!customElements.get('quantity-counter')) {
    customElements.define(
      'quantity-counter',
      class QuantityCounter extends HTMLElement {
        constructor() {
          super();
        }

        connectedCallback() {
          this.input = this.querySelector('input');
          this.changeEvent = new Event('change', {bubbles: true});
          this.buttonClickEvent = this.onButtonClick.bind(this);
          this.onQuantityChangeEvent = this.onQuantityChange.bind(this);

          this.input.addEventListener('change', this.onQuantityChangeEvent);
          this.querySelectorAll('button').forEach((button) => button.addEventListener('click', this.buttonClickEvent));
        }

        onButtonClick(event) {
          event.preventDefault();
          const previousValue = this.input.value;
          const button = event.target.nodeName == 'BUTTON' ? event.target : event.target.closest('button');

          if (button.name === 'increase') this.input.stepUp();
          if (button.name === 'decrease') this.input.stepDown();
          if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
        }

        onQuantityChange() {
          // Trigger cart update event if line item quantity is changed
          if (this.input.name == 'updates[]') {
            this.updateCart();
          }
        }

        updateCart() {
          if (this.quantityValue === '') return;

          this.dispatchEvent(
            new CustomEvent('theme:cart:update', {
              bubbles: true,
              detail: {
                id: this.input.dataset.id,
                quantity: this.input.value,
              },
            })
          );
        }
      }
    );
  }

})();
//# sourceMappingURL=quantity-counter.js.map
