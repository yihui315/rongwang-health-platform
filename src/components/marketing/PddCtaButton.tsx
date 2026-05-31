'use client';

import { useState } from 'react';
import { resolvePddProductUrl, type PddProduct } from '@/src/data/pdd-products';
import { THIRD_PARTY_PURCHASE_DISCLAIMER } from '@/src/lib/compliance/copy';
import { buildUtmUrl } from '@/src/lib/marketing/utm';
import { useTrackClick } from '@/src/hooks/useFunnelTracking';

type PddCtaButtonProps = {
  product: PddProduct;
  scenarioSlug: string;
  ctaId: string;
};

export default function PddCtaButton({ product, scenarioSlug, ctaId }: PddCtaButtonProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const trackPddClick = useTrackClick('pdd_click', {
    product_id: product.id,
    product_slug: product.slug,
    scenario_slug: scenarioSlug,
    cta_id: ctaId,
  });
  const trackCopy = useTrackClick('copy_product_name', {
    product_id: product.id,
    product_slug: product.slug,
    scenario_slug: scenarioSlug,
    cta_id: ctaId,
  });
  const trackSafeCta = useTrackClick('safe_cta_click', {
    product_id: product.id,
    product_slug: product.slug,
    scenario_slug: scenarioSlug,
    cta_id: ctaId,
    reason: 'missing_pdd_url',
  });
  const href = buildUtmUrl({ baseUrl: resolvePddProductUrl(product), content: ctaId, term: scenarioSlug });

  async function copyProductName() {
    trackSafeCta();
    trackCopy();
    try {
      await navigator.clipboard?.writeText(product.name);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('idle');
    }
  }

  if (!href) {
    const consultHref = `/ai-consult?scenario=${encodeURIComponent(scenarioSlug)}&product=${encodeURIComponent(product.id)}`;

    return (
      <div className="pdd-cta pdd-cta-empty">
        <p>购买链接配置中，请联系顾问确认购买方式，或复制产品名称到第三方平台搜索。</p>
        <a className="pdd-cta-button" href={consultHref} onClick={() => trackSafeCta()}>
          联系顾问确认购买方式
        </a>
        <button className="pdd-cta-button pdd-cta-copy" type="button" onClick={copyProductName}>
          {copyStatus === 'copied' ? '已复制产品名称' : '复制产品名称'}
        </button>
      </div>
    );
  }

  return (
    <div className="pdd-cta">
      <a className="pdd-cta-button" href={href} target="_blank" rel="noopener noreferrer nofollow sponsored" onClick={() => trackPddClick()}>
        前往拼多多国际购买
      </a>
      <p>{THIRD_PARTY_PURCHASE_DISCLAIMER}</p>
    </div>
  );
}
