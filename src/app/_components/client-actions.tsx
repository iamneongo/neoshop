"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  ChevronDown,
  Copy,
  CreditCard,
  ShieldCheck,
  ShoppingCart,
  Wallet,
} from "lucide-react";

type Product = {
  title: string;
  desc: string;
  icon: string;
  price: string;
  badge: string;
  color: string;
  href: string;
};

type Plan = {
  label: string;
  price: string;
  sale?: string;
  active?: boolean;
};

type CartItem = {
  title: string;
  plan: string;
  price: string;
  quantity: number;
};

const cartKey = "neoshop-cart";
const paymentLogos = [
  { src: "/assets/payment-momo.png", alt: "MoMo", width: 84, height: 84 },
  { src: "/assets/payment-zalopay.png", alt: "ZaloPay", width: 190, height: 84 },
  { src: "/assets/payment-vnpay.png", alt: "VNPAY", width: 250, height: 84 },
  { src: "/assets/payment-visa.png", alt: "Visa", width: 138, height: 84 },
  { src: "/assets/payment-mastercard.png", alt: "Mastercard", width: 120, height: 84 },
];

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(cartKey);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(cartKey, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("neoshop-cart-updated"));
}

function parsePrice(price: string) {
  const value = Number(price.replace(/[^\d]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

function formatPrice(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

function cartCount() {
  return readCart().reduce((sum, item) => sum + item.quantity, 0);
}

function addCartItem(item: Omit<CartItem, "quantity">) {
  const items = readCart();
  const found = items.find((current) => current.title === item.title && current.plan === item.plan);
  if (found) {
    found.quantity += 1;
  } else {
    items.push({ ...item, quantity: 1 });
  }
  writeCart(items);
}

function useToast() {
  const [message, setMessage] = useState("");

  function showToast(nextMessage: string) {
    setMessage(nextMessage);
    window.setTimeout(() => setMessage(""), 2200);
  }

  return { message, showToast };
}

function Toast({ message }: { message: string }) {
  return message ? <div className="siteToast">{message}</div> : null;
}

function ClientPaymentMethods({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "paymentLogos compact" : "paymentLogos"}>
      {paymentLogos.map((logo) => (
        <Image key={logo.alt} src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} />
      ))}
    </div>
  );
}

export function HeaderActions() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const accountTitle = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Tài khoản";

  function openAccount() {
    router.push("/dang-nhap");
  }

  return (
    <div className="navActions">
      {(!isLoaded || !isSignedIn) ? (
        <button className="loginBtn" type="button" onClick={openAccount}>
          Đăng nhập
        </button>
      ) : null}

      {isLoaded && isSignedIn ? (
        <div className="clerkHeaderAccount">
          <Link className="clerkHeaderMeta" href="/tai-khoan" title={accountTitle}>
            <small>Tài khoản</small>
            <strong>{accountTitle}</strong>
          </Link>
          <div className="clerkHeaderButton">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "clerkHeaderAvatar",
                  userButtonTrigger: "clerkHeaderTrigger",
                },
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AddToCartButton({ product, className = "cardCart" }: { product: Product; className?: string }) {
  const { message, showToast } = useToast();

  function add(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    addCartItem({ title: product.title, plan: "1 tháng", price: product.price });
    showToast(`Đã thêm ${product.title} vào giỏ`);
  }

  return (
    <>
      <button
        className={className}
        type="button"
        aria-label={`Thêm ${product.title} vào giỏ`}
        data-action="add-cart"
        data-title={product.title}
        data-plan="1 tháng"
        data-price={product.price}
        onClick={add}
      >
        <ShoppingCart size={19} />
      </button>
      <Toast message={message} />
    </>
  );
}

export function ProductCatalog({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [category, setCategory] = useState("Tất cả sản phẩm");
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [durations, setDurations] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const categories = ["Tất cả sản phẩm", "ChatGPT Plus"];
  const pageSize = 8;

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        category === "Tất cả sản phẩm" ||
        product.title.toLowerCase().includes(category.toLowerCase()) ||
        product.desc.toLowerCase().includes(category.toLowerCase());
      const matchesQuery = !keyword || product.title.toLowerCase().includes(keyword) || product.desc.toLowerCase().includes(keyword);
      return matchesCategory && matchesQuery;
    });
  }, [category, products, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  function toggleValue(value: string, list: string[], setter: (next: string[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
    setPage(1);
  }

  function resetFilters() {
    setCategory("Tất cả sản phẩm");
    setQuery("");
    setSort("newest");
    setDurations([]);
    setTypes([]);
    setPage(1);
  }

  return (
    <section className="catalogLayout" data-catalog>
      <aside className="filters">
        <div className="filterPanel">
          <h2>Danh mục sản phẩm</h2>
          {categories.map((name) => {
            const count = products.filter((product) => name === "Tất cả sản phẩm" || product.title.toLowerCase().includes(name.toLowerCase()) || product.desc.toLowerCase().includes(name.toLowerCase())).length;
            return (
              <button className={category === name ? "active" : ""} key={name} data-action="category-filter" data-category={name} onClick={() => { setCategory(name); setPage(1); }} type="button">
                <span>{name}</span><strong>{count}</strong>
              </button>
            );
          })}
        </div>
        <div className="filterPanel">
          <h2>Bộ lọc</h2>
          <label className="filterLabel">Tìm kiếm <ChevronDown size={14} /></label>
          <label className="filterSearch">
            <input value={query} data-catalog-search onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="ChatGPT Plus..." />
          </label>
          <label className="filterLabel">Thời hạn</label>
          {["1 tháng"].map((item) => (
            <label className="checkRow" key={item}><input checked={durations.includes(item)} data-duration={item} onChange={() => toggleValue(item, durations, setDurations)} type="checkbox" /> {item}</label>
          ))}
          <label className="filterLabel">Loại sản phẩm</label>
          {["Tài khoản ChatGPT Plus"].map((item) => (
            <label className="checkRow" key={item}><input checked={types.includes(item)} data-type={item} onChange={() => toggleValue(item, types, setTypes)} type="checkbox" /> {item}</label>
          ))}
          <button className="resetBtn" data-action="reset-filters" onClick={resetFilters} type="button">Xóa bộ lọc</button>
        </div>
      </aside>
      <div>
        <div className="catalogTop">
          <span data-catalog-count>Hiển thị {visible.length} / {filtered.length} sản phẩm</span>
          <label>
            <select value={sort} data-catalog-sort onChange={(event) => { setSort(event.target.value); setPage(1); }}>
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
            </select>
          </label>
        </div>
        <div className="catalogGrid" data-catalog-grid>
          {visible.map((product) => <CatalogProductCard product={product} key={product.title} />)}
        </div>
        {visible.length === 0 ? <div className="emptyState">Không tìm thấy sản phẩm phù hợp.</div> : null}
        <div className="pagination" data-pagination>
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} type="button">‹</button>
          {Array.from({ length: totalPages }).map((_, index) => (
            <button className={page === index + 1 ? "active" : ""} key={index} onClick={() => setPage(index + 1)} type="button">{index + 1}</button>
          ))}
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} type="button">›</button>
        </div>
      </div>
    </section>
  );
}

function CatalogProductCard({ product }: { product: Product }) {
  return (
    <article className="productCard" data-product-card data-title={product.title} data-desc={product.desc} data-price={parsePrice(product.price)}>
      <Link className="productCardMain" href={product.href}>
        {product.badge ? <span className={`cardBadge ${product.color}`}>{product.badge}</span> : null}
        <div className="cardIcon">
          <Image src={product.icon} alt={product.title} width={116} height={116} />
        </div>
        <h3>{product.title}</h3>
        <p>{product.desc}</p>
        <div className="cardTags">
          <span>1 tháng</span>
          <span>Chính hãng</span>
        </div>
      </Link>
      <div className="cardBottom">
        <strong>{product.price}</strong>
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}

export function ProductPurchase({ packages }: { packages: Plan[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState(0);
  const { message, showToast } = useToast();
  const plan = packages[selected];

  function add() {
    addCartItem({ title: "ChatGPT Plus", plan: plan.label, price: plan.price });
    showToast("Đã thêm gói vào giỏ hàng");
  }

  function buyNow() {
    addCartItem({ title: "ChatGPT Plus", plan: plan.label, price: plan.price });
    const params = new URLSearchParams({ plan: plan.label, amount: String(parsePrice(plan.price)) });
    router.push(`/thanh-toan?${params.toString()}`);
  }

  return (
    <aside className="purchaseCard" aria-label="Chọn gói" data-purchase-card>
      <h2>Chọn gói</h2>
      <div className="plans">
        {packages.map((item, index) => (
          <button
            className={index === selected ? "plan active" : "plan"}
            key={item.label}
            data-action="select-plan"
            data-plan={item.label}
            data-price={item.price}
            onClick={() => setSelected(index)}
            type="button"
          >
            <span>{item.label}</span>
            <strong>{item.price}</strong>
            {item.sale ? <em>{item.sale}</em> : null}
            {index === selected ? <BadgeCheck className="planCheck" size={17} /> : null}
          </button>
        ))}
      </div>
      <div className="total">
        <span>Tổng tiền</span>
        <strong data-purchase-total>{plan.price}</strong>
      </div>
      <button className="buyBtn" data-action="buy-current-plan" onClick={buyNow} type="button">
        <ShoppingCart size={18} /> Mua ngay
      </button>
      <button className="addBtn" data-action="add-current-plan" onClick={add} type="button">
        <ShoppingCart size={18} /> Thêm vào giỏ hàng
      </button>
      <div className="payments">
        <span>Hỗ trợ thanh toán</span>
        <ClientPaymentMethods compact />
      </div>
      <Toast message={message} />
    </aside>
  );
}

export function CheckoutClient({ transferItems, orderItems }: { transferItems: string[][]; orderItems: string[][] }) {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const queryAmount = Number(searchParams.get("amount") || 0);
  const cartAmount = cartItems.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
  const primaryItem = cartItems[0];
  const productTitle =
    searchParams.get("product") ||
    (cartItems.length > 1 ? `${cartItems.length} sản phẩm trong giỏ` : primaryItem?.title) ||
    "ChatGPT Plus";
  const plan =
    searchParams.get("plan") ||
    (cartItems.length > 1 ? `${cartItems.reduce((sum, item) => sum + item.quantity, 0)} tài khoản` : primaryItem?.plan) ||
    "1 tháng";
  const amountValue = queryAmount || cartAmount || 120000;
  const amount = formatPrice(amountValue || 120000);

  useEffect(() => {
    const syncCart = () => setCartItems(readCart());
    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("neoshop-cart-updated", syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("neoshop-cart-updated", syncCart);
    };
  }, []);

  async function copyValue(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("Không thể sao chép");
      window.setTimeout(() => setCopied(""), 1800);
    }
  }

  return (
    <>
      <section className="checkoutGrid">
        <article className="qrCard">
          <div className="qrHeader">
            <div>
              <span>Quét mã QR</span>
              <h2>{amount}</h2>
            </div>
            <Wallet size={28} />
          </div>
          <div className="qrFrame">
            <Image src="/assets/payment-qr.png" alt="Mã QR thanh toán NeoShop" width={240} height={240} priority />
          </div>
          <p className="qrHint">Mở app ngân hàng hoặc ví điện tử, quét mã và giữ nguyên nội dung chuyển khoản.</p>
          <ClientPaymentMethods />
        </article>

        <aside className="orderCard">
          <div className="orderTop">
            <CreditCard size={22} />
            <div>
              <span>Đơn hàng #NS10024</span>
              <h2>{productTitle}</h2>
            </div>
          </div>
          <dl className="orderList">
            {orderItems.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{label === "Sản phẩm" ? productTitle : label === "Gói sử dụng" ? plan : value}</dd>
              </div>
            ))}
          </dl>
          {cartItems.length > 1 ? (
            <div className="orderMiniList">
              {cartItems.map((item) => (
                <span key={`${item.title}-${item.plan}`}>
                  {item.quantity}x {item.title} - {item.plan}
                </span>
              ))}
            </div>
          ) : null}
          <div className="orderTotal">
            <span>Tổng thanh toán</span>
            <strong data-checkout-total>{amount}</strong>
          </div>
          <Link className="primaryBtn checkoutPrimary" href="/san-pham/chatgpt-plus">
            Xem lại sản phẩm
          </Link>
        </aside>
      </section>

      <section className="transferPanel">
        <div className="transferTitle">
          <ShieldCheck size={22} />
          <div>
            <span>Thông tin chuyển khoản</span>
            <h2>Nhập đúng nội dung để hệ thống xác nhận nhanh</h2>
          </div>
        </div>
        <div className="transferGrid">
          {transferItems.map(([label, value]) => (
            <div className="transferItem" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <button
                onClick={() => copyValue(label, value)}
                aria-label={`Sao chép ${label}`}
                data-action="copy-value"
                data-label={label}
                data-value={value}
                type="button"
              >
                <Copy size={15} />
              </button>
            </div>
          ))}
        </div>
        {copied ? <div className="copyStatus">{copied === "Không thể sao chép" ? copied : `Đã sao chép ${copied}`}</div> : null}
      </section>
    </>
  );
}
