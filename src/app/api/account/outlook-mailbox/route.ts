import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getEntitlementForEmailById } from "../../../../lib/customer-entitlements";
import { getOutlookMessageWithConfig, listOutlookMessagesWithConfig } from "../../../../lib/outlook-reader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export async function GET(request: Request) {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase();

  if (!email) {
    return jsonError("Vui lòng đăng nhập để xem mailbox Outlook.", 401);
  }

  const { searchParams } = new URL(request.url);
  const entitlementId = searchParams.get("entitlementId")?.trim();
  const messageId = searchParams.get("messageId")?.trim();
  const parsedTop = Number(searchParams.get("top") || "10");
  const top = Number.isFinite(parsedTop) ? parsedTop : 10;

  if (!entitlementId) {
    return jsonError("Thiếu entitlementId.", 400);
  }

  const entitlement = await getEntitlementForEmailById(email, entitlementId);

  if (!entitlement) {
    return jsonError("Không tìm thấy mailbox thuộc tài khoản này.", 404);
  }

  if (!entitlement.accessEmail || !entitlement.refreshToken || !entitlement.clientId) {
    return jsonError("Mailbox này chưa có cấu hình đọc email trực tiếp.", 400);
  }

  const config = {
    email: entitlement.accessEmail,
    refreshToken: entitlement.refreshToken,
    clientId: entitlement.clientId,
    tenantId: process.env.OUTLOOK_READER_TENANT_ID?.trim() || "consumers",
    clientSecret: process.env.OUTLOOK_READER_CLIENT_SECRET?.trim(),
  };

  try {
    if (messageId) {
      const data = await getOutlookMessageWithConfig(config, messageId);
      return NextResponse.json(data);
    }

    const data = await listOutlookMessagesWithConfig(config, { top });
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể đọc mailbox Outlook.";
    return jsonError(message, 500);
  }
}
