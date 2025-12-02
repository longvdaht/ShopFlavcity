window.theme.getWindowWidth = function () {
  return document.documentElement.clientWidth || document.body.clientWidth || window.innerWidth;
};

window.theme.getWindowHeight = function () {
  return document.documentElement.clientHeight || document.body.clientHeight || window.innerHeight;
};

window.theme.isMobile = function () {
  return window.theme.getWindowWidth() < window.theme.sizes.small;
};
