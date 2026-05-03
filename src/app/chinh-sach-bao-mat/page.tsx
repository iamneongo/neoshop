import { InfoPage } from "../_components/info-page";

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="BẢO MẬT"
      title="Chính sách bảo mật"
      description="NeoShop tôn trọng quyền riêng tư và chỉ thu thập thông tin cần thiết để xử lý đơn hàng, hỗ trợ và bảo hành."
      sections={[
        { title: "Thông tin thu thập", body: "Thông tin cơ bản được dùng để xác nhận đơn hàng và liên hệ hỗ trợ khi cần.", items: ["Email nhận hàng", "Số điện thoại nếu khách cung cấp", "Mã giao dịch và lịch sử đơn hàng"] },
        { title: "Mục đích sử dụng", body: "Dữ liệu được dùng cho giao hàng, bảo hành, chăm sóc khách hàng và cải thiện chất lượng dịch vụ.", items: ["Xác minh đơn hàng", "Hỗ trợ kỹ thuật", "Thông báo cập nhật liên quan đến dịch vụ"] },
        { title: "Bảo vệ dữ liệu", body: "NeoShop hạn chế truy cập nội bộ và không bán thông tin khách hàng cho bên thứ ba.", items: ["Chỉ dùng đúng mục đích", "Không công khai thông tin cá nhân", "Xóa hoặc ẩn dữ liệu khi không còn cần thiết"] },
        { title: "Quyền của khách hàng", body: "Khách hàng có thể yêu cầu kiểm tra, cập nhật hoặc hạn chế sử dụng thông tin cá nhân trong phạm vi cho phép.", items: ["Yêu cầu chỉnh sửa thông tin", "Yêu cầu hỗ trợ bảo mật", "Liên hệ qua support@neoshop.vn"] }
      ]}
    />
  );
}
