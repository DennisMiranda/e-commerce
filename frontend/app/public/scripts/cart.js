export function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || {};
    const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    const cartIcon = document.getElementById("cart-count");
    if (cartIcon) cartIcon.textContent = totalItems;
}
