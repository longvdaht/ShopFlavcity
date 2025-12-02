const classes = {
  dragging: 'is-dragging',
  enabled: 'is-enabled',
  scrolling: 'is-scrolling',
  visible: 'is-visible',
};

const selectors = {
  image: 'img, svg',
  productImage: '[data-product-image]',
  slide: '[data-grid-item]',
  slider: '[data-grid-slider]',
};

export class DraggableSlider {
  constructor(sliderElement) {
    this.slider = sliderElement;
    this.isDown = false;
    this.startX = 0;
    this.scrollLeft = 0;
    this.velX = 0;
    this.scrollAnimation = null;
    this.isScrolling = false;
    this.duration = 800; // Change this value if you want to increase or decrease the velocity

    this.scrollStep = this.scrollStep.bind(this);
    this.scrollToSlide = this.scrollToSlide.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseWheel = this.handleMouseWheel.bind(this);

    this.slider.addEventListener('mousedown', this.handleMouseDown);
    this.slider.addEventListener('mouseleave', this.handleMouseLeave);
    this.slider.addEventListener('mouseup', this.handleMouseUp);
    this.slider.addEventListener('mousemove', this.handleMouseMove);
    this.slider.addEventListener('wheel', this.handleMouseWheel, {passive: true});

    this.slider.classList.add(classes.enabled);
  }

  handleMouseDown(e) {
    e.preventDefault();
    this.isDown = true;
    this.startX = e.pageX - this.slider.offsetLeft;
    this.scrollLeft = this.slider.scrollLeft;
    this.cancelMomentumTracking();
  }

  handleMouseLeave() {
    if (!this.isDown) return;
    this.isDown = false;
    this.beginMomentumTracking();
  }

  handleMouseUp() {
    this.isDown = false;
    this.beginMomentumTracking();
  }

  handleMouseMove(e) {
    if (!this.isDown) return;
    e.preventDefault();

    const x = e.pageX - this.slider.offsetLeft;
    const ratio = 1; // Increase the number to make it scroll-fast
    const walk = (x - this.startX) * ratio;
    const prevScrollLeft = this.slider.scrollLeft;
    const direction = walk > 0 ? 1 : -1;

    this.slider.classList.add(classes.dragging, classes.scrolling);
    this.slider.scrollLeft = this.scrollLeft - walk;

    if (this.slider.scrollLeft !== prevScrollLeft) {
      this.velX = this.slider.scrollLeft - prevScrollLeft || direction;
    }
  }

  handleMouseWheel() {
    this.cancelMomentumTracking();
    this.slider.classList.remove(classes.scrolling);
  }

  beginMomentumTracking() {
    this.isScrolling = false;
    this.slider.classList.remove(classes.dragging);
    this.cancelMomentumTracking();
    this.scrollToSlide();
  }

  cancelMomentumTracking() {
    cancelAnimationFrame(this.scrollAnimation);
  }

  scrollToSlide() {
    if (!this.velX && !this.isScrolling) return;

    const slide = this.slider.querySelector(`${selectors.slide}.${classes.visible}`);
    if (!slide) return;

    const gap = parseInt(window.getComputedStyle(slide).marginRight) || 0;
    const slideWidth = slide.offsetWidth + gap;
    const targetPosition = slide.offsetLeft;
    const direction = this.velX > 0 ? 1 : -1;
    const slidesToScroll = Math.floor(Math.abs(this.velX) / 100) || 1;

    this.startPosition = this.slider.scrollLeft;
    this.distance = targetPosition - this.startPosition;
    this.startTime = performance.now();
    this.isScrolling = true;

    // Make sure it will move to the next slide if you don't drag far enough
    if (direction < 0 && this.velX < slideWidth) {
      this.distance -= slideWidth * slidesToScroll;
    }

    // Make sure it will move to the previous slide if you don't drag far enough
    if (direction > 0 && this.velX < slideWidth) {
      this.distance += slideWidth * slidesToScroll;
    }

    // Run scroll animation
    this.scrollAnimation = requestAnimationFrame(this.scrollStep);
  }

  scrollStep() {
    const currentTime = performance.now() - this.startTime;
    const scrollPosition = parseFloat(this.easeOutCubic(Math.min(currentTime, this.duration))).toFixed(1);

    this.slider.scrollLeft = scrollPosition;

    if (currentTime < this.duration) {
      this.scrollAnimation = requestAnimationFrame(this.scrollStep);
    } else {
      this.slider.classList.remove(classes.scrolling);

      // Reset velocity
      this.velX = 0;
      this.isScrolling = false;
    }
  }

  easeOutCubic(t) {
    t /= this.duration;
    t--;
    return this.distance * (t * t * t + 1) + this.startPosition;
  }

  destroy() {
    this.slider.classList.remove(classes.enabled);
    this.slider.removeEventListener('mousedown', this.handleMouseDown);
    this.slider.removeEventListener('mouseleave', this.handleMouseLeave);
    this.slider.removeEventListener('mouseup', this.handleMouseUp);
    this.slider.removeEventListener('mousemove', this.handleMouseMove);
    this.slider.removeEventListener('wheel', this.handleMouseWheel);
  }
}

export default DraggableSlider;
