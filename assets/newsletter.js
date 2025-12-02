(function () {
  'use strict';

  const selectors = {
    form: '[data-newsletter-form]',
    heading: '[data-newsletter-heading]',
    errorMessage: '.newsletter__message--error',
  };

  const classes = {
    success: 'has-success',
    error: 'has-error',
    hidden: 'hidden',
  };

  if (!customElements.get('newsletter-component')) {
    customElements.define(
      'newsletter-component',
      class NewsletterComponent extends HTMLElement {
        constructor() {
          super();

          this.newsletter = this.querySelector(selectors.form);
          this.sessionStorage = window.sessionStorage;
          this.stopSubmit = true;
          this.formID = null;
          this.klaviyoListID = this.dataset?.klaviyoListId || null;
          this.klaviyoAPIKey = window.theme.api.klaviyo_api_key || null;
          this.useKlaviyo = !!(this.klaviyoListID && this.klaviyoListID.length && this.klaviyoAPIKey && this.klaviyoAPIKey.length);
          this.returnTo = this.querySelector('input[name="return_to"]');
        }

        connectedCallback() {
          if (window.location.pathname === '/challenge') {
            return;
          }

          this.newsletterSubmit = (e) => {
            this.useKlaviyo ? this.klaviyoSubmitEvent(e) : this.newsletterSubmitEvent(e);
          };
          this.newsletter.addEventListener('submit', this.newsletterSubmit);
          this.showMessage();
        }

        async klaviyoSubmitEvent(e) {
          e.preventDefault();
          e.stopImmediatePropagation();
          await this.sendKlaviyoRequest();
        }

        buildKlaviyoConfig() {
          const listOfAttributes = ['email', 'first_name'];
          this.email = this.querySelector('input[name="contact[email]"]');
          this.first_name = this.querySelector('input[name="contact[first_name]"]');

          const profileData = {
            type: 'profile',
            attributes: {
              organization: Shopify.shop
            }
          };

          for (const attribute of listOfAttributes) {
            if (this[attribute] && this[attribute].value) {
              profileData.attributes[attribute] = this[attribute].value;
            }
          }

          return {
            method: 'POST',
            headers: {revision: '2025-04-15', 'content-type': 'application/json'},
            body: JSON.stringify({
              data: {
                type: 'subscription',
                attributes: {
                  profile: {
                    data: profileData
                  }
                },
                relationships: {list: {data: {type: 'list', id: this.klaviyoListID}}}
              }
            })
          };
        }

        async sendKlaviyoRequest() {
          const config = this.buildKlaviyoConfig();
          const endpoint = `https://a.klaviyo.com/client/subscriptions/?company_id=${this.klaviyoAPIKey}`;

          try {
            const response = await fetch(endpoint, config);
            if (response.status === 202) {
              this.showSuccessMessage(this.newsletter);
              this.redirectToPage();
            } else {
              const error = await response.json();
              this.showErrorMessage(this.newsletter, error.errors[0].detail);
              console.log(error);
            }
          } catch (error) {
            this.showErrorMessage(this.newsletter, error.errors[0].detail);
            console.error(error.detail);
          }
        }

        newsletterSubmitEvent(e) {
          if (this.stopSubmit) {
            e.preventDefault();
            e.stopImmediatePropagation();

            this.removeStorage();
            this.writeStorage();
            this.stopSubmit = false;
            this.newsletter.submit();
          }
        }

        writeStorage() {
          if (this.sessionStorage !== undefined) {
            this.sessionStorage.setItem('newsletter_form_id', this.newsletter.id);
          }
        }

        readStorage() {
          this.formID = this.sessionStorage.getItem('newsletter_form_id');
        }

        removeStorage() {
          this.sessionStorage.removeItem('newsletter_form_id');
        }

        showSuccessMessage(newsletter) {
          const heading = newsletter.parentElement.querySelector(selectors.heading);

          newsletter.classList.remove(classes.error);
          newsletter.classList.add(classes.success);

          if (heading) {
            heading.classList.add(classes.hidden);
            newsletter.classList.remove(classes.hidden);
          }
        }

        showErrorMessage(newsletter, error) {
          const heading = newsletter.parentElement.querySelector(selectors.heading);

          if (error) {
            const errorMessage = newsletter.querySelector(selectors.errorMessage);
            errorMessage.innerHTML = error;
          }

          newsletter.classList.remove(classes.success);
          newsletter.classList.add(classes.error);

          if (heading) {
            heading.classList.add(classes.hidden);
            newsletter.classList.remove(classes.hidden);
          }
        }

        showMessage() {
          this.readStorage();

          if (this.newsletter.id === this.formID) {
            const newsletter = document.getElementById(this.formID);
            const heading = newsletter.parentElement.querySelector(selectors.heading);
            const submissionSuccess = window.location.search.indexOf('?customer_posted=true') !== -1;
            const submissionFailure = window.location.search.indexOf('accepts_marketing') !== -1;

            if (submissionSuccess) {
              this.showSuccessMessage(newsletter, heading);
            } else if (submissionFailure) {
              this.showErrorMessage(newsletter, heading);
            }

            if (submissionSuccess || submissionFailure) {
              window.addEventListener('load', () => {
                this.scrollToForm(newsletter);
              });
            }
          }
        }

        scrollToForm(newsletter) {
          const rect = newsletter.getBoundingClientRect();
          const isVisible = rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.theme.getWindowHeight() && rect.right <= window.theme.getWindowWidth();

          if (!isVisible) {
            setTimeout(() => {
              window.theme.scrollTo(newsletter.getBoundingClientRect().top);
            }, 500);
          }
        }

        redirectToPage() {
          if (!this.returnTo) return;
          const  redirectToValue = this.returnTo.value;

          window.location.replace(redirectToValue);
        }
      }
    );
  }

})();
//# sourceMappingURL=newsletter.js.map
