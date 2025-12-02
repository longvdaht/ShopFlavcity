(function () {
  'use strict';

  const selectors = {
    popupComponent: 'popup-component',
    close: '[data-popup-close]',
    notificationForm: '[data-notification-form]',
    notificationHeading: '[data-product-notification-heading]',
    errorMessage: '.product__notification__message--error',
  };

  const classes = {
    success: 'has-success',
    hidden: 'hidden',
  };

  if (!customElements.get('product-notification')) {
    customElements.define(
      'product-notification',
      class ProductNotification extends HTMLElement {
        constructor() {
          super();

          this.notificationForm = this.querySelector(selectors.notificationForm);
          this.preventSubmit = true;
          this.popup = this.closest('dialog');
          this.popupClose = this.popup?.querySelector(selectors.close);
          this.klaviyoListID = this.dataset?.klaviyoListId || null;
          this.klaviyoAPIKey = window.theme.api.klaviyo_api_key || null;
          this.useKlaviyo = !!(this.klaviyoAPIKey && this.klaviyoAPIKey.length);
        }

        connectedCallback() {
          this.checkState();

          this.notificationForm.addEventListener('submit', (e) => {
            this.useKlaviyo ? this.klaviyoSubmitEvent(e) : this.notificationSubmitEvent(e);
          });

          if (this.popupClose) {
            this.popupClose.addEventListener('click', () => {
              this.removeStorage();
            });
          }
        }

        async klaviyoSubmitEvent(e) {
          e.preventDefault();
          e.stopImmediatePropagation();

          const emailInput = this.querySelector('input[name="contact[email]"]');
          if (!emailInput || !emailInput.checkValidity()) {
            this.showErrorMessage(this.notificationForm, 'Please enter a valid email.');
            return;
          }

          await this.sendKlaviyoRequest();
        }

        buildKlaviyoConfig() {
          const variantId = this.querySelector('input[name="variant"]').value;
          const email = this.querySelector('input[name="contact[email]"]').value;

          if (!email || !variantId) return null;

          return {
            method: 'POST',
            headers: {
              accept: 'application/json',
              revision: '2024-07-15',
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              data: {
                type: 'back-in-stock-subscription',
                attributes: {
                  profile: {
                    data: {
                      type: 'profile',
                      attributes: {
                        email: `${email}`
                      }
                    }
                  },
                  channels: ['EMAIL'],
                },
                relationships: {
                  variant: {
                    data: {
                      type: 'catalog-variant',
                      id: `$shopify:::$default:::${variantId}`
                    }
                  }
                }
              }
            })
          };
        }

        buildKlaviyoProfileConfig() {
          const listOfAttributes = ['email'];
          this.email = this.querySelector('input[name="contact[email]"]');

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
          const endpoint = `https://a.klaviyo.com/client/back-in-stock-subscriptions/?company_id=${this.klaviyoAPIKey}`;

          try {
            const response = await fetch(endpoint, config);
            const isJson = response.headers.get('content-type')?.includes('application/json');
            const hasBody = response.status !== 204 && isJson;

            const json = hasBody ? await response.json() : null;

            if (response.status === 202) {
              const errorDetail =
                json?.errors?.[0]?.detail ||
                (typeof json?.message === 'string' ? json.message : null);

              if (errorDetail) {
                this.showSuccessMessage(this.notificationForm, errorDetail);
                console.warn('Klaviyo warning (with 202):', json);
              } else {
                this.showSuccessMessage(this.notificationForm);
              }

              // Send an additional request to subscribe to the list if there is a listID
              if (this.klaviyoListID) {
                const profileConfig = this.buildKlaviyoProfileConfig();
                const listEndpoint = `https://a.klaviyo.com/client/subscriptions/?company_id=${this.klaviyoAPIKey}`;

                try {
                  const res = await fetch(listEndpoint, profileConfig);
                  const isJson = res.headers.get('content-type')?.includes('application/json');
                  const listJson = isJson ? await res.json() : null;

                  if (res.status !== 202) {
                    console.warn('Klaviyo list subscription issue:', listJson);
                  }
                } catch (err) {
                  console.error('Error sending Klaviyo list subscription:', err);
                }
              }

            } else {
              const detail = json?.errors?.[0]?.detail || 'Subscription failed. Please try again.';
              this.showErrorMessage(this.notificationForm, detail);
              console.warn('Klaviyo error:', json);
            }
          } catch (error) {
            const detail = error?.errors?.[0]?.detail || error?.message || 'Network error. Please try again.';
            this.showErrorMessage(this.notificationForm, detail);
            console.error('Fetch error:', error);
          }
        }

        showSuccessMessage(form, message = 'Your email has been received.') {
          const messageEl = form.querySelector('.product__notification__message');
          if (messageEl) {
            messageEl.textContent = message;
            messageEl.classList.remove(classes.hidden);
          }

          form.classList.remove('has-error');
          form.classList.add(classes.success);

          this.closest(selectors.popupComponent)?.classList.add(classes.success);
          this.popup?.removeAttribute('inert');

          if (typeof this.popup?.showModal === 'function') {
            this.popup.showModal();
          } else {
            this.popup?.setAttribute('open', '');
          }
        }


        showErrorMessage(form, errorText) {
          const errorMessage = form.querySelector(selectors.errorMessage);

          if (errorMessage && errorText) {
            errorMessage.textContent = errorText;
            errorMessage.classList.remove(classes.hidden);
          }

          form.classList.remove(classes.success);
          form.classList.add('has-error');
        }

        checkState() {
          const notificationFormSuccess = window.location.search.includes('?contact_posted=true');

          if (notificationFormSuccess && !this.useKlaviyo) {
            this.showSuccessMessage(this.notificationForm);
          }
        }

        notificationSubmitEvent(e) {
          if (this.preventSubmit) {
            e.preventDefault();
            e.stopImmediatePropagation();

            this.removeStorage();
            this.writeStorage();
            this.preventSubmit = false;
            this.notificationForm.submit();
          }
        }

        writeStorage() {
          if (window.sessionStorage !== undefined) {
            window.sessionStorage.setItem('notification_form_id', this.notificationForm.id);
          }
        }

        removeStorage() {
          window.sessionStorage.removeItem('notification_form_id');
        }
      }
    );
  }

})();
//# sourceMappingURL=product-notification.js.map
