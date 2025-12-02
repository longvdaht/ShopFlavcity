const selectors = {
  videoTemplate: '[data-video-template]',
};

const classes = {
  loading: 'is-loading',
};

const attributes = {
  videoId: 'data-video-id',
};

if (!customElements.get('video-background')) {
  customElements.define(
    'video-background',
    class VideoBackground extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        this.videoId = this.getAttribute(attributes.videoId);
        this.videoTemplate = this.querySelector(selectors.videoTemplate);
        this.video = null;
        this.powerSaverVideoPlay = this.powerSaverVideoPlay.bind(this);

        if (this.videoId) {
          this.renderVideo();
        }
      }

      powerSaverVideoPlay() {
        this.video?.play();
      }

      renderVideo() {
        /*
          Observe video element and pull it out from its template tag
        */
        this.videoTemplateObserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const content = this.videoTemplate?.innerHTML;
                if (content) this.innerHTML = content;
                this.classList.remove(classes.loading);
                this.video = this.querySelector('video');

                const dataSrcEl = this.video.querySelector('source')?.dataset?.src;
                if (dataSrcEl) {
                  this.video.querySelector('source').src = this.video.querySelector('source').dataset.src;
                  this.video.load();
                }

                this.observeVideoPlayToggle();

                // Detect low power mode
                this.video
                  .play()
                  .then(() => {})
                  .catch(() => {
                    // Force video autoplay on iOS when Low Power Mode is On
                    document.addEventListener('click', this.powerSaverVideoPlay, {passive: true, bubbles: true, once: true});
                    document.addEventListener('touchstart', this.powerSaverVideoPlay, {passive: true, bubbles: true, once: true});
                  });

                // Stop observing element after it was animated
                observer.unobserve(entry.target);
              }
            });
          },
          {
            root: null,
            rootMargin: '300px',
            threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
          }
        );

        this.videoTemplateObserver.observe(this);
      }

      observeVideoPlayToggle() {
        if (!this.video) return;

        this.sourceReplaced = false;

        const options = {
          rootMargin: '0px',
          threshold: [0, 1.0],
        };

        this.videoPlayObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            const isVisible = entry.isIntersecting;
            if (isVisible && typeof this.video.play === 'function') {
              const playPromise = this.video.play();
              if (playPromise !== undefined) {
                playPromise
                  .then((_) => {
                    // Automatic playback started!
                    // Show playing UI.
                  })
                  .catch((error) => {
                    // Auto-play was prevented
                    // Show paused UI.
                  });
              }
            }
            if (!isVisible && typeof this.video.pause === 'function') {
              this.video.pause();
            }
          });
        }, options);

        this.videoPlayObserver.observe(this.video);
      }

      disconnectedCallback() {
        if (this.videoTemplateObserver) {
          this.videoTemplateObserver.disconnect();
        }

        if (this.videoPlayObserver) {
          this.videoPlayObserver.disconnect();
        }

        if (this.videoId) {
          document.removeEventListener('click', this.powerSaverVideoPlay);
          document.removeEventListener('touchstart', this.powerSaverVideoPlay);
        }
      }
    }
  );
}
