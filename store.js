class Store {
    constructor() {
        this.currentCategory = '';
        
        // Initial display
        this.displayProducts();
        this.displayCategories();
        this.updateCategoryOptions();
    }

    async getProducts() {
        const response = await fetch('api.php?action=getProducts');
        return await response.json();
    }

    async getCategories() {
        const response = await fetch('api.php?action=getCategories');
        return await response.json();
    }

    // Category Management
    async addCategory(event) {
        event.preventDefault();
        const categoryInput = document.getElementById('categoryName');
        const categoryName = categoryInput.value.trim();
        
        if (!categoryName) {
            this.showToast('Please enter a category name');
            return false;
        }

        try {
            const response = await fetch('api.php?action=addCategory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: categoryName })
            });
            
            if (response.ok) {
                categoryInput.value = '';
                this.showToast('Category added successfully');
                await this.displayCategories();
                await this.updateCategoryOptions();
                return true;
            } else {
                throw new Error('Failed to add category');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showToast('Error adding category. Please try again.');
            return false;
        }
    }

    async deleteCategory(categoryName) {
        if (!confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
            return;
        }

        try {
            const response = await fetch(`api.php?action=deleteCategory&name=${encodeURIComponent(categoryName)}`);
            if (response.ok) {
                this.showToast('Category deleted successfully');
                await this.displayCategories();
                await this.updateCategoryOptions();
                await this.displayProducts();
            } else {
                throw new Error('Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            this.showToast('Error deleting category');
        }
    }

    // Product Management
    async addProduct(event) {
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

        try {
            const response = await fetch('api.php?action=addProduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                productForm.reset();
                this.showToast('Product added successfully');
                await this.displayProducts();
            } else {
                throw new Error('Failed to add product');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            this.showToast('Error adding product');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Add Product';
        }
    }

    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const response = await fetch(`api.php?action=deleteProduct&id=${productId}`);
            if (response.ok) {
                this.showToast('Product deleted successfully');
                await this.displayProducts();
            } else {
                throw new Error('Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showToast('Error deleting product');
        }
    }

    async displayProducts() {
        const productsContainer = document.getElementById('productsContainer');
        const products = await this.getProducts();
        const filteredProducts = this.currentCategory ? 
            products.filter(product => product.category === this.currentCategory) : 
            products;

        productsContainer.innerHTML = filteredProducts.map(product => `
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}" onerror="this.src='placeholder.jpg'">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description}</p>
                        <p class="card-text"><strong>Price: ৳${product.price}</strong></p>
                        ${product.offer ? `<p class="card-text text-success"><strong>Offer: ${product.offer}</strong></p>` : ''}
                        ${product.category ? `<p class="card-text"><small class="text-muted">Category: ${product.category}</small></p>` : ''}
                        <button class="btn btn-danger" onclick="store.deleteProduct('${product.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async displayCategories() {
        const categoriesContainer = document.getElementById('categoriesContainer');
        const categories = await this.getCategories();
        
        categoriesContainer.innerHTML = `
            <button class="btn ${!this.currentCategory ? 'btn-primary' : 'btn-outline-primary'} m-1" 
                    onclick="store.filterByCategory('')">
                All
            </button>` +
            categories.map(category => `
                <div class="btn-group m-1">
                    <button class="btn ${this.currentCategory === category ? 'btn-primary' : 'btn-outline-primary'}"
                            onclick="store.filterByCategory('${category}')">
                        ${category}
                    </button>
                    <button class="btn btn-outline-danger" onclick="store.deleteCategory('${category}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
    }

    async updateCategoryOptions() {
        const categorySelect = document.getElementById('productCategory');
        const categories = await this.getCategories();
        
        categorySelect.innerHTML = `
            <option value="">Select Category</option>
            ${categories.map(category => `
                <option value="${category}">${category}</option>
            `).join('')}
        `;
    }

    async filterByCategory(category) {
        this.currentCategory = category;
        await this.displayProducts();
        
        const categoryButtons = document.querySelectorAll('#categoriesContainer .btn-primary');
        categoryButtons.forEach(button => button.classList.replace('btn-primary', 'btn-outline-primary'));
        
        if (category) {
            const activeButton = document.querySelector(`#categoriesContainer button[onclick="store.filterByCategory('${category}')"]`);
            if (activeButton) {
                activeButton.classList.replace('btn-outline-primary', 'btn-primary');
            }
        } else {
            const allButton = document.querySelector('#categoriesContainer button[onclick="store.filterByCategory(\'\')"]');
            if (allButton) {
                allButton.classList.replace('btn-outline-primary', 'btn-primary');
            }
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast show position-fixed bottom-0 end-0 m-3';
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="toast-header">
                <strong class="me-auto">Notification</strong>
                <button type="button" class="btn-close" onclick="this.closest('.toast').remove()"></button>
            </div>
            <div class="toast-body">${message}</div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Initialize store globally
window.store = new Store();
