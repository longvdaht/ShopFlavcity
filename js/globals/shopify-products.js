/**
 * Module to show Recently Viewed Products
 *
 * Copyright (c) 2014 Caroline Schnapp (11heavens.com)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

Shopify.Products = (function () {
  const config = {
    howManyToShow: 4,
    howManyToStoreInMemory: 10,
    wrapperId: 'recently-viewed-products',
    section: null,
    target: 'api-product-grid-item',
    onComplete: null,
  };

  let productHandleQueue = [];
  let wrapper = null;
  let howManyToShowItems = null;

  const today = new Date();
  const expiresDate = new Date();
  const daysToExpire = 90;
  expiresDate.setTime(today.getTime() + 3600000 * 24 * daysToExpire);

  const cookie = {
    configuration: {
      expires: expiresDate.toGMTString(),
      path: '/',
      domain: window.location.hostname,
      sameSite: 'none',
      secure: true,
    },
    name: 'shopify_recently_viewed',
    write: function (recentlyViewed) {
      const recentlyViewedString = encodeURIComponent(recentlyViewed.join(' '));
      document.cookie = `${this.name}=${recentlyViewedString}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}; sameSite=${this.configuration.sameSite}; secure=${this.configuration.secure}`;
    },
    read: function () {
      let recentlyViewed = [];
      let cookieValue = null;

      if (document.cookie.indexOf('; ') !== -1 && document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
        cookieValue = document.cookie
          .split('; ')
          .find((row) => row.startsWith(this.name))
          .split('=')[1];
      }

      if (cookieValue !== null) {
        recentlyViewed = decodeURIComponent(cookieValue).split(' ');
      }

      return recentlyViewed;
    },
    destroy: function () {
      const cookieVal = null;
      document.cookie = `${this.name}=${cookieVal}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}`;
    },
    remove: function (productHandle) {
      const recentlyViewed = this.read();
      const position = recentlyViewed.indexOf(productHandle);
      if (position !== -1) {
        recentlyViewed.splice(position, 1);
        this.write(recentlyViewed);
      }
    },
  };

  const finalize = (wrapper, section) => {
    wrapper.classList.remove('hidden');
    const cookieItemsLength = cookie.read().length;

    if (Shopify.recentlyViewed && howManyToShowItems && cookieItemsLength && cookieItemsLength < howManyToShowItems && wrapper.children.length) {
      let allClassesArr = [];
      let addClassesArr = [];
      let objCounter = 0;
      for (const property in Shopify.recentlyViewed) {
        objCounter += 1;
        const objString = Shopify.recentlyViewed[property];
        const objArr = objString.split(' ');
        const propertyIdx = parseInt(property.split('_')[1]);
        allClassesArr = [...allClassesArr, ...objArr];

        if (cookie.read().length === propertyIdx || (objCounter === Object.keys(Shopify.recentlyViewed).length && !addClassesArr.length)) {
          addClassesArr = [...addClassesArr, ...objArr];
        }
      }

      for (let i = 0; i < wrapper.children.length; i++) {
        const element = wrapper.children[i];
        if (allClassesArr.length) {
          element.classList.remove(...allClassesArr);
        }

        if (addClassesArr.length) {
          element.classList.add(...addClassesArr);
        }
      }
    }

    // If we have a callback.
    if (config.onComplete) {
      try {
        config.onComplete(wrapper, section);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const moveAlong = (shown, productHandleQueue, wrapper, section, target, howManyToShow) => {
    if (productHandleQueue.length && shown < howManyToShow) {
      fetch(`${window.theme.routes.root}products/${productHandleQueue[0]}?section_id=${target}`)
        .then((response) => response.text())
        .then((product) => {
          const aosDelay = shown * 100;
          const aosAnchor = wrapper.id ? `#${wrapper.id}` : '';
          const fresh = document.createElement('div');
          fresh.innerHTML = product;

          const content = fresh.querySelector('[data-api-content]');

          const isAvailable =
            !content.querySelector('[data-available="false"]') &&
            !content.innerHTML.toLowerCase().includes('sold out');

          if (isAvailable) {
            let productHTML = content.innerHTML
              .replaceAll('||itemAnimationDelay||', aosDelay)
              .replaceAll('||itemAnimationAnchor||', aosAnchor);

            wrapper.innerHTML += productHTML;

            shown++;
          }

          productHandleQueue.shift();
          moveAlong(shown, productHandleQueue, wrapper, section, target, howManyToShow);
        })
        .catch(() => {
          cookie.remove(productHandleQueue[0]);
          productHandleQueue.shift();
          moveAlong(shown, productHandleQueue, wrapper, section, target, howManyToShow);
        });
    } else {
      finalize(wrapper, section);
    }
  };

  return {
    showRecentlyViewed: function (params) {
      const paramsNew = params || {};
      const shown = 0;

      // Update defaults.
      Object.assign(config, paramsNew);

      // Read cookie.
      productHandleQueue = cookie.read();

      // Element where to insert.
      wrapper = document.querySelector(`#${config.wrapperId}`);

      // How many products to show.
      howManyToShowItems = config.howManyToShow;
      config.howManyToShow = Math.min(productHandleQueue.length, config.howManyToShow);

      // If we have any to show.
      if (config.howManyToShow && wrapper) {
        // Getting each product with an Ajax call and rendering it on the page.
        moveAlong(shown, productHandleQueue, wrapper, config.section, config.target, howManyToShowItems);
      }
    },

    getConfig: function () {
      return config;
    },

    clearList: function () {
      cookie.destroy();
    },

    recordRecentlyViewed: function (params) {
      const paramsNew = params || {};
      Object.assign(config, paramsNew);

      // Read cookie.
      let recentlyViewed = cookie.read();

      // If we are on a product page.
      if (window.location.pathname.indexOf('/products/') !== -1) {
        // What is the product handle on this page.
        let productHandle = decodeURIComponent(window.location.pathname)
          .match(
            /\/products\/([a-z0-9\-]|[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|[\u203B]|[\w\u0430-\u044f]|[\u0400-\u04FF]|[\u0900-\u097F]|[\u0590-\u05FF\u200f\u200e]|[\u0621-\u064A\u0660-\u0669 ])+/
          )[0]
          .split('/products/')[1];

        if (config.handle) {
          productHandle = config.handle;
        }

        // In what position is that product in memory.
        const position = recentlyViewed.indexOf(productHandle);

        // If not in memory.
        if (position === -1) {
          // Add product at the start of the list.
          recentlyViewed.unshift(productHandle);
          // Only keep what we need.

          recentlyViewed = recentlyViewed.splice(0, config.howManyToStoreInMemory);
        } else {
          // Remove the product and place it at start of list.
          recentlyViewed.splice(position, 1);
          recentlyViewed.unshift(productHandle);
        }

        // Update cookie.
        cookie.write(recentlyViewed);
      }
    },

    hasProducts: cookie.read().length > 0,
  };
})();
