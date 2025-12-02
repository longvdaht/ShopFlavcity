(function () {
  'use strict';

  const selectors = {
    rows: '[data-timeline-rows]',
    row: '[data-timeline-row]',
    rowEditor: '[data-timeline-row-editor]',
    button: '[data-timeline-button]',
    scrollElement: '[data-block-scroll]',
    headerSticky: '[data-header-sticky]',
    headerHeight: '[data-header-height]',
  };

  const classes = {
    selected: 'is-selected',
  };

  if (!customElements.get('timeline-component')) {
    customElements.define(
      'timeline-component',
      class Timeline extends HTMLElement {
        constructor() {
          super();

          this.rows = this.querySelectorAll(selectors.row);

          if (this.rows.length < 2) return;

          this.rowsWidth = 0;
          this.rowsHeight = [];
          this.holderTop = this.getBoundingClientRect().top + window.scrollY;
          this.holderHeight = this.offsetHeight;
          this.buttons = this.querySelectorAll(selectors.button);
          this.rowsHolder = this.querySelector(selectors.rows);
          this.requestAnimation = null;
          this.isDesktopView = !window.theme.isMobile();
          this.isScrollEnabled = false;

          this.scrollEvent = (e) => this.scrollEvents(e);
          this.resizeEvent = () => this.resizeEvents();
        }

        connectedCallback() {
          this.calculateRowsDimensions();
          this.requestAnimation = requestAnimationFrame(() => this.calculatePosition());
          if (this.isDesktopView && !this.isScrollEnabled) {
            this.isScrollEnabled = true;
            document.addEventListener('theme:scroll', this.scrollEvent);
          }
          this.rowsHolder.addEventListener('scroll', this.scrollEvent);
          document.addEventListener('theme:resize:width', this.resizeEvent);

          if (this.buttons.length) {
            this.buttons.forEach((button, index) => {
              button.addEventListener('click', (e) => {
                e.preventDefault();
                const row = e.currentTarget.closest(selectors.row);
                if (!row) return;

                if (!window.theme.isMobile()) {
                  const hightestRow = Math.max(...this.rowsHeight);
                  const rowHeight = this.holderHeight / this.rows.length;
                  const holderTop = this.getBoundingClientRect().top;
                  const elementPosition = index > 0 && hightestRow < rowHeight ? rowHeight * index + holderTop : holderTop;
                  const scrollPosition = elementPosition + 1;
                  window.theme.scrollTo(scrollPosition);
                } else {
                  const padding = 16;
                  const holderLeft = row.offsetLeft - padding;

                  this.rowsHolder.scrollTo({
                    left: holderLeft,
                    behavior: 'smooth',
                  });
                }
              });
            });
          }
        }

        resizeEvents() {
          this.holderTop = this.getBoundingClientRect().top + window.scrollY;
          this.holderHeight = this.offsetHeight;
          this.calculateRowsDimensions();
          this.requestAnimation = requestAnimationFrame(() => this.calculatePosition());
          const isDesktopView = !window.theme.isMobile();

          if (isDesktopView && !this.isScrollEnabled) {
            this.isScrollEnabled = true;
            document.addEventListener('theme:scroll', this.scrollEvent);
          } else if (!isDesktopView && this.isScrollEnabled) {
            this.isScrollEnabled = false;
            document.removeEventListener('theme:scroll', this.scrollEvent);
          }
        }

        scrollEvents(e) {
          if (!this.requestAnimation) {
            const currentTarget = e.currentTarget;
            this.requestAnimation = requestAnimationFrame(() => this.calculatePosition(currentTarget));
          }
        }

        removeAnimationFrame() {
          if (this.requestAnimation) {
            cancelAnimationFrame(this.requestAnimation);
            this.requestAnimation = null;
          }
        }

        calculateRowsDimensions() {
          if (this.rows.length) {
            this.rowsHeight = [];
            this.rowsWidth = 0;
            let prevRowsHeight = 0;
            this.rows.forEach((row, index) => {
              this.rowsHeight.push(row.offsetHeight);
              this.rowsWidth += row.offsetWidth + parseInt(getComputedStyle(row).marginRight);

              if (window.Shopify.designMode) {
                const rowsEditor = this.querySelectorAll(selectors.rowEditor);
                if (rowsEditor.length) {
                  prevRowsHeight += row.offsetHeight;
                  rowsEditor[index]?.style.setProperty('--row-height-min', `${row.offsetHeight}px`);
                  rowsEditor[index + 1]?.style.setProperty('--row-top-mobile', `${prevRowsHeight}px`);
                }
              }
            });
          }
        }

        calculatePosition(target = null) {
          this.removeAnimationFrame();
          this.holderTop = this.getBoundingClientRect().top + window.scrollY;
          const isDesktopView = !window.theme.isMobile();
          const elementHeight = this.holderHeight / this.rows.length;
          let elementsTop = this.holderTop;
          const windowHeight = window.innerHeight;
          const windowMiddle = window.scrollY + windowHeight * 1.5;
          const outerSpace = 16; // wrapper padding using --outer CSS variable
          let mobilePercent = 0;

          if (!isDesktopView && target) {
            const targetScrollLeft = target.scrollLeft - outerSpace;
            const targetWidth = target.offsetWidth;
            mobilePercent = (targetScrollLeft / (this.rowsWidth - targetWidth)) * 100;
            this.style.setProperty('--percent-mobile', `${mobilePercent}%`);
          }

          if (isDesktopView && (windowMiddle < this.holderTop || windowMiddle > this.holderTop + this.holderHeight + windowHeight)) return;

          this.rows.forEach((row, index) => {
            if (index > 0) {
              const percentRowPosition = (row.offsetLeft / this.rowsWidth) * 100;
              let selectedCheck = mobilePercent > percentRowPosition;

              if (isDesktopView) {
                selectedCheck = elementsTop + elementHeight < windowMiddle;

                if (elementsTop - elementHeight < windowMiddle) {
                  row.previousElementSibling?.style.setProperty('--percent-desktop', `${((windowMiddle - elementsTop) / elementHeight) * 100}%`);
                }
              }

              row.classList.toggle(classes.selected, selectedCheck);
            }

            elementsTop += elementHeight;
          });
        }

        disconnectedCallback() {
          if (this.isScrollEnabled) {
            this.isScrollEnabled = false;
            document.removeEventListener('theme:scroll', this.scrollEvent);
          }
          this.rowsHolder.removeEventListener('scroll', this.scrollEvent);
          document.removeEventListener('theme:resize:width', this.resizeEvent);
        }

        onBlockSelect(evt) {
          const scrollElement = this.querySelector(selectors.scrollElement);
          if (scrollElement) {
            const target = evt.srcElement;
            const targetIndex = [...target.parentElement.children].indexOf(target);
            const row = this.rows[targetIndex];
            if (row) {
              scrollElement.scrollTo({
                top: 0,
                left: row.offsetLeft,
                behavior: 'smooth',
              });
            }
          }
        }
      }
    );
  }

})();
//# sourceMappingURL=timeline.js.map
