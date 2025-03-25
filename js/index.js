// index.js - Complete updated version
const apiURL = 'https://crudcrud.com/api/9df620adc24b4d898cdd023fe61f7da4/productos';
// Test API connection
async function testAPI() {
    try {
      const response = await fetch(apiURL);
      const data = await response.json();
      console.log("API Response:", data);
      return data;
    } catch (error) {
      console.error("API Error:", error);
      return null;
    }
  }
  
  testAPI().then(data => {
    if (!data || data.length === 0) {
      console.warn("API returned no products, will initialize sample plants");
    }
  });
const productService = new ProductService(apiURL);
// NEW: Cleanup function to delete all existing products
async function deleteAllProducts() {
    try {
      const products = await productService.getProducts();
      await Promise.all(products.map(p => productService.deleteProduct(p._id)));
      console.log(`Deleted ${products.length} old products`);
    } catch (error) {
      console.error("Cleanup failed:", error);
    }
  }
const cart = new Cart();

const productList = document.getElementById('product-list');
const cartList = document.getElementById('cart-list');
const cartTotal = document.getElementById('cart-total');

const samplePlants = [
    { 
      name: "Monstera Deliciosa", 
      price: 42.00, 
      description: "Hojas grandes y perforadas",
      imageUrl: "https://mekero.cl/cdn/shop/files/MonsteraDeliciosa_900x.png?v=1691983400" 
    },
    { 
      name: "Suculenta Echeveria", 
      price: 37.50, 
      description: "Pequeña y con forma de roseta, fácil de cuidar",
      imageUrl: "https://www.verdeesvida.es/files/plant/29072023192833_Echeveria%20OHF.jpg"
    },
    { 
      name: "Ficus Lyrata", 
      price: 55.00, 
      description: "Planta de interior con hojas grandes y brillantes",
      imageUrl: "https://florespumahue.com/cdn/shop/files/20240504_120130.jpg?v=1719282864&width=1946"
    },
    { 
      name: "Sansevieria", 
      price: 35.00, 
      description: "Resistente y perfecta para purificar el aire",
      imageUrl: "https://res.cloudinary.com/fronda/image/upload/f_auto,q_auto,c_pad,w_648/prod/build/shop/images/blog/aprender/guia-de-cuidados-de-las-sansevierias/image2.fa09fbd3.jpg"
    }
  ];
// Render plant products
function renderProducts(products) {
    productList.innerHTML = "";
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'col-md-3 col-sm-6 mb-4';
        card.innerHTML = `
            <div class="card h-100">
                <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <p class="card-text"><strong>$${product.price.toFixed(2)}</strong></p>
                    <button class="btn btn-primary mt-auto add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">
                        Agregar al carrito
                    </button>
                </div>
            </div>
        `;
        productList.appendChild(card);
    });

    // Add event listeners to all add-to-cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const { id, name, price } = e.target.dataset;
            addToCart(id, name, parseFloat(price));
        });
    });
}

// Render cart
function renderCart() {
    cartList.innerHTML = "";
    let total = 0;
    
    cart.items.forEach(({ product, amount }) => {
        total += product.price * amount;
        const cartItem = document.createElement('div');
        cartItem.className = 'col-md-4 mb-4';
        cartItem.innerHTML = `
            <div class="card">
                <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}" style="height: 150px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">Cantidad: ${amount}</p>
                    <p class="card-text">$${(product.price * amount).toFixed(2)}</p>
                    <button class="btn btn-danger btn-sm remove-from-cart" data-id="${product.id}">
                        Eliminar
                    </button>
                </div>
            </div>
        `;
        cartList.appendChild(cartItem);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            removeFromCart(e.target.dataset.id);
        });
    });

    cartTotal.textContent = total.toFixed(2);
}

// Utility functions for localStorage
function saveCartToLocalStorage() {
    const cartData = {
        items: Array.from(cart.items.entries())
    };
    localStorage.setItem('plantCart', JSON.stringify(cartData));
}

function loadCartFromLocalStorage() {
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
}

// Updated addToCart function
window.addToCart = function(uuid, name, price) {
    const plant = samplePlants.find(p => p.name === name);
    if (!plant) return;
    
    const product = new Product(
        uuid,
        name,
        price,
        plant.description,
        plant.imageUrl
    );
    
    cart.addItem(product, 1);
    saveCartToLocalStorage();  // <-- Save to localStorage
    renderCart();
    updateCartBadge();         // <-- Update badge count
};

// Updated removeFromCart function
window.removeFromCart = function(uuid) {
    cart.removeItem(uuid);
    saveCartToLocalStorage();  // <-- Save to localStorage
    renderCart();
    updateCartBadge();         // <-- Update badge count
};

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        let totalItems = 0;
        cart.items.forEach(({ amount }) => {
            totalItems += amount;
        });
        badge.textContent = totalItems;
    }
}

// Initialize the app
async function initApp() {
    try {
        // Try to get products from API
        let products = await productService.getProducts();
        
        // If no products in API, create sample plants
        if (products.length === 0) {
            console.log("No products found, creating sample plants...");
            await Promise.all(samplePlants.map(plant => {
                const product = new Product(
                    crypto.randomUUID(),
                    plant.name,
                    plant.price,
                    plant.description,
                    plant.imageUrl
                );
                return productService.createProduct(product);
            }));
            // Reload products after creation
            products = await productService.getProducts();
        }
        
        renderProducts(products);
    } catch (error) {
        console.error("Error loading products:", error);
        // Fallback to showing sample plants if API fails
        const fallbackProducts = samplePlants.map(plant => new Product(
            crypto.randomUUID(),
            plant.name,
            plant.price,
            plant.description,
            plant.imageUrl
        ));
        renderProducts(fallbackProducts);
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', async () => {
    // 1. First clear old products
    await deleteAllProducts();
    
    // 2. Load fresh plants
    try {
      // Try to create sample plants
      await Promise.all(samplePlants.map(plant => {
        const product = new Product(
          crypto.randomUUID(),
          plant.name,
          plant.price,
          plant.description,
          plant.imageUrl
        );
        return productService.createProduct(product);
      }));
      
      // Then load them back
      const freshProducts = await productService.getProducts();
      renderProducts(freshProducts);
    } catch (error) {
      console.error("Using fallback plants:", error);
      renderProducts(samplePlants.map(p => ({
        id: crypto.randomUUID(),
        ...p
      })));
    }
    
    // Load cart
    loadCartFromLocalStorage();
    updateCartBadge();
  });