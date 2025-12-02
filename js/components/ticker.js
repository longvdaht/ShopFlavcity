const selectors = {
  frame: '[data-ticker-frame]',
  scale: '[data-ticker-scale]',
  text: '[data-ticker-text]',
  clone: 'data-clone',
};

const attributes = {
  autoplay: 'autoplay',
  speed: 'speed',
};

const classes = {
  animation: 'ticker--animated',
  unloaded: 'ticker--unloaded',
  comparitor: 'ticker__comparitor',
};

const settings = {
  speed: 1.63, // 100px going to move for 1.63s
  space: 100, // 100px
};

if (!customElements.get('ticker-bar')) {
  customElements.define(
    'ticker-bar',

    class Ticker extends HTMLElement {
      constructor() {
        super();

        this.autoplay = this.hasAttribute(attributes.autoplay);
        this.scale = this.querySelector(selectors.scale);
        this.text = this.querySelector(selectors.text);
        this.speed = this.hasAttribute(attributes.speed) ? this.getAttribute(attributes.speed) : settings.speed;
        this.comparitor = this.text.cloneNode(true);
        this.comparitor.classList.add(classes.comparitor);
        this.appendChild(this.comparitor);
        this.scale.classList.remove(classes.unloaded);
        this.checkWidthEvent = this.checkWidth.bind(this);
      }

      connectedCallback() {
        this.checkWidth();
        this.addEventListener(
          'theme:ticker:refresh',
          window.theme.debounce(() => this.checkWidthEvent(), 50)
        );

        screen.orientation.addEventListener('change', this.checkWidthEvent);
        document.addEventListener('theme:resize:width', this.checkWidthEvent);
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize:width', this.checkWidthEvent);
      }

      checkWidth() {
        this.text = this.querySelector(selectors.text);

        const padding = window.getComputedStyle(this).paddingLeft.replace('px', '') * 2;
        const isOverflowing = this.clientWidth - padding < this.comparitor.clientWidth;

        if (isOverflowing || this.autoplay) {
          this.text.classList.remove(classes.animation);

          const clones = this.scale.querySelectorAll(`[${selectors.clone}]`);
          const limitClones = this.autoplay ? parseInt((window.innerWidth - padding) / this.text.clientWidth) : 2;

          // Remove old clones
          clones?.forEach((item) => {
            item.remove();
          });

          if (this.autoplay || isOverflowing) {
            for (let index = 0; index <= limitClones; index++) {
              const cloneSecond = this.text.cloneNode(true);
              cloneSecond.setAttribute(selectors.clone, '');
              this.scale.appendChild(cloneSecond);
            }
          }

          const animationTimeFrame = ((this.text.clientWidth / settings.space) * Number(this.speed)).toFixed(2);

          this.scale.style.removeProperty('--animation-time');
          this.scale.style.setProperty('--animation-time', `${animationTimeFrame}s`);

          this.scale.querySelectorAll(selectors.text)?.forEach((text) => {
            text.classList.add(classes.animation);
          });
        } else {
          this.text.classList.add(classes.animation);
          const clones = this.scale.querySelectorAll(`[${selectors.clone}]`);

          clones.forEach((clone) => {
            clone.parentNode.removeChild(clone);
          });

          this.text.classList.remove(classes.animation);
        }
      }
    }
  );
}
