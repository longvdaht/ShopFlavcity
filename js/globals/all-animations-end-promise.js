/*
  Trigger event after all animations complete in a specific section
*/
window.theme.waitForAllAnimationsEnd = function (section) {
  return new Promise((resolve, rejected) => {
    const animatedElements = section.querySelectorAll('[data-aos]');
    let animationCount = 0;

    function onAnimationEnd(event) {
      animationCount++;

      if (animationCount === animatedElements.length) {
        // All animations have ended
        resolve();
      }

      event.target.removeEventListener('animationend', onAnimationEnd);
    }

    animatedElements.forEach((element) => {
      element.addEventListener('animationend', onAnimationEnd);
    });

    if (!animationCount) rejected();
  });
};
