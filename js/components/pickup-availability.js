import FetchError from '../util/fetch-error';

const selectors = {
  pickupContainer: 'data-store-availability-container',
  shopifySection: '.shopify-section',
  drawer: '[data-pickup-drawer]',
  section: '[data-section-type]',
};

const classes = {
  isHidden: 'hidden',
};

class PickupAvailability extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.container = this.closest(selectors.section);
    this.drawer = null;
    this.container.addEventListener('theme:variant:change', (event) => this.fetchPickupAvailability(event));
    this.fetchPickupAvailability();
  }

  fetchPickupAvailability(event) {
    if ((event && !event.detail.variant) || (event && event.detail.variant && !event.detail.variant.available)) {
      this.classList.add(classes.isHidden);
      return;
    }

    const variantID = event && event.detail.variant ? event.detail.variant.id : this.getAttribute(selectors.pickupContainer);

    if (variantID) {
      fetch(`${window.theme.routes.root}variants/${variantID}/?section_id=api-pickup-availability`)
        .then(this.handleErrors)
        .then((response) => response.text())
        .then((text) => {
          const pickupAvailabilityHTML = new DOMParser().parseFromString(text, 'text/html').querySelector(selectors.shopifySection).innerHTML;
          this.innerHTML = pickupAvailabilityHTML;

          this.drawer = this.querySelector(selectors.drawer);
          if (!this.drawer) {
            this.classList.add(classes.isHidden);
            return;
          }

          this.classList.remove(classes.isHidden);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }

  handleErrors(response) {
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
}

if (!customElements.get('pickup-availability')) {
  customElements.define('pickup-availability', PickupAvailability);
}
