import { InfoPage } from "../_components/info-page";

export default function WarrantyPage() {
  return (
    <InfoPage
      eyebrow="CHÍNH SÁCH"
      title="Chính sách bảo hành"
      description="NeoShop bảo hành theo thời hạn gói đã chọn, áp dụng cho lỗi đăng nhập, lỗi kích hoạt hoặc tài khoản không hoạt động đúng mô tả."
      sections={[
        { title: "Điều kiện bảo hành", body: "Bảo hành áp dụng khi tài khoản gặp lỗi không do người dùng thay đổi thông tin hoặc vi phạm hướng dẫn.", items: ["Không đổi mật khẩu", "Không chia sẻ tài khoản", "Không dùng sai mục đích gây khóa dịch vụ"] },
        { title: "Phạm vi hỗ trợ", body: "NeoShop kiểm tra và xử lý các lỗi thường gặp trong quá trình sử dụng tài khoản.", items: ["Không đăng nhập được", "Không đúng gói đã mua", "Tài khoản hết quyền lợi trước thời hạn"] },
        { title: "Thời gian xử lý", body: "Yêu cầu bảo hành được tiếp nhận 24/7 và ưu tiên theo mức độ ảnh hưởng.", items: ["Phản hồi ban đầu nhanh nhất có thể", "Xác minh thông tin đơn hàng", "Đổi tài khoản nếu đủ điều kiện"] },
        { title: "Không áp dụng", body: "Một số trường hợp không nằm trong chính sách bảo hành do vượt ngoài phạm vi kiểm soát.", items: ["Tự ý đổi thông tin", "Chia sẻ công khai tài khoản", "Vi phạm chính sách nền tảng AI"] }
      ]}
    />
  );
}
