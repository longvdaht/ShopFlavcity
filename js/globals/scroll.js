let prev = window.scrollY;
let up = null;
let down = null;
let wasUp = null;
let wasDown = null;
let scrollLockTimer = 0;

function dispatch() {
  const position = window.scrollY;
  if (position > prev) {
    down = true;
    up = false;
  } else if (position < prev) {
    down = false;
    up = true;
  } else {
    up = null;
    down = null;
  }
  prev = position;
  document.dispatchEvent(
    new CustomEvent('theme:scroll', {
      detail: {
        up,
        down,
        position,
      },
      bubbles: false,
    })
  );
  if (up && !wasUp) {
    document.dispatchEvent(
      new CustomEvent('theme:scroll:up', {
        detail: {position},
        bubbles: false,
      })
    );
  }
  if (down && !wasDown) {
    document.dispatchEvent(
      new CustomEvent('theme:scroll:down', {
        detail: {position},
        bubbles: false,
      })
    );
  }
  wasDown = down;
  wasUp = up;
}

function lock(e) {
  // Prevent body scroll lock race conditions
  setTimeout(() => {
    if (scrollLockTimer) {
      clearTimeout(scrollLockTimer);
    }

    window.theme.ScrollLock.disablePageScroll(e.detail, {
      allowTouchMove: (el) => el.tagName === 'TEXTAREA',
    });

    document.documentElement.setAttribute('data-scroll-locked', '');
  });
}

function unlock(e) {
  const timeout = e.detail;

  if (timeout) {
    scrollLockTimer = setTimeout(removeScrollLock, timeout);
  } else {
    removeScrollLock();
  }
}

function removeScrollLock() {
  window.theme.ScrollLock.clearQueueScrollLocks();
  window.theme.ScrollLock.enablePageScroll();
  document.documentElement.removeAttribute('data-scroll-locked');
}

function scrollListener() {
  let timeout;
  window.addEventListener(
    'scroll',
    function () {
      if (timeout) {
        window.cancelAnimationFrame(timeout);
      }
      timeout = window.requestAnimationFrame(function () {
        dispatch();
      });
    },
    {passive: true}
  );

  window.addEventListener('theme:scroll:lock', lock);
  window.addEventListener('theme:scroll:unlock', unlock);
}

export default scrollListener;
