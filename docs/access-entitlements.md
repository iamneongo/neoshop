# Quản lý quyền truy cập đã cấp

NeoShop đọc quyền truy cập của khách từ file `data/access-entitlements.json`.
File này bị ignore bởi Git để tránh đưa dữ liệu vận hành lên source.

Tạo file từ mẫu:

```powershell
Copy-Item data\access-entitlements.sample.json data\access-entitlements.json
```

Mỗi record đại diện cho một quyền truy cập đã cấp:

```json
{
  "id": "ent_order_10024",
  "customerEmail": "khach@example.com",
  "orderId": "NS10024",
  "productName": "ChatGPT Plus",
  "plan": "1 tháng",
  "status": "active",
  "startsAt": "2026-05-03",
  "expiresAt": "2026-06-03",
  "deliveryType": "seat_invite",
  "maskedIdentifier": "kh***@example.com",
  "instructions": [
    "Mở email nhận lời mời và bấm chấp nhận quyền truy cập.",
    "Không chia sẻ mã xác minh, OTP hoặc mã 2FA cho bất kỳ ai.",
    "Liên hệ NeoShop nếu cần đổi email nhận quyền truy cập."
  ],
  "supportNote": "Quyền truy cập được bảo hành trong thời hạn gói."
}
```

Không lưu mật khẩu, token phiên đăng nhập, OTP hoặc secret 2FA trong file này.
Nếu cần lưu dữ liệu nội bộ nhạy cảm cho vận hành, hãy dùng vault riêng có mã hóa,
phân quyền admin, audit log và quy trình rotate.
