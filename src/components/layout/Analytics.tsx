/**
 * GA4 + Meta Pixel + Plausible 分析脚本加载器
 * 仅在生产环境加载
 */

"use client";

import Script from "next/script";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function Analytics() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      {/* Google Analytics 4 */}
      {GA4_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA4_ID}', {
                page_path: window.location.pathname,
                currency: 'HKD'
              });
              window.gtag = gtag;
            `}
          </Script>
        </>
      )}

      {/* Meta (Facebook) Pixel */}
      {META_PIXEL_ID && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* Plausible Analytics */}
      {PLAUSIBLE_DOMAIN && (
        <Script
          defer
          data-domain={PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}

/* ─── 事件追踪工具函数 ─── */

/** 追踪加入购物车事件 */
export function trackAddToCart(productName: string, price: number, currency = 'HKD') {
  if (typeof window === 'undefined') return;
  // GA4
  if (window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency,
      value: price,
      items: [{ item_name: productName, price }],
    });
  }
  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: productName,
      value: price,
      currency,
    });
  }
}

/** 追踪开始结账事件 */
export function trackBeginCheckout(value: number, currency = 'HKD') {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('event', 'begin_checkout', { currency, value });
  }
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', { value, currency });
  }
}

/** 追踪完成购买事件 */
export function trackPurchase(transactionId: string, value: number, currency = 'HKD') {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('event', 'purchase', { transaction_id: transactionId, currency, value });
  }
  if (window.fbq) {
    window.fbq('track', 'Purchase', { value, currency });
  }
}

/** 追踪邮件订阅事件 */
export function trackNewsletterSignup(email?: string) {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('event', 'newsletter_signup', { method: 'email' });
  }
  if (window.fbq) {
    window.fbq('track', 'Lead', { content_name: 'newsletter' });
  }
}

/** 追踪查看产品事件 */
export function trackViewProduct(productName: string, price: number, currency = 'HKD') {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('event', 'view_item', {
      currency,
      value: price,
      items: [{ item_name: productName, price }],
    });
  }
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: productName,
      value: price,
      currency,
    });
  }
}
