'use client';

interface CompareProduct {
  name: string;
  price: number;
  currency?: string;
  ingredients: string[];
  certifications: string[];
  isRecommended?: boolean;
}

interface ProductCompareProps {
  products?: CompareProduct[];
  title?: string;
}

const defaultProducts: CompareProduct[] = [
  {
    name: '抗疲劳组合',
    price: 299,
    currency: 'HK$',
    ingredients: ['活性B族', '螯合镁', 'Omega-3', '红景天'],
    certifications: ['GMP', 'ISO22000'],
    isRecommended: true,
  },
  {
    name: '深度睡眠组合',
    price: 259,
    currency: 'HK$',
    ingredients: ['GABA', '镁甘氨酸', '褪黑素', '南非醉茄'],
    certifications: ['GMP', 'ISO22000'],
  },
  {
    name: '免疫防护组合',
    price: 349,
    currency: 'HK$',
    ingredients: ['维C', '锌', '维D3', '接骨木莓'],
    certifications: ['GMP', 'ISO22000', 'HACCP'],
  },
];

export default function ProductCompare({ products = defaultProducts, title = '方案对比' }: ProductCompareProps) {
  if (products.length < 2 || products.length > 3) {
    return <div className="p-4 text-center text-red-500">请传入2-3款产品</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {title && (
        <h3 className="text-2xl font-bold text-center text-slate-900 mb-8">{title}</h3>
      )}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-4 text-left text-sm font-medium text-slate-500 bg-slate-50 w-28"></th>
              {products.map((product, index) => (
                <th
                  key={index}
                  className={`p-4 text-center ${
                    product.isRecommended
                      ? 'bg-teal-50 border-t-4 border-t-teal-500'
                      : 'bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-lg text-slate-900">{product.name}</div>
                  {product.isRecommended && (
                    <span className="inline-block mt-1 text-xs bg-teal-600 text-white px-3 py-0.5 rounded-full">
                      推荐
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-200">
              <td className="p-4 text-sm font-medium text-slate-500">价格/月</td>
              {products.map((product, index) => (
                <td
                  key={index}
                  className={`p-4 text-center ${product.isRecommended ? 'bg-teal-50/50' : ''}`}
                >
                  <span className="text-2xl font-bold text-slate-900">
                    {product.currency ?? 'HK$'}{product.price}
                  </span>
                </td>
              ))}
            </tr>
            <tr className="border-t border-slate-200">
              <td className="p-4 text-sm font-medium text-slate-500">核心成分</td>
              {products.map((product, index) => (
                <td
                  key={index}
                  className={`p-4 ${product.isRecommended ? 'bg-teal-50/50' : ''}`}
                >
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {product.ingredients.map((ingredient, i) => (
                      <span
                        key={i}
                        className="inline-block text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
            <tr className="border-t border-slate-200">
              <td className="p-4 text-sm font-medium text-slate-500">认证</td>
              {products.map((product, index) => (
                <td
                  key={index}
                  className={`p-4 ${product.isRecommended ? 'bg-teal-50/50' : ''}`}
                >
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {product.certifications.map((cert, i) => (
                      <span
                        key={i}
                        className="inline-block text-xs border border-teal-200 text-teal-700 px-2.5 py-1 rounded-full"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
