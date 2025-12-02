(function () {
  'use strict';

  const selectors = {
    section: '[data-section-type]',
    collectionSidebar: '[data-collection-sidebar]',
    collectionSidebarSlideOut: '[data-collection-sidebar-slide-out]',
    collectionSidebarCloseButton: '[data-collection-sidebar-close]',
    groupTagsButton: '[data-aria-toggle]',
    animation: '[data-animation]',
    navigationMenu: '[data-navigation-menu]',
    navigationMenuSelect: '[data-navigation-menu-select]',
    productsContainer: '[data-products-grid]',
    activeFiltersCount: 'data-active-filters-count',
  };

  const classes = {
    animated: 'drawer--animated',
    hiding: 'is-hiding',
    expanded: 'expanded',
    noMobileAnimation: 'no-mobile-animation',
    focused: 'is-focused',
    loading: 'is-loading',
  };

  if (!customElements.get('collection-component')) {
    customElements.define(
      'collection-component',
      class Collection extends HTMLElement {
        constructor() {
          super();

          this.container = this.closest(selectors.section);
          this.collectionSidebar = this.querySelector(selectors.collectionSidebar);
          this.productsContainer = this.querySelector(selectors.productsContainer);
          this.navigationMenu = this.querySelector(selectors.navigationMenu);
          this.navigationMenuSelect = this.querySelector(selectors.navigationMenuSelect);
          this.groupTagsButton = this.querySelector(selectors.groupTagsButton);
          this.sectionId = this.getAttribute('data-section-id');
          this.a11y = window.theme.a11y;

          this.currentCollectionURL = null;
          this.tempCurrentCollectionURL = null;

          this.groupTagsButtonClickEvent = (evt) => this.groupTagsButtonClick(evt);
          this.sidebarResizeEvent = () => this.toggleSidebarSlider();
          this.collectionSidebarCloseEvent = (evt) => this.collectionSidebarClose(evt);
        }

        connectedCallback() {
          if (this.groupTagsButton !== null) {
            document.addEventListener('theme:resize:width', this.sidebarResizeEvent);

            this.groupTagsButton.addEventListener('click', this.groupTagsButtonClickEvent);

            // Prevent filters closing animation on page load
            if (this.collectionSidebar) {
              setTimeout(() => {
                this.collectionSidebar.classList.remove(classes.noMobileAnimation);
              }, 1000);
            }

            const toggleFiltersObserver = new MutationObserver((mutationList) => {
              for (const mutation of mutationList) {
                if (mutation.type === 'attributes') {
                  const expanded = mutation.target.getAttribute('aria-expanded') == 'true';

                  if (expanded) {
                    this.showSidebarCallback();
                  }
                }
              }
            });

            toggleFiltersObserver.observe(this.groupTagsButton, {
              attributes: true,
              childList: false,
              subtree: false,
            });
          }

          // Hide filters sidebar on ESC keypress
          this.addEventListener('keyup', (evt) => {
            if (evt.code !== 'Escape') {
              return;
            }
            this.hideSidebar();
          });

          if (this.collectionSidebar) {
            this.collectionSidebar.addEventListener('transitionend', () => {
              if (!this.collectionSidebar.classList.contains(classes.expanded)) {
                this.collectionSidebar.classList.remove(classes.animated);
              }
            });

            this.toggleSidebarSlider();

            this.addEventListener('theme:filter:close', this.collectionSidebarCloseEvent);
          }

          if (this.navigationMenu) {
            this.navigationMenuEventsHandler();
          }
        }

        navigationMenuEventsHandler() {
          this.navigationMenuBtns = this.navigationMenu.querySelectorAll('.btn[data-href]');

          if (!this.navigationMenuBtns.length) return;
          
          this.navigationMenuBtns.forEach(item => item.addEventListener('click', (e) => {
            this.currentCollectionURL = e.target.getAttribute('data-href');
            if (this.currentCollectionURL) this.fetchCollectionContent();
            this.syncNavigationMenuBtnsWSelect({type: 'button'});
          }));

          this.navigationMenuSelect.addEventListener('change', (e) => {
            this.currentCollectionURL = this.navigationMenuSelect.selectedOptions[0].dataset.href;
            if (this.currentCollectionURL) this.fetchCollectionContent();
            this.syncNavigationMenuBtnsWSelect({type: 'select'});
          });
        }

        fetchCollectionContent() {
          if (!this.productsContainer) return;

          if (this.tempCurrentCollectionURL === this.currentCollectionURL) return;

          this.productsContainer.classList.add(classes.loading);

          const searchParams = new URLSearchParams(window.location.search);
          if (searchParams.has('page')) searchParams.delete('page');
          const deletePathName = searchParams.toString().length ? `?${searchParams.toString()}` : '' ;

          fetch(`${this.currentCollectionURL}${deletePathName ? `${deletePathName}&` : '?'}section_id=${this.sectionId}`)
            .then((response) => response.text())
            .then((data) => {
              const dataHtml = new DOMParser().parseFromString(data, 'text/html');

              this.productsContainer.innerHTML = dataHtml.querySelector(selectors.productsContainer).innerHTML;
    
              if (this.collectionSidebar) {
                this.collectionSidebar.innerHTML = dataHtml.querySelector(selectors.collectionSidebar).innerHTML;
    
                const activeFiltersCountContainer = this.collectionSidebar.querySelector(`[${selectors.activeFiltersCount}]`);
                const activeFiltersContainer = this.querySelectorAll(selectors.activeFilters);
                if (activeFiltersCountContainer && activeFiltersContainer.length) {
                  const activeFiltersCount = parseInt(activeFiltersCountContainer.getAttribute(selectors.activeFiltersCount));
    
                  activeFiltersContainer.forEach((counter) => {
                    counter.textContent = activeFiltersCount;
                    counter.classList.toggle(classes.hidden, activeFiltersCount < 1);
                  });
                }
              }

              window.history.pushState(null, null, `${window.location.origin}${this.currentCollectionURL}${deletePathName}`);
              this.handleNavigationBtnChange();
            })
            .catch((error) => {
              console.log(error);
            })
            .finally(() => {
              setTimeout(() => {
                this.productsContainer.classList.remove(classes.loading);
              }, 500);
              this.tempCurrentCollectionURL = this.currentCollectionURL;
            });
        }

        handleNavigationBtnChange() {
          this.navigationMenuBtns.forEach(item => {
            item.setAttribute('aria-current', item.getAttribute('data-href') === this.currentCollectionURL);
          });
        }
        
        syncNavigationMenuBtnsWSelect({ type } = {}) {
          if (type === 'button') {
            const index = Array.from(this.navigationMenuSelect.querySelectorAll('option'))
              .findIndex(option => option.dataset.href === this.currentCollectionURL);
            this.navigationMenuSelect.selectedIndex = index;
          } else this.handleNavigationBtnChange();
        }

        showSidebarCallback() {
          const collectionSidebarSlideOut = this.querySelector(selectors.collectionSidebarSlideOut);
          const isScrollLocked = document.documentElement.hasAttribute('data-scroll-locked');

          const isMobileView = window.theme.isMobile();
          this.collectionSidebar.classList.add(classes.animated);

          if (collectionSidebarSlideOut === null) {
            if (!isMobileView && isScrollLocked) {
              this.a11y.removeTrapFocus();
              document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
            }
          }

          if (isMobileView || collectionSidebarSlideOut !== null) {
            if (collectionSidebarSlideOut) {
              this.a11y.trapFocus(this.collectionSidebar, {
                elementToFocus: this.collectionSidebar.querySelector(selectors.collectionSidebarCloseButton),
              });
            }
            document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
          }
        }

        hideSidebar() {
          const collectionSidebarSlideOut = this.querySelector(selectors.collectionSidebarSlideOut);
          const isScrollLocked = document.documentElement.hasAttribute('data-scroll-locked');

          this.groupTagsButton.setAttribute('aria-expanded', 'false');
          this.collectionSidebar.classList.remove(classes.expanded);

          if (collectionSidebarSlideOut) {
            this.a11y.removeTrapFocus();
          }

          if (isScrollLocked) {
            document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
          }
        }

        toggleSidebarSlider() {
          if (window.theme.isMobile()) {
            this.hideSidebar();
          } else if (this.collectionSidebar.classList.contains(classes.expanded)) {
            this.showSidebarCallback();
          }
        }

        collectionSidebarClose(evt) {
          evt.preventDefault();
          this.hideSidebar();
          if (document.body.classList.contains(classes.focused) && this.groupTagsButton) {
            this.groupTagsButton.focus();
          }
        }

        groupTagsButtonClick() {
          const isScrollLocked = document.documentElement.hasAttribute('data-scroll-locked');

          if (isScrollLocked) {
            document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
          }
        }

        disconnectedCallback() {
          if (this.groupTagsButton !== null) {
            document.removeEventListener('theme:resize:width', this.sidebarResizeEvent);
            this.groupTagsButton.removeEventListener('click', this.groupTagsButtonClickEvent);
          }

          if (this.collectionSidebar) {
            this.removeEventListener('theme:filter:close', this.collectionSidebarCloseEvent);
          }
        }
      }
    );
  }

})();
//# sourceMappingURL=collection.js.map
