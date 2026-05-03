import { InfoPage } from "../_components/info-page";

export default function GuidePage() {
  return (
    <InfoPage
      active="guide"
      eyebrow="HƯỚNG DẪN"
      title="Hướng dẫn mua hàng"
      description="Quy trình mua tài khoản AI tại NeoShop được tối ưu để bạn chọn gói, thanh toán và nhận thông tin kích hoạt nhanh chóng."
      sections={[
        {
          title: "1. Chọn sản phẩm",
          body: "Mở danh mục sản phẩm, chọn tài khoản hoặc công cụ AI phù hợp với nhu cầu sử dụng.",
          items: ["Xem mô tả và quyền lợi từng gói", "Chọn thời hạn 1 tháng, 3 tháng, 6 tháng hoặc 12 tháng", "Kiểm tra giá và chính sách bảo hành trước khi thanh toán"]
        },
        {
          title: "2. Thanh toán",
          body: "NeoShop hỗ trợ nhiều phương thức thanh toán phổ biến, thông tin giao dịch được xử lý bảo mật.",
          items: ["MoMo, ZaloPay, VNPAY, Visa, Mastercard", "Nội dung chuyển khoản tự động theo đơn", "Đơn hàng được ghi nhận ngay sau khi thanh toán thành công"]
        },
        {
          title: "3. Nhận tài khoản",
          body: "Thông tin tài khoản hoặc hướng dẫn kích hoạt được gửi qua email và hiển thị trong đơn hàng.",
          items: ["Thời gian xử lý thường từ 1 đến 5 phút", "Có hướng dẫn đăng nhập và sử dụng", "Liên hệ hỗ trợ nếu cần đổi thiết bị hoặc kiểm tra lỗi"]
        },
        {
          title: "Lưu ý khi sử dụng",
          body: "Để giữ quyền lợi bảo hành, vui lòng sử dụng đúng hướng dẫn và không tự ý thay đổi thông tin quan trọng.",
          items: ["Không đổi mật khẩu khi chưa được hướng dẫn", "Không chia sẻ tài khoản cho nhiều người", "Lưu lại mã đơn hàng để được hỗ trợ nhanh hơn"]
        }
      ]}
    />
  );
}
