const selectors = {
  scrollToElement: '[data-scroll-to]',
  tooltip: '[data-tooltip]',
  collapsibleTrigger: '[data-collapsible-trigger]',
  collapsibleBody: '[data-collapsible-body]',
};

const attributes = {
  open: 'open',
  dataScrollTo: 'data-scroll-to',
  tooltipStopMousenterValue: 'data-tooltip-stop-mouseenter',
};

if (!customElements.get('scroll-to-element')) {
  customElements.define(
    'scroll-to-element',
    class ScrollToElement extends HTMLElement {
      constructor() {
        super();

        this.scrollToButton = this.querySelector(selectors.scrollToElement);
        this.collapsibleClickCallback = null;
      }

      connectedCallback() {
        if (this.scrollToButton) {
          this.scrollToButton.addEventListener('click', () => {
            const target = document.querySelector(this.scrollToButton.getAttribute(attributes.dataScrollTo));

            if (!target || this.scrollToButton.tagName === 'A') return;

            this.scrollToElement(target);
          });
        }
      }

      scrollToElement(element) {
        const collapsibleElement = element.nextElementSibling.matches('details') ? element.nextElementSibling : null;
        this.scrollTriggered = false;

        if (collapsibleElement) {
          const collapsibleTrigger = collapsibleElement?.querySelector(selectors.collapsibleTrigger);
          const collapsibleBody = collapsibleElement?.querySelector(selectors.collapsibleBody);
          const collapsibleBodyTransition = Number(getComputedStyle(collapsibleBody).transition.replace(/[^\d.-]+/g, '') || 0.1) * 1000;
          const isOpen = collapsibleElement.hasAttribute(attributes.open);

          this.collapsibleClickCallback && clearTimeout(this.collapsibleClickCallback);
          this.collapsibleClickCallback = () => window.theme.scrollTo(element.getBoundingClientRect().top + 1);

          if (!isOpen) {
            collapsibleTrigger?.dispatchEvent(new Event('click'));
          }

          setTimeout(() => this.collapsibleClickCallback(), collapsibleBodyTransition);
          this.scrollTriggered = true;
        }

        if (!this.scrollTriggered) {
          window.theme.scrollTo(element.getBoundingClientRect().top + 1);
        }

        const tooltips = document.querySelectorAll(`${selectors.tooltip}:not([${attributes.tooltipStopMousenterValue}])`);
        if (tooltips.length) {
          tooltips.forEach((tooltip) => {
            tooltip.setAttribute(attributes.tooltipStopMousenterValue, '');

            setTimeout(() => {
              tooltip.removeAttribute(attributes.tooltipStopMousenterValue);
            }, 1000);
          });
        }
      }
    }
  );
}
