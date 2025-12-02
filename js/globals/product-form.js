import {ProductFormReader} from '../vendor/theme-scripts/theme-product-form';

import SelloutVariants from './product-form-sellout';

const selectors = {
  product: '[data-product]',
  productForm: '[data-product-form]',
  productNotification: 'product-notification',
  variantTitle: '[data-variant-title]',
  notificationProduct: '[data-notification-product]',
  addToCart: '[data-add-to-cart]',
  addToCartText: '[data-add-to-cart-text]',
  cartPage: '[data-cart-page]',
  comparePrice: '[data-compare-price]',
  comparePriceText: '[data-compare-text]',
  oneTimeDiscountBadge: '[data-one-time-discount-badge]',
  subscriptionDiscountBadge: '[data-subscription-discount-badge]',
  finalSaleBadge: '[data-final-sale-badge]',
  formWrapper: '[data-form-wrapper]',
  originalSelectorId: '[data-product-select]',
  priceWrapper: '[data-price-wrapper]',
  priceOneTimeWrapper: '[data-price-one-time-wrapper]',
  priceSubscriptionWrapper: '[data-price-subscription-wrapper]',
  productImages: 'product-images',
  productImagesWrapper: '.product__page-gallery',
  productImage: '[data-product-image]',
  productMediaList: '[data-product-media-list]',
  productJson: '[data-product-json]',
  productPrice: '[data-product-price]',
  unitPrice: '[data-product-unit-price]',
  unitBase: '[data-product-base]',
  unitWrapper: '[data-product-unit]',
  isPreOrder: '[data-product-preorder]',
  productSlide: '.product__slide',
  subPrices: '[data-subscription-watch-price]',
  subSelectors: '[data-subscription-selectors]',
  subsToggle: '[data-toggles-group]',
  subsChild: 'data-group-toggle',
  subDescription: '[data-plan-description]',
  section: '[data-section-type]',
  variantSku: '[data-variant-sku]',
  variantFinalSaleMeta: '[data-variant-final-sale-metafield]',
  variantButtons: '[data-variant-buttons]',
  variantOptionImage: '[data-variant-option-image]',
  quickAddModal: '[data-quick-add-modal]',
  priceOffAmount: '[data-price-off-amount]',
  priceOffBadge: '[data-price-off-badge]',
  priceOffType: '[data-price-off-type]',
  priceOffWrap: '[data-price-off]',
  remainingCount: '[data-remaining-count]',
  remainingMax: '[data-remaining-max]',
  remainingWrapper: '[data-remaining-wrapper]',
  remainingJSON: '[data-product-remaining-json]',
  optionValue: '[data-option-value]',
  optionPosition: '[data-option-position]',
  installment: '[data-product-form-installment]',
  inputId: 'input[name="id"]',
};

const classes = {
  hidden: 'hidden',
  variantSoldOut: 'variant--soldout',
  variantUnavailable: 'variant--unavailable',
  productPriceSale: 'product__price--sale',
  remainingLow: 'count-is-low',
  remainingIn: 'count-is-in',
  remainingOut: 'count-is-out',
  remainingUnavailable: 'count-is-unavailable',
};

const attributes = {
  remainingMaxAttr: 'data-remaining-max',
  enableHistoryState: 'data-enable-history-state',
  notificationPopup: 'data-notification-popup',
  faderDesktop: 'data-fader-desktop',
  faderMobile: 'data-fader-mobile',
  optionPosition: 'data-option-position',
  imageId: 'data-image-id',
  mediaId: 'data-media-id',
  quickAddButton: 'data-quick-add-btn',
  finalSale: 'data-final-sale',
  variantImageScroll: 'data-variant-image-scroll',
};

class ProductForm extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.cartAddEvents();

    this.container = this.closest(selectors.section) || this.closest(selectors.quickAddModal);
    if (!this.container) return;

    this.sectionId = this.container.dataset.sectionId;
    this.product = this.container.querySelector(selectors.product);
    this.productForm = this.container.querySelector(selectors.productForm);
    this.productNotification = this.container.querySelector(selectors.productNotification);
    this.productImagesWrapper = this.container.querySelector(selectors.productImagesWrapper);
    this.productImages = this.productImagesWrapper?.querySelector(selectors.productImages);
    this.isQuickView = this.hasAttribute('data-quick-view');
    this.productMediaList = this.container.querySelector(selectors.productMediaList);
    this.installmentForm = this.container.querySelector(selectors.installment);
    this.skuWrapper = this.container.querySelector(selectors.variantSku);
    this.sellout = null;
    this.variantImageScroll = this.container.getAttribute(attributes.variantImageScroll) === 'true';

    this.priceOffWrap = this.container.querySelector(selectors.priceOffWrap);
    this.priceOffAmount = this.container.querySelector(selectors.priceOffAmount);
    this.priceOffType = this.container.querySelector(selectors.priceOffType);
    this.planDescription = this.container.querySelector(selectors.subDescription);

    this.remainingWrapper = this.container.querySelector(selectors.remainingWrapper);

    if (this.remainingWrapper) {
      const remainingMaxWrap = this.container.querySelector(selectors.remainingMax);
      if (remainingMaxWrap) {
        this.remainingMaxInt = parseInt(remainingMaxWrap.getAttribute(attributes.remainingMaxAttr), 10);
        this.remainingCount = this.container.querySelector(selectors.remainingCount);
        this.remainingJSONWrapper = this.container.querySelector(selectors.remainingJSON);
        this.remainingJSON = null;

        if (this.remainingJSONWrapper && this.remainingJSONWrapper.innerHTML !== '') {
          this.remainingJSON = JSON.parse(this.remainingJSONWrapper.innerHTML);
        } else {
          console.warn('Missing product quantity JSON');
        }
      }
    }

    this.enableHistoryState = this.container.getAttribute(attributes.enableHistoryState) === 'true';
    this.hasUnitPricing = this.container.querySelector(selectors.unitWrapper);
    this.subSelectors = this.container.querySelector(selectors.subSelectors);
    this.subPrices = this.container.querySelector(selectors.subPrices);
    this.isPreOrder = this.container.querySelector(selectors.isPreOrder);

    let productJSON = null;
    const productElemJSON = this.container.querySelector(selectors.productJson);
    if (productElemJSON) {
      productJSON = productElemJSON.innerHTML;
    }
    if (productJSON) {
      this.productJSON = JSON.parse(productJSON);
      this.linkForm();
      this.sellout = new SelloutVariants(this.container, this.productJSON);
    } else {
      console.error('Missing product JSON');
    }

    this.variantOptionImages = this.container.querySelectorAll(selectors.variantOptionImage);
    this.variantButtons = this.container.querySelectorAll(selectors.variantButtons);
    if (this.variantOptionImages.length > 1) {
      this.optionImagesWidth();
    }
  }

  cartAddEvents() {
    this.buttonATC = this.querySelector(selectors.addToCart);

    this.buttonATC.addEventListener('click', (e) => {
      e.preventDefault();

      document.dispatchEvent(
        new CustomEvent('theme:cart:add', {
          detail: {
            button: this.buttonATC,
          },
          bubbles: false,
        })
      );

      if (!this.closest(selectors.quickAddModal)) {
        window.theme.a11y.lastElement = this.buttonATC;
      }
    });
  }

  destroy() {
    this.productForm.destroy();
  }

  linkForm() {
    this.productForm = new ProductFormReader(this.container, this.productJSON, {
      onOptionChange: this.onOptionChange.bind(this),
      onPlanChange: this.onPlanChange.bind(this),
    });
    this.pushState(this.productForm.getFormState(), true);
    this.subsToggleListeners();
  }

  onOptionChange(evt) {
    this.pushState(evt.dataset);
  }

  onPlanChange(evt) {
    if (this.subPrices) {
      this.pushState(evt.dataset);
    }
  }

  pushState(formState, init = false) {
    this.productState = this.setProductState(formState);
    this.updateAddToCartState(formState);
    this.updateNotificationForm(formState);
    this.updateProductPrices(formState);
    this.updateProductImage(formState);
    this.updateProductGallery(formState);
    this.updateSaleText(formState);
    this.updateSku(formState);
    this.updateSubscriptionText(formState);
    this.updateRemaining(formState);
    this.updateLegend(formState);
    this.fireHookEvent(formState);
    this.sellout?.update(formState);

    if (this.enableHistoryState && !init) {
      this.updateHistoryState(formState);
    }
  }

  updateAddToCartState(formState) {
    const variant = formState.variant;
    let addText = theme.strings.addToCart;
    const priceWrapper = this.container.querySelectorAll(selectors.priceWrapper);
    const addToCart = this.container.querySelectorAll(selectors.addToCart);
    const addToCartText = this.container.querySelectorAll(selectors.addToCartText);
    const formWrapper = this.container.querySelectorAll(selectors.formWrapper);

    if (this.installmentForm && variant) {
      const installmentInput = this.installmentForm.querySelector(selectors.inputId);
      installmentInput.value = variant.id;
      installmentInput.dispatchEvent(new Event('change', {bubbles: true}));
    }

    if (this.isPreOrder) {
      addText = theme.strings.preOrder;
    }

    if (priceWrapper.length && variant) {
      priceWrapper.forEach((element) => {
        element.classList.remove(classes.hidden);
      });
    }

    addToCart?.forEach((button) => {
      if (button.hasAttribute(attributes.quickAddButton)) return;

      if (variant) {
        if (variant.available) {
          button.disabled = false;
        } else {
          button.disabled = true;
        }
      } else {
        button.disabled = true;
      }
    });

    addToCartText?.forEach((element) => {
      let btnText = addText;
      if (variant) {
        if (!variant.available) {
          btnText = theme.strings.soldOut;
        }
      } else {
        btnText = theme.strings.unavailable;
      }

      element.textContent = btnText;
    });

    if (formWrapper.length) {
      formWrapper.forEach((element) => {
        if (variant) {
          if (variant.available) {
            element.classList.remove(classes.variantSoldOut, classes.variantUnavailable);
          } else {
            element.classList.add(classes.variantSoldOut);
            element.classList.remove(classes.variantUnavailable);
          }

          const formSelect = element.querySelector(selectors.originalSelectorId);
          if (formSelect) {
            formSelect.value = variant.id;
          }

          const inputId = element.querySelector(`${selectors.inputId}[form]`);
          if (inputId) {
            inputId.value = variant.id;
            inputId.dispatchEvent(new Event('change'));
          }
        } else {
          element.classList.add(classes.variantUnavailable);
          element.classList.remove(classes.variantSoldOut);
        }
      });
    }
  }

  updateNotificationForm(formState) {
    if (!this.productNotification) return;

    const variantTitle = this.productNotification.querySelector(selectors.variantTitle);
    const notificationProduct = this.productNotification.querySelector(selectors.notificationProduct);
    if (variantTitle != null) {
      variantTitle.textContent = formState.variant.title;
      notificationProduct.value = formState.variant.name;
    }
  }

  updateHistoryState(formState) {
    const variant = formState.variant;
    const plan = formState.plan;
    const location = window.location.href;
    if (variant && location.includes('/product')) {
      const url = new window.URL(location);
      const params = url.searchParams;
      params.set('variant', variant.id);
      if (plan && plan.detail && plan.detail.id && this.productState.hasPlan) {
        params.set('selling_plan', plan.detail.id);
      } else {
        params.delete('selling_plan');
      }
      url.search = params.toString();
      const urlString = url.toString();
      window.history.replaceState({path: urlString}, '', urlString);
    }
  }

  updateRemaining(formState) {
    const variant = formState.variant;

    this.remainingWrapper?.classList.remove(classes.remainingIn, classes.remainingOut, classes.remainingUnavailable, classes.remainingLow);

    if (variant && this.remainingWrapper && this.remainingJSON) {
      const remaining = this.remainingJSON[variant.id];

      if (remaining === 'out' || remaining < 1) {
        this.remainingWrapper.classList.add(classes.remainingOut);
      }

      if (remaining === 'in' || remaining >= this.remainingMaxInt) {
        this.remainingWrapper.classList.add(classes.remainingIn);
      }

      if (remaining === 'low' || (remaining > 0 && remaining < this.remainingMaxInt)) {
        this.remainingWrapper.classList.add(classes.remainingLow);

        if (this.remainingCount) {
          this.remainingCount.innerHTML = remaining;
        }
      }
    } else if (!variant && this.remainingWrapper) {
      this.remainingWrapper.classList.add(classes.remainingUnavailable);
    }
  }

  optionImagesWidth() {
    if (!this.variantButtons) return;

    let maxItemWidth = 0;

    requestAnimationFrame(() => {
      this.variantOptionImages.forEach((item) => {
        const itemWidth = item.clientWidth;
        if (itemWidth > maxItemWidth) {
          maxItemWidth = itemWidth;
        }
      });

      this.variantButtons.forEach((item) => {
        item.style?.setProperty('--option-image-width', maxItemWidth + 'px');
      });
    });
  }

  getBaseUnit(variant) {
    return variant.unit_price_measurement.reference_value === 1
      ? variant.unit_price_measurement.reference_unit
      : variant.unit_price_measurement.reference_value + variant.unit_price_measurement.reference_unit;
  }

  subsToggleListeners() {
    const toggles = this.container.querySelectorAll(selectors.subsToggle);
    this.subSelectors = this.container.querySelector(selectors.subSelectors);

    if (!this.subSelectors) return;

    const select = this.subSelectors.querySelector(`select[name="selling_plan"]`);

    toggles.forEach((toggle) => {
      toggle.addEventListener(
        'change',
        function (e) {
          const val = e.target.value.toString();
          const selected = this.container.querySelector(`[${selectors.subsChild}="${val}"]`);
          const groups = this.container.querySelectorAll(`[${selectors.subsChild}]`);

          if (selected) {
            // selected.classList.remove(classes.hidden);
            select.removeAttribute('disabled');
            select.dispatchEvent(new Event('change'), { bubbles: true });
          } else {
            select.setAttribute('disabled', true);
          }

          groups.forEach((group) => {
            if (group !== selected) {
              // group.classList.add(classes.hidden);
              const plans = group.querySelectorAll(`[name="selling_plan"]`);
              plans.forEach((plan) => {
                plan.checked = false;
                plan.dispatchEvent(new Event('change'));
              });
            }
          });
        }.bind(this)
      );
    });
  }

  updateSaleText(formState) {
    if (!this.priceOffWrap) return;

    if (this.productState.planSale) {
      this.updateSaleTextSubscription(formState);
    } else if (this.productState.onSale) {
      this.updateSaleTextStandard(formState);
    } else {
      this.priceOffWrap.classList.add(classes.hidden);
    }
  }

  isVariantFinalSale(variant) {
    const metafieldsData = document.querySelector(selectors.variantFinalSaleMeta)?.textContent;
    if (!metafieldsData) return;

    const variantsMetafields = JSON.parse(metafieldsData);
    let variantIsFinalSale = false;

    variantsMetafields.forEach((variantMetafield) => {
      if (Number(variantMetafield.variant_id) === variant.id) {
        variantIsFinalSale = variantMetafield.metafield_value === 'true';
      }
    });

    return variantIsFinalSale;
  }

  updateSaleTextStandard(formState) {
    const variant = formState.variant;
    const finalSaleBadge = this.priceOffWrap?.querySelector(selectors.finalSaleBadge);
    const priceOffBadge = this.priceOffWrap?.querySelector(selectors.priceOffBadge);
    const comparePrice = variant?.compare_at_price;
    const salePrice = variant?.price;

    // Set sale type text if element exists
    if (this.priceOffType) {
      this.priceOffType.innerHTML = window.theme.strings.sale || 'sale';
    }

    // If priceOffBadge or priceOffAmount are missing, hide priceOffBadge and exit early
    if (!priceOffBadge || !this.priceOffAmount || !comparePrice || comparePrice <= salePrice) {
      priceOffBadge?.classList.add(classes.hidden);
    } else {
      // Calculate and display discount percentage
      const discountInt = Math.round(((comparePrice - salePrice) / comparePrice) * 100);
      this.priceOffAmount.innerHTML = `${discountInt}%`;
      priceOffBadge.classList.remove(classes.hidden);
    }

    // Display or hide the final sale badge
    const isFinalSale = this.priceOffWrap?.hasAttribute(attributes.finalSale) || this.isVariantFinalSale(variant);
    if (finalSaleBadge) {
      finalSaleBadge.classList.toggle(classes.hidden, !isFinalSale);
    }

    this.priceOffWrap.classList.remove(classes.hidden);
  }

  updateSubscriptionText(formState) {
    if (formState.plan && this.planDescription) {
      this.planDescription.innerHTML = formState.plan.detail.description;
      this.planDescription.classList.remove(classes.hidden);
    } else if (this.planDescription) {
      this.planDescription.classList.add(classes.hidden);
    }
  }

  updateSaleTextSubscription(formState) {
    if (this.priceOffType) {
      this.priceOffType.innerHTML = window.theme.strings.subscription || 'subscripton';
    }

    if (this.priceOffAmount && this.priceOffWrap) {
      const adjustment = formState.plan.detail.price_adjustments[0];
      const discount = adjustment.value;
      if (adjustment && adjustment.value_type === 'percentage') {
        this.priceOffAmount.innerHTML = `${discount}%`;
      } else {
        this.priceOffAmount.innerHTML = window.theme.formatMoney(discount, theme.moneyFormat);
      }
      this.priceOffWrap.classList.remove(classes.hidden);
    }
  }

  updateProductPrices(formState) {
    const variant = formState.variant;
    const plan = formState.plan;
    const priceWrappers = this.container.querySelectorAll(`${selectors.priceWrapper}`);
    const priceOneTimeWrappers = this.container.querySelectorAll(`${selectors.priceOneTimeWrapper}`);
    const priceSubscriptionWrapper = this.container.querySelectorAll(`${selectors.priceSubscriptionWrapper}`);

    priceOneTimeWrappers.forEach((wrap) => {
      let price = variant.price;
      wrap.innerHTML = price === 0 ? window.theme.strings.free : window.theme.formatMoney(price, theme.moneyFormat);
    });

    priceSubscriptionWrapper.forEach((wrap) => {
      let price = variant.selling_plan_allocations[0].price_adjustments[0].price;

      wrap.innerHTML = price === 0 ? window.theme.strings.free : window.theme.formatMoney(price, theme.moneyFormat);
    });

    priceWrappers.forEach((wrap) => {
      const comparePriceEl = wrap.querySelector(selectors.comparePrice);
      const productPriceEl = wrap.querySelectorAll(selectors.productPrice);
      const comparePriceText = wrap.querySelector(selectors.comparePriceText);
      const oneTimeDiscountBadge = wrap.querySelector(selectors.oneTimeDiscountBadge);
      const subscriptionDiscountBadge = wrap.querySelector(selectors.subscriptionDiscountBadge);

      let comparePrice = '';
      let price = '';

      if (this.productState.available) {
        comparePrice = variant.compare_at_price;
        price = variant.price;
      }

      if (this.productState.hasPlan) {
        price = plan.allocation.price;
      }

      if (this.productState.planSale) {
        comparePrice = plan.allocation.compare_at_price;
        price = plan.allocation.price;
      }

      if (comparePriceEl) {
        if (this.productState.onSale || this.productState.planSale) {
          comparePriceEl.classList.remove(classes.hidden);
          comparePriceText.classList.remove(classes.hidden);
          productPriceEl.forEach((item) => item.classList.add(classes.productPriceSale));
        } else {
          comparePriceEl.classList.add(classes.hidden);
          comparePriceText.classList.add(classes.hidden);
        }
        comparePriceEl.innerHTML = window.theme.formatMoney(comparePrice, theme.moneyFormat);
      }

      if (plan) {
        oneTimeDiscountBadge?.classList.add(classes.hidden);
        subscriptionDiscountBadge?.classList.remove(classes.hidden);
      } else {
        oneTimeDiscountBadge?.classList.remove(classes.hidden);
        subscriptionDiscountBadge?.classList.add(classes.hidden);
      }

      productPriceEl.forEach((item) => item.innerHTML = price === 0 ? window.theme.strings.free : window.theme.formatMoney(price, theme.moneyFormat));
    });

    if (this.hasUnitPricing) {
      this.updateProductUnits(formState);
    }
  }

  updateProductUnits(formState) {
    const variant = formState.variant;
    const plan = formState.plan;
    let unitPrice = null;

    if (variant && variant.unit_price) {
      unitPrice = variant.unit_price;
    }
    if (plan && plan.allocation && plan.allocation.unit_price) {
      unitPrice = plan.allocation.unit_price;
    }

    if (unitPrice) {
      const base = this.getBaseUnit(variant);
      const formattedPrice = window.theme.formatMoney(unitPrice, theme.moneyFormat);
      this.container.querySelector(selectors.unitPrice).innerHTML = formattedPrice;
      this.container.querySelector(selectors.unitBase).innerHTML = base;
      this.container.querySelector(selectors.unitWrapper).classList.remove(classes.hidden);
    } else {
      this.container.querySelector(selectors.unitWrapper).classList.add(classes.hidden);
    }
  }

  updateSku(formState) {
    if (!this.skuWrapper) return;

    this.skuWrapper.innerHTML = `${theme.strings.sku}: ${formState.variant.sku}`;
  }

  fireHookEvent(formState) {
    const variant = formState.variant;
    const selected = formState.selected;
    this.container.dispatchEvent(new CustomEvent('theme:variant:change', {detail: {variant, selected}, bubbles: true}));
  }

  /**
   * Tracks aspects of the product state that are relevant to UI updates
   * @param {object} evt - variant change event
   * @return {object} productState - represents state of variant + plans
   *  productState.available - current variant and selling plan options result in valid offer
   *  productState.soldOut - variant is sold out
   *  productState.onSale - variant is on sale
   *  productState.showUnitPrice - variant has unit price
   *  productState.requiresPlan - all the product variants requires a selling plan
   *  productState.hasPlan - there is a valid selling plan
   *  productState.planSale - plan has a discount to show next to price
   *  productState.planPerDelivery - plan price does not equal per_delivery_price - a prepaid subscription
   */
  setProductState(dataset) {
    const variant = dataset.variant;
    const plan = dataset.plan;

    const productState = {
      available: true,
      soldOut: false,
      onSale: false,
      showUnitPrice: false,
      requiresPlan: false,
      hasPlan: false,
      planPerDelivery: false,
      planSale: false,
    };

    this.variantUpdated = false;

    if (this.variant?.id !== variant?.id) {
      this.variant = variant;
      this.variantUpdated = true;
    }

    if (!variant || (variant.requires_selling_plan && !plan)) {
      productState.available = false;
    } else {
      if (!variant.available) {
        productState.soldOut = true;
      }

      if (variant.compare_at_price > variant.price) {
        productState.onSale = true;
      }

      if (variant.unit_price) {
        productState.showUnitPrice = true;
      }

      if (this.product && this.product.requires_selling_plan) {
        productState.requiresPlan = true;
      }

      if (plan && this.subPrices) {
        productState.hasPlan = true;
        if (plan.allocation.per_delivery_price !== plan.allocation.price) {
          productState.planPerDelivery = true;
        }
        if (variant.price > plan.allocation.price) {
          productState.planSale = true;
        }
      }
    }
    return productState;
  }

  updateProductImage(evt) {
    const variant = evt.dataset?.variant || evt.variant;

    if (variant) {
      // Update variant image, if one is set
      if (variant.featured_media) {
        const selectedImage = this.container.querySelector(`[${attributes.imageId}="${variant.featured_media.id}"]`);
        // If we have a mobile breakpoint or the tall layout is disabled,
        // just switch the slideshow.

        if (selectedImage) {
          const selectedImageId = selectedImage.getAttribute(attributes.mediaId);
          const isDesktopView = !window.theme.isMobile();

          selectedImage.dispatchEvent(
            new CustomEvent('theme:media:select', {
              bubbles: true,
              detail: {
                id: selectedImageId,
              },
            })
          );

          if (isDesktopView && !this.productImages.hasAttribute(attributes.faderDesktop) && this.variantImageScroll) {
            const selectedImageTop = selectedImage.getBoundingClientRect().top;

            // Scroll to variant image
            document.dispatchEvent(
              new CustomEvent('theme:tooltip:close', {
                bubbles: false,
                detail: {
                  hideTransition: false,
                },
              })
            );

            window.theme.scrollTo(selectedImageTop);
          }

          if (!isDesktopView && !this.productImages.hasAttribute(attributes.faderMobile)) {
            this.productMediaList.scrollTo({
              left: selectedImage.offsetLeft,
            });
          }
        }
      }
    }
  }

  updateProductGallery(evt) {
    const variant = evt.dataset?.variant || evt.variant;

    if (!variant || !this.productJSON || !this.variantUpdated) return;

    const gallerySection = this.isQuickView ? 'api-product-upsell' : this.sectionId
    const productUrl = `${window.location.origin}/products/${this.productJSON.handle}`;
    const requestUrl = `${productUrl}?variant=${variant.id}&section_id=${gallerySection}`;

    // Skip fetching if already cached
    const cacheKey = this.isQuickView ? `quick-view-gallery-${variant.id}` : `pdp-gallery-${variant.id}`;
    if (sessionStorage.getItem(cacheKey) && this.productImagesWrapper) {
      this.updateInnerHtml(this.productImagesWrapper, sessionStorage.getItem(cacheKey))
      this.productImages = this.productImagesWrapper.querySelector(selectors.productImages);
      return;
    }

    // Prefetch and cache the HTML
    fetch(requestUrl)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html').querySelector(selectors.productImagesWrapper)?.innerHTML;
          if (html && this.productImagesWrapper) {
            this.updateInnerHtml(this.productImagesWrapper, html)
            this.productImages = this.productImagesWrapper.querySelector(selectors.productImages);

            const bytes = new TextEncoder().encode(html).length;
            const megabytes = bytes / (1024 * 1024);
            // Only cache if less than 4MB
            if (megabytes < 4) {
              sessionStorage.setItem(cacheKey, html);
            }
          }
        })
        .catch((error) => console.error('Prefetch error:', error));
  }

  updateInnerHtml(element, html) {
    if (html && element) {
      element.innerHTML = html;
    }
  }

  updateLegend(formState) {
    const variant = formState.variant;
    if (variant) {
      const optionValues = this.container.querySelectorAll(selectors.optionValue);
      if (optionValues.length) {
        optionValues.forEach((optionValue) => {
          const selectorWrapper = optionValue.closest(selectors.optionPosition);
          if (selectorWrapper) {
            const optionPosition = selectorWrapper.getAttribute(attributes.optionPosition);
            const optionIndex = parseInt(optionPosition, 10) - 1;
            const selectedOptionValue = variant.options[optionIndex];
            optionValue.innerHTML = selectedOptionValue;
          }
        });
      }
    }
  }
}

if (!customElements.get('product-form')) {
  customElements.define('product-form', ProductForm);
}
