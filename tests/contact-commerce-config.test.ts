import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import ContactPage from '../app/contact/page';
import SiteChrome from '../src/components/layout/SiteChrome';
import PddCtaButton from '../src/components/marketing/PddCtaButton';
import { pddProducts, resolvePddProductUrl } from '../src/data/pdd-products';
import { contactChannels } from '../src/lib/contact/contact-channels';

const rootDir = process.cwd();

test('contact channel configuration exposes real support channels for storefront pages', () => {
  assert.equal(contactChannels.supportEmail, 'service@rongwanghealth.com');
  assert.equal(contactChannels.businessEmail, 'bd@rongwanghealth.com');
  assert.equal(contactChannels.whatsappNumber, '+8617322729955');
  assert.equal(contactChannels.wechatId, 'li78035');
  assert.equal(contactChannels.whatsappHref, 'https://wa.me/8617322729955');
  assert.equal(contactChannels.wechatCopyText, '复制微信号');
  assert.equal(contactChannels.qrFallbackLabel, '微信二维码待上传');
});

test('contact page and footer render configured support channels with copyable WeChat and legal links', () => {
  const contactMarkup = renderToStaticMarkup(React.createElement(ContactPage));
  const footerMarkup = renderToStaticMarkup(
    React.createElement(SiteChrome, null, React.createElement('main', null, 'demo'))
  );

  assert.match(contactMarkup, /service@rongwanghealth\.com/);
  assert.match(contactMarkup, /bd@rongwanghealth\.com/);
  assert.match(contactMarkup, /li78035/);
  assert.match(contactMarkup, /https:\/\/wa\.me\/8617322729955/);
  assert.match(contactMarkup, /复制微信号/);
  assert.match(contactMarkup, /data-wechat-copy-button="true"/);
  assert.match(contactMarkup, /aria-live="polite"/);
  assert.match(contactMarkup, /微信二维码待上传/);
  assert.match(footerMarkup, /service@rongwanghealth\.com/);
  assert.match(footerMarkup, /li78035/);
  assert.match(footerMarkup, /href="\/privacy"/);
  assert.match(footerMarkup, /href="\/terms"/);
  assert.match(footerMarkup, /微信二维码待上传/);
});

test('customer-facing commerce copy makes WeChat mini program and payment status explicit', () => {
  const contactMarkup = renderToStaticMarkup(React.createElement(ContactPage));
  const footerMarkup = renderToStaticMarkup(
    React.createElement(SiteChrome, null, React.createElement('main', null, 'demo'))
  );
  const productListSource = readFileSync(path.join(rootDir, 'app/products/page.tsx'), 'utf8');
  const productDetailSource = readFileSync(path.join(rootDir, 'app/products/[slug]/page.tsx'), 'utf8');

  assert.match(contactMarkup, /微信商城\/小程序待开通/);
  assert.match(contactMarkup, /当前不提供站内支付/);
  assert.match(contactMarkup, /顾问人工确认购买方式/);
  assert.match(footerMarkup, /官网商城（展示与咨询）/);
  assert.match(productListSource, /官网商城当前为商品展示与顾问确认入口/);
  assert.match(productListSource, /微信商城\/小程序待开通/);
  assert.match(productDetailSource, /当前不提供站内支付/);
  assert.match(productDetailSource, /微信商城\/小程序待开通/);
  assert.match(productDetailSource, /顾问人工确认购买方式/);
});

test('WeChat copy button uses the Clipboard API with a manual-copy fallback', () => {
  const source = readFileSync(path.join(rootDir, 'src/components/contact/CopyWechatButton.tsx'), 'utf8');

  assert.match(source, /navigator\.clipboard\.writeText/);
  assert.match(source, /contactChannels\.wechatId/);
  assert.match(source, /已复制微信号/);
  assert.match(source, /请手动复制/);
  assert.match(source, /setTimeout/);
});

test('configured third-party purchase links keep UTM parameters and nofollow sponsored attributes', () => {
  const product = {
    ...pddProducts[0],
    pddUrl: 'https://mobile.yangkeduo.com/goods.html?goods_id=123',
  };

  assert.equal(resolvePddProductUrl(product), product.pddUrl);

  const markup = renderToStaticMarkup(
    React.createElement(PddCtaButton, {
      product,
      scenarioSlug: 'sleep-support',
      ctaId: 'product_map_primary',
    })
  );

  assert.match(markup, /utm_source=rongwang/);
  assert.match(markup, /utm_medium=pdd_referral/);
  assert.match(markup, /utm_campaign=fast_funnel_v2/);
  assert.match(markup, /utm_content=product_map_primary/);
  assert.match(markup, /utm_term=sleep-support/);
  assert.match(markup, /nofollow sponsored/);
});

test('owner-managed purchase link config is used only when the product has no direct URL', () => {
  const product = { ...pddProducts[0], pddUrl: '' };
  const configuredUrl = 'https://mobile.yangkeduo.com/goods.html?goods_id=configured-real-id';

  assert.equal(resolvePddProductUrl(product, { [product.id]: configuredUrl }), configuredUrl);

  const markup = renderToStaticMarkup(
    React.createElement(PddCtaButton, {
      product: { ...product, pddUrl: configuredUrl },
      scenarioSlug: 'sleep-support',
      ctaId: 'product_map_primary',
    })
  );

  assert.match(markup, /goods_id=configured-real-id/);
  assert.match(markup, /utm_content=product_map_primary/);
  assert.doesNotMatch(markup, /购买链接配置中/);
});
