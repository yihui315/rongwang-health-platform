/**
 * 荣旺营销 Pipeline v1 — CLI Runner
 * 读取 MarketingJobV2 JSON → 转换为内部格式 → 调用已有 PipelineRunner
 *
 * 用法：
 *   pnpm tsx scripts/marketing/pipeline-runner.ts --job .ai/marketing-jobs/sample-rongwang-sleep-001.json --dry-run
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parseArgs } from 'util';
import { validateMarketingJob } from '../../lib/marketing/job-types';
import { MarketingPipelineRunner } from '../../lib/marketing/pipeline-runner';
import type { MarketingJob } from '../../lib/marketing/job-types';
import { getMarketingFlags } from '../../lib/marketing/marketing-flags';

// ─────────────────────────────────────────────
// V2 → Internal MarketingJob converter
// Accepts the validated MarketingJob from job-types.ts schema
// and passes it through to MarketingPipelineRunner
// ─────────────────────────────────────────────

function jobV2ToInternal(job: MarketingJob): MarketingJob {
  // The validated job IS already in MarketingJob format (job-types.ts schema).
  // Map 'website' platform to 'wordpress' for internal runner compatibility.
  const platformMap: Record<string, MarketingJob['distribution']['channels'][0]['platform']> = {
    website: 'wordpress',
    wechat: 'wechat',
    xiaohongshu: 'xiaohongshu',
    zhihu: 'zhihu',
  };

  return {
    ...job,
    distribution: {
      ...job.distribution,
      channels: job.distribution.channels.map((ch) => ({
        platform: platformMap[ch.platform] ?? ch.platform,
        required: ch.required,
      })),
    },
  };
}

// ─────────────────────────────────────────────
// CLI Entry Point
// ─────────────────────────────────────────────

async function main() {
  const { values } = parseArgs({
    options: {
      job: { type: 'string', short: 'j' },
      mode: { type: 'string', short: 'm', default: 'dry-run' },
      verbose: { type: 'boolean', short: 'v', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
    allowPositionals: true,
  });

  if (values.help) {
    printUsage();
    process.exit(0);
  }

  const flags = getMarketingFlags();
  const mode = (values.mode as 'dry-run' | 'draft' | 'manual') ?? 'dry-run';
  if (!flags.pipelineEnabled) {
    console.error('❌ Pipeline is disabled. Set FEATURE_MARKETING_PIPELINE=true to enable.');
    console.error('   To run in shadow mode (no flag required), use: FEATURE_MARKETING_PIPELINE=true node ...');
    process.exit(1);
  }

  const jobPath = values.job ?? '.ai/marketing-jobs/sample-rongwang-sleep-001.json';
  const verbose = values.verbose ?? false;

  console.log(`\n🚀 荣旺营销 Pipeline v1 — CLI Runner`);
  console.log(`📄 Job: ${jobPath}`);
  console.log(`🔧 Publish Mode: ${flags.publishMode}`);
  console.log('');

  // 1. Load and validate job
  let rawJob: unknown;
  try {
    const resolved = resolve(process.cwd(), jobPath);
    rawJob = JSON.parse(readFileSync(resolved, 'utf-8'));
  } catch (err) {
    console.error(`❌ Failed to load job file: ${err}`);
    process.exit(1);
  }

  // 2. Validate V2 schema using AJV from job-types
  let internalJob: MarketingJob;
  try {
    const valid = validateMarketingJob(rawJob);
    if (!valid) {
      const errors = (validateMarketingJob.errors ?? [])
        .slice(0, 5)
        .map((e) => `${e.instancePath || '/'}: ${e.message}`)
        .join('; ');
      console.error(`❌ Job validation failed: ${errors}`);
      process.exit(1);
    }
    // Cast after confirming validity
    const v2Job = rawJob as MarketingJob;
    console.log(`✅ Job validated: ${v2Job.job_id}`);
    console.log(`   Keyword: ${v2Job.seo.primary_keyword}`);
    console.log(`   Platforms: ${v2Job.distribution.channels.map((c) => c.platform).join(', ')}`);
    console.log(`   Mode: ${v2Job.distribution.publish_mode ?? 'draft'}`);
    internalJob = jobV2ToInternal(v2Job);
  } catch (err) {
    console.error(`❌ Job validation threw: ${err}`);
    process.exit(1);
  }
  if (verbose) {
    console.log(`\n🔍 Internal job mapping:`);
    console.log(`   job_id: ${internalJob.job_id}`);
    console.log(`   primary_keyword: ${internalJob.seo.primary_keyword}`);
    console.log(`   channels: ${internalJob.distribution.channels.map((c) => c.platform).join(', ')}`);
    console.log(`   shadow_mode: ${internalJob.runtime?.shadow_mode ?? false}`);
  }

  // 4. Run pipeline
  console.log(`\n⚙️  Starting pipeline...`);
  const runner = new MarketingPipelineRunner(internalJob);
  const startTime = Date.now();

  let record: Awaited<ReturnType<MarketingPipelineRunner['run']>>;
  try {
    record = await runner.run();
  } catch (err) {
    console.error(`\n❌ Pipeline threw unhandled error: ${err}`);
    process.exit(1);
  }

  const elapsed = Date.now() - startTime;

  // 5. Output result
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊 Pipeline Run Complete`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`   Run ID:     ${record.runId}`);
  console.log(`   Job ID:     ${record.jobId}`);
  console.log(`   Status:     ${record.status.toUpperCase()}`);
  console.log(`   Duration:  ${(elapsed / 1000).toFixed(1)}s`);
  console.log(`   Steps:      ${record.steps.length}`);

  for (const step of record.steps) {
    const icon = step.status === 'success' ? '✅' : step.status === 'failed' ? '❌' : step.status === 'degraded' ? '⚠️' : '⏭️';
    const action = (step as unknown as Record<string, unknown>).nextAction as string | undefined;
    console.log(`   ${icon} ${step.step.padEnd(20)} ${step.status}${action ? ` → ${action}` : ''} (${step.durationMs}ms)`);
  }

  if (record.seoReadyScore) {
    console.log(`\n📈 SEO Score: ${record.seoReadyScore.total}/100`);
    if (record.seoReadyScore.blockers.length > 0) {
      console.log(`   Blockers: ${record.seoReadyScore.blockers.join(', ')}`);
    }
  }

  if (record.publishSummary) {
    const ps = record.publishSummary;
    console.log(`\n📦 Publish Summary:`);
    console.log(`   Succeeded: ${ps.succeeded.join(', ') || 'none'}`);
    console.log(`   Failed:    ${ps.failed.join(', ') || 'none'}`);
    console.log(`   Auth Missing: ${ps.authMissing.join(', ') || 'none'}`);
    console.log(`   Manual Pack:  ${ps.manualPackageGenerated ? 'Yes' : 'No'}`);
  }

  if (record.evidenceDir) {
    console.log(`\n📁 Evidence: ${record.evidenceDir}`);
  }

  // 6. Exit code
  if (record.status === 'success' || record.status === 'degraded_success') {
    console.log(`\n✅ Pipeline completed successfully`);
    process.exit(0);
  } else if (record.status === 'manual_review') {
    console.log(`\n⚠️  Pipeline requires manual review`);
    process.exit(2);
  } else {
    console.log(`\n❌ Pipeline failed`);
    process.exit(1);
  }
}

function printUsage() {
  console.log(`
荣旺营销 Pipeline v1 — CLI Runner

用法:
  pnpm tsx scripts/marketing/pipeline-runner.ts --job <path> [options]

选项:
  --job, -j <path>     Job JSON 文件路径 (默认: .ai/marketing-jobs/sample-rongwang-sleep-001.json)
  --verbose, -v       详细输出
  --help, -h          显示帮助

示例:
  pnpm tsx scripts/marketing/pipeline-runner.ts --job .ai/marketing-jobs/sample-rongwang-sleep-001.json --dry-run

环境变量:
  FEATURE_MARKETING_PIPELINE=true   启用 Pipeline (默认: false)
  FEATURE_MARKETING_AUTOPILOT=false 允许自动发布 (默认: false)
`);
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
