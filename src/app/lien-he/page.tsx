import { InfoPage } from "../_components/info-page";

export default function ContactPage() {
  return (
    <InfoPage
      active="contact"
      eyebrow="LIÊN HỆ"
      title="Liên hệ NeoShop"
      description="Đội ngũ hỗ trợ sẵn sàng giải đáp về đơn hàng, bảo hành, lựa chọn gói và các vấn đề trong quá trình sử dụng."
      sections={[
        {
          title: "Kênh hỗ trợ",
          body: "Bạn có thể liên hệ NeoShop qua email, hotline hoặc biểu mẫu hỗ trợ trong đơn hàng.",
          items: ["Email: support@neoshop.vn", "Hotline: 0123 456 789", "Thời gian hỗ trợ: 24/7 tất cả các ngày"]
        },
        {
          title: "Thông tin cần cung cấp",
          body: "Để xử lý nhanh, vui lòng gửi đủ thông tin liên quan đến đơn hàng và lỗi gặp phải.",
          items: ["Mã đơn hàng hoặc email mua hàng", "Ảnh chụp màn hình lỗi nếu có", "Tên gói sản phẩm và thời điểm phát sinh lỗi"]
        },
        {
          title: "Hỗ trợ bảo hành",
          body: "Các yêu cầu bảo hành được kiểm tra theo điều kiện sử dụng và thời hạn gói đã mua.",
          items: ["Kiểm tra trạng thái tài khoản", "Hỗ trợ đổi tài khoản khi lỗi đủ điều kiện", "Hướng dẫn sử dụng lại sau khi được xử lý"]
        },
        {
          title: "Tư vấn ChatGPT Plus",
          body: "NeoShop hiện chỉ cung cấp tài khoản ChatGPT Plus 1 tháng để tập trung chất lượng, giao nhanh và bảo hành rõ ràng.",
          items: ["Học tập và nghiên cứu", "Lập trình và phân tích dữ liệu", "Marketing, viết nội dung và vận hành công việc"]
        }
      ]}
    />
  );
}
