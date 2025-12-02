class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);
    this.id = this.dataset.id
    this.rawData = JSON.parse(document.querySelector(`#${this.id}[type="application/json"]`).textContent);
    this.containerWrapper = document.getElementById(`results-wrapper-${this.id}`);
    this.itemsPerPage = parseInt(this.dataset.paginationLimit);
    this.blogSearchElement = document.getElementById(`blog-search-${this.id}`);

    this.debouncedOnSubmit = window.theme.debounce((event) => {
      this.onSubmitHandler(event);
    }, 800);

    this.facetForm = this.querySelector('form');
    this.facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));

    this.setListeners();
    this.renderPage(this.getSearchParams(), null,  false);

    if (this.blogSearchElement) this.setSearchEventListeners();
  }

  setSearchEventListeners() {
    this.blogSearchElement.addEventListener('search-submit', (e) => {
      const query = e.detail.query;
      const searchParams = this.getSearchParams();
      if (query) searchParams.set('q', query);
      else searchParams.delete('q');
      searchParams.delete('current_page')
      this.renderPage(searchParams);

      const blogSearchElement = document.querySelector('blog-search');
      if (blogSearchElement && typeof blogSearchElement.close === 'function') {
        blogSearchElement.close();
      }
    });

    this.blogSearchElement.addEventListener('search-suggest', (e) => {
      const searchParams = this.getSearchParams();
      if (e.detail.query) searchParams.set('q', e.detail.query);
      else searchParams.delete('q');
      searchParams.delete('current_page')
      this.renderBlogSearchSuggestions(searchParams);
    });
  }

  renderBlogSearchSuggestions(searchParams) {
    const container = document.getElementById('blog-search-results-products-list');
    if (!container) return;

    container.innerHTML = '';
    const filters = this.parseSearchParams(searchParams);
    const results = this.rawData.filter(item => this.matchItem(item, filters)).slice(0, 4);

    if (this.blogSearchElement) this.blogSearchElement.setAttribute('results', results.length > 0 ? 'true' : 'false');

    results.forEach(item => {
      const el = document.createElement('item-renderer');
      el.setAttribute('data', JSON.stringify(item));
      container.appendChild(el);
    });

    if (this.blogSearchElement && typeof this.blogSearchElement.open === 'function') {
      this.blogSearchElement.open();
    }
  }

  setListeners() {
    const onHistoryChange = (event) => {
      const searchParamsString = event.state ? event.state.searchParams : null
      const searchParams = searchParamsString ? new URLSearchParams(searchParamsString) : null;

      this.renderPage(searchParams, null, false);
    };

    window.addEventListener('popstate', onHistoryChange);
  }

  renderPage(searchParams, event, updateURLHash = true) {
    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams.toString());

    this.containerWrapper.classList.add('is-loading');

    this.renderFilteredItems(this.rawData, searchParams);
    this.renderActiveFacets(searchParams);
    this.updateInputState(searchParams);

    this.containerWrapper.classList.remove('is-loading');
  }

  updateInputState(searchParams) {
    const inputsArray = Array.from(document.querySelectorAll('facet-filters-form input[type="checkbox"], facet-filters-form input[type="hidden"]'));

    if (!inputsArray.length) return;

    inputsArray.forEach(element => {
      const name = element.name;
      const value = element.value;

      // If no searchParams, clear checkboxes/hidden fields
      if (!searchParams) {
        if (element.type === 'checkbox') {
          element.checked = false;
        } else if (element.type === 'hidden') {
          element.value = '';
        }
        return; // Skip further processing for this element
      }

      const allValues = searchParams.getAll(name);

      if (name === 'current_page') {
        const currentPageFromURL = searchParams.get('current_page');
        element.value = currentPageFromURL ? currentPageFromURL : 1;
      } else {
        if (allValues.includes(value)) {
          if (element.type === 'checkbox') {
            element.checked = true;
          } else if (element.type === 'hidden') {
            element.value = value;
          }
        } else {
          if (element.type === 'checkbox') {
            element.checked = false;
          } else if (element.type === 'hidden') {
            element.value = '';
          }
        }
      }
    });
  }

  renderActiveFacets(searchParams) {
    const containers = document.querySelectorAll(`#active-facets-${this.id}, #active-facets-mobile-${this.id}`);

    containers.forEach(element=>{
      element.innerHTML = ''; // Clear previous content
    })

    if (
      !searchParams ||
      (!searchParams.has('product') &&
        !searchParams.has('category') &&
        !searchParams.has('diet') &&
        !searchParams.has('q'))
    ) return;

    const wrapper = document.createElement('div');
    wrapper.classList.add('active-facets', 'active-facets-desktop');

    searchParams.forEach((value, key) => {
      if (['product', 'category', 'diet', 'q'].includes(key)) {

        const isQuery = key === 'q';
        const facet = document.createElement('facet-remove');
        const link = document.createElement('a');
        link.href = `?${key}=${value}` || '#';
        link.className = `active-facets__button ${isQuery ? 'active-facets__button--transparent' : 'active-facets__button--light'}`;
        link.setAttribute('role', 'button');

        const inner = document.createElement('span');
        inner.className = 'active-facets__button-inner';
        inner.textContent = isQuery ? `Search by "${value}"` : value;
        link.title = isQuery ? `Search query: ${value}` : `Filter: ${value}`;

        const svgWrapper = document.createElement('span');
        svgWrapper.className = 'svg-wrapper';
        svgWrapper.innerHTML = `<svg aria-hidden="true" focusable="false" role="presentation" class="" viewBox="0 0 24 24"><path d="M6.758 17.243 12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;

        const hidden = document.createElement('span');
        hidden.className = 'visually-hidden';
        hidden.textContent = 'Remove filter';

        inner.appendChild(svgWrapper);
        inner.appendChild(hidden);
        link.appendChild(inner);
        facet.appendChild(link);
        wrapper.appendChild(facet);
      }
    });

    // "Remove all" link
    const clearAll = document.createElement('facet-remove');
    clearAll.className = 'active-facets__button-wrapper';

    const clearLink = document.createElement('a');
    clearLink.href = `?${searchParams.toString()}`;
    clearLink.className = 'active-facets__button-remove';
    clearLink.setAttribute('role', 'button');

    const clearText = document.createElement('span');
    clearText.textContent = 'Remove all';

    clearLink.appendChild(clearText);
    clearAll.appendChild(clearLink);
    wrapper.appendChild(clearAll);

    containers.forEach(element=>{
      const clonedWrapper = wrapper.cloneNode(true);
      element.appendChild(clonedWrapper);
    })
  }

  parseSearchParams(searchParams) {
    const filters = { category: [], product: [], diet: [], query: '' };

    if (!searchParams) return filters;

    for (let [key, value] of searchParams.entries()) {
      if (filters[key]) {
        filters[key].push(value.replace(/\+/g, ' '));
      } else if (key === 'q') {
        filters.query = value.toLowerCase();
      }
    }

    return filters;
  }

  renderFilteredItems(data, searchParams) {
    const filters = this.parseSearchParams(searchParams);
    const container = document.getElementById(`results-${this.id}`);
    container.innerHTML = ''; // Clear previous results

    const currentPage = this.getSearchParams() ? parseInt((this.getSearchParams().get('current_page')) || 1) : 1; // Get the current page from the URL or default to 1
    // const itemsPerPage = 3; // Set the number of items per page
    const startIndex = (currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const totalItems = data.filter(item => this.matchItem(item, filters));
    const totalItemsLength = Array.from(totalItems).length;

    // Filter and paginate the data
    const filteredItems = data.filter(item => this.matchItem(item, filters)).slice(startIndex, endIndex);

    filteredItems.forEach(item => {
      const el = document.createElement('item-renderer');
      el.setAttribute('data', JSON.stringify(item));
      el.classList.add('item__wrapper');
      container.appendChild(el);
    });

    this.containerWrapper.classList.remove('loading');
    // Render pagination controls
    this.renderPaginationControls(searchParams, currentPage, totalItemsLength);
  }

  matchItem(item, filters) {
    const matches = {
      category: filters.category.length === 0 || filters.category.some(f => item.filter_category.includes(f)),
      product: filters.product.length === 0 || filters.product.some(f => item.filter_product.includes(f)),
      diet: filters.diet.length === 0 || filters.diet.some(f => item.filter_diet.includes(f)),
      query: !filters.query || (item.content && item.content.toLowerCase().includes(filters.query))
    };

    return matches.category && matches.product && matches.diet && matches.query;
  }

  renderPaginationControls(searchParams, currentPage, totalItemsLength) {
    const paginationContainer = document.getElementById(`pagination-container-${this.id}`);
    paginationContainer.innerHTML = ''; // Clear previous pagination controls

    if (totalItemsLength > this.itemsPerPage) {
      const totalPages = Math.ceil(totalItemsLength / this.itemsPerPage);
      const paginationWrapper = document.createElement('nav');
      const paginationPagesWrapper = document.createElement('div');
      paginationWrapper.classList.add('pagination-custom');
      paginationPagesWrapper.classList.add('pagination-custom__inner');

      // Previous button
      if (currentPage > 1) {
        const prevButton = document.createElement('a');
        const paginationItem = document.createElement('pagination-item');

        const newParams = new URLSearchParams(searchParams);
        newParams.set('current_page', currentPage - 1);

        prevButton.className = 'pagination-custom__prev btn';
        prevButton.href = `?${newParams.toString()}`;
        prevButton.title = 'Previous';
        prevButton.innerHTML = '<span>Previous</span>';
        paginationItem.appendChild(prevButton);
        paginationWrapper.appendChild(paginationItem);
      }

      // Page numbers
      for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('a');
        const paginationItem = document.createElement('pagination-item');

        const newParams = new URLSearchParams(searchParams);
        newParams.set('current_page', i);

        pageButton.className = 'pagination-custom__page btn';
        pageButton.href = `?${newParams.toString()}`;
        pageButton.title = i;
        pageButton.textContent = i;
        if (i === currentPage) {
          pageButton.classList.add('pagination-custom__page--active');
        }
        paginationItem.appendChild(pageButton);
        paginationPagesWrapper.appendChild(paginationItem);
      }

      paginationWrapper.appendChild(paginationPagesWrapper);

      // Next button
      if (currentPage < totalPages) {
        const nextButton = document.createElement('a');
        const paginationItem = document.createElement('pagination-item');

        const newParams = new URLSearchParams(searchParams);
        newParams.set('current_page', currentPage + 1);

        nextButton.className = 'pagination-custom__next btn';
        nextButton.href = `?${newParams.toString()}`;
        nextButton.title = 'Next';
        nextButton.innerHTML = '<span>Next</span>';
        paginationItem.appendChild(nextButton);
        paginationWrapper.appendChild(paginationItem);
      }

      paginationContainer.appendChild(paginationWrapper);
    }
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  getSearchParams() {
    const paramsString = window.location.search;
    return new URLSearchParams(paramsString);
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    const blogSearchForm = this.blogSearchElement.querySelector('form');

    if (blogSearchForm) {
      const blogSearchData = new FormData(blogSearchForm);
      for (const [key, value] of blogSearchData.entries()) {
        if (value && value.trim() !== '') {
          formData.set(key, value.trim());
        }
      }
    }

    return new URLSearchParams(formData);
  }

  onSubmitForm(searchParams, event) {
    this.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    event.preventDefault();

    const searchParams = this.createSearchParams(event.target.closest('form'));
    searchParams.delete('current_page')

    this.onSubmitForm(searchParams, event);
  }

  onPaginationItemClick(event) {
    event.preventDefault();

    this.scrollToTop();

    const anchor = event.target.closest('a');
    const hrefUrl = new URL(anchor.href); // works even if it's an absolute URL
    const hrefParams = new URLSearchParams(hrefUrl.search);

    this.renderPage(hrefParams);
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  onActiveFilterClick(event) {
    event.preventDefault();

    // Get current URL search params
    const currentParams = this.getSearchParams()
    const anchor = event.target.closest('a');

    // Create a URLSearchParams object from the anchor's href
    const hrefUrl = new URL(anchor.href); // works even if it's an absolute URL
    const hrefParams = new URLSearchParams(hrefUrl.search);
    const entriesToRemove = [...hrefParams.entries()];
    const filteredParams = [...currentParams.entries()].filter(([key, value]) => {
      return !entriesToRemove.some(([removeKey, removeValue]) => {
        return key === removeKey && value === removeValue;
      });
    });

    // Create a new URLSearchParams with updated values
    const newParams = new URLSearchParams(filteredParams);
    newParams.delete('current_page')

    this.renderPage(newParams);
  }
}

customElements.define('facet-filters-form', FacetFiltersForm);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const facetLink = this.querySelector('a');

    facetLink.setAttribute('role', 'button');
    facetLink.addEventListener('click', this.handleEvent.bind(this));
    facetLink.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.handleEvent(event);
    });
  }

  handleEvent(event) {
    event.preventDefault();
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    form.onActiveFilterClick(event);
  }
}

customElements.define('facet-remove', FacetRemove);

class PaginationItem extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const facetLink = this.querySelector('a');

    // facetLink.setAttribute('role', 'button');
    facetLink.addEventListener('click', this.handleEvent.bind(this));
    facetLink.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.handleEvent(event);
    });
  }

  handleEvent(event) {
    event.preventDefault();
    const form = document.querySelector('facet-filters-form')
    form.onPaginationItemClick(event);
  }
}

customElements.define('pagination-item', PaginationItem);

class ItemRenderer extends HTMLElement {
  constructor() {
    super();
    // this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['data'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data') {
      this.render(JSON.parse(newValue));
    }
  }

  render(data) {
    const imageSrc = data.image?.src || '';
    const aspectRatio = data.image?.aspect_ratio || 1;
    const title = data.title || 'No Title';
    const url = data.url || '#';

    const filterValues = [
      ...(data.filter_category?.split(',') || []),
      ...(data.filter_product?.split(',') || []),
      ...(data.filter_diet?.split(',') || [])
    ];

    const filterSpans = filterValues
      .filter(Boolean)
      .map(val => `<span class="filter-tag">${val}</span>`)
      .join(' ');

    this.innerHTML = `
      <article class="article grid-item">          
          <div class="article__image__outer">
              <div class="article__image">
                  <a class="article__image-link" href="${url}" aria-label="link to ${title}">
                      <figure class="image-wrapper lazy-image is-loading lazy-image--backfill"
                              style="--aspect-ratio: 1;">
                          <span class="image-skeleton" aria-hidden="true"></span>
                          <img src="${imageSrc}" alt="${title}" loading="lazy">
                      </figure>
                  </a>
              </div>
          </div>
          <div class="article__text-wrapper">
              <div class="article__tags">${filterSpans}</div>
              <h2 class="article__title subheading heading-x-small">
                  <a href="${url}" title="${title}">
                      ${title}
                  </a>
              </h2>
          </div>
      </article>
     `;
  }
}

customElements.define('item-renderer', ItemRenderer);

class blogSearch extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.input = this.querySelector('input[type="search"]');
    this.resetButton = this.querySelector('.blog-search__button-reset');
    this.predictiveSearchResults = this.querySelector('[data-blog-search]');

    setTimeout(() => this.resetButton, 6000);

    this.setupEventListeners();
    this.syncInputWithSearchParams();
  }

  setupEventListeners() {
    if (!this.input?.form) return;

    this.input.form.addEventListener('reset', (event)=> {
      this.onFormReset(event);
    });

    this.input.addEventListener(
      'input',
      window.theme.debounce((event) => {
        this.onChange(event);
        const query = event.target.value;
        if (query.trim() !== '') {
          this.triggerSearchSuggest(query)
        }
      }, 300).bind(this)
    );

    this.input.addEventListener('focus', (event) => {
      const query = event.target.value;

      if (query.trim() !== '') {
        this.triggerSearchSuggest(query)
      }
      // this.onFocus(event);
    });

    document.addEventListener('click', (e) => {
      if (!this.contains(e.target)) {
        this.close();
      }
    });

    this.input.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = this.input.value.trim();

      if (!query) return;

      this.dispatchEvent(new CustomEvent('search-submit', {
        detail: { query },
        bubbles: true,
        composed: true
      }));
    });
  }

  toggleResetButton() {
    if (!this.resetButton) return;
    const resetIsHidden = this.resetButton.classList.contains('hidden');
    if (this.input.value.length > 0 && resetIsHidden) {
      this.resetButton.classList.remove('hidden');
    } else if (this.input.value.length === 0 && !resetIsHidden) {
      this.resetButton.classList.add('hidden');
    }
  }

  onChange() {
    this.toggleResetButton();
  }

  shouldResetForm() {
    return !document.querySelector('[aria-selected="true"] a');
  }

  onFormReset(event) {
    event.preventDefault();
    this.input.value = '';
    this.input.focus();
    this.toggleResetButton();
    this.closeResults(true);
  }

  open() {
    this.setAttribute('open', true);
    this.input.setAttribute('aria-expanded', true);
    this.isOpen = true;
  }

  getResultsMaxHeight() {
    this.resultsMaxHeight =
      window.innerHeight - document.querySelector('.blog-search__field')?.getBoundingClientRect().bottom;
    return this.resultsMaxHeight;
  }

  close(clearSearchTerm = false) {
    this.closeResults(clearSearchTerm);
    this.isOpen = false;
  }

  closeResults(clearSearchTerm = false) {
    if (clearSearchTerm) {
      this.input.value = '';
      this.removeAttribute('results');
    }
    const selected = this.querySelector('[aria-selected="true"]');
    if (selected) selected.setAttribute('aria-selected', false);

    this.input.setAttribute('aria-activedescendant', '');
    this.removeAttribute('loading');
    this.removeAttribute('open');
    this.input.setAttribute('aria-expanded', false);
    this.resultsMaxHeight = false;
    this.predictiveSearchResults.removeAttribute('style');
  }

  syncInputWithSearchParams() {
    const params = new URLSearchParams(window.location.search);
    const queryValue = params.get('q');
    if (queryValue && this.input) {
      this.input.value = queryValue;
      this.toggleResetButton();
    }
  }

  triggerSearchSuggest(query = this.input?.value?.trim()) {
    if (!query) {
      this.close();
      return;
    }
    this.dispatchEvent(new CustomEvent('search-suggest', {
      detail: { query },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('blog-search', blogSearch);