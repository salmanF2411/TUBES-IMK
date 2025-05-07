// ====== Header Section Start ======
const menuIcon = document.querySelector(".menu-icon");
const navbar = document.querySelector(".navbar");
const cart = document.querySelector(".cart");
const loginForm = document.querySelector(".login-form");
const cartIcon = document.querySelector("#cart-icon");
const userIcon = document.querySelector("#user-icon");

const userNameContainer = document.querySelector(".user-name-container");
const navbarUsername = document.getElementById("navbarUsername");
const logoutBtn = document.getElementById("logoutBtn");

const loginFormElement = document.getElementById("loginForm");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const createAccountForm = document.getElementById("createAccountForm");
const resetPasswordForm = document.getElementById("resetPasswordForm");

let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

const originalPrices = new WeakMap();

// Function to check if user is logged in
function checkLogin() {
  return currentUser !== null;
}

// Function to show login required message
function showLoginRequired() {
  showNotification(
    "Silakan login terlebih dahulu untuk mengakses keranjang",
    true
  );
  loginForm.classList.add("active");
  cart.classList.remove("active");
}

// Toggle cart icon visibility
function toggleCartIconVisibility() {
  if (navbar.classList.contains("active")) {
    cartIcon.style.display = "none";
  } else {
    cartIcon.style.display = "block";
  }
}

// Notification function
function showNotification(message, isError = false) {
  // Remove old notification if exists
  const oldNotification = document.querySelector(".notification");
  if (oldNotification) {
    oldNotification.remove();
  }

  const notification = document.createElement("div");
  notification.className = `notification ${isError ? "error" : ""}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.5s ease-out";
    setTimeout(() => notification.remove(), 500);
  }, 5000);
}

// Toggle functions
menuIcon.onclick = () => {
  navbar.classList.toggle("active");
  menuIcon.classList.toggle("move");
  cart.classList.remove("active");
  loginForm.classList.remove("active");
  closeDropdown();
  toggleCartIconVisibility();
};

cartIcon.onclick = () => {
  if (!checkLogin()) {
    showLoginRequired();
    return;
  }
  cart.classList.toggle("active");
  navbar.classList.remove("active");
  menuIcon.classList.remove("move");
  loginForm.classList.remove("active");
  closeDropdown();
  cartIcon.style.display = "block";
};

userIcon.onclick = () => {
  loginForm.classList.toggle("active");
  cart.classList.remove("active");
  navbar.classList.remove("active");
  menuIcon.classList.remove("move");
  closeDropdown();
  cartIcon.style.display = "block";

  // Show login form by default
  loginFormElement.classList.add("active");
  forgotPasswordForm.classList.remove("active");
  createAccountForm.classList.remove("active");
  resetPasswordForm.classList.remove("active");
};

// User functions
function closeDropdown() {
  document.querySelector(".name-dropdown")?.classList.remove("active");
}

function updateNavbarUsername() {
  const newsletterSection = document.querySelector(".newsletter");

  if (currentUser?.name) {
    navbarUsername.textContent = currentUser.name;
    userIcon.style.display = "none";
    userNameContainer.style.display = "flex";
    if (newsletterSection) newsletterSection.style.display = "none";
  } else {
    navbarUsername.textContent = "Guest";
    userIcon.style.display = "block";
    userNameContainer.style.display = "none";
    if (newsletterSection) newsletterSection.style.display = "block";
  }
}

// Price functions
function applyDiscounts() {
  const priceElements = document.querySelectorAll(
    ".products-content .title-price span, .popular-content .title-price span"
  );
  const discount = 0.2;

  priceElements.forEach((element) => {
    if (element.dataset.discounted === "true") return;

    const originalPriceText = element.textContent
      .replace("Rp", "")
      .replace(/\./g, "")
      .trim();
    const originalPrice = parseFloat(originalPriceText);

    if (!isNaN(originalPrice)) {
      originalPrices.set(element, originalPrice);
      const discountedPrice = originalPrice * (1 - discount);

      element.textContent = `Rp ${Math.round(discountedPrice).toLocaleString(
        "id-ID"
      )}`;
      element.style.color = "#4CAF50";
      element.style.fontWeight = "bold";
      element.dataset.discounted = "true";

      const originalPriceDisplay = document.createElement("span");
      originalPriceDisplay.className = "original-price";
      originalPriceDisplay.textContent = ` Rp ${originalPrice.toLocaleString(
        "id-ID"
      )}`;
      originalPriceDisplay.style.textDecoration = "line-through";
      originalPriceDisplay.style.color = "#777";
      originalPriceDisplay.style.fontSize = "0.8em";
      originalPriceDisplay.style.marginLeft = "5px";

      element.parentNode.insertBefore(
        originalPriceDisplay,
        element.nextSibling
      );
    }
  });
}

function removeDiscounts() {
  const priceElements = document.querySelectorAll(
    ".products-content .title-price span, .popular-content .title-price span"
  );

  priceElements.forEach((element) => {
    if (element.dataset.discounted === "true") {
      const originalPrice = originalPrices.get(element);
      if (originalPrice !== undefined) {
        element.textContent = `Rp ${originalPrice.toLocaleString("id-ID")}`;
        element.style.color = "";
        element.style.fontWeight = "";
        element.removeAttribute("data-discounted");

        const originalPriceDisplay = element.nextElementSibling;
        if (originalPriceDisplay?.classList.contains("original-price")) {
          originalPriceDisplay.remove();
        }
      }
    }
  });
}

// Validation functions
function isValidUsername(name) {
  return /^[a-zA-Z0-9 ]{3,30}$/.test(name);
}

function isValidPassword(password) {
  return password.length >= 6 && password.length <= 30;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Redirect to home function
function redirectToHome() {
  window.location.href = "index.html";
}

// Event listeners
navbarUsername?.addEventListener("click", function (e) {
  e.stopPropagation();
  this.closest(".name-dropdown").classList.toggle("active");
});

// User authentication
loginFormElement?.addEventListener("submit", function (e) {
  e.preventDefault();
  const email = this.querySelector('input[name="email"]').value;
  const password = this.querySelector('input[name="password"]').value;

  if (!isValidEmail(email)) {
    showNotification("Format email tidak valid", true);
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    updateNavbarUsername();
    loginForm.classList.remove("active");
    this.reset();

    applyDiscounts();
    showNotification("Login berhasil! Anda mendapatkan diskon 20%");
  } else {
    showNotification("Email atau password salah", true);
  }
});

// Create account
createAccountForm?.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = this.querySelector('input[name="name"]').value;
  const email = this.querySelector('input[name="email"]').value;
  const password = this.querySelector('input[name="password"]').value;
  const confirmPassword = this.querySelector(
    'input[name="confirm-password"]'
  ).value;

  if (!isValidUsername(name)) {
    showNotification(
      "Username harus 3-30 karakter dan bisa mengandung huruf, angka, dan spasi",
      true
    );
    return;
  }

  if (!isValidEmail(email)) {
    showNotification("Format email tidak valid", true);
    return;
  }

  if (!isValidPassword(password)) {
    showNotification("Password harus 6-30 karakter", true);
    return;
  }

  if (password !== confirmPassword) {
    showNotification("Password tidak cocok", true);
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.some((u) => u.email === email)) {
    showNotification("Email sudah digunakan", true);
    return;
  }

  const newUser = { name, email, password };
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  currentUser = newUser;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  updateNavbarUsername();
  this.reset();

  applyDiscounts();
  showNotification("Akun berhasil dibuat! Anda mendapatkan diskon 20%");

  redirectToHome();
});

// Forgot password
forgotPasswordForm?.addEventListener("submit", function (e) {
  e.preventDefault();
  const email = this.querySelector('input[name="email"]').value;

  if (!isValidEmail(email)) {
    showNotification("Format email tidak valid", true);
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find((u) => u.email === email);

  if (user) {
    forgotPasswordForm.classList.remove("active");
    resetPasswordForm.classList.add("active");
    resetPasswordForm.setAttribute("data-email", email);
    showNotification("Silakan buat password baru");
  } else {
    showNotification("Email tidak ditemukan", true);
  }
});

// Reset password
resetPasswordForm?.addEventListener("submit", function (e) {
  e.preventDefault();
  const email = this.getAttribute("data-email");
  const newPassword = this.querySelector('input[name="new-password"]').value;
  const confirmPassword = this.querySelector(
    'input[name="confirm-new-password"]'
  ).value;

  if (!isValidPassword(newPassword)) {
    showNotification("Password harus 6-30 karakter", true);
    return;
  }

  if (newPassword !== confirmPassword) {
    showNotification("Password tidak cocok", true);
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  const userIndex = users.findIndex((u) => u.email === email);

  if (userIndex !== -1) {
    users[userIndex].password = newPassword;
    localStorage.setItem("users", JSON.stringify(users));

    if (currentUser && currentUser.email === email) {
      currentUser.password = newPassword;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }

    showNotification(
      "Password berhasil diubah! Silakan login dengan password baru"
    );
    this.reset();
    resetPasswordForm.classList.remove("active");
    loginFormElement.classList.add("active");
  } else {
    showNotification("Terjadi kesalahan, silakan coba lagi", true);
  }
});

// Logout
logoutBtn?.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();

  currentUser = null;
  localStorage.removeItem("currentUser");
  updateNavbarUsername();

  loginForm.classList.remove("active");
  closeDropdown();
  loginFormElement.classList.add("active");
  forgotPasswordForm.classList.remove("active");
  createAccountForm.classList.remove("active");
  resetPasswordForm.classList.remove("active");
  loginFormElement.reset();

  removeDiscounts();
  showNotification("Anda telah logout");
});

// Close dropdown when clicking outside
document.addEventListener("click", function (e) {
  if (!e.target.closest(".name-dropdown") && !e.target.matches(".user-name")) {
    closeDropdown();
  }
});

// Form navigation
document.querySelectorAll(".forgot-password-link")?.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    loginFormElement.classList.remove("active");
    forgotPasswordForm.classList.add("active");
    resetPasswordForm.classList.remove("active");
  });
});

document.querySelectorAll(".create-account-link")?.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    loginFormElement.classList.remove("active");
    createAccountForm.classList.add("active");
    resetPasswordForm.classList.remove("active");
  });
});

document.querySelectorAll(".back-to-login")?.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    forgotPasswordForm.classList.remove("active");
    createAccountForm.classList.remove("active");
    resetPasswordForm.classList.remove("active");
    loginFormElement.classList.add("active");
  });
});

// Initialize
updateNavbarUsername();
if (localStorage.getItem("currentUser")) {
  applyDiscounts();
}
// ====== Header Section End ======
// search button
document.getElementById("search-btn").addEventListener("click", function () {
  var searchInput = document.getElementById("search");
  searchInput.classList.toggle("show");
  if (searchInput.classList.contains("show")) {
    searchInput.focus();
  }
});
// search button end

const scrollTopBtn = document.querySelector(".scroll-top");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    scrollTopBtn.classList.add("active");
  } else {
    scrollTopBtn.classList.remove("active");
  }
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo(0, 0); // Scroll langsung ke atas tanpa animasi
});

// scrollTopBtn.addEventListener("click", () => {
//   window.scrollTo({ top: 0, behavior: "smooth" });
// });

// ====== Scroll Top Button Functionality End ======

// ====== Email JS Start ======
// Initialize EmailJS dengan User ID Anda

// ====== Email JS End ======


// Search
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");
const productBoxes = document.querySelectorAll(".products-content .box");

// Function to filter products based on search input
function filterProducts(searchTerm) {
  const term = searchTerm.toLowerCase();

  productBoxes.forEach((box) => {
    const productName = box.querySelector("h3").textContent.toLowerCase();
    if (productName.includes(term)) {
      box.style.display = "block"; // Show matching products
    } else {
      box.style.display = "none"; // Hide non-matching products
    }
  });
}

// Event listener for search input
searchInput.addEventListener("input", (e) => {
  filterProducts(e.target.value);
});

// Event listener for search button
searchBtn.addEventListener("click", () => {
  filterProducts(searchInput.value);
});

// Optional: Add keypress event for Enter key
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    filterProducts(searchInput.value);
  }
});

// Keranjang
document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = checkLogin();
  const userCartKey = isLoggedIn ? `cart_${currentUser?.email}` : "guest_cart";
  const userTransactionKey = isLoggedIn ? `transactions_${currentUser?.email}` : null;
  
  let cart = isLoggedIn
    ? JSON.parse(localStorage.getItem(userCartKey)) || []
    : [];

  // Load transactions from localStorage
  let transactions = isLoggedIn && userTransactionKey 
    ? JSON.parse(localStorage.getItem(userTransactionKey)) || []
    : [];

  // Payment method variables
  let selectedPaymentMethod = null;
  let selectedBank = {
    code: null,
    name: null,
    logo: null
  };

  // DOM Elements
  const cartElement = document.querySelector(".cart");
  const cartContainer = document.querySelector(".cart-content");
  const cartItemsContainer = document.querySelector(".cart-items-container");
  const cartToggle = document.querySelector(".cart-toggle");
  const closeCartBtn = document.querySelector(".close-cart");
  const paymentModal = document.querySelector(".payment-modal");
  const closePaymentBtn = document.querySelector(".close-payment");
  const paymentMethods = document.querySelectorAll(".payment-method");
  const bankModal = document.querySelector(".bank-modal");
  const accountModal = document.querySelector(".account-modal");
  const closeBankBtn = document.querySelector(".close-bank");
  const closeAccountBtn = document.querySelector(".close-account");
  const bankOptions = document.querySelectorAll(".bank-option");
  const confirmBtn = document.querySelector(".confirm-payment");
  const historyTabBtn = document.querySelector(".history-tab");
  const cartTabBtn = document.querySelector(".cart-tab");
  const cartFooter = document.querySelector(".cart-footer");
  const cartTitle = document.querySelector(".cart-title");

  // Toggle between cart and history views
  let currentView = 'cart'; // 'cart' or 'history'

  function setupTabButtons() {
    if (!historyTabBtn || !cartTabBtn) return;
    
    historyTabBtn.addEventListener("click", function(e) {
      e.preventDefault();
      currentView = 'history';
      updateCartDisplay();
      cartTabBtn.classList.remove("active");
      historyTabBtn.classList.add("active");
      cartTitle.textContent = "Riwayat Pesanan";
      cartFooter.style.display = "none";
    });
    
    cartTabBtn.addEventListener("click", function(e) {
      e.preventDefault();
      currentView = 'cart';
      updateCartDisplay();
      historyTabBtn.classList.remove("active");
      cartTabBtn.classList.add("active");
      cartTitle.textContent = "Keranjang Anda";
      cartFooter.style.display = "flex";
    });
  }

  // Save transaction to history
  function saveTransaction(transactionData) {
    if (!isLoggedIn) return;
    
    transactions.unshift(transactionData); // Add new transaction to beginning
    if (transactions.length > 10) {
      transactions = transactions.slice(0, 10); // Keep only last 10 transactions
    }
    
    localStorage.setItem(userTransactionKey, JSON.stringify(transactions));
  }

  // Toggle cart visibility
  function toggleCart(open = false) {
    if (open) {
      cartElement.classList.add("active");
      hideCartToggle();
    } else {
      cartElement.classList.toggle("active");
      if (cartElement.classList.contains("active")) {
        hideCartToggle();
      } else {
        showCartToggle();
      }
    }
  }

  function hideCartToggle() {
    if (cartToggle) {
      cartToggle.style.display = "none";
      cartToggle.classList.add("hidden-during-payment");
    }
  }

  function showCartToggle() {
    if (
      cartToggle &&
      !paymentModal.classList.contains("active") &&
      !bankModal.classList.contains("active") &&
      !accountModal.classList.contains("active")
    ) {
      cartToggle.style.display = "block";
      cartToggle.classList.remove("hidden-during-payment");
    }
  }

  // Close cart
  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", function () {
      cartElement.classList.remove("active");
      showCartToggle();
    });
  }

  // Toggle cart
  if (cartToggle) {
    cartToggle.addEventListener("click", function (e) {
      e.preventDefault();
      if (!checkLogin()) {
        showLoginRequired();
        return;
      }
      toggleCart();
    });
  }

  // Close cart when clicking outside
  cartElement.addEventListener("click", function (e) {
    if (e.target === cartElement) {
      toggleCart();
    }
  });

  // Make cart items clickable
  function makeCartItemsClickable() {
    document
      .querySelectorAll(".cart-box img, .cart-box .cart-text h3")
      .forEach((element) => {
        element.style.cursor = "pointer";
        element.addEventListener("click", function (e) {
          e.stopPropagation();
          const cartBox = this.closest(".cart-box");
          const index = parseInt(
            cartBox.querySelector(".remove-item").getAttribute("data-index")
          );
          const productName = cart[index].name;
          navigateToProductDetail(productName);
        });
      });
  }

  function navigateToProductDetail(productName) {
    console.log(`Navigasi ke detail produk: ${productName}`);
    showNotification(`Membuka detail produk: ${productName}`);
  }

  // Update cart display
  function updateCartDisplay() {
    if (cartContainer && cartItemsContainer) {
      cartItemsContainer.innerHTML = "";

      if (currentView === 'history') {
        showTransactionHistory();
        return;
      }

      if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
          <div class="empty-cart">
            <i class="ri-shopping-cart-line"></i>
            <p>Keranjang belanja kosong</p>
            <a href="products.html" class="btn">Belanja Sekarang</a>
          </div>
        `;
        document.querySelector(".total h3").textContent = "0 Items";
        document.querySelector(".total span").textContent = "Total Rp. 0";
        saveCartToStorage();
        return;
      }

      cart.forEach((item, index) => {
        const cartBox = document.createElement("div");
        cartBox.className = "cart-box";
        cartBox.innerHTML = `
          <img src="${item.image}" alt="${item.name}" />
          <div class="cart-text">
            <h3>${item.name}</h3>
            <div class="price-quantity">
              <span>${item.price}</span>
              <div class="quantity-controls">
                <button class="quantity-btn minus" data-index="${index}">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn plus" data-index="${index}">+</button>
              </div>
            </div>
            <select class="size-selector" data-index="${index}">
              <option value="">Pilih Ukuran</option>
              <option value="38" ${
                item.size === "38" ? "selected" : ""
              }>38</option>
              <option value="39" ${
                item.size === "39" ? "selected" : ""
              }>39</option>
              <option value="40" ${
                item.size === "40" ? "selected" : ""
              }>40</option>
              <option value="41" ${
                item.size === "41" ? "selected" : ""
              }>41</option>
              <option value="42" ${
                item.size === "42" ? "selected" : ""
              }>42</option>
            </select>
          </div>
          <i class="ri-delete-bin-line remove-item" data-index="${index}"></i>
        `;
        cartItemsContainer.appendChild(cartBox);
      });

      makeCartItemsClickable();

      // Update total
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = cart.reduce((sum, item) => {
        const price = parseInt(item.price.replace(/\D/g, ""));
        return sum + price * item.quantity;
      }, 0);

      document.querySelector(".total h3").textContent = `${totalItems} Item${
        totalItems !== 1 ? "s" : ""
      }`;
      document.querySelector(
        ".total span"
      ).textContent = `Total Rp. ${totalPrice.toLocaleString("id-ID")}`;

      // Add event listeners for dynamic elements
      document.querySelectorAll(".remove-item").forEach((btn) => {
        btn.addEventListener("click", function () {
          removeFromCart(parseInt(this.getAttribute("data-index")));
        });
      });

      document.querySelectorAll(".quantity-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const index = parseInt(this.getAttribute("data-index"));
          const isPlus = this.classList.contains("plus");
          updateQuantity(index, isPlus);
        });
      });

      document.querySelectorAll(".size-selector").forEach((select) => {
        select.addEventListener("change", function () {
          const index = parseInt(this.getAttribute("data-index"));
          const newSize = this.value;
          updateSize(index, newSize);
        });
      });
    }

    saveCartToStorage();
  }

   // Show transaction history
   function showTransactionHistory() {
    if (!isLoggedIn || transactions.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-history">
          <i class="ri-time-line"></i>
          <p>Belum ada riwayat transaksi</p>
          <a href="products.html" class="btn">Belanja Sekarang</a>
        </div>
      `;
      return;
    }

    transactions.forEach((transaction, index) => {
      const transactionEl = document.createElement("div");
      transactionEl.className = "transaction-item";
      transactionEl.innerHTML = `
        <div class="transaction-header">
          <div class="transaction-id">#${String(index + 1).padStart(3, '0')}</div>
          <div class="transaction-date-status">
            <span class="transaction-date">${transaction.date}</span>
            <span class="transaction-status">
              <i class="ri-checkbox-circle-fill"></i> Selesai
            </span>
          </div>
          <i class="ri-delete-bin-line delete-transaction" data-index="${index}"></i>
        </div>
        <div class="transaction-products">
          ${transaction.items.map(item => `
            <div class="transaction-product">
              <img src="${item.image}" alt="${item.name}">
              <div class="product-info">
                <h4>${item.name}</h4>
                <div class="product-meta">
                  <span>${item.size ? 'Ukuran: ' + item.size : ''}</span>
                  <span>Qty: ${item.quantity}</span>
                </div>
              </div>
              <div class="product-price">${item.price}</div>
            </div>
          `).join('')}
        </div>
        <div class="transaction-footer">
          <div class="payment-method">
            <i class="ri-bank-card-line"></i>
            <div>
              <span class="method">${transaction.paymentMethod}</span>
              ${transaction.bank ? `<span class="bank">${transaction.bank}</span>` : ''}
            </div>
          </div>
          <div class="transaction-total">
            <span>Total</span>
            <span class="amount">Rp ${transaction.total.toLocaleString("id-ID")}</span>
          </div>
        </div>
        <div class="transaction-address">
          <i class="ri-map-pin-line"></i>
          <span>${transaction.address}</span>
        </div>
      `;
      cartItemsContainer.appendChild(transactionEl);
    });

    document.querySelectorAll(".delete-transaction").forEach(btn => {
      btn.addEventListener("click", function(e) {
        e.stopPropagation();
        const index = parseInt(this.getAttribute("data-index"));
        deleteTransaction(index);
      });
    });

    // Add styles for transaction history
    const style = document.createElement('style');
    style.textContent = `
      .transaction-item {
        background: white;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        border: 1px solid #f0f0f0;
      }
      
      .transaction-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid #f5f5f5;
      }
      
      .transaction-id {
        font-weight: 600;
        color: #666;
        font-size: 14px;
      }
      
      .transaction-date-status {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }
      
      .transaction-date {
        font-size: 12px;
        color: #888;
      }
      
      .transaction-status {
        font-size: 12px;
        color: #4CAF50;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .transaction-status i {
        font-size: 14px;
      }
      
      .transaction-products {
        margin-bottom: 12px;
      }
      
      .transaction-product {
        display: flex;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #f9f9f9;
      }
      
      .transaction-product:last-child {
        border-bottom: none;
      }
      
      .transaction-product img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 8px;
        margin-right: 12px;
        border: 1px solid #eee;
      }
      
      .product-info {
        flex: 1;
      }
      
      .product-info h4 {
        font-size: 14px;
        margin: 0 0 6px;
        color: #333;
        font-weight: 500;
      }
      
      .product-meta {
        display: flex;
        gap: 10px;
        font-size: 12px;
        color: #888;
      }
      
      .product-price {
        font-weight: 600;
        color: #ff6b6b;
        font-size: 14px;
        min-width: 80px;
        text-align: right;
      }
      
      .transaction-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-top: 1px dashed #eee;
        border-bottom: 1px dashed #eee;
        margin-bottom: 12px;
      }
      
      .payment-method {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
      }
      
      .payment-method i {
        color: #666;
        font-size: 16px;
      }
      
      .payment-method .method {
        font-weight: 500;
        color: #333;
        display: block;
      }
      
      .payment-method .bank {
        color: #666;
        font-size: 11px;
        display: block;
      }
      
      .transaction-total {
        text-align: right;
      }
      
      .transaction-total span:first-child {
        font-size: 12px;
        color: #888;
        display: block;
      }
      
      .transaction-total .amount {
        font-weight: 600;
        color: #333;
        font-size: 16px;
      }
      
      .transaction-address {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 12px;
        color: #666;
      }
      
      .transaction-address i {
        color: #888;
        font-size: 14px;
        margin-top: 2px;
      }
      
      .empty-history {
        text-align: center;
        padding: 30px 0;
        color: #888;
      }
      
      .empty-history i {
        font-size: 50px;
        margin-bottom: 10px;
        display: block;
        color: #ddd;
      }
      
      .empty-history p {
        font-size: 16px;
        margin-bottom: 20px;
      }
      
      .empty-history .btn {
        display: inline-block;
        padding: 10px 20px;
        background:rgb(11, 9, 9);
        color: white;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 500;
      }z
      
      .empty-cart {
        text-align: center;
        padding: 30px 0;
        color: #888;
      }
      
      .empty-cart i {
        font-size: 50px;
        margin-bottom: 10px;
        display: block;
        color: #ddd;
      }
      
      .empty-cart p {
        font-size: 16px;
        margin-bottom: 20px;
      }
      
      .empty-cart .btn {
        display: inline-block;
        padding: 10px 20px;
        background:rgb(12, 10, 10);
        color: white;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 500;
      }
      
      .cart-tabs {
        display: flex;
        border-bottom: 1px solid #eee;
        margin-bottom: 15px;
        cursor: pointer;
      }
      
      .cart-tab, .history-tab {
        flex: 1;
        padding: 10px;
        text-align: center;
        background: none;
        border: none;
        cursor: pointer;
        font-weight: 500;
        color: #666;
        border-bottom: 2px solid transparent;
        transition: all 0.2s;
      }
      
      .cart-tab.active, .history-tab.active {
        color: #ff6b6b;
        border-bottom: 2px solid #ff6b6b;
      }
    `;
    document.head.appendChild(style);
  }

  function deleteTransaction(index) {
    if (!checkLogin()) {
      showLoginRequired();
      return;
    }
  
    if (index >= 0 && index < transactions.length) {
      transactions.splice(index, 1);
      localStorage.setItem(userTransactionKey, JSON.stringify(transactions));
      
      // Tampilkan notifikasi penghapusan berhasil
      showNotification("Riwayat Transaksi berhasil dihapus", false, true);
      
      updateCartDisplay();
    }
  }

  function saveCartToStorage() {
    const userCartKey = checkLogin()
      ? `cart_${currentUser.email}`
      : "guest_cart";
    localStorage.setItem(userCartKey, JSON.stringify(cart));
  }

  // Cart operations
  function addToCart(product) {
    if (!checkLogin()) {
      showLoginRequired();
      return;
    }

    const existingIndex = cart.findIndex(
      (item) =>
        item.name === product.name && item.size === (product.size || null)
    );

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += product.quantity || 1;
    } else {
      cart.push({
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: product.quantity || 1,
        size: product.size || null,
      });
    }
    updateCartDisplay();
    showNotification(`${product.name} ditambahkan ke keranjang!`);
  }

  function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      updateCartDisplay();
      showNotification("Produk dihapus dari keranjang");
    }
  }

  function updateQuantity(index, isPlus) {
    if (index >= 0 && index < cart.length) {
      if (isPlus) {
        cart[index].quantity += 1;
      } else if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
      }
      updateCartDisplay();
    }
  }

  function updateSize(index, newSize) {
    if (index >= 0 && index < cart.length) {
      cart[index].size = newSize;
      saveCartToStorage();
    }
  }

  // Notification system
  function showNotification(message, isError = false, isDelete = false) {
    const notification = document.createElement("div");
    notification.className = `notification ${isError ? "error" : ""} ${isDelete ? "delete" : ""}`;
    
    if (isDelete) {
      notification.innerHTML = `
        <div class="notification-content">
          <i class="ri-checkbox-circle-fill"></i>
          <span>${message}</span>
        </div>
      `;
    } else {
      notification.innerHTML = `<span>${message}</span>`;
    }
    
    document.body.appendChild(notification);
    notification.style.position = "fixed";
    notification.style.bottom = "20px";
    notification.style.right = "20px";
    notification.style.padding = "15px 20px";
    notification.style.borderRadius = "5px";
    notification.style.zIndex = "1000";
    notification.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
    notification.style.transform = "translateX(100%)";
    notification.style.opacity = "0";
    notification.style.transition = "all 0.3s ease";
    notification.style.backgroundColor = isError ? "#ff5252" : "#4CAF50";
    notification.style.color = "white";

    // Tambahkan styling khusus untuk notifikasi delete
  const deleteStyle = document.createElement('style');
  deleteStyle.textContent = `
    .notification.delete {
      background: linear-gradient(135deg, #ff6b6b, #ff5252);
      padding: 15px 25px;
      border-radius: 8px;
      display: flex;
      align-items: center;
    }
    
    .notification.delete .notification-content {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .notification.delete i {
      font-size: 20px;
    }
  `;
  document.head.appendChild(deleteStyle);

    setTimeout(() => {
      notification.style.transform = "translateX(0)";
      notification.style.opacity = "1";
    }, 10);

    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      notification.style.opacity = "0";
      setTimeout(() => notification.remove(), 300);
    }, 2000);

    setTimeout(() => {
      notification.remove();
      deleteStyle.remove();
    }, 2000);
  }

  // Payment process
  function showPaymentMethods(e) {
    if (e) e.preventDefault();
    paymentModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closePaymentModal() {
    paymentModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  function processPayment(e) {
    if (!checkLogin()) {
      showLoginRequired();
      return;
    }

    if (cart.length === 0) {
      e.preventDefault();
      showNotification(
        "Keranjang belanja kosong! Silakan tambahkan produk terlebih dahulu.",
        true
      );
      return;
    }
    showPaymentMethods(e);
  }

  // Buy Now functionality
  document.querySelector(".buy-now")?.addEventListener("click", function () {
    if (!checkLogin()) {
      showLoginRequired();
      return;
    }

    const productName = document.querySelector(".product-name").textContent;
    const productPrice = document.querySelector(".current-price").textContent;
    const productImage = document.querySelector(".product-main-image").src;
    const selectedSize = document.querySelector(
      ".size-option input:checked"
    )?.value;
    const quantity =
      parseInt(document.querySelector(".quantity-input").value) || 1;

    if (!selectedSize) {
      const sizeError = document.querySelector(".size-error-message");
      sizeError.textContent = "Silakan pilih ukuran";
      sizeError.style.display = "block";
      showNotification("Silakan pilih ukuran terlebih dahulu", true);
      return;
    }

    cart = [];
    addToCart({
      name: productName,
      price: productPrice,
      image: productImage,
      size: selectedSize,
      quantity: quantity,
    });

    showPaymentMethods(new Event("click"));

    if (!cartElement.classList.contains("active")) {
      toggleCart(true);
    }
  });

  // Payment method selection 
  paymentMethods.forEach((method) => {
    method.addEventListener("click", function () {
      const paymentMethod = this.getAttribute("data-method");
      selectedPaymentMethod = paymentMethod;
      
      paymentMethods.forEach((m) => m.classList.remove("active"));
      this.classList.add("active");

      if (paymentMethod === "bank") {
        paymentModal.classList.remove("active");
        bankModal.classList.add("active");
      } else {
        paymentModal.classList.remove("active");
        accountModal.classList.add("active");
      }
    });
  });

  // Bank selection - integrated with your HTML structure
  bankOptions.forEach((bank) => {
    bank.addEventListener("click", function () {
      selectedBank = {
        code: this.getAttribute("data-bank"),
        name: this.querySelector("span").textContent,
        logo: this.querySelector("img").src
      };
      
      bankModal.classList.remove("active");
      accountModal.classList.add("active");
    });
  });

  // Modal close buttons
  if (closePaymentBtn) {
    closePaymentBtn.addEventListener("click", closePaymentModal);
  }

  if (closeBankBtn) {
    closeBankBtn.addEventListener("click", function () {
      bankModal.classList.remove("active");
      paymentModal.classList.add("active");
    });
  }

  if (closeAccountBtn) {
    closeAccountBtn.addEventListener("click", function () {
      accountModal.classList.remove("active");
      paymentModal.classList.add("active");
    });
  }

  // Confirm payment
  if (confirmBtn) {
    confirmBtn.addEventListener("click", function (e) {
      e.preventDefault();

      let isValid = true;
      const number = document.querySelector("#account-number").value.trim();
      const name = document.querySelector("#account-name").value.trim();
      const address = document.querySelector("#alamat").value.trim();

      document.querySelectorAll(".error-message").forEach((el) => {
        el.style.display = "none";
      });

      if (!number) {
        document.getElementById("number-error").textContent =
          "Nomor rekening/HP harus diisi";
        document.getElementById("number-error").style.display = "block";
        isValid = false;
      }

      if (!name) {
        document.getElementById("name-error").textContent =
          "Nama pemilik harus diisi";
        document.getElementById("name-error").style.display = "block";
        isValid = false;
      }

      if (!address) {
        document.getElementById("address-error").textContent =
          "Alamat harus diisi";
        document.getElementById("address-error").style.display = "block";
        isValid = false;
      }

      if (isValid) {
        // Create custom confirmation modal
        const confirmationModal = document.createElement('div');
        confirmationModal.className = 'custom-confirmation-modal';
        confirmationModal.innerHTML = `
          <div class="confirmation-dialog">
            <div class="confirmation-header">
              <div class="header-icon">
                <i class="ri-shopping-bag-line"></i>
              </div>
              <h3>Konfirmasi Pesanan</h3>
              <button class="close-modal-btn"><i class="ri-close-line"></i></button>
            </div>
            
            <div class="confirmation-body">
              <div class="confirmation-section">
                <div class="section-title">
                  <i class="ri-shopping-cart-2-line"></i>
                  <h4>Produk yang Dibeli</h4>
                </div>
                <div class="product-list">
                  ${cart.map(item => `
                    <div class="product-item">
                      <div class="product-image">
                        <img src="${item.image}" alt="${item.name}">
                      </div>
                      <div class="product-info">
                        <h5>${item.name}</h5>
                        <div class="product-meta">
                          <span class="product-size">Ukuran: ${item.size || '-'}</span>
                          <span class="product-qty">Qty: ${item.quantity}</span>
                        </div>
                      </div>
                      <div class="product-price">
                        ${item.price}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <div class="confirmation-section">
                <div class="section-title">
                  <i class="ri-map-pin-line"></i>
                  <h4>Alamat Pengiriman</h4>
                </div>
                <div class="address-box">
                  <p>${address}</p>
                </div>
              </div>
              
              <div class="confirmation-section">
                <div class="section-title">
                  <i class="ri-bank-card-line"></i>
                  <h4>Metode Pembayaran</h4>
                </div>
                <div class="payment-method-box">
                  ${selectedPaymentMethod === 'bank' ? `
                    <div class="payment-method-icon">
                      <img src="${selectedBank.logo}" alt="${selectedBank.name}" style="width: 100%; height: 100%; object-fit: contain;">
                    </div>
                    <div class="payment-method-info">
                      <h5>Transfer Bank - ${selectedBank.name}</h5>
                      <p>${selectedBank.code.toUpperCase()}</p>
                    </div>
                  ` : selectedPaymentMethod === 'cod' ? `
                    <div class="payment-method-icon">
                      <i class="ri-truck-line"></i>
                    </div>
                    <div class="payment-method-info">
                      <h5>COD (Bayar di Tempat)</h5>
                      <p>Pembayaran saat barang diterima</p>
                    </div>
                  ` : `
                    <div class="payment-method-icon">
                      <i class="ri-wallet-line"></i>
                    </div>
                    <div class="payment-method-info">
                      <h5>E-Wallet</h5>
                      <p>Pembayaran melalui e-wallet</p>
                    </div>
                  `}
                </div>
              </div>
              
              <div class="order-summary">
                <div class="summary-item">
                  <span>Subtotal</span>
                  <span>Rp ${cart.reduce((sum, item) => {
                    const price = parseInt(item.price.replace(/\D/g, ""));
                    return sum + price * item.quantity;
                  }, 0).toLocaleString("id-ID")}</span>
                </div>
                <div class="summary-item">
                  <span>Biaya Pengiriman</span>
                  <span>Rp 0</span>
                </div>
                <div class="summary-item discount">
                  <span>Diskon</span>
                  <span>-Rp 0</span>
                </div>
                <div class="summary-total">
                  <span>Total Pembayaran</span>
                  <span>Rp ${cart.reduce((sum, item) => {
                    const price = parseInt(item.price.replace(/\D/g, ""));
                    return sum + price * item.quantity;
                  }, 0).toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>
            
            <div class="confirmation-footer">
              <button class="cancel-btn">
                <i class="ri-arrow-left-line"></i> Kembali
              </button>
              <button class="confirm-btn">
                Bayar Sekarang <i class="ri-arrow-right-line"></i>
              </button>
            </div>
          </div>
        `;

        document.body.appendChild(confirmationModal);
        document.body.style.overflow = "hidden";

        // Add styles dynamically
        const style = document.createElement('style');
        style.textContent = `
          .custom-confirmation-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
            overflow-y: auto;
            padding: 20px;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .confirmation-dialog {
            background: white;
            border-radius: 16px;
            width: 90%;
            max-width: 500px;
            overflow: hidden;
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
            transform: translateY(0);
            animation: slideUp 0.4s ease;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
          }
          
          @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          .confirmation-header {
            padding: 20px;
            background: linear-gradient(135deg, #ff6b6b, #ff8080);
            color: white;
            display: flex;
            align-items: center;
            position: relative;
          }
          
          .header-icon {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
          }
          
          .header-icon i {
            font-size: 20px;
          }
          
          .confirmation-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
          }
          
          .close-modal-btn {
            position: absolute;
            right: 15px;
            top: 15px;
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.8;
            transition: all 0.2s;
            padding: 0;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
          }
          
          .close-modal-btn:hover {
            opacity: 1;
            background: rgba(255, 255, 255, 0.3);
          }
          
          .confirmation-body {
            padding: 0;
            overflow-y: auto;
            flex: 1;
          }
          
          .confirmation-section {
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
          }
          
          .section-title {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
          }
          
          .section-title i {
            font-size: 18px;
            color: #ff6b6b;
            margin-right: 8px;
          }
          
          .section-title h4 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }
          
          .product-list {
            max-height: 220px;
            overflow-y: auto;
          }
          
          .product-item {
            display: flex;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          
          .product-item:last-child {
            border-bottom: none;
          }
          
          .product-image {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            overflow: hidden;
            margin-right: 12px;
            background: #f9f9f9;
          }
          
          .product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .product-info {
            flex: 1;
          }
          
          .product-info h5 {
            margin: 0 0 4px;
            font-size: 14px;
            font-weight: 500;
            color: #333;
          }
          
          .product-meta {
            display: flex;
            gap: 10px;
            font-size: 12px;
            color: #666;
          }
          
          .product-price {
            font-weight: 600;
            color: #ff6b6b;
            font-size: 14px;
          }
          
          .address-box {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 12px 15px;
            font-size: 14px;
            color: #333;
            border: 1px dashed #ddd;
          }
          
          .address-box p {
            margin: 0;
            line-height: 1.4;
          }
          
          .payment-method-box {
            display: flex;
            align-items: center;
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            border: 1px dashed #ddd;
          }
          
          .payment-method-icon {
            background:rgb(105, 98, 98);
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            flex-shrink: 0;
          }
          
          .payment-method-icon img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          
          .payment-method-icon i {
            font-size: 20px;
          }
          
          .payment-method-info h5 {
            margin: 0 0 5px;
            font-size: 14px;
            font-weight: 600;
          }
          
          .payment-method-info p {
            margin: 0;
            font-size: 12px;
            color: #666;
          }
          
          .order-summary {
            padding: 20px;
            background: #f9fafc;
          }
          
          .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;
            color: #555;
          }
          
          .summary-item.discount {
            color: #4CAF50;
          }
          
          .summary-total {
            display: flex;
            justify-content: space-between;
            padding-top: 12px;
            border-top: 1px dashed #ddd;
            font-weight: 600;
            font-size: 16px;
            color: #333;
          }
          
          .summary-total span:last-child {
            color: #ff6b6b;
            font-size: 18px;
          }
          
          .confirmation-footer {
            display: flex;
            padding: 15px 20px;
            background: #f8f9fa;
            gap: 12px;
          }
          
          .confirmation-footer button {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 14px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            font-size: 14px;
          }
          
          .cancel-btn {
            background: white;
            color: #555;
            border: 1px solid #ddd !important;
            flex: 0.4;
          }
          
          .cancel-btn:hover {
            background: #f2f2f2;
          }
          
          .confirm-btn {
            background: linear-gradient(135deg, #ff6b6b, #ff8080);
            color: white;
            flex: 0.6;
            box-shadow: 0 4px 10px rgba(255, 107, 107, 0.3);
          }
          
          .confirm-btn:hover {
            background: linear-gradient(135deg, #ff5b5b, #ff7070);
            box-shadow: 0 6px 12px rgba(255, 107, 107, 0.4);
          }
          
          .confirmation-footer button i {
            font-size: 16px;
            margin: 0 6px;
          }
          
          @media (max-width: 480px) {
            .confirmation-dialog {
              width: 100%;
              max-height: 80vh;
            }
            
            .product-image {
              width: 40px;
              height: 40px;
            }
            
            .confirmation-footer {
              flex-direction: column;
            }
            
            .confirmation-footer button {
              width: 100%;
            }
          }
          
          .product-list::-webkit-scrollbar {
            width: 4px;
          }
          
          .product-list::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          
          .product-list::-webkit-scrollbar-thumb {
            background: #ddd;
            border-radius: 4px;
          }
          
          .product-list::-webkit-scrollbar-thumb:hover {
            background: #ccc;
          }
        `;
        document.head.appendChild(style);

        // Handle button clicks
        confirmationModal
          .querySelector(".cancel-btn")
          .addEventListener("click", () => {
            confirmationModal.remove();
            style.remove();
            document.body.style.overflow = "";
          });

        confirmationModal
          .querySelector(".confirm-btn")
          .addEventListener("click", () => {
            confirmationModal.remove();
            style.remove();
            document.body.style.overflow = "";

            const total = cart.reduce((sum, item) => {
              const price = parseInt(item.price.replace(/\D/g, ""));
              return sum + price * item.quantity;
            }, 0);

            // Save transaction to history
            const transactionData = {
              date: new Date().toLocaleString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              items: [...cart],
              paymentMethod: selectedPaymentMethod === 'bank' 
                ? 'Transfer Bank' 
                : selectedPaymentMethod === 'cod' 
                  ? 'COD' 
                  : 'E-Wallet',
              bank: selectedPaymentMethod === 'bank' ? selectedBank.name : null,
              total: total,
              address: address
            };
            
            saveTransaction(transactionData);

            // Show success notification
            const successNotification = document.createElement("div");
            successNotification.className = "payment-success-notification";
            successNotification.innerHTML = `
            <div class="success-content">
              <i class="ri-checkbox-circle-fill"></i>
              <div>
                <h4>Pembayaran Berhasil!</h4>
                <p>Total: Rp ${total.toLocaleString("id-ID")}</p>
              </div>
            </div>
          `;
            document.body.appendChild(successNotification);

            const successStyle = document.createElement("style");
            successStyle.textContent = `
            .payment-success-notification {
              position: fixed;
              bottom: 20px;
              right: 20px;
              background: #4CAF50;
              color: white;
              padding: 15px 20px;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              z-index: 9999;
              animation: slideInRight 0.3s ease, fadeOut 2s ease 3s forwards;
              display: flex;
              align-items: center;
            }
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
              to { opacity: 0; }
            }
            .payment-success-notification .success-content {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .payment-success-notification i {
              font-size: 24px;
            }
            .payment-success-notification h4 {
              margin: 0 0 5px;
              font-size: 16px;
            }
            .payment-success-notification p {
              margin: 0;
              font-size: 14px;
              opacity: 0.9;
            }
          `;
            document.head.appendChild(successStyle);

            // Clear cart after successful payment
            cart = [];
            updateCartDisplay();

            // Close modals
            accountModal.classList.remove("active");
            paymentModal.classList.remove("active");

            // Switch to history tab after payment
            if (historyTabBtn) {
              historyTabBtn.click();
            }

            // Remove elements after animation
            setTimeout(() => {
              successNotification.remove();
              successStyle.remove();
            }, 5000);
          });
      }
    });
  }

  // Add to cart button
  document
    .querySelector(".add-to-cart")
    ?.addEventListener("click", function () {
      if (!checkLogin()) {
        showLoginRequired();
        return;
      }

      const productName = document.querySelector(".product-name").textContent;
      const productPrice = document.querySelector(".current-price").textContent;
      const productImage = document.querySelector(".product-main-image").src;
      const selectedSize = document.querySelector(
        ".size-option input:checked"
      )?.value;
      const quantity =
        parseInt(document.querySelector(".quantity-input").value) || 1;

      if (!selectedSize) {
        const sizeError = document.querySelector(".size-error-message");
        sizeError.textContent = "Silakan pilih ukuran";
        sizeError.style.display = "block";
        showNotification("Silakan pilih ukuran terlebih dahulu", true);
        return;
      }

      addToCart({
        name: productName,
        price: productPrice,
        image: productImage,
        size: selectedSize,
        quantity: quantity,
      });
    });

  // Add to cart from product boxes
  document.querySelectorAll(".box-text a").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (!checkLogin()) {
        showLoginRequired();
        return;
      }

      const box = this.closest(".box");
      const product = {
        name: box.querySelector("h3").textContent,
        price: box.querySelector(".title-price span").textContent,
        image: box.querySelector("img").src,
      };

      addToCart(product);

      const originalIcon = this.innerHTML;
      this.innerHTML = '<i class="ri-check-line"></i>';
      setTimeout(() => {
        this.innerHTML = originalIcon;
      }, 1000);
    });
  });

  // Pay button event listener
  document.querySelector(".btn")?.addEventListener("click", processPayment);

  // Initialize cart display
  setupTabButtons();
  updateCartDisplay();
});

// suka
document.addEventListener("DOMContentLoaded", function () {
  // Initialize favorites from localStorage
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const productsContainer = document.querySelector(".products-content");
  let productBoxes = document.querySelectorAll(".box");

  // Notification function
  function showNotification(message, isError = false) {
    // Remove old notification if exists
    const oldNotification = document.querySelector(".notification");
    if (oldNotification) {
      oldNotification.remove();
    }

    // Create new notification element
    const notification = document.createElement("div");
    notification.className = `notification ${isError ? "error" : ""}`;
    notification.textContent = message;

    // Append notification to the body
    document.body.appendChild(notification);

    // Add animation and remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = "slideOut 0.5s ease-out";
      setTimeout(() => notification.remove(), 500);
    }, 5000);
  }

  // Store original positions of all products
  const originalPositions = Array.from(productBoxes).map((box) => {
    return {
      element: box,
      name: box.querySelector("h3").textContent.trim(),
      position: Array.from(productBoxes).indexOf(box),
      detailUrl: box.getAttribute("onclick")?.match(/'([^']+)'/)?.[1] || null,
      isSale: box.querySelector(".badge.sale") !== null
    };
  });

  // Save favorites to localStorage
  function saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }

  // Update heart icons appearance
  function updateHeartIcons() {
    productBoxes.forEach((box) => {
      const productName = box.querySelector("h3").textContent.trim();
      const heartIcon = box.querySelector(".wishlist");

      if (heartIcon) {
        if (favorites.includes(productName)) {
          heartIcon.classList.replace("ri-heart-3-line", "ri-heart-3-fill");
          heartIcon.style.color = "red";
        } else {
          heartIcon.classList.replace("ri-heart-3-fill", "ri-heart-3-line");
          heartIcon.style.color = "";
        }
      }
    });
  }

  // Sort products with favorites first, others in original order
  function sortProducts() {
    const productsArray = Array.from(productBoxes);

    // Separate favorites and non-favorites
    const favoriteProducts = [];
    const nonFavoriteProducts = [];

    originalPositions.forEach((item) => {
      const box = item.element;
      const isFavorite = favorites.includes(item.name);

      if (isFavorite) {
        favoriteProducts.push(box);
      } else {
        nonFavoriteProducts.push({
          box: box,
          originalPosition: item.position,
        });
      }
    });

    // Sort non-favorites by their original position
    nonFavoriteProducts.sort((a, b) => a.originalPosition - b.originalPosition);

    // Combine arrays (favorites first, then others in original order)
    const sortedProducts = [
      ...favoriteProducts,
      ...nonFavoriteProducts.map((item) => item.box),
    ];

    // Rebuild the container
    productsContainer.innerHTML = "";
    sortedProducts.forEach((box) => {
      productsContainer.appendChild(box);
    });

    // Update productBoxes reference
    productBoxes = document.querySelectorAll(".box");
  }

  // Toggle favorite status
  function toggleFavorite(box) {
    const productName = box.querySelector("h3").textContent.trim();
    const index = favorites.indexOf(productName);

    if (index === -1) {
      favorites.push(productName);
    } else {
      favorites.splice(index, 1);
    }

    saveFavorites();
    updateHeartIcons();
    sortProducts();
    attachEventListeners(); // Reattach event listeners after DOM update
  }

  // Attach event listeners
  function attachEventListeners() {
    productBoxes.forEach((box) => {
      const heartIcon = box.querySelector(".wishlist");
      const saleBadge = box.querySelector(".badge.sale");
      const productData = originalPositions.find(item => item.element === box);

      // Remove existing onclick handler to avoid conflicts
      box.removeAttribute("onclick");

      if (heartIcon) {
        // Remove existing listener to prevent duplicates
        heartIcon.replaceWith(heartIcon.cloneNode(true));
        box.querySelector(".wishlist").addEventListener("click", function (e) {
          e.stopPropagation();
          toggleFavorite(box);
        });
      }

      // Handle product box click
      box.addEventListener("click", function (e) {
        // Don't navigate if clicking wishlist or cart
        if (e.target.closest(".wishlist") || e.target.closest('a[title="Add to Cart"]')) {
          return;
        }

        // Check if product is on sale
        if (productData?.isSale) {
          e.preventDefault();
          showNotification("Maaf, produk ini telah habis terjual.", true);
        } else if (productData?.detailUrl) {
          window.location.href = productData.detailUrl;
        }
      });
    });
  }

  // Initialize badges
  function initializeBadges() {
    const badges = [
      { index: 0, text: "HOT", className: "badge hot" },
      { index: 1, text: "SALE", className: "badge sale" },
      { index: 2, text: "NEW", className: "badge new" },
      { index: 3, text: "HOT", className: "badge hot" },
      { index: 5, text: "HOT", className: "badge hot" },
      { index: 6, text: "HOT", className: "badge hot" },
      { index: 7, text: "HOT", className: "badge hot" },
      { index: 10, text: "HOT", className: "badge hot" },
      { index: 4, text: "NEW", className: "badge new" },
      { index: 9, text: "NEW", className: "badge new" },
      { index: 8, text: "SALE", className: "badge sale" },
      { index: 11, text: "NEW", className: "badge new" },
    ];

    badges.forEach((badge) => {
      if (
        originalPositions[badge.index] &&
        originalPositions[badge.index].element
      ) {
        const badgeElement = document.createElement("span");
        badgeElement.className = badge.className;
        badgeElement.textContent = badge.text;
        originalPositions[badge.index].element.insertBefore(
          badgeElement,
          originalPositions[badge.index].element.firstChild
        );
        
        // Mark product as sale if it has sale badge
        if (badge.className === "badge sale") {
          originalPositions[badge.index].isSale = true;
          originalPositions[badge.index].element.style.opacity = "0.6";
        }
      }
    });
  }

  // Add CSS for badges, stars, and notifications
  const style = document.createElement("style");
  style.textContent = `
    .badge {
      position: absolute;
      top: 10px;
      left: 10px;
      color: white;
      padding: 3px 8px;
      border-radius: 1rem;
      font-size: 0.7rem;
      font-weight: bold;
      z-index: 1;
    }
    .badge.hot {
      background: #F44336;
    }
    .badge.new {
      background: #4CAF50;
    }
    .badge.sale {
      background: #FF5722;
    }
    .stars {
      display: flex;
      align-items: center;
      gap: 2px;
      margin-top: 5px;
    }
    .stars i {
      font-size: 14px;
      color: #FFD700;
      padding: 0;
      background: transparent;
      box-shadow: none;
    }
    .stars span {
      font-size: 0.8rem;
      color: #777;
      margin-left: 5px;
    }

    /* Notification styles */
    .notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(33, 213, 84, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      font-size: 14px;
      opacity: 1;
      animation: slideIn 0.5s ease-in-out;
      z-index: 1000;
    }
    .notification.error {
      background: #FF4D4D;
    }
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Initial setup
  initializeBadges();
  updateHeartIcons();
  sortProducts();
  attachEventListeners();
});

// swiper
document.addEventListener("DOMContentLoaded", function () {
  const swiper = new Swiper(".slide-wrapper", {
    loop: true,
    grabCursor: true,
    spaceBetween: 25,

    // Pagination
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      dynamicBullets: true,
    },

    // Navigation arrows
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },

    // Responsive breakpoints
    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      640: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      },
      1280: {
        slidesPerView: 4,
      },
    },
  });
});

//produk detail
document.addEventListener("DOMContentLoaded", function () {
  // Thumbnail click handler
  const thumbnails = document.querySelectorAll(".thumbnail-image");
  const mainImage = document.querySelector(".product-main-image");

  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", function () {
      mainImage.src = this.src;
      thumbnails.forEach((t) => t.parentElement.classList.remove("active"));
      this.parentElement.classList.add("active");
    });
  });

  // Size selection
  const sizeOptions = document.querySelectorAll(".size-option input");
  const sizeError = document.querySelector(".size-error-message");

  sizeOptions.forEach((option) => {
    option.addEventListener("change", function () {
      if (this.checked) {
        sizeError.style.display = "none";
      }
    });
  });

  // Quantity control
  const quantityInput = document.querySelector(".quantity-input");
  const minusBtn = document.querySelector(".quantity-decrease");
  const plusBtn = document.querySelector(".quantity-increase");
  const maxQuantity = parseInt(quantityInput.getAttribute("max")) || 10;

  minusBtn.addEventListener("click", function () {
    let value = parseInt(quantityInput.value);
    if (value > 1) {
      quantityInput.value = value - 1;
    }
  });

  plusBtn.addEventListener("click", function () {
    let value = parseInt(quantityInput.value);
    if (value < maxQuantity) {
      quantityInput.value = value + 1;
    }
  });

  quantityInput.addEventListener("change", function () {
    let value = parseInt(this.value);
    if (isNaN(value) || value < 1) {
      this.value = 1;
    } else if (value > maxQuantity) {
      this.value = maxQuantity;
    }
  });

  // Add to cart validation
  document
    .querySelector(".add-to-cart")
    .addEventListener("click", function (e) {
      const selectedSize = document.querySelector(".size-option input:checked");
      if (!selectedSize) {
        e.preventDefault();
        sizeError.textContent = "Please select a size";
        sizeError.style.display = "block";
        document.querySelector(".size-selection").scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } else {
        // Add to cart logic here
        // alert("Product added to cart!");
      }
    });

  // Buy now validation
  document.querySelector(".buy-now").addEventListener("click", function (e) {
    const selectedSize = document.querySelector(".size-option input:checked");
    if (!selectedSize) {
      e.preventDefault();
      sizeError.textContent = "Please select a size";
      sizeError.style.display = "block";
      document.querySelector(".size-selection").scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  });

  // Wishlist toggle
  const wishlistBtn = document.querySelector(".add-to-wishlist");
  const wishlistIcon = wishlistBtn.querySelector("i");

  wishlistBtn.addEventListener("click", function () {
    wishlistIcon.classList.toggle("ri-heart-line");
    wishlistIcon.classList.toggle("ri-heart-fill");
    wishlistIcon.style.color = wishlistIcon.classList.contains("ri-heart-fill")
      ? "#ff4136"
      : "";
  });
});

//

document.addEventListener("DOMContentLoaded", function () {
  const slider = document.querySelector(".slider");
  const slides = document.querySelectorAll(".slide");
  const dotsContainer = document.querySelector(".slider-dots");
  const prevBtn = document.querySelector(".slider-prev");
  const nextBtn = document.querySelector(".slider-next");
  let currentIndex = 0;

  // Create dots
  slides.forEach((_, index) => {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    if (index === 0) dot.classList.add("active");
    dot.addEventListener("click", () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  // Update slider position
  function updateSlider() {
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    document.querySelectorAll(".dot").forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });
  }

  // Go to specific slide
  function goToSlide(index) {
    currentIndex = index;
    updateSlider();
  }

  // Next slide
  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlider();
  }

  // Previous slide
  function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateSlider();
  }

  // Event listeners
  nextBtn.addEventListener("click", nextSlide);
  prevBtn.addEventListener("click", prevSlide);

  // Auto-slide (optional)
  let slideInterval = setInterval(nextSlide, 5000);

  // Pause on hover
  slider.addEventListener("mouseenter", () => clearInterval(slideInterval));
  slider.addEventListener("mouseleave", () => {
    slideInterval = setInterval(nextSlide, 5000);
  });
});

//
