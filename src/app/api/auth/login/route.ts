import { NextResponse } from "next/server";
import { jsonError, medusaFetch, readMedusaError, setCustomerCookie, type Customer } from "../../../../lib/medusa-customer-auth";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return jsonError("Vui lòng nhập email và mật khẩu.");
  }

  const authResponse = await medusaFetch("/auth/customer/emailpass", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!authResponse.ok) {
    return jsonError(await readMedusaError(authResponse), authResponse.status);
  }

  const { token } = (await authResponse.json()) as { token?: string };
  if (!token) {
    return jsonError("Medusa không trả về token đăng nhập.", 502);
  }

  const customerResponse = await medusaFetch("/store/customers/me", { token });
  if (!customerResponse.ok) {
    return jsonError(await readMedusaError(customerResponse), customerResponse.status);
  }

  const { customer } = (await customerResponse.json()) as { customer: Customer };
  return setCustomerCookie(NextResponse.json({ customer }), token);
}
