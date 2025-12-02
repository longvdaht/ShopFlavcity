/*
  Trigger event after animation completes
*/
window.theme.waitForAnimationEnd = function (element) {
  return new Promise((resolve) => {
    function onAnimationEnd(event) {
      if (event.target != element) return;

      element.removeEventListener('animationend', onAnimationEnd);
      resolve();
    }

    element?.addEventListener('animationend', onAnimationEnd);
  });
};
