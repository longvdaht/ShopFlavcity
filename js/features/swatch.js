import {getUrlWithVariant} from '../vendor/theme-scripts/theme-product-form';
import {fetchProduct} from '../util/fetch-product';

const selectors = {
  gridSwatchForm: '[data-grid-swatch-form]',
  input: '[data-swatch-input]',
  productItem: '[data-grid-item]',
  productInfo: '[data-product-information]',
  sectionId: '[data-section-id]',
  productImage: '[data-product-image]',
  swatchButton: '[data-swatch-button]',
  swatchLink: '[data-swatch-link]',
  swatchText: '[data-swatch-text]',
  template: '[data-swatch-template]',
};

const classes = {
  visible: 'is-visible',
  hidden: 'hidden',
  stopEvents: 'no-events',
  swatch: 'swatch',
};

const attributes = {
  image: 'data-swatch-image',
  handle: 'data-swatch-handle',
  label: 'data-swatch-label',
  scrollbar: 'data-scrollbar',
  swatchCount: 'data-swatch-count',
  variant: 'data-swatch-variant',
  variantName: 'data-swatch-variant-name',
  variantTitle: 'data-variant-title',
  swatchValues: 'data-swatch-values',
};

class GridSwatch extends HTMLElement {
  constructor() {
    super();

    this.productItemMouseLeaveEvent = () => this.hideVariantImages();
    this.showVariantImageEvent = (swatchButton) => this.showVariantImage(swatchButton);
  }

  connectedCallback() {
    this.handle = this.getAttribute(attributes.handle);
    this.productItem = this.closest(selectors.productItem);
    this.productInfo = this.closest(selectors.productInfo);
    this.productImage = this.productItem.querySelector(selectors.productImage);
    this.template = document.querySelector(selectors.template).innerHTML;
    this.swatchesJSON = this.getSwatchesJSON();
    this.swatchesStyle = theme.settings.collectionSwatchStyle;

    const label = this.getAttribute(attributes.label).trim().toLowerCase();

    fetchProduct(this.handle).then((product) => {
      this.product = product;
      this.colorOption = product.options.find(function (element) {
        return element.name.toLowerCase() === label || null;
      });

      if (this.colorOption) {
        this.swatches = this.colorOption.values;
        this.init();
      }
    });
  }

  init() {
    this.innerHTML = '';
    this.count = 0;
    this.limitedCount = 0;

    this.swatches.forEach((swatch) => {
      let variant = null;
      let variantAvailable = false;
      let image = '';

      for (const productVariant of this.product.variants) {
        const optionWithSwatch = productVariant.options.includes(swatch);

        if (!variant && optionWithSwatch) {
          variant = productVariant;
        }

        // Use a variant with image if exists
        if (optionWithSwatch && productVariant.featured_media) {
          image = productVariant.featured_media.preview_image.src;
          variant = productVariant;
          break;
        }
      }

      for (const productVariant of this.product.variants) {
        const optionWithSwatch = productVariant.options.includes(swatch);

        if (optionWithSwatch && productVariant.available) {
          variantAvailable = true;
          break;
        }
      }

      if (variant) {
        const swatchTemplate = document.createElement('div');
        swatchTemplate.innerHTML = this.template;
        const swatchButton = swatchTemplate.querySelector(selectors.swatchButton);
        const swatchLink = swatchTemplate.querySelector(selectors.swatchLink);
        const swatchText = swatchTemplate.querySelector(selectors.swatchText);
        const swatchHandle = this.swatchesJSON[swatch];
        const variantTitle = variant.title.replaceAll('"', "'");

        swatchButton.style = `--animation-delay: ${(100 * this.count) / 1250}s`;
        swatchButton.classList.add(`${classes.swatch}-${swatchHandle}`);
        swatchButton.dataset.tooltip = swatch;
        swatchButton.dataset.swatchVariant = variant.id;
        swatchButton.dataset.swatchVariantName = variantTitle;
        swatchButton.dataset.swatchImage = image;
        swatchButton.dataset.variant = variant.id;
        swatchButton.style.setProperty('--swatch', swatchHandle);
        swatchLink.href = getUrlWithVariant(this.product.url, variant.id);
        swatchLink.dataset.swatch = swatch;
        swatchLink.disabled = !variantAvailable;
        swatchText.innerText = swatch;

        if (this.swatchesStyle != 'limited') {
          this.innerHTML += swatchTemplate.innerHTML;
        } else if (this.count <= 4) {
          this.innerHTML += swatchTemplate.innerHTML;
          this.limitedCount++;
        }
        this.count++;
      }
    });

    this.swatchCount = this.productInfo.querySelector(`[${attributes.swatchCount}]`);
    this.swatchElements = this.querySelectorAll(selectors.swatchLink);
    this.swatchForm = this.productInfo.querySelector(selectors.gridSwatchForm);
    this.hideSwatchesTimer = 0;

    if (this.swatchCount.hasAttribute(attributes.swatchCount)) {
      if (this.swatchesStyle == 'text' || this.swatchesStyle == 'text-slider') {
        this.swatchCount.innerText = `${this.count} ${this.count > 1 ? theme.strings.otherColor : theme.strings.oneColor}`;

        if (this.swatchesStyle == 'text') return;

        this.swatchCount.addEventListener('mouseenter', () => {
          if (this.hideSwatchesTimer) clearTimeout(this.hideSwatchesTimer);

          this.productInfo.classList.add(classes.stopEvents);
          this.swatchForm.classList.add(classes.visible);
        });

        // Prevent color swatches blinking on mouse move
        this.productInfo.addEventListener('mouseleave', () => {
          this.hideSwatchesTimer = setTimeout(() => {
            this.productInfo.classList.remove(classes.stopEvents);
            this.swatchForm.classList.remove(classes.visible);
          }, 100);
        });
      }

      if (this.swatchesStyle == 'slider' || this.swatchesStyle == 'grid') {
        this.swatchForm.classList.add(classes.visible);
      }

      if (this.swatchesStyle == 'limited') {
        const swatchesLeft = this.count - this.limitedCount;

        this.swatchForm.classList.add(classes.visible);

        if (swatchesLeft > 0) {
          this.innerHTML += `<div class="swatch-limited">+${swatchesLeft}</div>`;
        }
      }
    }

    this.bindSwatchButtonEvents();
  }

  bindSwatchButtonEvents() {
    this.querySelectorAll(selectors.swatchButton)?.forEach((swatchButton) => {
      // Show variant image when hover on color swatch
      swatchButton.addEventListener('mouseenter', this.showVariantImageEvent);
    });

    this.productItem.addEventListener('mouseleave', this.productItemMouseLeaveEvent);
  }

  showVariantImage(event) {
    const swatchButton = event.target;
    const variantName = swatchButton.getAttribute(attributes.variantName)?.replaceAll('"', "'");
    const variantImages = this.productImage.querySelectorAll(`[${attributes.variantTitle}]`);
    const variantImageSelected = this.productImage.querySelector(`[${attributes.variantTitle}="${variantName}"]`);

    // Hide all variant images
    variantImages?.forEach((image) => {
      image.classList.remove(classes.visible);
    });

    // Show selected variant image
    variantImageSelected?.classList.add(classes.visible);
  }

  hideVariantImages() {
    // Hide all variant images
    this.productImage.querySelectorAll(`[${attributes.variantTitle}].${classes.visible}`)?.forEach((image) => {
      image.classList.remove(classes.visible);
    });
  }

  getSwatchesJSON() {
    if (!this.hasAttribute(attributes.swatchValues)) return {};

    // Splitting the string by commas to get individual key-value pairs
    const pairs = this.getAttribute(attributes.swatchValues).split(',');

    // Creating an empty object to store the key-value pairs
    const jsonObject = {};

    // Iterating through the pairs and constructing the JSON object
    pairs?.forEach((pair) => {
      const [key, value] = pair.split(':');
      jsonObject[key.trim()] = value.trim();
    });

    return jsonObject;
  }
}

export {GridSwatch};
