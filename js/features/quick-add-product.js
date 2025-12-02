import FetchError from '../util/fetch-error';
import wrapElements from '../globals/wrap';

const classes = {
  added: 'is-added',
  animated: 'is-animated',
  disabled: 'is-disabled',
  error: 'has-error',
  loading: 'is-loading',
  open: 'is-open',
  visible: 'is-visible',
};

const settings = {
  errorDelay: 3000,
};

const selectors = {
  animation: '[data-animation]',
  apiContent: '[data-api-content]',
  buttonQuickAdd: '[data-quick-add-btn]',
  buttonAddToCart: '[data-add-to-cart]',
  cartDrawer: 'cart-drawer',
  cartPage: '[data-cart-page]',
  cartLineItems: '[data-line-items]',
  dialog: 'dialog',
  focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
  messageError: '[data-message-error]',
  modalButton: '[data-quick-add-modal-handle]',
  modalContainer: '[data-product-upsell-container]',
  modalContent: '[data-product-upsell-ajax]',
  modalClose: '[data-quick-add-modal-close]',
  productGridItem: 'data-grid-item',
  productInformationHolder: '[data-product-information]',
  quickAddHolder: '[data-quick-add-holder]',
  quickAddModal: '[data-quick-add-modal]',
  quickAddModalTemplate: '[data-quick-add-modal-template]',
};

const attributes = {
  closing: 'closing',
  productId: 'data-product-id',
  modalHandle: 'data-quick-add-modal-handle',
  quickAddHolder: 'data-quick-add-holder',
};

class QuickAddProduct extends HTMLElement {
  constructor() {
    super();

    this.quickAddHolder = this.querySelector(selectors.quickAddHolder);
    this.modal = null;
    this.productId = this.quickAddHolder.getAttribute(attributes.quickAddHolder);
    this.modalButton = this.quickAddHolder.querySelector(selectors.modalButton);
    this.handle = this.modalButton?.getAttribute(attributes.modalHandle);
    this.buttonQuickAdd = this.quickAddHolder.querySelector(selectors.buttonQuickAdd);
    this.buttonATC = this.quickAddHolder.querySelector(selectors.buttonAddToCart);
    this.button = this.modalButton || this.buttonATC;
    this.modalClose = this.modalClose.bind(this);
    this.modalCloseOnProductAdded = this.modalCloseOnProductAdded.bind(this);
    this.a11y = window.theme.a11y;
    this.isAnimating = false;

    this.modalButtonClickEvent = this.modalButtonClickEvent.bind(this);
    this.quickAddLoadingToggle = this.quickAddLoadingToggle.bind(this);
  }

  connectedCallback() {
    /**
     * Modal button works for multiple variants products
     */
    if (this.modalButton) {
      this.modalButton.addEventListener('click', this.modalButtonClickEvent);
    }

    /**
     * Quick add button works for single variant products
     */
    if (this.buttonATC) {
      this.buttonATC.addEventListener('click', (e) => {
        e.preventDefault();

        window.theme.a11y.lastElement = this.buttonATC;

        document.dispatchEvent(
          new CustomEvent('theme:cart:add', {
            detail: {
              button: this.buttonATC,
            },
          })
        );
      });
    }

    if (this.quickAddHolder) {
      this.quickAddHolder.addEventListener('animationend', this.quickAddLoadingToggle);
      this.errorHandler();
    }
  }

  modalButtonClickEvent(e) {
    e.preventDefault();

    this.modalButton.classList.add(classes.loading);
    this.modalButton.disabled = true;

    this.renderModal();
  }

  modalCreate(response) {
    const cachedModal = document.querySelector(`${selectors.quickAddModal}[${attributes.productId}="${this.productId}"]`);

    if (cachedModal) {
      this.modal = cachedModal;
      this.modalOpen();
    } else {
      const modalTemplate = this.quickAddHolder.querySelector(selectors.quickAddModalTemplate);
      if (!modalTemplate) return;

      const htmlObject = document.createElement('div');
      htmlObject.innerHTML = modalTemplate.innerHTML;

      // Add dialog to the body
      document.body.appendChild(htmlObject.querySelector(selectors.quickAddModal));
      modalTemplate.remove();

      this.modal = document.querySelector(`${selectors.quickAddModal}[${attributes.productId}="${this.productId}"]`);
      this.modal.querySelector(selectors.modalContent).innerHTML = new DOMParser().parseFromString(response, 'text/html').querySelector(selectors.apiContent).innerHTML;

      this.modalCreatedCallback();
    }
  }

  modalOpen() {
    // Check if browser supports Dialog tags
    if (typeof this.modal.show === 'function') {
      this.modal.show();
    }

    this.modal.setAttribute('open', true);
    this.modal.removeAttribute('inert');

    this.quickAddHolder.classList.add(classes.disabled);

    if (this.modalButton) {
      this.modalButton.classList.remove(classes.loading);
      this.modalButton.disabled = false;
      window.theme.a11y.lastElement = this.modalButton;
    }

    // Animate items
    requestAnimationFrame(() => {
      this.modal.querySelectorAll(selectors.animation).forEach((item) => {
        item.classList.add(classes.animated);
      });
    });

    document.dispatchEvent(new CustomEvent('theme:quick-add:open', {bubbles: true}));
    document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
    document.addEventListener('theme:product:added', this.modalCloseOnProductAdded, {once: true});
  }

  modalClose() {
    if (this.isAnimating) {
      return;
    }

    if (!this.modal.hasAttribute(attributes.closing)) {
      this.modal.setAttribute(attributes.closing, '');
      this.isAnimating = true;
      return;
    }

    // Check if browser supports Dialog tags
    if (typeof this.modal.close === 'function') {
      this.modal.close();
    } else {
      this.modal.removeAttribute('open');
    }

    this.modal.removeAttribute(attributes.closing);
    this.modal.setAttribute('inert', '');
    this.modal.classList.remove(classes.loading);

    if (this.modalButton) {
      this.modalButton.disabled = false;
    }

    if (this.quickAddHolder && this.quickAddHolder.classList.contains(classes.disabled)) {
      this.quickAddHolder.classList.remove(classes.disabled);
    }

    this.resetAnimatedItems();

    // Unlock scroll if no other drawers & modals are open
    if (!window.theme.hasOpenModals()) {
      document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
    }

    document.removeEventListener('theme:product:added', this.modalCloseOnProductAdded);

    this.a11y.removeTrapFocus();
    this.a11y.autoFocusLastElement();
  }

  modalEvents() {
    // Close button click event
    this.modal.querySelector(selectors.modalClose)?.addEventListener('click', (e) => {
      e.preventDefault();
      this.modalClose();
    });

    // Close dialog on click outside content
    this.modal.addEventListener('click', (event) => {
      if (event.target.nodeName === 'DIALOG' && event.type === 'click') {
        this.modalClose();
      }
    });

    // Close dialog on click ESC key pressed
    this.modal.addEventListener('keydown', (event) => {
      if (event.code == 'Escape') {
        event.preventDefault();
        this.modalClose();
      }
    });

    // Close dialog after animation completes
    this.modal.addEventListener('animationend', (event) => {
      if (event.target !== this.modal) return;
      this.isAnimating = false;

      if (this.modal.hasAttribute(attributes.closing)) {
        this.modalClose();
      } else {
        setTimeout(() => {
          this.a11y.trapFocus(this.modal);
          const focusTarget = this.modal.querySelector('[autofocus]') || this.modal.querySelector(selectors.focusable);
          focusTarget?.focus();
        }, 50);
      }
    });
  }

  modalCloseOnProductAdded() {
    this.resetQuickAddButtons();
    if (this.modal && this.modal.hasAttribute('open')) {
      this.modalClose();
    }
  }

  quickAddLoadingToggle(e) {
    if (e.target != this.quickAddHolder) return;

    this.quickAddHolder.classList.remove(classes.disabled);
  }

  /**
   * Handle error cart response
   */
  errorHandler() {
    this.quickAddHolder.addEventListener('theme:cart:error', (event) => {
      const holder = event.detail.holder;
      const parentProduct = holder.closest(`[${selectors.productGridItem}]`);
      if (!parentProduct) return;

      const errorMessageHolder = holder.querySelector(selectors.messageError);
      const productInfo = parentProduct.querySelector(selectors.productInformationHolder);
      const button = holder.querySelector(selectors.buttonAddToCart);

      if (button) {
        button.classList.remove(classes.added, classes.loading);
        holder.classList.add(classes.error);
      }

      if (errorMessageHolder) {
        errorMessageHolder.innerText = event.detail.description;
      }

      setTimeout(() => {
        this.resetQuickAddButtons();
      }, settings.errorDelay);
    });
  }

  /**
   * Reset buttons to default states
   */
  resetQuickAddButtons() {
    if (this.quickAddHolder) {
      this.quickAddHolder.classList.remove(classes.visible, classes.error);
    }

    if (this.buttonQuickAdd) {
      this.buttonQuickAdd.classList.remove(classes.added);
      this.buttonQuickAdd.disabled = false;
    }
  }

  renderModal() {
    if (this.modal) {
      this.modalOpen();
    } else {
      window
        .fetch(`${window.theme.routes.root}products/${this.handle}?section_id=api-product-upsell`)
        .then(this.upsellErrorsHandler)
        .then((response) => {
          return response.text();
        })
        .then((response) => {
          this.modalCreate(response);
        });
    }
  }

  modalCreatedCallback() {
    this.modalEvents();
    this.modalOpen();

    wrapElements(this.modal);
  }

  upsellErrorsHandler(response) {
    if (!response.ok) {
      return response.json().then(function (json) {
        const e = new FetchError({
          status: response.statusText,
          headers: response.headers,
          json: json,
        });
        throw e;
      });
    }
    return response;
  }

  resetAnimatedItems() {
    this.modal?.querySelectorAll(selectors.animation).forEach((item) => {
      item.classList.remove(classes.animated);
    });
  }
}

export {QuickAddProduct};
