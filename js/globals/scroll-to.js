window.theme.scrollTo = (elementTop) => {
  const stickyHeaderHeight = document.querySelector('[data-header-sticky]') ? document.querySelector('[data-header-height]').offsetHeight : 0;

  window.scrollTo({
    top: elementTop + window.scrollY - stickyHeaderHeight,
    left: 0,
    behavior: 'smooth',
  });
};
