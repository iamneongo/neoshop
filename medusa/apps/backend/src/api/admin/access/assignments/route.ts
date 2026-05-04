import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  assignManagedAccessAccount,
  listAssignmentsForCustomer,
  listManagedAccessAccounts,
  unassignManagedAccessAccount,
  type ManagedAccessAssignmentInput,
} from "../../../../lib/customer-access-store";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const knex = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const customerEmail = req.query.customer_email?.toString().trim();

  if (customerEmail) {
    const entitlements = await listAssignmentsForCustomer(knex, customerEmail);
    return res.status(200).json({ entitlements });
  }

  const accounts = await listManagedAccessAccounts(knex);
  const assignments = accounts
    .filter((item) => item.assignment)
    .map((item) => ({
      assignment: item.assignment,
      account: item,
    }));

  return res.status(200).json({ assignments });
}

export async function POST(req: MedusaRequest<ManagedAccessAssignmentInput>, res: MedusaResponse) {
  const knex = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const body = req.body;

  if (!body?.account_id || !body?.customer_email) {
    return res.status(400).json({ message: "account_id và customer_email là bắt buộc." });
  }

  try {
    const account = await assignManagedAccessAccount(knex, body);
    return res.status(200).json({ account });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể gán account cho khách hàng.";
    return res.status(400).json({ message });
  }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const knex = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const accountId = req.query.account_id?.toString().trim();

  if (!accountId) {
    return res.status(400).json({ message: "Thiếu account_id để gỡ gán." });
  }

  await unassignManagedAccessAccount(knex, accountId);
  return res.status(200).json({ ok: true });
}
