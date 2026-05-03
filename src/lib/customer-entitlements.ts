import { promises as fs } from "fs";
import path from "path";

export type AccessStatus = "pending" | "active" | "support" | "expired";

export type AccessEntitlement = {
  id: string;
  customerEmail: string;
  orderId: string;
  productName: string;
  plan: string;
  status: AccessStatus;
  startsAt?: string;
  expiresAt?: string;
  deliveryType: "seat_invite" | "license_code" | "manual_support";
  displayType?: "email" | "license_code";
  displayValue?: string;
  accessEmail?: string;
  otpEmail?: string;
  authType?: "none" | "email_otp" | "totp_2fa";
  maskedIdentifier?: string;
  instructions: string[];
  supportNote?: string;
};

export type PublicAccessEntitlement = Omit<AccessEntitlement, "customerEmail" | "accessEmail"> & {
  accessLabel: string;
  accessValue?: string;
};

const fallbackEntitlements: AccessEntitlement[] = [
  {
    id: "ent_demo_chatgpt_plus_1m",
    customerEmail: "demo@neoshop.vn",
    orderId: "NS10024",
    productName: "ChatGPT Plus",
    plan: "1 tháng",
    status: "pending",
    deliveryType: "manual_support",
    maskedIdentifier: "Sẽ hiển thị sau khi đơn được xác nhận",
    instructions: [
      "NeoShop sẽ xác nhận thanh toán và cấp quyền truy cập trong vài phút.",
      "Khách hàng chỉ nhận thông tin cần thiết cho gói đã mua.",
      "Không chia sẻ OTP, mã 2FA hoặc mật khẩu qua trang công khai.",
    ],
    supportNote: "Nếu cần đổi email nhận quyền truy cập, vui lòng liên hệ hỗ trợ trước khi đơn được cấp.",
  },
];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function maskEmail(email?: string) {
  if (!email) return "";
  const [name, domain] = email.split("@");
  if (!name || !domain) return "Định danh đã được bảo vệ";
  const head = name.slice(0, 2);
  const tail = name.length > 4 ? name.slice(-2) : "";
  return `${head}${"*".repeat(Math.max(3, name.length - head.length - tail.length))}${tail}@${domain}`;
}

function toPublicEntitlement(item: AccessEntitlement): PublicAccessEntitlement {
  const { customerEmail: _customerEmail, accessEmail, ...safeItem } = item;
  const accessValue = item.displayValue || accessEmail;

  return {
    ...safeItem,
    accessValue,
    accessLabel: accessValue || item.maskedIdentifier || maskEmail(accessEmail) || "Đang chờ cấp quyền truy cập",
  };
}

async function readEntitlementFile() {
  const filePath = path.join(process.cwd(), "data", "access-entitlements.json");

  try {
    const content = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(content) as AccessEntitlement[];
    return Array.isArray(parsed) ? parsed : fallbackEntitlements;
  } catch {
    return fallbackEntitlements;
  }
}

export async function getPublicEntitlementsForEmail(email: string) {
  const entitlements = await readEntitlementFile();
  const normalized = normalizeEmail(email);

  return entitlements
    .filter((item) => normalizeEmail(item.customerEmail) === normalized)
    .map(toPublicEntitlement);
}
