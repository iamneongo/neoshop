import { InfoPage } from "../_components/info-page";

export default function FaqPage() {
  return (
    <InfoPage
      eyebrow="FAQ"
      title="Câu hỏi thường gặp"
      description="Các câu hỏi phổ biến về tài khoản AI, thanh toán, nhận hàng và chính sách hỗ trợ tại NeoShop."
      sections={[
        { title: "Tài khoản có chính hãng không?", body: "NeoShop cung cấp tài khoản có nguồn gốc rõ ràng, đúng mô tả và có chính sách bảo hành theo gói.", items: ["Thông tin minh bạch", "Bảo hành theo thời hạn", "Hỗ trợ khi phát sinh lỗi"] },
        { title: "Nhận tài khoản bằng cách nào?", body: "Sau khi thanh toán, thông tin tài khoản hoặc hướng dẫn kích hoạt được gửi qua email hoặc hiển thị trong đơn hàng.", items: ["Giao hàng tự động", "Thường từ 1 đến 5 phút", "Có hỗ trợ nếu chưa nhận được"] },
        { title: "Tài khoản không hoạt động thì sao?", body: "Bạn gửi mã đơn và ảnh lỗi để NeoShop kiểm tra. Nếu đủ điều kiện, shop sẽ hỗ trợ đổi hoặc xử lý bảo hành.", items: ["Kiểm tra trạng thái", "Hướng dẫn khắc phục", "Đổi tài khoản khi cần"] },
        { title: "Có hỗ trợ thanh toán nào?", body: "NeoShop hỗ trợ các phương thức phổ biến như MoMo, ZaloPay, VNPAY, Visa và Mastercard.", items: ["Thanh toán nhanh", "Ghi nhận đơn tự động", "Thông tin giao dịch bảo mật"] }
      ]}
    />
  );
}
