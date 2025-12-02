const selectors = {
  deferredMediaButton: '[data-deferred-media-button]',
  media: 'video, model-viewer, iframe',
  youtube: '[data-host="youtube"]',
  vimeo: '[data-host="vimeo"]',
  template: 'template',
  video: 'video',
  productModel: 'product-model',
};

const attributes = {
  loaded: 'loaded',
  autoplay: 'autoplay',
};

class DeferredMedia extends HTMLElement {
  constructor() {
    super();

    const poster = this.querySelector(selectors.deferredMediaButton);
    poster?.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    this.pauseAllMedia();

    if (!this.getAttribute(attributes.loaded)) {
      const content = document.createElement('div');
      const templateContent = this.querySelector(selectors.template).content.firstElementChild.cloneNode(true);
      content.appendChild(templateContent);
      this.setAttribute(attributes.loaded, true);

      const mediaElement = this.appendChild(content.querySelector(selectors.media));
      if (focus) mediaElement.focus();
      if (mediaElement.nodeName == 'VIDEO' && mediaElement.getAttribute(attributes.autoplay)) {
        // Force autoplay on Safari browsers
        mediaElement.play();
      }
    }
  }

  pauseAllMedia() {
    document.querySelectorAll(selectors.youtube).forEach((video) => {
      video.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    });
    document.querySelectorAll(selectors.vimeo).forEach((video) => {
      video.contentWindow.postMessage('{"method":"pause"}', '*');
    });
    document.querySelectorAll(selectors.video).forEach((video) => video.pause());
    document.querySelectorAll(selectors.productModel).forEach((model) => {
      if (model.modelViewerUI) model.modelViewerUI.pause();
    });
  }
}

if (!customElements.get('deferred-media')) {
  customElements.define('deferred-media', DeferredMedia);
}

window.theme.DeferredMedia = window.theme.DeferredMedia || DeferredMedia;
