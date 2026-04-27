import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const strict = process.argv.includes("--strict");
const defaultTargets = ["src", "docs", "scripts", "README.md", ".env.example"];
const targets = process.argv.filter((arg) => !arg.startsWith("--")).slice(2);
const scanTargets = targets.length > 0 ? targets : defaultTargets;

const excludedDirectories = new Set([
  ".git",
  ".next",
  "coverage",
  "dist",
  "geoflow",
  "node_modules",
]);

const includedExtensions = new Set([
  ".css",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
]);

const suspiciousCodepoints = new Set([
  0x20ac,
  0x30e7,
  0x30e9,
  0x30bd,
  0x93b6,
  0x93b8,
  0x93b9,
  0x93c3,
  0x93c4,
  0x93c8,
  0x93cc,
  0x934b,
  0x934f,
  0x9354,
  0x9358,
  0x935f,
  0x9365,
  0x9412,
  0x9424,
  0x942b,
  0x947d,
  0x95ab,
  0x95b0,
  0x95c0,
  0xff46,
  0xfffd,
]);

function isPrivateUse(codepoint) {
  return codepoint >= 0xe000 && codepoint <= 0xf8ff;
}

function isIncludedFile(filePath) {
  const ext = path.extname(filePath);
  return includedExtensions.has(ext);
}

function walk(targetPath, output = []) {
  if (!fs.existsSync(targetPath)) {
    return output;
  }

  const stat = fs.statSync(targetPath);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(targetPath, { withFileTypes: true })) {
      if (entry.isDirectory() && excludedDirectories.has(entry.name)) {
        continue;
      }
      walk(path.join(targetPath, entry.name), output);
    }
    return output;
  }

  if (stat.isFile() && isIncludedFile(targetPath)) {
    output.push(targetPath);
  }

  return output;
}

function escapeForConsole(value) {
  return value.replace(/[^\x20-\x7e]/g, (char) => {
    return `\\u{${char.codePointAt(0).toString(16)}}`;
  });
}

function scanLine(line) {
  const hits = [];

  for (const char of line) {
    const codepoint = char.codePointAt(0);
    if (suspiciousCodepoints.has(codepoint) || isPrivateUse(codepoint)) {
      hits.push(`U+${codepoint.toString(16).toUpperCase()}`);
    }
  }

  return [...new Set(hits)];
}

function scanFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split(/\r?\n/);
  const findings = [];

  lines.forEach((line, index) => {
    const hits = scanLine(line);
    if (hits.length === 0) {
      return;
    }

    findings.push({
      line: index + 1,
      hits,
      snippet: escapeForConsole(line.trim().slice(0, 180)),
    });
  });

  return findings;
}

const files = scanTargets.flatMap((target) => walk(path.resolve(root, target)));
const findings = [];

for (const filePath of files) {
  const fileFindings = scanFile(filePath);
  if (fileFindings.length === 0) {
    continue;
  }

  findings.push({
    file: path.relative(root, filePath),
    findings: fileFindings,
  });
}

if (findings.length === 0) {
  console.log(`[mojibake] no high-confidence mojibake found across ${files.length} files`);
} else {
  console.log(`[mojibake] found possible mojibake in ${findings.length} files`);
  for (const entry of findings) {
    console.log(`\n${entry.file}`);
    for (const finding of entry.findings.slice(0, 12)) {
      console.log(`  L${finding.line} ${finding.hits.join(",")} ${finding.snippet}`);
    }
    if (entry.findings.length > 12) {
      console.log(`  ... ${entry.findings.length - 12} more lines`);
    }
  }
}

if (strict && findings.length > 0) {
  process.exitCode = 1;
}
