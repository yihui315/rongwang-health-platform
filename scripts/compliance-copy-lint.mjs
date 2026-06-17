import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const prohibitedTerms = [
  { term: "治疗", alternatives: ["健康教育", "咨询医生或药师"] },
  { term: "治愈", alternatives: ["支持", "生活方式建议"] },
  { term: "根治", alternatives: ["风险分层", "生活方式建议"] },
  { term: "预防疾病", alternatives: ["支持日常健康管理", "健康教育"] },
  { term: "修复肝脏", alternatives: ["应酬后恢复支持方向", "营养支持方向"] },
  { term: "治疗失眠", alternatives: ["睡眠健康教育", "生活方式建议"] },
  { term: "改善抑郁", alternatives: ["支持压力与情绪相关生活方式管理", "咨询医生或药师"] },
  { term: "降血压", alternatives: ["血压健康管理相关支持", "咨询医生或药师"] },
  { term: "降血糖", alternatives: ["血糖健康管理相关支持", "咨询医生或药师"] },
  { term: "降血脂", alternatives: ["血脂健康管理相关支持", "咨询医生或药师"] },
  { term: "抗癌", alternatives: ["不使用", "咨询医生或药师"] },
  { term: "防癌", alternatives: ["不使用", "健康教育"] },
  { term: "替代药物", alternatives: ["不替代药物", "咨询医生或药师"] },
  { term: "保证清关", alternatives: ["透明履约", "物流可追踪"] },
  { term: "绝不被税", alternatives: ["跨境申报说明", "清关提示"] },
  { term: "100% 到货", alternatives: ["物流可追踪", "售后政策"] },
  { term: "全网最快", alternatives: ["物流可追踪", "透明履约"] },
];

const defaultTargets = [
  "src/app",
  "src/components",
  "src/data",
  "src/lib/health",
  "src/lib/marketing",
  "src/lib/product-passport-preview.ts",
  "src/lib/product-suitability.ts",
];

const includedExtensions = new Set([
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".mdx",
  ".mjs",
  ".ts",
  ".tsx",
]);

const excludedDirectories = new Set([
  ".git",
  ".next",
  "coverage",
  "dist",
  "node_modules",
  "tmp",
]);

const excludedPathFragments = [
  "scripts/compliance-copy-lint.mjs",
  "src/lib/compliance.ts",
  "tests/",
];

const allowCommentPattern =
  /compliance-copy-allow|copy-lint-disable-next-line|rw-copy-allow/i;

const allowedContextPatterns = [
  /不[会做构成提供替代承诺]*[^。；;]*治疗/,
  /不做[^。；;]*(治疗|诊断|处方)/,
  /不构成[^。；;]*(治疗|诊断|处方)/,
  /不替代[^。；;]*(治疗|诊断|处方|医生|药师|药物)/,
  /不能替代[^。；;]*(治疗|诊断|处方|医生|药师|药物)/,
  /不可替代[^。；;]*(治疗|诊断|处方|医生|药师|药物)/,
  /不承诺[^。；;]*治疗/,
  /避免[^。；;]*(治疗|治愈|根治|诊断|处方)/,
  /禁止[^。；;]*(治疗|治愈|根治|诊断|处方)/,
  /不得[^。；;]*(治疗|治愈|根治|诊断|处方)/,
  /不能说[^。；;]*(治疗|治愈|根治|抗癌|防癌)/,
  /forbidden|prohibited|do not|must not|not medical advice/i,
  /pattern:\s*\/.*(治疗|治愈|根治)/,
];

function normalizePathForOutput(filePath) {
  return filePath.split(path.sep).join("/");
}

function parseArgs(argv) {
  const options = {
    json: false,
    warn: false,
    targets: [],
  };

  for (const arg of argv) {
    if (arg === "--json") {
      options.json = true;
    } else if (arg === "--warn") {
      options.warn = true;
    } else if (arg === "--strict") {
      options.warn = false;
    } else {
      options.targets.push(arg);
    }
  }

  return options;
}

function isIncludedFile(filePath) {
  return includedExtensions.has(path.extname(filePath));
}

function shouldSkipPath(root, filePath) {
  const relative = normalizePathForOutput(path.relative(root, filePath));
  return excludedPathFragments.some((fragment) => relative.includes(fragment));
}

function walk(targetPath, root, output = []) {
  if (!fs.existsSync(targetPath)) {
    return output;
  }

  const stat = fs.statSync(targetPath);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(targetPath, { withFileTypes: true })) {
      if (entry.isDirectory() && excludedDirectories.has(entry.name)) {
        continue;
      }
      walk(path.join(targetPath, entry.name), root, output);
    }
    return output;
  }

  if (stat.isFile() && isIncludedFile(targetPath) && !shouldSkipPath(root, targetPath)) {
    output.push(targetPath);
  }

  return output;
}

function hasAllowComment(lines, index) {
  return [lines[index], lines[index - 1], lines[index - 2]]
    .filter(Boolean)
    .some((line) => allowCommentPattern.test(line));
}

function isAllowedContext(line) {
  return allowedContextPatterns.some((pattern) => pattern.test(line));
}

function findTermHits(line) {
  return prohibitedTerms.filter(({ term }) => line.includes(term));
}

export function scanText(text) {
  const lines = text.split(/\r?\n/);
  const findings = [];

  lines.forEach((line, index) => {
    const hits = findTermHits(line);
    if (hits.length === 0 || hasAllowComment(lines, index) || isAllowedContext(line)) {
      return;
    }

    findings.push({
      line: index + 1,
      snippet: line.trim().slice(0, 220),
      terms: hits.map((hit) => hit.term),
      alternatives: [...new Set(hits.flatMap((hit) => hit.alternatives))],
    });
  });

  return findings;
}

export function scanFiles({ root = process.cwd(), targets = defaultTargets } = {}) {
  const files = targets.flatMap((target) => walk(path.resolve(root, target), root));
  const findings = [];

  for (const filePath of files) {
    const fileFindings = scanText(fs.readFileSync(filePath, "utf8"));
    if (fileFindings.length === 0) {
      continue;
    }

    findings.push({
      file: normalizePathForOutput(path.relative(root, filePath)),
      findings: fileFindings,
    });
  }

  return { filesScanned: files.length, findings };
}

function printHumanResult(result, warn) {
  if (result.findings.length === 0) {
    console.log(`[compliance-copy] passed across ${result.filesScanned} files`);
    return;
  }

  const mode = warn ? "warnings" : "violations";
  console.log(`[compliance-copy] found ${result.findings.length} files with ${mode}`);
  for (const entry of result.findings) {
    console.log(`\n${entry.file}`);
    for (const finding of entry.findings.slice(0, 12)) {
      console.log(
        `  L${finding.line} terms=${finding.terms.join(",")} alternatives=${finding.alternatives.join(" / ")}`,
      );
      console.log(`    ${finding.snippet}`);
    }
    if (entry.findings.length > 12) {
      console.log(`  ... ${entry.findings.length - 12} more findings`);
    }
  }

  console.log(
    "\nUse safer wording or add a nearby compliance-copy-allow comment with the reason for a deliberate exception.",
  );
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = scanFiles({
    targets: options.targets.length > 0 ? options.targets : defaultTargets,
  });

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printHumanResult(result, options.warn);
  }

  if (!options.warn && result.findings.length > 0) {
    process.exitCode = 1;
  }
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  main();
}
