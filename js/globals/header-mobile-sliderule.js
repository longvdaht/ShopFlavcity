const selectors = {
  animates: 'data-animates',
  sliderule: '[data-sliderule]',
  slideruleOpen: 'data-sliderule-open',
  slideruleClose: 'data-sliderule-close',
  sliderulePane: 'data-sliderule-pane',
  drawerContent: '[data-drawer-content]',
  focusable: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  children: `:scope > [data-animates],
             :scope > * > [data-animates],
             :scope > * > * > [data-animates],
             :scope > * > .sliderule-grid  > *`,
};

const classes = {
  isVisible: 'is-visible',
  isHiding: 'is-hiding',
  isHidden: 'is-hidden',
  focused: 'is-focused',
  scrolling: 'is-scrolling',
};

if (!customElements.get('mobile-sliderule')) {
  customElements.define(
    'mobile-sliderule',

    class HeaderMobileSliderule extends HTMLElement {
      constructor() {
        super();

        this.key = this.id;
        this.sliderule = this.querySelector(selectors.sliderule);
        const btnSelector = `[${selectors.slideruleOpen}='${this.key}']`;
        this.exitSelector = `[${selectors.slideruleClose}='${this.key}']`;
        this.trigger = this.querySelector(btnSelector);
        this.exit = document.querySelectorAll(this.exitSelector);
        this.pane = this.trigger.closest(`[${selectors.sliderulePane}]`);
        this.childrenElements = this.querySelectorAll(selectors.children);
        this.drawerContent = this.closest(selectors.drawerContent);
        this.cachedButton = null;
        this.a11y = window.theme.a11y;

        this.trigger.setAttribute('aria-haspopup', true);
        this.trigger.setAttribute('aria-expanded', false);
        this.trigger.setAttribute('aria-controls', this.key);
        this.closeSliderule = this.closeSliderule.bind(this);

        this.clickEvents();
        this.keyboardEvents();

        document.addEventListener('theme:sliderule:close', this.closeSliderule);
      }

      clickEvents() {
        this.trigger.addEventListener('click', () => {
          this.cachedButton = this.trigger;
          this.showSliderule();
        });
        this.exit.forEach((element) => {
          element.addEventListener('click', () => {
            this.hideSliderule();
          });
        });
      }

      keyboardEvents() {
        this.addEventListener('keyup', (evt) => {
          evt.stopPropagation();
          if (evt.code !== 'Escape') {
            return;
          }

          this.hideSliderule();
        });
      }

      trapFocusSliderule(showSliderule = true) {
        const trapFocusButton = showSliderule ? this.querySelector(this.exitSelector) : this.cachedButton;

        this.a11y.removeTrapFocus();

        if (trapFocusButton && this.drawerContent) {
          this.a11y.trapFocus(this.drawerContent, {
            elementToFocus: document.body.classList.contains(classes.focused) ? trapFocusButton : null,
          });
        }
      }

      hideSliderule(close = false) {
        const newPosition = parseInt(this.pane.dataset.sliderulePane, 10) - 1;
        this.pane.setAttribute(selectors.sliderulePane, newPosition);
        this.pane.classList.add(classes.isHiding);
        this.sliderule.classList.add(classes.isHiding);
        const hiddenSelector = close ? `[${selectors.animates}].${classes.isHidden}` : `[${selectors.animates}="${newPosition}"]`;
        const hiddenItems = this.pane.querySelectorAll(hiddenSelector);
        if (hiddenItems.length) {
          hiddenItems.forEach((element) => {
            element.classList.remove(classes.isHidden);
          });
        }

        const children = close ? this.pane.querySelectorAll(`.${classes.isVisible}, .${classes.isHiding}`) : this.childrenElements;
        children.forEach((element, index) => {
          const lastElement = children.length - 1 == index;
          element.classList.remove(classes.isVisible);
          if (close) {
            element.classList.remove(classes.isHiding);
            this.pane.classList.remove(classes.isHiding);
          }
          const removeHidingClass = () => {
            if (parseInt(this.pane.getAttribute(selectors.sliderulePane)) === newPosition) {
              this.sliderule.classList.remove(classes.isVisible);
            }
            this.sliderule.classList.remove(classes.isHiding);
            this.pane.classList.remove(classes.isHiding);

            if (lastElement) {
              this.a11y.removeTrapFocus();
              if (!close) {
                this.trapFocusSliderule(false);
              }
            }

            element.removeEventListener('animationend', removeHidingClass);
          };

          if (window.theme.settings.enableAnimations) {
            element.addEventListener('animationend', removeHidingClass);
          } else {
            removeHidingClass();
          }
        });
      }

      showSliderule() {
        let lastScrollableFrame = null;
        const parent = this.closest(`.${classes.isVisible}`);
        let lastScrollableElement = this.pane;

        if (parent) {
          lastScrollableElement = parent;
        }

        lastScrollableElement.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });

        lastScrollableElement.classList.add(classes.scrolling);

        const lastScrollableIsScrolling = () => {
          if (lastScrollableElement.scrollTop <= 0) {
            lastScrollableElement.classList.remove(classes.scrolling);
            if (lastScrollableFrame) {
              cancelAnimationFrame(lastScrollableFrame);
            }
          } else {
            lastScrollableFrame = requestAnimationFrame(lastScrollableIsScrolling);
          }
        };

        lastScrollableFrame = requestAnimationFrame(lastScrollableIsScrolling);

        const oldPosition = parseInt(this.pane.dataset.sliderulePane, 10);
        const newPosition = oldPosition + 1;
        this.sliderule.classList.add(classes.isVisible);
        this.pane.setAttribute(selectors.sliderulePane, newPosition);

        const hiddenItems = this.pane.querySelectorAll(`[${selectors.animates}="${oldPosition}"]`);
        if (hiddenItems.length) {
          hiddenItems.forEach((element, index) => {
            const lastElement = hiddenItems.length - 1 == index;
            element.classList.add(classes.isHiding);
            const removeHidingClass = () => {
              element.classList.remove(classes.isHiding);
              if (parseInt(this.pane.getAttribute(selectors.sliderulePane)) !== oldPosition) {
                element.classList.add(classes.isHidden);
              }

              if (lastElement) {
                this.trapFocusSliderule();
              }
              element.removeEventListener('animationend', removeHidingClass);
            };

            if (window.theme.settings.enableAnimations) {
              element.addEventListener('animationend', removeHidingClass);
            } else {
              removeHidingClass();
            }
          });
        }
      }

      closeSliderule() {
        if (this.pane && this.pane.hasAttribute(selectors.sliderulePane) && parseInt(this.pane.getAttribute(selectors.sliderulePane)) > 0) {
          this.hideSliderule(true);
          if (parseInt(this.pane.getAttribute(selectors.sliderulePane)) > 0) {
            this.pane.setAttribute(selectors.sliderulePane, 0);
          }
        }
      }

      disconnectedCallback() {
        document.removeEventListener('theme:sliderule:close', this.closeSliderule);
      }
    }
  );
}
