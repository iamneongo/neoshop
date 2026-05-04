import type { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  assignManagedAccessAccount,
  listManagedAccessAccounts,
} from "../lib/customer-access-store";

export default async function assignManagedAccessAccountScript({
  container,
}: {
  container: MedusaContainer;
}) {
  const knex = container.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const customerEmail = process.env.CUSTOMER_EMAIL?.trim().toLowerCase();
  const accountId = process.env.ACCESS_ACCOUNT_ID?.trim();
  const accessEmail = process.env.ACCESS_ACCOUNT_EMAIL?.trim().toLowerCase();

  if (!customerEmail) {
    throw new Error("CUSTOMER_EMAIL is required.");
  }

  const accounts = await listManagedAccessAccounts(knex);
  const account = accounts.find((item) => {
    if (accountId) {
      return item.id === accountId;
    }

    if (accessEmail) {
      return item.access_email?.toLowerCase() === accessEmail;
    }

    return false;
  });

  if (!account) {
    throw new Error("Managed access account not found.");
  }

  const result = await assignManagedAccessAccount(knex, {
    account_id: account.id,
    customer_email: customerEmail,
    order_id: process.env.ORDER_ID?.trim(),
    status: (process.env.ACCESS_STATUS?.trim() as "pending" | "active" | "support" | "expired" | undefined) || "active",
    starts_at: process.env.STARTS_AT?.trim(),
    expires_at: process.env.EXPIRES_AT?.trim(),
  });

  logger.info(`Assigned ${result?.access_email || account.id} to ${customerEmail}.`);
}
