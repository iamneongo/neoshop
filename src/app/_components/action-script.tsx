export function ActionScript() {
  const code = `
(() => {
  if (window.__neoshopActionsReady) return;
  window.__neoshopActionsReady = true;
  const cartKey = "neoshop-cart";
  const userKey = "neoshop-user";
  const money = new Intl.NumberFormat("vi-VN");
  const parsePrice = (price) => Number(String(price || "").replace(/[^0-9]/g, "")) || 0;
  const formatPrice = (value) => money.format(Number(value) || 0) + "\\u0111";
  const readCart = () => {
    try { return JSON.parse(localStorage.getItem(cartKey) || "[]"); } catch { return []; }
  };
  const writeCart = (items) => {
    localStorage.setItem(cartKey, JSON.stringify(items));
    updateCartBadges();
  };
  const toast = (message) => {
    document.querySelectorAll(".siteToast").forEach((node) => node.remove());
    const node = document.createElement("div");
    node.className = "siteToast";
    node.textContent = message;
    document.body.appendChild(node);
    window.setTimeout(() => node.remove(), 2200);
  };
  const updateCartBadges = () => {
    const count = readCart().reduce((sum, item) => sum + (item.quantity || 0), 0);
    document.querySelectorAll(".cartBtn span").forEach((node) => {
      if (node.textContent !== String(count)) node.textContent = String(count);
    });
  };
  const updateCheckout = () => {
    if (!document.querySelector(".checkoutGrid")) return;
    const params = new URLSearchParams(location.search);
    const items = readCart();
    const queryAmount = Number(params.get("amount") || 0);
    const cartAmount = items.reduce((sum, item) => sum + parsePrice(item.price) * (item.quantity || 1), 0);
    const primary = items[0];
    const productTitle = params.get("product") || (items.length > 1 ? items.length + " sản phẩm trong giỏ" : primary?.title) || "ChatGPT Plus";
    const quantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const plan = params.get("plan") || (items.length > 1 ? quantity + " tài khoản" : primary?.plan) || "1 tháng";
    const amount = formatPrice(queryAmount || cartAmount || 120000);
    document.querySelectorAll("[data-checkout-total], .qrHeader h2").forEach((node) => {
      if (node.textContent !== amount) node.textContent = amount;
    });
    const title = document.querySelector(".orderTop h2");
    if (title && title.textContent !== productTitle) title.textContent = productTitle;
    document.querySelectorAll(".orderList div").forEach((row) => {
      const label = row.querySelector("dt")?.textContent?.trim();
      const value = row.querySelector("dd");
      if (!value) return;
      if (label === "Sản phẩm" && value.textContent !== productTitle) value.textContent = productTitle;
      if (label === "Gói sử dụng" && value.textContent !== plan) value.textContent = plan;
    });
    let mini = document.querySelector(".orderMiniList");
    if (items.length > 1) {
      if (!mini) {
        mini = document.createElement("div");
        mini.className = "orderMiniList";
        document.querySelector(".orderTotal")?.before(mini);
      }
      const nextMini = items.map((item) => "<span>" + (item.quantity || 1) + "x " + item.title + " - " + item.plan + "</span>").join("");
      if (mini.innerHTML !== nextMini) mini.innerHTML = nextMini;
    } else {
      mini?.remove();
    }
  };
  const addCart = (title, plan, price) => {
    const items = readCart();
    const found = items.find((item) => item.title === title && item.plan === plan);
    if (found) found.quantity += 1;
    else items.push({ title, plan, price, quantity: 1 });
    writeCart(items);
    updateCheckout();
  };
  const selectedPlan = (card) => {
    const active = card?.querySelector(".plan.active");
    return {
      plan: active?.dataset.plan || "1 tháng",
      price: active?.dataset.price || "120.000đ"
    };
  };
  const setPlan = (button) => {
    const card = button.closest("[data-purchase-card]");
    if (!card) return;
    card.querySelectorAll(".plan").forEach((node) => node.classList.remove("active"));
    button.classList.add("active");
    const total = card.querySelector("[data-purchase-total]");
    if (total) total.textContent = button.dataset.price || "120.000đ";
  };
  const copyText = async (label, value, source) => {
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(value);
      else {
        const area = document.createElement("textarea");
        area.value = value;
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      const panel = source.closest(".transferPanel");
      let status = panel?.querySelector(".copyStatus");
      if (!status && panel) {
        status = document.createElement("div");
        status.className = "copyStatus";
        panel.appendChild(status);
      }
      if (status) status.textContent = "Đã sao chép " + label;
      toast("Đã sao chép " + label);
    } catch {
      toast("Không thể sao chép");
    }
  };
  const sortCards = (cards, sort) => {
    if (sort === "price-asc") return cards.sort((a, b) => Number(a.dataset.price || 0) - Number(b.dataset.price || 0));
    if (sort === "price-desc") return cards.sort((a, b) => Number(b.dataset.price || 0) - Number(a.dataset.price || 0));
    return cards;
  };
  const applyCatalog = (root) => {
    if (!root) return;
    const input = root.querySelector("[data-catalog-search]");
    const grid = root.querySelector("[data-catalog-grid]");
    const pager = root.querySelector("[data-pagination]");
    const countNode = root.querySelector("[data-catalog-count]");
    const activeCategory = root.querySelector("[data-action='category-filter'].active")?.dataset.category || "Tất cả sản phẩm";
    const query = (input?.value || "").trim().toLowerCase();
    const types = Array.from(root.querySelectorAll("[data-type]:checked")).map((node) => node.dataset.type);
    const sort = root.querySelector("[data-catalog-sort]")?.value || "newest";
    const cards = Array.from(root.querySelectorAll("[data-product-card]"));
    const filtered = cards.filter((card) => {
      const title = (card.dataset.title || "").toLowerCase();
      const desc = (card.dataset.desc || "").toLowerCase();
      const matchesCategory = activeCategory === "Tất cả sản phẩm" || title.includes(activeCategory.toLowerCase()) || desc.includes(activeCategory.toLowerCase());
      const matchesQuery = !query || (title + " " + desc).includes(query);
      const matchesType = types.length === 0 || types.some((type) => type === "Tài khoản AI" ? !title.includes("api") : title.includes("api") || desc.includes("công cụ"));
      return matchesCategory && matchesQuery && matchesType;
    });
    sortCards(filtered, sort).forEach((card) => grid?.appendChild(card));
    const pageSize = 8;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const page = Math.min(Number(root.dataset.page || "1"), totalPages);
    root.dataset.page = String(page);
    cards.forEach((card) => { card.hidden = true; });
    filtered.slice((page - 1) * pageSize, page * pageSize).forEach((card) => { card.hidden = false; });
    if (countNode) countNode.textContent = "Hiển thị " + Math.min(filtered.length, pageSize) + " / " + filtered.length + " sản phẩm";
    if (pager) {
      pager.innerHTML = "";
      const prev = document.createElement("button");
      prev.type = "button";
      prev.textContent = "‹";
      prev.disabled = page === 1;
      prev.dataset.page = String(Math.max(1, page - 1));
      pager.appendChild(prev);
      for (let index = 1; index <= totalPages; index += 1) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = String(index);
        button.dataset.page = String(index);
        if (index === page) button.className = "active";
        pager.appendChild(button);
      }
      const next = document.createElement("button");
      next.type = "button";
      next.textContent = "›";
      next.disabled = page === totalPages;
      next.dataset.page = String(Math.min(totalPages, page + 1));
      pager.appendChild(next);
    }
  };
  const initCatalog = () => {
    document.querySelectorAll("[data-catalog]").forEach((root) => {
      if (root.dataset.initialized) return;
      const q = new URLSearchParams(location.search).get("q");
      const input = root.querySelector("[data-catalog-search]");
      if (q && input && !root.dataset.initialized) input.value = q;
      root.dataset.initialized = "1";
      applyCatalog(root);
    });
  };
  const authPayload = (form) => ({
    email: form.querySelector("[name='email']")?.value || "",
    password: form.querySelector("[name='password']")?.value || "",
    firstName: form.querySelector("[name='firstName']")?.value || "",
    lastName: form.querySelector("[name='lastName']")?.value || "",
    phone: form.querySelector("[name='phone']")?.value || ""
  });
  const setFormMessage = (form, message, success) => {
    let node = form.querySelector(".authMessage");
    if (!node) {
      node = document.createElement("div");
      node.className = "authMessage";
      form.querySelector(".authSubmit")?.before(node);
    }
    node.className = "authMessage " + (success ? "success" : "error");
    node.textContent = message;
  };
  const submitJson = async (url, payload, method = "POST") => {
    const response = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Không thể xử lý yêu cầu");
    return data;
  };
  const customerName = (customer) => {
    const name = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ").trim();
    return name || customer?.email || "Tài khoản";
  };
  const accountHtml = (customer) => {
    const firstName = customer?.first_name || "";
    const lastName = customer?.last_name || "";
    const phone = customer?.phone || "";
    const email = customer?.email || "";
    return [
      '<aside class="accountSummary">',
      '<div class="accountAvatar"></div>',
      '<span>Tài khoản khách hàng</span>',
      '<h1>' + customerName(customer) + '</h1>',
      '<p>' + email + '</p>',
      '<button class="logoutBtn" data-action="customer-logout" type="button">Đăng xuất</button>',
      '</aside>',
      '<div class="accountPanels">',
      '<form class="accountPanel" data-action-form="profile">',
      '<div class="panelTitle"><span>Hồ sơ</span><h2>Thông tin nhận tài khoản</h2></div>',
      '<div class="authNameGrid"><label>Họ<input name="firstName" value="' + firstName + '" /></label><label>Tên<input name="lastName" value="' + lastName + '" /></label></div>',
      '<label>Số điện thoại<input name="phone" value="' + phone + '" /></label>',
      '<button class="authSubmit" type="submit">Lưu thay đổi</button>',
      '</form>',
      '<section class="accountPanel orderHistoryPanel"><div class="panelTitle"><span>Đơn hàng</span><h2>Lịch sử mua hàng</h2></div><div class="emptyOrders"><strong>Đăng nhập khách hàng đã sẵn sàng</strong><p>Đơn hàng sẽ hiển thị tại đây sau khi checkout được nối hoàn toàn với Medusa Orders.</p><a href="/san-pham">Mua sản phẩm</a></div></section>',
      '</div>'
    ].join("");
  };
  const initAccount = async () => {
    const root = document.querySelector("[data-account-root]");
    if (!root || root.dataset.initialized) return;
    root.dataset.initialized = "1";
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.customer) {
        location.replace("/dang-nhap");
        return;
      }
      root.innerHTML = accountHtml(data.customer);
      document.querySelectorAll(".loginBtn").forEach((node) => { node.textContent = "Tài khoản"; });
    } catch {
      location.replace("/dang-nhap");
    }
  };
  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-action-form='search']");
    if (!form) return;
    const input = form.querySelector("input[name='q']");
    const query = (input?.value || "").trim();
    event.preventDefault();
    if (!query) return toast("Nhập từ khóa sản phẩm cần tìm");
    location.href = "/san-pham?q=" + encodeURIComponent(query);
  }, true);
  document.addEventListener("submit", async (event) => {
    const authForm = event.target.closest("[data-action-form='auth']");
    const profileForm = event.target.closest("[data-action-form='profile']");
    const form = authForm || profileForm;
    if (!form) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const submit = form.querySelector(".authSubmit");
    if (submit) submit.disabled = true;
    try {
      if (authForm) {
        const mode = authForm.dataset.authMode === "register" ? "register" : "login";
        await submitJson("/api/auth/" + mode, authPayload(authForm));
        location.href = "/tai-khoan";
      } else {
        const data = await submitJson("/api/auth/profile", authPayload(profileForm), "PATCH");
        setFormMessage(profileForm, "Đã cập nhật thông tin tài khoản.", true);
        const root = document.querySelector("[data-account-root]");
        if (root && data.customer) root.innerHTML = accountHtml(data.customer);
      }
    } catch (error) {
      setFormMessage(form, error.message || "Có lỗi xảy ra", false);
    } finally {
      if (submit) submit.disabled = false;
    }
  }, true);
  document.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) {
      const pageButton = event.target.closest("[data-pagination] button[data-page]");
      if (pageButton) {
        event.preventDefault();
        event.stopPropagation();
        const root = pageButton.closest("[data-catalog]");
        root.dataset.page = pageButton.dataset.page || "1";
        applyCatalog(root);
      }
      return;
    }
    const action = actionTarget.dataset.action;
    if (["login-toggle", "open-cart", "add-cart", "select-plan", "add-current-plan", "buy-current-plan", "copy-value", "category-filter", "reset-filters", "customer-logout"].includes(action)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    if (action === "customer-logout") {
      fetch("/api/auth/logout", { method: "POST" }).finally(() => {
        toast("Đã đăng xuất");
        location.href = "/";
      });
    }
    if (action === "login-toggle") {
      const next = localStorage.getItem(userKey) !== "1";
      localStorage.setItem(userKey, next ? "1" : "0");
      actionTarget.textContent = next ? "Tài khoản" : "Đăng nhập";
      toast(next ? "Đăng nhập demo thành công" : "Đã đăng xuất");
    }
    if (action === "open-cart") {
      if (readCart().length === 0) toast("Giỏ hàng đang trống");
      else location.href = "/thanh-toan";
    }
    if (action === "add-cart") {
      addCart(actionTarget.dataset.title || "Sản phẩm", actionTarget.dataset.plan || "1 tháng", actionTarget.dataset.price || "Liên hệ");
      toast("Đã thêm vào giỏ hàng");
    }
    if (action === "select-plan") setPlan(actionTarget);
    if (action === "add-current-plan" || action === "buy-current-plan") {
      const card = actionTarget.closest("[data-purchase-card]");
      const current = selectedPlan(card);
      addCart("ChatGPT Plus", current.plan, current.price);
      if (action === "buy-current-plan") location.href = "/thanh-toan?plan=" + encodeURIComponent(current.plan) + "&amount=" + parsePrice(current.price);
      else toast("Đã thêm gói vào giỏ hàng");
    }
    if (action === "copy-value") copyText(actionTarget.dataset.label || "nội dung", actionTarget.dataset.value || "", actionTarget);
    if (action === "category-filter") {
      const root = actionTarget.closest("[data-catalog]");
      root.querySelectorAll("[data-action='category-filter']").forEach((node) => node.classList.remove("active"));
      actionTarget.classList.add("active");
      root.dataset.page = "1";
      applyCatalog(root);
    }
    if (action === "reset-filters") {
      const root = actionTarget.closest("[data-catalog]");
      root.querySelectorAll("input").forEach((input) => {
        if (input.type === "checkbox") input.checked = false;
        else input.value = "";
      });
      const first = root.querySelector("[data-action='category-filter']");
      root.querySelectorAll("[data-action='category-filter']").forEach((node) => node.classList.remove("active"));
      first?.classList.add("active");
      const sort = root.querySelector("[data-catalog-sort]");
      if (sort) sort.value = "newest";
      root.dataset.page = "1";
      applyCatalog(root);
    }
  }, true);
  document.addEventListener("input", (event) => {
    const root = event.target.closest("[data-catalog]");
    if (!root) return;
    root.dataset.page = "1";
    applyCatalog(root);
  }, true);
  document.addEventListener("change", (event) => {
    const root = event.target.closest("[data-catalog]");
    if (!root) return;
    root.dataset.page = "1";
    applyCatalog(root);
  }, true);
  updateCartBadges();
  updateCheckout();
  initCatalog();
  initAccount();
  let observerTimer = 0;
  new MutationObserver(() => {
    window.clearTimeout(observerTimer);
    observerTimer = window.setTimeout(() => {
      updateCartBadges();
      updateCheckout();
      initCatalog();
      initAccount();
    }, 80);
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
