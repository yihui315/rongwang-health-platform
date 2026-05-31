import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const projectRoot = process.cwd();

test('standalone FAQ cards reserve measured question and answer slots', () => {
  const faqSource = readFileSync(path.join(projectRoot, 'app/faq/page.tsx'), 'utf8');

  assert.match(faqSource, /import MeasuredText/);
  assert.match(faqSource, /faqTextFonts/);
  assert.match(faqSource, /className="faq-page"/);
  assert.match(faqSource, /className="faq-card"/);
  assert.match(faqSource, /className="faq-card-question"[\s\S]*font=\{faqTextFonts\.question\}/);
  assert.match(faqSource, /className="faq-card-question"[\s\S]*maxLines=\{2\}/);
  assert.match(faqSource, /className="faq-card-answer"[\s\S]*font=\{faqTextFonts\.answer\}/);
  assert.match(faqSource, /className="faq-card-answer"[\s\S]*maxLines=\{4\}/);
});

test('shipping cards reserve measured title and description slots', () => {
  const shippingSource = readFileSync(path.join(projectRoot, 'app/shipping/page.tsx'), 'utf8');
  const styles = readFileSync(path.join(projectRoot, 'app/globals.css'), 'utf8');

  assert.match(shippingSource, /import MeasuredText/);
  assert.match(shippingSource, /shippingTextFonts/);
  assert.match(shippingSource, /className="shipping-page"/);
  assert.match(shippingSource, /className="shipping-card"/);
  assert.match(shippingSource, /className="shipping-card-title"[\s\S]*font=\{shippingTextFonts\.title\}/);
  assert.match(shippingSource, /className="shipping-card-title"[\s\S]*maxLines=\{2\}/);
  assert.match(shippingSource, /className="shipping-card-copy"[\s\S]*font=\{shippingTextFonts\.copy\}/);
  assert.match(shippingSource, /className="shipping-card-copy"[\s\S]*maxLines=\{3\}/);
  assert.match(styles, /\.shipping-page\s*\{[^}]*width:\s*min\(100% - 48px,\s*960px\)/s);
  assert.match(styles, /\.shipping-card\s*\{[^}]*min-width:\s*0/s);
});

test('assessment intro copy is measured while required notice stays visible', () => {
  const assessmentSource = readFileSync(path.join(projectRoot, 'app/assessment/[slug]/page.tsx'), 'utf8');
  const styles = readFileSync(path.join(projectRoot, 'app/globals.css'), 'utf8');

  assert.match(assessmentSource, /import MeasuredText/);
  assert.match(assessmentSource, /assessmentTextFonts/);
  assert.match(assessmentSource, /className="assessment-intro-copy"[\s\S]*font=\{assessmentTextFonts\.intro\}/);
  assert.match(assessmentSource, /className="assessment-intro-copy"[\s\S]*maxLines=\{3\}/);
  assert.match(assessmentSource, /\{assessmentCopy\[slug\]\}/);
  assert.match(assessmentSource, /<div className="simple-page-notice">[\s\S]*本品不能替代药物/);
  assert.doesNotMatch(assessmentSource, /simple-page-notice[\s\S]{0,160}data-text-layout/);
  assert.match(styles, /\.assessment-intro-copy[\s\S]*\{[^}]*margin:\s*20px 0 0/s);
});

test('AI consult intro copy is measured while required notice stays visible', () => {
  const aiConsultSource = readFileSync(path.join(projectRoot, 'app/ai-consult/page.tsx'), 'utf8');
  const styles = readFileSync(path.join(projectRoot, 'app/globals.css'), 'utf8');

  assert.match(aiConsultSource, /import MeasuredText/);
  assert.match(aiConsultSource, /aiConsultTextFonts/);
  assert.match(aiConsultSource, /className="ai-consult-intro-copy"[\s\S]*font=\{aiConsultTextFonts\.intro\}/);
  assert.match(aiConsultSource, /className="ai-consult-intro-copy"[\s\S]*maxLines=\{3\}/);
  assert.match(aiConsultSource, /先留下你的健康关注方向和联系方式/);
  assert.match(aiConsultSource, /<div className="simple-page-notice">[\s\S]*本品不能替代药物/);
  assert.doesNotMatch(aiConsultSource, /simple-page-notice[\s\S]{0,160}data-text-layout/);
  assert.match(styles, /\.ai-consult-intro-copy\s*\{[^}]*margin:\s*20px 0 0/s);
});

test('contact channel cards reserve measured title and copy slots', () => {
  const contactSource = readFileSync(path.join(projectRoot, 'app/contact/page.tsx'), 'utf8');
  const styles = readFileSync(path.join(projectRoot, 'app/globals.css'), 'utf8');

  assert.match(contactSource, /import MeasuredText/);
  assert.match(contactSource, /contactTextFonts/);
  assert.match(contactSource, /className="contact-card-title"[\s\S]*font=\{contactTextFonts\.title\}/);
  assert.match(contactSource, /className="contact-card-title"[\s\S]*maxLines=\{2\}/);
  assert.match(contactSource, /className="contact-card-copy"[\s\S]*font=\{contactTextFonts\.copy\}/);
  assert.match(contactSource, /className="contact-card-copy"[\s\S]*maxLines=\{2\}/);
  assert.match(contactSource, /<section className="contact-notice">[\s\S]*本品不能替代药物/);
  assert.doesNotMatch(contactSource, /contact-notice[\s\S]{0,220}data-text-layout/);
  assert.match(styles, /\.contact-grid article\s*,\s*\.contact-notice\s*\{[^}]*min-width:\s*0/s);
  assert.match(styles, /\.contact-card-copy\s*\{[^}]*overflow-wrap:\s*anywhere/s);
});

test('static page mobile chrome prevents horizontal overflow', () => {
  const styles = readFileSync(path.join(projectRoot, 'app/globals.css'), 'utf8');

  assert.match(styles, /\.faq-page\s*\{[^}]*width:\s*min\(100% - 48px,\s*960px\)/s);
  assert.match(styles, /\.faq-card\s*\{[^}]*min-width:\s*0/s);
  assert.match(styles, /\.simple-page-card\s*\{[^}]*box-sizing:\s*border-box/s);
  assert.match(styles, /\.simple-page-card\s*\{[^}]*max-width:\s*100%/s);
  assert.match(styles, /\.simple-page-grid\s*>\s*\*\s*\{[^}]*min-width:\s*0/s);
  assert.match(styles, /\.lead-form-card\s*\{[^}]*box-sizing:\s*border-box/s);
  assert.match(styles, /\.lead-form-card\s*\{[^}]*max-width:\s*100%/s);
  assert.match(styles, /\.assessment-consent\s*\{[^}]*overflow-wrap:\s*anywhere/s);
  assert.match(styles, /\.assessment-consent\s+a\s*\{[^}]*text-decoration:\s*underline/s);
  assert.match(styles, /@media \(max-width:\s*720px\)[\s\S]*\.site-nav\s*\{[^}]*max-width:\s*100%/);
  assert.match(styles, /@media \(max-width:\s*720px\)[\s\S]*\.site-nav-link\s*\{[^}]*flex:\s*0 0 auto/);
});

test('compliance page keeps required declarations unmeasured and fully visible', () => {
  const complianceSource = readFileSync(path.join(projectRoot, 'app/compliance/page.tsx'), 'utf8');

  assert.doesNotMatch(complianceSource, /MeasuredText/);
  assert.doesNotMatch(complianceSource, /data-text-layout/);
  assert.match(complianceSource, /本品不能替代药物/);
  assert.match(complianceSource, /可能与中国相关标准存在差异/);
});

test('privacy and terms pages are standalone customer trust pages', () => {
  const privacySource = readFileSync(path.join(projectRoot, 'app/privacy/page.tsx'), 'utf8');
  const termsSource = readFileSync(path.join(projectRoot, 'app/terms/page.tsx'), 'utf8');
  const chromeSource = readFileSync(path.join(projectRoot, 'src/components/layout/SiteChrome.tsx'), 'utf8');

  assert.match(privacySource, /隐私政策/);
  assert.match(privacySource, /健康评估/);
  assert.match(privacySource, /人工复核/);
  assert.match(privacySource, /停止联系/);
  assert.match(termsSource, /服务条款/);
  assert.match(termsSource, /第三方平台/);
  assert.match(termsSource, /本品不能替代药物/);
  assert.match(chromeSource, /href="\/privacy"/);
  assert.match(chromeSource, /href="\/terms"/);
});
