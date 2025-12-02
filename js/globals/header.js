const selectors = {
  cartDrawer: 'cart-drawer',
  cartToggleButton: '[data-cart-toggle]',
  deadLink: '.navlink[href="#"]',
  desktop: '[data-header-desktop]',
  firstSectionOverlayHeader: '.main-content > .shopify-section.section-overlay-header:first-of-type',
  pageHeader: '.page-header',
  preventTransparent: '[data-prevent-transparent-header]',
  style: 'data-header-style',
  widthContent: '[data-child-takes-space]',
  widthContentWrapper: '[data-takes-space-wrapper]',
  wrapper: '[data-header-wrapper]',
};

const classes = {
  clone: 'js__header__clone',
  firstSectionOverlayHeader: 'has-first-section-overlay-header',
  headerGroup: 'shopify-section-group-header-group',
  showMobileClass: 'js__show__mobile',
  sticky: 'has-header-sticky',
  stuck: 'js__header__stuck',
  transparent: 'has-header-transparent',
  headerWrapper: 'header-wrapper',
};

const attributes = {
  drawer: 'data-drawer',
  drawerToggle: 'data-drawer-toggle',
  scrollLock: 'data-scroll-locked',
  stickyHeader: 'data-header-sticky',
  transparent: 'data-header-transparent',
};

if (!customElements.get('header-component')) {
  customElements.define(
    'header-component',
    class HeaderComponent extends HTMLElement {
      constructor() {
        super();

        this.style = this.dataset.style;
        this.desktop = this.querySelector(selectors.desktop);
        this.deadLinks = document.querySelectorAll(selectors.deadLink);
        this.resizeObserver = null;
        this.checkWidth = this.checkWidth.bind(this);
        this.isSticky = this.hasAttribute(attributes.stickyHeader);

        document.body.classList.toggle(classes.sticky, this.isSticky);

        // Fallback for CSS :has() selectors
        let enableTransparentHeader = false;
        const firstSectionOverlayHeader = document.querySelector(selectors.firstSectionOverlayHeader);
        if (firstSectionOverlayHeader && !firstSectionOverlayHeader.querySelector(selectors.preventTransparent)) {
          enableTransparentHeader = true;
        }

        document.body.classList.toggle(classes.transparent, this.hasAttribute(attributes.transparent));
        document.body.classList.toggle(classes.firstSectionOverlayHeader, enableTransparentHeader);
      }

      connectedCallback() {
        this.killDeadLinks();
        this.drawerToggleEvent();
        this.cartToggleEvent();
        this.initSticky();

        if (this.style !== 'drawer' && this.desktop) {
          this.minWidth = this.getMinWidth();
          this.listenWidth();
        }
      }

      listenWidth() {
        if ('ResizeObserver' in window) {
          this.resizeObserver = new ResizeObserver(this.checkWidth);
          this.resizeObserver.observe(this);
        } else {
          document.addEventListener('theme:resize', this.checkWidth);
        }
      }

      drawerToggleEvent() {
        this.querySelectorAll(`[${attributes.drawerToggle}]`)?.forEach((button) => {
          button.addEventListener('click', () => {
            let drawer;
            const key = button.hasAttribute(attributes.drawerToggle) ? button.getAttribute(attributes.drawerToggle) : '';
            const desktopDrawer = document.querySelector(`[${attributes.drawer}="${key}"]`);
            const mobileDrawer = document.querySelector(`mobile-menu > [${attributes.drawer}]`);
            const isDesktopView = !window.theme.isMobile();

            const rect = document.querySelector('[data-header-height]').getBoundingClientRect().bottom;
            document.documentElement.style.setProperty('--header-bottom', `${rect || 0}px`);

            // if (isDesktopView) {
            //   drawer = desktopDrawer;
            // } else {
            //   drawer = theme.settings.mobileMenuType === 'new' ? mobileDrawer || desktopDrawer : desktopDrawer;
            // }

            drawer = theme.settings.mobileMenuType === 'new' ? mobileDrawer || desktopDrawer : desktopDrawer;

            drawer.dispatchEvent(
              new CustomEvent('theme:drawer:toggle', {
                bubbles: false,
                detail: {
                  button: button,
                },
              })
            );
          });
        });
      }

      killDeadLinks() {
        this.deadLinks.forEach((el) => {
          el.onclick = (e) => {
            e.preventDefault();
          };
        });
      }

      checkWidth() {
        if (document.body.clientWidth < this.minWidth) {
          this.classList.add(classes.showMobileClass);

          // Update --header-height CSS variable when switching to a mobile nav
          const {headerHeight} = window.theme.readHeights();
          document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        } else {
          this.classList.remove(classes.showMobileClass);
        }
      }

      getMinWidth() {
        const comparitor = document.createElement('div');
        comparitor.classList.add(classes.clone, classes.headerWrapper);
        comparitor.appendChild(this.querySelector('header').cloneNode(true));
        document.body.appendChild(comparitor);
        const widthWrappers = comparitor.querySelectorAll(selectors.widthContentWrapper);
        let minWidth = 0;
        let spaced = 0;

        widthWrappers.forEach((context) => {
          const wideElements = context.querySelectorAll(selectors.widthContent);
          let thisWidth = 0;
          if (wideElements.length === 3) {
            thisWidth = this._sumSplitWidths(wideElements);
          } else {
            thisWidth = this._sumWidths(wideElements);
          }
          if (thisWidth > minWidth) {
            minWidth = thisWidth;
            spaced = wideElements.length * 20;
          }
        });

        document.body.removeChild(comparitor);
        return minWidth + spaced;
      }

      cartToggleEvent() {
        if (theme.settings.cartType !== 'drawer') return;

        this.querySelectorAll(selectors.cartToggleButton)?.forEach((button) => {
          button.addEventListener('click', (e) => {
            const cartDrawer = document.querySelector(selectors.cartDrawer);

            if (cartDrawer) {
              e.preventDefault();
              cartDrawer.dispatchEvent(new CustomEvent('theme:cart-drawer:show'));
              window.theme.a11y.lastElement = button;
            }
          });
        });
      }

      toggleButtonClick(e) {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('theme:cart:toggle', {bubbles: true}));
      }

      initSticky() {
        if (!this.isSticky) return;

        this.isStuck = false;
        this.cls = this.classList;
        this.headerOffset = document.querySelector(selectors.pageHeader)?.offsetTop;
        this.updateHeaderOffset = this.updateHeaderOffset.bind(this);
        this.scrollEvent = (e) => this.onScroll(e);

        this.listen();
        this.stickOnLoad();
      }

      listen() {
        document.addEventListener('theme:scroll', this.scrollEvent);
        document.addEventListener('shopify:section:load', this.updateHeaderOffset);
        document.addEventListener('shopify:section:unload', this.updateHeaderOffset);
      }

      onScroll(e) {
        if (e.detail.down) {
          if (!this.isStuck && e.detail.position > this.headerOffset) {
            this.stickSimple();
          }
        } else if (e.detail.position <= this.headerOffset) {
          this.unstickSimple();
        }
      }

      updateHeaderOffset(event) {
        if (!event.target.classList.contains(classes.headerGroup)) return;

        // Update header offset after any "Header group" section has been changed
        setTimeout(() => {
          this.headerOffset = document.querySelector(selectors.pageHeader)?.offsetTop;
        });
      }

      stickOnLoad() {
        if (window.scrollY > this.headerOffset) {
          this.stickSimple();
        }
      }

      stickSimple() {
        this.cls.add(classes.stuck);
        this.isStuck = true;
      }

      unstickSimple() {
        if (!document.documentElement.hasAttribute(attributes.scrollLock)) {
          // check for scroll lock
          this.cls.remove(classes.stuck);
          this.isStuck = false;
        }
      }

      _sumSplitWidths(nodes) {
        let arr = [];
        nodes.forEach((el) => {
          if (el.firstElementChild) {
            arr.push(el.firstElementChild.clientWidth);
          }
        });
        if (arr[0] > arr[2]) {
          arr[2] = arr[0];
        } else {
          arr[0] = arr[2];
        }
        const width = arr.reduce((a, b) => a + b);
        return width;
      }

      _sumWidths(nodes) {
        let width = 0;
        nodes.forEach((el) => {
          width += el.clientWidth;
        });
        return width;
      }

      disconnectedCallback() {
        if ('ResizeObserver' in window) {
          this.resizeObserver?.unobserve(this);
        } else {
          document.removeEventListener('theme:resize', this.checkWidth);
        }

        if (this.isSticky) {
          document.removeEventListener('theme:scroll', this.scrollEvent);
          document.removeEventListener('shopify:section:load', this.updateHeaderOffset);
          document.removeEventListener('shopify:section:unload', this.updateHeaderOffset);
        }
      }
    }
  );
}
