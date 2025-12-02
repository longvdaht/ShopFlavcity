const selectors = {
  flickityButton: '.flickity-prev-next-button',
  productLink: '[data-product-link]',
  slide: '[data-hover-slide]',
  slideTouch: '[data-hover-slide-touch]',
  slider: '[data-hover-slider]',
  video: 'video',
  vimeo: '[data-host="vimeo"]',
  youtube: '[data-host="youtube"]',
};

class HoverImages extends HTMLElement {
  constructor() {
    super();

    this.flkty = null;
    this.slider = this.querySelector(selectors.slider);
    this.handleScroll = this.handleScroll.bind(this);
    this.hovered = false;

    this.mouseEnterEvent = () => this.mouseEnterActions();
    this.mouseLeaveEvent = () => this.mouseLeaveActions();

    this.addEventListener('mouseenter', this.mouseEnterEvent);
    this.addEventListener('mouseleave', this.mouseLeaveEvent);
  }

  connectedCallback() {
    if (window.theme.touch) {
      this.initTouch();
    } else {
      this.initFlickity();
    }
  }

  disconnectedCallback() {
    if (this.flkty) {
      this.flkty.options.watchCSS = false;
      this.flkty.destroy();
    }

    this.removeEventListener('mouseenter', this.mouseEnterEvent);
    this.removeEventListener('mouseleave', this.mouseLeaveEvent);
  }

  initTouch() {
    this.style.setProperty('--slides-count', this.querySelectorAll(selectors.slideTouch).length);
    this.slider.addEventListener('scroll', this.handleScroll);
  }

  handleScroll() {
    const slideIndex = this.slider.scrollLeft / this.slider.clientWidth;
    this.style.setProperty('--slider-index', slideIndex);
  }

  initFlickity() {
    if (this.querySelectorAll(selectors.slide).length < 2) return;

    this.flkty = new window.theme.Flickity(this.slider, {
      cellSelector: selectors.slide,
      contain: true,
      wrapAround: true,
      watchCSS: true,
      autoPlay: false,
      draggable: false,
      pageDots: false,
      prevNextButtons: true,
    });

    this.flkty.pausePlayer();

    this.addEventListener('mouseenter', () => {
      this.flkty.unpausePlayer();
    });

    this.addEventListener('mouseleave', () => {
      this.flkty.pausePlayer();
    });

    // Prevent page redirect on Flickity arrow click
    this.closest(selectors.productLink).addEventListener('click', (e) => {
      if (e.target.matches(selectors.flickityButton)) {
        e.preventDefault();
      }
    });
  }

  mouseEnterActions() {
    this.hovered = true;

    this.videoActions();
  }

  mouseLeaveActions() {
    this.hovered = false;

    this.videoActions();
  }

  videoActions() {
    const youtube = this.querySelector(selectors.youtube);
    const vimeo = this.querySelector(selectors.vimeo);
    const mediaExternal = youtube || vimeo;
    const mediaNative = this.querySelector(selectors.video);

    if (mediaExternal) {
      let action = this.hovered ? 'playVideo' : 'pauseVideo';
      let string = `{"event":"command","func":"${action}","args":""}`;

      if (vimeo) {
        action = this.hovered ? 'play' : 'pause';
        string = `{"method":"${action}"}`;
      }

      mediaExternal.contentWindow.postMessage(string, '*');

      mediaExternal.addEventListener('load', (e) => {
        // Call videoActions() again when iframe is loaded to prevent autoplay being triggered if it loads after the "mouseleave" event
        this.videoActions();
      });
    } else if (mediaNative) {
      if (this.hovered) {
        mediaNative.play();
      } else {
        mediaNative.pause();
      }
    }
  }
}

export {HoverImages};
