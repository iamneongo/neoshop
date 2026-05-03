import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type SyncBody = {
  firstName?: string;
  lastName?: string;
  phone?: string;
};

const medusaBackendUrl = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://127.0.0.1:9000";
const medusaPublishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function clean(value?: string | null) {
  const next = value?.trim();
  return next ? next : null;
}

async function syncCustomer(request?: Request) {
  const user = await currentUser();

  if (!user) {
    return jsonError("Vui lòng đăng nhập để đồng bộ tài khoản.", 401);
  }

  const email = user.primaryEmailAddress?.emailAddress;

  if (!email) {
    return jsonError("Tài khoản Clerk chưa có email chính.", 400);
  }

  const body = request ? ((await request.json().catch(() => ({}))) as SyncBody) : {};
  const secret = process.env.CLERK_SYNC_SECRET || process.env.CLERK_SECRET_KEY;

  if (!secret) {
    return jsonError("Thiếu khóa đồng bộ Clerk.", 500);
  }

  const response = await fetch(`${medusaBackendUrl}/store/clerk/customer`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-clerk-sync-secret": secret,
      ...(medusaPublishableKey ? { "x-publishable-api-key": medusaPublishableKey } : {}),
    },
    body: JSON.stringify({
      clerk_user_id: user.id,
      email,
      first_name: clean(body.firstName) ?? clean(user.firstName),
      last_name: clean(body.lastName) ?? clean(user.lastName),
      phone: clean(body.phone),
    }),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => ({}))) as { customer?: unknown; message?: string };

  if (!response.ok) {
    return jsonError(data.message || "Không thể đồng bộ customer sang Medusa.", response.status);
  }

  return NextResponse.json(data);
}

export async function GET() {
  return syncCustomer();
}

export async function POST(request: Request) {
  return syncCustomer(request);
}
