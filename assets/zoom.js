(function () {
  'use strict';

  const selectors = {
    zoomCaption: '[data-zoom-caption]',
    zoomImage: '[data-zoom-image]',
    pswpThumbsTemplate: '[data-pswp-thumbs-template]',
    section: '[data-section-type]',
    thumbs: '.pswp__thumbs',
    productImages: 'product-images',
  };

  const classes = {
    dragging: 'is-dragging',
    variantSoldOut: 'variant--soldout',
    variantUnavailable: 'variant--unavailable',
    popupClass: 'pswp-zoom-gallery',
    popupClassNoThumbs: 'pswp-zoom-gallery--single',
  };

  const attributes = {
    dataImageSrc: 'data-image-src',
    dataImageWidth: 'data-image-width',
    dataImageHeight: 'data-image-height',
  };

  class ZoomImages extends HTMLElement {
    constructor() {
      super();

      this.container = this.closest(selectors.section);
      this.images = this.querySelectorAll(selectors.zoomImage);
      this.zoomCaptions = this.container.querySelector(selectors.zoomCaption);
      this.thumbsContainer = document.querySelector(selectors.thumbs);
    }

    connectedCallback() {
      this.images.forEach((image, index) => {
        image.addEventListener('click', (e) => {
          e.preventDefault();

          // Don't open Zoom popup if dragging
          if (image.closest(selectors.productImages).classList.contains(classes.dragging)) return;

          this.createZoom(index);

          window.theme.a11y.lastElement = image;
        });

        image.addEventListener('keyup', (e) => {
          // On keypress Enter move the focus to the first focusable element in the related slide
          if (e.code === 'Enter') {
            e.preventDefault();

            this.createZoom(index);

            window.theme.a11y.lastElement = image;
          }
        });
      });
    }

    createZoom(indexImage) {
      const thumbsTemplate = this.container.querySelector(selectors.pswpThumbsTemplate);
      const thumbs = thumbsTemplate?.innerHTML;
      let items = [];
      let counter = 0;

      this.images.forEach((image) => {
        const imgSrc = image.getAttribute(attributes.dataImageSrc);

        counter += 1;

        items.push({
          src: imgSrc,
          w: parseInt(image.getAttribute(attributes.dataImageWidth)),
          h: parseInt(image.getAttribute(attributes.dataImageHeight)),
          msrc: imgSrc,
        });

        if (this.images.length === counter) {
          const options = {
            history: false,
            focus: false,
            index: indexImage,
            mainClass: counter === 1 ? `${classes.popupClass} ${classes.popupClassNoThumbs}` : `${classes.popupClass}`,
            showHideOpacity: true,
            howAnimationDuration: 150,
            hideAnimationDuration: 250,
            closeOnScroll: false,
            closeOnVerticalDrag: false,
            captionEl: true,
            closeEl: true,
            closeElClasses: ['caption-close', 'title'],
            tapToClose: false,
            clickToCloseNonZoomable: false,
            maxSpreadZoom: 2,
            loop: true,
            spacing: 0,
            allowPanToNext: true,
            pinchToClose: false,
            addCaptionHTMLFn: (item, captionEl, isFake) => {
              this.zoomCaption(item, captionEl, isFake);
            },
            getThumbBoundsFn: () => {
              const imageLocation = this.images[indexImage];
              const pageYScroll = window.scrollY || document.documentElement.scrollTop;
              const rect = imageLocation.getBoundingClientRect();
              return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
            },
          };

          new window.theme.LoadPhotoswipe(items, options);

          if (this.thumbsContainer && thumbs !== '') {
            this.thumbsContainer.innerHTML = thumbs;
          }
        }
      });
    }

    zoomCaption(item, captionEl) {
      let captionHtml = '';
      const targetContainer = captionEl.children[0];
      if (this.zoomCaptions) {
        captionHtml = this.zoomCaptions.innerHTML;

        if (this.zoomCaptions.closest(`.${classes.variantSoldOut}`)) {
          targetContainer.classList.add(classes.variantSoldOut);
        } else {
          targetContainer.classList.remove(classes.variantSoldOut);
        }

        if (this.zoomCaptions.closest(`.${classes.variantUnavailable}`)) {
          targetContainer.classList.add(classes.variantUnavailable);
        } else {
          targetContainer.classList.remove(classes.variantUnavailable);
        }
      }

      targetContainer.innerHTML = captionHtml;
      return false;
    }
  }

  if (!customElements.get('zoom-images')) {
    customElements.define('zoom-images', ZoomImages);
  }

})();
//# sourceMappingURL=zoom.js.map
