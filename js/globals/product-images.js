const selectors = {
  buttonArrow: '[data-button-arrow]',
  deferredMediaButton: '[data-deferred-media-button]',
  focusedElement: 'model-viewer, video, iframe, button, [href], input, [tabindex]',
  productMedia: '[data-image-id]',
  productMediaList: '[data-product-media-list]',
  section: '[data-section-type]',
  // thumbs: '[data-product-thumbs]',
};

const classes = {
  arrows: 'slider__arrows',
  dragging: 'is-dragging',
  hidden: 'hidden',
  isFocused: 'is-focused',
  mediaActive: 'media--active',
  mediaHidden: 'media--hidden',
  mediaHiding: 'media--hiding',
};

const attributes = {
  activeMedia: 'data-active-media',
  buttonPrev: 'data-button-prev',
  buttonNext: 'data-button-next',
  imageId: 'data-image-id',
  mediaId: 'data-media-id',
  type: 'data-type',
  faderDesktop: 'data-fader-desktop',
  faderMobile: 'data-fader-mobile',
};

if (!customElements.get('product-images')) {
  customElements.define(
    'product-images',
    class ProductImages extends HTMLElement {
      constructor() {
        super();

        this.initialized = false;
        this.buttons = false;
        this.isDown = false;
        this.startX = 0;
        this.startY = 0;
        this.scrollLeft = 0;
        this.onButtonArrowClick = (e) => this.buttonArrowClickEvent(e);
        this.container = this.closest(selectors.section);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.productMediaItems = this.querySelectorAll(selectors.productMedia);
        this.productMediaList = this.querySelector(selectors.productMediaList);
        this.setHeight = this.setHeight.bind(this);
        this.toggleEvents = this.toggleEvents.bind(this);
        this.selectMediaEvent = (e) => this.showMediaOnVariantSelect(e);

        this.isProgrammaticScroll = false;      // блокуємо реакцію на власний скрол
        this.onScroll = this.onScroll.bind(this);
        this.onScrollEnd = this.onScrollEnd.bind(this);
        this.scrollEndTimer = null;
        // this.thumbs = document.querySelector(selectors.thumbs);
      }

      connectedCallback() {
        if (Object.keys(this.productMediaItems).length <= 1) return;

        this.productMediaObserver();
        this.toggleEvents();
        this.listen();
        this.setHeight();

        // setTimeout(() => {
        //   console.log(1,this.thumbs);
        //   // this.selectMedia('template--19389511598312__main-36848874225896')
        //   // this.thumbs?.setAttribute('data-active-media', 'template--19389511598312__main-36848874225896');
        //
        //   this.setActiveMedia('template--19389511598312__main-36848874225896');
        // }, 5000);
      }

      disconnectedCallback() {
        this.unlisten();
      }

      listen() {
        document.addEventListener('theme:resize:width', this.toggleEvents);
        document.addEventListener('theme:resize:width', this.setHeight);
        this.addEventListener('theme:media:select', this.selectMediaEvent);
      }

      unlisten() {
        document.removeEventListener('theme:resize:width', this.toggleEvents);
        document.removeEventListener('theme:resize:width', this.setHeight);
        this.removeEventListener('theme:media:select', this.selectMediaEvent);
      }

      toggleEvents() {
        const isMobileView = window.theme.isMobile();

        if ((isMobileView && this.hasAttribute(attributes.faderMobile)) || (!isMobileView && this.hasAttribute(attributes.faderDesktop))) {
          this.bindEventListeners();
        } else {
          this.unbindEventListeners();
        }
      }

      bindEventListeners() {
        if (this.initialized) return;

        this.productMediaList.addEventListener('mousedown', this.handleMouseDown);
        this.productMediaList.addEventListener('mouseleave', this.handleMouseLeave);
        this.productMediaList.addEventListener('mouseup', this.handleMouseUp);
        this.productMediaList.addEventListener('mousemove', this.handleMouseMove);
        this.productMediaList.addEventListener('touchstart', this.handleMouseDown, {passive: true});
        this.productMediaList.addEventListener('touchend', this.handleMouseUp, {passive: true});
        this.productMediaList.addEventListener('touchmove', this.handleMouseMove, {passive: true});
        this.productMediaList.addEventListener('keyup', this.handleKeyUp);
        this.productMediaList.addEventListener('scroll', this.onScroll, { passive: true });
        this.initArrows();
        this.resetScrollPosition();

        this.initialized = true;
      }

      unbindEventListeners() {
        if (!this.initialized) return;

        this.productMediaList.removeEventListener('mousedown', this.handleMouseDown);
        this.productMediaList.removeEventListener('mouseleave', this.handleMouseLeave);
        this.productMediaList.removeEventListener('mouseup', this.handleMouseUp);
        this.productMediaList.removeEventListener('mousemove', this.handleMouseMove);
        this.productMediaList.removeEventListener('touchstart', this.handleMouseDown);
        this.productMediaList.removeEventListener('touchend', this.handleMouseUp);
        this.productMediaList.removeEventListener('touchmove', this.handleMouseMove);
        this.productMediaList.removeEventListener('keyup', this.handleKeyUp);
        this.productMediaList.removeEventListener('scroll', this.onScroll);

        this.removeArrows();

        this.initialized = false;
      }

      handleMouseDown(e) {
        this.isDown = true;
        this.startX = (e.pageX || e.changedTouches[0].screenX) - this.offsetLeft;
        this.startY = (e.pageY || e.changedTouches[0].screenY) - this.offsetTop;
      }

      handleMouseLeave() {
        if (!this.isDown) return;
        this.isDown = false;
      }

      handleMouseUp(e) {
        const x = (e.pageX || e.changedTouches[0].screenX) - this.offsetLeft;
        const y = (e.pageY || e.changedTouches[0].screenY) - this.offsetTop;
        const distanceX = x - this.startX;
        const distanceY = y - this.startY;
        const direction = distanceX > 0 ? 1 : -1;
        const isImage = this.getCurrentMedia().hasAttribute(attributes.type) && this.getCurrentMedia().getAttribute(attributes.type) === 'image';

        if (Math.abs(distanceX) > 10 && Math.abs(distanceX) > Math.abs(distanceY) && isImage) {
          direction < 0 ? this.showNextImage() : this.showPreviousImage();
        }

        this.isDown = false;

        requestAnimationFrame(() => {
          this.classList.remove(classes.dragging);
        });
      }

      handleMouseMove() {
        if (!this.isDown) return;

        this.classList.add(classes.dragging);
      }

      handleKeyUp(e) {
        if (e.code === 'ArrowLeft') {
          this.showPreviousImage();
        }

        if (e.code === 'ArrowRight') {
          this.showNextImage();
        }
      }

      handleArrowsClickEvent() {
        this.querySelectorAll(selectors.buttonArrow)?.forEach((button) => {
          button.addEventListener('click', (e) => {
            e.preventDefault();

            if (e.target.hasAttribute(attributes.buttonPrev)) {
              this.showPreviousImage();
            }

            if (e.target.hasAttribute(attributes.buttonNext)) {
              this.showNextImage();
            }
          });
        });
      }

      // When changing from Mobile do Desktop view
      resetScrollPosition() {
        if (this.productMediaList.scrollLeft !== 0) {
          this.productMediaList.scrollLeft = 0;
        }
      }

      initArrows() {
        // Create arrow buttons if don't exist
        if (!this.buttons.length) {
          const buttonsWrap = document.createElement('div');
          buttonsWrap.classList.add(classes.arrows);
          buttonsWrap.innerHTML = theme.sliderArrows.prev + theme.sliderArrows.next;

          // Append buttons outside the slider element
          this.productMediaList.append(buttonsWrap);
          this.buttons = this.querySelectorAll(selectors.buttonArrow);
          this.buttonPrev = this.querySelector(`[${attributes.buttonPrev}]`);
          this.buttonNext = this.querySelector(`[${attributes.buttonNext}]`);
        }

        this.handleArrowsClickEvent();
        this.preloadImageOnArrowHover();
      }

      removeArrows() {
        this.querySelector(`.${classes.arrows}`)?.remove();
      }

      preloadImageOnArrowHover() {
        this.buttonPrev?.addEventListener('mouseover', () => {
          const id = this.getPreviousMediaId();
          this.preloadImage(id);
        });

        this.buttonNext?.addEventListener('mouseover', () => {
          const id = this.getNextMediaId();
          this.preloadImage(id);
        });
      }

      preloadImage(id) {
        this.querySelector(`[${attributes.mediaId}="${id}"] img`)?.setAttribute('loading', 'eager');
      }

      showMediaOnVariantSelect(e) {
        const id = e.detail.id;
        this.setActiveMedia(id);
      }

      getCurrentMedia() {
        return this.querySelector(`${selectors.productMedia}.${classes.mediaActive}`);
      }

      getNextMediaId() {
        const currentMedia = this.getCurrentMedia();
        const nextMedia = currentMedia?.nextElementSibling.hasAttribute(attributes.imageId) ? currentMedia?.nextElementSibling : this.querySelector(selectors.productMedia);

        return nextMedia?.getAttribute(attributes.mediaId);
      }

      getPreviousMediaId() {
        const currentMedia = this.getCurrentMedia();
        const lastIndex = this.productMediaItems.length - 1;
        const previousMedia = currentMedia?.previousElementSibling || this.productMediaItems[lastIndex];

        return previousMedia?.getAttribute(attributes.mediaId);
      }

      showNextImage() {
        const id = this.getNextMediaId();
        this.selectMedia(id);
      }

      showPreviousImage() {
        const id = this.getPreviousMediaId();
        this.selectMedia(id);
      }

      selectMedia(id) {
        this.dispatchEvent(
          new CustomEvent('theme:media:select', {
            detail: {
              id: id,
            },
          })
        );
      }

      setActiveMedia(id, opts = {}) {
        if (!id) return;

        const { fromScroll = false } = opts;   // ← дістаємо прапорець

        this.setAttribute(attributes.activeMedia, id);

        const activeImage = this.querySelector(`${selectors.productMedia}.${classes.mediaActive}`);
        const selectedImage = this.querySelector(`[${attributes.mediaId}="${id}"]`);
        const selectedImageFocus = selectedImage?.querySelector(selectors.focusedElement);
        const deferredMedia = selectedImage.querySelector('deferred-media');
        const container = selectedImage.closest('[data-product-media-list]');
        const mediaId = selectedImage.getAttribute('data-media-id');

        activeImage?.classList.add(classes.mediaHiding);
        activeImage?.classList.remove(classes.mediaActive);
        selectedImage?.classList.remove(classes.mediaHiding, classes.mediaHidden);
        selectedImage?.classList.add(classes.mediaActive);


        // скролимо тільки якщо подія НЕ з onScrollEnd
        if (!fromScroll && container) {
          this.isProgrammaticScroll = true;
          this.scrollToStart(container, selectedImage);
          this.waitForScrollEnd(container).then(() => {
            this.isProgrammaticScroll = false; // знімаємо блок тільки після завершення скролу
          });
        }


        // Force media loading if slide becomes visible
        if (deferredMedia && deferredMedia.getAttribute('loaded') !== true) {
          selectedImage.querySelector(selectors.deferredMediaButton)?.dispatchEvent(new Event('click', {bubbles: false}));
        }

        requestAnimationFrame(() => {
          this.setHeight();

          // Move focus to the selected media
          if (document.body.classList.contains(classes.isFocused)) {
            selectedImageFocus?.focus();
          }
        });
      }

      onScroll() {
        if (this.isProgrammaticScroll) return;         // ігноруємо власний скрол
        clearTimeout(this.scrollEndTimer);
        // «scrollend» не всюди є, тому робимо полілаг через debounce
        this.scrollEndTimer = setTimeout(this.onScrollEnd, 120);
      }

      onScrollEnd = () => {
        if (this.isProgrammaticScroll) return;

        const snapped = this.getSnappedMedia();
        if (snapped) {
          const id = snapped.getAttribute(attributes.mediaId);
          if (id && id !== this.getAttribute(attributes.activeMedia)) {
            this.setActiveMedia(id, { fromScroll: true });
          }
        }
      }

      /** Визначає елемент, вирівняний по snap-align:start */
      getSnappedMedia() {
        const container = this.productMediaList;
        if (!container) return null;

        const cs = getComputedStyle(container);
        const padLeft = parseFloat(cs.paddingLeft) || 0;
        const scrollPadLeft =
          parseFloat(cs.scrollPaddingLeft || cs.getPropertyValue('scroll-padding-left')) || 0;

        const cRect = container.getBoundingClientRect();
        const probeX = cRect.left + padLeft + scrollPadLeft + 1;   // 1px усередині snap-порту
        const probeY = cRect.top + cRect.height / 2;

        // 1) primary: елемент під «лівою лінійкою»
        let el = document.elementFromPoint(probeX, probeY)?.closest('[data-image-id]');
        if (el && this.contains(el)) return el;

        // 2) fallback: найближчий по логічній позиції (без суворого EPS)
        let best = null, bestDelta = Infinity;
        this.productMediaItems.forEach(node => {
          const left = this.getOffsetLeftWithin(node, container);
          const delta = Math.abs(left - (container.scrollLeft + padLeft + scrollPadLeft));
          if (delta < bestDelta) { bestDelta = delta; best = node; }
        });
        return best || null;
      }


      waitForScrollEnd(el) {
        return new Promise((resolve) => {
          if ('onscrollend' in window) {
            const handler = () => resolve();
            el.addEventListener('scrollend', handler, { once: true });
          } else {
            let t;
            const onScroll = () => {
              clearTimeout(t);
              t = setTimeout(() => {
                el.removeEventListener('scroll', onScroll);
                resolve();
              }, 120);
            };
            el.addEventListener('scroll', onScroll);
          }
        });
      }

      // 2) Точний fallback на випадок, якщо хочеш повний контроль
      getOffsetLeftWithin(el, ancestor) {
        let x = 0, node = el;
        while (node && node !== ancestor) {
          x += node.offsetLeft;
          node = node.offsetParent;
        }
        return x;
      }


      getOffsetLeftWithin(el, ancestor) {
        let x = 0, n = el;
        while (n && n !== ancestor) { x += n.offsetLeft; n = n.offsetParent; }
        return x;
      }

      scrollToStart(containerEl, itemEl, behavior = 'smooth') {
        if (!containerEl || !itemEl) return;

        const cs = getComputedStyle(containerEl);
        const padLeft = parseFloat(cs.paddingLeft) || 0;
        const scrollPadLeft =
          parseFloat(cs.scrollPaddingLeft || cs.getPropertyValue('scroll-padding-left')) || 0;

        const itemLeft = this.getOffsetLeftWithin(itemEl, containerEl);
        const target = itemLeft - padLeft - scrollPadLeft;

        const max = containerEl.scrollWidth - containerEl.clientWidth;
        const clamped = Math.max(0, Math.min(target, max));

        containerEl.scrollTo({ left: clamped, behavior });
      }

      // Set current product image height variable to product images container
      setHeight() {
        const mediaHeight = this.querySelector(`${selectors.productMedia}.${classes.mediaActive}`)?.offsetHeight || this.productMediaItems[0]?.offsetHeight;
        this.style.setProperty('--height', `${mediaHeight}px`);
      }

      productMediaObserver() {
        this.productMediaItems.forEach((media) => {
          media.addEventListener('transitionend', (e) => {
            if (e.target == media && media.classList.contains(classes.mediaHiding)) {
              media.classList.remove(classes.mediaHiding);
              media.classList.add(classes.mediaHidden);
            }
          });
          media.addEventListener('transitioncancel', (e) => {
            if (e.target == media && media.classList.contains(classes.mediaHiding)) {
              media.classList.remove(classes.mediaHiding);
              media.classList.add(classes.mediaHidden);
            }
          });
        });
      }
    }
  );
}
