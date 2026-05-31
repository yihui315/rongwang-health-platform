import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const projectRoot = process.cwd();

test('storefront product cards reserve measured text slots', () => {
  const productListSource = readFileSync(path.join(projectRoot, 'app/products/page.tsx'), 'utf8');
  const homeSource = readFileSync(path.join(projectRoot, 'src/components/home/HomePageV3.tsx'), 'utf8');
  const styles = readFileSync(path.join(projectRoot, 'app/globals.css'), 'utf8');

  assert.match(productListSource, /import MeasuredText/);
  assert.match(productListSource, /productListTextFonts/);
  assert.match(productListSource, /<MeasuredText as="h2"[^>]*maxLines=\{2\}/s);
  assert.match(productListSource, /className="storefront-product-summary"[\s\S]*maxLines=\{3\}/);
  assert.match(homeSource, /<MeasuredText as="strong"[^>]*homeTextFonts\.scenarioTitle[\s\S]*maxLines=\{2\}/);
  assert.match(homeSource, /homeTextFonts\.productDescription[\s\S]*maxLines=\{3\}/);
  assert.match(styles, /\.storefront-page \[data-text-layout='pretext'\][\s\S]*\{[^}]*max-height:\s*var\(--text-layout-target-height\)/s);
  assert.match(styles, /\.home-v3 \[data-text-layout='pretext'\]\s*,\s*\.storefront-page \[data-text-layout='pretext'\]/s);
});

test('storefront product detail hero reserves measured summary height', () => {
  const detailSource = readFileSync(path.join(projectRoot, 'app/products/[slug]/page.tsx'), 'utf8');

  assert.match(detailSource, /import MeasuredText/);
  assert.match(detailSource, /productDetailTextFonts/);
  assert.match(detailSource, /className="storefront-detail-summary"[\s\S]*font=\{productDetailTextFonts\.summary\}/);
  assert.match(detailSource, /className="storefront-detail-summary"[\s\S]*maxLines=\{3\}/);
  assert.match(detailSource, /product\.content\.shortDescription/);
});

test('homepage support cards reserve measured text slots', () => {
  const homeSource = readFileSync(path.join(projectRoot, 'src/components/home/HomePageV3.tsx'), 'utf8');

  assert.match(homeSource, /supportTitle:/);
  assert.match(homeSource, /supportDescription:/);
  assert.match(homeSource, /faqQuestion:/);
  assert.match(homeSource, /homeTextFonts\.supportTitle[\s\S]*maxLines=\{1\}/);
  assert.match(homeSource, /homeTextFonts\.supportDescription[\s\S]*maxLines=\{2\}/);
  assert.match(homeSource, /homeTextFonts\.faqQuestion[\s\S]*maxLines=\{2\}/);
  assert.match(homeSource, /whyItems\.map[\s\S]*<MeasuredText as="strong"/);
  assert.match(homeSource, /processSteps\.map[\s\S]*<MeasuredText as="strong"/);
  assert.match(homeSource, /faqItems\.map[\s\S]*className="home-faq-question"/);
});

test('solution product cards reserve measured name and summary slots', () => {
  const solutionSource = readFileSync(path.join(projectRoot, 'app/solutions/[slug]/page.tsx'), 'utf8');
  const styles = readFileSync(path.join(projectRoot, 'app/globals.css'), 'utf8');

  assert.match(solutionSource, /import MeasuredText/);
  assert.match(solutionSource, /solutionTextFonts/);
  assert.match(solutionSource, /className="solution-product-name"[\s\S]*font=\{solutionTextFonts\.productName\}/);
  assert.match(solutionSource, /className="solution-product-name"[\s\S]*maxLines=\{2\}/);
  assert.match(solutionSource, /className="solution-product-summary"[\s\S]*font=\{solutionTextFonts\.productSummary\}/);
  assert.match(solutionSource, /className="solution-product-summary"[\s\S]*maxLines=\{3\}/);
  assert.match(styles, /\.solution-page \[data-text-layout='pretext'\]\s*\{[^}]*max-height:\s*var\(--text-layout-target-height\)/s);
});

test('product map review card reserves measured recommendation summary only', () => {
  const productMapSource = readFileSync(path.join(projectRoot, 'app/product-map/[id]/page.tsx'), 'utf8');

  assert.match(productMapSource, /import MeasuredText/);
  assert.match(productMapSource, /productMapTextFonts/);
  assert.match(productMapSource, /className="product-map-review-summary"[\s\S]*font=\{productMapTextFonts\.reviewSummary\}/);
  assert.match(productMapSource, /className="product-map-review-summary"[\s\S]*maxLines=\{3\}/);
  assert.match(productMapSource, /product\.claimsSafeSummary/);
  assert.match(productMapSource, /<p>\{product\.complianceNote\}<\/p>/);
  assert.match(productMapSource, /<p>\{CONSULT_PROFESSIONAL_WARNING\}<\/p>/);
});
