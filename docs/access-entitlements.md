# Quản lý account đã cấp bằng Medusa

NeoShop không còn đọc entitlement từ `data/access-entitlements.json`.
Từ giờ, inventory account và assignment theo email khách hàng được lưu trong database của Medusa.

## Luồng dữ liệu

1. Import account inventory vào Medusa.
2. Gán từng account cho `customer_email`.
3. Storefront gọi `GET /store/customer-access?email=...` bằng secret nội bộ.
4. Trang `/tai-khoan` chỉ hiển thị account đã được gán đúng cho email đang đăng nhập.

## Admin API

Các route này chạy trong Medusa backend và yêu cầu quyền admin:

- `GET /admin/access/accounts`
- `POST /admin/access/accounts`
- `POST /admin/access/accounts/bulk`
- `GET /admin/access/assignments`
- `POST /admin/access/assignments`
- `DELETE /admin/access/assignments?account_id=<id>`

### Import hàng loạt account

Body mẫu cho `POST /admin/access/accounts/bulk`:

```json
{
  "product_name": "ChatGPT Plus",
  "plan": "1 tháng",
  "lines": [
    "email1@example.com|password1|refresh_token_1|client_id_1",
    "email2@example.com|password2|refresh_token_2|client_id_2"
  ]
}
```

### Gán account cho khách hàng

Body mẫu cho `POST /admin/access/assignments`:

```json
{
  "account_id": "acc_xxx",
  "customer_email": "khach@example.com",
  "order_id": "NS10024",
  "status": "active",
  "starts_at": "2026-05-04T00:00:00.000Z",
  "expires_at": "2026-06-04T00:00:00.000Z"
}
```

## Script import nhanh

Có thể import hàng loạt account bằng script Medusa:

```powershell
$env:ACCESS_PRODUCT_NAME="ChatGPT Plus"
$env:ACCESS_PLAN="1 tháng"
$env:ACCESS_ACCOUNT_LINES=@"
email1@example.com|password1|refresh_token_1|client_id_1
email2@example.com|password2|refresh_token_2|client_id_2
"@

npx medusa exec ./src/scripts/import-managed-access-accounts.ts

### Gán nhanh cho một email khách hàng

```powershell
$env:CUSTOMER_EMAIL="khach@example.com"
$env:ACCESS_ACCOUNT_EMAIL="MaldomadoMasterman9189@hotmail.com"
$env:ORDER_ID="NS10024"
$env:STARTS_AT="2026-05-04T00:00:00.000Z"
$env:EXPIRES_AT="2026-06-04T00:00:00.000Z"

npx medusa exec ./src/scripts/assign-managed-access-account.ts
```

Có thể dùng `ACCESS_ACCOUNT_ID` thay cho `ACCESS_ACCOUNT_EMAIL` nếu muốn chỉ định chính xác record inventory.
```

## Secret nội bộ

Storefront gọi Medusa bằng:

- `MEDUSA_INTERNAL_SECRET`, hoặc
- fallback sang `CLERK_SYNC_SECRET` nếu chưa cấu hình secret riêng.

Nếu muốn tách bạch rõ hơn, hãy set thêm `MEDUSA_INTERNAL_SECRET` giống nhau ở:

- frontend Next.js
- backend Medusa
