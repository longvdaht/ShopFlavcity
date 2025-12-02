function appendCartItems() {
  if (document.querySelector('cart-items')) return;

  // Add cart items tag when the cart drawer section is missing so we can still run the JS associated with the error handling
  const cartItems = document.createElement('cart-items');
  document.body.appendChild(cartItems);
}

export default appendCartItems;
