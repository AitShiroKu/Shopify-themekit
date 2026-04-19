/**
 * StellarLight Magic — Premium Shopify Theme
 * Modern JavaScript with Light/Dark Mode Support
 */

(function () {
  "use strict";

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [
    ...context.querySelectorAll(selector),
  ];

  const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  const throttle = (fn, limit) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  const formatMoney = (cents, format = "${{amount}}") => {
    if (typeof cents === "string") {
      cents = cents.replace(".", "");
    }
    let value = "";
    const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    const formatString = format || "${{amount}}";

    function defaultOption(opt, def) {
      return typeof opt === "undefined" ? def : opt;
    }

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultOption(precision, 2);
      thousands = defaultOption(thousands, ",");
      decimal = defaultOption(decimal, ".");

      if (isNaN(number) || number === null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);
      const parts = number.split(".");
      const dollars = parts[0].replace(
        /(\d)(?=(\d\d\d)+(?!\d))/g,
        "$1" + thousands,
      );
      const centsValue = parts[1] ? decimal + parts[1] : "";

      return dollars + centsValue;
    }

    switch (formatString.match(placeholderRegex)?.[1]) {
      case "amount":
        value = formatWithDelimiters(cents, 2);
        break;
      case "amount_no_decimals":
        value = formatWithDelimiters(cents, 0);
        break;
      case "amount_with_comma_separator":
        value = formatWithDelimiters(cents, 2, ".", ",");
        break;
      case "amount_no_decimals_with_comma_separator":
        value = formatWithDelimiters(cents, 0, ".", ",");
        break;
      default:
        value = formatWithDelimiters(cents, 2);
    }

    return formatString.replace(placeholderRegex, value);
  };

  // =====================================================
  // THEME TOGGLE (Light/Dark Mode)
  // =====================================================

  const ThemeToggle = {
    order: ["system", "light", "dark"],
    mq: null,

    init() {
      this.toggle = $("[data-theme-toggle]") || $(".theme-toggle");
      if (!this.toggle) return;

      this.mq = window.matchMedia("(prefers-color-scheme: dark)");
      const stored = (() => {
        try { return localStorage.getItem("theme"); } catch (e) { return null; }
      })();
      this.current = stored || document.documentElement.getAttribute("data-theme") || "system";
      this.sync(this.current);
      this.bindEvents();
    },

    bindEvents() {
      this.toggle.addEventListener("click", () => {
        const next = this.order[(this.order.indexOf(this.current) + 1) % this.order.length];
        this.current = next;
        try { localStorage.setItem("theme", next); } catch (e) {}
        this.sync(next);
        this.announce(next);
      });

      this.mq.addEventListener && this.mq.addEventListener("change", () => {
        if (this.current === "system") this.sync("system");
      });
    },

    resolve(mode) {
      return mode === "dark" || (mode === "system" && this.mq.matches) ? "dark" : "light";
    },

    sync(mode) {
      const root = document.documentElement;
      const dark = this.resolve(mode) === "dark";
      root.setAttribute("data-theme", mode);
      root.classList.toggle("is-dark", dark);
      root.style.colorScheme = dark ? "dark" : "light";
      this.toggle.setAttribute("data-mode", mode);
      this.toggle.setAttribute("aria-label", `Theme: ${mode} — click to change`);

      const metaTheme = $('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute("content", dark ? "#0A1520" : "#FAFAF8");
    },

    announce(mode) {
      const a = document.createElement("div");
      a.setAttribute("role", "status");
      a.setAttribute("aria-live", "polite");
      a.className = "sr-only";
      a.textContent = `Theme changed to ${mode} mode`;
      document.body.appendChild(a);
      setTimeout(() => a.remove(), 1000);
    },
  };

  // =====================================================
  // MOBILE MENU
  // =====================================================

  const MobileMenu = {
    init() {
      this.menu = $("#mobile-menu");
      this.toggle = $(".header__menu-toggle");
      this.closeBtn = $(".mobile-menu__close");
      this.overlay = $(".mobile-menu__overlay");

      if (!this.menu || !this.toggle) return;

      this.bindEvents();
    },

    bindEvents() {
      this.toggle?.addEventListener("click", () => this.open());
      this.closeBtn?.addEventListener("click", () => this.close());
      this.overlay?.addEventListener("click", () => this.close());

      // Close on escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen()) {
          this.close();
        }
      });

      // Close on resize to desktop
      window.addEventListener(
        "resize",
        debounce(() => {
          if (window.innerWidth >= 1024 && this.isOpen()) {
            this.close();
          }
        }, 100),
      );
    },

    isOpen() {
      return this.menu?.getAttribute("aria-hidden") === "false";
    },

    open() {
      if (!this.menu) return;

      this.menu.setAttribute("aria-hidden", "false");
      this.toggle?.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";

      // Focus first menu item
      const firstLink = $(".mobile-menu__link", this.menu);
      firstLink?.focus();
    },

    close() {
      if (!this.menu) return;

      this.menu.setAttribute("aria-hidden", "true");
      this.toggle?.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";

      // Return focus to toggle button
      this.toggle?.focus();
    },
  };

  // =====================================================
  // CART DRAWER
  // =====================================================

  const CartDrawer = {
    init() {
      this.drawer = $(".cart-drawer");
      this.cartLinks = $$('a[href*="/cart"]:not([href*="/checkout"])');
      this.closeBtn = $(".cart-drawer__close");
      this.overlay = $("#overlay");

      if (!this.drawer) return;

      this.bindEvents();
    },

    bindEvents() {
      // Open drawer on cart link click
      this.cartLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          this.open();
        });
      });

      this.closeBtn?.addEventListener("click", () => this.close());
      this.overlay?.addEventListener("click", () => this.close());

      // Close on escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen()) {
          this.close();
        }
      });

      // Listen for cart updates
      document.addEventListener("cart:updated", () => this.refresh());
    },

    isOpen() {
      return this.drawer?.getAttribute("aria-hidden") === "false";
    },

    async open() {
      if (!this.drawer) return;

      this.drawer.setAttribute("aria-hidden", "false");
      this.overlay?.classList.add("overlay--active");
      document.body.style.overflow = "hidden";

      await this.refresh();
    },

    close() {
      if (!this.drawer) return;

      this.drawer.setAttribute("aria-hidden", "true");
      this.overlay?.classList.remove("overlay--active");
      document.body.style.overflow = "";
    },

    async refresh() {
      try {
        const response = await fetch("/?section_id=cart-drawer");
        if (response.ok) {
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const content = $(".cart-drawer__content", doc);

          if (content && this.drawer) {
            const drawerContent = $(".cart-drawer__content", this.drawer);
            if (drawerContent) {
              drawerContent.innerHTML = content.innerHTML;
            }
          }
        }
      } catch (error) {
        console.error("Error refreshing cart drawer:", error);
      }
    },
  };

  // =====================================================
  // CART FUNCTIONALITY
  // =====================================================

  const Cart = {
    async addItem(variantId, quantity = 1) {
      try {
        const response = await fetch("/cart/add.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: variantId,
            quantity: quantity,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add item to cart");
        }

        const item = await response.json();
        await this.updateCartCount();

        // Dispatch event for other components
        document.dispatchEvent(
          new CustomEvent("cart:updated", { detail: item }),
        );

        return item;
      } catch (error) {
        console.error("Error adding item to cart:", error);
        throw error;
      }
    },

    async updateItem(key, quantity) {
      try {
        const response = await fetch("/cart/change.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: key,
            quantity: quantity,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update cart");
        }

        const cart = await response.json();
        await this.updateCartCount();

        document.dispatchEvent(
          new CustomEvent("cart:updated", { detail: cart }),
        );

        return cart;
      } catch (error) {
        console.error("Error updating cart:", error);
        throw error;
      }
    },

    async removeItem(key) {
      return this.updateItem(key, 0);
    },

    async getCart() {
      try {
        const response = await fetch("/cart.js");
        if (!response.ok) {
          throw new Error("Failed to get cart");
        }
        return await response.json();
      } catch (error) {
        console.error("Error getting cart:", error);
        throw error;
      }
    },

    async updateCartCount() {
      const cart = await this.getCart();
      const cartCountElements = $$(".header__cart-count");

      cartCountElements.forEach((el) => {
        el.textContent = cart.item_count;
        el.classList.toggle(
          "header__cart-count--hidden",
          cart.item_count === 0,
        );
      });

      return cart;
    },
  };

  // =====================================================
  // PRODUCT PAGE
  // =====================================================

  const ProductPage = {
    init() {
      this.container = $(".product");
      if (!this.container) return;

      this.initGallery();
      this.initOptions();
      this.initQuantity();
      this.initAddToCart();
      this.initTabs();
    },

    initGallery() {
      const mainImage = $(".product__main-image img", this.container);
      const thumbnails = $$(".product__thumbnail", this.container);

      if (!mainImage || !thumbnails.length) return;

      thumbnails.forEach((thumb) => {
        thumb.addEventListener("click", () => {
          const newSrc = thumb.dataset.image;
          const newSrcset = thumb.dataset.srcset || "";
          const newAlt = thumb.getAttribute("alt") || "";

          mainImage.src = newSrc;
          mainImage.srcset = newSrcset;
          mainImage.alt = newAlt;

          thumbnails.forEach((t) =>
            t.classList.remove("product__thumbnail--active"),
          );
          thumb.classList.add("product__thumbnail--active");
        });
      });
    },

    initOptions() {
      const optionGroups = $$(".product__option", this.container);

      optionGroups.forEach((group) => {
        const buttons = $$("[data-option-value]", group);

        buttons.forEach((btn) => {
          btn.addEventListener("click", () => {
            if (btn.classList.contains("product__option-btn--disabled")) return;

            // Update active state
            buttons.forEach((b) =>
              b.classList.remove(
                "product__option-btn--active",
                "product__swatch--active",
              ),
            );
            btn.classList.add("product__option-btn--active");
            if (btn.classList.contains("product__swatch")) {
              btn.classList.add("product__swatch--active");
            }

            // Update hidden select
            const optionName = group.dataset.optionName;
            const optionValue = btn.dataset.optionValue;
            const select = $(
              `select[name="options[${optionName}]"]`,
              this.container,
            );

            if (select) {
              select.value = optionValue;
              select.dispatchEvent(new Event("change", { bubbles: true }));
            }

            this.updateVariant();
          });
        });
      });
    },

    initQuantity() {
      const quantitySelectors = $$(".quantity-selector", this.container);

      quantitySelectors.forEach((selector) => {
        const input = $(".quantity-selector__input", selector);
        const minusBtn = $(".quantity-selector__btn--minus", selector);
        const plusBtn = $(".quantity-selector__btn--plus", selector);

        if (!input) return;

        minusBtn?.addEventListener("click", () => {
          const currentVal = parseInt(input.value) || 1;
          const minVal = parseInt(input.min) || 1;
          input.value = Math.max(minVal, currentVal - 1);
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });

        plusBtn?.addEventListener("click", () => {
          const currentVal = parseInt(input.value) || 1;
          const maxVal = parseInt(input.max) || 999;
          input.value = Math.min(maxVal, currentVal + 1);
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });

        input.addEventListener("change", () => {
          const minVal = parseInt(input.min) || 1;
          const maxVal = parseInt(input.max) || 999;
          let val = parseInt(input.value) || minVal;
          input.value = Math.max(minVal, Math.min(maxVal, val));
        });
      });
    },

    initAddToCart() {
      const form = $(
        '#AddToCartForm, form[action="/cart/add"]',
        this.container,
      );
      const submitBtn = $('button[type="submit"]', form);

      if (!form || !submitBtn) return;

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const variantId =
          form.querySelector('input[name="id"]')?.value ||
          form.querySelector('select[name="id"]')?.value;
        const quantity =
          parseInt(form.querySelector('input[name="quantity"]')?.value) || 1;

        if (!variantId) {
          Toast.show("Please select all options", "error");
          return;
        }

        submitBtn.classList.add("btn--loading");
        submitBtn.disabled = true;

        try {
          await Cart.addItem(variantId, quantity);
          Toast.show("Added to cart!", "success");
          CartDrawer.open();
        } catch (error) {
          Toast.show("Failed to add to cart", "error");
        } finally {
          submitBtn.classList.remove("btn--loading");
          submitBtn.disabled = false;
        }
      });
    },

    initTabs() {
      const tabBtns = $$(".product__tab-btn", this.container);
      const tabContents = $$(".product__tab-content", this.container);

      tabBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const target = btn.dataset.tab;

          tabBtns.forEach((b) =>
            b.classList.remove("product__tab-btn--active"),
          );
          tabContents.forEach((c) =>
            c.classList.remove("product__tab-content--active"),
          );

          btn.classList.add("product__tab-btn--active");
          const targetContent = $(
            `[data-tab-content="${target}"]`,
            this.container,
          );
          if (targetContent) {
            targetContent.classList.add("product__tab-content--active");
          }
        });
      });
    },

    updateVariant() {
      const form = $(
        '#AddToCartForm, form[action="/cart/add"]',
        this.container,
      );
      if (!form) return;

      // Get selected options
      const selects = $$('select[name^="options"]', form);
      const selectedOptions = selects.map((s) => s.value);

      // Find matching variant
      const variantSelect = $('select[name="id"]', form);
      if (!variantSelect) return;

      const variants = JSON.parse(variantSelect.dataset.variants || "[]");
      const matchingVariant = variants.find((v) =>
        selectedOptions.every((opt, i) => v.options[i] === opt),
      );

      if (matchingVariant) {
        variantSelect.value = matchingVariant.id;

        // Update price display
        const priceEl = $(".product__price", this.container);
        const originalPriceEl = $(".product__price-original", this.container);

        if (priceEl) {
          priceEl.textContent = formatMoney(matchingVariant.price);
        }

        if (originalPriceEl) {
          if (matchingVariant.compare_at_price > matchingVariant.price) {
            originalPriceEl.textContent = formatMoney(
              matchingVariant.compare_at_price,
            );
            originalPriceEl.style.display = "inline";
          } else {
            originalPriceEl.style.display = "none";
          }
        }

        // Update availability
        const submitBtn = $('button[type="submit"]', form);
        if (submitBtn) {
          submitBtn.disabled = !matchingVariant.available;
          submitBtn.textContent = matchingVariant.available
            ? "Add to Cart"
            : "Sold Out";
        }

        // Update SKU
        const skuEl = $(".product__sku", this.container);
        if (skuEl && matchingVariant.sku) {
          skuEl.textContent = `SKU: ${matchingVariant.sku}`;
        }
      }
    },
  };

  // =====================================================
  // PRODUCT CARDS (Quick Add)
  // =====================================================

  const ProductCards = {
    init() {
      const cards = $$(".product-card");

      cards.forEach((card) => {
        const quickAddBtn = $(".product-card__quick-add", card);
        const addToCartBtn = $(".product-card__add-to-cart", card);

        quickAddBtn?.addEventListener("click", (e) => {
          e.preventDefault();
          this.quickAdd(card);
        });

        addToCartBtn?.addEventListener("click", (e) => {
          e.preventDefault();
          this.quickAdd(card);
        });
      });
    },

    async quickAdd(card) {
      const variantId = card.dataset.variantId;

      if (!variantId) {
        Toast.show("Product unavailable", "error");
        return;
      }

      const btn = $(
        ".product-card__quick-add, .product-card__add-to-cart",
        card,
      );
      if (btn) {
        btn.classList.add("btn--loading");
        btn.disabled = true;
      }

      try {
        await Cart.addItem(variantId, 1);
        Toast.show("Added to cart!", "success");
        CartDrawer.open();
      } catch (error) {
        Toast.show("Failed to add to cart", "error");
      } finally {
        if (btn) {
          btn.classList.remove("btn--loading");
          btn.disabled = false;
        }
      }
    },
  };

  // =====================================================
  // CART PAGE
  // =====================================================

  const CartPage = {
    init() {
      this.container = $(".cart");
      if (!this.container) return;

      this.bindEvents();
    },

    bindEvents() {
      // Quantity updates
      const quantityInputs = $$(
        '.cart-item input[name="updates[]"]',
        this.container,
      );
      quantityInputs.forEach((input) => {
        input.addEventListener(
          "change",
          debounce(() => this.updateQuantity(input), 300),
        );
      });

      // Remove items
      const removeLinks = $$(".cart-item__remove", this.container);
      removeLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const key =
            link.dataset.key || link.href.match(/line=\d+/)?.[0]?.split("=")[1];
          if (key) this.removeItem(key, link);
        });
      });

      // Quantity selector buttons
      const quantityBtns = $$(
        ".cart-item .quantity-selector__btn",
        this.container,
      );
      quantityBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const input = btn.parentElement.querySelector(
            ".quantity-selector__input",
          );
          if (input) {
            const line = input.dataset.line;
            const quantity = parseInt(input.value);
            this.updateItemByLine(line, quantity);
          }
        });
      });
    },

    async updateQuantity(input) {
      const line = input.dataset.line;
      const quantity = parseInt(input.value);
      await this.updateItemByLine(line, quantity);
    },

    async updateItemByLine(line, quantity) {
      try {
        const cart = await Cart.getCart();
        const item = cart.items[line - 1];
        if (item) {
          await Cart.updateItem(item.key, quantity);
          window.location.reload();
        }
      } catch (error) {
        Toast.show("Failed to update cart", "error");
      }
    },

    async removeItem(key, link) {
      const row = link.closest(".cart-item");
      if (row) {
        row.style.opacity = "0.5";
      }

      try {
        await Cart.removeItem(key);
        window.location.reload();
      } catch (error) {
        Toast.show("Failed to remove item", "error");
        if (row) {
          row.style.opacity = "1";
        }
      }
    },
  };

  // =====================================================
  // QUICK VIEW MODAL
  // =====================================================

  const QuickView = {
    init() {
      this.template = $("#quick-view-template");
      if (!this.template) return;
    },

    async open(productHandle) {
      try {
        const response = await fetch(
          `/products/${productHandle}?view=quick-view`,
        );
        if (!response.ok) throw new Error("Product not found");

        const html = await response.text();
        const modal = this.template.content.cloneNode(true);
        const modalContent = $(".quick-view-modal__content", modal);

        if (modalContent) {
          modalContent.innerHTML = html;
        }

        document.body.appendChild(modal);

        const modalEl = $(".quick-view-modal");
        this.overlay = $("#overlay");

        modalEl?.classList.add("quick-view-modal--active");
        this.overlay?.classList.add("overlay--active");
        document.body.style.overflow = "hidden";

        // Initialize product functionality
        ProductPage.init();

        // Bind close events
        const closeBtn = $(".quick-view-modal__close", modalEl);
        closeBtn?.addEventListener("click", () => this.close());
        this.overlay?.addEventListener("click", () => this.close());

        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") this.close();
        });
      } catch (error) {
        console.error("Error opening quick view:", error);
        Toast.show("Failed to load product", "error");
      }
    },

    close() {
      const modal = $(".quick-view-modal");
      this.overlay = $("#overlay");

      modal?.classList.remove("quick-view-modal--active");
      this.overlay?.classList.remove("overlay--active");
      document.body.style.overflow = "";

      setTimeout(() => modal?.remove(), 300);
    },
  };

  // =====================================================
  // TOAST NOTIFICATIONS
  // =====================================================

  const Toast = {
    show(message, type = "success") {
      // Remove existing toast
      const existing = $(".toast");
      if (existing) existing.remove();

      const toast = document.createElement("div");
      toast.className = "toast";
      toast.textContent = message;
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");

      if (type === "error") {
        toast.style.background = "var(--color-error)";
      }

      document.body.appendChild(toast);

      // Trigger animation
      requestAnimationFrame(() => {
        toast.classList.add("toast--active");
      });

      // Auto remove
      setTimeout(() => {
        toast.classList.remove("toast--active");
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    },
  };

  // =====================================================
  // HEADER SCROLL BEHAVIOR
  // =====================================================

  const Header = {
    init() {
      this.header = $(".header");
      if (!this.header) return;

      this.lastScroll = 0;
      this.bindEvents();
    },

    bindEvents() {
      window.addEventListener(
        "scroll",
        throttle(() => this.onScroll(), 100),
      );
    },

    onScroll() {
      const currentScroll = window.pageYOffset;

      // Add shadow on scroll
      if (currentScroll > 50) {
        this.header?.classList.add("header--scrolled");
      } else {
        this.header?.classList.remove("header--scrolled");
      }

      // Hide/show on scroll direction (optional)
      // if (currentScroll > this.lastScroll && currentScroll > 200) {
      //   this.header.style.transform = 'translateY(-100%)';
      // } else {
      //   this.header.style.transform = 'translateY(0)';
      // }

      this.lastScroll = currentScroll;
    },
  };

  // =====================================================
  // DROPDOWN NAVIGATION
  // =====================================================

  const DropdownNav = {
    init() {
      const dropdownItems = $$(".nav-list__item--dropdown");

      dropdownItems.forEach((item) => {
        const link = $(".nav-list__link", item);
        const dropdown = $(".nav-dropdown", item);

        // Keyboard navigation
        link?.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const isExpanded = link.getAttribute("aria-expanded") === "true";
            link.setAttribute("aria-expanded", !isExpanded);
          }
        });

        // Close on escape
        item.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            link?.setAttribute("aria-expanded", "false");
            link?.focus();
          }
        });
      });
    },
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const Search = {
    init() {
      const searchInput = $(".search-form__input");
      const searchForm = $(".search-form");

      if (!searchInput || !searchForm) return;

      // Live search (optional - requires search API)
      // searchInput.addEventListener('input', debounce(() => this.liveSearch(searchInput.value), 300));

      searchForm.addEventListener("submit", (e) => {
        if (!searchInput.value.trim()) {
          e.preventDefault();
          searchInput.focus();
        }
      });
    },
  };

  // =====================================================
  // LAZY LOADING IMAGES
  // =====================================================

  const LazyLoad = {
    init() {
      if ("IntersectionObserver" in window) {
        const lazyImages = $$("img[data-src]");

        const imageObserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                if (img.dataset.srcset) {
                  img.srcset = img.dataset.srcset;
                }
                img.removeAttribute("data-src");
                img.removeAttribute("data-srcset");
                observer.unobserve(img);
              }
            });
          },
          {
            rootMargin: "50px 0px",
            threshold: 0.01,
          },
        );

        lazyImages.forEach((img) => imageObserver.observe(img));
      }
    },
  };

  // =====================================================
  // FORM VALIDATION
  // =====================================================

  const FormValidation = {
    init() {
      const forms = $$("form[data-validate]");

      forms.forEach((form) => {
        form.setAttribute("novalidate", "");
        form.addEventListener("submit", (e) => this.validateForm(e, form));

        // Real-time validation
        const inputs = $$("input, textarea, select", form);
        inputs.forEach((input) => {
          input.addEventListener("blur", () => this.validateField(input));
          input.addEventListener("input", () => {
            if (input.classList.contains("form-input--error")) {
              this.validateField(input);
            }
          });
        });
      });
    },

    validateForm(e, form) {
      const inputs = $$("input, textarea, select", form);
      let isValid = true;

      inputs.forEach((input) => {
        if (!this.validateField(input)) {
          isValid = false;
        }
      });

      if (!isValid) {
        e.preventDefault();
        const firstError = $(".form-input--error", form);
        firstError?.focus();
      }
    },

    validateField(input) {
      const value = input.value.trim();
      const isRequired = input.hasAttribute("required");
      const type = input.type;
      let isValid = true;
      let message = "";

      // Required check
      if (isRequired && !value) {
        isValid = false;
        message = "This field is required";
      }

      // Email validation
      if (isValid && type === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          message = "Please enter a valid email address";
        }
      }

      // Phone validation
      if (isValid && type === "tel" && value) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value) || value.replace(/\D/g, "").length < 10) {
          isValid = false;
          message = "Please enter a valid phone number";
        }
      }

      // Update UI
      const errorEl = input.nextElementSibling;

      if (isValid) {
        input.classList.remove("form-input--error");
        if (errorEl?.classList.contains("form-error")) {
          errorEl.remove();
        }
      } else {
        input.classList.add("form-input--error");

        if (!errorEl?.classList.contains("form-error")) {
          const newErrorEl = document.createElement("span");
          newErrorEl.className = "form-error";
          newErrorEl.textContent = message;
          newErrorEl.setAttribute("role", "alert");
          input.parentNode.insertBefore(newErrorEl, input.nextSibling);
        } else if (errorEl) {
          errorEl.textContent = message;
        }
      }

      return isValid;
    },
  };

  // =====================================================
  // INITIALIZE ALL MODULES
  // =====================================================

  const StellarLight = {
    init() {
      // Core functionality
      ThemeToggle.init();
      MobileMenu.init();
      Header.init();
      DropdownNav.init();

      // Product functionality
      ProductPage.init();
      ProductCards.init();

      // Cart functionality
      CartDrawer.init();
      CartPage.init();

      // Other features
      Search.init();
      LazyLoad.init();
      FormValidation.init();

      // Global cart update listener
      document.addEventListener("cart:updated", () => {
        console.log("Cart updated");
      });

      console.log("StellarLight Magic Theme initialized");
    },
  };

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => StellarLight.init());
  } else {
    StellarLight.init();
  }

  // Expose global utilities
  window.StellarLight = {
    Toast,
    Cart,
    QuickView,
    formatMoney,
  };
})();
