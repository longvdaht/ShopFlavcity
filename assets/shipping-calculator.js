(function () {
  'use strict';

  var query = "query countries($locale: SupportedLocale!) {"
    + "  countries(locale: $locale) {"
    + "    name"
    + "    code"
    + "    labels {"
    + "      address1"
    + "      address2"
    + "      city"
    + "      company"
    + "      country"
    + "      firstName"
    + "      lastName"
    + "      phone"
    + "      postalCode"
    + "      zone"
    + "    }"
    + "    formatting {"
    + "      edit"
    + "    }"
    + "    zones {"
    + "      name"
    + "      code"
    + "    }"
    + "  }"
    + "}";

  var GRAPHQL_ENDPOINT = 'https://country-service.shopifycloud.com/graphql';

  function loadCountries(locale) {
    var response = fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        query: query,
        operationName: 'countries',
        variables: {
          locale: toSupportedLocale(locale),
        },
      }),
    });

    return response
      .then(function(res) { return res.json() })
      .then(function(countries) { return countries.data.countries });
  }

  var DEFAULT_LOCALE = 'EN';
  var SUPPORTED_LOCALES = [
    'DA',
    'DE',
    'EN',
    'ES',
    'FR',
    'IT',
    'JA',
    'NL',
    'PT',
    'PT_BR',
  ];

  function toSupportedLocale(locale) {
    var supportedLocale = locale.replace(/-/, '_').toUpperCase();

    if (SUPPORTED_LOCALES.indexOf(supportedLocale) !== -1) {
      return supportedLocale;
    } else if (SUPPORTED_LOCALES.indexOf(supportedLocale.substring(0, 2)) !== -1) {
      return supportedLocale.substring(0, 2);
    } else {
      return DEFAULT_LOCALE;
    }
  }

  function mergeObjects() {
    var to = Object({});

    for (var index = 0; index < arguments.length; index++) {
      var nextSource = arguments[index];

      if (nextSource) {
        for (var nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  }

  var FIELD_REGEXP = /({\w+})/g;
  var LINE_DELIMITER = '_';
  var INPUT_SELECTORS = {
    lastName: '[name="address[last_name]"]',
    firstName: '[name="address[first_name]"]',
    company: '[name="address[company]"]',
    address1: '[name="address[address1]"]',
    address2: '[name="address[address2]"]',
    country: '[name="address[country]"]',
    zone: '[name="address[province]"]',
    postalCode: '[name="address[zip]"]',
    city: '[name="address[city]"]',
    phone: '[name="address[phone]"]',
  };

  function AddressForm(rootEl, locale, options) {
    locale = locale || 'en';
    options = options || {inputSelectors: {}};
    var formElements = loadFormElements(
      rootEl,
      mergeObjects(INPUT_SELECTORS, options.inputSelectors)
    );

    validateElements(formElements);

    return loadShippingCountries(options.shippingCountriesOnly).then(function(
      shippingCountryCodes
    ) {
      return loadCountries(locale).then(function(countries) {
        init(
          rootEl,
          formElements,
          filterCountries(countries, shippingCountryCodes)
        );
      });
    });
  }

  /**
   * Runs when countries have been loaded
   */
  function init(rootEl, formElements, countries) {
    populateCountries(formElements, countries);
    var selectedCountry = formElements.country.input
      ? formElements.country.input.value
      : null;
    setEventListeners(rootEl, formElements, countries);
    handleCountryChange(rootEl, formElements, selectedCountry, countries);
  }

  /**
   * Handles when a country change: set labels, reorder fields, populate zones
   */
  function handleCountryChange(rootEl, formElements, countryCode, countries) {
    var country = getCountry(countryCode, countries);

    setLabels(formElements, country);
    reorderFields(rootEl, formElements, country);
    populateZones(formElements, country);
  }

  /**
   * Sets up event listener for country change
   */
  function setEventListeners(rootEl, formElements, countries) {
    formElements.country.input.addEventListener('change', function(event) {
      handleCountryChange(rootEl, formElements, event.target.value, countries);
    });
  }

  /**
   * Reorder fields in the DOM and add data-attribute to fields given a country
   */
  function reorderFields(rootEl, formElements, country) {
    var formFormat = country.formatting.edit;

    var countryWrapper = formElements.country.wrapper;
    var afterCountry = false;

    getOrderedField(formFormat).forEach(function(row) {
      row.forEach(function(line) {
        formElements[line].wrapper.dataset.lineCount = row.length;
        if (!formElements[line].wrapper) {
          return;
        }
        if (line === 'country') {
          afterCountry = true;
          return;
        }

        if (afterCountry) {
          rootEl.append(formElements[line].wrapper);
        } else {
          rootEl.insertBefore(formElements[line].wrapper, countryWrapper);
        }
      });
    });
  }

  /**
   * Update labels for a given country
   */
  function setLabels(formElements, country) {
    Object.keys(formElements).forEach(function(formElementName) {
      formElements[formElementName].labels.forEach(function(label) {
        label.textContent = country.labels[formElementName];
      });
    });
  }

  /**
   * Add right countries in the dropdown for a given country
   */
  function populateCountries(formElements, countries) {
    var countrySelect = formElements.country.input;
    var duplicatedCountrySelect = countrySelect.cloneNode(true);

    countries.forEach(function(country) {
      var optionElement = document.createElement('option');
      optionElement.value = country.code;
      optionElement.textContent = country.name;
      duplicatedCountrySelect.appendChild(optionElement);
    });

    countrySelect.innerHTML = duplicatedCountrySelect.innerHTML;

    if (countrySelect.dataset.default) {
      countrySelect.value = countrySelect.dataset.default;
    }
  }

  /**
   * Add right zones in the dropdown for a given country
   */
  function populateZones(formElements, country) {
    var zoneEl = formElements.zone;
    if (!zoneEl) {
      return;
    }

    if (country.zones.length === 0) {
      zoneEl.wrapper.dataset.ariaHidden = 'true';
      zoneEl.input.innerHTML = '';
      return;
    }

    zoneEl.wrapper.dataset.ariaHidden = 'false';

    var zoneSelect = zoneEl.input;
    var duplicatedZoneSelect = zoneSelect.cloneNode(true);
    duplicatedZoneSelect.innerHTML = '';

    country.zones.forEach(function(zone) {
      var optionElement = document.createElement('option');
      optionElement.value = zone.code;
      optionElement.textContent = zone.name;
      duplicatedZoneSelect.appendChild(optionElement);
    });

    zoneSelect.innerHTML = duplicatedZoneSelect.innerHTML;

    if (zoneSelect.dataset.default) {
      zoneSelect.value = zoneSelect.dataset.default;
    }
  }

  /**
   * Will throw if an input or a label is missing from the wrapper
   */
  function validateElements(formElements) {
    Object.keys(formElements).forEach(function(elementKey) {
      var element = formElements[elementKey].input;
      var labels = formElements[elementKey].labels;

      if (!element) {
        return;
      }

      if (typeof element !== 'object') {
        throw new TypeError(
          formElements[elementKey] + ' is missing an input or select.'
        );
      } else if (typeof labels !== 'object') {
        throw new TypeError(formElements[elementKey] + ' is missing a label.');
      }
    });
  }

  /**
   * Given an countryCode (eg. 'CA'), will return the data of that country
   */
  function getCountry(countryCode, countries) {
    countryCode = countryCode || 'CA';
    return countries.filter(function(country) {
      return country.code === countryCode;
    })[0];
  }

  /**
   * Given a format (eg. "{firstName}{lastName}_{company}_{address1}_{address2}_{city}_{country}{province}{zip}_{phone}")
   * will return an array of how the form needs to be formatted, eg.:
   * =>
   * [
   *   ['firstName', 'lastName'],
   *   ['company'],
   *   ['address1'],
   *   ['address2'],
   *   ['city'],
   *   ['country', 'province', 'zip'],
   *   ['phone']
   * ]
   */
  function getOrderedField(format) {
    return format.split(LINE_DELIMITER).map(function(fields) {
      var result = fields.match(FIELD_REGEXP);
      if (!result) {
        return [];
      }

      return result.map(function(fieldName) {
        var newFieldName = fieldName.replace(/[{}]/g, '');

        switch (newFieldName) {
          case 'zip':
            return 'postalCode';
          case 'province':
            return 'zone';
          default:
            return newFieldName;
        }
      });
    });
  }

  /**
   * Given a rootEl where all `input`s, `select`s, and `labels` are nested, it
   * will returns all form elements (wrapper, input and labels) of the form.
   * See `FormElements` type for details
   */
  function loadFormElements(rootEl, inputSelectors) {
    var elements = {};
    Object.keys(INPUT_SELECTORS).forEach(function(inputKey) {
      var input = rootEl.querySelector(inputSelectors[inputKey]);
      elements[inputKey] = input
        ? {
            wrapper: input.parentElement,
            input: input,
            labels: document.querySelectorAll('[for="' + input.id + '"]'),
          }
        : {};
    });

    return elements;
  }

  /**
   * If shippingCountriesOnly is set to true, will return the list of countries the
   * shop ships to. Otherwise returns null.
   */
  function loadShippingCountries(shippingCountriesOnly) {
    if (!shippingCountriesOnly) {
      // eslint-disable-next-line no-undef
      return Promise.resolve(null);
    }

    var response = fetch(location.origin + '/meta.json');

    return response
      .then(function(res) {
        return res.json();
      })
      .then(function(meta) {
        // If ships_to_countries has * in the list, it means the shop ships to
        // all countries
        return meta.ships_to_countries.indexOf('*') !== -1
          ? null
          : meta.ships_to_countries;
      })
      .catch(function() {
        return null;
      });
  }

  /**
   * Only returns countries that are in includedCountryCodes
   * Returns all countries if no includedCountryCodes is passed
   */
  function filterCountries(countries, includedCountryCodes) {
    if (!includedCountryCodes) {
      return countries;
    }

    return countries.filter(function(country) {
      return includedCountryCodes.indexOf(country.code) !== -1;
    });
  }

  const getUrlString = (params, keys = [], isArray = false) => {
    const p = Object.keys(params)
      .map((key) => {
        let val = params[key];

        if ('[object Object]' === Object.prototype.toString.call(val) || Array.isArray(val)) {
          if (Array.isArray(params)) {
            keys.push('');
          } else {
            keys.push(key);
          }
          return getUrlString(val, keys, Array.isArray(val));
        } else {
          let tKey = key;

          if (keys.length > 0) {
            const tKeys = isArray ? keys : [...keys, key];
            tKey = tKeys.reduce((str, k) => {
              return '' === str ? k : `${str}[${k}]`;
            }, '');
          }
          if (isArray) {
            return `${tKey}[]=${val}`;
          } else {
            return `${tKey}=${val}`;
          }
        }
      })
      .join('&');

    keys.pop();
    return p;
  };

  function FetchError(object) {
    this.status = object.status || null;
    this.headers = object.headers || null;
    this.json = object.json || null;
    this.body = object.body || null;
  }
  FetchError.prototype = Error.prototype;

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

})();
//# sourceMappingURL=shipping-calculator.js.map
