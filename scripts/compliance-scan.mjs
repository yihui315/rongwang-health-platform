import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const riskyPhrases = [
  '治疗',
  '治愈',
  '保证有效',
  '保证见效',
  '医生推荐',
  '临床证明',
  '修复肝脏',
  '治疗失眠',
  '治疗脂肪肝',
  '降三高',
];

const allowlistPatterns = [
  /禁止出现/,
  /不得/,
  /不会以/,
  /不构成/,
  /不提供/,
  /不能写/,
  /不能暗示/,
  /riskWords/,
  /bannedWords/,
  /riskyPhrases/,
  /assert/,
  /scanCompliance/,
  /这是一段治疗承诺文案/,
  /用于治疗疲劳的描述/,
  /Health Products Compliance Guidance/,
];

const targetExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.md']);
const targetRoots = ['app', 'src'];

function listFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.next') continue;

    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath));
      continue;
    }

    const extension = entry.name.includes('.') ? `.${entry.name.split('.').pop()}` : '';
    if (targetExtensions.has(extension) && statSync(fullPath).isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

const files = targetRoots.flatMap((root) => listFiles(root));

const findings = [];

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const phrase of riskyPhrases) {
      if (!line.includes(phrase)) continue;
      if (allowlistPatterns.some((pattern) => pattern.test(line))) continue;
      findings.push({
        file: relative(process.cwd(), file),
        line: index + 1,
        phrase,
        text: line.trim(),
      });
    }
  });
}

if (findings.length > 0) {
  console.error(JSON.stringify({ decision: 'FAIL', findings }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ decision: 'PASS', scannedFiles: files.length, riskyPhrases }, null, 2));
