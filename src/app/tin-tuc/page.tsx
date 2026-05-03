import { InfoPage } from "../_components/info-page";

export default function NewsPage() {
  return (
    <InfoPage
      active="news"
      eyebrow="TIN TỨC"
      title="Tin tức AI và cập nhật dịch vụ"
      description="Tổng hợp thông tin về các gói tài khoản AI, mẹo sử dụng và những thay đổi quan trọng trong hệ sinh thái công cụ AI."
      sections={[
        {
          title: "ChatGPT Plus có gì nổi bật?",
          body: "ChatGPT Plus phù hợp cho học tập, làm việc, lập trình, phân tích dữ liệu và tạo nội dung với tốc độ phản hồi ổn định hơn.",
          items: ["Truy cập mô hình mới", "Hỗ trợ phân tích tệp và hình ảnh", "Ưu tiên truy cập khi hệ thống tải cao"]
        },
        {
          title: "Vì sao NeoShop chỉ bán ChatGPT Plus?",
          body: "NeoShop tập trung vào một sản phẩm chủ lực là ChatGPT Plus 1 tháng để kiểm soát nguồn hàng, tốc độ giao và chất lượng bảo hành tốt hơn.",
          items: ["Gói 1 tháng dễ kiểm soát thời hạn", "Giá cố định 120.000đ", "Hỗ trợ tập trung cho ChatGPT Plus"]
        },
        {
          title: "Bảo mật khi dùng tài khoản AI",
          body: "Người dùng nên quản lý thiết bị, lịch sử đăng nhập và thông tin nhận tài khoản cẩn thận.",
          items: ["Không chia sẻ email nhận tài khoản", "Đăng xuất khỏi thiết bị lạ", "Liên hệ hỗ trợ ngay khi phát sinh cảnh báo"]
        },
        {
          title: "Cập nhật từ NeoShop",
          body: "Các chương trình ưu đãi, thay đổi giá và chính sách bảo hành sẽ được cập nhật tại trang này.",
          items: ["Giá ChatGPT Plus 1 tháng", "Chính sách bảo hành", "Hướng dẫn sử dụng hiệu quả"]
        }
      ]}
    />
  );
}
