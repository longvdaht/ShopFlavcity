const selectors = {
  ticker: 'ticker-bar',
  tickerSlide: '.announcement__slide',
};

if (!customElements.get('announcement-bar')) {
  customElements.define(
    'announcement-bar',
    class AnnouncementBar extends HTMLElement {
      constructor() {
        super();

        this.slidesCount = this.querySelectorAll(selectors.tickerSlide).length;
      }

      connectedCallback() {
        this.addEventListener('theme:countdown:hide', (e) => {
          if (window.Shopify.designMode) return;

          if (this.slidesCount === 1) {
            const tickerBar = this.querySelector(selectors.ticker);
            tickerBar.style.display = 'none';
          }

          const tickerText = e.target.closest(selectors.tickerSlide);
          this.removeTickerText(tickerText);
        });

        this.addEventListener('theme:countdown:expire', () => {
          this.querySelectorAll(selectors.ticker)?.forEach((ticker) => {
            ticker.dispatchEvent(new CustomEvent('theme:ticker:refresh'));
          });
        });

        document.dispatchEvent(new CustomEvent('theme:announcement:init', {bubbles: true}));
      }

      removeTickerText(tickerText) {
        const ticker = tickerText.closest(selectors.ticker);
        tickerText.remove();
        ticker.dispatchEvent(new CustomEvent('theme:ticker:refresh'));
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize:width', this.tickerResizeEvent);
      }
    }
  );
}
