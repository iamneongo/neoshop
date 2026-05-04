import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  getAssignmentForCustomerById,
  listAssignmentsForCustomer,
} from "../../../lib/customer-access-store";

function expectedSecret() {
  return process.env.MEDUSA_INTERNAL_SECRET || process.env.CLERK_SYNC_SECRET || "";
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const providedSecret = req.headers["x-medusa-internal-secret"];
  const customerEmail = req.query.email?.toString().trim().toLowerCase();
  const entitlementId = req.query.entitlement_id?.toString().trim();
  const secret = expectedSecret();

  if (!secret || providedSecret !== secret) {
    return res.status(401).json({ message: "Không có quyền truy cập dữ liệu entitlement." });
  }

  if (!customerEmail) {
    return res.status(400).json({ message: "Thiếu email khách hàng." });
  }

  const knex = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);

  if (entitlementId) {
    const entitlement = await getAssignmentForCustomerById(knex, customerEmail, entitlementId);
    if (!entitlement) {
      return res.status(404).json({ message: "Không tìm thấy entitlement." });
    }

    return res.status(200).json({ entitlement });
  }

  const entitlements = await listAssignmentsForCustomer(knex, customerEmail);
  return res.status(200).json({ entitlements });
}
