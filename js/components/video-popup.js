const attributes = {
  videoPlay: 'data-video-play',
};

if (!customElements.get('video-popup')) {
  customElements.define(
    'video-popup',

    class VideoPopup extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        this.querySelectorAll(`[${attributes.videoPlay}]`)?.forEach((button) => {
          button.addEventListener('click', (e) => {
            const button = e.currentTarget;
            if (button.getAttribute(attributes.videoPlay).trim() !== '') {
              e.preventDefault();

              const items = [
                {
                  html: button.getAttribute(attributes.videoPlay),
                },
              ];

              const options = {
                mainClass: 'pswp--video',
              };

              new window.theme.LoadPhotoswipe(items, options);
              window.theme.a11y.lastElement = button;
            }
          });
        });
      }
    }
  );
}
