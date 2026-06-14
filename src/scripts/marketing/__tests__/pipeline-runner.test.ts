/**
 * 荣旺营销 Pipeline v1 — 单元测试
 * 使用 Node.js built-in test runner
 * 运行: node --test src/scripts/marketing/__tests__/pipeline-runner.test.ts
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

// ─────────────────────────────────────────────
// Test 1: MarketingFlags — 默认值
// ─────────────────────────────────────────────
import { getMarketingFlags } from '../../../lib/marketing/marketing-flags';

describe('MarketingFlags', () => {
  it('pipelineEnabled 默认为 false', () => {
    delete process.env.FEATURE_MARKETING_PIPELINE;
    const flags = getMarketingFlags();
    assert.strictEqual(flags.pipelineEnabled, false);
  });

  it('publishMode 默认为 dry-run', () => {
    delete process.env.FEATURE_MARKETING_PUBLISH_MODE;
    const flags = getMarketingFlags();
    assert.strictEqual(flags.publishMode, 'dry-run');
  });
});

// ─────────────────────────────────────────────
// Test 2: SEO/GEO Checker — 评分结构
// ─────────────────────────────────────────────
import { checkSeoGeo } from '../../../lib/marketing/seo-geo-checker';

describe('SeoGeoChecker', () => {
  it('返回 5 级评分结构', () => {
    const result = checkSeoGeo({
      title: '睡眠不好怎么调理 - 荣旺健康',
      bodyMarkdown: '## 什么是睡眠不好\n\n睡眠不好的原因有很多。',
      metaTitle: '睡眠不好怎么调理',
      metaDescription: '本文介绍睡眠不好的调理方法。',
      h1: '睡眠不好怎么调理',
      wordCount: 1200,
      targetKeyword: '睡眠不好怎么调理',
      keyword: '睡眠不好怎么调理',
      url: 'https://example.com/sleep',
      schemaTypes: ['Article'],
    });

    assert.ok(typeof result.score === 'number');
    assert.ok(['A', 'B', 'C', 'D', 'F'].includes(result.grade));
    assert.ok(Array.isArray(result.checks));
    assert.ok(result.checks.length > 0);
  });

  it('缺少 meta description 时降级', () => {
    const result = checkSeoGeo({
      title: '测试标题',
      h1: '测试',
      wordCount: 300,
      keyword: '测试',
      url: 'https://example.com/test',
      schemaTypes: ['Article'],
    });

    const descCheck = result.checks.find((c) => c.id === 'meta_description_exists');
    assert.ok(descCheck);
    assert.strictEqual(descCheck.status, 'warn');
  });

  it('医疗关键词无健康声明时返回 fail', () => {
    const result = checkSeoGeo({
      title: '如何治疗糖尿病',
      h1: '如何治疗糖尿病',
      wordCount: 800,
      keyword: '治疗糖尿病',
      url: 'https://example.com/diabetes',
      schemaTypes: ['Article'],
    });

    const healthCheck = result.checks.find((c) => c.id === 'health_disclaimer_present');
    assert.ok(healthCheck);
    assert.strictEqual(healthCheck.status, 'fail');
  });
});

// ─────────────────────────────────────────────
// Test 3: Error Handler — 策略映射
// ─────────────────────────────────────────────
import { determineErrorType, getErrorStrategy } from '../../../lib/marketing/error-handler';

describe('ErrorHandler', () => {
  it('超时错误识别为 network_timeout', () => {
    const err = new Error('fetch timeout');
    const type = determineErrorType(err);
    assert.strictEqual(type, 'network_timeout');
  });

  it('E_SOURCE_FETCH_TIMEOUT 不可重试', () => {
    const strategy = getErrorStrategy({ code: 'E_SOURCE_FETCH_TIMEOUT' });
    assert.strictEqual(strategy.action, 'abort');
  });

  it('E_PLATFORM_RATE_LIMIT 返回 retry_later', () => {
    const strategy = getErrorStrategy({ code: 'E_PLATFORM_RATE_LIMIT' });
    assert.strictEqual(strategy.action, 'retry_later');
  });

  it('未知错误返回 retry_later', () => {
    const strategy = getErrorStrategy(new Error('unexpected'));
    assert.strictEqual(strategy.action, 'retry_later');
  });
});

// ─────────────────────────────────────────────
// Test 4: Manual Pack Generator — 输出结构
// ─────────────────────────────────────────────
import { generateManualPack } from '../../../lib/marketing/manual-pack-generator';

describe('ManualPackGenerator', () => {
  it('生成包含必需字段的输出', async () => {
    const output = await generateManualPack({
      jobId: 'mj_test_001',
      step: 'seo_geo_gate',
      blocker: 'SEO score below threshold',
      articleContent: '# 测试文章\n\n这是测试内容。',
      seoReport: { score: 55, blockers: ['no_meta_description'] },
      channels: ['wechat', 'wordpress'],
      brief: '测试brief',
      outputDir: '/tmp/test-manual-pack',
    });

    assert.ok(output.readme || output.markdown || output.json);
    assert.strictEqual(output.jobId, 'mj_test_001');
    assert.strictEqual(output.step, 'seo_geo_gate');
  });
});

// ─────────────────────────────────────────────
// Test 5: Evidence Logger — 写入验证
// ─────────────────────────────────────────────
import { EvidenceLogger } from '../../../lib/marketing/evidence-logger';
import { existsSync } from 'fs';

describe('EvidenceLogger', () => {
  it('初始化时创建 evidence 目录', () => {
    const logger = new EvidenceLogger('mj_test_001', 'run_test_001');
    const dir = logger.evidenceDir;
    assert.ok(dir.includes('mj_test_001'));
  });

  it('logEvidence 写入文件', () => {
    const logger = new EvidenceLogger('mj_test_002', 'run_test_002');
    const path = logger.logEvidence('test_step', { ok: true });
    assert.ok(existsSync(path), 'Evidence file should be written');
  });
});

// ─────────────────────────────────────────────
// Test 6: RankParser Adapter — 超时不抛异常
// ─────────────────────────────────────────────
import { getRankParserAdapter } from '../../../lib/marketing/rankparser-adapter';

describe('RankParserAdapter', () => {
  it('超时时返回 null 而不抛出', async () => {
    const adapter = getRankParserAdapter();
    const result = await adapter.fetchRank(
      'https://this-domain-does-not-exist-12345.com/',
      'test_keyword',
      1, // 1ms timeout
    );
    assert.strictEqual(result, null);
  });
});

// ─────────────────────────────────────────────
// Test 7: Content Generator Wrapper — 签名
// ─────────────────────────────────────────────
import { generateContentArtifact } from '../../../lib/marketing/content-generator-wrapper';

describe('ContentGeneratorWrapper', () => {
  it('返回内容对象结构', async () => {
    const result = await generateContentArtifact({
      templateKey: 'health_article_standard',
      keyword: '睡眠调理',
      maxWords: 300,
      locale: 'zh-CN',
    });

    assert.ok(typeof result === 'object');
    assert.ok('content' in result || 'artifact' in result);
  });
});

// ─────────────────────────────────────────────
// Test 8: Draft Publisher — dry-run 模式
// ─────────────────────────────────────────────
import { publishDraft } from '../../../lib/marketing/draft-publisher';

describe('DraftPublisher', () => {
  it('dry-run 模式不实际发布', async () => {
    const result = await publishDraft({
      articleContent: '# 测试文章\n\n内容',
      platform: 'wechat',
      articleRef: '/tmp/test-article.md',
      mode: 'dry-run',
      utmParams: { campaign: 'test', medium: 'pipeline' },
      brief: '测试',
    });

    assert.ok(result.status === 'skipped' || result.status === 'draft_created');
  });
});

// ─────────────────────────────────────────────
// Test 9: Schema Validation — 有效/无效 job
// ─────────────────────────────────────────────
import { validateMarketingJob } from '../../../lib/marketing/job-types';

describe('Schema Validation', () => {
  it('接受有效 job', () => {
    const validJob = {
      job_id: 'mj_valid_job_001',
      trigger: 'manual',
      source: { type: 'topic', topic: '睡眠调理' },
      content: {
        template_key: 'health_article',
        max_words: 1500,
        human_review_required: true,
      },
      seo: {
        primary_keyword: '睡眠不好怎么调理',
        schema_types: ['Article'],
        min_ready_score: 70,
      },
      distribution: {
        publish_mode: 'draft',
        channels: [{ platform: 'wechat', required: true }],
      },
      runtime: {
        timeout_seconds: 300,
        max_retries: 2,
        shadow_mode: true,
      },
    };

    const valid = validateMarketingJob(validJob);
    assert.strictEqual(valid, true);
  });

  it('拒绝缺少必需字段的 job', () => {
    const invalidJob = {
      job_id: 'mj_bad',
      trigger: 'manual',
    };
    const valid = validateMarketingJob(invalidJob);
    assert.strictEqual(valid, false);
  });

  it('拒绝 job_id 不匹配 pattern', () => {
    const badJob = {
      job_id: 'invalid',
      trigger: 'manual',
      source: { type: 'topic', topic: '测试' },
      content: { template_key: 'h', max_words: 500, human_review_required: false },
      seo: { primary_keyword: '测试', schema_types: ['Article'], min_ready_score: 50 },
      distribution: { publish_mode: 'none', channels: [{ platform: 'wechat' }] },
      runtime: { timeout_seconds: 60, max_retries: 0, shadow_mode: true },
    };
    const valid = validateMarketingJob(badJob);
    assert.strictEqual(valid, false);
  });
});

// ─────────────────────────────────────────────
// Test 10: Pipeline CLI 参数解析
// ─────────────────────────────────────────────
describe('Pipeline CLI', () => {
  it('--help 返回退出码 0', async () => {
    const { spawn } = await import('node:child_process');
    return new Promise((resolve) => {
      const proc = spawn('node', [
        '--import', 'tsx',
        'src/scripts/marketing/pipeline-runner.ts',
        '--help',
      ], { cwd: '/root/rongwang-health-platform' });

      let output = '';
      proc.stdout.on('data', (d) => { output += d.toString(); });
      proc.on('close', (code) => {
        assert.strictEqual(code, 0);
        assert.ok(output.includes('Usage') || output.includes('job'));
        resolve();
      });
    });
  });
});
