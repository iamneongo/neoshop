import type { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";

export default async function ensureAdminUser({ container }: { container: MedusaContainer }) {
  const email = process.env.NEOSHOP_ADMIN_EMAIL;
  const password = process.env.NEOSHOP_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("NEOSHOP_ADMIN_EMAIL and NEOSHOP_ADMIN_PASSWORD are required.");
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const authService = container.resolve(Modules.AUTH);
  const workflowService = container.resolve(Modules.WORKFLOW_ENGINE);

  const { data: users } = await query.graph({
    entity: "user",
    fields: ["id", "email"],
    filters: {
      email,
    },
  });

  let user = users[0];

  if (!user) {
    const { result: createdUsers } = await workflowService.run("create-users-workflow", {
      input: {
        users: [{ email }],
      },
    });
    user = createdUsers[0];
  }

  const { authIdentity, error } = await authService.register("emailpass", {
    body: {
      email,
      password,
    },
  });

  if (error) {
    throw new Error(String(error));
  }

  if (!authIdentity) {
    throw new Error("Auth identity could not be created.");
  }

  await authService.updateAuthIdentities({
    id: authIdentity.id,
    app_metadata: {
      user_id: user.id,
    },
  });

  logger.info(`Admin login configured for ${email}.`);
}
