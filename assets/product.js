(function () {
  'use strict';

  class ProductModel extends window.theme.DeferredMedia {
    constructor() {
      super();
    }

    loadContent() {
      super.loadContent();

      Shopify.loadFeatures([
        {
          name: 'model-viewer-ui',
          version: '1.0',
          onLoad: this.setupModelViewerUI.bind(this),
        },
      ]);
    }

    setupModelViewerUI(errors) {
      if (errors) return;

      this.modelViewerUI = new Shopify.ModelViewerUI(this.querySelector('model-viewer'));
    }
  }

  window.ProductModel = {
    loadShopifyXR() {
      Shopify.loadFeatures([
        {
          name: 'shopify-xr',
          version: '1.0',
          onLoad: this.setupShopifyXR.bind(this),
        },
      ]);
    },

    setupShopifyXR(errors) {
      if (errors) return;

      if (!window.ShopifyXR) {
        document.addEventListener('shopify_xr_initialized', () => this.setupShopifyXR());
        return;
      }

      document.querySelectorAll('[id^="ModelJSON-"]').forEach((modelJSON) => {
        window.ShopifyXR.addModels(JSON.parse(modelJSON.textContent));
        modelJSON.remove();
      });
      window.ShopifyXR.setupXRElements();
    },
  };

  window.addEventListener('DOMContentLoaded', () => {
    if (window.ProductModel) window.ProductModel.loadShopifyXR();
  });

  const selectors = {
    productComponent: 'product-component',
    addToCart: '[data-add-to-cart]',
    productImage: '[data-product-image]',
    productJson: '[data-product-json]',
    productPage: '.product__page',
    headerSticky: '[data-header-sticky]',
    productMediaList: '[data-product-media-list]',
    form: '[data-product-form]',
    cartBar: '.cart-bar',
    productNotificationPopupButton: '[data-popup-open]',
    productSubmitAdd: '.product__submit__add',
    formWrapper: '[data-form-wrapper]',
    productVariants: '[data-product-variants]',
    swapUrl: '[data-swap-url]',
    productNotification: 'product-notification',
    notificationPopupButton: '[data-notification-popup-button]',
    popupComponent: 'popup-component',
    popupOpen: '[data-popup-open]',
    inputId: 'input[name="id"][form]',
  };

  const classes = {
    added: 'is-added',
    expanded: 'is-expanded',
    loading: 'is-loading',
    visible: 'is-visible',
    sticky: 'is-sticky',
  };

  const attributes = {
    cartBarEnabled: 'data-cart-bar-enabled',
    cartBarAdd: 'data-add-to-cart-bar',
    cartBarScroll: 'data-cart-bar-scroll',
    cartBarProductNotification: 'data-cart-bar-product-notification',
    stickyEnabled: 'data-sticky-enabled',
  };

  if (!customElements.get('product-component')) {
    customElements.define(
      'product-component',
      class ProductComponent extends HTMLElement {
        abortController = undefined;
        pendingRequestUrl = null;
        pendingSwapTarget = null;
        postProcessHtmlCallbacks = [];

        handleClick = (event) => this.handleChange(event);
        handleHover = (event) => this.preFetchAndCache(event);
        constructor() {
          super();

          this.stickyEnabled = this.getAttribute(attributes.stickyEnabled) === 'true';
          this.formWrapper = this.querySelector(selectors.formWrapper);
          this.productNotification = this.querySelector(selectors.productNotification);
          this.cartBarEnabled = this.hasAttribute(attributes.cartBarEnabled);
          this.cartBar = this.querySelector(selectors.cartBar);
          this.setCartBarHeight = this.setCartBarHeight.bind(this);
          this.scrollToTop = this.scrollToTop.bind(this);
          this.toggleCartBarOnScroll = this.toggleCartBarOnScroll.bind(this);
          this.unlockTimer = 0;
          this.swapElements = this.querySelectorAll(selectors.swapUrl);
          this.sectionId = this.dataset.sectionId;
        }

        connectedCallback() {
          // Stop parsing if we don't have the product json script tag when loading
          // section in the Theme Editor
          const productJson = this.querySelector(selectors.productJson);
          if ((productJson && !productJson.innerHTML) || !productJson) {
            return;
          }

          const productJsonHandle = JSON.parse(productJson.innerHTML).handle;
          let recentObj = {};
          if (productJsonHandle) {
            recentObj = {
              handle: productJsonHandle,
            };
          }

          // Record recently viewed products when the product page is loading
          Shopify.Products.recordRecentlyViewed(recentObj);
          if (Shopify.Products && Shopify.Products.recordRecentlyViewed) {
            Shopify.Products.recordRecentlyViewed(recentObj);
          }

          this.form = this.querySelector(selectors.form);

          this.bindNotificationPopupEvents();

          if (this.swapElements.length > 0) {
            this.initializeProductSwapUtility();
            this.addEventListener('theme:variant:change', (event) => this.storeOptionValues(event));

            this.swapElements?.forEach((element) => {
              element.addEventListener('click', this.handleClick);
              element.addEventListener('mouseover', this.handleHover);
            });
          }

          if (this.cartBarEnabled) {
            this.initCartBar();
            this.setCartBarHeight();

            document.addEventListener('theme:scroll', this.toggleCartBarOnScroll);
            document.addEventListener('theme:resize', this.setCartBarHeight);
          }
        }

        initializeProductSwapUtility() {
          this.postProcessHtmlCallbacks.push((newNode) => {
            window?.Shopify?.PaymentButton?.init();
            window?.ProductModel?.loadShopifyXR();
          });
        }

        storeOptionValues(event) {
          this.selectedOptionValues = '';
          const variant = event.detail.variant;
          const selected = event.detail.selected;

          if (!event || !variant) return;

          if (selected.optionValues?.length) {
            this.selectedOptionValues = selected.optionValues;
          }
        }

        preFetchAndCache(event) {
          const element = event.target.closest(selectors.swapUrl);
          if (!element) return;

          const targetUrl = element.dataset.swapUrl;
          const productUrl = targetUrl || this.dataset.url;

          // Don't prefetch if it's the current product URL
          if (this.dataset.url === productUrl) return;

          const requestUrl = `${productUrl}?section_id=${this.sectionId}`;

          // Skip fetching if already cached
          const cacheKey = `product-component-html-${encodeURIComponent(requestUrl)}`;
          if (sessionStorage.getItem(cacheKey)) return;

          // Prefetch and cache the HTML
          fetch(requestUrl)
            .then((response) => response.text())
            .then((responseText) => {
              const bytes = new TextEncoder().encode(responseText).length;
              const megabytes = bytes / (1024 * 1024);
              // Only cache if less than 4MB
              if (megabytes < 4) {
                sessionStorage.setItem(cacheKey, responseText);
              }
            })
            .catch((error) => console.error('Prefetch error:', error));
        }

        handleChange(event) {
          event.preventDefault();
          if (!this.contains(event.target)) return;

          const element = event.target.closest(selectors.swapUrl);
          const targetUrl = element.dataset.swapUrl;
          const productUrl = targetUrl || this.pendingRequestUrl || this.dataset.url;
          this.pendingRequestUrl = productUrl;
          this.pendingSwapTarget = element.dataset.swapTarget;

          const shouldSwapProduct = this.dataset.url !== productUrl;
          if (!shouldSwapProduct) return;

          this.renderProductComponent({
            // Fetch the new product's HTML with section rendering API
            requestUrl: `${productUrl}?section_id=${this.sectionId}`,
            // Returns a function that will process and swap the HTML after fetch completes
            callback: this.handleSwapProduct(productUrl),
          });

          const widget = document.querySelector('[data-oke-widget]');
          const starWidget = document.querySelector('[data-oke-star-rating]');
          const shopifyProductId = `shopify-${element.getAttribute('data-swap-id')}`;
          if (widget && window.okeWidgetApi) {
            window.okeWidgetApi.setProduct(widget, shopifyProductId);
          }
          if (starWidget && window.okeWidgetApi) {
            window.okeWidgetApi.setProduct(starWidget, shopifyProductId);
          }
        }

        renderProductComponent({requestUrl, callback}) {
          // Check sessionStorage for cached HTML
          const cacheKey = `product-component-html-${encodeURIComponent(requestUrl)}`;
          const cachedHtml = sessionStorage.getItem(cacheKey);

          if (cachedHtml) {
            // Use cached HTML
            callback(new DOMParser().parseFromString(cachedHtml, 'text/html'));
            // Restore scroll position after DOM update
            this.setFocusAndRestoreScroll();
            return;
          }

          this.abortController?.abort();
          this.abortController = new AbortController();

          fetch(requestUrl, {signal: this.abortController.signal})
            .then((response) => response.text())
            .then((responseText) => {
              // Store fetched HTML in sessionStorage
              // Check size before storing
              const bytes = new TextEncoder().encode(responseText).length;
              const megabytes = bytes / (1024 * 1024);
              // Only cache if less than 4MB to be safe across browsers
              if (megabytes < 4) {
                sessionStorage.setItem(cacheKey, responseText);
              } else {
                console.warn(`Response too large (${megabytes.toFixed(2)}MB) to cache in sessionStorage`);
              }

              this.pendingRequestUrl = null;
              const html = new DOMParser().parseFromString(responseText, 'text/html');
              callback(html);
            })
            .then(() => {
              // Set focus to last clicked sibling link element
              this.setFocusAndRestoreScroll();
            })
            .catch((error) => {
              if (error.name === 'AbortError') {
                console.log('Fetch aborted by user');
              } else {
                console.error(error);
              }
            });
        }

        setFocusAndRestoreScroll() {
          if (!this.pendingSwapTarget) return;
          requestAnimationFrame(() => {
            const swapElement = document.querySelector(`[${attributes.swapTarget}="${this.pendingSwapTarget}"]`);
            swapElement?.focus();
            swapElement?.scrollIntoView({behavior: 'instant', block: 'center'});
            this.pendingSwapTarget = null;
          });
        }

        handleSwapProduct(productUrl) {
          return (html) => {
            const variantId = this.getSelectedVariantId(html.querySelector(selectors.productComponent));
            this.updateURL(productUrl, variantId);

            window.theme.htmlUpdate.viewTransition(
              this, // Current product-component element to be replaced
              html.querySelector(selectors.productComponent), // New product-component element with updated content
              this.postProcessHtmlCallbacks // Run any post-processing after swap (focus, init components)
            );
          };
        }

        getSelectedVariantId(productComponent) {
          const selectedVariant = productComponent.querySelector(selectors.inputId)?.value;
          return selectedVariant || null;
        }

        updateURL(url, variantId) {
          window.history.replaceState({}, '', `${url}${variantId ? `?variant=${variantId}` : ''}`);
        }

        bindNotificationPopupEvents() {
          if (!this.productNotification) return;

          this.notificationPopupButtons = this.querySelectorAll(selectors.notificationPopupButton);
          this.notificationPopup = this.productNotification.closest(selectors.popupComponent);
          this.notificationPopupOpen = this.notificationPopup.querySelector(selectors.popupOpen);

          this.notificationPopupButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
              event.preventDefault();
              this.notificationPopupOpen.dispatchEvent(new Event('click'));
            });
          });
        }

        initCartBar() {
          this.cartBarBtns = this.cartBar?.querySelectorAll(selectors.productSubmitAdd);
          this.cartBarBtns?.forEach((button) => {
            button.addEventListener('click', (event) => {
              event.preventDefault();

              if (event.currentTarget.hasAttribute(attributes.cartBarAdd)) {
                if (this.cartBarEnabled) {
                  event.currentTarget.classList.add(classes.loading);
                  event.currentTarget.setAttribute('disabled', 'disabled');
                }

                this.form.querySelector(selectors.addToCart).dispatchEvent(new Event('click', {bubbles: true}));
              } else if (event.currentTarget.hasAttribute(attributes.cartBarScroll)) {
                this.scrollToTop();
              }
            });

            if (button.hasAttribute(attributes.cartBarAdd)) {
              document.addEventListener('theme:product:add-error', this.scrollToTop);
            }
          });

          this.setCartBarHeight();
        }

        scrollToTop() {
          const productVariants = this.querySelector(selectors.productVariants);
          const scrollTarget = !window.theme.isMobile() ? this : productVariants ? productVariants : this.form;
          const scrollTargetTop = scrollTarget.getBoundingClientRect().top;

          window.theme.scrollTo(!window.theme.isMobile() ? scrollTargetTop : scrollTargetTop - 10);
        }

        toggleCartBarOnScroll() {
          const scrolled = window.scrollY;
          const element = theme.settings.productPageSticky && this.formWrapper ? this.formWrapper : this.form;

          if (element && this.cartBar) {
            const formOffset = element.offsetTop;
            const formHeight = element.offsetHeight;
            const checkPosition = scrolled > formOffset + formHeight;

            this.cartBar.classList.toggle(classes.visible, checkPosition);
          }
        }

        setCartBarHeight() {
          const cartBarHeight = this.cartBar.offsetHeight;

          document.documentElement.style.setProperty('--cart-bar-height', `${cartBarHeight}px`);
        }

        disconnectedCallback() {
          document.removeEventListener('theme:product:add-error', this.scrollToTop);

          if (this.cartBarEnabled) {
            document.removeEventListener('theme:scroll', this.toggleCartBarOnScroll);
            document.removeEventListener('theme:resize', this.setCartBarHeight);
          }
        }
      }
    );
  }

  if (!customElements.get('product-model')) {
    customElements.define('product-model', ProductModel);
  }

})();
//# sourceMappingURL=product.js.map
