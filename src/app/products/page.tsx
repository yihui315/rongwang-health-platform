import { ProductCatalogClient } from '@/components/product/ProductCatalogClient';
import { listProducts } from '@/lib/data/products';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '产品列表 | 1970 Uncle Darren\'s 恩科達倫',
  description: '浏览1970 Uncle Darren\'s全线产品，包括辅酶Q10、NMN、益生菌、DHA等美国进口营养补充剂。',
  alternates: {
    canonical: 'https://rongwang.hk/products',
  },
};

export default async function ProductsPage() {
  const products = await listProducts();

  return <ProductCatalogClient products={products} />;
}
