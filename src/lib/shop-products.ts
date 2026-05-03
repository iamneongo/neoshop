export type ShopProduct = {
  title: string;
  desc: string;
  icon: string;
  price: string;
  badge: string;
  color: string;
  href: string;
  medusaId?: string;
  variantId?: string;
};

type MedusaProduct = {
  id?: string;
  title?: string;
  handle?: string;
  subtitle?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  metadata?: Record<string, unknown> | null;
  variants?: Array<{
    id?: string;
    title?: string;
    calculated_price?: {
      calculated_amount?: number | null;
      currency_code?: string | null;
    } | null;
    prices?: Array<{ amount?: number | null; currency_code?: string | null }>;
  }>;
};

type MedusaProductsResponse = {
  products?: MedusaProduct[];
};

export const fallbackProducts: ShopProduct[] = [
  { title: "ChatGPT Plus", desc: "Tài khoản ChatGPT Plus 1 tháng", icon: "/assets/icon-chatgpt.png", price: "120.000đ", badge: "Bán chạy", color: "green", href: "/san-pham/chatgpt-plus" }
];

function formatVnd(amount?: number | null) {
  if (!amount || amount <= 0) return "Liên hệ";
  return `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
}

function metadataString(product: MedusaProduct, key: string, fallback = "") {
  const value = product.metadata?.[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function productPrice(product: MedusaProduct) {
  const variant = product.variants?.[0];
  const calculated = variant?.calculated_price?.calculated_amount;
  const fallback = variant?.prices?.find((price) => price.currency_code === "vnd")?.amount ?? variant?.prices?.[0]?.amount;
  return formatVnd(calculated ?? fallback);
}

function mapMedusaProduct(product: MedusaProduct): ShopProduct {
  const handle = product.handle || product.id || "chatgpt-plus";
  const variant = product.variants?.[0];

  return {
    title: product.title || "Sản phẩm NeoShop",
    desc: metadataString(product, "short_description", product.subtitle || product.description || "Tài khoản AI chính hãng"),
    icon: metadataString(product, "icon", product.thumbnail || "/assets/icon-account.png"),
    price: productPrice(product),
    badge: metadataString(product, "badge"),
    color: metadataString(product, "badge_color", "blue"),
    href: metadataString(product, "href", `/san-pham/${handle || "chatgpt-plus"}`),
    medusaId: product.id,
    variantId: variant?.id
  };
}

export async function getShopProducts(): Promise<ShopProduct[]> {
  const backendUrl = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

  if (!backendUrl || !publishableKey) {
    return fallbackProducts;
  }

  try {
    const fields = [
      "id",
      "title",
      "handle",
      "subtitle",
      "description",
      "thumbnail",
      "metadata",
      "variants.id",
      "variants.title",
      "variants.prices.amount",
      "variants.prices.currency_code"
    ].join(",");
    const response = await fetch(`${backendUrl.replace(/\/$/, "")}/store/products?limit=100&fields=${fields}`, {
      headers: {
        "x-publishable-api-key": publishableKey
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) return fallbackProducts;

    const data = (await response.json()) as MedusaProductsResponse;
    const neoshopProducts = data.products?.filter((product) => {
      const isNeoShop = product.metadata?.neoshop === true || product.metadata?.neoshop === "true";
      return isNeoShop && product.handle === "chatgpt-plus";
    }) ?? [];
    const products = neoshopProducts.map(mapMedusaProduct).filter((product) => product.title);
    return products.length ? products : fallbackProducts;
  } catch {
    return fallbackProducts;
  }
}
