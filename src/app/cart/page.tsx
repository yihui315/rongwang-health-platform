'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

export default function CartPage() {
  const { cart, removeItem, updateQuantity } = useCart();

  const shippingFee: number = cart.total >= 299 ? 0 : 15;
  const finalTotal = cart.total + shippingFee;

  if (cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <svg
            className="mx-auto h-24 w-24 text-slate-300 mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">购物车为空</h1>
          <p className="text-slate-600 mb-8">快去选择适合你的健康方案吧</p>
          <Link
            href="/plans/fatigue"
            className="inline-block rounded-lg bg-orange px-8 py-3 font-semibold text-white hover:bg-orange/90 transition-colors"
          >
            去逛逛
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">购物车</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.items.map(item => (
                <div
                  key={item.slug}
                  className="flex gap-4 rounded-xl bg-white p-6 shadow-sm border border-slate-200"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">{item.name}</h3>
                    <p className="text-xl font-bold text-orange">¥{item.price}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                        className="px-3 py-1 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                        className="px-3 py-1 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="w-24 text-right">
                      <p className="text-lg font-bold text-slate-900">
                        ¥{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.slug)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      aria-label="删除"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-6">订单总计</h2>

              <div className="space-y-4 pb-6 border-b border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>小计</span>
                  <span className="font-semibold">¥{cart.total.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>运费</span>
                  <span className="font-semibold">
                    {shippingFee === 0 ? (
                      <span className="text-teal">免费</span>
                    ) : (
                      `¥${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                {cart.total < 299 && (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    再加¥{(299 - cart.total).toFixed(2)}即可免运费
                  </p>
                )}
              </div>

              <div className="mb-6 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-slate-900">合计</span>
                  <span className="text-2xl font-bold text-orange">
                    ¥{finalTotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-slate-500">共 {cart.itemCount} 件商品</p>
              </div>

              <Link
                href="/checkout"
                className="block w-full rounded-lg bg-orange px-4 py-3 text-center font-semibold text-white hover:bg-orange/90 transition-colors"
              >
                去结算
              </Link>

              <Link
                href="/plans/fatigue"
                className="mt-3 block w-full rounded-lg border border-slate-300 px-4 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                继续购物
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
