const classes = {
  added: 'is-added',
  animated: 'is-animated',
  disabled: 'is-disabled',
  error: 'has-error',
  loading: 'is-loading',
  open: 'is-open',
  visible: 'is-visible',
};

const selectors = {
  modalClose: '[data-product-upsell-close]',
  keepShopping: '[data-product-upsell-keep-shopping]',
  goToCart: '[data-product-upsell-go-to-cart]',
  addToCart: '[data-add-to-cart]',
  cartDrawer: 'cart-drawer',
};

const attributes = {
  closing: 'closing',
};

if (!customElements.get('product-upsell-popup')) {
  customElements.define(
    'product-upsell-popup',

    class ProductUpsellPopup extends HTMLElement {
      constructor() {
        super();
        this.a11y = window.theme.a11y;
        this.modalClose = this.modalClose.bind(this);
        this.modal = this.querySelector('dialog');

        this.init()
      }

      init() {
        this.modal.querySelector(selectors.modalClose)?.addEventListener('click', (e) => {
          e.preventDefault();
          this.modalClose();
        });
        this.modal.querySelector(selectors.keepShopping)?.addEventListener('click', (e) => {
          e.preventDefault();
          this.modalClose();
        });
        this.modal.querySelector(selectors.goToCart)?.addEventListener('click', (e) => {
          e.preventDefault();
          this.goToCart();
        })
        this.modal.querySelector(selectors.addToCart)?.addEventListener('click', (e) => {
          e.preventDefault();
          setTimeout(() => {
            this.goToCart();
          }, 2000)
        })
      }

      goToCart() {
        if (theme.settings.cartType !== 'drawer') return;
        this.modalClose();
        const cartDrawer = document.querySelector(selectors.cartDrawer);

        if (cartDrawer) {
          cartDrawer.dispatchEvent(new CustomEvent('theme:cart-drawer:show'));
          window.theme.a11y.lastElement = selectors.goToCart;
        }
      }

      modalOpen() {
        // Check if browser supports Dialog tags
        if (typeof this.modal.show === 'function') {
          this.modal.show();
        }

        this.modal.setAttribute('open', true);
        this.modal.removeAttribute('inert');

        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
      }

      modalClose() {

        // Check if browser supports Dialog tags
        if (typeof this.modal.close === 'function') {
          this.modal.close();
        } else {
          this.modal.removeAttribute('open');
        }

        this.modal.removeAttribute(attributes.closing);
        this.modal.setAttribute('inert', '');
        this.modal.classList.remove(classes.loading);

        // Unlock scroll if no other drawers & modals are open
        if (!window.theme.hasOpenModals()) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }

        this.a11y.removeTrapFocus();
        this.a11y.autoFocusLastElement();
      }
    }
  );
}
