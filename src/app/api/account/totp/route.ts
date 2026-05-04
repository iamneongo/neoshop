import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getEntitlementForEmailById } from "../../../../lib/customer-entitlements";
import { generateTotp } from "../../../../lib/totp";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export async function GET(request: Request) {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase();

  if (!email) {
    return jsonError("Vui lòng đăng nhập để xem mã 2FA.", 401);
  }

  const { searchParams } = new URL(request.url);
  const entitlementId = searchParams.get("entitlementId")?.trim();

  if (!entitlementId) {
    return jsonError("Thiếu entitlementId.", 400);
  }

  const entitlement = await getEntitlementForEmailById(email, entitlementId);

  if (!entitlement) {
    return jsonError("Không tìm thấy tài khoản thuộc người dùng này.", 404);
  }

  if (entitlement.authType !== "totp_2fa" || !entitlement.totpSecret) {
    return jsonError("Tài khoản này không có mã 2FA TOTP.", 400);
  }

  try {
    const data = generateTotp(entitlement.totpSecret);
    return NextResponse.json({
      account: entitlement.displayValue || entitlement.accessEmail || entitlement.id,
      code: data.code,
      expiresIn: data.expiresIn,
      periodSeconds: data.periodSeconds,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tạo mã 2FA.";
    return jsonError(message, 500);
  }
}
