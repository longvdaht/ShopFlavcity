/*
  Observe whether or not there are open modals that require scroll lock
*/

window.theme.hasOpenModals = function () {
  const openModals = Boolean(document.querySelectorAll('dialog[open][data-scroll-lock-required]').length);
  const openDrawers = Boolean(document.querySelectorAll('.drawer.is-open').length);

  return openModals || openDrawers;
};
