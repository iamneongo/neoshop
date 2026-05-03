import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CreditCard, Headphones, PackageCheck, ShieldCheck, ShoppingBag, ShoppingCart, Sparkles, Zap } from "lucide-react";
import { getShopProducts } from "../lib/shop-products";
import { benefitItems, Footer, PaymentMethods, ProductCard, SiteHeader } from "./_components/shared";

const stats = [
  { value: "10.000+", label: "Khách hàng hài lòng", icon: BadgeCheck },
  { value: "99.9%", label: "Tỷ lệ giao hàng thành công", icon: PackageCheck },
  { value: "5 phút", label: "Thời gian xử lý trung bình", icon: Zap },
  { value: "24/7", label: "Hỗ trợ khách hàng mọi lúc", icon: Headphones }
];

const steps = [
  { title: "Chọn sản phẩm", text: "Chọn tài khoản AI phù hợp với nhu cầu của bạn", icon: ShoppingCart },
  { title: "Thanh toán", text: "Thanh toán nhanh chóng, bảo mật qua nhiều phương thức", icon: CreditCard },
  { title: "Nhận tài khoản", text: "Nhận tài khoản ngay lập tức qua email hoặc trong đơn hàng", icon: PackageCheck }
];

export default async function HomePage() {
  const shopProducts = await getShopProducts();

  return (
    <main>
      <SiteHeader active="home" />

      <section className="homeHero">
        <div className="container homeHeroGrid">
          <div className="homeCopy">
            <span className="eyebrow"><Sparkles size={15} /> Nền tảng cung cấp tài khoản AI uy tín</span>
            <h1>Tài khoản AI<br />chính hãng Giá<br />tốt tại <span>NeoShop</span></h1>
            <p>Cung cấp tài khoản ChatGPT Plus 1 tháng chính hãng giá 120.000đ. Giao nhanh - Uy tín - Bảo hành đầy đủ.</p>
            <div className="heroPerks">
              <div><ShieldCheck size={22} /><strong>Chính hãng 100%</strong><small>Nguồn gốc rõ ràng</small></div>
              <div><Zap size={22} /><strong>Giao hàng nhanh</strong><small>Nhận tài khoản ngay</small></div>
              <div><Headphones size={22} /><strong>Hỗ trợ 24/7</strong><small>Hỗ trợ mọi lúc mọi nơi</small></div>
            </div>
            <div className="heroActions">
              <Link className="primaryBtn" href="/san-pham"><ShoppingBag size={18} /> Xem sản phẩm</Link>
              <Link className="secondaryBtn" href="/huong-dan"><CreditCard size={18} /> Hướng dẫn mua hàng</Link>
            </div>
            <div className="socialProof">
              <span>MH</span><span>TT</span><span>QH</span><span>AN</span>
              <p>10.000+ khách hàng tin tưởng và sử dụng</p>
            </div>
          </div>
          <div className="heroVisual">
            <Image src="/assets/hero-ai-shop.png" alt="NeoShop AI account hero" width={760} height={570} priority />
          </div>
        </div>
      </section>

      <div className="container">
        <section className="benefitStrip homeStrip">
          {benefitItems.map(({ icon: Icon, title, text }) => (
            <div className="benefit" key={title}>
              <span><Icon size={23} /></span>
              <div><strong>{title}</strong><p>{text}</p></div>
            </div>
          ))}
        </section>

        <section className="homeProducts">
          <div className="sectionHeading">
            <span>SẢN PHẨM NỔI BẬT</span>
            <h2>Tài khoản AI chính hãng</h2>
            <p>Đa dạng lựa chọn - Kích hoạt nhanh - Bảo hành đầy đủ</p>
          </div>
          <div className="featuredGrid">
            {shopProducts.slice(0, 1).map((product) => <ProductCard product={product} featured key={product.title} />)}
          </div>
          <Link className="outlineCenter" href="/san-pham">Xem tất cả sản phẩm <ArrowRight size={16} /></Link>
        </section>

        <section className="blueStats">
          <div className="statsIntro">
            <span>VÌ SAO CHỌN NEOSHOP?</span>
            <h2>Uy tín tạo nên thương hiệu</h2>
            <p>Chúng tôi cam kết mang đến trải nghiệm mua sắm an tâm, nhanh chóng và hài lòng nhất cho mọi khách hàng.</p>
          </div>
          {stats.map(({ icon: Icon, value, label }) => (
            <div className="statCard" key={value}>
              <Icon size={32} />
              <strong>{value}</strong>
              <p>{label}</p>
            </div>
          ))}
        </section>

        <section className="howTo" id="guide">
          <div className="sectionHeading compact">
            <span>HƯỚNG DẪN MUA HÀNG</span>
            <h2>3 bước đơn giản</h2>
          </div>
          <div className="stepsLine">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <div className="step" key={title}>
                <i>{index + 1}</i>
                <span><Icon size={30} /></span>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="paymentsPanel">
          <span>PHƯƠNG THỨC THANH TOÁN</span>
          <PaymentMethods />
        </section>

        <section className="commitments">
          <div className="sectionHeading compact">
            <span>CAM KẾT TỪ NEOSHOP</span>
            <h2>Chúng tôi luôn đặt lợi ích khách hàng lên hàng đầu</h2>
          </div>
          <div className="commitGrid">
            {benefitItems.map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <span><Icon size={22} /></span>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
