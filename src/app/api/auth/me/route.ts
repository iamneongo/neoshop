import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { clearCustomerCookie, customerTokenCookie, jsonError, medusaFetch, type Customer } from "../../../../lib/medusa-customer-auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(customerTokenCookie)?.value;

  if (!token) {
    return jsonError("Chưa đăng nhập.", 401);
  }

  const customerResponse = await medusaFetch("/store/customers/me", { token });

  if (!customerResponse.ok) {
    return clearCustomerCookie(jsonError("Phiên đăng nhập đã hết hạn.", 401));
  }

  const { customer } = (await customerResponse.json()) as { customer: Customer };
  return NextResponse.json({ customer });
}
