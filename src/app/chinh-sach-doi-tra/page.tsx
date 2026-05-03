import { InfoPage } from "../_components/info-page";

export default function ReturnPolicyPage() {
  return (
    <InfoPage
      eyebrow="CHÍNH SÁCH"
      title="Chính sách đổi trả"
      description="NeoShop hỗ trợ đổi tài khoản hoặc hoàn tiền theo từng trường hợp cụ thể khi sản phẩm không đúng mô tả hoặc không thể sử dụng."
      sections={[
        { title: "Đổi tài khoản", body: "Áp dụng khi tài khoản lỗi và không thể khắc phục sau khi kiểm tra.", items: ["Sai thông tin đăng nhập", "Không đúng gói dịch vụ", "Không thể kích hoạt theo hướng dẫn"] },
        { title: "Hoàn tiền", body: "Hoàn tiền được xem xét khi NeoShop không thể cung cấp sản phẩm thay thế phù hợp.", items: ["Không có hàng thay thế", "Lỗi kéo dài ngoài thời gian xử lý", "Đơn chưa được bàn giao"] },
        { title: "Quy trình xử lý", body: "Khách hàng gửi mã đơn, mô tả lỗi và ảnh chụp màn hình để đội ngũ hỗ trợ xác minh.", items: ["Tiếp nhận yêu cầu", "Kiểm tra điều kiện", "Đổi tài khoản hoặc hoàn tiền theo kết quả"] },
        { title: "Lưu ý", body: "Các sản phẩm số đã bàn giao thành công sẽ không đổi trả nếu khách hàng đổi ý hoặc sử dụng sai hướng dẫn.", items: ["Đọc kỹ mô tả trước khi mua", "Giữ nguyên thông tin tài khoản", "Liên hệ hỗ trợ trước khi tự xử lý"] }
      ]}
    />
  );
}
