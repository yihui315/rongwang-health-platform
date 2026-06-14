#!/usr/bin/env node
/**
 * Pipeline CLI — Phase 3: CLI Runner
 * ================================
 * Entry point for running the marketing pipeline from the command line.
 * 
 * Usage:
 *   npx ts-node scripts/marketing/pipeline-cli.ts run <job_file> [--dry-run] [--skip-review]
 *   npx ts-node scripts/marketing/pipeline-cli.ts status <job_id> [--run-id <id>]
 *   npx ts-node scripts/marketing/pipeline-cli.ts review <job_id> [--run-id <id>]
 *   npx ts-node scripts/marketing/pipeline-cli.ts evidence <job_id> [--run-id <id>]
 *
 * Examples:
 *   npx ts-node scripts/marketing/pipeline-cli.ts run jobs/mj_health_edu_001.json
 *   npx ts-node scripts/marketing/pipeline-cli.ts run jobs/mj_health_edu_001.json --dry-run
 *   npx ts-node scripts/marketing/pipeline-cli.ts status mj_health_edu_001
 *   npx ts-node scripts/marketing/pipeline-cli.ts evidence mj_health_edu_001 --run-id run_abc12345
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { MarketingJob } from '../../src/lib/marketing/job-types';
import { runMarketingPipeline } from '../../src/lib/marketing/pipeline-runner';
import {
  readRunRecord,
  readEventsLog,
  readManualReviewQueue,
  EVIDENCE_BASE,
} from '../../src/lib/marketing/adapters/evidence-writer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '../..');

// ─── Args ───────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const command = args[0];
const target = args[1];
const flags = args.slice(2).filter((a) => a.startsWith('--'));

function getFlag(name: string): string | true | undefined {
  const f = flags.find((f) => f === `--${name}` || f.startsWith(`--${name}=`));
  if (!f) return undefined;
  return f.includes('=') ? f.split('=')[1] : true;
}

const dryRun = getFlag('dry-run') !== undefined || getFlag('skip-review') !== undefined;
const skipReview = getFlag('skip-review') !== undefined;
const runIdFlag = typeof getFlag('run-id') === 'string' ? getFlag('run-id') as string : undefined;

// ─── Commands ────────────────────────────────────────────────────────────────

async function cmdRun(jobPath: string) {
  if (!existsSync(jobPath)) {
    // Try relative to project root
    const abs = join(PROJECT_ROOT, jobPath);
    if (!existsSync(abs)) {
      console.error(`❌ Job file not found: ${jobPath}`);
      process.exit(1);
    }
    jobPath = abs;
  }

  console.log('📋 Pipeline CLI — Run');
  console.log('=' .repeat(50));
  console.log(`📄 Job: ${jobPath}`);
  console.log(`🔖 Mode: ${dryRun ? 'DRY-RUN (shadow_mode=true, skip_review=true)' : 'LIVE (publish_mode=draft)'}`);
  console.log();

  // Load job
  const raw = JSON.parse(readFileSync(jobPath, 'utf-8')) as MarketingJob;

  // Inject dry-run / skip-review overrides
  if (dryRun || skipReview) {
    raw.runtime = {
      ...raw.runtime,
      shadow_mode: true,
      skip_human_review: true,
    };
    console.log('⚠️  Dry-run active — no content will be published anywhere');
  }

  // Display job summary
  console.log(`Job ID  : ${raw.job_id}`);
  console.log(`Trigger : ${raw.trigger}`);
  console.log(`Locale  : ${raw.locale ?? 'zh-CN'}`);
  console.log(`Channels: ${raw.distribution.channels.map((c) => c.platform).join(', ')}`);
  console.log(`SEO KW  : ${raw.seo.primary_keyword}`);
  console.log();

  // Run pipeline
  console.log('🚀 Starting pipeline...');
  const record = await runMarketingPipeline(raw);

  // Print result
  console.log();
  console.log('=' .repeat(50));
  console.log('📊 Pipeline Result');
  console.log('=' .repeat(50));
  console.log(`Run ID     : ${record.runId}`);
  console.log(`Status     : ${record.status}`);
  console.log(`Duration   : ${record.totalDurationMs}ms`);
  console.log(`Shadow Mode: ${record.shadowMode}`);
  console.log();
  console.log('Steps:');
  for (const step of record.steps) {
    const icon = step.status === 'success' ? '✅' : step.status === 'degraded' ? '⚠️' : step.status === 'skipped' ? '⏭️' : '❌';
    const duration = step.durationMs ? `(${step.durationMs}ms)` : '';
    const error = step.errorCode ? ` [${step.errorCode}]` : '';
    console.log(`  ${icon} ${step.step.padEnd(20)} ${step.status.padEnd(12)} ${duration}${error}`);
    if (step.errorMessage) {
      console.log(`     └─ ${step.errorMessage}`);
    }
  }

  if (record.publishSummary) {
    const ps = record.publishSummary;
    console.log();
    console.log('Publish:');
    if (ps.succeeded.length) console.log(`  ✅ Succeeded : ${ps.succeeded.join(', ')}`);
    if (ps.failed.length) console.log(`  ❌ Failed    : ${ps.failed.join(', ')}`);
    if (ps.authMissing.length) console.log(`  🔒 Auth missing: ${ps.authMissing.join(', ')}`);
    if (ps.rateLimited.length) console.log(`  ⏱️  Rate limited : ${ps.rateLimited.join(', ')}`);
  }

  if (record.seoReadyScore) {
    const ss = record.seoReadyScore;
    console.log();
    console.log(`SEO Score: ${ss.total}/100 ${ss.passed ? '✅ PASSED' : '❌ FAILED'}`);
    if (ss.blockers.length) {
      console.log('Blockers:');
      for (const b of ss.blockers) console.log(`  - ${b}`);
    }
  }

  console.log();
  console.log(`📁 Evidence: ${record.evidenceDir}`);
  if (record.status === 'manual_review') {
    console.log('⚠️  Pipeline routed to manual review queue — see manual-review-queue.json');
  }

  // Non-zero exit on failure
  if (record.status === 'failed' || record.status === 'manual_review') {
    process.exit(1);
  }
}

async function cmdStatus(jobId: string) {
  console.log('📋 Pipeline CLI — Status');
  console.log('=' .repeat(50));
  console.log(`Job ID : ${jobId}`);

  // Read events to find runs
  const events = readEventsLog(jobId, 500);
  if (!events.length) {
    console.log('❌ No pipeline runs found for this job.');
    process.exit(1);
  }

  // Group by runId
  const runIds = [...new Set(events.map((e) => e.runId))];
  console.log(`Found ${runIds.length} run(s)`);
  console.log();

  for (const rid of runIds) {
    const rec = readRunRecord(jobId, rid);
    if (!rec && !runIdFlag) {
      // Just show events summary
      const runEvents = events.filter((e) => e.runId === rid);
      const last = runEvents[runEvents.length - 1];
      console.log(`  Run ${rid}: last event at ${last?.ts} — no run.json found`);
      continue;
    }

    if (runIdFlag && rid !== runIdFlag) continue;

    if (rec) {
      console.log(`Run ${rid}:`);
      console.log(`  Status : ${rec.status}`);
      console.log(`  Started: ${rec.startedAt}`);
      console.log(`  Duration: ${rec.totalDurationMs}ms`);
      console.log(`  Evidence: ${rec.evidenceDir}`);
      console.log(`  Steps:`);
      for (const step of rec.steps) {
        const icon = step.status === 'success' ? '✅' : step.status === 'degraded' ? '⚠️' : step.status === 'skipped' ? '⏭️' : '❌';
        console.log(`    ${icon} ${step.step}: ${step.status} (${step.durationMs}ms)`);
      }
      console.log();
    }
  }

  // Show pending manual reviews
  const queue = readManualReviewQueue();
  const pending = queue.filter((q) => q.jobId === jobId);
  if (pending.length) {
    console.log(`⚠️  ${pending.length} pending manual review(s):`);
    for (const p of pending) {
      console.log(`  - [${p.step}] ${p.blocker} (since ${p.pendingSince})`);
      console.log(`    Run: ${p.runId} | Actions: ${p.actions.join(', ')}`);
    }
  }
}

async function cmdEvidence(jobId: string) {
  console.log('📋 Pipeline CLI — Evidence');
  console.log('=' .repeat(50));
  console.log(`Job ID: ${jobId}`);
  if (runIdFlag) console.log(`Run ID: ${runIdFlag}`);

  const events = readEventsLog(jobId, 500);
  if (!events.length) {
    console.log('❌ No evidence found.');
    process.exit(1);
  }

  const runIds = [...new Set(events.map((e) => e.runId))];
  console.log(`Evidence base: ${EVIDENCE_BASE}`);
  console.log(`Runs: ${runIds.join(', ')}`);
  console.log();

  for (const rid of runIds) {
    if (runIdFlag && rid !== runIdFlag) continue;
    const rec = readRunRecord(jobId, rid);
    const dir = rec?.evidenceDir ?? join(EVIDENCE_BASE, jobId, rid);
    console.log(`Run ${rid}:`);
    console.log(`  Evidence dir: ${dir}`);

    if (rec) {
      console.log(`  Status      : ${rec.status}`);
      console.log(`  Started     : ${rec.startedAt}`);
      console.log(`  Duration    : ${rec.totalDurationMs}ms`);
      if (rec.publishSummary) {
        const ps = rec.publishSummary;
        console.log(`  Publish     : ${ps.succeeded.length} succeeded, ${ps.failed.length} failed`);
      }
      if (rec.seoReadyScore) {
        console.log(`  SEO Score   : ${rec.seoReadyScore.total}/100`);
      }
    }

    const runEvents = events.filter((e) => e.runId === rid);
    console.log(`  Events      : ${runEvents.length} entries`);
    if (runEvents.length <= 20) {
      for (const e of runEvents) {
        console.log(`    [${e.ts}] [${e.level}] [${e.step ?? '-'}] ${e.message}`);
      }
    } else {
      console.log(`  First event : ${runEvents[0].ts}`);
      console.log(`  Last event  : ${runEvents[runEvents.length - 1].ts}`);
    }
    console.log();
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

(async () => {
  try {
    switch (command) {
      case 'run': {
        if (!target) {
          console.error('Usage: pipeline-cli.ts run <job_file> [--dry-run] [--skip-review]');
          process.exit(1);
        }
        await cmdRun(target);
        break;
      }
      case 'status': {
        if (!target) {
          console.error('Usage: pipeline-cli.ts status <job_id> [--run-id <id>]');
          process.exit(1);
        }
        await cmdStatus(target);
        break;
      }
      case 'evidence': {
        if (!target) {
          console.error('Usage: pipeline-cli.ts evidence <job_id> [--run-id <id>]');
          process.exit(1);
        }
        await cmdEvidence(target);
        break;
      }
      default: {
        console.log(`Pipeline CLI — available commands:`);
        console.log(`  run <job_file>       Run a marketing pipeline job`);
        console.log(`  status <job_id>      Show pipeline run status`);
        console.log(`  evidence <job_id>    Show evidence / event log`);
        console.log();
        console.log(`Flags:`);
        console.log(`  --dry-run            Run with shadow_mode=true, skip_review=true`);
        console.log(`  --skip-review        Same as --dry-run`);
        console.log(`  --run-id <id>        Filter by run ID`);
        process.exit(1);
      }
    }
  } catch (err) {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  }
})();
