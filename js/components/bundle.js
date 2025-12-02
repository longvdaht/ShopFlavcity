const selectors = {
  form: 'form',
  formAddToCart: '[data-add-to-cart]',
  formAddToCartText: '[data-add-to-cart-text]',
  formProductPrice: '[data-product-price]',
  formInputVariantId: 'input[name="id"]',
  formInputQuantity: 'input[name="quantity"]',

  bundleBlock: 'bundle-block',
  counter: '[data-counter]',
  contentsFooterPrice: '[data-contents-footer-price]',
  contentsFooterCounter: '[data-contents-footer-counter]',

  cardProductBundle: 'card-product-bundle',
  controls: '[slot="controls"]',
  increaseButton: '[data-action="increase"]',
  addButton: '[data-action="add"]',
  radioInput: 'input[type="radio"][data-action="select"]'
};

const attributes = {
  formIdValue: 'data-product-form-id',
  parentVariantId: 'data-parent-variant-id',
  parentVariantPrice: 'data-variant-price',
  productPrice: 'data-product-price',
  calculatePrice: 'data-calculate-price',
  selectionType: 'data-selection-type',
  priorotyDiscountPercent: 'data-bundle-discount-percent'
};

class BundleBlock extends HTMLElement {
  connectedCallback() {
    this.productFormId = this.getAttribute(attributes.formIdValue);
    this.form = document.getElementById(this.productFormId);
    this.formAddToCart = this.form?.querySelector(selectors.formAddToCart);
    this.formInputVariantId = document.querySelector(`${selectors.formInputVariantId}[form="${this.productFormId}"]`);
    this.formPriceElement = document.querySelector(`${selectors.formProductPrice}[data-form="${this.productFormId}"]`);
    this.formInputQuantity = this.form?.querySelector(selectors.formInputQuantity);
    this.parentVariantId = this.getAttribute(attributes.parentVariantId);
    this.productPrice = parseInt(this.getAttribute(attributes.productPrice), 10) || 0;
    this.shouldCalculatePrice = this.getAttribute(attributes.calculatePrice) === 'true';
    this.contentsFooterPrice = this.querySelector(selectors.contentsFooterPrice);
    this._bundleAvailableState = true;

    const value = this.getAttribute(attributes.priorotyDiscountPercent);
    this.priorityDiscountPercent = value && !isNaN(parseFloat(value)) ? parseFloat(value) : null;

    this.formInputQuantity?.removeAttribute('name');
    this.formInputVariantId?.setAttribute('disabled', 'true');
    if (this.formAddToCart) this.formAddToCart.setAttribute('data-add-to-cart-bundle', '');

    this.updateCounter();
    if (this.shouldCalculatePrice) this.updateDisplayedPrice();
    this.toggleFormAddToCart();
    this.updatePopupData()

    document.addEventListener('bundle:change', () => {
      this.updateCounter();
      this.toggleIncreaseButtons();
      this.updateHiddenBundleInputs();
      this.updatePopupData()
      if (this.shouldCalculatePrice) {
        this.updateDisplayedPrice();
        this.updateContentsFooterPrice();
      }
      this.toggleFormAddToCart();
    });

    this.formInputQuantity?.addEventListener('change', event => {
      const qty = parseInt(event.target.value, 10) || 1;
      this.updateCardProductBundleQuantities(qty);
      this.toggleFormAddToCart();
      this.toggleIncreaseButtons();
    });
  }

  get bundleAvailableState() {
    return this._bundleAvailableState;
  }

  set bundleAvailableState(state) {
    this._bundleAvailableState = Boolean(state);
  }

  getMax() {
    const allItems = Array.from(this.querySelectorAll(selectors.cardProductBundle));
    const singleGroups = new Set();
    let count = 0;

    let maxLimitation = 0;
    let haveLimitation = false;

    for (const el of allItems) {
      let data;
      try {
        data = JSON.parse(el.getAttribute('data') || '{}');
      } catch (e) {
        console.warn('card-product-bundle: invalid data json on element', el, e);
        continue;
      }

      const selectionType = data.selectionType;
      const currentGroup = data.group;

      if (selectionType === 'single') {
        if (currentGroup) singleGroups.add(currentGroup);
      } else if (selectionType === 'limitation') {
        const raw = el.dataset.bundleVariantsLimit ?? data.bundleVariantsLimit ?? data.limit;
        const parsed = Number(raw);

        if (!Number.isNaN(parsed) && parsed > 0) {
          haveLimitation = true;
          if (parsed > maxLimitation) maxLimitation = parsed;
        }
      } else {
        count += 1;
      }
    }

    const groupLimit = haveLimitation ? maxLimitation : singleGroups.size;

    return count + groupLimit;
  }


  getCurrentSelected() {
    const allItems = Array.from(this.querySelectorAll(selectors.cardProductBundle));
    const groupTracker = new Set();
    let count = 0;

    for (const el of allItems) {
      const data = JSON.parse(el.getAttribute('data'));

      const selectionType = data.selectionType;
      const currentGroup = data.group;

      if (selectionType === 'single') {
        if (data.quantity > 0 && currentGroup && !groupTracker.has(currentGroup)) {
          count += 1;
          groupTracker.add(currentGroup);
        }
      } else {
        count += data.quantity || 0;
      }
    }

    return count;
  }

  updateDisplayedPrice() {
    const allSellectedBundleCards = this.getSelectedCardProductBundles();
    let total = 0;
    let totalPriceOverThreshold = 0;
    let maxDiscountPercent = 0;

    for (const card of allSellectedBundleCards) {
      const data = JSON.parse(card.getAttribute('data'));

      const quantity = parseInt(data.quantity);
      const price = parseFloat(data.variantPrice);

      const rawDiscount = data.productDiscount;
      const discount = rawDiscount ? parseFloat(rawDiscount) : 0;

      const rawPriceOverThreshold = data.variantPriceOverThreshold;
      let priceOverThreshold = rawPriceOverThreshold ? parseFloat(rawPriceOverThreshold) : 0;

      if (discount > maxDiscountPercent) {
        maxDiscountPercent = discount;
      }

      if (priceOverThreshold > 0) {
        totalPriceOverThreshold += quantity * priceOverThreshold;
      }

      total += quantity * price;
    }

    const discountedTotal = total * (1 - maxDiscountPercent / 100);

    if (!this.formPriceElement) return;

    if (totalPriceOverThreshold > 0 && total <= (this.productPrice + totalPriceOverThreshold)) {
      this.formPriceElement.textContent = this.formatPrice(this.productPrice + totalPriceOverThreshold);
      this.currentPrice = this.productPrice + totalPriceOverThreshold;
    } else if (total > this.productPrice) {
      this.formPriceElement.textContent = this.formatPrice(discountedTotal);
      this.currentPrice = discountedTotal;
    } else {
      this.formPriceElement.textContent = this.formatPrice(this.productPrice);
      this.currentPrice = this.productPrice;
    }
  }

  updateContentsFooterPrice() {
    const allSellectedBundleCards = this.getSelectedCardProductBundles();
    let totalPriceOverThreshold = 0;
    let totalItemPriceOverThreshold = 0;

    for (const card of allSellectedBundleCards) {
      const data = JSON.parse(card.getAttribute('data'));
      const quantity = parseInt(data.quantity);
      const rawPriceOverThreshold = data.variantPriceOverThreshold;
      let priceOverThreshold = rawPriceOverThreshold ? parseFloat(rawPriceOverThreshold) : 0;

      if (priceOverThreshold > 0) {
        totalPriceOverThreshold += quantity * priceOverThreshold;
        totalItemPriceOverThreshold += quantity * 1;
      }
    }

    if (!this.contentsFooterPrice) return;

    if (totalPriceOverThreshold > 0) {
      this.contentsFooterPrice.textContent = `+ ${this.formatPrice(totalPriceOverThreshold)}`;
    } else {
      this.contentsFooterPrice.textContent = '';
    }

    this.updateContentsFooterCounter(totalItemPriceOverThreshold)
  }

  formatPrice(cents) {
    const price = (cents / 100).toFixed(2);
    return `$${price}`;
  }

  getSelectedCardProductBundles() {
    return Array.from(this.querySelectorAll(selectors.cardProductBundle)).filter(el => {
      const d = JSON.parse(el.getAttribute('data')) || {};
      return d.quantity > 0;
    });
  }

  updatePopupData() {
    const allSelectedBundleCards = this.getSelectedCardProductBundles();
    const wrapperForBundleItems = document.querySelector('.product-upsell-popup__main-product-items');
    const wrapperForBundleItemFree = document.querySelector('.product-upsell-popup__main-product-free');

    if (wrapperForBundleItems) {
      wrapperForBundleItems.innerHTML = '';

      for (const card of allSelectedBundleCards) {
        const data = JSON.parse(card.getAttribute('data'));
        const price = this.formatPrice(data.variantPrice);
        const title = data.productTitle;
        const ifGiftProduct = data.ifGiftProduct

        if (ifGiftProduct) {
          let itemElementFree = document.querySelector('.upsell-popup__bundle-item-free');
          itemElementFree.innerHTML = `
        <span class="upsell-popup__bundle-item-title">${title}</span>
        <span class="upsell-popup__bundle-item-price">(${price})</span>
          `;
          wrapperForBundleItemFree.classList.remove('hidden');
        } else {
          let itemElement = document.createElement('li');
          itemElement.className = 'upsell-popup__bundle-item';
          itemElement.innerHTML = `
        <span class="upsell-popup__bundle-item-title">${title}</span>
        <span class="upsell-popup__bundle-item-price">(${price})</span>
          `;
          wrapperForBundleItems.appendChild(itemElement);
        }
      }
    }
  }

  getBundleInputArray() {
    return this.getSelectedCardProductBundles().map(el => {
      const d = JSON.parse(el.getAttribute('data')) || {};
      return `${d.variantId}:${d.quantity}`;
    });
  }

  getBundleInputValue() {
    return this.getBundleInputArray().filter(Boolean).join(', ');
  }

  updateHiddenBundleInputs() {
    const value = this.getBundleInputValue();

    this.querySelectorAll(selectors.cardProductBundle).forEach(el => {
      const element = el.querySelector(`input[name="items[${el._data.index}][properties][_bundlePackages]"]`);
      if (element) {
        element.value = value;
      }
    });
  }

  updateCardProductBundleQuantities(pq) {
    this.querySelectorAll(selectors.cardProductBundle).forEach(el => {
      const data = JSON.parse(el.getAttribute('data'))||{};
      const q = data.quantity
      data.parentQuantity = pq;
      const visual = el.querySelector('input[name="visual-quantity"]');
      const qtyInput = el.querySelector(`input[name="items[${el.index}][quantity]"]`);
      if (visual) visual.value = q || 0;
      if (qtyInput) qtyInput.value = (q || 0) * pq;
      el.setAttribute('data', JSON.stringify(data));
    });
  }

  updateCounter() {
    const c = this.querySelector(selectors.counter);
    if (c) c.textContent = `${this.getCurrentSelected()}/${this.getMax()}`;
  }

  updateContentsFooterCounter(counter) {
    const c = this.querySelector(selectors.contentsFooterCounter);
    if (c) c.textContent = counter;
  }

  toggleFormAddToCart() {
    let text = ''
    let disabledState = false
    // if (this.formAddToCart) {
    //   this.formAddToCart.disabled = this.getCurrentSelected() < this.getMax();
      if (this.getCurrentSelected() < this.getMax()) {
        text = `ADD ${this.getMax() - this.getCurrentSelected()} MORE TO CONTINUE`
        disabledState = true
      } else {
        // text = `${window.theme.strings.addToCart} - ${this.formatPrice(this.currentPrice)}`
        text = `${window.theme.strings.addToCart}`
        disabledState = false
        //     this.formAddToCart.querySelector('[data-add-to-cart-text]').textContent = ``;
      }

    this.updateFormAddToCartText(text, disabledState);
    // }
  }

  updateFormAddToCartText(text = 'Sold Out', disabledState = true) {
    if (!this.formAddToCart) return;
    this.formAddToCart.disabled = disabledState;
    this.formAddToCart.querySelector(selectors.formAddToCartText).textContent = text;
  }

  toggleIncreaseButtons() {
    this.querySelectorAll(selectors.cardProductBundle).forEach(el => el.toggleQuantityControls?.());
  }
}
customElements.define('bundle-block', BundleBlock);

class CardProductBundle extends HTMLElement {
  static get observedAttributes() {
    return ['data'];
  }

  constructor() {
    super();
    this.attachShadow({mode:'open'}).innerHTML = `<slot name="content"></slot><slot name="controls"></slot>`;
    this._data = {
      quantity: 0,
      parentQuantity: 1,
      index: null,
      productFormId: null,
      variantId: null,
      variantAvailable: false,
      definedProductState: false,
      variantPrice: 0,
      productDiscount: 0,
      selectionType: 'multi',
      group: null
    };
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data') {
      this._upgradeData();
      this.render();
    }
  }

  connectedCallback() {
    this._upgradeData();
    this.render();
  }

  _upgradeData() {
    const raw = this.getAttribute('data') || '{}';
    try {
      const parsed = JSON.parse(raw);
      // Зливаємо parsed поверх початкового об'єкта
      this._data = { ...this._data, ...parsed };
    } catch (e) {
      console.error('Invalid JSON in data attribute', e);
    }
  }

  get bundleBlock() {
    return this.closest(selectors.bundleBlock);
  }

  get isSingleSelect() {
    return this._data.selectionType === 'single';
  }

  get quantity() {
    return Number(this._data.quantity) || 0;
  }

  set quantity(val) {
    this._data.quantity = val;
    this._syncDataAttr();
    this.render();
  }

  _syncDataAttr() {
    this.setAttribute('data', JSON.stringify(this._data));
  }

  render() {
    const d = this._data;

    if (!d.index || !d.productFormId || !d.variantId) return;

    const defined = d.definedProductState;
    const avail   = d.variantAvailable;
    let html = '';

    if (this.isSingleSelect) {
      html = this._singleSelectHTML();
    } else {
      if (!avail) {
        html = this._soldOutHTML();
      } else if (defined && avail) {
        html = this._alreadyAddedHTML();
      } else if (d.quantity > 0) {
        html = this._quantityHTML();
      } else {
        html = this._addHTML();
      }
    }

    this.querySelector(selectors.controls)?.remove();
    this.insertAdjacentHTML('beforeend', html);
    this.setupEventListeners();
  }

  _singleSelectHTML() {
    const q = this._data.quantity;
    const checked = q > 0 ? 'checked' : '';
    const id = `radio-${this._data.group}-${this._data.index}`;
    const priorityInput =
      this.bundleBlock?.priorityDiscountPercent !== null && this.bundleBlock?.priorityDiscountPercent > 0
        ? `<input type="hidden" name="items[${this._data.index}][properties][_bundlePriorityDiscount]" value="${this.bundleBlock.priorityDiscountPercent}" form="${this._data.productFormId}" />`
        : '';
    const hiddenInputs = q > 0 ? `
      <input type="hidden" name="items[${this._data.index}][id]" value="${this._data.variantId}" form="${this._data.productFormId}" />
      <input type="hidden" name="items[${this._data.index}][quantity]" value="${1 * this._data.parentQuantity}" form="${this._data.productFormId}" />
      <input type="hidden" name="items[${this._data.index}][properties][_bundlePackages]" value="${this.bundleBlock?.getBundleInputValue()}" form="${this._data.productFormId}" />
      <input type="hidden" name="items[${this._data.index}][properties][_bundleParentVariantId]" value="${this.bundleBlock.parentVariantId}" form="${this._data.productFormId}" />
       ${priorityInput}
    ` : '';

    return `<div class="card-bundle__controls" slot="controls">
              <input data-action="select" tabindex="0" type="radio" id="${id}" name="${this._data.group}" ${checked}/>
              <label for="${id}" aria-label="Select">${q > 0 ? '<span class="visually-hidden">Selected</span>' : '<span class="visually-hidden">Select</span>'}</label>
              ${hiddenInputs}
            </div>`;
  }

  _soldOutHTML() {
    const defined = this._data.definedProductState;
    const btn_class =  defined ? 'btn--secondary' : 'btn--primary';

    if (defined && this.bundleBlock) {
      this.bundleBlock.updateFormAddToCartText();
      this.bundleBlock.bundleAvailableState = false;
    }

    return `<div class="card-bundle__controls" slot="controls"><button disabled class="btn ${btn_class} card-bundle__btn--sold-out">Sold out</button></div>`;
  }

  _alreadyAddedHTML() {
    const pq = this._data.parentQuantity;
    const v = 1*pq;
    const priorityInput =
      this.bundleBlock?.priorityDiscountPercent !== null && this.bundleBlock?.priorityDiscountPercent > 0
        ? `<input type="hidden" name="items[${this._data.index}][properties][_bundlePriorityDiscount]" value="${this.bundleBlock.priorityDiscountPercent}" form="${this._data.productFormId}" />`
        : '';

    return `<div class="card-bundle__controls" slot="controls">
      <button disabled class="btn btn--secondary card-bundle__btn--added"><span class="card-bundle__btn-arrow"></span>Added</button>
      <input type="hidden" name="items[${this._data.index}][id]" value="${this._data.variantId}" form="${this._data.productFormId}"/>
      <input type="hidden" name="items[${this._data.index}][quantity]" value="${v}" form="${this._data.productFormId}"/>
      <input type="hidden" name="items[${this._data.index}][properties][_bundlePackages]" value="${this.bundleBlock?.getBundleInputValue()}" form="${this._data.productFormId}"/>
      <input type="hidden" name="items[${this._data.index}][properties][_bundleParentVariantId]" value="${this.bundleBlock.parentVariantId}" form="${this._data.productFormId}"/>
       ${priorityInput}
    </div>`;
  }

  _quantityHTML() {
    const q = this._data.quantity;
    const pq = this._data.parentQuantity;
    const priorityInput =
      this.bundleBlock?.priorityDiscountPercent !== null && this.bundleBlock?.priorityDiscountPercent > 0
        ? `<input type="hidden" name="items[${this._data.index}][properties][_bundlePriorityDiscount]" value="${this.bundleBlock.priorityDiscountPercent}" form="${this._data.productFormId}" />`
        : '';

    return `<div class="card-bundle__controls" slot="controls">
      <div class="card-bundle__qty">
        <button class="quantity__minus quantity__button quantity" data-action="decrease" aria-label="Decrease"><svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-minus" viewBox="0 0 24 24"><path d="M6 12h12" stroke="#000" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>
        <input class="quantity__input" name="visual-quantity" value="${q}" disabled />
        <button class="quantity__plus quantity__butto quantity" data-action="increase" aria-label="Increase"><svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-plus" viewBox="0 0 24 24"><path d="M6 12h6m6 0h-6m0 0V6m0 6v6" stroke="#000" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>
      </div>
      <button class="card-bundle__remove" data-action="remove" aria-label="Remove"><svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-plus" viewBox="0 0 24 24"><path d="M6 12h6m6 0h-6m0 0V6m0 6v6" stroke="#000" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>
      <input type="hidden" name="items[${this._data.index}][id]" value="${this._data.variantId}" form="${this._data.productFormId}" />
      <input type="hidden" name="items[${this._data.index}][quantity]" value="${q*pq}" form="${this._data.productFormId}" />
      <input type="hidden" name="items[${this._data.index}][properties][_bundlePackages]" value="${this.bundleBlock?.getBundleInputValue()}" form="${this._data.productFormId}" />
      <input type="hidden" name="items[${this._data.index}][properties][_bundleParentVariantId]" value="${this.bundleBlock.parentVariantId}" form="${this._data.productFormId}" />
      
      ${priorityInput}
    </div>`;
  }

  _addHTML() {
    const bundleAvailable = this.bundleBlock?.bundleAvailableState;
    const variantAvailable = this._data?.variantAvailable;
    const disabled = bundleAvailable === false || !variantAvailable;

    return `
      <div class="card-bundle__controls" slot="controls">
        <button 
          data-action="add" 
          class="btn btn--primary card-bundle__btn--add" 
          type="button" 
          ${disabled ? 'disabled' : ''}
        >
          ADD
        </button>
      </div>
    `;
  }

  setupEventListeners() {
    const c = this.querySelector('[slot="controls"]');

    if (!c) return;
    if (this.isSingleSelect) {
      const radio = c.querySelector('input[type="radio"]');

      if (!this._data.variantAvailable) {
        radio.disabled = true;
        return;
      }

      radio.addEventListener('change', (e) => {
        document.querySelectorAll(`card-product-bundle[group="${this._data.group}"]`).forEach(el => {
          if (el !== this) {
            const d = JSON.parse(el.getAttribute('data') || '{}');
            d.quantity = 0;
            el.setAttribute('data', JSON.stringify(d));
          }
        });
        this._data.quantity = e.target.checked ? 1 : 0;
        this._syncDataAttr();
        this.triggerBundleChange();
      });
    } else {
      c.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {

          const visualInput = c.querySelector('input[name="visual-quantity"]');
          let q = visualInput ? parseInt(visualInput.value, 10) : 0;
          // const qtyInput = c.querySelector(`input[name="items[${this._data.index}][quantity]"]`);

          const max = this.bundleBlock.getMax();
          const curr = this.bundleBlock.getCurrentSelected();
          const act = btn.dataset.action;

          if (act === 'add' && curr < max) {
            q = 1;
            setTimeout(() => c.querySelector(selectors.increaseButton)?.focus(), 10);
          }
          else if (act === 'increase' && curr < max) q++;
          else if (act === 'decrease') {
            q = Math.max(q - 1, 0);
            if (q === 0) setTimeout(() => c.querySelector(selectors.addButton)?.focus(), 10);
          }
          else if (act === 'remove') {
            q = 0;
            setTimeout(() => c.querySelector(selectors.addButton)?.focus(), 10);
          }

          if (visualInput) visualInput.value = q;

          this._data.quantity = q;
          this._syncDataAttr();
          this.triggerBundleChange();
        });
      });
    }
  }

  toggleQuantityControls() {
    const addButton = this.querySelector(selectors.addButton);
    const increaseButton = this.querySelector(selectors.increaseButton);
    const disableBecauseMax = this.bundleBlock.getCurrentSelected() >= this.bundleBlock.getMax();
    const forceDisable = !this._data.variantAvailable;

    if (addButton) addButton.disabled = forceDisable || disableBecauseMax;

    if (increaseButton) increaseButton.disabled = forceDisable || disableBecauseMax;
  }

  triggerBundleChange() {
    this.toggleQuantityControls();
    document.dispatchEvent(new CustomEvent('bundle:change'));
  }
}

customElements.define('card-product-bundle', CardProductBundle);