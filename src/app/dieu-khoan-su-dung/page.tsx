import { InfoPage } from "../_components/info-page";

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="ĐIỀU KHOẢN"
      title="Điều khoản sử dụng"
      description="Khi mua và sử dụng dịch vụ tại NeoShop, khách hàng đồng ý tuân thủ các điều khoản về thanh toán, sử dụng tài khoản và bảo hành."
      sections={[
        { title: "Trách nhiệm người dùng", body: "Khách hàng cần sử dụng tài khoản đúng hướng dẫn và không thực hiện hành vi gây ảnh hưởng đến quyền lợi bảo hành.", items: ["Không chia sẻ tài khoản trái phép", "Không thay đổi thông tin quan trọng", "Không vi phạm chính sách nền tảng"] },
        { title: "Trách nhiệm NeoShop", body: "NeoShop cung cấp đúng sản phẩm, đúng mô tả và hỗ trợ trong thời hạn bảo hành.", items: ["Bàn giao thông tin rõ ràng", "Hỗ trợ lỗi phát sinh", "Bảo vệ thông tin đơn hàng"] },
        { title: "Thanh toán", body: "Đơn hàng được xử lý sau khi hệ thống ghi nhận thanh toán thành công.", items: ["Kiểm tra nội dung chuyển khoản", "Lưu lại mã giao dịch", "Liên hệ nếu đơn chưa cập nhật"] },
        { title: "Thay đổi điều khoản", body: "NeoShop có thể cập nhật điều khoản để phù hợp với sản phẩm và quy định vận hành.", items: ["Thông báo trên website", "Áp dụng cho đơn hàng phát sinh sau cập nhật", "Không làm giảm quyền lợi bảo hành đã cam kết"] }
      ]}
    />
  );
}
