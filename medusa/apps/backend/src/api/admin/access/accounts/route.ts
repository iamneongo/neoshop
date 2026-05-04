import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  listManagedAccessAccounts,
  upsertManagedAccessAccount,
  type ManagedAccessAccountInput,
} from "../../../../lib/customer-access-store";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const knex = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const accounts = await listManagedAccessAccounts(knex);
  return res.status(200).json({ accounts });
}

export async function POST(req: MedusaRequest<ManagedAccessAccountInput>, res: MedusaResponse) {
  const knex = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const body = req.body;

  if (!body?.product_name || !body?.plan) {
    return res.status(400).json({ message: "product_name và plan là bắt buộc." });
  }

  const account = await upsertManagedAccessAccount(knex, body);
  return res.status(200).json({ account });
}
