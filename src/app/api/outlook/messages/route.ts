import { NextResponse } from "next/server";
import { getOutlookMessage, listOutlookMessages } from "../../../../lib/outlook-reader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isAuthorized(request: Request) {
  const expected = process.env.OUTLOOK_READER_SECRET?.trim();
  const header = request.headers.get("authorization")?.trim();

  if (!expected) {
    return false;
  }

  return header === `Bearer ${expected}`;
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return jsonError("Không có quyền đọc mailbox Outlook.", 401);
  }

  const { searchParams } = new URL(request.url);
  const messageId = searchParams.get("messageId")?.trim();
  const includeBody = searchParams.get("includeBody") === "true";
  const parsedTop = Number(searchParams.get("top") || "10");
  const top = Number.isFinite(parsedTop) ? parsedTop : 10;

  try {
    if (messageId) {
      const data = await getOutlookMessage(messageId);
      return NextResponse.json(data);
    }

    const data = await listOutlookMessages({ top, includeBody });
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể đọc email Outlook.";
    return jsonError(message, 500);
  }
}
