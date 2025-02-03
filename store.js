class Store {
    constructor() {
        this.PRODUCTS_KEY = 'doharBazarProducts';
        this.CATEGORIES_KEY = 'doharBazarCategories';
        this.currentCategory = '';
        
        // Initialize storage
        this.initializeStorage();
        
        // Initial display
        this.displayProducts();
        this.displayCategories();
        this.updateCategoryOptions();
    }

    initializeStorage() {
        if (!localStorage.getItem(this.PRODUCTS_KEY)) {
            localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.CATEGORIES_KEY)) {
            localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify([]));
        }
    }

    // Category Management
    addCategory(event) {
        event.preventDefault();
        const categoryInput = document.getElementById('categoryName');
        const categoryName = categoryInput.value.trim();
        
        if (!categoryName) {
            this.showToast('Please enter a category name');
            return false;
        }

        const categories = this.getCategories();
        if (categories.includes(categoryName)) {
            this.showToast('Category already exists');
            return false;
        }

        try {
            categories.push(categoryName);
            localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
            categoryInput.value = '';
            this.showToast('Category added successfully');
            this.displayCategories();
            this.updateCategoryOptions();
            return true;
        } catch (error) {
            console.error('Error adding category:', error);
            this.showToast('Error adding category');
            return false;
        }
    }

    deleteCategory(categoryName) {
        if (!confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
            return;
        }

        try {
            const categories = this.getCategories().filter(cat => cat !== categoryName);
            localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
            
            const products = this.getProducts().map(product => {
                if (product.category === categoryName) {
                    product.category = '';
                }
                return product;
            });
            localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));

            this.showToast('Category deleted successfully');
            this.displayCategories();
            this.updateCategoryOptions();
            this.displayProducts();
        } catch (error) {
            console.error('Error deleting category:', error);
            this.showToast('Error deleting category');
        }
    }

    // Product Management
    addProduct(event) {
        event.preventDefault();
        
        const productForm = document.getElementById('productForm');
        const submitBtn = productForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        
        const productData = {
            id: Date.now().toString(),
            name: document.getElementById('productName').value.trim(),
            price: document.getElementById('productPrice').value.trim(),
            description: document.getElementById('productDescription').value.trim(),
            category: document.getElementById('productCategory').value.trim(),
            image: document.getElementById('productImage').value.trim(),
            offer: document.getElementById('productOffer').value.trim(),
            dateAdded: new Date().toISOString()
        };

        if (!productData.category) {
            this.showToast('Please select a category', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Add Product';
            return false;
        }

        if (!this.validateProduct(productData)) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Add Product';
            return false;
        }

        try {
            const products = this.getProducts();
            products.push(productData);
            localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));

            productForm.reset();
            this.showToast('Product added successfully', 'success');
            this.displayProducts();
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Add Product';
            return true;
        } catch (error) {
            console.error('Error adding product:', error);
            this.showToast('Error adding product', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Add Product';
            return false;
        }
    }

    updateProduct(event) {
        event.preventDefault();
        
        const productData = {
            id: document.getElementById('editProductId').value,
            name: document.getElementById('editProductName').value.trim(),
            price: document.getElementById('editProductPrice').value.trim(),
            description: document.getElementById('editProductDescription').value.trim(),
            category: document.getElementById('editProductCategory').value.trim(),
            image: document.getElementById('editProductImage').value.trim(),
            offer: document.getElementById('editProductOffer').value.trim()
        };

        if (!this.validateProduct(productData)) {
            return false;
        }

        try {
            const products = this.getProducts().map(product => 
                product.id === productData.id ? {...product, ...productData} : product
            );

            localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
            document.getElementById('editProductModal').style.display = 'none';
            this.showToast('Product updated successfully');
            this.displayProducts();
            return true;
        } catch (error) {
            console.error('Error updating product:', error);
            this.showToast('Error updating product');
            return false;
        }
    }

    deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const products = this.getProducts().filter(product => product.id !== productId);
            localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
            this.showToast('Product deleted successfully');
            this.displayProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showToast('Error deleting product');
        }
    }

    // Display Functions
    displayProducts(filterCategory = '', customProducts = null) {
        const products = customProducts || this.getProducts();
        const productsGrid = document.querySelector('.products-grid');
        const isAdmin = this.isAdminLoggedIn();

        if (!productsGrid) return;

        productsGrid.innerHTML = '';
        
        const filteredProducts = filterCategory ? 
            products.filter(product => product.category === filterCategory) : 
            products;

        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open"></i>
                    <p>No products found</p>
                </div>
            `;
            return;
        }

        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="product-details">
                    <h3>${product.name}</h3>
                    <p class="price">৳${product.price}</p>
                    ${product.offer ? `<p class="offer">${product.offer}</p>` : ''}
                    <p class="description">${product.description}</p>
                    <p class="category">Category: ${product.category || 'Uncategorized'}</p>
                    ${isAdmin ? `
                        <div class="admin-buttons">
                            <button onclick="window.store.editProduct('${product.id}')" class="btn btn-primary">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button onclick="window.store.deleteProduct('${product.id}')" class="btn btn-danger">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    ` : `
                        <button onclick="window.location.href='tel:+8801234567890'" class="btn btn-primary call-btn">
                            <i class="fas fa-phone"></i> Call to Order
                        </button>
                    `}
                </div>
            `;
            
            productsGrid.appendChild(productCard);
        });
    }

    displayCategories() {
        const categories = this.getCategories();
        const categoriesContainer = document.querySelector('.categories');
        const isAdmin = this.isAdminLoggedIn();

        if (!categoriesContainer) return;

        categoriesContainer.innerHTML = `
            <div class="category-item">
                <button class="category-btn ${!this.currentCategory ? 'active' : ''}" 
                        onclick="window.store.filterByCategory('')">
                    All Products
                </button>
            </div>
        `;

        categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.innerHTML = `
                <button class="category-btn ${this.currentCategory === category ? 'active' : ''}"
                        onclick="window.store.filterByCategory('${category}')">
                    ${category}
                </button>
                ${isAdmin ? `
                    <button class="btn btn-danger btn-small" 
                            onclick="window.store.deleteCategory('${category}')">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            `;
            categoriesContainer.appendChild(categoryItem);
        });
    }

    updateCategoryOptions() {
        const categories = this.getCategories();
        const categorySelects = ['productCategory', 'editProductCategory'];

        categorySelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Select Category</option>';
                categories.forEach(category => {
                    select.innerHTML += `<option value="${category}">${category}</option>`;
                });
            }
        });
    }

    // Search functionality
    searchProducts(query) {
        const searchInput = document.getElementById('searchInput');
        const searchQuery = query.trim().toLowerCase();
        
        // Clear search if query is empty
        if (!searchQuery) {
            this.displayProducts(this.currentCategory);
            searchInput.classList.remove('active');
            return;
        }

        searchInput.classList.add('active');
        const products = this.getProducts();
        
        const filteredProducts = products.filter(product => {
            const searchFields = [
                product.name,
                product.description,
                product.category,
                product.offer
            ].map(field => (field || '').toLowerCase());

            // Check if any field contains the search query
            return searchFields.some(field => field.includes(searchQuery));
        });

        // Display filtered products
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) return;

        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-search"></i>
                    <p>No products found matching "${query}"</p>
                    <button onclick="window.store.clearSearch()" class="btn btn-primary">
                        Show All Products
                    </button>
                </div>
            `;
            return;
        }

        this.displayProducts('', filteredProducts);
    }

    clearSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
            searchInput.classList.remove('active');
        }
        this.displayProducts(this.currentCategory);
    }

    // Helper functions
    editProduct(productId) {
        const product = this.getProducts().find(p => p.id === productId);
        if (!product) return;

        document.getElementById('editProductId').value = product.id;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductDescription').value = product.description;
        document.getElementById('editProductCategory').value = product.category;
        document.getElementById('editProductImage').value = product.image;
        document.getElementById('editProductOffer').value = product.offer || '';

        document.getElementById('editProductModal').style.display = 'block';
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.displayProducts(category);
        
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.trim() === (category || 'All Products')) {
                btn.classList.add('active');
            }
        });
    }

    validateProduct(productData) {
        // Check for required fields
        if (!productData.name || !productData.price || !productData.description || !productData.image) {
            this.showToast('Please fill in all required fields');
            return false;
        }

        // Validate price
        const price = parseFloat(productData.price);
        if (isNaN(price) || price <= 0) {
            this.showToast('Please enter a valid price (must be greater than 0)');
            return false;
        }

        // Validate image URL
        try {
            new URL(productData.image);
        } catch (e) {
            this.showToast('Please enter a valid image URL');
            return false;
        }

        // Validate name length
        if (productData.name.length < 3) {
            this.showToast('Product name must be at least 3 characters long');
            return false;
        }

        // Validate description length
        if (productData.description.length < 10) {
            this.showToast('Description must be at least 10 characters long');
            return false;
        }

        return true;
    }

    showToast(message, type = 'info') {
        const toast = document.querySelector('.toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = 'toast show ' + type;
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    }

    getProducts() {
        try {
            return JSON.parse(localStorage.getItem(this.PRODUCTS_KEY)) || [];
        } catch (error) {
            console.error('Error getting products:', error);
            return [];
        }
    }

    getCategories() {
        try {
            return JSON.parse(localStorage.getItem(this.CATEGORIES_KEY)) || [];
        } catch (error) {
            console.error('Error getting categories:', error);
            return [];
        }
    }

    isAdminLoggedIn() {
        return sessionStorage.getItem('isAdmin') === 'true';
    }
}

// Initialize store globally
window.store = new Store();
