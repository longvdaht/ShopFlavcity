class NovelEmbed extends HTMLElement {
  constructor() {
    super();
    this.journeyId = null;
    this.__novelMounted = false;
    this.__novelIO = null;
    this.__onScrollRef = null;

    this.__shadowMO = null;
    this.__shadowMOStopTimer = null;
    this.__shadowStyleMap = new Map();
  }

  static get observedAttributes() {
    return ['data-custom-style'];
  }

  connectedCallback() {
    this.journeyId = this.dataset.journeyId;
    if (!this.journeyId) return;

    this.init().catch(console.error);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'data-custom-style' && oldVal !== newVal) {

      const css = (this.dataset.customStyle || '').trim();
      this.updateInjectedShadowStyles(css);
    }
  }

  disconnectedCallback() {
    if (this.__shadowStyleMap?.size) {
      for (const [, styleEl] of this.__shadowStyleMap) { try { styleEl.remove(); } catch {} }
      this.__shadowStyleMap.clear();
    }
  }

  async init() {
    const el = this;
    if (el.__novelMounted) return;

    const journeyId = this.journeyId;
    const OVERLAY_EMBED_TYPE_UNIQUE_NAME = 'overlay';
    const apiBaseUrl = 'https://eg2o7r7cs9.execute-api.us-west-2.amazonaws.com/prod';
    const embedJsUrl = 'https://embed-js.benovel.com/embed/index.js';
    const releaseCacheKey = `prefetchedJourneyRelease_${journeyId}`;

    let releases = [];
    try {
      const abort = new AbortController();
      const t = setTimeout(() => abort.abort(), 8000);
      const res = await fetch(
        `${apiBaseUrl}/api/v2/journeys/${journeyId}/releases?type=PUBLISH&sort=createdAt&order=DESC&size=1`,
        { signal: abort.signal }
      );
      clearTimeout(t);
      releases = await res.json();
    } catch {
      releases = [];
    }

    const loadEmbedScript = (release) => {
      window[releaseCacheKey] = release;

      if (el.querySelector(`script[src*="embed-js.benovel.com/embed/index.js"]`)) {
        el.__novelMounted = true;

        this.tryInjectShadowCSSSoon();
        return;
      }

      const script = document.createElement('script');
      script.src = embedJsUrl;
      script.async = true;
      script.setAttribute('journey-id', journeyId);

      script.addEventListener('load', () => {
        el.__novelMounted = true;

        this.tryInjectShadowCSSSoon();
      }, { once: true });

      el.appendChild(script);
    };

    const isOverlay =
      releases?.length &&
      releases[0]?.isPublished &&
      releases[0]?.embedConfigs?.[0]?.embedType?.uniqueName?.toLowerCase() === OVERLAY_EMBED_TYPE_UNIQUE_NAME;

    if (isOverlay) {
      const onScroll = () => {
        if (document.documentElement.scrollTop >= 25) {
          loadEmbedScript(releases[0]);
          window.removeEventListener('scroll', onScroll);
          this.__onScrollRef = null;
        }
      };
      this.__onScrollRef = onScroll;
      window.addEventListener('scroll', onScroll, { passive: true });
    } else {
      const io = new IntersectionObserver((entries, obs) => {
        for (const entry of entries) {
          if (entry.target === el && entry.isIntersecting) {
            obs.unobserve(entry.target);
            loadEmbedScript(releases[0]);
            break;
          }
        }
      }, { root: null, rootMargin: '300px', threshold: 0 });
      io.observe(el);
      this.__novelIO = io;
    }
  }

  // ==== Shadow CSS injection ===================================
  tryInjectShadowCSSSoon() {
    const css = (this.dataset.customStyle || '').trim();
    if (!css) return;

    const injectedCount = this.injectIntoAllOpenShadows(css);

    if (!injectedCount) {
      this.__shadowMO?.disconnect?.();
      this.__shadowMO = new MutationObserver((muts) => {
        let found = 0;
        for (const m of muts) {
          m.addedNodes && m.addedNodes.forEach((n) => {
            if (n.nodeType !== 1) return;

            if (n.shadowRoot) found += this.injectIntoShadow(n.shadowRoot, css) ? 1 : 0;

            if (n.querySelectorAll) {
              n.querySelectorAll('*').forEach(child => {
                if (child.shadowRoot) found += this.injectIntoShadow(child.shadowRoot, css) ? 1 : 0;
              });
            }
          });
        }
        if (found) {
          if (this.__shadowMOStopTimer) clearTimeout(this.__shadowMOStopTimer);
          this.__shadowMOStopTimer = setTimeout(() => {
            this.__shadowMO?.disconnect?.();
            this.__shadowMO = null;
          }, 5000);
        }
      });
      this.__shadowMO.observe(this, { childList: true, subtree: true });

      setTimeout(() => {
        this.__shadowMO?.disconnect?.();
        this.__shadowMO = null;
      }, 30000);
    }
  }

  injectIntoAllOpenShadows(css) {
    let count = 0;

    if (this.shadowRoot) count += this.injectIntoShadow(this.shadowRoot, css) ? 1 : 0;

    this.querySelectorAll('*').forEach(el => {
      if (el.shadowRoot) count += this.injectIntoShadow(el.shadowRoot, css) ? 1 : 0;
    });
    return count;
  }

  injectIntoShadow(shadowRoot, css) {
    if (!shadowRoot) return false;

    let styleEl = this.__shadowStyleMap.get(shadowRoot);
    if (!styleEl || !styleEl.isConnected) {
      styleEl = document.createElement('style');
      styleEl.setAttribute('data-novel-custom-style', '');
      styleEl.textContent = css;
      shadowRoot.appendChild(styleEl);
      this.__shadowStyleMap.set(shadowRoot, styleEl);
      return true;
    } else {
      if (styleEl.textContent !== css) styleEl.textContent = css;
      return false;
    }
  }

  updateInjectedShadowStyles(css) {
    if (!this.__shadowStyleMap || this.__shadowStyleMap.size === 0) {
      this.tryInjectShadowCSSSoon();
      return;
    }

    for (const [root, styleEl] of this.__shadowStyleMap) {
     if (!root?.host?.isConnected || !styleEl?.isConnected) {
        this.__shadowStyleMap.delete(root);
        continue;
       }
     styleEl.textContent = css;
    }
  }
}

if (!customElements.get('novel-embed')) {
  customElements.define('novel-embed', NovelEmbed);
}
