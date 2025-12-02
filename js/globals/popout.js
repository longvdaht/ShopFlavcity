const selectors = {
  popoutList: '[data-popout-list]',
  popoutToggle: '[data-popout-toggle]',
  popoutToggleText: '[data-popout-toggle-text]',
  popoutInput: '[data-popout-input]',
  popoutOptions: '[data-popout-option]',
  productGridImage: '[data-product-image]',
  productGridItem: '[data-grid-item]',
  section: '[data-section-type]',
};

const classes = {
  listVisible: 'popout-list--visible',
  visible: 'is-visible',
  active: 'is-active',
  popoutListTop: 'popout-list--top',
};

const attributes = {
  ariaExpanded: 'aria-expanded',
  ariaCurrent: 'aria-current',
  dataValue: 'data-value',
  popoutToggleText: 'data-popout-toggle-text',
  submit: 'submit',
};

if (!customElements.get('popout-select')) {
  customElements.define(
    'popout-select',
    class Popout extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        this.popoutList = this.querySelector(selectors.popoutList);
        this.popoutToggle = this.querySelector(selectors.popoutToggle);
        this.popoutToggleText = this.querySelector(selectors.popoutToggleText);
        this.popoutInput = this.querySelector(selectors.popoutInput) || this.parentNode.querySelector(selectors.popoutInput);
        this.popoutOptions = this.querySelectorAll(selectors.popoutOptions);
        this.productGridItem = this.popoutList.closest(selectors.productGridItem);
        this.fireSubmitEvent = this.hasAttribute(attributes.submit);

        this.popupToggleFocusoutEvent = (evt) => this.onPopupToggleFocusout(evt);
        this.popupListFocusoutEvent = (evt) => this.onPopupListFocusout(evt);
        this.popupToggleClickEvent = (evt) => this.onPopupToggleClick(evt);
        this.keyUpEvent = (evt) => this.onKeyUp(evt);
        this.bodyClickEvent = (evt) => this.onBodyClick(evt);

        this._connectOptions();
        this._connectToggle();
        this._onFocusOut();
        this.popupListSetDimensions();
      }

      onPopupToggleClick(evt) {
        const button = evt.currentTarget;
        const ariaExpanded = button.getAttribute(attributes.ariaExpanded) === 'true';

        if (this.productGridItem) {
          const productGridItemImage = this.productGridItem.querySelector(selectors.productGridImage);

          if (productGridItemImage) {
            productGridItemImage.classList.toggle(classes.visible, !ariaExpanded);
          }

          this.popoutList.style.maxHeight = `${Math.abs(this.popoutToggle.getBoundingClientRect().bottom - this.productGridItem.getBoundingClientRect().bottom)}px`;
        }

        evt.currentTarget.setAttribute(attributes.ariaExpanded, !ariaExpanded);
        this.popoutList.classList.toggle(classes.listVisible);
        this.popupListSetDimensions();
        this.toggleListPosition();

        document.body.addEventListener('click', this.bodyClickEvent);
      }

      onPopupToggleFocusout(evt) {
        const popoutLostFocus = this.contains(evt.relatedTarget);

        // TODO Hide condition for blog filters
        // if (!popoutLostFocus) {
        //   this._hideList();
        // }
      }

      onPopupListFocusout(evt) {
        const childInFocus = evt.currentTarget.contains(evt.relatedTarget);
        const isVisible = this.popoutList.classList.contains(classes.listVisible);

        // TODO Hide condition for blog filters
        // if (isVisible && !childInFocus) {
        //   this._hideList();
        // }
      }

      toggleListPosition() {
        const button = this.querySelector(selectors.popoutToggle);
        const popoutTop = this.getBoundingClientRect().top + this.clientHeight;

        const removeTopClass = () => {
          if (button.getAttribute(attributes.ariaExpanded) !== 'true') {
            this.popoutList.classList.remove(classes.popoutListTop);
          }

          this.popoutList.removeEventListener('transitionend', removeTopClass);
        };

        if (button.getAttribute(attributes.ariaExpanded) === 'true') {
          if (window.innerHeight / 2 < popoutTop) {
            this.popoutList.classList.add(classes.popoutListTop);
          }
        } else {
          this.popoutList.addEventListener('transitionend', removeTopClass);
        }
      }

      popupListSetDimensions() {
        this.popoutList.style.setProperty('--max-width', '100vw');
        this.popoutList.style.setProperty('--max-height', '100vh');

        requestAnimationFrame(() => {
          this.popoutList.style.setProperty('--max-width', `${parseInt(document.body.clientWidth - this.popoutList.getBoundingClientRect().left)}px`);
          this.popoutList.style.setProperty('--max-height', `${parseInt(document.body.clientHeight - this.popoutList.getBoundingClientRect().top)}px`);
        });
      }

      popupOptionsClick(evt) {
        const link = evt.target.closest(selectors.popoutOptions);

        if (link.attributes.href?.value === '#') {
          console.log(link.attributes, 'link.attributes')
          evt.preventDefault();

          const attrValue = evt.currentTarget.hasAttribute(attributes.dataValue) ? evt.currentTarget.getAttribute(attributes.dataValue) : '';
          if (this.popoutInput) {
            this.popoutInput.value = attrValue;
            if (this.popoutInput.disabled) {
              this.popoutInput.removeAttribute('disabled');
            }
          }

          if (this.fireSubmitEvent) {
            this._submitForm(attrValue);
          } else {
            const currentTarget = evt.currentTarget.parentElement;
            const listTargetElement = this.popoutList.querySelector(`.${classes.active}`);
            const targetAttribute = this.popoutList.querySelector(`[${attributes.ariaCurrent}]`);

            if (this.popoutInput) {
              this.popoutInput.dispatchEvent(new Event('change'));
              if (this.popoutInput.name == 'quantity' && !currentTarget.nextSibling) {
                this.classList.add(classes.active);
              }
            }

            if (listTargetElement) {
              listTargetElement.classList.remove(classes.active);
              currentTarget.classList.add(classes.active);
            }

            if (targetAttribute && targetAttribute.hasAttribute(`${attributes.ariaCurrent}`)) {
              targetAttribute.removeAttribute(`${attributes.ariaCurrent}`);
              evt.currentTarget.setAttribute(`${attributes.ariaCurrent}`, 'true');
            }

            if (attrValue !== '') {
              this.popoutToggleText.innerHTML = attrValue;

              if (this.popoutToggleText.hasAttribute(attributes.popoutToggleText) && this.popoutToggleText.getAttribute(attributes.popoutToggleText) !== '') {
                this.popoutToggleText.setAttribute(attributes.popoutToggleText, attrValue);
              }
            }
            this.onPopupToggleFocusout(evt);
            this.onPopupListFocusout(evt);
          }
        } else if (link.hasAttribute('data-custom-size-picker')) {
          const attrValue = evt.currentTarget.hasAttribute(attributes.dataValue) ? evt.currentTarget.getAttribute(attributes.dataValue) : '';

          if (attrValue !== '') {
            this.popoutToggleText.innerHTML = attrValue;

            if (this.popoutToggleText.hasAttribute(attributes.popoutToggleText) && this.popoutToggleText.getAttribute(attributes.popoutToggleText) !== '') {
              this.popoutToggleText.setAttribute(attributes.popoutToggleText, attrValue);
            }
          }
          this.popoutList.classList.remove(classes.listVisible);
        }
      }

      onKeyUp(evt) {
        if (evt.code !== 'Escape') {
          return;
        }
        this._hideList();
        this.popoutToggle.focus();
      }

      onBodyClick(evt) {
        const isOption = this.contains(evt.target);
        const isVisible = this.popoutList.classList.contains(classes.listVisible);

        if (isVisible && !isOption) {
          this._hideList();
        }
      }

      _connectToggle() {
        this.popoutToggle.addEventListener('click', this.popupToggleClickEvent);
      }

      _connectOptions() {
        if (this.popoutOptions.length) {
          this.popoutOptions.forEach((element) => {
            element.addEventListener('click', (evt) => this.popupOptionsClick(evt));
          });
        }
      }

      _onFocusOut() {
        this.addEventListener('keyup', this.keyUpEvent);
        this.popoutToggle.addEventListener('focusout', this.popupToggleFocusoutEvent);
        this.popoutList.addEventListener('focusout', this.popupListFocusoutEvent);
      }

      _submitForm() {
        const form = this.closest('form');
        if (form) {
          form.submit();
        }
      }

      _hideList() {
        this.popoutList.classList.remove(classes.listVisible);
        this.popoutToggle.setAttribute(attributes.ariaExpanded, false);
        this.toggleListPosition();
        document.body.removeEventListener('click', this.bodyClickEvent);
      }
    }
  );
}
