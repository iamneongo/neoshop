import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "../_components/auth-client";
import { Breadcrumb, Footer, SiteHeader } from "../_components/shared";

export const metadata: Metadata = {
  title: "Đăng nhập khách hàng",
  description: "Đăng nhập hoặc tạo tài khoản khách hàng NeoShop để quản lý thông tin và đơn hàng.",
};

export default function LoginPage() {
  return (
    <main>
      <SiteHeader />
      <div className="container">
        <Breadcrumb current="Đăng nhập" />
        <Suspense fallback={<div className="accountLoading">Đang tải biểu mẫu...</div>}>
          <AuthForm />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
