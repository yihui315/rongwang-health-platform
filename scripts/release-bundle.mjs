import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const outDir = path.join(repoRoot, '.release');
const gitSha = execSync('git rev-parse --short HEAD', { cwd: repoRoot, encoding: 'utf8' }).trim();
const status = execSync('git status --porcelain', { cwd: repoRoot, encoding: 'utf8' }).trim();
const timestamp = new Date().toISOString().replace(/[.:]/g, '-');
const archiveName = `rongwang-health-platform-${gitSha}.tgz`;
const archivePath = path.join(outDir, archiveName);

if (status) {
  console.error('Release bundle requires a clean git worktree so the archive matches the verified commit.');
  console.error('Commit or stash local changes, then rerun npm run release:verify && npm run release:bundle.');
  process.exit(1);
}

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true });
}
mkdirSync(outDir, { recursive: true });

execSync(`git archive --format=tar.gz -o ${JSON.stringify(archivePath)} HEAD`, {
  cwd: repoRoot,
  stdio: 'inherit'
});

writeFileSync(
  path.join(outDir, 'release-manifest.json'),
  JSON.stringify(
    {
      commit: gitSha,
      createdAt: timestamp,
      archive: archiveName,
      sourceBranch: execSync('git branch --show-current', { cwd: repoRoot, encoding: 'utf8' }).trim(),
    },
    null,
    2
  )
);

console.log(`Release archive ready: ${archivePath}`);
