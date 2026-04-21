'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

export default function CartBadge() {
  const { cart } = useCart();

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center"
      aria-label="购物车"
    >
      <svg
        className="h-6 w-6 text-slate-700"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>

      {cart.itemCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange text-xs font-semibold text-white">
          {cart.itemCount}
        </span>
      )}
    </Link>
  );
}
