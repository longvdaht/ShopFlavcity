(function () {
  'use strict';

  const selectors = {
    time: 'time',
    days: '[data-days]',
    hours: '[data-hours]',
    minutes: '[data-minutes]',
    seconds: '[data-seconds]',
    shopifySection: '.shopify-section',
    countdownBlock: '[data-countdown-block]',
  };

  const attributes = {
    expirationBehavior: 'data-expiration-behavior',
    clone: 'data-clone',
  };

  const classes = {
    showMessage: 'show-message',
    hideCountdown: 'hidden',
  };

  const settings = {
    hideSection: 'hide-section',
    showMessage: 'show-message',
  };

  if (!customElements.get('countdown-timer')) {
    customElements.define(
      'countdown-timer',
      class CountdownTimer extends HTMLElement {
        constructor() {
          super();

          this.section = this.closest(selectors.shopifySection);
          this.countdownParent = this.closest(selectors.countdownBlock) || this.section;
          this.expirationBehavior = this.getAttribute(attributes.expirationBehavior);

          this.time = this.querySelector(selectors.time);
          this.days = this.querySelector(selectors.days);
          this.hours = this.querySelector(selectors.hours);
          this.minutes = this.querySelector(selectors.minutes);
          this.seconds = this.querySelector(selectors.seconds);

          // Get the current and expiration dates in Unix timestamp format (milliseconds)
          this.endDate = Date.parse(this.time.dateTime);
          this.daysInMs = 1000 * 60 * 60 * 24;
          this.hoursInMs = this.daysInMs / 24;
          this.minutesInMs = this.hoursInMs / 60;
          this.secondsInMs = this.minutesInMs / 60;

          this.shouldHideOnComplete = this.expirationBehavior === settings.hideSection;
          this.shouldShowMessage = this.expirationBehavior === settings.showMessage;

          this.update = this.update.bind(this);
        }

        connectedCallback() {
          if (isNaN(this.endDate)) {
            this.onComplete();
            return;
          }

          if (this.endDate <= Date.now()) {
            this.onComplete();
            return;
          }
          // Initial update to avoid showing old time
          this.update();
          // Update the countdown every second
          this.interval = setInterval(this.update, 1000);
        }

        disconnectedCallback() {
          this.stopTimer();
        }

        convertTime(timeInMs) {
          const days = this.formatDigits(parseInt(timeInMs / this.daysInMs, 10));
          timeInMs -= days * this.daysInMs;

          const hours = this.formatDigits(parseInt(timeInMs / this.hoursInMs, 10));
          timeInMs -= hours * this.hoursInMs;

          const minutes = this.formatDigits(parseInt(timeInMs / this.minutesInMs, 10));
          timeInMs -= minutes * this.minutesInMs;

          const seconds = this.formatDigits(parseInt(timeInMs / this.secondsInMs, 10));

          return {
            days: days,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
          };
        }

        // Make numbers less than 10 to appear with a leading zero like 01, 02, 03
        formatDigits(number) {
          if (number < 10) number = '0' + number;
          return number;
        }

        render(timer) {
          this.days.textContent = timer.days;
          this.hours.textContent = timer.hours;
          this.minutes.textContent = timer.minutes;
          this.seconds.textContent = timer.seconds;
        }

        stopTimer() {
          clearInterval(this.interval);
        }

        onComplete() {
          this.render({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
          });

          if (this.shouldHideOnComplete) {
            this.countdownParent?.classList.add(classes.hideCountdown);
            this.countdownParent?.dispatchEvent(
              new CustomEvent('theme:countdown:hide', {
                detail: {
                  element: this,
                },
                bubbles: true,
              })
            );
          }

          if (this.shouldShowMessage) {
            this.classList?.add(classes.showMessage);

            this.countdownParent?.dispatchEvent(
              new CustomEvent('theme:countdown:expire', {
                bubbles: true,
              })
            );
          }
        }

        // Function to update the countdown
        update() {
          const timeNow = new Date().getTime();
          const timeDiff = this.endDate - timeNow;

          if (timeDiff < 1000) {
            this.stopTimer();
            this.onComplete();
          }

          const timeRemaining = this.convertTime(timeDiff);
          this.render(timeRemaining);
        }
      }
    );
  }

})();
//# sourceMappingURL=countdown-timer.js.map
