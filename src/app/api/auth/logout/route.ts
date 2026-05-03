import { NextResponse } from "next/server";
import { clearCustomerCookie } from "../../../../lib/medusa-customer-auth";

export async function POST() {
  return clearCustomerCookie(NextResponse.json({ success: true }));
}
