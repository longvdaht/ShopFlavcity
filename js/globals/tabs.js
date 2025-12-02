const selectors = {
  relatedSection: '[data-related-section]',
  aos: '[data-aos]',
  tabsLi: '[data-tab]',
  tabLink: '.tab-link',
  tabLinkRecent: '.tab-link__recent',
  tabContent: '.tab-content',
};

const classes = {
  current: 'current',
  hidden: 'hidden',
  aosAnimate: 'aos-animate',
  aosNoTransition: 'aos-no-transition',
  focused: 'is-focused',
};

const attributes = {
  dataTab: 'data-tab',
  dataTabIndex: 'data-tab-index',
};

if (!customElements.get('tabs-component')) {
  customElements.define(
    'tabs-component',
    class GlobalTabs extends HTMLElement {
      constructor() {
        super();

        this.a11y = window.theme.a11y;
      }

      connectedCallback() {
        const tabsNavList = this.querySelectorAll(selectors.tabsLi);

        this.addEventListener('theme:tab:check', () => this.checkRecentTab());
        this.addEventListener('theme:tab:hide', () => this.hideRelatedTab());

        tabsNavList?.forEach((element) => {
          const tabId = parseInt(element.getAttribute(attributes.dataTab));
          const tab = this.querySelector(`${selectors.tabContent}-${tabId}`);

          element.addEventListener('click', () => {
            this.tabChange(element, tab);
          });

          element.addEventListener('keyup', (event) => {
            if ((event.code === 'Space' || event.code === 'Enter') && document.body.classList.contains(classes.focused)) {
              this.tabChange(element, tab);
            }
          });
        });
      }

      tabChange(element, tab) {
        if (element.classList.contains(classes.current)) {
          return;
        }

        const currentTab = this.querySelector(`${selectors.tabsLi}.${classes.current}`);
        const currentTabContent = this.querySelector(`${selectors.tabContent}.${classes.current}`);

        currentTab?.classList.remove(classes.current);
        currentTabContent?.classList.remove(classes.current);

        element.classList.add(classes.current);
        tab.classList.add(classes.current);

        if (element.classList.contains(classes.hidden)) {
          tab.classList.add(classes.hidden);
        }

        this.a11y.removeTrapFocus();

        this.dispatchEvent(new CustomEvent('theme:tab:change', {bubbles: true}));

        element.dispatchEvent(
          new CustomEvent('theme:form:sticky', {
            bubbles: true,
            detail: {
              element: 'tab',
            },
          })
        );

        this.animateItems(tab);
      }

      animateItems(tab, animated = true) {
        const animatedItems = tab.querySelectorAll(selectors.aos);

        if (animatedItems.length) {
          animatedItems.forEach((animatedItem) => {
            animatedItem.classList.remove(classes.aosAnimate);

            if (animated) {
              animatedItem.classList.add(classes.aosNoTransition);

              requestAnimationFrame(() => {
                animatedItem.classList.remove(classes.aosNoTransition);
                animatedItem.classList.add(classes.aosAnimate);
              });
            }
          });
        }
      }

      checkRecentTab() {
        const tabLink = this.querySelector(selectors.tabLinkRecent);

        if (tabLink) {
          tabLink.classList.remove(classes.hidden);
          const tabLinkIdx = parseInt(tabLink.getAttribute(attributes.dataTab));
          const tabContent = this.querySelector(`${selectors.tabContent}[${attributes.dataTabIndex}="${tabLinkIdx}"]`);

          if (tabContent) {
            tabContent.classList.remove(classes.hidden);

            this.animateItems(tabContent, false);
          }
        }
      }

      hideRelatedTab() {
        const relatedSection = this.querySelector(selectors.relatedSection);
        if (!relatedSection) {
          return;
        }

        const parentTabContent = relatedSection.closest(`${selectors.tabContent}.${classes.current}`);
        if (!parentTabContent) {
          return;
        }
        const parentTabContentIdx = parseInt(parentTabContent.getAttribute(attributes.dataTabIndex));
        const tabsNavList = this.querySelectorAll(selectors.tabsLi);

        if (tabsNavList.length > parentTabContentIdx) {
          const nextTabsNavLink = tabsNavList[parentTabContentIdx].nextSibling;

          if (nextTabsNavLink) {
            tabsNavList[parentTabContentIdx].classList.add(classes.hidden);
            nextTabsNavLink.dispatchEvent(new Event('click'));
          }
        }
      }
    }
  );
}
