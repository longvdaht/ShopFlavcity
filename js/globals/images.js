const classes = {
  loading: 'is-loading',
};

const selectors = {
  img: 'img.is-loading',
};

/*
  Catch images loaded events and add class "is-loaded" to them and their containers
*/
function loadedImagesEventHook() {
  document.addEventListener(
    'load',
    (e) => {
      if (e.target.tagName.toLowerCase() == 'img' && e.target.classList.contains(classes.loading)) {
        e.target.classList.remove(classes.loading);
        e.target.parentNode.classList.remove(classes.loading);

        if (e.target.parentNode.parentNode.classList.contains(classes.loading)) {
          e.target.parentNode.parentNode.classList.remove(classes.loading);
        }
      }
    },
    true
  );
}

/*
  Remove "is-loading" class to the loaded images and their containers
*/
function removeLoadingClassFromLoadedImages(container) {
  container.querySelectorAll(selectors.img).forEach((img) => {
    if (img.complete) {
      img.classList.remove(classes.loading);
      img.parentNode.classList.remove(classes.loading);

      if (img.parentNode.parentNode.classList.contains(classes.loading)) {
        img.parentNode.parentNode.classList.remove(classes.loading);
      }
    }
  });
}

export {loadedImagesEventHook, removeLoadingClassFromLoadedImages};
