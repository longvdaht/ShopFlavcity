(function () {
  'use strict';

  const selectors = {
    fields: 'input:not([type="checkbox"]):not([type="hidden"]), textarea',
    fieldEmail: 'input[type="email"]',
    fieldCheckbox: 'input[type="checkbox"]',
    form: '[data-form-wrapper]',
  };

  if (!customElements.get('recipient-form')) {
    customElements.define(
      'recipient-form',
      class RecipientForm extends HTMLElement {
        constructor() {
          super();
          this.fieldCheckbox = this.querySelector(selectors.fieldCheckbox);
          this.fieldEmail = this.querySelector(selectors.fieldEmail);
          this.fields = this.querySelectorAll(selectors.fields);
          this.form = this.closest(selectors.form);
          this.onChangeEvent = (event) => this.onChange(event);
        }

        connectedCallback() {
          if (this.fieldCheckbox) {
            this.fieldCheckbox.addEventListener('change', this.onChangeEvent);

            if (this.form) {
              this.form.addEventListener('theme:product:add', () => {
                this.fieldCheckbox.checked = false;
                this.fieldCheckbox.dispatchEvent(new Event('change'));
              });
            }
          }
        }

        clearInputValues() {
          if (this.fields.length) {
            this.fields.forEach((field) => {
              field.value = '';
            });
          }
        }

        onChange(event) {
          this.fieldEmail.required = Boolean(event.target.checked);

          if (!event.target.checked) {
            this.clearInputValues();
          }
        }

        disconnectedCallback() {
          this.fieldCheckbox.removeEventListener('change', this.onChangeEvent);
        }
      }
    );
  }

})();
//# sourceMappingURL=recipient-form.js.map
