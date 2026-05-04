# Outlook Reader API

Server-side route đọc email Outlook qua Microsoft Graph:

- `GET /api/outlook/messages`
- `GET /api/outlook/messages?top=20`
- `GET /api/outlook/messages?includeBody=true`
- `GET /api/outlook/messages?messageId=<graph-message-id>`

Route yêu cầu header:

```http
Authorization: Bearer <OUTLOOK_READER_SECRET>
```

Ví dụ:

```bash
curl -H "Authorization: Bearer $OUTLOOK_READER_SECRET" "http://127.0.0.1:3000/api/outlook/messages?top=5"
```

Ghi chú:

- Route chỉ dùng server-side env, không lộ refresh token ra client.
- Mặc định API trả metadata và `bodyPreview`.
- Dùng `messageId` để lấy nội dung chi tiết của một email cụ thể.
- Dùng `includeBody=true` nếu muốn danh sách thư cũng kèm `body`.
