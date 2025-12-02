let lastWindowWidth = window.theme.getWindowWidth();
let lastWindowHeight = window.theme.getWindowHeight();

function dispatch() {
  document.dispatchEvent(
    new CustomEvent('theme:resize', {
      bubbles: true,
    })
  );

  if (lastWindowWidth !== window.theme.getWindowWidth()) {
    document.dispatchEvent(
      new CustomEvent('theme:resize:width', {
        bubbles: true,
      })
    );

    lastWindowWidth = window.theme.getWindowWidth();
  }

  if (lastWindowHeight !== window.theme.getWindowHeight()) {
    document.dispatchEvent(
      new CustomEvent('theme:resize:height', {
        bubbles: true,
      })
    );

    lastWindowHeight = window.theme.getWindowHeight();
  }
}

function resizeListener() {
  window.addEventListener(
    'resize',
    window.theme.debounce(function () {
      dispatch();
    }, 50)
  );
}

export default resizeListener;
