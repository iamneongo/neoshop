# NeoShop + Medusa

NeoShop keeps the current Next.js storefront and uses Medusa as a separate commerce backend.

## Local services

- Next.js storefront: `http://127.0.0.1:3000`
- Medusa backend and admin: `http://127.0.0.1:9000`
- Medusa admin dashboard: `http://127.0.0.1:9000/app`
- PostgreSQL: use a normal connection string through `DATABASE_URL`; Docker is not required.

## PostgreSQL without Docker

Medusa needs PostgreSQL. Use either:

- Local PostgreSQL installed on Windows.
- A hosted PostgreSQL database such as Supabase, Neon, Railway, Render, or another provider.

Example Medusa backend `.env`:

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DATABASE_NAME
STORE_CORS=http://127.0.0.1:3000,http://localhost:3000
ADMIN_CORS=http://127.0.0.1:9000,http://localhost:9000
AUTH_CORS=http://127.0.0.1:9000,http://localhost:9000,http://127.0.0.1:3000,http://localhost:3000
JWT_SECRET=change_this_to_a_long_random_secret
COOKIE_SECRET=change_this_to_another_long_random_secret
```

## Environment variables for Next.js

Create `.env.local` in the storefront root:

```env
MEDUSA_BACKEND_URL=http://127.0.0.1:9000
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://127.0.0.1:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_publishable_key_here
```

If these variables are missing or Medusa is offline, the storefront automatically falls back to the current static product data.

## Product metadata used by NeoShop

Set these fields in Medusa product metadata to preserve the current NeoShop design:

```json
{
  "short_description": "Tài khoản chính chủ",
  "icon": "/assets/icon-chatgpt.png",
  "badge": "Bán chạy",
  "badge_color": "green",
  "href": "/san-pham/chatgpt-plus"
}
```

Recommended `badge_color` values: `green`, `orange`, `purple`, `dark`, `blue`.

## Implementation status

- The storefront has a Medusa product adapter at `src/lib/shop-products.ts`.
- Home and `/san-pham` read product lists through `getShopProducts()`.
- Medusa backend lives in `medusa/apps/backend`.
- NeoShop products can be seeded with `npm run medusa:seed`.
- Product cards still keep the existing NeoShop layout and actions.
- Checkout currently remains the NeoShop QR flow; the next step is creating real Medusa carts/orders from the selected variant.

## Common commands

```bash
npm run medusa:dev
npm run medusa:seed
```

Run the Medusa dashboard at `http://127.0.0.1:9000/app`.
