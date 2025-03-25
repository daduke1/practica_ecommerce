document.addEventListener('DOMContentLoaded', function() {
    const cartManager = new CartManager();
    
    function renderCart() {
      const cartContainer = document.getElementById('cart-container');
      const emptyCartMsg = document.getElementById('empty-cart-message');
      const cartSummary = document.getElementById('cart-summary');
      
      try {
        // Clear previous content
        cartContainer.innerHTML = '';
        
        if (cartManager.cart.items.size === 0) {
          emptyCartMsg?.classList.remove('d-none');
          cartSummary?.classList.add('d-none');
          return;
        }
        
        emptyCartMsg?.classList.add('d-none');
        cartSummary?.classList.remove('d-none');
        
        let subtotal = 0;
        let hasValidItems = false;
        
        cartManager.cart.items.forEach(({product, amount}, id) => {
          try {
            // Validate product
            if (!product || !product.name || isNaN(product.price)) {
              throw new Error("Invalid product data");
            }
            
            subtotal += product.price * amount;
            hasValidItems = true;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'card mb-3';
            cartItem.innerHTML = `
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-md-2">
                    <img src="${product.imageUrl || 'https://via.placeholder.com/150'}" 
                         class="img-fluid rounded cart-item-img" 
                         alt="${product.name}"
                         onerror="this.src='https://via.placeholder.com/150'">
                  </div>
                  <div class="col-md-6">
                    <h5>${product.name}</h5>
                    ${product.description ? `<p class="text-muted">${product.description}</p>` : ''}
                  </div>
                  <div class="col-md-4">
                    <div class="input-group mb-3">
                      <button class="btn btn-outline-secondary decrement" 
                              data-id="${id}">−</button>
                      <input type="number" min="1" value="${amount}" 
                             class="form-control text-center quantity" 
                             data-id="${id}" readonly>
                      <button class="btn btn-outline-secondary increment" 
                              data-id="${id}">+</button>
                    </div>
                    <p class="text-end"><strong>$${(product.price * amount).toFixed(2)}</strong></p>
                    <button class="btn btn-danger remove-item" 
                            data-id="${id}">
                      <i class="fas fa-trash"></i> Remove
                    </button>
                  </div>
                </div>
              </div>
            `;
            cartContainer.appendChild(cartItem);
            
          } catch (e) {
            console.warn("Invalid cart item skipped:", product, e);
            cartManager.cart.removeItem(id);
          }
        });
        
        if (!hasValidItems) {
          cartManager.cart.items.clear();
          emptyCartMsg?.classList.remove('d-none');
          cartSummary?.classList.add('d-none');
          cartManager.saveCart();
          return;
        }
        
        // Update summary
        const shipping = 30.00;
        const total = subtotal + shipping;
        
        cartSummary.innerHTML = `
          <div class="card-body">
            <h5 class="card-title">Order Summary</h5>
            <div class="d-flex justify-content-between">
              <span>Subtotal:</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span>Shipping:</span>
              <span>$${shipping.toFixed(2)}</span>
            </div>
            <hr>
            <div class="d-flex justify-content-between fw-bold">
              <span>Total:</span>
              <span>$${total.toFixed(2)}</span>
            </div>
            <a href="ordenes.html" class="btn btn-success w-100 mt-3">
              <i class="fas fa-credit-card"></i> Checkout
            </a>
          </div>
        `;
        
        // Add event listeners
        addCartEventListeners();
        
      } catch (e) {
        console.error("Error rendering cart:", e);
        emptyCartMsg?.classList.remove('d-none');
        cartSummary?.classList.add('d-none');
      }
    }
    
    function addCartEventListeners() {
      // Increment quantity
      document.querySelectorAll('.increment').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.dataset.id;
          const item = cartManager.cart.items.get(id);
          if (item) {
            item.amount += 1;
            cartManager.saveCart();
            renderCart();
          }
        });
      });
      
      // Decrement quantity
      document.querySelectorAll('.decrement').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.dataset.id;
          const item = cartManager.cart.items.get(id);
          if (item) {
            if (item.amount > 1) {
              item.amount -= 1;
            } else {
              cartManager.cart.removeItem(id);
            }
            cartManager.saveCart();
            renderCart();
          }
        });
      });
      
      // Remove item
      document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          cartManager.cart.removeItem(e.target.dataset.id);
          cartManager.saveCart();
          renderCart();
        });
      });
    }
    
    // Initial render
    renderCart();
  });