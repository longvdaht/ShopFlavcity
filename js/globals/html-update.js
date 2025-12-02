const htmlUpdate = {
  /**
   * Used to swap an HTML node with a new node.
   * The new node is inserted as a previous sibling to the old node, the old node is hidden, and then the old node is removed.
   */
  viewTransition(oldNode, newContent, preProcessCallbacks = [], postProcessCallbacks = []) {
    preProcessCallbacks?.forEach((callback) => callback(newContent));

    // Add timestamp to ensure unique IDs
    const timestamp = Date.now();
    // Update the main element's ID if it exists

    if (newContent.dataset.swapId === 'true' && newContent.id) {
      newContent.id = `${newContent.id}-${timestamp}`;
    }

    // Update all child elements' IDs, forms, and AOS anchors
    newContent.querySelectorAll('[id], [form], [data-aos-anchor]').forEach((element) => {
      // Update element ID if it exists
      element.id && (element.id = `${element.id}-${timestamp}`);
      // Update form reference if it exists

      if (element.form) {
        const formId = element.closest('form') ? element.closest('form').getAttribute('id') : `${element.form.getAttribute('id')}-${timestamp}`;
        element.setAttribute('form', formId);
      }

      // Update data-aos-anchor if it exists
      if (element.dataset.aosAnchor) {
        const anchorId = element.dataset.aosAnchor.replace('#', '');
        element.dataset.aosAnchor = `#${anchorId}-${timestamp}`;
      }
    });

    const newNodeWrapper = document.createElement('div');
    this.setInnerHTML(newNodeWrapper, newContent.outerHTML);
    const newNode = newNodeWrapper.firstChild;

    // dedupe IDs in the old node to avoid conflicts during transition
    if (oldNode.dataset.swapId === 'true' && oldNode.id) {
      oldNode.id = `${oldNode.id}-old-${timestamp}`;
    }

    oldNode.querySelectorAll('[id], [form], [data-aos-anchor]').forEach((element) => {
      // Update element ID if it exists
      element.id && (element.id = `${element.id}-old-${timestamp}`);
      // Update form reference if it exists

      if (element.form) {
        const formId = element.closest('form') ? element.closest('form').getAttribute('id') : `${element.form.getAttribute('id')}-old-${timestamp}`;
        element.setAttribute('form', formId);
      }

      // Update data-aos-anchor if it exists
      if (element.dataset.aosAnchor) {
        const anchorId = element.dataset.aosAnchor.replace('#', '');
        element.dataset.aosAnchor = `#${anchorId}-old-${timestamp}`;
      }
    });

    oldNode.style.display = 'none';
    oldNode.parentNode.insertBefore(newNode, oldNode);
    oldNode.remove();

    postProcessCallbacks?.forEach((callback) => callback(newNode));

    // setTimeout(() => oldNode.remove(), 500);
  },

  // Sets inner HTML and reinjects the script tags to allow execution. By default, scripts are disabled when using element.innerHTML.
  setInnerHTML(element, html) {
    element.innerHTML = html;
    element.querySelectorAll('script').forEach((oldScriptTag) => {
      const newScriptTag = document.createElement('script');
      Array.from(oldScriptTag.attributes).forEach((attribute) => {
        newScriptTag.setAttribute(attribute.name, attribute.value);
      });
      newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
      oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
    });
  },
};

window.theme = window.theme || {};
window.theme.htmlUpdate = htmlUpdate;