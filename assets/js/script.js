// ====== Header Section Start ======
// ====== Header Section End ======
// DOM Elements
const menuIcon = document.querySelector(".menu-icon");
const navbar = document.querySelector(".navbar");
const cart = document.querySelector(".cart");
const loginForm = document.querySelector(".login-form");
const cartIcon = document.querySelector("#cart-icon");
const userIcon = document.querySelector("#user-icon");

// User elements
const userNameContainer = document.querySelector(".user-name-container");
const navbarUsername = document.getElementById("navbarUsername");
const logoutBtn = document.getElementById("logoutBtn");

// Form elements
const loginFormElement = document.getElementById("loginForm");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const createAccountForm = document.getElementById("createAccountForm");
const resetPasswordForm = document.getElementById("resetPasswordForm");

// Current user data
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// Store original prices
const originalPrices = new WeakMap();

// Toggle functions
menuIcon.onclick = () => {
  navbar.classList.toggle("active");
  menuIcon.classList.toggle("move");
  cart.classList.remove("active");
  loginForm.classList.remove("active");
  closeDropdown();
};

cartIcon.onclick = () => {
  cart.classList.toggle("active");
  navbar.classList.remove("active");
  menuIcon.classList.remove("move");
  loginForm.classList.remove("active");
  closeDropdown();
};

userIcon.onclick = () => {
  loginForm.classList.toggle("active");
  cart.classList.remove("active");
  navbar.classList.remove("active");
  menuIcon.classList.remove("move");
  closeDropdown();

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
      
      element.textContent = `Rp ${Math.round(discountedPrice).toLocaleString("id-ID")}`;
      element.style.color = "#4CAF50";
      element.style.fontWeight = "bold";
      element.dataset.discounted = "true";

      const originalPriceDisplay = document.createElement("span");
      originalPriceDisplay.className = "original-price";
      originalPriceDisplay.textContent = ` Rp ${originalPrice.toLocaleString("id-ID")}`;
      originalPriceDisplay.style.textDecoration = "line-through";
      originalPriceDisplay.style.color = "#777";
      originalPriceDisplay.style.fontSize = "0.8em";
      originalPriceDisplay.style.marginLeft = "5px";
      
      element.parentNode.insertBefore(originalPriceDisplay, element.nextSibling);
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

// Notification function
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;

  notification.style.position = "fixed";
  notification.style.bottom = "20px";
  notification.style.right = "20px";
  notification.style.backgroundColor = "#4CAF50";
  notification.style.color = "white";
  notification.style.padding = "15px 20px";
  notification.style.borderRadius = "5px";
  notification.style.zIndex = "1000";
  notification.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
  notification.style.animation = "slideIn 0.5s ease-out";

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.5s ease-out";
    setTimeout(() => notification.remove(), 500);
  }, 5000);

  if (!document.getElementById("notification-animation")) {
    const style = document.createElement("style");
    style.id = "notification-animation";
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// Redirect to home function
function redirectToHome() {
  window.location.href = "index.html"; // Ganti dengan URL halaman home Anda jika berbeda
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
    alert("Format email tidak valid");
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
    alert("Email atau password salah");
  }
});

// Create account
createAccountForm?.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = this.querySelector('input[name="name"]').value;
  const email = this.querySelector('input[name="email"]').value;
  const password = this.querySelector('input[name="password"]').value;
  const confirmPassword = this.querySelector('input[name="confirm-password"]').value;

  if (!isValidUsername(name)) {
    alert("Username harus 3-30 karakter dan bisa mengandung huruf, angka, dan spasi");
    return;
  }

  if (!isValidEmail(email)) {
    alert("Format email tidak valid");
    return;
  }

  if (!isValidPassword(password)) {
    alert("Password harus 6-30 karakter");
    return;
  }

  if (password !== confirmPassword) {
    alert("Password tidak cocok");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.some((u) => u.email === email)) {
    alert("Email sudah digunakan");
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
  
  // Redirect to home after successful registration
  redirectToHome();
});

// Forgot password
forgotPasswordForm?.addEventListener("submit", function (e) {
  e.preventDefault();
  const email = this.querySelector('input[name="email"]').value;

  if (!isValidEmail(email)) {
    alert("Format email tidak valid");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find((u) => u.email === email);

  if (user) {
    forgotPasswordForm.classList.remove("active");
    resetPasswordForm.classList.add("active");
    resetPasswordForm.setAttribute("data-email", email);
  } else {
    alert("Email tidak ditemukan");
  }
});

// Reset password
resetPasswordForm?.addEventListener("submit", function (e) {
  e.preventDefault();
  const email = this.getAttribute("data-email");
  const newPassword = this.querySelector('input[name="new-password"]').value;
  const confirmPassword = this.querySelector('input[name="confirm-new-password"]').value;

  if (!isValidPassword(newPassword)) {
    alert("Password harus 6-30 karakter");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("Password tidak cocok");
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

    alert("Password berhasil diubah! Silakan login dengan password baru");
    this.reset();
    resetPasswordForm.classList.remove("active");
    loginFormElement.classList.add("active");
  } else {
    alert("Terjadi kesalahan, silakan coba lagi");
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

// Agar tombol berfungsi saat diklik
scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

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
// Cart functionality
document.addEventListener("DOMContentLoaded", function () {
  // Initialize cart array to store products
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // DOM elements
  const cartContainer = document.querySelector(".cart-content");
  const cartCount = document.querySelector(".total h3");
  const cartTotal = document.querySelector(".total span");
  const payButton = document.querySelector(".btn");

  // Function to update cart display
  function updateCartDisplay() {
    // Clear current cart display
    if (cartContainer) {
      cartContainer.innerHTML = "";

      // Add each product to cart display
      cart.forEach((item, index) => {
        const cartBox = document.createElement("div");
        cartBox.className = "cart-box";
        cartBox.innerHTML = `
          <img src="${item.image}" alt="${item.name}" />
          <div class="cart-text">
            <h3>${item.name}</h3>
            <span>${item.price}</span>
            <span>${item.quantity}</span>
            ${item.size ? `<span>Size: ${item.size}</span>` : ""}
          </div>
          <i class="ri-delete-bin-line" title="remove item" aria-label="delete Item" data-index="${index}"></i>
        `;
        cartContainer.appendChild(cartBox);
      });

      // Add total section if there are items
      if (cart.length > 0) {
        const totalSection = document.createElement("div");
        totalSection.className = "total";

        // Calculate total items and price
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => {
          const price = parseInt(item.price.replace(/\D/g, "")); // Extract numbers from price string
          return sum + price * item.quantity;
        }, 0);

        totalSection.innerHTML = `
          <h3>${totalItems} Items</h3>
          <span>Total Rp. ${totalPrice.toLocaleString()}</span>
        `;

        // Add pay button
        const payBtn = document.createElement("a");
        payBtn.href = "#";
        payBtn.className = "btn";
        payBtn.title = "Bayar";
        payBtn.textContent = "Bayar";

        cartContainer.appendChild(totalSection);
        cartContainer.appendChild(payBtn);

        // Add event listener to new pay button
        payBtn.addEventListener("click", function (e) {
          e.preventDefault();
          processPayment();
        });
      } else {
        cartContainer.innerHTML =
          '<p class="empty-cart">Your cart is empty</p>';
      }

      // Add event listeners to delete buttons
      document.querySelectorAll(".ri-delete-bin-line").forEach((button) => {
        button.addEventListener("click", function () {
          const index = parseInt(this.getAttribute("data-index"));
          removeFromCart(index);
        });
      });
    }

    // Save cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // Function to add product to cart
  function addToCart(product) {
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(
      (item) =>
        item.name === product.name &&
        (!product.size || item.size === product.size)
    );

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += product.quantity || 1;
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
    showAddToCartConfirmation(product.name);
  }

  // Function to remove product from cart
  function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      updateCartDisplay();
    }
  }

  // Function to process payment
  function processPayment() {
    if (cart.length > 0) {
      const total = cart.reduce((sum, item) => {
        const price = parseInt(item.price.replace(/\D/g, ""));
        return sum + price * item.quantity;
      }, 0);

      alert(`Pembayaran berhasil! Total: Rp. ${total.toLocaleString()}`);

      // Clear cart after payment
      cart = [];
      updateCartDisplay();
    } else {
      alert("Keranjang belanja kosong!");
    }
  }

  // Function to show add to cart confirmation
  function showAddToCartConfirmation(productName) {
    const confirmation = document.createElement("div");
    confirmation.className = "cart-confirmation";
    confirmation.innerHTML = `<span>${productName} added to cart!</span>`;
    document.body.appendChild(confirmation);

    setTimeout(() => confirmation.classList.add("show"), 10);
    setTimeout(() => {
      confirmation.classList.remove("show");
      setTimeout(() => document.body.removeChild(confirmation), 300);
    }, 3000);
  }

  // Add event listener for product detail page "Add to Cart" button
  document
    .querySelector(".add-to-cart")
    ?.addEventListener("click", function () {
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
        sizeError.textContent = "Please select a size";
        sizeError.style.display = "block";
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

  // Add event listeners to all product box "Add to Cart" buttons
  document.querySelectorAll(".box-text a").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const box = this.closest(".box");
      const product = {
        name: box.querySelector("h3").textContent,
        price: box.querySelector(".title-price span").textContent,
        image: box.querySelector("img").getAttribute("src"),
      };

      addToCart(product);

      // Visual feedback
      const originalIcon = this.innerHTML;
      this.innerHTML = '<i class="ri-check-line"></i>';
      setTimeout(() => {
        this.innerHTML = originalIcon;
      }, 1000);
    });
  });

  // Pay button functionality
  payButton?.addEventListener("click", function (e) {
    e.preventDefault();
    processPayment();
  });

  // Add styles for confirmation message
  const style = document.createElement("style");
  style.textContent = `
    .cart-confirmation {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #4CAF50;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .cart-confirmation.show {
      opacity: 1;
    }
    .empty-cart {
      text-align: center;
      padding: 20px;
      color: #666;
    }
  `;
  document.head.appendChild(style);

  // Initialize cart display
  updateCartDisplay();
});

// suka
document.addEventListener("DOMContentLoaded", function () {
  // Initialize favorites from localStorage
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const productsContainer = document.querySelector(".products-content");
  let productBoxes = document.querySelectorAll(".box");

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
      if (heartIcon) {
        // Remove existing listener to prevent duplicates
        heartIcon.replaceWith(heartIcon.cloneNode(true));
        box.querySelector(".wishlist").addEventListener("click", function (e) {
          e.stopPropagation();
          toggleFavorite(box);
        });
      }

      // Maintain click handler for the entire box
      box.onclick = function (e) {
        if (
          !e.target.closest(".wishlist") &&
          !e.target.closest('a[title="Add to Cart"]')
        ) {
          window.location.href = "productDetail.html";
        }
      };
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

  // Add CSS for badges and stars
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
