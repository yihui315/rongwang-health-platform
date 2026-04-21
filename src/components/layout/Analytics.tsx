/**
 * GA4 + Plausible 分析脚本加载器
 * 仅在生产环境加载
 */

"use client";

import Script from "next/script";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

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
