(function () {
  'use strict';

  const selectors = {
    section: '[data-section-type]',
    collectionSidebar: '[data-collection-sidebar]',
    collectionSidebarSlideOut: '[data-collection-sidebar-slide-out]',
    collectionSidebarCloseButton: '[data-collection-sidebar-close]',
    form: '[data-collection-filters-form]',
    input: 'input',
    select: 'select',
    label: 'label',
    textarea: 'textarea',
    priceMin: '[data-field-price-min]',
    priceMax: '[data-field-price-max]',
    priceMinValue: 'data-field-price-min',
    priceMaxValue: 'data-field-price-max',
    rangeMin: '[data-se-min-value]',
    rangeMax: '[data-se-max-value]',
    rangeMinValue: 'data-se-min-value',
    rangeMaxValue: 'data-se-max-value',
    rangeMinDefault: 'data-se-min',
    rangeMaxDefault: 'data-se-max',
    showMore: '[data-show-more]',
    linkHidden: '[data-link-hidden]',
    collectionNav: '[data-collection-nav]',
    productsContainer: '[data-products-grid]',
    activeFilters: '[data-active-filters]',
    activeFiltersCount: 'data-active-filters-count',
    filterUpdateUrlButton: '[data-filter-update-url]',
    dataSort: '[data-sort-enabled]',
    sortLinks: '[data-sort-link]',
    sortValue: 'data-value',
    sortButton: '[data-popout-toggle]',
    sortButtonText: '[data-sort-button-text]',
    resultsCount: '[data-results-count]',
  };

  const classes = {
    hidden: 'hidden',
    focused: 'is-focused',
    loading: 'is-loading',
    active: 'is-active',
  };

  class CollectionFiltersForm extends HTMLElement {
    constructor() {
      super();

      this.container = this.closest(selectors.section);
      this.collectionSidebar = this.container.querySelector(selectors.collectionSidebar);
      this.collectionSidebarSlideOut = this.container.querySelector(selectors.collectionSidebarSlideOut);
      this.form = this.querySelector(selectors.form);
      this.productsContainer = this.container.querySelector(selectors.productsContainer);
      this.collectionNav = this.container.querySelector(selectors.collectionNav);
      this.sort = this.container.querySelector(selectors.dataSort);
      this.sortButton = this.container.querySelector(selectors.sortButton);
      this.sortLinks = this.container.querySelectorAll(selectors.sortLinks);
      this.filterUrlButtons = this.container.querySelectorAll(selectors.filterUpdateUrlButton);
      this.collectionSidebarCloseButtons = this.container.querySelectorAll(selectors.collectionSidebarCloseButton);
      this.showMoreOptions = this.querySelectorAll(selectors.showMore);
      this.a11y = window.theme.a11y;

      this.updatePriceEvent = window.theme.debounce((e) => this.updatePrice(e), 500);
      this.updateRangeEvent = (e) => this.updateRange(e);
      this.showMoreEvent = (e) => this.showMore(e);
      this.onSortButtonClickEvent = (e) => this.onSortButtonClick(e);
      this.submitFormEvent = (e) => this.submitForm(e);
      this.collectionSidebarCloseEvent = (e) => this.collectionSidebarClose(e);
      this.filterUpdateFromUrlEvent = (e) => this.filterUpdateFromUrl(e);
    }

    connectedCallback() {
      if (this.sort && this.sortLinks.length) {
        this.sortLinks.forEach((link) => {
          link.addEventListener('click', this.onSortButtonClickEvent);
        });
      }

      if (this.collectionSidebar && this.form) {
        this.collectionSidebar.addEventListener('input', this.updatePriceEvent);

        this.collectionSidebar.addEventListener('theme:range:update', this.updateRangeEvent);
      }

      if (this.showMoreOptions.length) {
        // Show more options from the group
        this.showMoreOptions.forEach((element) => {
          element.addEventListener('click', this.showMoreEvent);
        });
      }

      if (this.collectionSidebar || this.sort) {
        window.addEventListener('popstate', this.submitFormEvent);
      }

      if (this.filterUrlButtons.length) {
        this.filterUrlButtons.forEach((filterUrlButton) => {
          filterUrlButton.addEventListener('click', this.filterUpdateFromUrlEvent);
        });
      }

      if (this.collectionSidebarCloseButtons.length) {
        this.collectionSidebarCloseButtons.forEach((button) => {
          button.addEventListener('click', this.collectionSidebarCloseEvent);
        });
      }
    }

    collectionSidebarClose(e) {
      e.preventDefault();
      this.container.dispatchEvent(new CustomEvent('theme:filter:close', {bubbles: false}));
    }

    onSortButtonClick(e) {
      e.preventDefault();

      if (this.sortButton) {
        this.sortButton.dispatchEvent(new Event('click'));
      }

      this.sortActions(e, e.currentTarget);
    }

    sortActions(e, link, submitForm = true) {
      const sortButtonText = this.sort.querySelector(selectors.sortButtonText);
      const sortActive = this.sort.querySelector(`.${classes.active}`);

      if (sortButtonText) {
        const linkText = link ? link.textContent.trim() : '';
        sortButtonText.textContent = linkText;
      }

      if (sortActive) {
        sortActive.classList.remove(classes.active);
      }

      this.sort.classList.toggle(classes.active, link);

      if (link) {
        link.parentElement.classList.add(classes.active);

        if (submitForm) {
          this.submitForm(e);
        }
      }
    }

    onSortCheck(e) {
      let link = null;
      if (window.location.search.includes('sort_by')) {
        const url = new window.URL(window.location.href);
        const urlParams = url.searchParams;

        for (const [key, val] of urlParams.entries()) {
          const linkSort = this.sort.querySelector(`[${selectors.sortValue}="${val}"]`);
          if (key.includes('sort_by') && linkSort) {
            link = linkSort;
            break;
          }
        }
      }

      this.sortActions(e, link, false);
    }

    showMore(e) {
      e.preventDefault();
      const target = e.target.matches(selectors.showMore) ? e.target : e.target.closest(selectors.showMore);

      target.parentElement.classList.add(classes.hidden);
      target.parentElement.previousElementSibling.querySelectorAll(selectors.linkHidden).forEach((link, index) => {
        link.classList.remove(classes.hidden);
        const input = link.querySelector(selectors.input);
        if (index === 0 && document.body.classList.contains(classes.focused) && input) {
          if (this.collectionSidebarSlideOut || window.theme.isMobile()) {
            this.a11y.removeTrapFocus();
            this.a11y.trapFocus(this.collectionSidebar, {
              elementToFocus: input,
            });
          } else {
            input.focus();
          }
        }
      });
    }

    updatePrice(e) {
      const type = e.type;
      const target = e.target;

      if (type === selectors.input || type === selectors.select || type === selectors.label || type === selectors.textarea) {
        if (this.form && typeof this.form.submit === 'function') {
          const priceMin = this.form.querySelector(selectors.priceMin);
          const priceMax = this.form.querySelector(selectors.priceMax);
          if (priceMin && priceMax) {
            if (target.hasAttribute(selectors.priceMinValue) && !priceMax.value) {
              priceMax.value = priceMax.placeholder;
            } else if (target.hasAttribute(selectors.priceMaxValue) && !priceMin.value) {
              priceMin.value = priceMin.placeholder;
            }
          }

          this.submitForm(e);
        }
      }
    }

    updateRange(e) {
      if (this.form && typeof this.form.submit === 'function') {
        const rangeMin = this.form.querySelector(selectors.rangeMin);
        const rangeMax = this.form.querySelector(selectors.rangeMax);
        const priceMin = this.form.querySelector(selectors.priceMin);
        const priceMax = this.form.querySelector(selectors.priceMax);
        const checkElements = rangeMin && rangeMax && priceMin && priceMax;

        if (checkElements && rangeMin.hasAttribute(selectors.rangeMinValue) && rangeMax.hasAttribute(selectors.rangeMaxValue)) {
          const priceMinValue = parseInt(priceMin.placeholder);
          const priceMaxValue = parseInt(priceMax.placeholder);
          const rangeMinValue = parseInt(rangeMin.getAttribute(selectors.rangeMinValue));
          const rangeMaxValue = parseInt(rangeMax.getAttribute(selectors.rangeMaxValue));

          if (priceMinValue !== rangeMinValue || priceMaxValue !== rangeMaxValue) {
            priceMin.value = rangeMinValue;
            priceMax.value = rangeMaxValue;

            this.submitForm(e);
          }
        }
      }
    }

    filterUpdateFromUrl(e) {
      e.preventDefault();
      this.submitForm(e, e.currentTarget.getAttribute('href'));
    }

    submitForm(e, replaceHref = '') {
      if (!e || (e && e.type !== 'popstate')) {
        if (replaceHref === '') {
          const url = new window.URL(window.location.href);
          let filterUrl = url.searchParams;
          const filterUrlEntries = filterUrl;
          const filterUrlParams = Object.fromEntries(filterUrlEntries);
          const filterUrlRemoveString = filterUrl.toString();

          if (filterUrlRemoveString.includes('filter.') || filterUrlRemoveString.includes('page=') || filterUrlRemoveString.includes('sort_by=')) {
            for (const key in filterUrlParams) {
              if (key.includes('filter.') || key === 'page' || key === 'sort_by') {
                filterUrl.delete(key);
              }
            }
          }

          if (this.form) {
            const formData = new FormData(this.form);
            const formParams = new URLSearchParams(formData);
            const rangeMin = this.form.querySelector(selectors.rangeMin);
            const rangeMax = this.form.querySelector(selectors.rangeMax);
            const rangeMinDefaultValue = rangeMin && rangeMin.hasAttribute(selectors.rangeMinDefault) ? rangeMin.getAttribute(selectors.rangeMinDefault) : '';
            const rangeMaxDefaultValue = rangeMax && rangeMax.hasAttribute(selectors.rangeMaxDefault) ? rangeMax.getAttribute(selectors.rangeMaxDefault) : '';
            let priceFilterDefaultCounter = 0;

            for (let [key, val] of formParams.entries()) {
              if ((key.includes('filter.') && val) || (key.includes('sort_by') && val)) {
                filterUrl.append(key, val);

                if ((val === rangeMinDefaultValue && key === 'filter.v.price.gte') || (val === rangeMaxDefaultValue && key === 'filter.v.price.lte')) {
                  priceFilterDefaultCounter += 1;
                }
              }
            }

            if (priceFilterDefaultCounter === 2) {
              filterUrl.delete('filter.v.price.gte');
              filterUrl.delete('filter.v.price.lte');
            }
          }

          const filterUrlString = filterUrl.toString();
          const filterNewParams = filterUrlString ? `?${filterUrlString}` : location.pathname;
          window.history.pushState(null, '', filterNewParams);
        } else {
          window.history.pushState(null, '', replaceHref);
        }
      } else if (this.sort) {
        this.onSortCheck(e);
      }

      if (this.productsContainer) {
        this.productsContainer.classList.add(classes.loading);
        fetch(`${window.location.pathname}${window.location.search}`)
          .then((response) => response.text())
          .then((data) => {
            const dataHtml = new DOMParser().parseFromString(data, 'text/html');

            // Update results count on search page
            const resultsCountContainer = this.container.querySelector(selectors.resultsCount);
            if (resultsCountContainer) {
              const newResultsCount = dataHtml.querySelector(selectors.resultsCount);

              resultsCountContainer.innerHTML = newResultsCount.innerHTML;
            }

            this.productsContainer.innerHTML = dataHtml.querySelector(selectors.productsContainer).innerHTML;

            if (this.collectionSidebar) {
              this.collectionSidebar.innerHTML = dataHtml.querySelector(selectors.collectionSidebar).innerHTML;

              const activeFiltersCountContainer = this.collectionSidebar.querySelector(`[${selectors.activeFiltersCount}]`);
              const activeFiltersContainer = this.container.querySelectorAll(selectors.activeFilters);
              if (activeFiltersCountContainer && activeFiltersContainer.length) {
                const activeFiltersCount = parseInt(activeFiltersCountContainer.getAttribute(selectors.activeFiltersCount));

                activeFiltersContainer.forEach((counter) => {
                  counter.textContent = activeFiltersCount;
                  counter.classList.toggle(classes.hidden, activeFiltersCount < 1);
                });
              }
            }

            if (this.collectionNav) {
              window.theme.scrollTo(this.productsContainer.getBoundingClientRect().top - this.collectionNav.offsetHeight);
            }

            setTimeout(() => {
              this.productsContainer.classList.remove(classes.loading);
            }, 500);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }

    disconnectedCallback() {
      if (this.collectionSidebar && this.form) {
        this.collectionSidebar.removeEventListener('input', this.updatePriceEvent);

        this.collectionSidebar.removeEventListener('theme:range:update', this.updateRangeEvent);
      }

      if (this.showMoreOptions.length) {
        this.showMoreOptions.forEach((element) => {
          element.removeEventListener('click', this.showMoreEvent);
        });
      }

      if (this.sort && this.sortLinks.length) {
        this.sortLinks.forEach((link) => {
          link.removeEventListener('click', this.onSortButtonClickEvent);
        });
      }

      if (this.collectionSidebar || this.sort) {
        window.removeEventListener('popstate', this.submitFormEvent);
      }

      if (this.filterUrlButtons.length) {
        this.filterUrlButtons.forEach((filterUrlButton) => {
          filterUrlButton.removeEventListener('click', this.filterUpdateFromUrlEvent);
        });
      }

      if (this.collectionSidebarCloseButtons.length) {
        this.collectionSidebarCloseButtons.forEach((button) => {
          button.removeEventListener('click', this.collectionSidebarCloseEvent);
        });
      }
    }
  }

  if (!customElements.get('collection-filters-form')) {
    customElements.define('collection-filters-form', CollectionFiltersForm);
  }

})();
//# sourceMappingURL=collection-filters-form.js.map
