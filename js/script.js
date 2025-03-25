// Add this CartManager class at the top of script.js
class CartManager {
    constructor() {
      this.cart = new Cart();
      this.loadCart();
    }
  
    saveCart() {
      const cartData = {
        items: Array.from(this.cart.items.entries())
      };
      localStorage.setItem('plantCart', JSON.stringify(cartData));
      this.updateBadge();
    }
  
    loadCart() {
      const saved = localStorage.getItem('plantCart');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.items.forEach(([id, item]) => {
          const product = new Product(
            id,
            item.product.name,
            item.product.price,
            item.product.description,
            item.product.imageUrl
          );
          this.cart.items.set(id, { product, amount: item.amount });
        });
      }
    }
  
    updateBadge() {
      const badges = document.querySelectorAll('.cart-badge');
      const count = Array.from(this.cart.items.values())
                       .reduce((sum, item) => sum + item.amount, 0);
      badges.forEach(badge => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
      });
    }
  }
  
  // Initialize the cart manager
  const cartManager = new CartManager();
class ProductException extends Error {
    constructor(message) {
      super(message);
      this.name = "ProductException";
    }
  }
  
  class Product {
    constructor(id, name, price, description, imageUrl = "") {
        this.id = id;
        this.name = name;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
    }

    // ... (keep all existing getters and setters)

    // Add imageUrl getter and setter
    get imageUrl() { return this._imageUrl; }
    set imageUrl(value) {
        if (typeof value !== "string") throw new ProductException("URL de imagen inválida");
        this._imageUrl = value;
    }
  
    get name() { return this._name; }
    set name(value) {
      if (!value || typeof value !== "string" || value.trim() === "") {
        throw new ProductException("Nombre inválido");
      }
      this._name = value;
    }
  
    get price() { return this._price; }
    set price(value) {
      if (isNaN(value) || value < 0) throw new ProductException("Precio inválido");
      this._price = value;
    }
  
    get description() { return this._description; }
    set description(value) {
      if (typeof value !== "string") throw new ProductException("Descripción inválida");
      this._description = value;
    }
  
    // Crea instancia desde JSON (string)
    static createFromJson(jsonValue) {
      try {
        const obj = JSON.parse(jsonValue);
        return Product.createFromObject(obj);
      } catch (err) {
        throw new ProductException("JSON inválido");
      }
    }
  
    // Crea instancia desde un objeto
    static createFromObject(obj) {
      if (typeof obj !== "object" || obj === null) throw new ProductException("Objeto inválido");
      const { _id, name, price, description } = obj;
      return new Product(_id, name, price, description);
    }
  }


  class CartException extends Error {
    constructor(message) {
      super(message);
      this.name = "CartException";
    }
  }
  
  class Cart {
    constructor() {
      // Map: productUuid -> { product: Product, amount: number }
      this.items = new Map();
    }
  
    // Agrega o actualiza cantidad
    addItem(product, amount) {
      if (!(product instanceof Product)) throw new CartException("Producto inválido");
      if (isNaN(amount) || amount <= 0) throw new CartException("Cantidad inválida");
  
      const uuid = product.id;  // Usamos el _id como identificador único
      const existing = this.items.get(uuid);
  
      if (existing) {
        existing.amount += amount;
      } else {
        this.items.set(uuid, { product, amount });
      }
    }
  
    // Actualiza la cantidad de un producto
    updateItem(productUuid, newAmount) {
      if (!this.items.has(productUuid)) throw new CartException("Producto no encontrado");
      if (isNaN(newAmount)) throw new CartException("Cantidad inválida");
  
      if (newAmount < 0) throw new CartException("Cantidad no puede ser negativa");
      if (newAmount === 0) {
        this.items.delete(productUuid);
      } else {
        this.items.get(productUuid).amount = newAmount;
      }
    }
  
    // Elimina un producto
    removeItem(productUuid) {
      if (!this.items.has(productUuid)) throw new CartException("Producto no encontrado");
      this.items.delete(productUuid);
    }
  
    // Calcula el total
    calculateTotal() {
      let total = 0;
      for (const { product, amount } of this.items.values()) {
        total += product.price * amount;
      }
      return total;
    }
  
    // (Opcional) Ver carrito en consola
    printCart() {
      console.log("Carrito:");
      for (const [uuid, { product, amount }] of this.items.entries()) {
        console.log(`${product.name} - Cantidad: ${amount} - Precio unitario: $${product.price}`);
      }
      console.log("Total: $" + this.calculateTotal());
    }
  }

  class ProductService {
    constructor(apiUrl) {
      this.apiUrl = apiUrl; // Ejemplo: 'https://crudcrud.com/api/TU_API_KEY/productos'
    }
  
    // Leer todos los productos
    async getProducts() {
      const res = await fetch(this.apiUrl);
      if (!res.ok) throw new Error("Error al obtener productos");
      const data = await res.json();
      return data.map(obj => Product.createFromObject(obj));
    }
  
    // Leer un producto por su UUID (_id)
    async getProductById(uuid) {
      const res = await fetch(`${this.apiUrl}/${uuid}`);
      if (!res.ok) throw new Error("Producto no encontrado");
      const obj = await res.json();
      return Product.createFromObject(obj);
    }

    async createProduct(product) {
        if (!(product instanceof Product)) throw new Error("Producto inválido");
        const res = await fetch(this.apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                _id: product.id,
                name: product.name,
                price: product.price,
                description: product.description,
                imageUrl: product.imageUrl
            })
        });
        if (!res.ok) throw new Error("Error al crear el producto");
        return await res.json();
    }
  
    // Crear un nuevo producto (POST)
// script.js - Update ProductService methods
    async createProduct(product) {
        if (!(product instanceof Product)) throw new Error("Producto inválido");
        const res = await fetch(this.apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: product.name,
                price: product.price,
                description: product.description,
                imageUrl: product.imageUrl
            })
        });
        if (!res.ok) throw new Error("Error al crear el producto");
        return await res.json();
    }

    async updateProduct(uuid, updatedProduct) {
        if (!(updatedProduct instanceof Product)) throw new Error("Producto inválido");
        const res = await fetch(`${this.apiUrl}/${uuid}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: updatedProduct.name,
                price: updatedProduct.price,
                description: updatedProduct.description,
                imageUrl: updatedProduct.imageUrl
            })
        });
        if (!res.ok) throw new Error("Error al actualizar el producto");
    }
  
    // Eliminar un producto por ID (DELETE)
    async deleteProduct(uuid) {
      const res = await fetch(`${this.apiUrl}/${uuid}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Error al eliminar el producto");
    }
  }
  