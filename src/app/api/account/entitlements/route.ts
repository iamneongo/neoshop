import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getPublicEntitlementsForEmail } from "../../../../lib/customer-entitlements";

export async function GET() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  if (!email) {
    return NextResponse.json({ message: "Vui lòng đăng nhập để xem quyền truy cập đã cấp." }, { status: 401 });
  }

  const entitlements = await getPublicEntitlementsForEmail(email);
  return NextResponse.json({ entitlements });
}
