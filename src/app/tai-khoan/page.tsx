import type { Metadata } from "next";
import { AccountClient } from "../_components/auth-client";
import { Footer, SiteHeader } from "../_components/shared";

export const metadata: Metadata = {
  title: "Tài khoản khách hàng",
  description: "Quản lý hồ sơ khách hàng, quyền truy cập đã cấp và lịch sử đơn hàng NeoShop.",
};

export default function AccountPage() {
  return (
    <main>
      <SiteHeader />
      <div className="container">
        <AccountClient />
      </div>
      <Footer />
    </main>
  );
}
