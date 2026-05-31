import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { HealthReport } from '@/src/agents/generate-health-report';

export type StoredHealthReport = HealthReport & {
  status: 'generated' | 'pending_manual_review' | 'approved' | 'rejected';
  reviewNotes: string | null;
  reviewer: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function getReportPath(): string {
  return path.join(process.cwd(), '.rongwang-data', 'health-reports.json');
}

function readReports(): StoredHealthReport[] {
  const reportPath = getReportPath();
  if (!existsSync(reportPath)) {
    return [];
  }

  try {
    return JSON.parse(readFileSync(reportPath, 'utf8')) as StoredHealthReport[];
  } catch {
    return [];
  }
}

function persistReports(reports: StoredHealthReport[]): void {
  const reportPath = getReportPath();
  mkdirSync(path.dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(reports, null, 2)}\n`);
}

export function saveHealthReport(report: HealthReport): StoredHealthReport {
  const createdAt = new Date().toISOString();
  const storedReport: StoredHealthReport = {
    ...report,
    status: report.manualReviewRequired ? 'pending_manual_review' : 'generated',
    reviewNotes: null,
    reviewer: null,
    reviewedAt: null,
    createdAt,
    updatedAt: createdAt,
  };

  const reports = readReports().filter((item) => item.id !== storedReport.id);
  reports.unshift(storedReport);
  persistReports(reports);
  return storedReport;
}

export function listHealthReports(): StoredHealthReport[] {
  return readReports();
}

export function getHealthReport(reportId: string): StoredHealthReport | null {
  return readReports().find((report) => report.id === reportId) ?? null;
}

export function updateHealthReportStatus(input: {
  reportId: string;
  status: StoredHealthReport['status'];
  reviewNotes?: string | null;
  reviewer?: string | null;
}): StoredHealthReport | null {
  const reports = readReports();
  const report = reports.find((item) => item.id === input.reportId);
  if (!report) {
    return null;
  }

  const updatedAt = new Date().toISOString();
  report.status = input.status;
  report.reviewNotes = input.reviewNotes ?? report.reviewNotes ?? null;
  report.reviewer = input.reviewer ?? report.reviewer ?? null;
  report.reviewedAt = updatedAt;
  report.updatedAt = updatedAt;
  persistReports(reports);
  return report;
}

export function resetHealthReportsForTest(): void {
  persistReports([]);
}
