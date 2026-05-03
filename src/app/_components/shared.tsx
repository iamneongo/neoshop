import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  ChevronDown,
  Facebook,
  Headphones,
  Home,
  LockKeyhole,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Timer,
  Truck,
  Zap
} from "lucide-react";
import { AddToCartButton, HeaderActions } from "./client-actions";

export const products = [
  { title: "ChatGPT Plus", desc: "Tài khoản ChatGPT Plus 1 tháng", icon: "/assets/icon-chatgpt.png", price: "120.000đ", badge: "Bán chạy", color: "green", href: "/san-pham/chatgpt-plus" }
];

const paymentLogos = [
  { src: "/assets/payment-momo.png", alt: "MoMo", width: 84, height: 84 },
  { src: "/assets/payment-zalopay.png", alt: "ZaloPay", width: 190, height: 84 },
  { src: "/assets/payment-vnpay.png", alt: "VNPAY", width: 250, height: 84 },
  { src: "/assets/payment-visa.png", alt: "Visa", width: 138, height: 84 },
  { src: "/assets/payment-mastercard.png", alt: "Mastercard", width: 120, height: 84 }
];

export function Logo() {
  return (
    <Link className="logo" href="/" aria-label="NeoShop">
      <span className="logoMark">
        <ShoppingBag size={24} strokeWidth={2.6} />
        <span>N</span>
      </span>
      <strong>
        Neo<span>Shop</span>
      </strong>
    </Link>
  );
}

export function SiteHeader({ active = "home" }: { active?: "home" | "products" | "guide" | "news" | "contact" }) {
  return (
    <header className="siteHeader">
      <div className="container nav">
        <Logo />
        <nav className="navLinks" aria-label="Chính">
          <Link className={active === "home" ? "active" : ""} href="/">Trang chủ</Link>
          <Link className={active === "products" ? "active" : ""} href="/san-pham">Sản phẩm <ChevronDown size={13} /></Link>
          <Link className={active === "guide" ? "active" : ""} href="/huong-dan">Hướng dẫn</Link>
          <Link className={active === "news" ? "active" : ""} href="/tin-tuc">Tin tức</Link>
          <Link className={active === "contact" ? "active" : ""} href="/lien-he">Liên hệ</Link>
        </nav>
        <HeaderActions />
      </div>
    </header>
  );
}

export function ProductCard({ product, featured = false }: { product: (typeof products)[number]; featured?: boolean }) {
  return (
    <article className={featured ? "productCard featuredCard" : "productCard"}>
      <Link className="productCardMain" href={product.href}>
        {product.badge ? <span className={`cardBadge ${product.color}`}>{product.badge}</span> : null}
        <div className="cardIcon">
          <Image src={product.icon} alt={product.title} width={116} height={116} />
        </div>
        <h3>{product.title}</h3>
        <p>{product.desc}</p>
        <div className="cardTags">
          <span>1 Tháng</span>
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

export function PaymentMethods({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "paymentLogos compact" : "paymentLogos"}>
      {paymentLogos.map((logo) => (
        <Image key={logo.alt} src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} />
      ))}
    </div>
  );
}

export function Stars() {
  return (
    <span className="stars" aria-label="5 sao">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={15} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  );
}

export const benefitItems = [
  { icon: ShieldCheck, title: "Chính hãng 100%", text: "Nguồn gốc rõ ràng" },
  { icon: BadgeCheck, title: "Bảo hành dài hạn", text: "Hỗ trợ trong suốt quá trình sử dụng" },
  { icon: Truck, title: "Giao hàng nhanh", text: "Nhận tài khoản trong vài phút" },
  { icon: Headphones, title: "Hỗ trợ 24/7", text: "Hỗ trợ mọi lúc mọi nơi" }
];

export function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container footerGrid">
        <div className="brandCol">
          <Logo />
          <p>Cung cấp tài khoản ChatGPT Plus 1 tháng chính hãng giá 120.000đ. Cam kết chất lượng - Bảo hành - Hỗ trợ tận tâm.</p>
          <div className="socials">
            <span><Facebook size={16} /></span>
            <span>↗</span>
            <span>♟</span>
            <span>♪</span>
          </div>
        </div>
        <div>
          <h3>SẢN PHẨM</h3>
          {products.slice(0, 5).map((product) => <Link href={product.href} key={product.title}>{product.title}</Link>)}
        </div>
        <div>
          <h3>HỖ TRỢ</h3>
          <Link href="/huong-dan">Hướng dẫn mua hàng</Link>
          <Link href="/chinh-sach-bao-hanh">Chính sách bảo hành</Link>
          <Link href="/chinh-sach-doi-tra">Chính sách đổi trả</Link>
          <Link href="/cau-hoi-thuong-gap">Câu hỏi thường gặp</Link>
        </div>
        <div>
          <h3>THÔNG TIN</h3>
          <Link href="/ve-chung-toi">Về chúng tôi</Link>
          <Link href="/tin-tuc">Tin tức</Link>
          <Link href="/dieu-khoan-su-dung">Điều khoản sử dụng</Link>
          <Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link>
        </div>
        <div>
          <h3>LIÊN HỆ</h3>
          <Link href="/lien-he"><Mail size={16} /> support@neoshop.vn</Link>
          <Link href="/lien-he"><Phone size={16} /> 0123 456 789</Link>
          <Link href="/lien-he"><Timer size={16} /> 24/7 tất cả các ngày</Link>
        </div>
      </div>
      <div className="container footerBottom">
        <span>© 2024 NeoShop. All rights reserved.</span>
        <div>
          <span><LockKeyhole size={16} /> SSL SECURE</span>
          <span>DMCA PROTECTED</span>
          <span><ShieldCheck size={16} /> 100% SECURE</span>
        </div>
      </div>
    </footer>
  );
}

export function Breadcrumb({ current }: { current: string }) {
  return (
    <div className="breadcrumb">
      <Home size={15} />
      <Link href="/">Trang chủ</Link>
      <span>›</span>
      <strong>{current}</strong>
    </div>
  );
}
