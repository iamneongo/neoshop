import { NextResponse } from "next/server";

export type Customer = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
};

type MedusaErrorBody = {
  message?: string;
  error?: string;
  type?: string;
};

export const customerTokenCookie = "neoshop_customer_token";

const cookieMaxAge = 60 * 60 * 24 * 30;

function backendUrl() {
  return (process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://127.0.0.1:9000").replace(/\/$/, "");
}

function publishableKey() {
  return process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export function setCustomerCookie(response: NextResponse, token: string) {
  response.cookies.set(customerTokenCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: cookieMaxAge,
  });

  return response;
}

export function clearCustomerCookie(response: NextResponse) {
  response.cookies.set(customerTokenCookie, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function readMedusaError(response: Response) {
  try {
    const body = (await response.json()) as MedusaErrorBody;
    const message = body.message || body.error || "Không thể xử lý yêu cầu.";
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("invalid email or password")) {
      return "Email hoặc mật khẩu không đúng.";
    }

    if (lowerMessage.includes("already exists")) {
      return "Email này đã được đăng ký.";
    }

    return message;
  } catch {
    return "Không thể xử lý yêu cầu.";
  }
}

export async function medusaFetch(path: string, init: RequestInit & { token?: string } = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");

  const key = publishableKey();
  if (key) {
    headers.set("x-publishable-api-key", key);
  }

  if (init.token) {
    headers.set("authorization", `Bearer ${init.token}`);
  }

  return fetch(`${backendUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

export function customerDisplayName(customer: Customer) {
  const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim();
  return name || customer.email;
}
