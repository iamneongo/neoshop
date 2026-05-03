import { createCustomersWorkflow, updateCustomersWorkflow } from "@medusajs/core-flows";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, remoteQueryObjectFromString } from "@medusajs/framework/utils";

type ClerkCustomerBody = {
  clerk_user_id?: string;
  email?: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
};

type MedusaCustomer = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  metadata?: Record<string, unknown> | null;
};

const customerFields = ["id", "email", "first_name", "last_name", "phone", "metadata", "created_at", "updated_at"];

function clean(value?: string | null) {
  const next = value?.trim();
  return next ? next : null;
}

async function findCustomerByEmail(req: MedusaRequest, email: string) {
  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);
  const query = remoteQueryObjectFromString({
    entryPoint: "customers",
    variables: {
      filters: { email },
      skip: 0,
      take: 1,
    },
    fields: customerFields,
  });
  const { rows } = await remoteQuery(query);
  return rows?.[0] as MedusaCustomer | undefined;
}

async function refetchCustomer(req: MedusaRequest, id: string) {
  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);
  const query = remoteQueryObjectFromString({
    entryPoint: "customer",
    variables: {
      filters: { id },
    },
    fields: customerFields,
  });
  const customers = await remoteQuery(query);
  return customers?.[0] as MedusaCustomer | undefined;
}

export async function POST(req: MedusaRequest<ClerkCustomerBody>, res: MedusaResponse) {
  const expectedSecret = process.env.CLERK_SYNC_SECRET;
  const providedSecret = req.headers["x-clerk-sync-secret"];

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return res.status(401).json({ message: "Không có quyền đồng bộ Clerk." });
  }

  const body = req.body || {};
  const email = clean(body.email)?.toLowerCase();
  const clerkUserId = clean(body.clerk_user_id);

  if (!email || !clerkUserId) {
    return res.status(400).json({ message: "Thiếu email hoặc Clerk user ID." });
  }

  const existing = await findCustomerByEmail(req, email);
  const metadata = {
    ...(existing?.metadata || {}),
    clerk_user_id: clerkUserId,
    auth_provider: "clerk",
  };
  const customerData = {
    email,
    first_name: clean(body.first_name),
    last_name: clean(body.last_name),
    phone: clean(body.phone),
    metadata,
  };

  if (existing) {
    const { result } = await updateCustomersWorkflow(req.scope).run({
      input: {
        selector: { id: existing.id },
        update: customerData,
      },
    });
    const customer = (await refetchCustomer(req, result[0]?.id || existing.id)) || result[0];
    return res.status(200).json({ customer });
  }

  const { result } = await createCustomersWorkflow(req.scope).run({
    input: {
      customersData: [customerData],
    },
  });
  const customer = (await refetchCustomer(req, result[0].id)) || result[0];
  return res.status(200).json({ customer });
}
