"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AddToCartButton from "@/components/ui/AddToCartButton";
import { trackAnalyticsEvent } from "@/lib/analytics";
import {
  getProductSuitabilityState,
  highRiskPurchaseHiddenMessage,
  readStoredProductSuitabilityAssessment,
  type ProductSuitabilityAssessment,
  type ProductSuitabilityState,
} from "@/lib/product-suitability";
import type { AssessmentScenario } from "@/schemas/assessment-router";

interface ProductSuitabilityActionBaseProps {
  productSlug: string;
  productName: string;
  productPrice: number;
  productScenario: AssessmentScenario;
  assessmentHref: string;
  evidenceHref: string;
}

function useProductSuitabilityState(
  productScenario: AssessmentScenario,
  providedAssessment?: ProductSuitabilityAssessment | null,
) {
  const [storedAssessment, setStoredAssessment] =
    useState<ProductSuitabilityAssessment | null>(providedAssessment ?? null);

  useEffect(() => {
    if (providedAssessment !== undefined) {
      setStoredAssessment(providedAssessment);
      return;
    }

    setStoredAssessment(readStoredProductSuitabilityAssessment());
  }, [providedAssessment]);

  return {
    assessment: storedAssessment,
    state: getProductSuitabilityState(storedAssessment, productScenario),
  };
}

function analyticsMetadata(
  state: ProductSuitabilityState,
  assessment: ProductSuitabilityAssessment | null,
  productScenario: AssessmentScenario,
) {
  return {
    assessment_state: state,
    product_scenario: productScenario,
    risk_level: assessment?.risk_level,
    assessment_id: assessment?.assessment_id,
    assessment_version: assessment?.assessment_version,
    rule_version: assessment?.rule_version,
  };
}

function useHighRiskHiddenEvent({
  assessment,
  productScenario,
  productSlug,
  source,
  state,
}: {
  assessment: ProductSuitabilityAssessment | null;
  productScenario: AssessmentScenario;
  productSlug: string;
  source: "product_card" | "product_detail";
  state: ProductSuitabilityState;
}) {
  const metadata = useMemo(
    () => analyticsMetadata(state, assessment, productScenario),
    [assessment, productScenario, state],
  );

  useEffect(() => {
    if (state !== "high") {
      return;
    }

    trackAnalyticsEvent({
      name: "product_cta_hidden_high_risk",
      productId: productSlug,
      source,
      metadata,
    });
  }, [metadata, productSlug, source, state]);

  return metadata;
}

export function ProductSuitabilityCardCta({
  productSlug,
  productScenario,
  assessmentHref,
  assessment: providedAssessment,
}: Pick<
  ProductSuitabilityActionBaseProps,
  "productSlug" | "productScenario" | "assessmentHref"
> & {
  assessment?: ProductSuitabilityAssessment | null;
}) {
  const { assessment, state } = useProductSuitabilityState(
    productScenario,
    providedAssessment,
  );
  const metadata = useHighRiskHiddenEvent({
    assessment,
    productScenario,
    productSlug,
    source: "product_card",
    state,
  });

  if (state === "high") {
    return (
      <p className="rounded-lg border border-[var(--risk-high-border)] bg-[var(--risk-high-soft)] px-3 py-2 text-xs font-medium leading-5 text-[var(--risk-high)]">
        {highRiskPurchaseHiddenMessage}
      </p>
    );
  }

  if (state === "matched") {
    return (
      <Link
        href={`/products/${productSlug}#product-suitability`}
        className="rounded-lg bg-[var(--surface-strong)] px-3 py-2 text-xs font-semibold text-white"
        onClick={() =>
          trackAnalyticsEvent({
            name: "product_suitability_cta_click",
            productId: productSlug,
            source: "product_card",
            metadata,
          })
        }
      >
        查看适合我的产品方案
      </Link>
    );
  }

  return (
    <Link
      href={assessmentHref}
      className="rounded-lg bg-[#e8f5f1] px-3 py-2 text-xs font-semibold text-[var(--teal-dark)]"
      onClick={() =>
        trackAnalyticsEvent({
          name: "product_suitability_cta_click",
          productId: productSlug,
          source: "product_card",
          metadata,
        })
      }
    >
      先确认是否适合我
    </Link>
  );
}

export function ProductEvidenceLink({
  productSlug,
  href,
  source,
  className,
  label = "查看证据资料",
  trackSuitabilityCta = false,
  metadata,
}: {
  productSlug: string;
  href: string;
  source: "product_card" | "product_detail";
  className: string;
  label?: string;
  trackSuitabilityCta?: boolean;
  metadata?: Record<string, unknown>;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackAnalyticsEvent({
          name: "product_evidence_click",
          productId: productSlug,
          source,
          metadata: {
            ...metadata,
            target: href,
          },
        });
        if (trackSuitabilityCta) {
          trackAnalyticsEvent({
            name: "product_suitability_cta_click",
            productId: productSlug,
            source,
            metadata,
          });
        }
      }}
    >
      {label}
    </Link>
  );
}

export function ProductSuitabilityDetailActions({
  productSlug,
  productName,
  productPrice,
  productScenario,
  assessmentHref,
  evidenceHref,
}: ProductSuitabilityActionBaseProps) {
  const { assessment, state } = useProductSuitabilityState(productScenario);
  const metadata = useHighRiskHiddenEvent({
    assessment,
    productScenario,
    productSlug,
    source: "product_detail",
    state,
  });

  if (state === "high") {
    return (
      <div className="mt-5 grid gap-3">
        <div className="rounded-xl border border-[var(--risk-high-border)] bg-[var(--risk-high-soft)] px-4 py-4 text-sm font-medium leading-7 text-[var(--risk-high)]">
          {highRiskPurchaseHiddenMessage}
        </div>
        <ProductEvidenceLink
          productSlug={productSlug}
          href={evidenceHref}
          source="product_detail"
          className="btn-secondary w-fit"
        />
      </div>
    );
  }

  if (state === "matched") {
    const isLowRisk = assessment?.risk_level === "low";

    return (
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <ProductEvidenceLink
          productSlug={productSlug}
          href={evidenceHref}
          source="product_detail"
          className="btn-primary"
          label="查看适合我的产品方案"
          trackSuitabilityCta
          metadata={metadata}
        />
        {isLowRisk ? (
          <AddToCartButton
            slug={productSlug}
            name={productName}
            price={productPrice}
            className="rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            onAdd={() =>
              trackAnalyticsEvent({
                name: "product_purchase_ready_click",
                productId: productSlug,
                source: "product_detail",
                metadata,
              })
            }
          />
        ) : (
          <p className="rounded-lg border border-[var(--risk-medium-border)] bg-[var(--risk-medium-soft)] px-4 py-3 text-sm leading-6 text-[var(--risk-medium)]">
            当前为 MEDIUM 匹配路径，建议先查看证据资料，并咨询医生或药师确认适合性。
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Link
        href={assessmentHref}
        className="btn-primary"
        onClick={() =>
          trackAnalyticsEvent({
            name: "product_suitability_cta_click",
            productId: productSlug,
            source: "product_detail",
            metadata,
          })
        }
      >
        先确认是否适合我
      </Link>
      <ProductEvidenceLink
        productSlug={productSlug}
        href={evidenceHref}
        source="product_detail"
        className="btn-secondary"
      />
    </div>
  );
}
