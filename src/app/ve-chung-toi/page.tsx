import { InfoPage } from "../_components/info-page";

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="NEOSHOP"
      title="Về chúng tôi"
      description="NeoShop là nền tảng cung cấp tài khoản AI chính hãng, tập trung vào trải nghiệm mua nhanh, rõ ràng và có bảo hành."
      sections={[
        { title: "Sứ mệnh", body: "Giúp người dùng tiếp cận các công cụ AI chất lượng với chi phí hợp lý và quy trình hỗ trợ minh bạch.", items: ["Sản phẩm rõ nguồn gốc", "Giao hàng nhanh", "Hỗ trợ tận tâm"] },
        { title: "Giá trị vận hành", body: "NeoShop ưu tiên độ tin cậy, bảo mật thông tin khách hàng và xử lý đơn hàng nhất quán.", items: ["Không lưu thông tin nhạy cảm không cần thiết", "Chính sách bảo hành rõ ràng", "Tư vấn đúng nhu cầu"] },
        { title: "Dịch vụ chính", body: "Cung cấp tài khoản ChatGPT Plus 1 tháng chính hãng với giá cố định 120.000đ, giao nhanh và bảo hành rõ ràng.", items: ["ChatGPT Plus 1 tháng", "Giá 120.000đ", "Giao trong vài phút", "Hỗ trợ 24/7"] },
        { title: "Cam kết", body: "NeoShop luôn đặt lợi ích khách hàng lên hàng đầu trong mọi quy trình bán hàng và hỗ trợ.", items: ["Chính hãng 100%", "Bảo hành dài hạn", "Hỗ trợ 24/7"] }
      ]}
    />
  );
}
