const selectors = {
  complementaryProducts: 'complementary-products',
  quickAddProduct: 'quick-add-product',
};

const classes = {
  loaded: 'is-loaded',
};

const attributes = {
  url: 'data-url',
  unpack: 'data-unpack',
  removeDuplicates: 'data-remove-duplicates',
  childContainerSelector: 'data-child-container-selector',
  ignoreIntersections: 'data-ignore-intersections'
};

class ComplementaryProducts extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // We always update meters when connecting new customers
    this.initGlobals();

    const handleIntersectionOrInit = (entries, observer, ignoreIntersections = false) => {
      if (!ignoreIntersections && entries && observer) {
        if (!entries[0].isIntersecting) return;
        observer.unobserve(this);
      }

      const url = this.getAttribute(attributes.url);
      if (this.hasAttribute(attributes.url) && url !== '') {
        fetch(url)
          .then((response) => response.text())
          .then((text) => {
            const html = document.createElement('div');
            html.innerHTML = text;

            const recommendations = html.querySelector(selectors.complementaryProducts);
            if (recommendations && recommendations.innerHTML.trim().length) {
              this.innerHTML = recommendations.innerHTML;
            }

            if (html.querySelector(`${selectors.complementaryProducts} ${selectors.quickAddProduct}`)) {
              this.classList.add(classes.loaded);
            }

            // Loaded groups counter
            if (typeof window.complementaryGroupsExpected === 'undefined') {
              this.initGlobals(); // in case something cleared the variables
            }

            window.complementaryGroupsLoaded++;

            // When all groups are loaded — start cleaning
            if (window.complementaryGroupsLoaded === window.complementaryGroupsExpected) {
              const container = document.querySelector('.cart__widget__content__inner .cart__widget__content__inner__wrapper');
              if (container) {
                this.removeDuplicates(container);
              }

              // Optionally clear global variables
              this.resetGlobals();
            }

            this.additionalActions();
          })
          .catch((e) => {
            console.error(e);
          });
      }
    };

    if (this.hasAttribute(attributes.ignoreIntersections)) {
      handleIntersectionOrInit(null, null, true);
    } else {
      new IntersectionObserver(handleIntersectionOrInit.bind(this), {
        rootMargin: '0px 0px 400px 0px'
      }).observe(this);
    }

    this.closest('collapsible-elements')?.init();
  }

  initGlobals() {
    if (typeof window.complementaryGroupsExpected === 'undefined') {
      const container = document.querySelector('.cart__widget__content__inner .cart__widget__content__inner__wrapper');
      const expected = container?.getAttribute('data-line-items-count');

      if (expected) {
        window.complementaryGroupsExpected = parseInt(expected, 10);
        window.complementaryGroupsLoaded = 0;
      }
    }
  }

  resetGlobals() {
    delete window.complementaryGroupsExpected;
    delete window.complementaryGroupsLoaded;
  }

  additionalActions() {
    if (this.hasAttribute(attributes.unpack)) {
      if (this.innerHTML.trim() === '') {
        this.remove();
      } else {
        this.outerHTML = this.innerHTML;
      }
    }
  }

  removeDuplicates(wrapper) {
    if (!wrapper) return;

    const slides = Array.from(wrapper.querySelectorAll('[data-complementary-product-id]'));

    // Products already in cart (exclude)
    const cartProductIds = (() => {
      try {
        const idsRaw = wrapper.getAttribute('data-line-items-ids');
        return idsRaw ? JSON.parse(idsRaw) : [];
      } catch (e) {
        console.warn(e);
        return [];
      }
    })();

    const renderedProductIds = new Set();
    const groups = new Map();

    // Grouping by line-item-id
    slides.forEach(slide => {
      const lineItemId = slide.getAttribute('data-line-item-id');
      const productId = slide.getAttribute('data-complementary-product-id');

      // Delete slides that are in cartProductIds
      if (cartProductIds.includes(Number(productId))) {
        slide.remove();
        return;
      }

      if (!lineItemId || !productId) return;

      if (!groups.has(lineItemId)) {
        groups.set(lineItemId, []);
      }

      groups.get(lineItemId).push(slide);
    });

    // Processing of each group
    groups.forEach((groupSlides, lineItemId) => {
      const groupFinalSlides = [];
      const groupToRemove = [];

      for (const slide of groupSlides) {
        const productId = slide.getAttribute('data-complementary-product-id');
        if (!productId) continue;

        if (renderedProductIds.has(productId)) {
          groupToRemove.push(slide);
          continue;
        }

        if (groupFinalSlides.length < 3) {
          groupFinalSlides.push(slide);
          renderedProductIds.add(productId);
        } else {
          groupToRemove.push(slide);
        }
      }

      groupToRemove.forEach(slide => slide.remove());

      if (groupFinalSlides.length < 3) {
        console.warn(`Group [${lineItemId}] doesn't have ${groupFinalSlides.length} uniq products.`);
      }
    });

    const totalSlides = wrapper.querySelectorAll('swiper-slide').length;
    wrapper.setAttribute('data-complementary-products-count', totalSlides);
  }
}

if (!customElements.get('complementary-products')) {
  customElements.define('complementary-products', ComplementaryProducts);
}
