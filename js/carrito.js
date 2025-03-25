// carrito.js - Cart functionality for carrito.html
document.addEventListener('DOMContentLoaded', async function() {
    const apiURL = 'https://crudcrud.com/api/9df620adc24b4d898cdd023fe61f7da4/productos';
    const productService = new ProductService(apiURL);
    const cart = new Cart();
    
    // Load cart from localStorage or initialize empty
    function loadCart() {
        const savedCart = localStorage.getItem('plantCart');
        if (savedCart) {
            const parsed = JSON.parse(savedCart);
            parsed.items.forEach(([id, item]) => {
                const product = new Product(
                    id,
                    item.product.name,
                    item.product.price,
                    item.product.description,
                    item.product.imageUrl
                );
                cart.items.set(id, { product, amount: item.amount });
            });
        }
        renderCart();
    }

    // Render cart with plant products
    function renderCart() {
        const cartContainer = document.getElementById('cart-container');
        const totalElement = document.getElementById('cart-total');
        let total = 0;
        
        cartContainer.innerHTML = '';
        
        cart.items.forEach(({ product, amount }, id) => {
            total += product.price * amount;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'card mb-3';
            cartItem.innerHTML = `
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-3">
                            <img src="${product.imageUrl}" class="img-fluid rounded" alt="${product.name}" style="max-height: 150px;">
                        </div>
                        <div class="col-md-9">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text">${product.description}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Cantidad:</strong> 
                                    <input type="number" min="1" value="${amount}" 
                                           class="form-control d-inline-block w-25 quantity-input" 
                                           data-id="${id}">
                                </div>
                                <div>
                                    <strong>Precio:</strong> $${(product.price * amount).toFixed(2)}
                                </div>
                                <button class="btn btn-danger remove-item" data-id="${id}">
                                    <i class="fas fa-trash"></i> Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            cartContainer.appendChild(cartItem);
        });

        // Add shipping cost (fixed for this example)
        const shippingCost = 30.00;
        total += shippingCost;
        
        // Add summary card
        const summaryCard = document.createElement('div');
        summaryCard.className = 'card mb-3';
        summaryCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">Resumen de compra</h5>
                <p><strong>Subtotal:</strong> $${(total - shippingCost).toFixed(2)}</p>
                <p><strong>Envío:</strong> $${shippingCost.toFixed(2)}</p>
                <hr>
                <h4>Total: $${total.toFixed(2)}</h4>
            </div>
        `;
        cartContainer.appendChild(summaryCard);
        
        totalElement.textContent = total.toFixed(2);
        
        // Add event listeners
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                cart.removeItem(e.target.dataset.id);
                saveCart();
                renderCart();
            });
        });
        
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const newAmount = parseInt(e.target.value);
                if (newAmount > 0) {
                    cart.updateItem(e.target.dataset.id, newAmount);
                    saveCart();
                    renderCart();
                }
            });
        });
    }

    // Save cart to localStorage
    function saveCart() {
        const cartData = {
            items: Array.from(cart.items.entries())
        };
        localStorage.setItem('plantCart', JSON.stringify(cartData));
    }

    // Initialize cart
    loadCart();
});