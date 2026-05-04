import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  bulkUpsertManagedAccessAccounts,
  type ManagedAccessAccountInput,
} from "../../../../../lib/customer-access-store";

type BulkImportBody = {
  lines?: string[] | string;
  product_name?: string;
  plan?: string;
  instructions?: string[];
  provider?: string;
};

function parseLines(input?: string[] | string) {
  if (Array.isArray(input)) {
    return input.map((line) => line.trim()).filter(Boolean);
  }

  if (typeof input === "string") {
    return input
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [];
}

function parseAccountLine(
  line: string,
  defaults: Pick<ManagedAccessAccountInput, "product_name" | "plan" | "instructions" | "provider">
): ManagedAccessAccountInput {
  const parts = line.split("|").map((item) => item.trim());

  if (parts.length < 4) {
    throw new Error(`Dòng không hợp lệ: ${line}`);
  }

  const [access_email, access_password, refresh_token, client_id] = parts;

  return {
    provider: defaults.provider,
    product_name: defaults.product_name,
    plan: defaults.plan,
    status: "active",
    delivery_type: "manual_support",
    display_type: "email",
    display_value: access_email,
    access_email,
    access_password,
    otp_email: access_email,
    refresh_token,
    client_id,
    auth_type: "email_otp",
    masked_identifier: access_email,
    instructions: defaults.instructions,
  };
}

export async function POST(req: MedusaRequest<BulkImportBody>, res: MedusaResponse) {
  const knex = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const lines = parseLines(req.body?.lines);

  if (!lines.length) {
    return res.status(400).json({ message: "Thiếu dữ liệu lines để import." });
  }

  const defaults = {
    provider: req.body?.provider?.trim() || "chatgpt",
    product_name: req.body?.product_name?.trim() || "ChatGPT Plus",
    plan: req.body?.plan?.trim() || "1 tháng",
    instructions: Array.isArray(req.body?.instructions)
      ? req.body.instructions.map((item) => item.trim()).filter(Boolean)
      : [
          "Đăng nhập bằng email và mật khẩu được cấp.",
          "Nếu ChatGPT yêu cầu OTP, mở mailbox Outlook trực tiếp trong khu vực tài khoản đã mua.",
          "Không đổi mật khẩu hoặc thêm phương thức bảo mật mới nếu chưa được hỗ trợ xác nhận.",
        ],
  } as const;

  try {
    const accounts = await bulkUpsertManagedAccessAccounts(
      knex,
      lines.map((line) => parseAccountLine(line, defaults))
    );

    return res.status(200).json({
      imported: accounts.length,
      accounts,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể import account inventory.";
    return res.status(400).json({ message });
  }
}
