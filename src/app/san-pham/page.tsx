import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { getShopProducts } from "../../lib/shop-products";
import { ProductCatalog } from "../_components/client-actions";
import { benefitItems, Breadcrumb, Footer, SiteHeader } from "../_components/shared";

export default async function ProductsPage() {
  const shopProducts = await getShopProducts();

  return (
    <main>
      <SiteHeader active="products" />
      <div className="container">
        <Breadcrumb current="Sản phẩm" />
        <section className="listingHead">
          <div>
            <h1>Tất cả sản phẩm</h1>
            <p>ChatGPT Plus 1 tháng chính hãng, giá cố định 120.000đ tại NeoShop</p>
          </div>
          <div className="officialBox">
            <ShieldCheck size={24} />
            <div><strong>Cam kết chính hãng 100%</strong><span>Bảo hành đầy đủ, hỗ trợ 24/7</span></div>
          </div>
        </section>

        <Suspense fallback={<div className="catalogLoading">Đang tải sản phẩm...</div>}>
          <ProductCatalog products={shopProducts} />
        </Suspense>

        <section className="benefitStrip listingStrip">
          {benefitItems.map(({ icon: Icon, title, text }) => (
            <div className="benefit" key={title}>
              <span><Icon size={23} /></span>
              <div><strong>{title}</strong><p>{text}</p></div>
            </div>
          ))}
        </section>
      </div>
      <Footer />
    </main>
  );
}
