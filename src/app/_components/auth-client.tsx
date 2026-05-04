"use client";

import Image from "next/image";
import { SignIn, SignUp, useClerk, useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Copy,
  ExternalLink,
  KeyRound,
  LifeBuoy,
  LogOut,
  Mail,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  TimerReset,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type { PublicAccessEntitlement } from "../../lib/customer-entitlements";

type AuthMode = "login" | "register";

type Customer = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  metadata?: Record<string, unknown> | null;
};

type SyncResponse = {
  customer?: Customer;
  message?: string;
};

type EntitlementsResponse = {
  entitlements?: PublicAccessEntitlement[];
  message?: string;
};

type OutlookMessageItem = {
  id?: string;
  subject?: string | null;
  receivedDateTime?: string;
  isRead?: boolean;
  hasAttachments?: boolean;
  bodyPreview?: string;
  webLink?: string;
  from?: {
    emailAddress?: {
      name?: string | null;
      address?: string | null;
    };
  } | null;
  body?: {
    content?: string;
  } | null;
};

type OutlookMessagesResponse = {
  mailbox?: string;
  messages?: OutlookMessageItem[];
  message?: string;
};

type OutlookMessageResponse = {
  mailbox?: string;
  message?: OutlookMessageItem;
};

type TotpResponse = {
  account?: string;
  code?: string;
  expiresIn?: number;
  periodSeconds?: number;
  message?: string;
};

type ExpiryMeta = {
  label: string;
  tone: "active" | "pending" | "support" | "expired";
};

type ProductMeta = {
  icon: string;
  accent: "green" | "blue" | "orange" | "dark" | "purple";
};

const clerkAppearance = {
  elements: {
    rootBox: "clerkRoot",
    cardBox: "clerkCardBox",
    card: "clerkInnerCard",
    headerTitle: "clerkTitle",
    headerSubtitle: "clerkSubtitle",
    formButtonPrimary: "clerkPrimaryButton",
    footerActionLink: "clerkLink",
  },
};

const statusLabels: Record<PublicAccessEntitlement["status"], string> = {
  pending: "Chờ cấp",
  active: "Đang hoạt động",
  support: "Cần hỗ trợ",
  expired: "Hết hạn",
};

const authTypeLabels: Record<NonNullable<PublicAccessEntitlement["authType"]>, string> = {
  none: "Không yêu cầu",
  email_otp: "Email OTP",
  totp_2fa: "2FA Authenticator",
};

function customerDisplayName(customer: Customer) {
  const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim();
  return name || customer.email;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại.";
}

function formatDate(value?: string) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date);
}

function formatDateTime(value?: string) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function mailboxUrl(email?: string) {
  const domain = email?.split("@")[1]?.toLowerCase() || "";

  if (["hotmail.com", "outlook.com", "live.com", "msn.com"].includes(domain)) {
    return "https://outlook.live.com/mail/0/";
  }

  if (domain === "gmail.com" || domain === "googlemail.com") {
    return "https://mail.google.com/mail/u/0/#inbox";
  }

  return email ? `mailto:${email}` : "";
}

function maskSecret(value?: string, visible?: boolean) {
  if (!value) return "Không có";
  if (visible) return value;
  return "•".repeat(Math.max(8, Math.min(value.length, 14)));
}

function stripHtml(input?: string) {
  if (!input) return "";
  return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getProductMeta(productName: string): ProductMeta {
  const normalized = productName.toLowerCase();

  if (normalized.includes("chatgpt")) return { icon: "/assets/icon-chatgpt.png", accent: "green" };
  if (normalized.includes("gemini")) return { icon: "/assets/icon-gemini.png", accent: "blue" };
  if (normalized.includes("claude")) return { icon: "/assets/icon-claude.png", accent: "orange" };
  if (normalized.includes("grok")) return { icon: "/assets/icon-grok.png", accent: "dark" };
  if (normalized.includes("outlook") || normalized.includes("hotmail")) {
    return { icon: "/assets/icon-outlook.png", accent: "blue" };
  }

  return { icon: "/assets/icon-account.png", accent: "purple" };
}

function isExpired(expiresAt?: string) {
  if (!expiresAt) return false;
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() < Date.now();
}

function getDaysRemaining(expiresAt?: string) {
  if (!expiresAt) return null;
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return null;
  return Math.ceil((date.getTime() - Date.now()) / 86400000);
}

function getExpiryMeta(item: PublicAccessEntitlement): ExpiryMeta {
  if (item.status === "expired" || isExpired(item.expiresAt)) {
    return { label: "Đã hết hạn", tone: "expired" };
  }

  const daysRemaining = getDaysRemaining(item.expiresAt);

  if (daysRemaining !== null && daysRemaining <= 3) {
    return {
      label: daysRemaining <= 0 ? "Đã hết hạn" : `Hết hạn sau ${daysRemaining} ngày`,
      tone: daysRemaining <= 0 ? "expired" : "pending",
    };
  }

  if (daysRemaining !== null && daysRemaining <= 30) {
    return { label: `Còn ${daysRemaining} ngày`, tone: "active" };
  }

  if (item.status === "support") {
    return { label: "Cần hỗ trợ kích hoạt", tone: "support" };
  }

  if (item.status === "pending") {
    return { label: "Đang chờ cấp quyền", tone: "pending" };
  }

  return { label: "Đang hoạt động ổn định", tone: "active" };
}

async function parseSyncResponse(response: Response) {
  const data = (await response.json().catch(() => ({}))) as SyncResponse;

  if (!response.ok) {
    throw new Error(data.message || "Không thể đồng bộ tài khoản khách hàng.");
  }

  if (!data.customer) {
    throw new Error("Không nhận được thông tin khách hàng từ Medusa.");
  }

  return data.customer;
}

async function syncClerkCustomer(input?: { firstName?: string; lastName?: string; phone?: string }) {
  return parseSyncResponse(
    await fetch("/api/auth/sync-clerk", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input ?? {}),
      cache: "no-store",
    })
  );
}

async function loadEntitlements() {
  const response = await fetch("/api/account/entitlements", { cache: "no-store" });
  const data = (await response.json().catch(() => ({}))) as EntitlementsResponse;

  if (!response.ok) {
    throw new Error(data.message || "Không thể tải quyền truy cập đã cấp.");
  }

  return data.entitlements ?? [];
}

async function loadMailboxMessages(entitlementId: string) {
  const response = await fetch(`/api/account/outlook-mailbox?entitlementId=${encodeURIComponent(entitlementId)}&top=20`, {
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as OutlookMessagesResponse;

  if (!response.ok) {
    throw new Error(data.message || "Không thể tải danh sách email Outlook.");
  }

  return {
    mailbox: data.mailbox || "",
    messages: data.messages || [],
  };
}

async function loadMailboxMessage(entitlementId: string, messageId: string) {
  const response = await fetch(
    `/api/account/outlook-mailbox?entitlementId=${encodeURIComponent(entitlementId)}&messageId=${encodeURIComponent(messageId)}`,
    { cache: "no-store" }
  );
  const data = (await response.json().catch(() => ({}))) as OutlookMessageResponse & { message?: string };

  if (!response.ok || !data.message || typeof data.message === "string") {
    throw new Error((data as { message?: string }).message || "Không thể tải nội dung email Outlook.");
  }

  return {
    mailbox: data.mailbox || "",
    message: data.message,
  };
}

async function loadTotpCode(entitlementId: string) {
  const response = await fetch(`/api/account/totp?entitlementId=${encodeURIComponent(entitlementId)}`, {
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as TotpResponse;

  if (!response.ok || !data.code) {
    throw new Error(data.message || "Không thể tải mã 2FA.");
  }

  return {
    account: data.account || "",
    code: data.code,
    expiresIn: data.expiresIn || 0,
    periodSeconds: data.periodSeconds || 30,
  };
}

function CopyButton({ value, label, onCopy }: { value?: string; label: string; onCopy: (value: string) => void }) {
  if (!value) return null;

  return (
    <button type="button" aria-label={label} onClick={() => onCopy(value)}>
      <Copy size={14} />
    </button>
  );
}

function MailboxLink({ email }: { email?: string }) {
  const href = mailboxUrl(email);
  if (!href) return null;

  return (
    <a className="mailboxLink" href={href} target="_blank" rel="noreferrer" aria-label="Mở hộp thư nhận OTP">
      <ExternalLink size={14} />
    </a>
  );
}

function AccountShellLoading({ detail }: { detail?: boolean }) {
  return (
    <section className="accountDashboard">
      <div className="accountDashboardMain">
        <div className={`accountLoadingCard${detail ? " detail" : ""}`}>{detail ? "Đang tải chi tiết tài khoản..." : "Đang tải tài khoản..."}</div>
      </div>
    </section>
  );
}

function AccountAlert({ message }: { message: string }) {
  return (
    <div className="accountStateCard error">
      <CircleAlert size={18} />
      <div>
        <strong>Không thể tải dữ liệu tài khoản</strong>
        <p>{message}</p>
      </div>
    </div>
  );
}

function AccountSidebar({
  displayName,
  email,
  activeCount,
  onLogout,
}: {
  displayName: string;
  email?: string;
  activeCount: number;
  onLogout: () => Promise<void>;
}) {
  return (
    <aside className="accountSidebar">
      <div className="accountSidebarCard profile">
        <div className="accountSidebarIdentity">
          <div className="accountSidebarAvatar">
            <UserRound size={28} />
          </div>
          <div>
            <strong>{displayName}</strong>
            <p>{email || "Chưa có email"}</p>
          </div>
        </div>
        <span className="accountMembershipBadge">
          <BadgeCheck size={14} /> Thành viên
        </span>
        <div className="accountWalletBox">
          <small>Quyền đang hoạt động</small>
          <strong>{activeCount}</strong>
          <span>Tài khoản sẵn sàng để sử dụng</span>
        </div>
      </div>

      <nav className="accountSidebarCard accountSidebarNav" aria-label="Điều hướng tài khoản">
        <Link className="active" href="/tai-khoan">
          <PackageCheck size={18} /> Tài khoản của tôi
        </Link>
        <Link href="/san-pham">
          <ShoppingBag size={18} /> Mua tài khoản mới
        </Link>
        <Link href="/lien-he">
          <LifeBuoy size={18} /> Liên hệ hỗ trợ
        </Link>
        <button type="button" onClick={() => void onLogout()}>
          <LogOut size={18} /> Đăng xuất
        </button>
      </nav>

      <div className="accountSidebarCard support">
        <strong>Bạn cần hỗ trợ?</strong>
        <p>Đội ngũ NeoShop luôn sẵn sàng hỗ trợ đăng nhập, OTP và gia hạn tài khoản 24/7.</p>
        <Link href="/lien-he">Liên hệ hỗ trợ</Link>
      </div>
    </aside>
  );
}

function DashboardStatCard({
  icon,
  tone,
  label,
  value,
  sublabel,
}: {
  icon: React.ReactNode;
  tone: "blue" | "green" | "orange" | "red";
  label: string;
  value: number;
  sublabel: string;
}) {
  return (
    <article className={`accountStatCard ${tone}`}>
      <div className="accountStatIcon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{sublabel}</small>
      </div>
    </article>
  );
}

function EntitlementRow({
  item,
}: {
  item: PublicAccessEntitlement;
}) {
  const product = getProductMeta(item.productName);
  const expiry = getExpiryMeta(item);

  return (
    <article className="accountRowCard">
      <div className="accountRowProduct">
        <div className={`accountProductIcon ${product.accent}`}>
          <Image src={product.icon} alt={item.productName} width={38} height={38} />
        </div>
        <div className="accountRowIntro">
          <div className="accountRowHeading">
            <h3>{item.productName}</h3>
            <span className={`accessStatus ${item.status}`}>{statusLabels[item.status]}</span>
          </div>
          <p className="accountRowDescription">
            {item.plan} · {authTypeLabels[item.authType || "none"]}
            {item.canReadMailbox ? " · Có Outlook OTP" : ""}
            {item.canViewTotp ? " · Có 2FA" : ""}
          </p>
        </div>
      </div>

      <div className="accountRowMeta">
        <span>Ngày bắt đầu</span>
        <strong>{formatDateTime(item.startsAt)}</strong>
        <small>{item.orderId}</small>
      </div>

      <div className="accountRowMeta">
        <span>Hết hạn</span>
        <strong>{formatDateTime(item.expiresAt)}</strong>
        <small className={`expiryMeta ${expiry.tone}`}>{expiry.label}</small>
      </div>

      <div className="accountRowActions">
        <Link className="accountRowButton" href={`/tai-khoan/${item.id}`}>
          Xem chi tiết
        </Link>
      </div>
    </article>
  );
}

function OutlookMailboxViewer({ entitlementId, email }: { entitlementId: string; email?: string }) {
  const [open, setOpen] = useState(false);
  const [mailbox, setMailbox] = useState(email || "");
  const [messages, setMessages] = useState<OutlookMessageItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingMessageId, setLoadingMessageId] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<OutlookMessageItem | null>(null);
  const [error, setError] = useState("");

  async function toggleOpen() {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (!nextOpen || messages.length > 0 || loadingList) {
      return;
    }

    setLoadingList(true);
    setError("");

    try {
      const data = await loadMailboxMessages(entitlementId);
      setMailbox(data.mailbox || email || "");
      setMessages(data.messages);
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoadingList(false);
    }
  }

  async function openMessage(messageId?: string) {
    if (!messageId) return;

    setLoadingMessageId(messageId);
    setError("");

    try {
      const data = await loadMailboxMessage(entitlementId, messageId);
      setMailbox(data.mailbox || email || "");
      setSelectedMessageId(messageId);
      setSelectedMessage(data.message);
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoadingMessageId("");
    }
  }

  return (
    <section className="accountSurfaceCard detailPanel">
      <div className="accountSectionHead">
        <div>
          <span>Outlook OTP</span>
          <h2>Mailbox nhận mã xác thực</h2>
        </div>
        <button className="accountSoftButton" type="button" onClick={toggleOpen}>
          {open ? "Ẩn mailbox" : "Mở mailbox"}
        </button>
      </div>

      <p className="detailIntro">
        Xem trực tiếp thư OTP từ mailbox Outlook đã cấp cho tài khoản này mà không cần rời khỏi trang quản lý.
      </p>

      {open ? (
        <div className="mailboxSurface">
          <div className="mailboxHeader">
            <strong>{mailbox || email || "Outlook Mailbox"}</strong>
            {email ? <MailboxLink email={email} /> : null}
          </div>

          {loadingList ? <div className="accountInlineState">Đang tải email...</div> : null}
          {error ? <div className="authMessage error">{error}</div> : null}
          {!loadingList && !error && messages.length === 0 ? <div className="accountInlineState">Chưa có email nào trong mailbox này.</div> : null}

          {!loadingList && messages.length > 0 ? (
            <div className="mailboxMessageList">
              {messages.map((item) => {
                const isSelected = selectedMessageId === item.id && selectedMessage;
                return (
                  <article className="mailboxMessageCard" key={item.id || item.subject}>
                    <div className="mailboxMessageTop">
                      <div>
                        <span className={`accessStatus ${item.isRead ? "active" : "pending"}`}>
                          {item.isRead ? "Đã đọc" : "Chưa đọc"}
                        </span>
                        <h3>{item.subject || "(Không có tiêu đề)"}</h3>
                      </div>
                      <Mail size={20} />
                    </div>

                    <dl className="mailboxMeta">
                      <div>
                        <dt>Từ</dt>
                        <dd>{item.from?.emailAddress?.address || item.from?.emailAddress?.name || "Không rõ"}</dd>
                      </div>
                      <div>
                        <dt>Nhận lúc</dt>
                        <dd>{formatDateTime(item.receivedDateTime)}</dd>
                      </div>
                    </dl>

                    <p>{item.bodyPreview || "Không có nội dung xem trước."}</p>

                    <div className="mailboxActions">
                      <button type="button" className="secondaryBtn" onClick={() => void openMessage(item.id)} disabled={!item.id || loadingMessageId === item.id}>
                        {loadingMessageId === item.id ? "Đang mở..." : "Xem nội dung"}
                      </button>
                      {item.webLink ? (
                        <a className="secondaryBtn" href={item.webLink} target="_blank" rel="noreferrer">
                          Mở trong Outlook
                        </a>
                      ) : null}
                    </div>

                    {isSelected ? (
                      <div className="mailboxBodyCard">
                        <strong>Nội dung email</strong>
                        <pre>{stripHtml(selectedMessage.body?.content) || "Không có nội dung."}</pre>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function TotpViewer({ entitlementId }: { entitlementId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [account, setAccount] = useState("");
  const [code, setCode] = useState("");
  const [expiresIn, setExpiresIn] = useState(0);

  useEffect(() => {
    if (!isOpen || expiresIn <= 0) return;

    const timer = window.setTimeout(() => {
      setExpiresIn((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [isOpen, expiresIn]);

  async function revealCode() {
    setIsOpen(true);
    setLoading(true);
    setError("");

    try {
      const data = await loadTotpCode(entitlementId);
      setAccount(data.account);
      setCode(data.code);
      setExpiresIn(data.expiresIn);
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="accountSurfaceCard detailPanel">
      <div className="accountSectionHead">
        <div>
          <span>2FA</span>
          <h2>Mã xác thực theo thời gian</h2>
        </div>
        <button className="accountSoftButton" type="button" onClick={() => void revealCode()}>
          {loading ? "Đang lấy mã..." : "Lấy mã 2FA"}
        </button>
      </div>

      <p className="detailIntro">
        Dùng mã này để đăng nhập vào tài khoản đã mua khi dịch vụ yêu cầu xác minh bằng Authenticator.
      </p>

      {isOpen ? (
        <div className="totpSurface">
          {account ? <strong>{account}</strong> : null}
          {error ? <div className="authMessage error">{error}</div> : null}
          {code ? (
            <>
              <div className="totpCode">{code}</div>
              <p>Mã sẽ tự đổi sau {expiresIn}s. Khi hết hạn bạn chỉ cần bấm lấy lại mã.</p>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function useAccountBootstrap() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [entitlements, setEntitlements] = useState<PublicAccessEntitlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refreshAccountData() {
    const [nextCustomer, nextEntitlements] = await Promise.all([syncClerkCustomer(), loadEntitlements()]);
    setCustomer(nextCustomer);
    setEntitlements(nextEntitlements);
    return nextCustomer;
  }

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.replace("/dang-nhap");
      return;
    }

    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [nextCustomer, nextEntitlements] = await Promise.all([syncClerkCustomer(), loadEntitlements()]);

        if (!mounted) return;
        setCustomer(nextCustomer);
        setEntitlements(nextEntitlements);
      } catch (loadError) {
        if (mounted) setError(errorMessage(loadError));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [isLoaded, isSignedIn, router]);

  return { isLoaded, isSignedIn, user, customer, entitlements, loading, error, setCustomer, refreshAccountData };
}

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useUser();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const isRegister = mode === "register";

  useEffect(() => {
    setMode(searchParams.get("mode") === "register" ? "register" : "login");
  }, [searchParams]);

  return (
    <section className="authShell">
      <div className="authIntro">
        <span><ShieldCheck size={17} /> Tài khoản khách hàng NeoShop</span>
        <h1>{isRegister ? "Tạo tài khoản để quản lý đơn hàng" : "Đăng nhập tài khoản khách hàng"}</h1>
        <p>Clerk xử lý định danh bảo mật, NeoShop tự động đồng bộ hồ sơ khách hàng sang Medusa Admin để quản lý đơn hàng và hỗ trợ.</p>
        <div className="authPerks">
          <div><CheckCircle2 size={19} /> Đăng nhập bảo mật bằng Clerk</div>
          <div><CheckCircle2 size={19} /> Đồng bộ khách hàng với Medusa</div>
          <div><CheckCircle2 size={19} /> Theo dõi quyền truy cập và lịch sử mua hàng</div>
        </div>
      </div>

      <div className="authCard clerkAuthCard">
        <div className="authTabs" role="tablist" aria-label="Chọn chế độ đăng nhập">
          <Link className={mode === "login" ? "active" : ""} href="/dang-nhap" onClick={() => setMode("login")}>Đăng nhập</Link>
          <Link className={mode === "register" ? "active" : ""} href="/dang-nhap?mode=register" onClick={() => setMode("register")}>Đăng ký</Link>
        </div>

        {isLoaded && isSignedIn ? (
          <div className="authReady">
            <CheckCircle2 size={30} />
            <strong>Bạn đã đăng nhập</strong>
            <p>Tài khoản đã sẵn sàng để đồng bộ với Medusa và quản lý đơn hàng.</p>
            <button className="authSubmit" type="button" onClick={() => router.push("/tai-khoan")}>
              Vào tài khoản
            </button>
          </div>
        ) : null}

        {isLoaded && !isSignedIn ? (
          isRegister ? (
            <SignUp appearance={clerkAppearance} fallbackRedirectUrl="/tai-khoan" signInUrl="/dang-nhap" routing="hash" />
          ) : (
            <SignIn appearance={clerkAppearance} fallbackRedirectUrl="/tai-khoan" signUpUrl="/dang-nhap?mode=register" routing="hash" />
          )
        ) : null}
      </div>
    </section>
  );
}

export function AccountClient() {
  const { isLoaded, isSignedIn, user, customer, entitlements, loading, error } = useAccountBootstrap();
  const { signOut } = useClerk();
  const deferredEntitlements = useDeferredValue(entitlements);
  const [query, setQuery] = useState("");
  const [service, setService] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("recent");

  const displayName = useMemo(() => {
    if (customer) return customerDisplayName(customer);
    return user?.fullName || user?.primaryEmailAddress?.emailAddress || "";
  }, [customer, user]);

  const serviceOptions = useMemo(() => {
    const values = Array.from(new Set(deferredEntitlements.map((item) => item.productName))).sort((left, right) => left.localeCompare(right, "vi"));
    return values;
  }, [deferredEntitlements]);

  const filteredEntitlements = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const nextItems = deferredEntitlements.filter((item) => {
      const matchesQuery = !normalizedQuery ||
        item.productName.toLowerCase().includes(normalizedQuery) ||
        item.plan.toLowerCase().includes(normalizedQuery) ||
        (item.accessValue || "").toLowerCase().includes(normalizedQuery);
      const matchesService = service === "all" || item.productName === service;
      const matchesStatus = status === "all" || item.status === status;
      return matchesQuery && matchesService && matchesStatus;
    });

    return nextItems.sort((left, right) => {
      if (sort === "expiry") {
        return new Date(left.expiresAt || 0).getTime() - new Date(right.expiresAt || 0).getTime();
      }

      if (sort === "name") {
        return left.productName.localeCompare(right.productName, "vi");
      }

      return new Date(right.startsAt || 0).getTime() - new Date(left.startsAt || 0).getTime();
    });
  }, [deferredEntitlements, query, service, status, sort]);

  const totalCount = entitlements.length;
  const activeCount = entitlements.filter((item) => item.status === "active" && !isExpired(item.expiresAt)).length;
  const expiringSoonCount = entitlements.filter((item) => {
    const daysRemaining = getDaysRemaining(item.expiresAt);
    return item.status === "active" && daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7;
  }).length;
  const expiredCount = entitlements.filter((item) => item.status === "expired" || isExpired(item.expiresAt)).length;

  async function logout() {
    await signOut({ redirectUrl: "/" });
  }

  if (!isLoaded || loading) {
    return <AccountShellLoading />;
  }

  if (!isSignedIn) return null;

  return (
    <section className="accountDashboard">
      <AccountSidebar
        displayName={displayName}
        email={user?.primaryEmailAddress?.emailAddress}
        activeCount={activeCount}
        onLogout={logout}
      />

      <div className="accountDashboardMain">
        <section className="accountHeroCard">
          <div className="accountHeroCopy">
            <span><PackageCheck size={16} /> Tài khoản của tôi</span>
            <h1>Danh sách tài khoản bạn đã mua</h1>
            <p>Chọn một tài khoản để xem chi tiết đăng nhập, lấy mã 2FA hoặc đọc Outlook OTP khi cần.</p>
          </div>
          <Link className="primaryBtn accountHeroCta" href="/san-pham">
            <ShoppingBag size={18} /> Mua tài khoản mới
          </Link>
        </section>

        {error ? <AccountAlert message={error} /> : null}

        <section className="accountStatsGrid">
          <DashboardStatCard icon={<PackageCheck size={22} />} tone="blue" label="Tổng tài khoản" value={totalCount} sublabel="Đã cấp cho bạn" />
          <DashboardStatCard icon={<CheckCircle2 size={22} />} tone="green" label="Đang hoạt động" value={activeCount} sublabel="Sử dụng được ngay" />
          <DashboardStatCard icon={<TimerReset size={22} />} tone="orange" label="Sắp hết hạn" value={expiringSoonCount} sublabel="Cần theo dõi" />
          <DashboardStatCard icon={<CircleAlert size={22} />} tone="red" label="Hết hạn" value={expiredCount} sublabel="Có thể gia hạn lại" />
        </section>

        <section className="accountSurfaceCard">
          <div className="accountToolbar">
            <label className="accountSearchField">
              <Search size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm kiếm tài khoản..." />
            </label>

            <select value={service} onChange={(event) => setService(event.target.value)} aria-label="Lọc theo dịch vụ">
              <option value="all">Tất cả dịch vụ</option>
              {serviceOptions.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>

            <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Lọc theo trạng thái">
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="pending">Chờ cấp</option>
              <option value="support">Cần hỗ trợ</option>
              <option value="expired">Hết hạn</option>
            </select>

            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sắp xếp">
              <option value="recent">Mới nhất</option>
              <option value="expiry">Sắp hết hạn</option>
              <option value="name">Theo tên dịch vụ</option>
            </select>
          </div>

          <div className="accountRows">
            {filteredEntitlements.length > 0 ? (
              filteredEntitlements.map((item) => <EntitlementRow item={item} key={item.id} />)
            ) : (
              <div className="emptyOrders dashboardEmpty">
                <KeyRound size={24} />
                <strong>Chưa có tài khoản phù hợp bộ lọc hiện tại</strong>
                <p>Thử đổi bộ lọc hoặc mua thêm tài khoản mới để danh sách hiển thị đầy đủ hơn.</p>
                <Link href="/san-pham">Mua tài khoản mới</Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

export function AccountEntitlementDetailClient({ entitlementId }: { entitlementId: string }) {
  const { isLoaded, isSignedIn, user, customer, entitlements, loading, error } = useAccountBootstrap();
  const { signOut } = useClerk();
  const [copied, setCopied] = useState("");

  const displayName = useMemo(() => {
    if (customer) return customerDisplayName(customer);
    return user?.fullName || user?.primaryEmailAddress?.emailAddress || "";
  }, [customer, user]);

  const item = useMemo(
    () => entitlements.find((entry) => entry.id === entitlementId) || null,
    [entitlementId, entitlements]
  );

  async function copyValue(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied("Đã sao chép thông tin");
    } catch {
      setCopied("Không thể sao chép");
    } finally {
      window.setTimeout(() => setCopied(""), 1800);
    }
  }

  async function logout() {
    await signOut({ redirectUrl: "/" });
  }

  if (!isLoaded || loading) {
    return <AccountShellLoading detail />;
  }

  if (!isSignedIn) return null;

  return (
    <section className="accountDashboard">
      <AccountSidebar
        displayName={displayName}
        email={user?.primaryEmailAddress?.emailAddress}
        activeCount={entitlements.filter((entry) => entry.status === "active" && !isExpired(entry.expiresAt)).length}
        onLogout={logout}
      />

      <div className="accountDashboardMain">
        <div className="accountBackRow">
          <Link href="/tai-khoan">
            <ArrowLeft size={16} /> Quay lại danh sách tài khoản
          </Link>
        </div>

        {error ? <AccountAlert message={error} /> : null}

        {!item ? (
          <div className="accountStateCard">
            <CircleAlert size={18} />
            <div>
              <strong>Không tìm thấy tài khoản cần xem</strong>
              <p>Tài khoản này không tồn tại hoặc không thuộc về hồ sơ khách hàng hiện tại.</p>
            </div>
          </div>
        ) : (
          <>
            <section className="accountDetailHero">
              <div className="accountDetailBrand">
                <div className={`accountProductIcon ${getProductMeta(item.productName).accent}`}>
                  <Image src={getProductMeta(item.productName).icon} alt={item.productName} width={46} height={46} />
                </div>
                <div>
                  <span className={`accessStatus ${item.status}`}>{statusLabels[item.status]}</span>
                  <h1>{item.productName}</h1>
                  <p>{item.plan} · {authTypeLabels[item.authType || "none"]}</p>
                </div>
              </div>

              <div className="accountDetailHeroMeta">
                <div>
                  <span>Mã đơn</span>
                  <strong>{item.orderId}</strong>
                </div>
                <div>
                  <span>Ngày bắt đầu</span>
                  <strong>{formatDateTime(item.startsAt)}</strong>
                </div>
                <div>
                  <span>Ngày hết hạn</span>
                  <strong>{formatDateTime(item.expiresAt)}</strong>
                  <small className={`expiryMeta ${getExpiryMeta(item).tone}`}>{getExpiryMeta(item).label}</small>
                </div>
              </div>
            </section>

            <section className="accountDetailGrid">
              <section className="accountSurfaceCard detailPanel">
                <div className="accountSectionHead">
                  <div>
                    <span>Thông tin truy cập</span>
                    <h2>Tài khoản đã cấp</h2>
                  </div>
                </div>

                <div className="detailCredentialGrid">
                  <div className="detailCredentialCard">
                    <small>{item.displayType === "license_code" ? "Mã kích hoạt" : "Email truy cập"}</small>
                    <strong>{item.accessLabel}</strong>
                    <div className="detailCredentialActions">
                      <CopyButton value={item.accessValue} label="Sao chép email truy cập" onCopy={copyValue} />
                    </div>
                  </div>

                  <div className="detailCredentialCard">
                    <small>Mật khẩu</small>
                    <strong>{item.accessPassword || "Không có"}</strong>
                    <div className="detailCredentialActions">
                      <CopyButton value={item.accessPassword} label="Sao chép mật khẩu" onCopy={copyValue} />
                    </div>
                  </div>

                  <div className="detailCredentialCard">
                    <small>Email nhận OTP</small>
                    <strong>{item.otpEmail || "Không yêu cầu"}</strong>
                    <div className="detailCredentialActions">
                      <CopyButton value={item.otpEmail} label="Sao chép email OTP" onCopy={copyValue} />
                      <MailboxLink email={item.otpEmail} />
                    </div>
                  </div>

                  <div className="detailCredentialCard">
                    <small>Loại xác thực</small>
                    <strong>{authTypeLabels[item.authType || "none"]}</strong>
                    <div className="detailCredentialMeta">
                      {item.canReadMailbox ? "Có thể đọc Outlook OTP" : "Không có mailbox tích hợp"}
                      {item.canViewTotp ? " · Có 2FA TOTP" : ""}
                    </div>
                  </div>
                </div>
              </section>

              <section className="accountSurfaceCard detailPanel">
                <div className="accountSectionHead">
                  <div>
                    <span>Hướng dẫn</span>
                    <h2>Cách sử dụng tài khoản</h2>
                  </div>
                </div>

                <ul className="detailInstructionList">
                  {item.instructions.map((instruction) => (
                    <li key={instruction}>
                      <CheckCircle2 size={16} />
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>

                {item.supportNote ? <p className="detailSupportNote">{item.supportNote}</p> : null}

                <div className="detailSupportLinks">
                  <Link href="/lien-he">
                    Liên hệ hỗ trợ <ChevronRight size={16} />
                  </Link>
                  <Link href="/san-pham">
                    Mua thêm tài khoản <ChevronRight size={16} />
                  </Link>
                </div>
              </section>
            </section>

            {item.canViewTotp ? <TotpViewer entitlementId={item.id} /> : null}
            {item.canReadMailbox ? <OutlookMailboxViewer entitlementId={item.id} email={item.otpEmail || item.accessValue} /> : null}
            {copied ? <div className="copyStatus">{copied}</div> : null}
          </>
        )}
      </div>
    </section>
  );
}
