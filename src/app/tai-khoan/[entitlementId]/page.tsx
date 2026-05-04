import type { Metadata } from "next";
import { AccountEntitlementDetailClient } from "../../_components/auth-client";
import { Footer, SiteHeader } from "../../_components/shared";

export const metadata: Metadata = {
  title: "Chi tiết tài khoản đã mua",
  description: "Xem chi tiết tài khoản đã mua, đọc Outlook OTP và lấy mã 2FA trực tiếp trong NeoShop.",
};

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ entitlementId: string }>;
}) {
  const { entitlementId } = await params;

  return (
    <main>
      <SiteHeader />
      <div className="container">
        <AccountEntitlementDetailClient entitlementId={entitlementId} />
      </div>
      <Footer />
    </main>
  );
}
