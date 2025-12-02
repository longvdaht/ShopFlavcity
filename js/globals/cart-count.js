const attributes = {
  count: 'data-cart-count',
  limit: 'data-limit',
};

class CartCount extends HTMLElement {
  constructor() {
    super();

    this.cartCount = null;
    this.limit = this.getAttribute(attributes.limit);
    this.onCartChangeCallback = this.onCartChange.bind(this);
  }

  connectedCallback() {
    document.addEventListener('theme:cart:change', this.onCartChangeCallback);
  }

  disconnectedCallback() {
    document.addEventListener('theme:cart:change', this.onCartChangeCallback);
  }

  onCartChange(event) {
    this.cartCount = event.detail.cartCount;
    this.update();
  }

  update() {
    if (this.cartCount !== null) {
      this.setAttribute(attributes.count, this.cartCount);
      let countValue = this.cartCount;

      if (this.limit && this.cartCount >= this.limit) {
        countValue = '9+';
      }

      this.innerText = countValue;
    }
  }
}

if (!customElements.get('cart-count')) {
  customElements.define('cart-count', CartCount);
}
