'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { OrderForm } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState<OrderForm>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Partial<OrderForm>>({});

  if (cart.items.length === 0 && !orderId) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">购物车为空</h1>
          <p className="text-slate-600 mb-8">请先添加商品到购物车</p>
          <Link
            href="/plans/fatigue"
            className="inline-block rounded-lg bg-orange px-8 py-3 font-semibold text-white hover:bg-orange/90 transition-colors"
          >
            返回方案中心
          </Link>
        </div>
      </main>
    );
  }

  // Success state
  if (orderId) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-slate-200">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-teal/10">
              <svg
                className="h-8 w-8 text-teal"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-3">订单已成功提交</h1>
            <p className="text-slate-600 mb-6">感谢您的信任，我们会尽快处理您的订单</p>

            <div className="mb-8 rounded-lg bg-slate-50 p-6 text-left">
              <p className="text-sm text-slate-600 mb-2">订单号</p>
              <p className="font-mono text-lg font-semibold text-slate-900 break-all">
                {orderId}
              </p>
            </div>

            <div className="mb-8 space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">订单金额</p>
                <p className="text-2xl font-bold text-orange">¥{cart.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">商品数量</p>
                <p className="text-lg font-semibold text-slate-900">{cart.itemCount} 件</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-8">
              我们已将订单信息发送到您的邮箱，请注意查收。
            </p>

            <div className="space-y-3">
              <Link
                href="/"
                className="block rounded-lg bg-orange px-6 py-3 font-semibold text-white hover:bg-orange/90 transition-colors"
              >
                返回首页
              </Link>
              <Link
                href="/plans/fatigue"
                className="block rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                继续购物
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<OrderForm> = {};

    if (!formData.name.trim()) newErrors.name = '请输入姓名';
    if (!formData.phone.trim()) newErrors.phone = '请输入电话';
    if (!formData.email.trim()) newErrors.email = '请输入邮箱';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    if (!formData.address.trim()) newErrors.address = '请输入地址';
    if (!formData.city.trim()) newErrors.city = '请输入城市';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Build checkout items for Stripe
      const checkoutItems = cart.items.map(item => ({
        type: 'product' as const,
        slug: item.slug,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems,
          customerEmail: formData.email,
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Checkout failed');
      }

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : '支付创建失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof OrderForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">订单确认</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-xl bg-white p-8 shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6">收货信息</h2>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-4 py-2 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                        errors.name
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-slate-300 focus:ring-teal'
                      }`}
                      placeholder="请输入您的姓名"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      电话 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-4 py-2 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                        errors.phone
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-slate-300 focus:ring-teal'
                      }`}
                      placeholder="请输入您的电话号码"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      邮箱 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-4 py-2 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                        errors.email
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-slate-300 focus:ring-teal'
                      }`}
                      placeholder="请输入您的邮箱地址"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      城市 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-4 py-2 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                        errors.city
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-slate-300 focus:ring-teal'
                      }`}
                      placeholder="请输入所在城市"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      详细地址 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full rounded-lg border px-4 py-2 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                        errors.address
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-slate-300 focus:ring-teal'
                      }`}
                      placeholder="请输入详细的收货地址"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      备注（可选）
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-teal"
                      placeholder="如有特殊需求，请在此说明"
                    />
                  </div>
                </div>
              </div>

              {/* Submit via Stripe */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-orange px-6 py-4 font-semibold text-white hover:bg-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '跳转支付中...' : '前往安全支付 (Stripe)'}
              </button>
              <p className="text-center text-xs text-slate-400 mt-2">
                支付由 Stripe 安全处理 · 支持信用卡 / Apple Pay / Google Pay
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-6">订单详情</h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                {cart.items.map(item => (
                  <div key={item.slug} className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold text-slate-900">
                      ¥{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pb-6 border-b border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>小计</span>
                  <span className="font-semibold">¥{cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>运费</span>
                  <span className="font-semibold text-teal">免费</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-slate-900">合计</span>
                  <span className="text-2xl font-bold text-orange">
                    ¥{cart.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
