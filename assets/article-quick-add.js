(function () {
  'use strict';

  const selectors = {
    template: '[data-quick-add-product]'
  };

  class ArticleQuickAddProduct extends HTMLElement {
    constructor() {
      super();

      this.template = this.querySelector(selectors.template);
    }

    connectedCallback() {
      if (!this.template) return

      this.querySelectorAll("ul li a[href*='/products/']").forEach(link => {
        const url = link.href;
        const match = url.match(/\/products\/([^/?]+)/);
        const productSlug = match ? match[1] : null;
        const quickAddForm = this.template.content.querySelector(`div[data-product-handle="${productSlug}"]`);

        if(quickAddForm) {
          link.parentElement.insertAdjacentHTML("afterend", quickAddForm.innerHTML);
        }
      });
    }
  }

  if (!customElements.get('article-quick-add-product')) {
    customElements.define('article-quick-add-product', ArticleQuickAddProduct);
  }

})();
//# sourceMappingURL=article-quick-add.js.map
