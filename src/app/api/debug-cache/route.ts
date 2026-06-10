import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';

export async function GET() {
  const cachePath = '/root/rongwang-health-platform/public/_geoflow_cache/articles.json';
  return NextResponse.json({
    cwd: process.cwd(),
    cachePath,
    fileExists: existsSync(cachePath),
    fileSize: existsSync(cachePath) ? readFileSync(cachePath, 'utf-8').length : 0,
  });
}
