// Admin credentials and store phone
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const STORE_PHONE = '+8801234567890';

// Initial data (this will persist until admin deletes)
let categories = ['Groceries', 'Electronics', 'Fashion', 'Home & Kitchen'];
let products = [
    {
        id: 1,
        name: 'Fresh Rice',
        price: 65,
        category: 'Groceries',
        image: 'https://via.placeholder.com/300x200?text=Rice',
        offer: '10% off'
    },
    {
        id: 2,
        name: 'Smart Watch',
        price: 2500,
        category: 'Electronics',
        image: 'https://via.placeholder.com/300x200?text=Smart+Watch',
        offer: 'Free Delivery'
    },
    {
        id: 3,
        name: 'Cotton T-Shirt',
        price: 450,
        category: 'Fashion',
        image: 'https://via.placeholder.com/300x200?text=T-Shirt',
        offer: 'Buy 2 Get 1 Free'
    },
    {
        id: 4,
        name: 'Non-Stick Pan',
        price: 850,
        category: 'Home & Kitchen',
        image: 'https://via.placeholder.com/300x200?text=Pan',
        offer: '15% off'
    }
];

// Admin Authentication
function login(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        sessionStorage.setItem('isAdmin', 'true');
        document.querySelector('.admin-panel').style.display = 'block';
        document.getElementById('loginBtn').textContent = 'Logout';
        document.getElementById('loginBtn').onclick = logout;
        hideLoginForm();
        showToast('Logged in as admin');
        displayCategories();
        displayProducts();
    } else {
        showToast('Invalid credentials');
    }
}

function logout() {
    sessionStorage.removeItem('isAdmin');
    document.querySelector('.admin-panel').style.display = 'none';
    document.getElementById('loginBtn').textContent = 'Admin Login';
    document.getElementById('loginBtn').onclick = showLoginForm;
    showToast('Logged out successfully');
    displayCategories();
    displayProducts();
}

function showLoginForm() {
    document.querySelector('.login-container').style.display = 'block';
}

function hideLoginForm() {
    document.querySelector('.login-container').style.display = 'none';
    document.getElementById('loginForm').reset();
}

// Category Management
function addCategory() {
    if (!isAdmin()) {
        showToast('Please login as admin');
        return;
    }
    
    const categoryInput = document.getElementById('categoryName');
    const categoryName = categoryInput.value.trim();
    
    if (!categoryName) {
        showToast('Please enter a category name');
        return;
    }
    
    if (categories.includes(categoryName)) {
        showToast('Category already exists');
        return;
    }
    
    categories.push(categoryName);
    categoryInput.value = '';
    showToast('Category added successfully');
    displayCategories();
    updateCategoryOptions();
}

function deleteCategory(category) {
    if (!isAdmin()) {
        showToast('Please login as admin');
        return;
    }

    if (!confirm('Are you sure you want to delete this category?')) {
        return;
    }
    
    categories = categories.filter(c => c !== category);
    products = products.map(p => {
        if (p.category === category) {
            p.category = '';
        }
        return p;
    });
    
    showToast('Category deleted successfully');
    displayCategories();
    updateCategoryOptions();
    displayProducts();
}

// Product Management
function addProduct() {
    if (!isAdmin()) {
        showToast('Please login as admin');
        return;
    }

    const name = document.getElementById('productName').value.trim();
    const price = document.getElementById('productPrice').value;
    const category = document.getElementById('productCategory').value;
    const image = document.getElementById('productImage').value.trim() || `https://via.placeholder.com/300x200?text=${encodeURIComponent(name)}`;
    const offer = document.getElementById('productOffer').value.trim();
    
    if (!name || !price || !category) {
        showToast('Please fill all required fields');
        return;
    }
    
    const product = {
        id: Date.now(),
        name,
        price: parseFloat(price),
        category,
        image,
        offer
    };
    
    products.push(product);
    
    // Clear form
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productOffer').value = '';
    
    showToast('Product added successfully');
    displayProducts();
}

function deleteProduct(id) {
    if (!isAdmin()) {
        showToast('Please login as admin');
        return;
    }

    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    products = products.filter(p => p.id !== id);
    showToast('Product deleted successfully');
    displayProducts();
}

// Display Functions
function displayCategories() {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = '<button class="category-btn active" onclick="displayProducts()">All Products</button>';
    
    categories.forEach(category => {
        const div = document.createElement('div');
        div.className = 'category-container';
        div.innerHTML = `
            <button class="category-btn" onclick="displayProducts('${category}')">${category}</button>
            ${isAdmin() ? `
                <button class="btn btn-danger btn-small" onclick="deleteCategory('${category}')">
                    <i class="fas fa-times"></i>
                </button>
            ` : ''}
        `;
        categoryList.appendChild(div);
    });
}

function updateCategoryOptions() {
    const select = document.getElementById('productCategory');
    select.innerHTML = '<option value="">Select Category</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

function displayProducts(filterCategory = null) {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    
    let filteredProducts = products;
    if (filterCategory) {
        filteredProducts = products.filter(p => p.category === filterCategory);
    }
    
    if (filteredProducts.length === 0) {
        productList.innerHTML = '<div class="no-products">No products found</div>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}'">
                ${product.offer ? `<div class="offer-badge">${product.offer}</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">৳${product.price}</div>
                <div class="product-category">${product.category}</div>
                <button class="btn btn-primary call-btn" onclick="callToOrder('${product.name}')">
                    <i class="fas fa-phone"></i> Call to Order
                </button>
                ${isAdmin() ? `
                    <div class="admin-buttons">
                        <button class="btn btn-danger" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        productList.appendChild(div);
    });
}

// Search functionality
function searchProducts(query) {
    const searchTerm = query.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
    displayFilteredProducts(filteredProducts);
}

function displayFilteredProducts(filteredProducts) {
    displayProducts();
    if (filteredProducts.length === 0) {
        document.getElementById('productList').innerHTML = '<div class="no-products">No products found</div>';
    }
}

// Utility Functions
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function isAdmin() {
    return sessionStorage.getItem('isAdmin') === 'true';
}

function callToOrder(productName) {
    window.location.href = `tel:${STORE_PHONE}`;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Check admin status
    if (isAdmin()) {
        document.querySelector('.admin-panel').style.display = 'block';
        document.getElementById('loginBtn').textContent = 'Logout';
        document.getElementById('loginBtn').onclick = logout;
    } else {
        document.querySelector('.admin-panel').style.display = 'none';
        document.getElementById('loginBtn').textContent = 'Admin Login';
        document.getElementById('loginBtn').onclick = showLoginForm;
    }
    
    // Initialize form submit handler
    document.getElementById('loginForm').addEventListener('submit', login);
    
    displayCategories();
    updateCategoryOptions();
    displayProducts();
});

