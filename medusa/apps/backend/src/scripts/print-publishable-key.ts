import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export default async function printPublishableKey({ container }) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({
    entity: "api_key",
    fields: ["id", "title", "token", "type"]
  });

  const publishableKey = data.find((item) => item.type === "publishable");
  if (!publishableKey) {
    console.log("NO_PUBLISHABLE_KEY");
    return;
  }

  console.log(JSON.stringify({
    id: publishableKey.id,
    title: publishableKey.title,
    token: publishableKey.token
  }));
}
