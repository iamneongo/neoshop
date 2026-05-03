import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { customerTokenCookie, jsonError, medusaFetch, readMedusaError, type Customer } from "../../../../lib/medusa-customer-auth";

type ProfileBody = {
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(customerTokenCookie)?.value;

  if (!token) {
    return jsonError("Vui lòng đăng nhập để cập nhật tài khoản.", 401);
  }

  const body = (await request.json().catch(() => ({}))) as ProfileBody;
  const response = await medusaFetch("/store/customers/me", {
    method: "POST",
    token,
    body: JSON.stringify({
      first_name: body.firstName?.trim() || null,
      last_name: body.lastName?.trim() || null,
      phone: body.phone?.trim() || null,
    }),
  });

  if (!response.ok) {
    return jsonError(await readMedusaError(response), response.status);
  }

  const { customer } = (await response.json()) as { customer: Customer };
  return NextResponse.json({ customer });
}
