import Image from "next/image";
import { Footer, PaymentMethods, SiteHeader } from "../../_components/shared";
import { ProductPurchase } from "../../_components/client-actions";
import {
  Award,
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
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

const benefits = [
  { icon: ShieldCheck, title: "Chính hãng 100%", text: "Nguồn gốc rõ ràng" },
  { icon: BadgeCheck, title: "Bảo hành đầy đủ", text: "Hỗ trợ trong suốt quá trình sử dụng" },
  { icon: Truck, title: "Giao hàng nhanh", text: "Nhận tài khoản trong vài phút" },
  { icon: Headphones, title: "Hỗ trợ 24/7", text: "Đội ngũ hỗ trợ chuyên nghiệp" }
];

const features = [
  { icon: ShoppingBag, title: "GPT-4o mới nhất", text: "Truy cập mô hình ngôn ngữ tiên tiến nhất của OpenAI." },
  { icon: Truck, title: "Duyệt web & Cập nhật thông tin", text: "Tìm kiếm thông tin mới nhất từ internet theo thời gian thực." },
  { icon: Award, title: "Phân tích dữ liệu nâng cao", text: "Xử lý file, bảng biểu, biểu đồ và phân tích chuyên sâu." },
  { icon: BadgeCheck, title: "Tạo hình ảnh DALL-E 3", text: "Tạo hình ảnh chất lượng cao từ mô tả văn bản." },
  { icon: Clock3, title: "Tốc độ nhanh hơn", text: "Phản hồi nhanh hơn, xử lý ổn định và mượt mà." },
  { icon: Zap, title: "Ưu tiên khi quá tải", text: "Được ưu tiên truy cập ngay cả khi hệ thống quá tải." }
];

const packages = [
  { label: "1 Tháng", price: "120.000đ", active: true }
];

const productInfo = [
  ["Loại tài khoản", "Tài khoản ChatGPT Plus chính chủ"],
  ["Thời gian bảo hành", "Bảo hành trong 1 tháng"],
  ["Hình thức giao hàng", "Tự động qua email"],
  ["Thời gian giao hàng", "1 - 5 phút"],
  ["Hỗ trợ", "24/7 qua Telegram / Email / Website"],
  ["Điều kiện bảo hành", "Không đổi mật khẩu, không chia sẻ tài khoản"],
  ["Thiết bị hỗ trợ", "Web, iOS, Android"],
  ["Ngôn ngữ hỗ trợ", "Tiếng Việt, English"]
];

const reviews = [
  { name: "Minh Hoàng", plan: "Đã mua gói 1 Tháng", text: "Tài khoản dùng ổn định, giao hàng nhanh, hỗ trợ nhiệt tình." },
  { name: "Thu Trang", plan: "Đã mua gói 1 Tháng", text: "ChatGPT Plus rất đáng tiền, nhiều tính năng hữu ích." },
  { name: "Quang Huy", plan: "Đã mua gói 1 Tháng", text: "Shop uy tín, bảo hành nhanh chóng. Sẽ ủng hộ lâu dài!" }
];

const faqs = [
  "Tài khoản ChatGPT Plus có chính hãng không?",
  "Nếu tài khoản không hoạt động thì sao?",
  "Tôi sẽ nhận tài khoản bằng cách nào?",
  "Chính sách bảo hành như thế nào?"
];

function Logo() {
  return (
    <a className="logo" href="#" aria-label="NeoShop">
      <span className="logoMark">
        <ShoppingBag size={24} strokeWidth={2.6} />
        <span>N</span>
      </span>
      <strong>
        Neo<span>Shop</span>
      </strong>
    </a>
  );
}

function Stars() {
  return (
    <span className="stars" aria-label="5 sao">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={15} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  );
}

export default function ProductPage() {
  return (
    <main>
      <SiteHeader active="products" />

      <div className="container">
        <div className="breadcrumb">
          <Home size={15} />
          <span>Trang chủ</span>
          <ChevronRight size={14} />
          <span>Sản phẩm</span>
          <ChevronRight size={14} />
          <strong>ChatGPT Plus</strong>
        </div>

        <section className="productHero" aria-labelledby="product-title">
          <div className="gallery">
            <div className="productImage">
              <Image src="/assets/product-chatgpt.png" alt="ChatGPT Plus" width={218} height={218} priority />
            </div>
            <div className="miniBadges">
              <div>
                <ShieldCheck size={21} />
                <span>Chính hãng 100%</span>
              </div>
              <div>
                <Zap size={21} />
                <span>Bảo hành đầy đủ</span>
              </div>
              <div>
                <Headphones size={21} />
                <span>Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>

          <article className="productSummary">
            <span className="pill green">Bán chạy</span>
            <h1 id="product-title">ChatGPT Plus</h1>
            <p className="subtitle">Tài khoản chính chủ - Nâng cấp trải nghiệm AI</p>
            <div className="ratingLine">
              <Stars />
              <strong>4.9</strong>
              <span>(256 đánh giá)</span>
              <i />
              <span>10.000+ đã mua</span>
            </div>
            <p className="description">
              Trải nghiệm sức mạnh của ChatGPT Plus với tốc độ phản hồi nhanh hơn, ưu tiên truy cập khi tải cao, và sử dụng các tính năng nâng cao như GPT-4o, DALL-E 3, duyệt web, phân tích dữ liệu và nhiều hơn nữa.
            </p>
            <ul className="checkList">
              <li>Truy cập GPT-4o mới nhất</li>
              <li>Tốc độ phản hồi nhanh, không gián đoạn</li>
              <li>Duyệt web, phân tích dữ liệu, tạo hình ảnh (DALL-E 3)</li>
              <li>Ưu tiên truy cập ngay cả khi hệ thống quá tải</li>
              <li>Tài khoản chính chủ - Bảo hành đầy đủ</li>
            </ul>
          </article>

          <ProductPurchase packages={packages} />
        </section>

        <section className="benefitStrip">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="benefit">
              <span>
                <Icon size={24} />
              </span>
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="detailsGrid">
          <div className="panel">
            <h2>Tính năng nổi bật</h2>
            <div className="featureList">
              {features.map(({ icon: Icon, title, text }) => (
                <div className="feature" key={title}>
                  <span>
                    <Icon size={22} />
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2>Thông tin sản phẩm</h2>
            <dl className="infoTable">
              {productInfo.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="noteBox">
              <strong>Lưu ý quan trọng</strong>
              <ul>
                <li>Không đổi mật khẩu và thông tin tài khoản để đảm bảo bảo hành.</li>
                <li>Không chia sẻ tài khoản với người khác.</li>
                <li>Nếu có vấn đề, vui lòng liên hệ hỗ trợ để được giúp đỡ.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="reviews panel">
          <div className="sectionTop">
            <h2>Đánh giá từ khách hàng</h2>
            <div className="arrows">
              <button aria-label="Trước">
                <ChevronLeft size={18} />
              </button>
              <button aria-label="Sau">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="reviewGrid">
            <div className="scoreBox">
              <strong>4.9 <span>/5</span></strong>
              <Stars />
              <p>Dựa trên 256 đánh giá</p>
            </div>
            <div className="bars">
              {[95, 4, 1, 0, 0].map((value, index) => (
                <div key={index}>
                  <span>{5 - index} sao</span>
                  <i>
                    <b style={{ width: `${value}%` }} />
                  </i>
                  <em>{value}%</em>
                </div>
              ))}
            </div>
            {reviews.map((review) => (
              <article className="reviewCard" key={review.name}>
                <Stars />
                <p>{review.text}</p>
                <footer>
                  <span className="avatar">{review.name.charAt(0)}</span>
                  <div>
                    <strong>{review.name}</strong>
                    <small>{review.plan}</small>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </section>

        <section className="faq panel">
          <h2>Câu hỏi thường gặp</h2>
          <div className="faqGrid">
            {faqs.map((faq) => (
              <button key={faq}>
                <span>{faq}</span>
                <ChevronDown size={18} />
              </button>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
