import type { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { bulkUpsertManagedAccessAccounts } from "../lib/customer-access-store";

function parseLines() {
  const raw = process.env.ACCESS_ACCOUNT_LINES?.trim() || "";

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default async function importManagedAccessAccounts({
  container,
}: {
  container: MedusaContainer;
}) {
  const knex = container.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const lines = parseLines();

  if (!lines.length) {
    throw new Error("ACCESS_ACCOUNT_LINES is required.");
  }

  const productName = process.env.ACCESS_PRODUCT_NAME?.trim() || "ChatGPT Plus";
  const plan = process.env.ACCESS_PLAN?.trim() || "1 tháng";
  const instructions = [
    "Đăng nhập bằng email và mật khẩu được cấp.",
    "Nếu ChatGPT yêu cầu OTP, mở mailbox Outlook trực tiếp trong khu vực tài khoản đã mua.",
    "Không đổi mật khẩu hoặc thêm phương thức bảo mật mới nếu chưa được hỗ trợ xác nhận.",
  ];

  const accounts = await bulkUpsertManagedAccessAccounts(
    knex,
    lines.map((line) => {
      const [access_email, access_password, refresh_token, client_id] = line.split("|").map((item) => item.trim());

      if (!access_email || !access_password || !refresh_token || !client_id) {
        throw new Error(`Invalid access account line: ${line}`);
      }

      return {
        provider: "chatgpt",
        product_name: productName,
        plan,
        status: "active" as const,
        delivery_type: "manual_support" as const,
        display_type: "email" as const,
        display_value: access_email,
        access_email,
        access_password,
        otp_email: access_email,
        refresh_token,
        client_id,
        auth_type: "email_otp" as const,
        masked_identifier: access_email,
        instructions,
      };
    })
  );

  logger.info(`Imported ${accounts.length} managed access account(s).`);
}
