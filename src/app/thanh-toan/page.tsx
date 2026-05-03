import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckCircle2, Clock3, Sparkles } from "lucide-react";
import { CheckoutClient } from "../_components/client-actions";
import { Breadcrumb, Footer, SiteHeader } from "../_components/shared";

export const metadata: Metadata = {
  title: "Thanh toán",
  description: "Thanh toán đơn hàng NeoShop bằng mã QR, chuyển khoản nhanh và an toàn."
};

const orderItems = [
  ["Sản phẩm", "ChatGPT Plus"],
  ["Gói sử dụng", "1 tháng"],
  ["Bảo hành", "Trong 1 tháng"],
  ["Giao hàng", "Tự động trong 1 - 5 phút"]
];

const transferItems = [
  ["Ngân hàng", "MB Bank"],
  ["Chủ tài khoản", "NEOSHOP COMPANY"],
  ["Số tài khoản", "0123456789"],
  ["Nội dung", "NS CHATGPT 10024"]
];

export default function CheckoutPage() {
  return (
    <main>
      <SiteHeader active="products" />
      <div className="container checkoutPage">
        <Breadcrumb current="Thanh toán" />

        <section className="checkoutHero">
          <div>
            <span><Sparkles size={16} /> Thanh toán an toàn</span>
            <h1>Quét mã QR để hoàn tất đơn hàng</h1>
            <p>Đơn hàng sẽ được xác nhận tự động sau khi thanh toán thành công. Tài khoản được gửi qua email hoặc trong lịch sử đơn hàng.</p>
          </div>
          <div className="checkoutStatus">
            <Clock3 size={20} />
            <strong>Đang chờ thanh toán</strong>
            <small>Giữ đơn trong 15 phút</small>
          </div>
        </section>

        <Suspense fallback={<div className="catalogLoading">Đang tải thanh toán...</div>}>
          <CheckoutClient transferItems={transferItems} orderItems={orderItems} />
        </Suspense>

        <section className="checkoutSteps">
          {[
            ["1", "Quét QR", "Dùng app ngân hàng hoặc ví điện tử để quét mã."],
            ["2", "Chuyển khoản", "Kiểm tra số tiền và giữ nguyên nội dung."],
            ["3", "Nhận tài khoản", "Hệ thống xác nhận và gửi thông tin tự động."]
          ].map(([index, title, text]) => (
            <div key={title}>
              <i>{index}</i>
              <CheckCircle2 size={22} />
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          ))}
        </section>
      </div>
      <Footer />
    </main>
  );
}
