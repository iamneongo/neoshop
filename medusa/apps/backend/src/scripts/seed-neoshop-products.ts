import type { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  batchProductVariantsWorkflow,
  createProductsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows";

const chatgptProduct = {
  title: "ChatGPT Plus",
  handle: "chatgpt-plus",
  description: "Tài khoản ChatGPT Plus 1 tháng chính hãng",
  icon: "/assets/icon-chatgpt.png",
  badge: "Bán chạy",
  badgeColor: "green",
  variantTitle: "1 Tháng",
  price: 120000,
} as const;

type ExistingProduct = {
  id: string;
  handle: string;
  metadata?: Record<string, unknown> | null;
  variants?: Array<{
    id: string;
    title?: string | null;
    prices?: Array<{
      id?: string;
      amount?: number;
      currency_code?: string;
    }>;
  }>;
};

function productMetadata(extra?: Record<string, unknown> | null) {
  return {
    ...(extra || {}),
    neoshop: true,
    short_description: chatgptProduct.description,
    icon: chatgptProduct.icon,
    badge: chatgptProduct.badge,
    badge_color: chatgptProduct.badgeColor,
    href: "/san-pham/chatgpt-plus",
  };
}

function archivedMetadata(extra?: Record<string, unknown> | null) {
  return {
    ...(extra || {}),
    neoshop: false,
    archived_by_neoshop_single_product_update: true,
  };
}

export default async function seedNeoShopProducts({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "handle",
      "metadata",
      "variants.id",
      "variants.title",
      "variants.prices.id",
      "variants.prices.amount",
      "variants.prices.currency_code",
    ],
  });

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
  });

  const shippingProfileId = shippingProfiles[0]?.id;
  const salesChannelId = salesChannels[0]?.id;

  if (!shippingProfileId || !salesChannelId) {
    throw new Error("Missing shipping profile or sales channel. Run Medusa migrations first.");
  }

  const products = existingProducts as ExistingProduct[];
  const current = products.find((product) => product.handle === chatgptProduct.handle);
  const otherNeoShopProducts = products.filter((product) => {
    const isNeoShop = product.metadata?.neoshop === true || product.metadata?.neoshop === "true";
    return isNeoShop && product.handle !== chatgptProduct.handle;
  });

  if (otherNeoShopProducts.length) {
    await updateProductsWorkflow(container).run({
      input: {
        products: otherNeoShopProducts.map((product) => ({
          id: product.id,
          status: ProductStatus.DRAFT,
          metadata: archivedMetadata(product.metadata),
        })),
      },
    });
    logger.info(`Archived ${otherNeoShopProducts.length} old NeoShop products from storefront selling.`);
  }

  if (!current) {
    await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: chatgptProduct.title,
            handle: chatgptProduct.handle,
            description: chatgptProduct.description,
            subtitle: chatgptProduct.description,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfileId,
            metadata: productMetadata(),
            options: [
              {
                title: "Thời hạn",
                values: [chatgptProduct.variantTitle],
              },
            ],
            variants: [
              {
                title: chatgptProduct.variantTitle,
                sku: "chatgpt-plus-1-month",
                manage_inventory: false,
                allow_backorder: true,
                options: {
                  "Thời hạn": chatgptProduct.variantTitle,
                },
                prices: [
                  {
                    amount: chatgptProduct.price,
                    currency_code: "vnd",
                  },
                ],
              },
            ],
            sales_channels: [{ id: salesChannelId }],
          },
        ],
      },
    });
    logger.info("Seeded ChatGPT Plus 1 month at 120000 VND.");
    return;
  }

  const primaryVariant = current.variants?.[0];
  const extraVariantIds = current.variants?.slice(1).map((variant) => variant.id) ?? [];

  await updateProductsWorkflow(container).run({
    input: {
      products: [
        {
          id: current.id,
          title: chatgptProduct.title,
          handle: chatgptProduct.handle,
          description: chatgptProduct.description,
          subtitle: chatgptProduct.description,
          status: ProductStatus.PUBLISHED,
          metadata: productMetadata(current.metadata),
          sales_channels: [{ id: salesChannelId }],
          variants: primaryVariant
            ? [
                {
                  id: primaryVariant.id,
                  title: chatgptProduct.variantTitle,
                  sku: "chatgpt-plus-1-month",
                  manage_inventory: false,
                  allow_backorder: true,
                  options: {
                    "Thời hạn": chatgptProduct.variantTitle,
                  },
                  prices: [
                    {
                      id: primaryVariant.prices?.find((price) => price.currency_code === "vnd")?.id,
                      amount: chatgptProduct.price,
                      currency_code: "vnd",
                    },
                  ],
                },
              ]
            : undefined,
        },
      ],
    },
  });

  if (!primaryVariant) {
    await batchProductVariantsWorkflow(container).run({
      input: {
        create: [
          {
            product_id: current.id,
            title: chatgptProduct.variantTitle,
            sku: "chatgpt-plus-1-month",
            manage_inventory: false,
            allow_backorder: true,
            options: {
              "Thời hạn": chatgptProduct.variantTitle,
            },
            prices: [
              {
                amount: chatgptProduct.price,
                currency_code: "vnd",
              },
            ],
          },
        ],
        update: [],
        delete: [],
      },
    });
  }

  if (extraVariantIds.length) {
    await batchProductVariantsWorkflow(container).run({
      input: {
        create: [],
        update: [],
        delete: extraVariantIds,
      },
    });
  }

  logger.info("Updated NeoShop catalog to ChatGPT Plus 1 month at 120000 VND only.");
}
