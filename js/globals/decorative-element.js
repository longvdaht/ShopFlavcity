class DecorativeElement extends HTMLElement {
  constructor() {
    super();
    this.animationLayout = this.dataset?.animationLayout || 'desktop';
    this.animationElement = this.querySelector('[data-animation-element]');
    this.scrollAnimation = this.dataset?.scrollAnimation || 'none';
    this.scrollDirection = this.dataset?.scrollDirection || 'down';
    this.rotateEffect = this.dataset?.rotateEffect === 'true';
    this.rotateFrom = this.dataset?.rotateEffectFrom;
    this.rotateTo = this.dataset?.rotateEffectTo;
    this.scrollPercentage = parseFloat(this.dataset?.scrollPercentage || '0');

    if (!this.animationElement) return;
    this.init();
  }

  init() {
    if (this.scrollAnimation !== 'none') {
      this.setupScrollAnimation();
    }
  }

  setupScrollAnimation() {
    this.viewportHeight = window.innerHeight;
    this.boundHandleScroll = this.handleScroll.bind(this);
    this.boundHandleResize = this.handleResize.bind(this);

    window.addEventListener('scroll', this.boundHandleScroll, {passive: true});
    window.addEventListener('resize', this.boundHandleResize);

    this.handleScroll();
  }

  handleResize() {
    this.viewportHeight = window.innerHeight;
    this.handleScroll();
  }

  handleScroll() {
    const currentScroll = window.scrollY;
    const elementRect = this.getBoundingClientRect();
    const elementTop = elementRect.top + window.scrollY;

    if (currentScroll < elementRect.top || currentScroll === 0) {
      this.resetTransform();
      return;
    }

    if (!this.isInViewport()) {
      return;
    }


    const scrollStart = elementTop - this.viewportHeight;
    const scrollDistance = elementRect.height + this.viewportHeight;
    let scrollProgress = Math.min(Math.max((currentScroll - scrollStart) / scrollDistance, 0), 1);
    this.updateScrollTransform(scrollProgress);
  }

  isInViewport() {
    const rect = this.getBoundingClientRect();
    return (rect.bottom >= -100 && rect.top <= window.innerHeight + 100);
  }

  resetTransform() {
    if (this.animationElement) {
      this.animationElement.style.transform = '';
    }
  }

  updateScrollTransform(progress) {
    if (!this.animationElement) return;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.animationFrameId = requestAnimationFrame(() => {
      let translateValue = Math.round((this.scrollPercentage * progress) / 5) * 5;
      let translateX = 0;
      let translateY = 0;
      let rotate = '';
      const direction = this.scrollDirection || 'down';
      const rotateFrom = parseFloat(this.rotateFrom);
      const rotateTo = parseFloat(this.rotateTo);
      const currentDeg = rotateFrom + (rotateTo - rotateFrom) * progress;

      if (direction.includes('up')) {
        translateY = -translateValue;
      } else if (direction.includes('down')) {
        translateY = translateValue;
      }

      if (direction.includes('left')) {
        translateX = -translateValue;
        if (this.rotateEffect && this.rotateFrom === this.rotateTo) {
          rotate = `scale(1.1) rotate(${this.rotateFrom}deg)`;
        } else if (this.rotateEffect && this.rotateFrom !== this.rotateTo){
          rotate = `scale(1) rotate(${currentDeg}deg)`;
        }
      } else if (direction.includes('right')) {
        translateX = translateValue;
        if (this.rotateEffect && this.rotateFrom === this.rotateTo) {
          rotate = `scale(1.1) rotate(${this.rotateTo}deg)`;
        } else if (this.rotateEffect && this.rotateFrom !== this.rotateTo){
          rotate = `scale(1) rotate(${currentDeg}deg)`;
        }
      }


      if ((direction.includes('up') || direction.includes('down')) &&
          (direction.includes('left') || direction.includes('right'))) {
        translateX = translateX * 0.7071;
        translateY = translateY * 0.7071;
      }

      this.animationElement.style.transform = `translate(${translateX}%, ${translateY}%) ${rotate}`;
    });
  }

  disconnectedCallback() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.scrollAnimation !== 'none') {
      window.removeEventListener('scroll', this.boundHandleScroll);
      window.removeEventListener('resize', this.boundHandleResize);
    }
  }
}

if (!customElements.get('decorative-element')) {
  customElements.define('decorative-element', DecorativeElement);
}