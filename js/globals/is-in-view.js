/*
  Observe whether or not elements are visible in their container.
  Used for sections with horizontal sliders built by native scrolling
*/

const classes = {
  visible: 'is-visible',
};

export class IsInView {
  constructor(container, itemSelector) {
    if (!container || !itemSelector) return;

    this.observer = null;
    this.container = container;
    this.itemSelector = itemSelector;

    this.init();
  }

  init() {
    const options = {
      root: this.container,
      threshold: [0.01, 0.5, 0.75, 0.99],
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio >= 0.99) {
          entry.target.classList.add(classes.visible);
        } else {
          entry.target.classList.remove(classes.visible);
        }
      });
    }, options);

    this.container.querySelectorAll(this.itemSelector)?.forEach((item) => {
      this.observer.observe(item);
    });
  }

  destroy() {
    this.observer.disconnect();
  }
}
