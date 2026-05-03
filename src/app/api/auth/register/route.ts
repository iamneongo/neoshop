import { NextResponse } from "next/server";
import { jsonError, medusaFetch, readMedusaError, setCustomerCookie, type Customer } from "../../../../lib/medusa-customer-auth";

type RegisterBody = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as RegisterBody;
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();
  const phone = body.phone?.trim();

  if (!email || !password) {
    return jsonError("Vui lòng nhập email và mật khẩu.");
  }

  if (password.length < 8) {
    return jsonError("Mật khẩu cần tối thiểu 8 ký tự.");
  }

  const authResponse = await medusaFetch("/auth/customer/emailpass/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!authResponse.ok) {
    return jsonError(await readMedusaError(authResponse), authResponse.status);
  }

  const { token } = (await authResponse.json()) as { token?: string };
  if (!token) {
    return jsonError("Medusa không trả về token đăng ký.", 502);
  }

  const customerResponse = await medusaFetch("/store/customers", {
    method: "POST",
    token,
    body: JSON.stringify({
      email,
      first_name: firstName || null,
      last_name: lastName || null,
      phone: phone || null,
      metadata: {
        source: "neoshop_storefront",
      },
    }),
  });

  if (!customerResponse.ok) {
    return jsonError(await readMedusaError(customerResponse), customerResponse.status);
  }

  const { customer } = (await customerResponse.json()) as { customer: Customer };
  return setCustomerCookie(NextResponse.json({ customer }), token);
}
