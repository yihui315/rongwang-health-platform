export interface ComplianceCopyFinding {
  line: number;
  snippet: string;
  terms: string[];
  alternatives: string[];
}

export interface ComplianceCopyScanResult {
  filesScanned: number;
  findings: Array<{
    file: string;
    findings: ComplianceCopyFinding[];
  }>;
}

export function scanText(text: string): ComplianceCopyFinding[];

export function scanFiles(input?: {
  root?: string;
  targets?: string[];
}): ComplianceCopyScanResult;
