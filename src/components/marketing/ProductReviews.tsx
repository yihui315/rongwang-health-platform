'use client';

import { useState } from 'react';

interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  verified: boolean;
  content: string;
  helpful: number;
  product?: string;
}

interface ProductReviewsProps {
  reviews: Review[];
  averageRating?: number;
  totalReviews?: number;
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClass} ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// 预置评价数据（后期可改为API获取）
const defaultReviews: Review[] = [
  {
    id: '1',
    author: '张先生',
    rating: 5,
    date: '2026-03-15',
    verified: true,
    content: '应酬前吃两片NADH释酒片，第二天完全没有宿醉的感觉。现在是酒局标配，同事们都在问我要链接。',
    helpful: 24,
    product: 'NADH 释酒片',
  },
  {
    id: '2',
    author: '李女士',
    rating: 5,
    date: '2026-03-08',
    verified: true,
    content: '给妈妈买的东阿贡胶，吃了两个月气色明显好了很多。妈妈说睡眠也改善了不少。正宗东阿产地值得信赖。',
    helpful: 18,
    product: '彭寿堂 东阿贡胶',
  },
  {
    id: '3',
    author: '王先生',
    rating: 4,
    date: '2026-02-20',
    verified: true,
    content: 'AKK益生菌吃了一个月，肠胃确实舒服了很多，以前经常胀气现在很少了。就是价格偏高，希望能有更多优惠活动。',
    helpful: 12,
    product: 'AKK 高阶版益生菌',
  },
  {
    id: '4',
    author: '陈小姐',
    rating: 5,
    date: '2026-02-14',
    verified: true,
    content: 'Whina焕白片+脂质体维C组合真的绝了！三个月下来肤色亮了一个度，闺蜜们都说我变白了。关键是从内调理，不像涂涂抹抹那么麻烦。',
    helpful: 31,
    product: 'Whina D 焕白片',
  },
  {
    id: '5',
    author: '刘先生',
    rating: 5,
    date: '2026-01-28',
    verified: true,
    content: '甘氨酸镁真的帮助睡眠！以前每天要躺一个多小时才能入睡，现在基本上20分钟就睡着了。而且价格很良心。',
    helpful: 15,
    product: '甘氨酸镁深睡配方',
  },
];

export default function ProductReviews({
  reviews = defaultReviews,
  averageRating,
  totalReviews,
}: ProductReviewsProps) {
  const [visibleCount, setVisibleCount] = useState(3);

  const avg = averageRating ?? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const total = totalReviews ?? reviews.length;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* 总评分 */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">用户评价</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-4xl font-black text-slate-900">{avg.toFixed(1)}</span>
              <div>
                <StarRating rating={Math.round(avg)} size="lg" />
                <p className="text-sm text-slate-500 mt-0.5">基于 {total} 条评价</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 md:ml-auto">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              已验证购买
            </span>
          </div>
        </div>

        {/* 评价列表 */}
        <div className="space-y-6">
          {reviews.slice(0, visibleCount).map((review) => (
            <div key={review.id} className="border border-slate-100 rounded-xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center text-sm font-bold text-teal-700">
                    {review.author.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{review.author}</span>
                      {review.verified && (
                        <span className="inline-flex items-center gap-0.5 text-[11px] text-teal-600 font-medium">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          已验证购买
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-slate-400">{review.date}</span>
                    </div>
                  </div>
                </div>
                {review.product && (
                  <span className="hidden sm:inline-block text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full">
                    {review.product}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{review.content}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span>{review.helpful} 人觉得有帮助</span>
              </div>
            </div>
          ))}
        </div>

        {/* 查看更多 */}
        {visibleCount < reviews.length && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setVisibleCount(reviews.length)}
              className="px-6 py-2.5 text-sm font-medium text-teal-600 border border-teal-200 rounded-xl hover:bg-teal-50 transition-colors"
            >
              查看全部 {reviews.length} 条评价
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
