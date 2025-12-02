const selectors = {
  sectionId: '[data-section-id]',
  tooltip: 'data-tooltip',
  tooltipStopMouseEnter: 'data-tooltip-stop-mouseenter',
};

const classes = {
  tooltipDefault: 'tooltip-default',
  visible: 'is-visible',
  hiding: 'is-hiding',
};

if (!customElements.get('tooltip-component')) {
  customElements.define(
    'tooltip-component',
    class Tooltip extends HTMLElement {
      constructor() {
        super();

        this.label = this.hasAttribute(selectors.tooltip) ? this.getAttribute(selectors.tooltip) : '';
        this.transitionSpeed = 200;
        this.hideTransitionTimeout = 0;
        this.addPinEvent = () => this.addPin();
        this.addPinMouseEvent = () => this.addPin(true);
        this.removePinEvent = (event) => window.theme.throttle(this.removePin(event), 50);
        this.removePinMouseEvent = (event) => this.removePin(event, true, true);
      }

      connectedCallback() {
        if (!document.querySelector(`.${classes.tooltipDefault}`)) {
          const tooltipTemplate = `<div class="${classes.tooltipDefault}__arrow"></div><div class="${classes.tooltipDefault}__inner"><div class="${classes.tooltipDefault}__text"></div></div>`;
          const tooltipElement = document.createElement('div');
          tooltipElement.className = classes.tooltipDefault;
          tooltipElement.innerHTML = tooltipTemplate;
          document.body.appendChild(tooltipElement);
        }

        this.addEventListener('mouseenter', this.addPinMouseEvent);
        this.addEventListener('mouseleave', this.removePinMouseEvent);
        this.addEventListener('theme:tooltip:init', this.addPinEvent);
        document.addEventListener('theme:tooltip:close', this.removePinEvent);
      }

      addPin(stopMouseEnter = false) {
        const tooltipTarget = document.querySelector(`.${classes.tooltipDefault}`);

        const section = this.closest(selectors.sectionId);
        const colorSchemeClass = Array.from(section.classList).find((cls) => cls.startsWith('color-scheme-'));
        tooltipTarget?.classList.add(colorSchemeClass); // add the section's color scheme class to the tooltip

        if (this.label && tooltipTarget && ((stopMouseEnter && !this.hasAttribute(selectors.tooltipStopMouseEnter)) || !stopMouseEnter)) {
          const tooltipTargetArrow = tooltipTarget.querySelector(`.${classes.tooltipDefault}__arrow`);
          const tooltipTargetInner = tooltipTarget.querySelector(`.${classes.tooltipDefault}__inner`);
          const tooltipTargetText = tooltipTarget.querySelector(`.${classes.tooltipDefault}__text`);
          tooltipTargetText.innerHTML = this.label;

          const tooltipTargetWidth = tooltipTargetInner.offsetWidth;
          const tooltipRect = this.getBoundingClientRect();
          const tooltipTop = tooltipRect.top;
          const tooltipWidth = tooltipRect.width;
          const tooltipHeight = tooltipRect.height;
          const tooltipTargetPositionTop = tooltipTop + tooltipHeight + window.scrollY;
          let tooltipTargetPositionLeft = tooltipRect.left - tooltipTargetWidth / 2 + tooltipWidth / 2;
          const tooltipLeftWithWidth = tooltipTargetPositionLeft + tooltipTargetWidth;
          const sideOffset = 24;
          const tooltipTargetWindowDifference = tooltipLeftWithWidth - window.theme.getWindowWidth() + sideOffset;

          if (tooltipTargetWindowDifference > 0) {
            tooltipTargetPositionLeft -= tooltipTargetWindowDifference;
          }

          if (tooltipTargetPositionLeft < 0) {
            tooltipTargetPositionLeft = 0;
          }

          tooltipTargetArrow.style.left = `${tooltipRect.left + tooltipWidth / 2}px`;
          tooltipTarget.style.setProperty('--tooltip-top', `${tooltipTargetPositionTop}px`);

          tooltipTargetInner.style.transform = `translateX(${tooltipTargetPositionLeft}px)`;
          tooltipTarget.classList.remove(classes.hiding);
          tooltipTarget.classList.add(classes.visible);

          document.addEventListener('theme:scroll', this.removePinEvent);
        }
      }

      removePin(event, stopMouseEnter = false, hideTransition = false) {
        const tooltipTarget = document.querySelector(`.${classes.tooltipDefault}`);
        const tooltipVisible = tooltipTarget.classList.contains(classes.visible);

        if (tooltipTarget && ((stopMouseEnter && !this.hasAttribute(selectors.tooltipStopMouseEnter)) || !stopMouseEnter)) {
          if (tooltipVisible && (hideTransition || event.detail.hideTransition)) {
            tooltipTarget.classList.add(classes.hiding);

            if (this.hideTransitionTimeout) {
              clearTimeout(this.hideTransitionTimeout);
            }

            this.hideTransitionTimeout = setTimeout(() => {
              tooltipTarget.classList.remove(classes.hiding);
            }, this.transitionSpeed);
          }

          tooltipTarget.classList.remove(classes.visible);

          document.removeEventListener('theme:scroll', this.removePinEvent);
        }
      }

      disconnectedCallback() {
        this.removeEventListener('mouseenter', this.addPinMouseEvent);
        this.removeEventListener('mouseleave', this.removePinMouseEvent);
        this.removeEventListener('theme:tooltip:init', this.addPinEvent);
        document.removeEventListener('theme:tooltip:close', this.removePinEvent);
        document.removeEventListener('theme:scroll', this.removePinEvent);
      }
    }
  );
}
