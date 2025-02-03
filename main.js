// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const STORE_PHONE = '+8801234567890'; // Replace with your actual phone number

// Initialize local storage with default data if empty
function initializeLocalStorage() {
    if (!localStorage.getItem('categories')) {
        localStorage.setItem('categories', JSON.stringify([]));
    }
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify([]));
    }
}

// Login functionality
function login(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'admin123') {
        sessionStorage.setItem('isAdmin', 'true');
        document.querySelector('.admin-panel').style.display = 'block';
        document.getElementById('loginBtn').textContent = 'Logout';
        document.getElementById('loginBtn').onclick = logout;
        hideLoginForm();
        window.store.showToast('Logged in as admin');
        window.store.displayProducts();
        window.store.displayCategories();
    } else {
        window.store.showToast('Invalid credentials');
    }
}

function logout() {
    sessionStorage.removeItem('isAdmin');
    document.querySelector('.admin-panel').style.display = 'none';
    document.getElementById('loginBtn').textContent = 'Admin Login';
    document.getElementById('loginBtn').onclick = showLoginForm;
    window.store.showToast('Logged out successfully');
    window.store.displayProducts();
    window.store.displayCategories();
}

function showLoginForm() {
    document.querySelector('.login-container').style.display = 'block';
}

function hideLoginForm() {
    document.querySelector('.login-container').style.display = 'none';
    document.getElementById('loginForm').reset();
}

// Product Management
function addProduct(event) {
    event.preventDefault(); // Prevent form submission
    
    const name = document.getElementById('productName').value.trim();
    const price = document.getElementById('productPrice').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const category = document.getElementById('productCategory').value.trim();
    const image = document.getElementById('productImage').value.trim();
    const offer = document.getElementById('productOffer').value.trim();

    if (!category) {
        showToast('Please select a category');
        return;
    }

    if (!name || !price || !description || !image) {
        showToast('Please fill in all required fields');
        return;
    }

    const products = JSON.parse(localStorage.getItem('products')) || [];
    const newProduct = {
        id: Date.now(),
        name,
        price,
        description,
        category,
        image,
        offer
    };

    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    // Reset the form
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productOffer').value = '';

    // Update displays
    displayProducts();
    showToast('Product added successfully!');
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products = products.filter(product => product.id !== id);
        localStorage.setItem('products', JSON.stringify(products));
        displayProducts();
        showToast('Product deleted successfully!');
    }
}

function editProduct(id) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === id);
    
    if (!product) {
        showToast('Product not found!');
        return;
    }

    // Fill the edit form with product details
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductDescription').value = product.description;
    document.getElementById('editProductCategory').value = product.category;
    document.getElementById('editProductImage').value = product.image;
    document.getElementById('editProductOffer').value = product.offer || '';

    // Update category options in edit form
    updateCategoryOptions('editProductCategory');

    // Show edit modal
    document.getElementById('editProductModal').style.display = 'block';
}

function updateProduct(event) {
    event.preventDefault(); // Prevent form submission

    const id = parseInt(document.getElementById('editProductId').value);
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
        showToast('Product not found!');
        return;
    }

    products[index] = {
        id,
        name: document.getElementById('editProductName').value.trim(),
        price: document.getElementById('editProductPrice').value.trim(),
        description: document.getElementById('editProductDescription').value.trim(),
        category: document.getElementById('editProductCategory').value.trim(),
        image: document.getElementById('editProductImage').value.trim(),
        offer: document.getElementById('editProductOffer').value.trim()
    };

    localStorage.setItem('products', JSON.stringify(products));
    document.getElementById('editProductModal').style.display = 'none';
    displayProducts();
    showToast('Product updated successfully!');
}

// Category Management
function addCategory(event) {
    event.preventDefault(); // Prevent form submission
    
    const categoryName = document.getElementById('categoryName').value.trim();
    
    if (!categoryName) {
        showToast('Please enter a category name');
        return;
    }

    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    
    if (categories.includes(categoryName)) {
        showToast('Category already exists!');
        return;
    }

    categories.push(categoryName);
    localStorage.setItem('categories', JSON.stringify(categories));
    
    // Reset form
    document.getElementById('categoryName').value = '';
    
    // Update displays
    displayCategories();
    updateCategoryOptions('productCategory');
    updateCategoryOptions('editProductCategory');
    showToast('Category added successfully!');
}

function deleteCategory(category) {
    if (confirm('Are you sure you want to delete this category? All products in this category will be affected.')) {
        let categories = JSON.parse(localStorage.getItem('categories')) || [];
        categories = categories.filter(c => c !== category);
        localStorage.setItem('categories', JSON.stringify(categories));
        
        // Update products that were in this category
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products = products.map(p => {
            if (p.category === category) {
                p.category = 'Uncategorized';
            }
            return p;
        });
        localStorage.setItem('products', JSON.stringify(products));
        
        // Update displays
        displayCategories();
        displayProducts();
        updateCategoryOptions('productCategory');
        updateCategoryOptions('editProductCategory');
        showToast('Category deleted successfully!');
    }
}

// Display Functions
function displayProducts(category = null) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const productsGrid = document.querySelector('.products-grid');
    productsGrid.innerHTML = '';

    const filteredProducts = category ? 
        products.filter(p => p.category === category) : 
        products;

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<div class="no-results">No products found</div>';
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <h3>${product.name}</h3>
            <p class="price">৳${product.price}</p>
            ${product.offer ? `<p class="offer">${product.offer}</p>` : ''}
            <p>${product.description}</p>
            <button class="call-order-btn" onclick="callToOrder('${product.name}')">
                <i class="fas fa-phone"></i> Call to Order
            </button>
            ${sessionStorage.getItem('isAdmin') === 'true' ? `
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button onclick="editProduct(${product.id})" class="btn btn-primary">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteProduct(${product.id})" class="btn btn-danger">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            ` : ''}
        `;
        productsGrid.appendChild(productCard);
    });
}

function displayCategories() {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const categoriesContainer = document.querySelector('.categories');
    
    if (!categoriesContainer) return;

    categoriesContainer.innerHTML = `
        <button class="category-btn active" onclick="displayProducts(null)">All Products</button>
        ${categories.map(category => `
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <button class="category-btn" onclick="displayProducts('${category}')">${category}</button>
                ${sessionStorage.getItem('isAdmin') === 'true' ? 
                    `<button onclick="deleteCategory('${category}')" class="btn btn-danger" style="padding: 0.3rem 0.6rem;">
                        <i class="fas fa-times"></i>
                    </button>` : 
                    ''}
            </div>
        `).join('')}
    `;

    // Add click handler for category buttons
    const categoryButtons = categoriesContainer.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function updateCategoryOptions(selectId) {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const select = document.getElementById(selectId);
    
    if (!select) return;

    select.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

// Search functionality
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );

    displayFilteredProducts(filteredProducts);
}

function displayFilteredProducts(products) {
    const productsGrid = document.querySelector('.products-grid');
    productsGrid.innerHTML = '';

    if (products.length === 0) {
        productsGrid.innerHTML = '<div class="no-results">No products found</div>';
        return;
    }

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <h3>${product.name}</h3>
            <p class="price">৳${product.price}</p>
            ${product.offer ? `<p class="offer">${product.offer}</p>` : ''}
            <p>${product.description}</p>
            <button class="call-order-btn" onclick="callToOrder('${product.name}')">
                <i class="fas fa-phone"></i> Call to Order
            </button>
            ${sessionStorage.getItem('isAdmin') === 'true' ? `
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button onclick="editProduct(${product.id})" class="btn btn-primary">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteProduct(${product.id})" class="btn btn-danger">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            ` : ''}
        `;
        productsGrid.appendChild(productCard);
    });
}

// Call to Order functionality
function callToOrder(productName) {
    window.location.href = `tel:${STORE_PHONE}`;
}

// UI Helper functions
function showToast(message) {
    const toast = document.querySelector('.toast');
    if (!toast) return;

    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set up login button
    const loginBtn = document.getElementById('loginBtn');
    if (sessionStorage.getItem('isAdmin') === 'true') {
        document.querySelector('.admin-panel').style.display = 'block';
        loginBtn.textContent = 'Logout';
        loginBtn.onclick = logout;
    } else {
        document.querySelector('.admin-panel').style.display = 'none';
        loginBtn.textContent = 'Admin Login';
        loginBtn.onclick = showLoginForm;
    }

    // Set up login form
    document.getElementById('loginForm').onsubmit = login;

    // Initialize store display
    if (window.store) {
        window.store.displayProducts();
        window.store.displayCategories();
        window.store.updateCategoryOptions();
    }
});
