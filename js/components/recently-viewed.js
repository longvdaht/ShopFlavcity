const selectors = {
  section: '[data-section-type]',
};

if (!customElements.get('recently-viewed')) {
  customElements.define(
    'recently-viewed',
    class RecentlyViewed extends HTMLElement {
      constructor() {
        super();

        this.section = this.closest(selectors.section);
        this.howManyToShow = parseInt(this.dataset.limit) || 3;
        this.target = this.dataset.target;
        this.wrapperId = this.dataset.wrapperId || this.id;
      }

      connectedCallback() {
        Shopify.Products.showRecentlyViewed({
          howManyToShow: this.howManyToShow,
          wrapperId: this.wrapperId,
          section: this.section,
          target: this.target,
          onComplete: () => {
            this.dispatchEvent(new CustomEvent('theme:recently-viewed:loaded', {bubbles: false}));
          },
        });
      }
    }
  );
}
