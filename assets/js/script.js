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
  showNotification("Silakan login terlebih dahulu untuk mengakses keranjang", true);
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
  const oldNotification = document.querySelector('.notification');
  if (oldNotification) {
    oldNotification.remove();
  }

  const notification = document.createElement("div");
  notification.className = `notification ${isError ? 'error' : ''}`;
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
    showNotification("Username harus 3-30 karakter dan bisa mengandung huruf, angka, dan spasi", true);
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

    showNotification("Password berhasil diubah! Silakan login dengan password baru");
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
const contactForm = document.querySelector("#contact-form"),
  contactName = document.querySelector("#user-name"),
  contactEmail = document.querySelector("#user-email"),
  contactMessage = document.querySelector("#user-message"),
  successMessage = document.querySelector("#success-message");

const sendEmail = (e) => {
  e.preventDefault();

  if (
    contactName.value === "" ||
    contactEmail.value === "" ||
    contactMessage.value === ""
  ) {
    successMessage.classList.remove("color-green");
    successMessage.classList.add("color-red");
    successMessage.textContent = "Please fill in all the fields.";
  } else {
    emailjs
      .sendForm(
        "service_clo5v4r", // email js service id
        "template_mx3gkg6", //email js template id
        contactForm,
        "2qaJ-eLkH7jW0CFHZ"
      )
      .then(
        () => {
          successMessage.classList.remove("color-red");
          successMessage.classList.add("color-green");
          successMessage.textContent = "Message sent successfully!";

          setTimeout(() => {
            successMessage.textContent = "";
          }, 5000);
        },
        (error) => {
          alert("ops! salah, coba lagi.", error);
        }
      );

    contactName.value = "";
    contactEmail.value = "";
    contactMessage.value = "";
  }
};

// ====== Email JS End ======

// function showProductDetails(title, price, image) {
//   document.getElementById('product-title').innerText = title;
//   document.getElementById('product-price').innerText = price;
//   document.getElementById('product-image').src = image;
//   document.getElementById('product-detail').style.display = 'flex';
// }

// function closeProductDetails() {
//   document.getElementById('product-detail').style.display = 'none';
// }

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
  let cart = isLoggedIn
    ? JSON.parse(localStorage.getItem(userCartKey)) || []
    : [];

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

  // Fungsi untuk membuat item keranjang bisa diklik
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

          // Simulasikan navigasi ke halaman detail produk
          navigateToProductDetail(productName);
        });
      });
  }

  // Fungsi untuk navigasi ke halaman detail produk
  function navigateToProductDetail(productName) {
    // Ganti dengan logika navigasi sesuai kebutuhan aplikasi Anda
    console.log(`Navigasi ke detail produk: ${productName}`);
    Contoh: window.location.href = `ProductDetail.html?name=${encodeURIComponent(
      productName
    )}`;

    // Untuk contoh, kita tampilkan notifikasi
    showNotification(`Membuka detail produk: ${productName}`);
  }

  // Update cart display
  function updateCartDisplay() {
    if (cartContainer && cartItemsContainer) {
      cartItemsContainer.innerHTML = "";

      if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="empty-cart-message">Keranjang belanja kosong</p>`;
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

      // Panggil fungsi untuk membuat item bisa diklik
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
  function showNotification(message, isError = false) {
    const notification = document.createElement("div");
    notification.className = `notification ${isError ? "error" : ""}`;
    notification.innerHTML = `<span>${message}</span>`;
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

    setTimeout(() => {
      notification.style.transform = "translateX(0)";
      notification.style.opacity = "1";
    }, 10);

    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      notification.style.opacity = "0";
      setTimeout(() => notification.remove(), 300);
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

  // Bank selection
  bankOptions.forEach((bank) => {
    bank.addEventListener("click", function () {
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
        // Mendapatkan metode pembayaran yang dipilih
        const activeMethod = document.querySelector(".payment-method.active");
        const paymentMethod = activeMethod
          ? activeMethod.getAttribute("data-method")
          : "Metode Tidak Dipilih";

        // Create custom confirmation modal
        const confirmationModal = document.createElement('div');
        confirmationModal.className = 'custom-confirmation-modal';
        confirmationModal.innerHTML = `
          <div class="confirmation-dialog">
            <div class="confirmation-header">
              <i class="ri-question-line"></i>
              <h3>Konfirmasi Pembayaran</h3>
            </div>
            <div class="confirmation-body">
              <p>Apakah Anda yakin ingin melakukan pembayaran ini?</p>
              <div class="order-summary">
                <h4>Ringkasan Pesanan</h4>
                <ul>
                  ${cart.map(item => `
                    <li>
                      <span>${item.name} (${item.size || '-'})</span>
                      <span>${item.quantity}x ${item.price}</span>
                    </li>
                  `).join('')}
                </ul>
                <div class="total-summary">
                  <span>Total Pembayaran:</span>
                  <span class="total-price">Rp ${cart.reduce((sum, item) => {
                    const price = parseInt(item.price.replace(/\D/g, ""));
                    return sum + price * item.quantity;
                  }, 0).toLocaleString("id-ID")}</span>
                </div>
                <!-- Menampilkan metode pembayaran -->
                <div class="payment-method-summary">
                  <span>Metode Pembayaran:</span>
                  <span>${paymentMethod}</span>
                </div>
              </div>
            </div>
            <div class="confirmation-footer">
              <button class="cancel-btn">Batal</button>
              <button class="confirm-btn">Ya, Lanjutkan Pembayaran</button>
            </div>
          </div>
        `;
        
        document.body.appendChild(confirmationModal);
        document.body.style.overflow = 'hidden';
  
        // Add styles dynamically
        const style = document.createElement('style');
        style.textContent = `
          .custom-confirmation-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .confirmation-dialog {
            background: white;
            border-radius: 16px;
            width: 90%;
            max-width: 400px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            transform: translateY(0);
            animation: slideUp 0.3s ease;
          }
          @keyframes slideUp {
            from { transform: translateY(20px); }
            to { transform: translateY(0); }
          }
          .confirmation-header {
            padding: 20px;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 1px solid #eee;
          }
          .confirmation-header i {
            font-size: 24px;
            color: #ff6b6b;
          }
          .confirmation-header h3 {
            margin: 0;
            font-size: 18px;
            color: #333;
          }
          .confirmation-body {
            padding: 20px;
          }
          .confirmation-body p {
            margin: 0 0 15px;
            color: #555;
          }
          .order-summary {
            background: #f9f9f9;
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
          }
          .order-summary h4 {
            margin: 0 0 10px;
            font-size: 16px;
            color: #333;
          }
          .order-summary ul {
            list-style: none;
            padding: 0;
            margin: 0 0 15px;
          }
          .order-summary li {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            font-size: 14px;
          }
          .total-summary {
            display: flex;
            justify-content: space-between;
            padding-top: 10px;
            border-top: 1px solid #eee;
            font-weight: bold;
          }
          .total-price {
            color: #ff6b6b;
          }
          .payment-method-summary {
            display: flex;
            justify-content: space-between;
            padding-top: 10px;
            border-top: 1px solid #eee;
            font-weight: bold;
          }
          .confirmation-footer {
            display: flex;
            padding: 15px;
            border-top: 1px solid #eee;
            gap: 10px;
          }
          .confirmation-footer button {
            flex: 1;
            padding: 12px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .cancel-btn {
            background: #f8f9fa;
            border: 1px solid #ddd;
            color: #555;
          }
          .cancel-btn:hover {
            background: #e9ecef;
          }
          .confirm-btn {
            background: #ff6b6b;
            border: none;
            color: white;
          }
          .confirm-btn:hover {
            background: #e53935;
          }
        `;
        document.head.appendChild(style);
  
        // Handle button clicks
        confirmationModal.querySelector('.cancel-btn').addEventListener('click', () => {
          confirmationModal.remove();
          style.remove();
          document.body.style.overflow = '';
        });
  
        confirmationModal.querySelector('.confirm-btn').addEventListener('click', () => {
          confirmationModal.remove();
          style.remove();
          document.body.style.overflow = '';
  
          const total = cart.reduce((sum, item) => {
            const price = parseInt(item.price.replace(/\D/g, ""));
            return sum + price * item.quantity;
          }, 0);
  
          // Show success notification with animation
          const successNotification = document.createElement('div');
          successNotification.className = 'payment-success-notification';
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
  
          // Add success styles
          const successStyle = document.createElement('style');
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
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
      oldNotification.remove();
    }

    // Create new notification element
    const notification = document.createElement("div");
    notification.className = `notification ${isError ? 'error' : ''}`;
    notification.textContent = message;

    // Append notification to the body
    document.body.appendChild(notification);

    // Add animation and remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = "slideOut 0.5s ease-out";
      setTimeout(() => notification.remove(), 500); // Wait for fade-out animation to complete
    }, 5000);
  }

  // Store original positions of all products
  const originalPositions = Array.from(productBoxes).map((box) => {
    return {
      element: box,
      name: box.querySelector("h3").textContent.trim(),
      position: Array.from(productBoxes).indexOf(box),
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

      if (heartIcon) {
        // Remove existing listener to prevent duplicates
        heartIcon.replaceWith(heartIcon.cloneNode(true));
        box.querySelector(".wishlist").addEventListener("click", function (e) {
          e.stopPropagation();
          toggleFavorite(box);
        });
      }

      // Handle click on products with "SALE" badge
      if (saleBadge) {
        box.style.opacity = "0.6"; 
        box.addEventListener("click", function (e) {
          e.preventDefault(); // Prevent default behavior
          showNotification("Maaf, produk ini telah habis terjual.", true); // Show custom notification
        });
      } else {
        // Normal click behavior for other products
        box.onclick = function (e) {
          if (
            !e.target.closest(".wishlist") &&
            !e.target.closest('a[title="Add to Cart"]')
          ) {
            window.location.href = "productDetail.html";
          }
        };
      }
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
      background: #FF4D4D; /* Red background for error messages */
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
