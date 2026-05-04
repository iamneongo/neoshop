import { randomUUID } from "crypto";
import type { Knex } from "@mikro-orm/knex";

export type ManagedAccessStatus = "pending" | "active" | "support" | "expired";
export type ManagedDeliveryType = "seat_invite" | "license_code" | "manual_support";
export type ManagedDisplayType = "email" | "license_code";
export type ManagedAuthType = "none" | "email_otp" | "totp_2fa";

export type ManagedAccessAccountInput = {
  id?: string;
  provider?: string;
  product_name: string;
  plan: string;
  status?: ManagedAccessStatus;
  delivery_type?: ManagedDeliveryType;
  display_type?: ManagedDisplayType | null;
  display_value?: string | null;
  access_email?: string | null;
  access_password?: string | null;
  otp_email?: string | null;
  refresh_token?: string | null;
  client_id?: string | null;
  totp_secret?: string | null;
  auth_type?: ManagedAuthType;
  masked_identifier?: string | null;
  instructions?: string[];
  support_note?: string | null;
  metadata?: Record<string, unknown>;
};

export type ManagedAccessAssignmentInput = {
  id?: string;
  account_id: string;
  customer_email: string;
  order_id?: string | null;
  status?: ManagedAccessStatus;
  starts_at?: string | null;
  expires_at?: string | null;
  metadata?: Record<string, unknown>;
};

type AccountRow = {
  id: string;
  provider: string;
  product_name: string;
  plan: string;
  status: ManagedAccessStatus;
  delivery_type: ManagedDeliveryType;
  display_type?: ManagedDisplayType | null;
  display_value?: string | null;
  access_email?: string | null;
  access_password?: string | null;
  otp_email?: string | null;
  refresh_token?: string | null;
  client_id?: string | null;
  totp_secret?: string | null;
  auth_type: ManagedAuthType;
  masked_identifier?: string | null;
  instructions?: string[] | null;
  support_note?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: Date | string;
  updated_at?: Date | string;
};

type AssignmentRow = {
  id: string;
  account_id: string;
  customer_email: string;
  order_id?: string | null;
  status: ManagedAccessStatus;
  starts_at?: Date | string | null;
  expires_at?: Date | string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: Date | string;
  updated_at?: Date | string;
};

export type ManagedAccessAccountRecord = AccountRow & {
  assignment?: AssignmentRow | null;
  is_assigned: boolean;
};

export type ManagedCustomerEntitlement = {
  id: string;
  accountId: string;
  customerEmail: string;
  orderId: string;
  productName: string;
  plan: string;
  status: ManagedAccessStatus;
  startsAt?: string;
  expiresAt?: string;
  deliveryType: ManagedDeliveryType;
  displayType?: ManagedDisplayType;
  displayValue?: string;
  accessEmail?: string;
  accessPassword?: string;
  otpEmail?: string;
  refreshToken?: string;
  clientId?: string;
  totpSecret?: string;
  authType?: ManagedAuthType;
  maskedIdentifier?: string;
  instructions: string[];
  supportNote?: string;
};

const ACCOUNT_TABLE = "managed_access_accounts";
const ASSIGNMENT_TABLE = "managed_access_assignments";
let ensureTablesPromise: Promise<void> | null = null;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function cleanString(value?: string | null) {
  const next = value?.trim();
  return next ? next : null;
}

function normalizeInstructions(input?: string[]) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item) => item.trim()).filter(Boolean);
}

function serializeJson(value: unknown) {
  return JSON.stringify(value ?? {});
}

function parseJsonValue<T>(value: unknown, fallback: T): T {
  if (value == null) {
    return fallback;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  return value as T;
}

function toIso(value?: Date | string | null) {
  if (!value) {
    return undefined;
  }

  return new Date(value).toISOString();
}

async function ensureTableIndexes(knex: Knex) {
  const hasCustomerEmailIndex = await knex.raw(`
    SELECT 1
    FROM pg_indexes
    WHERE tablename = '${ASSIGNMENT_TABLE}'
      AND indexname = '${ASSIGNMENT_TABLE}_customer_email_idx'
  `);

  const indexRows = (hasCustomerEmailIndex as { rows?: unknown[] })?.rows || [];

  if (!indexRows.length) {
    await knex.schema.alterTable(ASSIGNMENT_TABLE, (table) => {
      table.index(["customer_email"], `${ASSIGNMENT_TABLE}_customer_email_idx`);
    });
  }
}

export async function ensureCustomerAccessTables(knex: Knex) {
  if (!ensureTablesPromise) {
    ensureTablesPromise = (async () => {
      const hasAccounts = await knex.schema.hasTable(ACCOUNT_TABLE);

      if (!hasAccounts) {
        await knex.schema.createTable(ACCOUNT_TABLE, (table) => {
          table.string("id").primary();
          table.string("provider").notNullable().defaultTo("chatgpt");
          table.string("product_name").notNullable();
          table.string("plan").notNullable();
          table.string("status").notNullable().defaultTo("active");
          table.string("delivery_type").notNullable().defaultTo("manual_support");
          table.string("display_type").nullable();
          table.string("display_value").nullable();
          table.string("access_email").nullable();
          table.string("access_password").nullable();
          table.string("otp_email").nullable();
          table.text("refresh_token").nullable();
          table.string("client_id").nullable();
          table.text("totp_secret").nullable();
          table.string("auth_type").notNullable().defaultTo("email_otp");
          table.string("masked_identifier").nullable();
          table.jsonb("instructions").notNullable().defaultTo(knex.raw("'[]'::jsonb"));
          table.text("support_note").nullable();
          table.jsonb("metadata").notNullable().defaultTo(knex.raw("'{}'::jsonb"));
          table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
          table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
        });
      }

      const hasAssignments = await knex.schema.hasTable(ASSIGNMENT_TABLE);

      if (!hasAssignments) {
        await knex.schema.createTable(ASSIGNMENT_TABLE, (table) => {
          table.string("id").primary();
          table
            .string("account_id")
            .notNullable()
            .references("id")
            .inTable(ACCOUNT_TABLE)
            .onDelete("CASCADE")
            .unique();
          table.string("customer_email").notNullable();
          table.string("order_id").nullable();
          table.string("status").notNullable().defaultTo("active");
          table.timestamp("starts_at").nullable();
          table.timestamp("expires_at").nullable();
          table.jsonb("metadata").notNullable().defaultTo(knex.raw("'{}'::jsonb"));
          table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
          table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
        });
      }

      await ensureTableIndexes(knex);
    })();
  }

  return ensureTablesPromise;
}

export async function upsertManagedAccessAccount(knex: Knex, input: ManagedAccessAccountInput) {
  await ensureCustomerAccessTables(knex);

  const id = cleanString(input.id) || `acc_${randomUUID()}`;
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    id,
    provider: cleanString(input.provider) || "chatgpt",
    product_name: cleanString(input.product_name) || "ChatGPT Plus",
    plan: cleanString(input.plan) || "1 tháng",
    status: (cleanString(input.status) || "active") as ManagedAccessStatus,
    delivery_type: (cleanString(input.delivery_type) || "manual_support") as ManagedDeliveryType,
    display_type: (cleanString(input.display_type) || "email") as ManagedDisplayType,
    display_value: cleanString(input.display_value),
    access_email: cleanString(input.access_email),
    access_password: cleanString(input.access_password),
    otp_email: cleanString(input.otp_email),
    refresh_token: cleanString(input.refresh_token),
    client_id: cleanString(input.client_id),
    totp_secret: cleanString(input.totp_secret),
    auth_type: (cleanString(input.auth_type) || "email_otp") as ManagedAuthType,
    masked_identifier: cleanString(input.masked_identifier),
    instructions: serializeJson(normalizeInstructions(input.instructions)),
    support_note: cleanString(input.support_note),
    metadata: serializeJson(input.metadata || {}),
    updated_at: now,
  };

  await knex<AccountRow>(ACCOUNT_TABLE)
    .insert({
      ...payload,
      created_at: now,
    })
    .onConflict("id")
    .merge(payload);

  return getManagedAccessAccountById(knex, id);
}

export async function bulkUpsertManagedAccessAccounts(knex: Knex, inputs: ManagedAccessAccountInput[]) {
  const results: ManagedAccessAccountRecord[] = [];

  for (const input of inputs) {
    const account = await upsertManagedAccessAccount(knex, input);

    if (account) {
      results.push(account);
    }
  }

  return results;
}

export async function listManagedAccessAccounts(knex: Knex) {
  await ensureCustomerAccessTables(knex);

  const rows = await knex<AccountRow>(`${ACCOUNT_TABLE} as a`)
    .leftJoin(`${ASSIGNMENT_TABLE} as s`, "a.id", "s.account_id")
    .select(
      "a.*",
      "s.id as assignment_id",
      "s.account_id as assignment_account_id",
      "s.customer_email as assignment_customer_email",
      "s.order_id as assignment_order_id",
      "s.status as assignment_status",
      "s.starts_at as assignment_starts_at",
      "s.expires_at as assignment_expires_at",
      "s.metadata as assignment_metadata",
      "s.created_at as assignment_created_at",
      "s.updated_at as assignment_updated_at"
    )
    .orderBy("a.created_at", "desc");

  return rows.map(mapJoinedAccountRow);
}

export async function getManagedAccessAccountById(knex: Knex, id: string) {
  await ensureCustomerAccessTables(knex);

  const row = await knex<AccountRow>(`${ACCOUNT_TABLE} as a`)
    .leftJoin(`${ASSIGNMENT_TABLE} as s`, "a.id", "s.account_id")
    .select(
      "a.*",
      "s.id as assignment_id",
      "s.account_id as assignment_account_id",
      "s.customer_email as assignment_customer_email",
      "s.order_id as assignment_order_id",
      "s.status as assignment_status",
      "s.starts_at as assignment_starts_at",
      "s.expires_at as assignment_expires_at",
      "s.metadata as assignment_metadata",
      "s.created_at as assignment_created_at",
      "s.updated_at as assignment_updated_at"
    )
    .where("a.id", id)
    .first();

  return row ? mapJoinedAccountRow(row) : null;
}

export async function assignManagedAccessAccount(knex: Knex, input: ManagedAccessAssignmentInput) {
  await ensureCustomerAccessTables(knex);

  const account = await knex<AccountRow>(ACCOUNT_TABLE).where({ id: input.account_id }).first();

  if (!account) {
    throw new Error("Không tìm thấy account inventory.");
  }

  const id = cleanString(input.id) || `asg_${randomUUID()}`;
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    id,
    account_id: input.account_id,
    customer_email: normalizeEmail(input.customer_email),
    order_id: cleanString(input.order_id),
    status: (cleanString(input.status) || "active") as ManagedAccessStatus,
    starts_at: cleanString(input.starts_at),
    expires_at: cleanString(input.expires_at),
    metadata: serializeJson(input.metadata || {}),
    updated_at: now,
  };

  await knex<AssignmentRow>(ASSIGNMENT_TABLE)
    .insert({
      ...payload,
      created_at: now,
    })
    .onConflict("account_id")
    .merge(payload);

  return getManagedAccessAccountById(knex, input.account_id);
}

export async function unassignManagedAccessAccount(knex: Knex, accountId: string) {
  await ensureCustomerAccessTables(knex);
  await knex(ASSIGNMENT_TABLE).where({ account_id: accountId }).del();
}

export async function listAssignmentsForCustomer(knex: Knex, customerEmail: string) {
  await ensureCustomerAccessTables(knex);

  const rows = await knex<AccountRow>(`${ACCOUNT_TABLE} as a`)
    .innerJoin(`${ASSIGNMENT_TABLE} as s`, "a.id", "s.account_id")
    .select(
      "a.*",
      "s.id as assignment_id",
      "s.account_id as assignment_account_id",
      "s.customer_email as assignment_customer_email",
      "s.order_id as assignment_order_id",
      "s.status as assignment_status",
      "s.starts_at as assignment_starts_at",
      "s.expires_at as assignment_expires_at",
      "s.metadata as assignment_metadata",
      "s.created_at as assignment_created_at",
      "s.updated_at as assignment_updated_at"
    )
    .where("s.customer_email", normalizeEmail(customerEmail))
    .orderBy("s.created_at", "desc");

  return rows.map(mapJoinedRowToEntitlement);
}

export async function getAssignmentForCustomerById(knex: Knex, customerEmail: string, assignmentId: string) {
  await ensureCustomerAccessTables(knex);

  const row = await knex<AccountRow>(`${ACCOUNT_TABLE} as a`)
    .innerJoin(`${ASSIGNMENT_TABLE} as s`, "a.id", "s.account_id")
    .select(
      "a.*",
      "s.id as assignment_id",
      "s.account_id as assignment_account_id",
      "s.customer_email as assignment_customer_email",
      "s.order_id as assignment_order_id",
      "s.status as assignment_status",
      "s.starts_at as assignment_starts_at",
      "s.expires_at as assignment_expires_at",
      "s.metadata as assignment_metadata",
      "s.created_at as assignment_created_at",
      "s.updated_at as assignment_updated_at"
    )
    .where("s.customer_email", normalizeEmail(customerEmail))
    .andWhere("s.id", assignmentId)
    .first();

  return row ? mapJoinedRowToEntitlement(row) : null;
}

function mapJoinedAccountRow(row: Record<string, unknown>): ManagedAccessAccountRecord {
  const assignmentId = row.assignment_id as string | undefined;

  return {
    id: String(row.id),
    provider: String(row.provider),
    product_name: String(row.product_name),
    plan: String(row.plan),
    status: String(row.status) as ManagedAccessStatus,
    delivery_type: String(row.delivery_type) as ManagedDeliveryType,
    display_type: (row.display_type as ManagedDisplayType | null | undefined) || null,
    display_value: (row.display_value as string | null | undefined) || null,
    access_email: (row.access_email as string | null | undefined) || null,
    access_password: (row.access_password as string | null | undefined) || null,
    otp_email: (row.otp_email as string | null | undefined) || null,
    refresh_token: (row.refresh_token as string | null | undefined) || null,
    client_id: (row.client_id as string | null | undefined) || null,
    totp_secret: (row.totp_secret as string | null | undefined) || null,
    auth_type: String(row.auth_type) as ManagedAuthType,
    masked_identifier: (row.masked_identifier as string | null | undefined) || null,
    instructions: parseJsonValue<string[]>(row.instructions, []),
    support_note: (row.support_note as string | null | undefined) || null,
    metadata: parseJsonValue<Record<string, unknown>>(row.metadata, {}),
    created_at: row.created_at as Date | string | undefined,
    updated_at: row.updated_at as Date | string | undefined,
    assignment: assignmentId
      ? {
          id: assignmentId,
          account_id: String(row.assignment_account_id),
          customer_email: String(row.assignment_customer_email),
          order_id: (row.assignment_order_id as string | null | undefined) || null,
          status: String(row.assignment_status) as ManagedAccessStatus,
          starts_at: (row.assignment_starts_at as Date | string | null | undefined) || null,
          expires_at: (row.assignment_expires_at as Date | string | null | undefined) || null,
          metadata: parseJsonValue<Record<string, unknown>>(row.assignment_metadata, {}),
          created_at: row.assignment_created_at as Date | string | undefined,
          updated_at: row.assignment_updated_at as Date | string | undefined,
        }
      : null,
    is_assigned: Boolean(assignmentId),
  };
}

function mapJoinedRowToEntitlement(row: Record<string, unknown>): ManagedCustomerEntitlement {
  const account = mapJoinedAccountRow(row);

  if (!account.assignment) {
    throw new Error("Joined entitlement row is missing assignment data.");
  }

  return {
    id: account.assignment.id,
    accountId: account.id,
    customerEmail: account.assignment.customer_email,
    orderId: account.assignment.order_id || "",
    productName: account.product_name,
    plan: account.plan,
    status: account.assignment.status,
    startsAt: toIso(account.assignment.starts_at),
    expiresAt: toIso(account.assignment.expires_at),
    deliveryType: account.delivery_type,
    displayType: account.display_type || undefined,
    displayValue: account.display_value || undefined,
    accessEmail: account.access_email || undefined,
    accessPassword: account.access_password || undefined,
    otpEmail: account.otp_email || undefined,
    refreshToken: account.refresh_token || undefined,
    clientId: account.client_id || undefined,
    totpSecret: account.totp_secret || undefined,
    authType: account.auth_type,
    maskedIdentifier: account.masked_identifier || undefined,
    instructions: account.instructions || [],
    supportNote: account.support_note || undefined,
  };
}
