export type AccessStatus = "pending" | "active" | "support" | "expired";

export type AccessEntitlement = {
  id: string;
  accountId?: string;
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
  accessPassword?: string;
  otpEmail?: string;
  refreshToken?: string;
  clientId?: string;
  totpSecret?: string;
  authType?: "none" | "email_otp" | "totp_2fa";
  maskedIdentifier?: string;
  instructions: string[];
  supportNote?: string;
};

export type PublicAccessEntitlement = Omit<
  AccessEntitlement,
  "customerEmail" | "accessEmail" | "refreshToken" | "clientId" | "totpSecret"
> & {
  accessLabel: string;
  accessValue?: string;
  canReadMailbox: boolean;
  canViewTotp: boolean;
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
  const {
    customerEmail: _customerEmail,
    accessEmail,
    refreshToken: _refreshToken,
    clientId: _clientId,
    totpSecret: _totpSecret,
    ...safeItem
  } = item;
  const accessValue = item.displayValue || accessEmail;

  return {
    ...safeItem,
    accessValue,
    accessLabel: accessValue || item.maskedIdentifier || maskEmail(accessEmail) || "Đang chờ cấp quyền truy cập",
    canReadMailbox: Boolean(item.refreshToken && item.clientId && accessEmail),
    canViewTotp: item.authType === "totp_2fa" && Boolean(item.totpSecret),
  };
}

function medusaBaseUrl() {
  return (
    process.env.MEDUSA_BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL?.trim() ||
    ""
  ).replace(/\/$/, "");
}

function internalSecret() {
  return process.env.MEDUSA_INTERNAL_SECRET?.trim() || process.env.CLERK_SYNC_SECRET?.trim() || "";
}

async function fetchCustomerEntitlements(email: string) {
  const baseUrl = medusaBaseUrl();
  const secret = internalSecret();

  if (!baseUrl || !secret) {
    return fallbackEntitlements.filter((item) => normalizeEmail(item.customerEmail) === normalizeEmail(email));
  }

  const response = await fetch(`${baseUrl}/store/customer-access?email=${encodeURIComponent(email)}`, {
    headers: {
      "x-medusa-internal-secret": secret,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (normalizeEmail(email) === "demo@neoshop.vn") {
      return fallbackEntitlements;
    }

    throw new Error(`Không thể tải entitlement từ Medusa (${response.status}).`);
  }

  const payload = (await response.json()) as { entitlements?: AccessEntitlement[] };
  return Array.isArray(payload.entitlements) ? payload.entitlements : [];
}

export async function getPublicEntitlementsForEmail(email: string) {
  const entitlements = await fetchCustomerEntitlements(email);
  const normalized = normalizeEmail(email);

  return entitlements
    .filter((item) => normalizeEmail(item.customerEmail) === normalized)
    .map(toPublicEntitlement);
}

export async function getEntitlementForEmailById(email: string, entitlementId: string) {
  const entitlements = await fetchCustomerEntitlements(email);
  const normalizedEmail = normalizeEmail(email);
  const normalizedId = entitlementId.trim();

  return (
    entitlements.find(
      (item) => normalizeEmail(item.customerEmail) === normalizedEmail && item.id === normalizedId
    ) || null
  );
}
