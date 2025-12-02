import FetchError from '../util/fetch-error';

const classes = {
  animated: 'is-animated',
  active: 'is-active',
  added: 'is-added',
  disabled: 'is-disabled',
  empty: 'is-empty',
  error: 'has-error',
  headerStuck: 'js__header__stuck',
  hidden: 'is-hidden',
  collapsed: 'is-collapsed',
  hiding: 'is-hiding',
  loading: 'is-loading',
  open: 'is-open',
  removed: 'is-removed',
  success: 'is-success',
  visible: 'is-visible',
  expanded: 'is-expanded',
  updated: 'is-updated',
  variantSoldOut: 'variant--soldout',
  variantUnavailable: 'variant--unavailable',
};

const selectors = {
  apiContent: '[data-api-content]',
  apiLineItems: '[data-api-line-items]',
  apiCartPrice: '[data-api-cart-price]',
  animation: '[data-animation]',
  additionalCheckoutButtons: '.additional-checkout-buttons',
  cartBarAdd: '[data-add-to-cart-bar]',
  cartCloseError: '[data-cart-error-close]',
  cartDrawer: 'cart-drawer',
  cartDrawerClose: '[data-cart-drawer-close]',
  cartEmpty: '[data-cart-empty]',
  cartErrors: '[data-cart-errors]',
  cartItemRemove: '[data-item-remove]',
  cartPage: '[data-cart-page]',
  cartForm: '[data-cart-form]',
  cartTermsCheckbox: '[data-cart-acceptance-checkbox]',
  cartCheckoutButtonWrapper: '[data-cart-checkout-buttons]',
  cartCheckoutButton: '[data-cart-checkout-button]',
  cartTotal: '[data-cart-total]',
  checkoutButtons: '[data-checkout-buttons]',
  errorMessage: '[data-error-message]',
  formCloseError: '[data-close-error]',
  formErrorsContainer: '[data-cart-errors-container]',
  formWrapper: '[data-form-wrapper]',
  freeShipping: '[data-free-shipping]',
  gwpMessage: '[data-gwp-message]',
  progressGraph: '[data-progress-graph]',
  freeShippingProgress: '[data-progress-bar]',
  progressBar: '[data-progress-bar]',
  headerWrapper: '[data-header-wrapper]',
  item: '[data-item]',
  itemsHolder: '[data-items-holder]',
  leftToSpend: '[data-left-to-spend]',
  navDrawer: '[data-drawer]',
  outerSection: '[data-section-id]',
  priceHolder: '[data-cart-price-holder]',
  cartComplementaryProducts: '[data-cart-complementary-products]',
  cartPromotionBlock: '[data-cart-promotion-block]',
  quickAddHolder: '[data-quick-add-holder]',
  quickAddModal: '[data-quick-add-modal]',
  qtyInput: 'input[name="updates[]"]',
  qtyCounter: '.cart__quantity[data-item-quantity]',
  termsErrorMessage: '[data-terms-error-message]',
  noscript: 'noscript',
  gwpData: '#GWP_DATA',
};

const attributes = {
  cartTotal: 'data-cart-total',
  disabled: 'disabled',
  freeShipping: 'data-free-shipping',
  freeShippingLimit: 'data-free-shipping-limit',
  gwpMessage: 'data-gwp-message',
  gwpMessageLimit: 'data-gwp-message-limit',
  item: 'data-item',
  itemIndex: 'data-item-index',
  itemTitle: 'data-item-title',
  quickAddHolder: 'data-quick-add-holder',
  quickAddVariant: 'data-quick-add-variant',
  scrollLocked: 'data-scroll-locked',
  name: 'name',
};

class CartItems extends HTMLElement {
  constructor() {
    super();

    this.a11y = window.theme.a11y;
  }

  async connectedCallback() {
    // DOM Elements
    this.cartPage = document.querySelector(selectors.cartPage);
    this.cartForm = document.querySelector(selectors.cartForm);
    this.cartDrawer = document.querySelector(selectors.cartDrawer);
    this.cartEmpty = document.querySelector(selectors.cartEmpty);
    this.cartTermsCheckbox = document.querySelector(selectors.cartTermsCheckbox);
    this.cartCheckoutButtonWrapper = document.querySelector(selectors.cartCheckoutButtonWrapper);
    this.cartCheckoutButton = document.querySelector(selectors.cartCheckoutButton);
    this.checkoutButtons = document.querySelector(selectors.checkoutButtons);
    this.itemsHolder = document.querySelector(selectors.itemsHolder);
    this.priceHolder = document.querySelector(selectors.priceHolder);
    this.cartComplementaryProducts = document.querySelector(selectors.cartComplementaryProducts);
    this.items = document.querySelectorAll(selectors.item);
    this.cartTotal = document.querySelector(selectors.cartTotal);
    this.freeShipping = document.querySelectorAll(selectors.freeShipping);
    this.gwpMessage = document.querySelectorAll(selectors.gwpMessage);
    this.cartErrorHolder = document.querySelector(selectors.cartErrors);
    this.cartCloseErrorMessage = document.querySelector(selectors.cartCloseError);
    this.headerWrapper = document.querySelector(selectors.headerWrapper);
    this.navDrawer = document.querySelector(selectors.navDrawer);
    this.subtotal = window.theme.subtotal;
    this.lineItemsHTML = this.innerHTML;

    // Define Cart object depending on if we have cart drawer or cart page
    this.cart = this.cartDrawer || this.cartPage;
    window.theme.cart = this.cart;

    // Cart events
    this.animateItems = this.animateItems.bind(this);
    this.addToCart = this.addToCart.bind(this);
    this.cartAddEvent = this.cartAddEvent.bind(this);
    this.updateProgress = this.updateProgress.bind(this);
    this.onCartDrawerClose = this.onCartDrawerClose.bind(this);

    // Set global event listeners for "Add to cart" and Announcement bar wheel progress
    document.addEventListener('theme:cart:add', this.cartAddEvent);
    document.addEventListener('theme:announcement:init', this.updateProgress);

    if (theme.settings.cartType == 'drawer') {
      document.addEventListener('theme:cart-drawer:open', this.animateItems);
      document.addEventListener('theme:cart-drawer:close', this.onCartDrawerClose);
    }

    if (this.cartPage) {
      const progressBarTemplate = document.querySelector('template#cart-progress-bar-template')?.innerHTML;
      const progressBarInner = document.querySelectorAll('[data-cart-progress-bar-inner]')
      for (const progressBar of progressBarInner) {
        progressBar.innerHTML = progressBarTemplate;
      }
    }

    await this.checkGWP(true);
    await this.getCart();

    // Free Shipping values
    this.circumference = 28 * Math.PI; // radius - stroke * 4 * PI
    this.freeShippingLimit = this.freeShipping.length ? Number(this.freeShipping[0].getAttribute(attributes.freeShippingLimit)) * 100 * window.Shopify.currency.rate : 0;
    this.gwpMessageLimit = this.gwpMessage.length ? Number(this.gwpMessage[0].getAttribute(attributes.gwpMessageLimit)) * 100 * window.Shopify.currency.rate : 0;

    this.freeShippingMessageHandle(this.subtotal);
    this.gwpMessageHandle(this.subtotal);
    this.updateProgress();

    this.build = this.build.bind(this);
    this.updateCart = this.updateCart.bind(this);
    this.productAddCallback = this.productAddCallback.bind(this);
    this.formSubmitHandler = window.theme.throttle(this.formSubmitHandler.bind(this), 50);

    if (this.cartPage) {
      this.animateItems();
    }

    if (this.cart) {
      // Checking
      this.hasItemsInCart = this.hasItemsInCart.bind(this);
      this.cartCount = this.getCartItemCount();
    }

    // Set classes
    this.toggleClassesOnContainers = this.toggleClassesOnContainers.bind(this);

    // Flags
    this.totalItems = this.items.length;

    this.cartUpdateFailed = false;

    // Cart Events
    this.cartEvents();
    this.cartRemoveEvents();
    this.cartUpdateEvents();

    document.addEventListener('theme:product:add', this.productAddCallback);
    document.addEventListener('theme:product:add-error', this.productAddCallback);
    document.addEventListener('theme:cart:refresh', this.getCart.bind(this));
  }

  disconnectedCallback() {
    document.removeEventListener('theme:cart:add', this.cartAddEvent);
    document.removeEventListener('theme:cart:refresh', this.cartAddEvent);
    document.removeEventListener('theme:announcement:init', this.updateProgress);
    document.removeEventListener('theme:product:add', this.productAddCallback);
    document.removeEventListener('theme:product:add-error', this.productAddCallback);

    if (document.documentElement.hasAttribute(attributes.scrollLocked)) {
      document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
    }
  }

  onCartDrawerClose() {
    this.resetAnimatedItems();

    if (this.cartDrawer?.classList.contains(classes.open)) {
      this.cart.classList.remove(classes.updated);
    }

    this.cartEmpty.classList.remove(classes.updated);
    this.cartErrorHolder.classList.remove(classes.expanded);
    this.cart.querySelectorAll(selectors.animation).forEach((item) => {
      const removeHidingClass = () => {
        item.classList.remove(classes.hiding);
        item.removeEventListener('animationend', removeHidingClass);
      };

      item.classList.add(classes.hiding);
      item.addEventListener('animationend', removeHidingClass);
    });
  }

  /**
   * Cart update event hook
   *
   * @return  {Void}
   */

  cartUpdateEvents() {
    this.items = document.querySelectorAll(selectors.item);

    delete window.complementaryGroupsExpected;
    delete window.complementaryGroupsLoaded;

    this.items.forEach((item) => {
      item.addEventListener('theme:cart:update', (event) => {
        this.updateCart(
          {
            id: event.detail.id,
            quantity: event.detail.quantity,
          },
          item
        );
      });
    });
  }

  /**
   * Cart events
   *
   * @return  {Void}
   */

  cartRemoveEvents() {
    const cartItemRemove = document.querySelectorAll(selectors.cartItemRemove);

    cartItemRemove.forEach((button) => {
      const item = button.closest(selectors.item);
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const itemIsGWP = item.dataset.itemIsGwp === 'true';

        if (button.classList.contains(classes.disabled)) return;
        if (itemIsGWP) this.setGwpSessionStorage(button.dataset.id);

        this.updateCart(
          {
            id: button.dataset.id,
            quantity: 0,
          },
          item
        );
      });
    });

    if (this.cartCloseErrorMessage) {
      this.cartCloseErrorMessage.addEventListener('click', (event) => {
        event.preventDefault();

        this.cartErrorHolder.classList.remove(classes.expanded);
      });
    }
  }

  /**
   * Cart event add product to cart
   *
   * @return  {Void}
   */

  async cartAddEvent(event) {
    let formData = '';
    let button = event.detail.button;

    if (button.hasAttribute('disabled')) return;
    const form = button.closest('form');
    // Validate form
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    formData = new FormData(form);

    const hasInputsInNoScript = [...form.elements].some((el) => el.closest(selectors.noscript));
    if (hasInputsInNoScript) {
      formData = this.handleFormDataDuplicates([...form.elements], formData);
    }

    if (form !== null && form.querySelector('[type="file"]')) {
      return;
    }
    if (theme.settings.cartType === 'drawer' && this.cartDrawer) {
      event.preventDefault();
    }
    await this.addToCart(formData, button);
  }

  /**
   * Modify the `formData` object in case there are key/value pairs with an overlapping `key`
   *  - the presence of form input fields inside a `noscript` tag leads to a duplicate `key`, which overwrites the existing `value` when the `FormData` is constructed
   *  - such key/value pairs discrepancies occur in the Theme editor, when any setting is updated, and right before one presses the "Save" button
   *
   * @param   {Array}  A list of all `HTMLFormElement.elements` DOM nodes
   * @param   {Object}  `FormData` object, created with the `FormData()` constructor
   *
   * @return  {Object} Updated `FormData` object that does not contain any duplicate keys
   */
  handleFormDataDuplicates(elements, formData) {
    if (!elements.length || typeof formData !== 'object') return formData;

    elements.forEach((element) => {
      if (element.closest(selectors.noscript)) {
        const key = element.getAttribute(attributes.name);
        const value = element.value;

        if (key) {
          const values = formData.getAll(key);
          if (values.length > 1) values.splice(values.indexOf(value), 1);

          formData.delete(key);
          formData.set(key, values[0]);
        }
      }
    });

    return formData;
  }

  /**
   * Cart events
   *
   * @return  {Void}
   */

  cartEvents() {
    if (this.cartTermsCheckbox) {
      this.cartTermsCheckbox.removeEventListener('change', this.formSubmitHandler);
      this.cartCheckoutButtonWrapper.removeEventListener('click', this.formSubmitHandler);
      this.cartForm.removeEventListener('submit', this.formSubmitHandler);

      this.cartTermsCheckbox.addEventListener('change', this.formSubmitHandler);
      this.cartCheckoutButtonWrapper.addEventListener('click', this.formSubmitHandler);
      this.cartForm.addEventListener('submit', this.formSubmitHandler);
    }
  }

  formSubmitHandler() {
    const termsAccepted = document.querySelector(selectors.cartTermsCheckbox).checked;
    const termsError = document.querySelector(selectors.termsErrorMessage);

    // Disable form submit if terms and conditions are not accepted
    if (!termsAccepted) {
      if (document.querySelector(selectors.termsErrorMessage).length > 0) {
        return;
      }

      termsError.innerText = theme.strings.cartAcceptanceError;
      this.cartCheckoutButton.setAttribute(attributes.disabled, true);
      termsError.classList.add(classes.expanded);
    } else {
      termsError.classList.remove(classes.expanded);
      this.cartCheckoutButton.removeAttribute(attributes.disabled);
    }
  }

  /**
   * Cart event remove out of stock error
   *
   * @return  {Void}
   */

  formErrorsEvents(errorContainer) {
    const buttonErrorClose = errorContainer.querySelector(selectors.formCloseError);
    buttonErrorClose?.addEventListener('click', (e) => {
      e.preventDefault();

      if (errorContainer) {
        errorContainer.classList.remove(classes.visible);
      }
    });
  }

  /**
   * Get response from the cart
   *
   * @return  {Void}
   */

  async getCart() {
    if (this.checkingGWPState) return;

    try {
      const response = await fetch(theme.routes.cart_url + '?section_id=api-cart-items');
      const responseChecked = await this.cartErrorsHandler(response);
      const responseText = await responseChecked.text();

      const element = document.createElement('div');
      element.innerHTML = responseText;
      const cleanResponse = element.querySelector(selectors.apiContent);
      const cartItems = cleanResponse.querySelector(selectors.apiLineItems);

      const isCartItemsChanged = cartItems && this.lineItemsHTML !== cartItems?.innerHTML;
      const isEmptyCartStateChanged = !cartItems && this.hasChildNodes();

      if (isEmptyCartStateChanged) {
        this.clearGwpSessionStorage();
      }

      // Check if cartItems has changed by comparing its innerHTML
      if (isCartItemsChanged || isEmptyCartStateChanged) {
        this.build(cleanResponse);
        this.lineItemsHTML = cartItems?.innerHTML || '';
      }

    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Check GWP data
   * @return  {Void}
   */

  async checkGWP(initLoad = false) {
    if (this.checkingGWPState) return;

    try {
      this.checkingGWPState = true;

      const dataInner = await this.getGWPData(initLoad);
      if (!dataInner) {
        this.checkingGWPState = false;
        return;
      }

      const parsedData = this.parseGWPData(dataInner);
      if (!parsedData) {
        this.checkingGWPState = false;
        return;
      }

      const {
        GWP_DATA_TO_REMOVE,
        GWP_DATA_TO_ADD,
        SET_GWP_QTY_TO_1,
        CLEAR_GWP_SESSION_STORAGE
      } = parsedData;

      if (this.lastParsedData && this.lastParsedData === JSON.stringify(parsedData)) {
        this.checkingGWPState = false;
        return;
      }

      this.lastParsedData = JSON.stringify(parsedData);
      if (CLEAR_GWP_SESSION_STORAGE) this.clearGwpSessionStorage();
      await this.processGwpUpdates(SET_GWP_QTY_TO_1, 1);
      await this.processGwpUpdates(GWP_DATA_TO_REMOVE);
      await this.processGwpAdd(GWP_DATA_TO_ADD);
      this.checkingGWPState = false;
    } catch (error) {
      this.checkingGWPState = false;
    }
  }

  /**
   * Get GWP data
   *
   * @return {Object || undefined}
   */

  async getGWPData(initLoad) {
    return initLoad
        ? document.querySelector(selectors.gwpData)?.textContent
        : await this.fetchGwpData();
  }

  /**
   * Parse GWP data
   *
   * @return {Object || undefined}
   */

  parseGWPData(dataInner) {
    try {
      return JSON.parse(dataInner);
    } catch (err) {
      console.warn('Invalid GWP JSON');
      return null;
    }
  }

  /**
   * Fetch GWP data
   *
   * @return {Object || undefined}
   */

  async fetchGwpData() {
    const sectionId = document.querySelector(selectors.gwpData)?.dataset?.sectionId;
    const response = await fetch(theme.routes.cart_url + `?section_id=${sectionId}`)
    const responseText = await response.text();
    const responseHtml = new DOMParser().parseFromString(responseText, 'text/html');
    return responseHtml?.querySelector(selectors.gwpData)?.textContent;
  }

  /**
   * Update GWPs
   *
   * @param {Array} items - array of item IDs
   * @param {Number} quantity - quantity
   * @return {Promise<void>}
   */

  async processGwpUpdates(items = [], quantity = 0) {
    if (!items?.length) return;
    const updates = items.reduce((acc, id) => ({...acc, [id]: quantity}), {});
    await this.updateCartItems(updates);
  }

  /**
   * Add GWPs
   * @param {Array} items - array of item IDs
   * @return {Promise<void>}
   */

  async processGwpAdd(items = []) {
    if (!items?.length) return;
    const itemsToAdd = this.BuildGwpAddData(items);
    if (!itemsToAdd?.length) return;
    await this.addToCart(itemsToAdd);
  }

  /**
   * Build GWP items to add from ids array
   * @param   {Array}  idsArray list of GWP ids
   * @return  {Array}
   */

  BuildGwpAddData(idsArray) {
    if (!idsArray?.length) return [];
    const itemsToAdd = this.checkGwpSessionStorage(idsArray);
    if (!itemsToAdd.length) return [];
    return itemsToAdd
        .filter(id => id && id.length > 0)
        .map(id => ({
          id,
          quantity: 1,
          properties: { "_gwp": "true" }
        }));
  }

  /**
   * Check removed GWP items in sessionStorage
   * @param   {Array}  idsArray list of GWP ids
   * @return  {Array}
   */

  checkGwpSessionStorage(idsArray) {
    if (!idsArray?.length) return [];
    const removedGWPs = JSON.parse(sessionStorage.getItem('RemovedGWP') || '[]');
    const removedIds = removedGWPs.map(item => item.split(':')[0]);
    return idsArray.filter(id => !removedIds.includes(id));
  }

  /**
   * Clear removed GWP items in sessionStorage
   * @return  {Void}
   */

  clearGwpSessionStorage() {
    if (sessionStorage.getItem('RemovedGWP')) sessionStorage.removeItem('RemovedGWP');
  }

  /**
   * Add removed GWP key in sessionStorage
   * @param   {String}  key of GWP in cart
   * @return  {Void}
   */

  setGwpSessionStorage(key) {
    if (!key) return;
    const removedGWPs = JSON.parse(sessionStorage.getItem('RemovedGWP') || '[]');
    if (!removedGWPs.includes(key)) {
      removedGWPs.push(key);
      sessionStorage.setItem('RemovedGWP', JSON.stringify(removedGWPs));
    }
  }

  /**
   * Add item(s) to the cart and show the added item(s)
   *
   * @param   {String || Object || FormData}  formData
   * @param   {DOM Element}  button
   *
   * @return  {Void}
   */

  async addToCart(formData, button) {
    if (this.cart) {
      this.cart.classList.add(classes.loading);
    }

    const quickAddHolder = button?.closest(selectors.quickAddHolder);

    if (button) {
      button.classList.add(classes.loading);
      button.disabled = true;
    }

    if (quickAddHolder) {
      quickAddHolder.classList.add(classes.visible);
    }

    const config = {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/javascript',
      },
    };

    if (formData instanceof FormData) {
      config.body = formData;
    } else {
      config.headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      config.body = JSON.stringify({
        items: formData
      });
    }

    try {
      const response = await fetch(theme.routes.cart_add_url, config);
      const responseJson = await response.json();

      if (responseJson.status) {
        this.addToCartError(responseJson, button);

        if (button) {
          button.classList.remove(classes.loading);
          button.disabled = false;
        }

        return;
      }

      if (this.cart) {
        if (button) {
          button.classList.remove(classes.loading);
          button.classList.add(classes.added);

          if (button.hasAttribute('data-add-to-cart-bundle') && document.querySelector('product-upsell-popup') !== null) {
            document.querySelector('product-upsell-popup').modalOpen();
          }
          button.dispatchEvent(
              new CustomEvent('theme:product:add', {
                detail: {
                  response: responseJson,
                  button: button,
                },
                bubbles: true,
              })
          );
        }
        if (theme.settings.cartType === 'page') {
          window.location = theme.routes.cart_url;
        }
        await this.checkGWP();
        await this.getCart();
      } else {
        // Redirect to cart page if "Add to cart" is successful
        window.location = theme.routes.cart_url;
      }
    } catch (error) {
      this.addToCartError(error, button);
      this.enableCartButtons();
    }
  }


  /**
   * Change cart
   *
   * @param   {Object}  updateData
   * @param currentItem
   * @return  {Void}
   */

  async updateCart(updateData = {}, currentItem = null) {
    this.cart.classList.add(classes.loading);

    let updatedQuantity = updateData.quantity;
    if (currentItem !== null) {
      if (updatedQuantity) {
        currentItem.classList.add(classes.loading);
      } else {
        currentItem.classList.add(classes.removed);
      }
    }
    this.disableCartButtons();

    const newItem = this.cart.querySelector(`[${attributes.item}="${updateData.id}"]`) || currentItem;
    const lineIndex = newItem?.hasAttribute(attributes.itemIndex) ? parseInt(newItem.getAttribute(attributes.itemIndex)) : 0;
    const itemTitle = newItem?.hasAttribute(attributes.itemTitle) ? newItem.getAttribute(attributes.itemTitle) : null;

    if (lineIndex === 0) return;

    const data = {
      id: updateData.id,
      quantity: updatedQuantity,
    };

    try {
      const response = await fetch(theme.routes.cart_change_url, {
        method: 'post',
        headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify(data),
      });

      const state = await response.text();
      const parsedState = JSON.parse(state);

      if (parsedState.errors) {
        this.cartUpdateFailed = true;
        this.updateErrorText(itemTitle);
        this.toggleErrorMessage();
        this.resetLineItem(currentItem);
        this.enableCartButtons();
        return;
      }
      await this.checkGWP();
      await this.getCart();
    } catch (error) {
      console.log(error);
      this.enableCartButtons();
    }
  }

  /**
   * Update cart items
   *
   * @param   {Object}  updateData
   * @return  {Void}
   */

  async updateCartItems(updateData = {}) {
    this.cart.classList.add(classes.loading);
    this.disableCartButtons();

    if (!updateData || !Object.keys(updateData)[0]) return;

    try {
      const response = await fetch(theme.routes.cart_update_url, {
        method: 'post',
        headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify({updates: updateData}),
      });

      const state = await response.text();
      const parsedState = JSON.parse(state);

      if (parsedState.errors) {
        this.cartUpdateFailed = true;
        this.toggleErrorMessage();
        this.enableCartButtons();
        return;
      }

      await this.checkGWP();
      await this.getCart();
    } catch (error) {
      console.log(error);
      this.enableCartButtons();
    }
  }

  /**
   * Reset line item initial state
   *
   * @return  {Void}
   */
  resetLineItem(item) {
    const qtyInput = item?.querySelector(selectors.qtyInput);
    if (qtyInput) {
      const qty = qtyInput.getAttribute('value');
      qtyInput.value = qty;
      item.classList.remove(classes.loading);
    }
  }

  /**
   * Disable cart buttons and inputs
   *
   * @return  {Void}
   */
  disableCartButtons() {
    const inputs = this.cart.querySelectorAll('input');
    const buttons = this.cart.querySelectorAll(`button, ${selectors.cartItemRemove}`);

    if (inputs.length) {
      inputs.forEach((item) => {
        item.classList.add(classes.disabled);
        item.blur();
        item.disabled = true;
      });
    }

    if (buttons.length) {
      buttons.forEach((item) => {
        item.setAttribute(attributes.disabled, true);
      });
    }
  }

  /**
   * Enable cart buttons and inputs
   *
   * @return  {Void}
   */
  enableCartButtons() {
    const inputs = this.cart.querySelectorAll('input');
    const buttons = this.cart.querySelectorAll(`button, ${selectors.cartItemRemove}`);

    if (inputs.length) {
      inputs.forEach((item) => {
        item.classList.remove(classes.disabled);
        item.disabled = false;
      });
    }

    if (buttons.length) {
      buttons.forEach((item) => {
        item.removeAttribute(attributes.disabled);
      });
    }

    this.cart.classList.remove(classes.loading);
  }

  /**
   * Update error text
   *
   * @param   {String}  itemTitle
   *
   * @return  {Void}
   */

  updateErrorText(itemTitle) {
    this.cartErrorHolder.querySelector(selectors.errorMessage).innerText = itemTitle;
  }

  /**
   * Toggle error message
   *
   * @return  {Void}
   */

  toggleErrorMessage() {
    if (!this.cartErrorHolder || this.cartUpdateFailed === undefined) return;

    this.cartErrorHolder.classList.toggle(classes.expanded, this.cartUpdateFailed);

    // Reset cart error events flag
    this.cartUpdateFailed = false;
  }

  /**
   * Handle errors
   *
   * @param   {Object}  response
   *
   * @return  {Object}
   */

  cartErrorsHandler(response) {
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

  /**
   * Add to cart error handle
   *
   * @param   {Object}  data
   * @param   {DOM Element/Null} button
   *
   * @return  {Void}
   */

  addToCartError(data, button) {
    if (button !== null) {
      const outerContainer = button.closest(selectors.outerSection) || button.closest(selectors.quickAddHolder) || button.closest(selectors.quickAddModal);
      let errorContainer = outerContainer?.querySelector(selectors.formErrorsContainer);
      const buttonUpsellHolder = button.closest(selectors.quickAddHolder);

      if (buttonUpsellHolder && buttonUpsellHolder.querySelector(selectors.formErrorsContainer)) {
        errorContainer = buttonUpsellHolder.querySelector(selectors.formErrorsContainer);
      }

      if (errorContainer) {
        let errorMessage = `${data.message}: ${data.description}`;

        if (data.message == data.description) {
          errorMessage = data.message;
        }

        errorContainer.innerHTML = `<div class="errors">${errorMessage}<button type="button" class="errors__close" data-close-error><svg aria-hidden="true" focusable="false" role="presentation" width="24px" height="24px" stroke-width="1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="icon icon-cancel"><path d="M6.758 17.243L12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div>`;
        errorContainer.classList.add(classes.visible);
        this.formErrorsEvents(errorContainer);
      }

      button.dispatchEvent(
        new CustomEvent('theme:product:add-error', {
          detail: {
            response: data,
            button: button,
          },
          bubbles: true,
        })
      );
    }

    const quickAddHolder = button?.closest(selectors.quickAddHolder);

    if (quickAddHolder) {
      quickAddHolder.dispatchEvent(
        new CustomEvent('theme:cart:error', {
          bubbles: true,
          detail: {
            message: data.message,
            description: data.description,
            holder: quickAddHolder,
          },
        })
      );
    }

    this.cart?.classList.remove(classes.loading);
  }

  /**
   * Add product to cart events
   *
   * @return  {Void}
   */
  productAddCallback(event) {
    let buttons = [];
    let quickAddHolder = null;
    const hasError = event.type == 'theme:product:add-error';
    const buttonATC = event.detail.button;
    const cartBarButtonATC = document.querySelector(selectors.cartBarAdd);

    buttons.push(buttonATC);
    quickAddHolder = buttonATC.closest(selectors.quickAddHolder);

    if (cartBarButtonATC) {
      buttons.push(cartBarButtonATC);
    }

    buttons.forEach((button) => {
      button.classList.remove(classes.loading);
      if (!hasError) {
        button.classList.add(classes.added);
      }
    });

    setTimeout(() => {
      buttons.forEach((button) => {
        button.classList.remove(classes.added);
        const isVariantUnavailable =
          button.closest(selectors.formWrapper)?.classList.contains(classes.variantSoldOut) || button.closest(selectors.formWrapper)?.classList.contains(classes.variantUnavailable);

        if (!isVariantUnavailable) {
          button.disabled = false;
        }
      });

      quickAddHolder?.classList.remove(classes.visible);
    }, 1000);
  }

  /**
   * Toggle classes on different containers and messages
   *
   * @return  {Void}
   */

  toggleClassesOnContainers() {
    const hasItemsInCart = this.hasItemsInCart();

    this.cart.classList.toggle(classes.empty, !hasItemsInCart);

    if (!hasItemsInCart && this.cartDrawer) {
      setTimeout(() => {
        this.a11y.trapFocus(this.cartDrawer, {
          elementToFocus: this.cartDrawer.querySelector(selectors.cartDrawerClose),
        });
      }, 100);
    }
  }

  /**
   * Build cart depends on results
   *
   * @param   {Object}  data
   *
   * @return  {Void}
   */

  build(data) {
    const cartItemsData = data.querySelector(selectors.apiLineItems);
    const cartEmptyData = Boolean(cartItemsData === null);
    const priceData = data.querySelector(selectors.apiCartPrice);
    const cartTotal = data.querySelector(selectors.cartTotal);

    if (this.priceHolder && priceData) {
      this.priceHolder.innerHTML = priceData.innerHTML;
    }

    if (cartEmptyData) {
      this.itemsHolder.innerHTML = data.innerHTML;
    } else {
      this.itemsHolder.innerHTML = cartItemsData.innerHTML;
    }

    this.newTotalItems = cartItemsData && cartItemsData.querySelectorAll(selectors.item).length ? cartItemsData.querySelectorAll(selectors.item).length : 0;
    this.subtotal = cartTotal && cartTotal.hasAttribute(attributes.cartTotal) ? parseInt(cartTotal.getAttribute(attributes.cartTotal)) : 0;
    this.cartCount = this.getCartItemCount();

    document.dispatchEvent(
      new CustomEvent('theme:cart:change', {
        bubbles: true,
        detail: {
          cartCount: this.cartCount,
        },
      })
    );

    // Update cart total price
    this.cartTotal.innerHTML = this.subtotal === 0 ? window.theme.strings.free : window.theme.formatMoney(this.subtotal, theme.moneyWithCurrencyFormat);

    if (this.subtotal === 0) {

    }

    if (this.totalItems !== this.newTotalItems) {
      this.totalItems = this.newTotalItems;

      this.toggleClassesOnContainers();
    }

    // Add class "is-updated" line items holder to reduce cart items animation delay via CSS variables
    if (this.cartDrawer?.classList.contains(classes.open)) {
      this.cart.classList.add(classes.updated);
    }

    // Remove cart loading class
    this.cart.classList.remove(classes.loading);

    // Prepare empty cart buttons for animation
    if (!this.hasItemsInCart()) {
      this.cartEmpty.querySelectorAll(selectors.animation).forEach((item) => {
        item.classList.remove(classes.animated);
      });
    }

    this.closest('collapsible-elements')?.init();

    this.renderComplementaryProducts();
    this.freeShippingMessageHandle(this.subtotal);
    this.gwpMessageHandle(this.subtotal);
    this.updatePromotionBlock();
    this.cartRemoveEvents();
    this.cartUpdateEvents();
    this.toggleErrorMessage();
    this.enableCartButtons();
    this.updateProgress();
    this.animateItems();

    document.dispatchEvent(
      new CustomEvent('theme:product:added', {
        bubbles: true,
      })
    );
  }

  /**
   * render complementary products
   *
   * @return  {Void}
   */

  updatePromotionBlock() {
    const sectionId = this.closest(selectors.outerSection).dataset.sectionId;
    const cartPromotionBlock = document.querySelector('[data-cart-promotion-block]');

    if (!sectionId) return;
    if (!cartPromotionBlock) return;

    fetch(`sections?section_id=${sectionId}`)
      .then(this.cartErrorsHandler)
      .then((response) => response.text())
      .then((response) => {
        // const promotionBlock = new DOMParser().parseFromString(response, 'text/html').querySelector(selectors.cartPromotionBlock).innerHTML;
        const element = document.createElement('div');
        element.innerHTML = response;
        const promotionBlock = element.querySelector(selectors.cartPromotionBlock);

        if (promotionBlock && cartPromotionBlock) {
          cartPromotionBlock.innerHTML = promotionBlock.innerHTML;
        }
      })
      .catch((error) => console.log(error));
  }

  renderComplementaryProducts() {
    const sectionId = this.closest(selectors.outerSection).dataset.sectionId;

    if (!sectionId) return;
    if (!this.cartComplementaryProducts) return;

    fetch(`sections?section_id=${sectionId}`)
      .then(this.cartErrorsHandler)
      .then((response) => response.text())
      .then((response) => {
        const element = document.createElement('div');
        element.innerHTML = response;

        const cartComplementaryProducts = element.querySelector(selectors.cartComplementaryProducts);

        if (this.cartComplementaryProducts && cartComplementaryProducts) {
          this.cartComplementaryProducts.innerHTML = cartComplementaryProducts.innerHTML;

          // init swiper after render
          this.cartComplementaryProducts.querySelector('swiper-container')?.initialize();

          // init collapsible-elements after render
          this.closest('cart-drawer')?.querySelector(`[data-drawer-body-collapsible-element="${sectionId}"]`)?.init();
        }
      })
      .catch((error) => console.log(error));
  }

  /**
   * Get cart item count
   *
   * @return  {Number}
   */

  getCartItemCount() {
    return Array.from(this.cart.querySelectorAll(`${selectors.qtyInput}, ${selectors.qtyCounter}`)).reduce((total, element) => {
      if (element.matches(selectors.qtyInput)) {
        return total + parseInt(element.value || 0, 10);
      } else if (element.matches(selectors.qtyCounter)) {
        return total + parseInt(element.getAttribute('data-item-quantity') || 0, 10);
      }
      return total;
    }, 0);
  }

  /**
   * Check for items in the cart
   *
   * @return  {Boolean}
   */

  hasItemsInCart() {
    return this.totalItems > 0;
  }

  /**
   * Show/hide free shipping message
   *
   * @param   {Number}  total
   *
   * @return  {Void}
   */

  freeShippingMessageHandle(total) {
    if (!this.freeShipping.length) return;

    this.freeShipping.forEach((message) => {
      const hasQualifiedShippingMessage = message.hasAttribute(attributes.freeShipping) && message.getAttribute(attributes.freeShipping) === 'true' && total >= 0;
      message.classList.toggle(classes.success, hasQualifiedShippingMessage && total >= this.freeShippingLimit);
    });
  }

  /**
   * Show/hide GWP message
   *
   * @param   {Number}  total
   *
   * @return  {Void}
   */

  gwpMessageHandle(total) {
    if (!this.gwpMessage.length) return;

    this.gwpMessage.forEach((message) => {
      const hasQualifiedShippingMessage = message.hasAttribute(attributes.gwpMessage) && message.getAttribute(attributes.gwpMessage) === 'true' && total >= 0;
      message.classList.toggle(classes.success, hasQualifiedShippingMessage && total >= this.gwpMessageLimit);
    });
  }

  /**
   * Update progress when update cart
   *
   * @return  {Void}
   */

  updateProgress() {
    this.freeShipping = document.querySelectorAll(selectors.freeShipping);
    this.gwpMessage = document.querySelectorAll(selectors.gwpMessage);
    let progressItems = this.freeShipping;
    let limit = this.freeShippingLimit;

    if (this.gwpMessageLimit > 0) {
      progressItems = this.gwpMessage;
      limit = this.gwpMessageLimit;
    }

    if (!progressItems.length) return;

    const percentValue = isNaN(this.subtotal / limit) ? 100 : this.subtotal / limit;
    const percent = Math.min(percentValue * 100, 100);
    const dashoffset = this.circumference - ((percent / 100) * this.circumference) / 2;
    let leftToSpend = window.theme.formatMoney(limit - this.subtotal, theme.moneyFormat);

    if (this.gwpMessageLimit > 0) {
      const allLimits = this.gwpMessage[0].getAttribute('data-gwp-message-limits').split('|||');
      const numericLimits = allLimits.map(limit => Number(limit) * 100 * window.Shopify.currency.rate);
      const firstHigherLimit = numericLimits.find(limit => limit > this.subtotal);
      leftToSpend = window.theme.formatMoney(firstHigherLimit - this.subtotal, theme.moneyFormat);
    }

    progressItems.forEach((item) => {
      const progressBar = item.querySelector(selectors.progressBar);
      const progressGraph = item.querySelector(selectors.progressGraph);
      const leftToSpendMessage = item.querySelector(selectors.leftToSpend);

      if (leftToSpendMessage) {
        leftToSpendMessage.innerHTML = leftToSpend.replace('.00', '');
      }

      // Set progress bar value
      if (progressBar) {
        progressBar.value = percent;
      }

      // Set circle progress
      if (progressGraph) {
        progressGraph.style.setProperty('--stroke-dashoffset', `${dashoffset}`);
      }
    });
  }

  /**
   * Remove initially added AOS classes to allow animation on cart drawer open
   *
   * @return  {Void}
   */
  resetAnimatedItems() {
    this.cart.querySelectorAll(selectors.animation).forEach((item) => {
      item.classList.remove(classes.animated);
      item.classList.remove(classes.hiding);
    });
  }

  /**
   * Cart elements opening animation
   *
   * @return  {Void}
   */
  animateItems(e) {
    requestAnimationFrame(() => {
      let cart = this.cart;

      if (e && e.detail && e.detail.target) {
        cart = e.detail.target;
      }

      cart?.querySelectorAll(selectors.animation).forEach((item) => {
        item.classList.add(classes.animated);
      });
    });
  }
}

if (!customElements.get('cart-items')) {
  customElements.define('cart-items', CartItems);
}
