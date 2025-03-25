const apiURL = 'https://crudcrud.com/api/848e1304ffc94317a63103ce4d435c33/productos';
const productService = new ProductService(apiURL);
const cartManager = new CartManager();

const samplePlants = [
    { 
        id: "planta1",
        name: "Monstera Deliciosa", 
        price: 42.00, 
        description: "Hojas grandes y perforadas",
        imageUrl: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Findoorplantaddicts.com%2Fwp-content%2Fuploads%2F2020%2F01%2FMonstera-Deliciosa.jpg&f=1&nofb=1&ipt=6a06f2fb3c0764251c899b0e96521fbd96786764369d5b1a03a3c88b11c51aed&ipo=images"
    },
    { 
        id: "planta2",
        name: "Suculenta Echeveria", 
        price: 37.50, 
        description: "Pequeña y con forma de roseta, fácil de cuidar",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwamFJoySqERdqDMB9Esu3F6SZ6yWlmNSsUA&s"
    },
    { 
        id: "planta3",
        name: "Ficus Lyrata", 
        price: 55.00, 
        description: "Planta de interior con hojas grandes y brillantes",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCPSaCC6HD4JxwX8S8M5laeCM9ISv5iGvKMQ&s"
    },
    { 
        id: "planta4",
        name: "Sansevieria", 
        price: 35.00, 
        description: "Resistente y perfecta para purificar el aire",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0_SLbP5kEFhZwesSQcIZN-aC5z_f1BkYC_Q&s"
    }
];

async function loadProducts() {
  try {
      console.log("Loading products from API...");
      let products = await productService.getProducts();
      
      // Validate API response
      if (!Array.isArray(products)) {
          throw new Error("Invalid API response format");
      }

      // Filter out invalid products
      products = products.filter(p => {
          try {
              new Product(p._id, p.name, p.price, p.description, p.imageUrl);
              return true;
          } catch (e) {
              console.warn("Invalid product skipped:", p, e);
              return false;
          }
      });

      // If no valid products, use samples
      if (products.length === 0) {
          console.log("No valid products, using samples");
          products = samplePlants.map(plant => ({
              _id: crypto.randomUUID(),
              ...plant
          }));
      }

      renderProducts(products);
  } catch (error) {
      console.error("Error loading products:", error);
      renderProducts(samplePlants.map(plant => ({
          _id: crypto.randomUUID(),
          ...plant
      })));
  }
}
async function createSamplePlants() {
  return Promise.all(samplePlants.map(plant => {
      const product = new Product(
          crypto.randomUUID(),
          plant.name,
          plant.price,
          plant.description,
          plant.imageUrl
      );
      return productService.createProduct(product);
  }));
}

function renderProducts(products) {
  console.log("Rendering products:", products);
  const productList = document.getElementById('product-list');
  productList.innerHTML = '';

  products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'col-md-3 col-sm-6 mb-4';
      card.innerHTML = `
          <div class="card h-100">
              <img src="${product.imageUrl}" 
                   class="card-img-top" 
                   alt="${product.name}"
                   style="height: 200px; object-fit: cover;"
                   onerror="this.src='https://via.placeholder.com/300x200?text=Plant+Image'">
              <div class="card-body d-flex flex-column">
                  <h5 class="card-title">${product.name}</h5>
                  <p class="card-text">${product.description}</p>
                  <p class="card-text"><strong>$${product.price.toFixed(2)}</strong></p>
                  <button class="btn btn-primary mt-auto add-to-cart" 
                          data-id="${product.id || product._id}"  // Use proper ID field
                          data-name="${product.name}"
                          data-price="${product.price}">
                      Add to Cart
                  </button>
              </div>
          </div>
      `;
      productList.appendChild(card);
  });

  // Add event listeners
  document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', (e) => {
          const {id, name, price} = e.target.dataset;
          addToCart(id, name, parseFloat(price));
      });
  });
}

function addToCart(productId, name, price) {
  try {
    // Find the complete product data
    const plant = samplePlants.find(p => p.name === name) || {
      name,
      price,
      description: "",
      imageUrl: "https://via.placeholder.com/300x200?text=Plant"
    };

    // Create a new Product instance with all necessary data
    const product = new Product(
      productId,  // Use the unique product ID
      name,
      price,
      plant.description,
      plant.imageUrl
    );

    // Add to cart using the product's unique ID
    if (cartManager.addItem(product, 1)) {
      // Show success feedback
      const feedback = document.createElement('div');
      feedback.className = 'alert alert-success position-fixed top-0 end-0 m-3';
      feedback.innerHTML = `
        <i class="fas fa-check-circle"></i> 
        Added ${name} to cart!
        <a href="carrito.html" class="alert-link" 
           onclick="event.stopPropagation(); window.location.href='carrito.html'">
          View Cart
        </a>
      `;
      document.body.appendChild(feedback);
      
      setTimeout(() => {
        if (document.body.contains(feedback)) {
          feedback.remove();
        }
      }, 3000);
      
      return true;
    }
  } catch (e) {
    console.error("Error in addToCart:", e);
  }
  return false;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  cartManager.updateBadge();
});