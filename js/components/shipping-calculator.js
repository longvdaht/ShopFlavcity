/**
 * Module to add a shipping rates calculator to cart page.
 *
 * Copyright (c) 2011-2012 Caroline Schnapp (11heavens.com)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Modified version -- coupled with Carbon theme markup
 *
 */

import {AddressForm} from '@shopify/theme-addresses';

import getUrlString from '../util/get-url-string';
import FetchError from '../util/fetch-error';

const selectors = {
  templateNoShipping: '[data-template-no-shipping]',
  getRates: '.get-rates',
  addressContainer: '#address_container',
  addressCountry: '#address_country',
  addressProvince: '#address_province',
  addressZip: '#address_zip',
  wrapper: '#wrapper-response',
  template: '#shipping-calculator-response-template',
};

const attributes = {
  templateNoShipping: 'data-template-no-shipping',
  default: 'data-default',
};

const classes = {
  hidden: 'is-hidden',
  error: 'error',
  center: 'center',
  success: 'success',
  disabled: 'disabled',
  getRatesTrigger: 'get-rates--trigger',
};

const texts = {
  error: 'Error : country is not supported.',
  feedback: 'We do not ship to this destination.',
  feedbackLabel: 'Error : ',
};

class ShippingCalculator extends HTMLElement {
  constructor() {
    super();

    this.getRatesButton = this.querySelector(selectors.getRates);
    this.fieldsContainer = this.querySelector(selectors.addressContainer);
    this.selectCountry = this.querySelector(selectors.addressCountry);
    this.selectProvince = this.querySelector(selectors.addressProvince);
    this.template = this.querySelector(selectors.template);
    this.wrapper = this.querySelector(selectors.wrapper);
    this.onCountryChangeEvent = () => this.onCountryChange();
    this.onButtonClickEvent = () => this.onButtonClick();
  }

  connectedCallback() {
    const htmlEl = document.querySelector('html');
    let locale = 'en';
    if (htmlEl.hasAttribute('lang') && htmlEl.getAttribute('lang') !== '') {
      locale = htmlEl.getAttribute('lang');
    }

    if (this.fieldsContainer) {
      AddressForm(this.fieldsContainer, locale, {
        shippingCountriesOnly: true,
      });
    }

    if (this.selectCountry && this.selectCountry.hasAttribute(attributes.default) && this.selectProvince && this.selectProvince.hasAttribute(attributes.default)) {
      this.selectCountry.addEventListener('change', this.onCountryChangeEvent);
    }

    if (this.getRatesButton) {
      this.getRatesButton.addEventListener('click', this.onButtonClickEvent);

      if (theme.settings.customerLoggedIn && this.getRatesButton.classList.contains(classes.getRatesTrigger)) {
        const zipElem = document.querySelector(selectors.addressZip);
        if (zipElem && zipElem.value) {
          this.getRatesButton.dispatchEvent(new Event('click'));
        }
      }
    }
  }

  disconnectedCallback() {
    if (this.selectCountry && this.selectCountry.hasAttribute(attributes.default) && this.selectProvince && this.selectProvince.hasAttribute(attributes.default)) {
      this.selectCountry.removeEventListener('change', this.onCountryChangeEvent);
    }

    if (this.getRatesButton) {
      this.getRatesButton.removeEventListener('click', this.onButtonClickEvent);
    }
  }

  onCountryChange() {
    this.selectCountry.removeAttribute(attributes.default);
    this.selectProvince.removeAttribute(attributes.default);
  }

  onButtonClick() {
    this.disableButtons();
    while (this.wrapper.firstChild) this.wrapper.removeChild(this.wrapper.firstChild);
    this.wrapper.classList.add(classes.hidden);
    const shippingAddress = {};
    let elemCountryVal = this.selectCountry.value;
    let elemProvinceVal = this.selectProvince.value;

    const elemCountryData = this.selectCountry.getAttribute(attributes.default);
    if (elemCountryVal === '' && elemCountryData && elemCountryData !== '') {
      elemCountryVal = elemCountryData;
    }

    const elemProvinceData = this.selectProvince.getAttribute(attributes.default);
    if (elemProvinceVal === '' && elemProvinceData && elemProvinceData !== '') {
      elemProvinceVal = elemProvinceData;
    }

    shippingAddress.zip = document.querySelector(selectors.addressZip).value || '';
    shippingAddress.country = elemCountryVal || '';
    shippingAddress.province = elemProvinceVal || '';

    this.getCartShippingRatesForDestination(shippingAddress);
  }

  formatRate(cents) {
    const price = cents === '0.00' ? window.theme.strings.free : window.theme.formatMoney(cents, theme.moneyFormat);
    return price;
  }

  render(response) {
    if (this.template && this.wrapper) {
      this.wrapper.innerHTML = '';
      let ratesList = '';
      let ratesText = '';
      let successClass = `${classes.error} ${classes.center}`;
      let markup = this.template.innerHTML;
      const rateRegex = /[^[\]]+(?=])/g;

      if (response.rates && response.rates.length) {
        let rateTemplate = rateRegex.exec(markup)[0];
        response.rates.forEach((rate) => {
          let rateHtml = rateTemplate;
          rateHtml = rateHtml.replace(/\|\|rateName\|\|/, rate.name);
          rateHtml = rateHtml.replace(/\|\|ratePrice\|\|/, this.formatRate(rate.price));
          ratesList += rateHtml;
        });
      }

      if (response.success) {
        successClass = `${classes.success} ${classes.center}`;
        const createdNewElem = document.createElement('div');
        createdNewElem.innerHTML = this.template.innerHTML;
        const noShippingElem = createdNewElem.querySelector(selectors.templateNoShipping);

        if (response.rates.length < 1 && noShippingElem) {
          ratesText = noShippingElem.getAttribute(attributes.templateNoShipping);
        }
      } else {
        ratesText = response.errorFeedback;
      }

      markup = markup.replace(rateRegex, '').replace('[]', '');
      markup = markup.replace(/\|\|ratesList\|\|/g, ratesList);
      markup = markup.replace(/\|\|successClass\|\|/g, successClass);
      markup = markup.replace(/\|\|ratesText\|\|/g, ratesText);

      this.wrapper.innerHTML += markup;

      this.wrapper.classList.remove(classes.hidden);
    }
  }

  enableButtons() {
    this.getRatesButton.removeAttribute('disabled');
    this.getRatesButton.classList.remove(classes.disabled);
    this.getRatesButton.textContent = theme.strings.shippingCalcSubmitButton;
  }

  disableButtons() {
    this.getRatesButton.setAttribute('disabled', 'disabled');
    this.getRatesButton.classList.add(classes.disabled);
    this.getRatesButton.textContent = theme.strings.shippingCalcSubmitButtonDisabled;
  }

  getCartShippingRatesForDestination(shippingAddress) {
    const encodedShippingAddressData = encodeURI(
      getUrlString({
        shipping_address: shippingAddress,
      })
    );
    const url = `${theme.routes.cart_url}/shipping_rates.json?${encodedShippingAddressData}`;

    fetch(url)
      .then(this.handleErrors)
      .then((response) => response.text())
      .then((response) => {
        const responseJSON = JSON.parse(response);
        const rates = responseJSON.shipping_rates;
        this.onCartShippingRatesUpdate(rates, shippingAddress);
      })
      .catch((error) => {
        this.onError(error.json);
      });
  }

  fullMessagesFromErrors(errors) {
    const fullMessages = [];

    for (const error in errors) {
      for (const message of errors[error]) {
        fullMessages.push(message);
      }
    }

    return fullMessages;
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

  onError(data) {
    this.enableButtons();
    let feedback = '';

    if (data.message) {
      feedback = data.message + '(' + data.status + '): ' + data.description;
    } else {
      feedback = texts.feedbackLabel + this.fullMessagesFromErrors(data).join('; ');
    }

    if (feedback === texts.error) {
      feedback = texts.feedback;
    }

    this.render({
      rates: [],
      errorFeedback: feedback,
      success: false,
    });
  }

  onCartShippingRatesUpdate(rates, shippingAddress) {
    this.enableButtons();
    let readableAddress = '';

    if (shippingAddress.zip) {
      readableAddress += shippingAddress.zip + ', ';
    }

    if (shippingAddress.province) {
      readableAddress += shippingAddress.province + ', ';
    }

    readableAddress += shippingAddress.country;

    this.render({
      rates: rates,
      address: readableAddress,
      success: true,
    });
  }
}

if (!customElements.get('shipping-calculator')) {
  customElements.define('shipping-calculator', ShippingCalculator);
}
