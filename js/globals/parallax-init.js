// List of attributes: 
// orientation:  String | up - right - down - left - up left - up right - down left - left right
// scale: Number | need to be above 1.0
// overflow: Boolean
// delay: Number | the delay is in second
// transition: any CSS transition
// maxTransition: it should be a percentage between 1 and 99
// src: String
// customContainer: String or Node
// customWrapper: String

const attributes = {
  simpleParallaxElement: 'data-simple-parallax-element',
  orientation: 'data-parallax-orientation',
  scale: 'data-parallax-scale',
  overflow: 'data-parallax-overflow',
  delay: 'data-parallax-delay',
  transition: 'data-parallax-transition',
  maxTransition: 'data-parallax-max-transition',
  src: 'data-parallax-src',
  customContainer: 'data-parallax-custom-container',
  customWrapper: 'data-parallax-custom-wrapper',
};

function initSimpleParallax() {
  const parallaxElements = document.querySelectorAll(`[${attributes.simpleParallaxElement}]`);

  if (!parallaxElements.length) return;

  parallaxElements.forEach((element) => {
    const orientation = element.getAttribute(attributes.orientation);
    const scale = Number(element.getAttribute(attributes.scale));
    const overflow = element.getAttribute(attributes.overflow);
    const delay = Number(element.getAttribute(attributes.delay));
    const transition = element.getAttribute(attributes.transition);
    const maxTransition = Number(element.getAttribute(attributes.maxTransition));
    const src = element.getAttribute(attributes.src);
    const customContainer = element.getAttribute(attributes.customContainer);
    const customWrapper = element.getAttribute(attributes.customWrapper);

    const options = {};

    if (orientation) options.orientation = orientation;
    if (scale) options.scale = scale;
    if (overflow === 'true' || overflow === 'false') options.overflow = overflow === 'true';
    if (delay) options.delay = delay;
    if (transition) options.transition = transition;
    if (maxTransition) options.maxTransition = maxTransition;
    if (src) options.src = src;
    if (customContainer) options.customContainer = customContainer;
    if (customWrapper) options.customWrapper = customWrapper;

    new window.theme.SimpleParallax(element, options);
  })
}

document.addEventListener('DOMContentLoaded', () => {
  initSimpleParallax();
});

