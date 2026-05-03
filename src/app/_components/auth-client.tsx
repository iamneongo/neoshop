"use client";

import { SignIn, SignUp, useClerk, useUser } from "@clerk/nextjs";
import { CheckCircle2, Copy, ExternalLink, KeyRound, LogOut, Mail, PackageCheck, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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

function AccessEntitlementsPanel() {
  const [items, setItems] = useState<PublicAccessEntitlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const nextItems = await loadEntitlements();
        if (mounted) setItems(nextItems);
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
  }, []);

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

  return (
    <section className="accountPanel accessPanel">
      <div className="panelTitle">
        <span>Quyền truy cập</span>
        <h2>Tài khoản đã cấp cho bạn</h2>
      </div>

      {loading ? <div className="accountLoading compact">Đang tải quyền truy cập...</div> : null}
      {error ? <div className="authMessage error">{error}</div> : null}

      {!loading && !error && items.length === 0 ? (
        <div className="emptyOrders">
          <KeyRound size={24} />
          <strong>Chưa có tài khoản được cấp</strong>
          <p>Sau khi đơn hàng được xác nhận, quyền truy cập ChatGPT Plus sẽ xuất hiện tại đây.</p>
          <Link href="/san-pham/chatgpt-plus">Mua ChatGPT Plus</Link>
        </div>
      ) : null}

      <div className="accessList">
        {items.map((item) => (
          <article className="accessCard" key={item.id}>
            <div className="accessTop">
              <div>
                <span className={`accessStatus ${item.status}`}>{statusLabels[item.status]}</span>
                <h3>{item.productName}</h3>
              </div>
              <PackageCheck size={24} />
            </div>

            <dl className="accessMeta">
              <div>
                <dt>Đơn hàng</dt>
                <dd>{item.orderId}</dd>
              </div>
              <div>
                <dt>Gói</dt>
                <dd>{item.plan}</dd>
              </div>
              <div>
                <dt>{item.displayType === "license_code" ? "Mã kích hoạt" : "Email truy cập"}</dt>
                <dd className="accessValue">
                  <span>{item.accessLabel}</span>
                  <CopyButton value={item.accessValue} label="Sao chép thông tin truy cập" onCopy={copyValue} />
                </dd>
              </div>
              <div>
                <dt>Email nhận OTP</dt>
                <dd className="accessValue">
                  <span>{item.otpEmail || "Không yêu cầu"}</span>
                  <CopyButton value={item.otpEmail} label="Sao chép email nhận OTP" onCopy={copyValue} />
                  <MailboxLink email={item.otpEmail} />
                </dd>
              </div>
              <div>
                <dt>Loại xác thực</dt>
                <dd>{authTypeLabels[item.authType || "none"]}</dd>
              </div>
              <div>
                <dt>Ngày bắt đầu</dt>
                <dd>{formatDate(item.startsAt)}</dd>
              </div>
              <div>
                <dt>Ngày hết hạn</dt>
                <dd>{formatDate(item.expiresAt)}</dd>
              </div>
            </dl>

            <ul className="accessSteps">
              {item.instructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ul>
            {item.supportNote ? <p className="accessNote">{item.supportNote}</p> : null}
            {item.status === "active" ? (
              <div className="accessReady">Quyền truy cập đã sẵn sàng trong tài khoản khách hàng.</div>
            ) : (
              <Link className="supportLink" href="/lien-he">Yêu cầu hỗ trợ</Link>
            )}
          </article>
        ))}
      </div>
      {copied ? <div className="copyStatus">{copied}</div> : null}
    </section>
  );
}

export function AccountClient() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const displayName = useMemo(() => {
    if (customer) return customerDisplayName(customer);
    return user?.fullName || user?.primaryEmailAddress?.emailAddress || "";
  }, [customer, user]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.replace("/dang-nhap");
      return;
    }

    let mounted = true;

    async function loadCustomer() {
      setLoading(true);
      setMessage("");

      try {
        const current = await syncClerkCustomer();
        if (!mounted) return;
        setCustomer(current);
        setFirstName(current.first_name || user?.firstName || "");
        setLastName(current.last_name || user?.lastName || "");
        setPhone(current.phone || "");
      } catch (loadError) {
        if (mounted) setMessage(errorMessage(loadError));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadCustomer();
    return () => {
      mounted = false;
    };
  }, [isLoaded, isSignedIn, router, user?.firstName, user?.lastName]);

  async function updateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await user?.update({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      const updated = await syncClerkCustomer({ firstName, lastName, phone });
      setCustomer(updated);
      setMessage("Đã cập nhật hồ sơ và đồng bộ sang Medusa.");
    } catch (updateError) {
      setMessage(errorMessage(updateError));
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await signOut({ redirectUrl: "/" });
  }

  if (!isLoaded || loading) {
    return (
      <section className="accountShell">
        <div className="accountLoading">Đang tải tài khoản...</div>
      </section>
    );
  }

  if (!isSignedIn) return null;

  return (
    <section className="accountShell">
      <aside className="accountSummary">
        <div className="accountAvatar"><UserRound size={34} /></div>
        <span>Tài khoản khách hàng</span>
        <h1>{displayName}</h1>
        <p><Mail size={16} /> {user.primaryEmailAddress?.emailAddress}</p>
        <button className="logoutBtn" onClick={logout} type="button">
          <LogOut size={17} /> Đăng xuất
        </button>
      </aside>

      <div className="accountPanels">
        <AccessEntitlementsPanel />

        <form className="accountPanel" onSubmit={updateProfile}>
          <div className="panelTitle">
            <span>Hồ sơ</span>
            <h2>Thông tin nhận tài khoản</h2>
          </div>
          <div className="authNameGrid">
            <label>
              Họ
              <input name="firstName" value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" />
            </label>
            <label>
              Tên
              <input name="lastName" value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" />
            </label>
          </div>
          <label>
            Số điện thoại
            <input name="phone" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" inputMode="tel" />
          </label>
          {message ? <div className={message.includes("Đã") ? "authMessage success" : "authMessage error"}>{message}</div> : null}
          <button className="authSubmit" disabled={saving} type="submit">
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>

        <section className="accountPanel orderHistoryPanel">
          <div className="panelTitle">
            <span>Đơn hàng</span>
            <h2>Lịch sử mua hàng</h2>
          </div>
          <div className="emptyOrders">
            <CheckCircle2 size={24} />
            <strong>Clerk đã kết nối với hồ sơ Medusa</strong>
            <p>Customer ID: {customer?.id || "Đang chờ đồng bộ"}</p>
            <Link href="/san-pham">Mua sản phẩm</Link>
          </div>
        </section>
      </div>
    </section>
  );
}
