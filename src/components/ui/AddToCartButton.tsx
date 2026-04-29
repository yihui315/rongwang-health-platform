'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/cart-context';

interface AddToCartButtonProps {
  slug: string;
  name: string;
  price: number;
  className?: string;
}

export default function AddToCartButton({
  slug,
  name,
  price,
  className = ''
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleClick = () => {
    addItem(slug, name, price);
    setIsAdded(true);

    // Reset success state after 2 seconds
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <button
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold transition-all duration-200 ${
        isAdded
          ? 'bg-teal text-white'
          : 'bg-orange text-white hover:bg-orange/90 active:scale-95'
      } ${className}`}
    >
      {isAdded ? (
        <>
          <svg
            className="h-5 w-5 animate-pulse"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          已加入
        </>
      ) : (
        <>
          <svg
            className="h-5 w-5"
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
          加入购物车
        </>
      )}
    </button>
  );
}
