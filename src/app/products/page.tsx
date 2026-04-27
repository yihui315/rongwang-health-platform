import { ProductCatalogClient } from '@/components/product/ProductCatalogClient';
import { listProducts } from '@/lib/data/products';

export default async function ProductsPage() {
  const products = await listProducts();

  return <ProductCatalogClient products={products} />;
}
