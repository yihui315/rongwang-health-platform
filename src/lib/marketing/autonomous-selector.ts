/**
 * 自主选题器 · Autonomous Topic Selector
 * Phase 3 核心组件：让 AI Agent 能"自己决定写什么"
 *
 * 决策逻辑：
 * 1. 收集已选题列表（从 marketing-runs/ 目录读取历史 run.json）
 * 2. 读取 PddClick 数据，了解哪些 topic 有点击
 * 3. 从候选池中过滤掉近期已做的
 * 4. 打分排序：高点击 > 有转化信号 > 未覆盖品类
 * 5. 生成下一批 job JSON 文件
 *
 * 触发条件：由 pipeline-runner 在 finalize 阶段调用（仅 cron 触发时生效）
 */

import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { listPddClicks, type PddClickListItem } from '@/lib/data/pdd-clicks';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TopicRecommendation {
  topic: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  reason: string;           // 为什么选这个topic（用于日志）
  score: number;            // 0-100，打分依据
  signal: 'click_data' | 'coverage_gap' | 'fallback';
  planSlug: string;         // 对应的 solution plan
}

export interface AutonomousSelectorResult {
  generated: number;       // 生成了几个新job
  jobs: Array<{
    jobId: string;
    filePath: string;
    topic: string;
    recommendation: TopicRecommendation;
  }>;
  skipped: string[];        // 跳过原因
  clickDataSummary: {
    total: number;
    topSources: Array<{ key: string; count: number }>;
    topSolutions: Array<{ key: string; count: number }>;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 候选 Topic 池
// ─────────────────────────────────────────────────────────────────────────────

interface CandidateTopic {
  topic: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  planSlug: string;
  category: string;
}

/** 荣旺健康 · 候选选题池（可扩展） */
const CANDIDATE_TOPICS: CandidateTopic[] = [
  // 核心品类：抗衰老
  { topic: 'NMN抗衰老', primaryKeyword: 'NMN抗衰老', secondaryKeywords: ['NMN功效', 'NMN副作用', 'NMN剂量'], planSlug: 'beauty', category: 'beauty' },
  { topic: '辅酶Q10心脏健康', primaryKeyword: '辅酶Q10', secondaryKeywords: ['辅酶Q10功效', '辅酶Q10心脏', '辅酶Q10服用方法'], planSlug: 'cardio', category: 'cardio' },
  { topic: '胶原蛋白流失', primaryKeyword: '胶原蛋白', secondaryKeywords: ['胶原蛋白流失原因', '胶原蛋白补充', '胶原蛋白吸收'], planSlug: 'beauty', category: 'beauty' },
  // 基础OTC品类
  { topic: '护肝片解酒', primaryKeyword: '护肝片', secondaryKeywords: ['护肝片成分', '解酒原理', '护肝片副作用'], planSlug: 'liver', category: 'liver' },
  { topic: '褪黑素睡眠', primaryKeyword: '褪黑素', secondaryKeywords: ['褪黑素副作用', '褪黑素剂量', '褪黑素失眠'], planSlug: 'sleep', category: 'sleep' },
  { topic: '叶黄素护眼', primaryKeyword: '叶黄素', secondaryKeywords: ['叶黄素功效', '叶黄素儿童', '叶黄素视网膜'], planSlug: 'immune', category: 'immune' },
  { topic: '维生素D3补钙', primaryKeyword: '维生素D3', secondaryKeywords: ['D3功效', 'D3缺乏症状', 'D3与K2'], planSlug: 'immune', category: 'immune' },
  { topic: 'Omega3鱼油', primaryKeyword: 'Omega3', secondaryKeywords: ['Omega3功效', '鱼油选择', 'EPA DHA区别'], planSlug: 'cardio', category: 'cardio' },
  { topic: '益生菌肠道', primaryKeyword: '益生菌', secondaryKeywords: ['益生菌肠道', '益生菌免疫', '菌株选择'], planSlug: 'immune', category: 'immune' },
  { topic: '镁元素减压', primaryKeyword: '镁元素', secondaryKeywords: ['镁缺乏症状', '甘氨酸镁', 'L-茶氨酸'], planSlug: 'stress', category: 'stress' },
  { topic: '抗疲劳NADH', primaryKeyword: 'NADH', secondaryKeywords: ['NADH功效', 'NADH线粒体', 'NADH疲劳'], planSlug: 'fatigue', category: 'fatigue' },
  { topic: '跨境购物避坑', primaryKeyword: '跨境购物', secondaryKeywords: ['蓝帽子辨别', '进口注册号', '保税仓'], planSlug: 'direct', category: 'education' },
];

// ─────────────────────────────────────────────────────────────────────────────
// 历史数据收集
// ─────────────────────────────────────────────────────────────────────────────

function getEvidenceBase(): string {
  return process.env.MARKETING_EVIDENCE_DIR || join(process.cwd(), 'data', 'marketing-runs');
}

/** 读取所有历史 run.json，提取已选题列表 */
function getRecentlyCoveredTopics(lookbackDays = 30): Set<string> {
  const covered = new Set<string>();
  const base = getEvidenceBase();
  if (!existsSync(base)) return covered;

  const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;

  try {
    const jobDirs = readdirSync(base).filter(d => d.startsWith('mj_'));
    for (const jobDir of jobDirs) {
      const jobPath = join(base, jobDir);
      if (!existsSync(jobPath)) continue;
      const runDirs = readdirSync(jobPath).filter(d => d.startsWith('run_'));
      for (const runDir of runDirs) {
        try {
          const runFile = join(jobPath, runDir, 'run.json');
          if (!existsSync(runFile)) continue;
          const stat = existsSync(runFile) ? { mtime: new Date(readFileSync(runFile, 'utf-8').match(/"startedAt"\s*:\s*"([^"]+)"/)?.[1] || 0) } : null;
          if (stat && stat.mtime.getTime() < cutoff) continue;

          const raw = readFileSync(runFile, 'utf-8');
          const run = JSON.parse(raw);
          const primary = run?.steps?.[0]?.output?.primaryKeyword;
          if (primary) covered.add(primary);
        } catch {
          // skip invalid run
        }
      }
    }
  } catch {
    // skip on error
  }

  return covered;
}

// ─────────────────────────────────────────────────────────────────────────────
// 打分函数
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 对候选topic打分
 * - 有点击数据：+40分
 * - 点击数>5：+20分
 * - 未覆盖品类：+20分
 * - 核心品类（NAD+/护肝/睡眠）：+10分
 * - 近期已做：-100分（直接排除）
 */
function scoreTopic(
  candidate: CandidateTopic,
  clickData: PddClickListItem[],
  recentlyCovered: Set<string>
): number {
  // 近期已做 → 跳过
  if (recentlyCovered.has(candidate.primaryKeyword)) return -1;
  if (recentlyCovered.has(candidate.topic)) return -1;

  let score = 30; // 基础分

  // 有点击数据
  const topicClicks = clickData.filter(c =>
    c.solutionSlug === candidate.planSlug ||
    (c.destinationUrl && candidate.topic.includes(c.solutionSlug || ''))
  );
  if (topicClicks.length > 0) {
    score += 40;
    if (topicClicks.length > 5) score += 20;
  }

  // 未覆盖品类
  const coveredCategories = new Set(
    [...recentlyCovered].map(k => {
      const found = CANDIDATE_TOPICS.find(c => c.primaryKeyword === k || c.topic === k);
      return found?.category;
    }).filter(Boolean)
  );
  if (!coveredCategories.has(candidate.category)) {
    score += 20;
  }

  // 核心品类加分
  const coreKeywords = ['NAD+', '护肝', '睡眠', 'NMN', '辅酶Q10'];
  if (coreKeywords.some(k => candidate.topic.includes(k))) {
    score += 10;
  }

  return Math.min(score, 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// Job 文件生成
// ─────────────────────────────────────────────────────────────────────────────

function buildJobFile(
  recommendation: CandidateTopic & { signal?: string },
  outputDir: string
): { jobId: string; filePath: string } {
  const jobId = `mj_auto_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const filePath = join(outputDir, `${jobId}.json`);

  const job = {
    job_id: jobId,
    trigger: 'cron',
    locale: 'zh-CN',
    source: {
      type: 'topic',
      topic: recommendation.topic,
    },
    content: {
      template_key: 'health_education',
      max_words: 800,
      human_review_required: false,
      min_source_count: 2,
    },
    seo: {
      primary_keyword: recommendation.primaryKeyword,
      secondary_keywords: recommendation.secondaryKeywords,
      schema_types: ['Article'],
      min_ready_score: 70,
    },
    distribution: {
      publish_mode: 'draft',
      channels: [
        { platform: 'wordpress' },
      ],
    },
    tracking: {
      utm_campaign: `auto_${recommendation.planSlug}`,
      utm_medium: 'content_ai',
      conversion_event: 'blog_cta_clicked',
    },
    runtime: {
      timeout_seconds: 300,
      max_retries: 2,
      shadow_mode: false,
    },
  };

  writeFileSync(filePath, JSON.stringify(job, null, 2), 'utf-8');
  return { jobId, filePath };
}

// ─────────────────────────────────────────────────────────────────────────────
// 主入口
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 自主选题主函数
 * @param count 生成几个新job（默认2个）
 * @returns 选题结果报告
 */
export async function selectNextTopics(count = 2): Promise<AutonomousSelectorResult> {
  const outputDir = join(process.cwd(), 'jobs');

  // 1. 收集历史选题
  const recentlyCovered = getRecentlyCoveredTopics(30);

  // 2. 读取点击数据
  const clickData = await listPddClicks(200);

  // 3. 对候选池打分
  const scored: Array<{ candidate: CandidateTopic; score: number }> = [];
  for (const candidate of CANDIDATE_TOPICS) {
    const score = scoreTopic(candidate, clickData, recentlyCovered);
    if (score < 0) continue;
    scored.push({ candidate, score });
  }

  // 4. 降序排列，取 top N
  scored.sort((a, b) => b.score - a.score);
  const selected = scored.slice(0, count);

  // 5. 生成 job 文件
  const jobs: AutonomousSelectorResult['jobs'] = [];
  const skipped: string[] = [];

  for (const { candidate, score } of selected) {
    const { jobId, filePath } = buildJobFile(candidate, outputDir);
    const signal: TopicRecommendation['signal'] =
      score >= 60 ? 'click_data' :
      score >= 40 ? 'coverage_gap' : 'fallback';

    jobs.push({
      jobId,
      filePath,
      topic: candidate.topic,
      recommendation: {
        topic: candidate.topic,
        primaryKeyword: candidate.primaryKeyword,
        secondaryKeywords: candidate.secondaryKeywords,
        planSlug: candidate.planSlug,
        reason: signal === 'click_data'
          ? `该品类有${clickData.filter(c => c.solutionSlug === candidate.planSlug).length}次点击记录，转化信号强`
          : signal === 'coverage_gap'
          ? `近期未覆盖品类，扩展内容矩阵`
          : `候选池补充选题`,
        score,
        signal,
      } as TopicRecommendation,
    });
  }

  // 记录未入选的topic（调试用）
  const selectedTopics = new Set(selected.map(s => s.candidate.topic));
  for (const c of CANDIDATE_TOPICS) {
    if (!selectedTopics.has(c.topic) && !recentlyCovered.has(c.topic)) {
      skipped.push(c.topic);
    }
  }

  // 按点击数聚合
  const solutionCounts = new Map<string, number>();
  for (const click of clickData) {
    const s = click.solutionSlug || 'unknown';
    solutionCounts.set(s, (solutionCounts.get(s) ?? 0) + 1);
  }
  const topSolutions = [...solutionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, count]) => ({ key, count }));

  const sourceCounts = new Map<string, number>();
  for (const click of clickData) {
    const s = click.source || 'unknown';
    sourceCounts.set(s, (sourceCounts.get(s) ?? 0) + 1);
  }
  const topSources = [...sourceCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, count]) => ({ key, count }));

  return {
    generated: jobs.length,
    jobs,
    skipped: skipped.slice(0, 10),
    clickDataSummary: {
      total: clickData.length,
      topSources,
      topSolutions,
    },
  };
}
