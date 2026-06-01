import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { OutboundQueueEntry } from './outbound-queue';
import { resolveDataBackend } from '@/src/lib/data/data-backend';
import { getPostgresPool } from '@/src/lib/data/postgres-client';

function getQueuePath(): string {
  return path.join(process.cwd(), '.rongwang-data', 'outbound-queue.json');
}

function readEntries(): OutboundQueueEntry[] {
  const queuePath = getQueuePath();
  if (!existsSync(queuePath)) {
    return [];
  }

  try {
    return JSON.parse(readFileSync(queuePath, 'utf8')) as OutboundQueueEntry[];
  } catch {
    return [];
  }
}

function persistEntries(entries: OutboundQueueEntry[]): void {
  const queuePath = getQueuePath();
  mkdirSync(path.dirname(queuePath), { recursive: true });
  writeFileSync(queuePath, `${JSON.stringify(entries, null, 2)}\n`);
}

export function saveOutboundQueueEntries(entries: OutboundQueueEntry[]): OutboundQueueEntry[] {
  const existing = readEntries();
  const ids = new Set(entries.map((entry) => entry.id));
  const nextEntries = [...entries, ...existing.filter((entry) => !ids.has(entry.id))];
  persistEntries(nextEntries);
  return entries;
}

function rowToOutboundEntry(row: Record<string, unknown>): OutboundQueueEntry {
  return {
    id: String(row.id),
    leadId: String(row.lead_id),
    reportId: String(row.report_id),
    marketingPlanId: String(row.marketing_plan_id),
    channel: String(row.channel) as OutboundQueueEntry['channel'],
    messageIntent: String(row.message_intent) as OutboundQueueEntry['messageIntent'],
    payload: (row.payload ?? {}) as Record<string, unknown>,
    gateSnapshot: (row.gate_snapshot ?? {}) as OutboundQueueEntry['gateSnapshot'],
    status: String(row.status) as OutboundQueueEntry['status'],
    blockedReasons: (row.blocked_reasons ?? []) as string[],
    scheduledFor: row.scheduled_for ? new Date(String(row.scheduled_for)).toISOString() : null,
    sentAt: row.sent_at ? new Date(String(row.sent_at)).toISOString() : null,
    failureReason: row.failure_reason ? String(row.failure_reason) : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function saveOutboundQueueEntriesAsync(entries: OutboundQueueEntry[]): Promise<OutboundQueueEntry[]> {
  if (resolveDataBackend() === 'json') {
    return saveOutboundQueueEntries(entries);
  }

  const pool = getPostgresPool();
  for (const entry of entries) {
    await pool.query(
      `INSERT INTO outbound_queue
        (id, lead_id, report_id, marketing_plan_id, channel, message_intent, payload, gate_snapshot,
         status, blocked_reasons, scheduled_for, sent_at, failure_reason, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (id) DO UPDATE SET
        status=EXCLUDED.status,
        blocked_reasons=EXCLUDED.blocked_reasons,
        gate_snapshot=EXCLUDED.gate_snapshot,
        updated_at=EXCLUDED.updated_at`,
      [
        entry.id,
        entry.leadId,
        entry.reportId,
        entry.marketingPlanId,
        entry.channel,
        entry.messageIntent,
        JSON.stringify(entry.payload),
        JSON.stringify(entry.gateSnapshot),
        entry.status,
        JSON.stringify(entry.blockedReasons),
        entry.scheduledFor ?? null,
        entry.sentAt,
        entry.failureReason,
        entry.createdAt,
        entry.updatedAt,
      ]
    );
  }
  return entries;
}

export function listOutboundQueue(): OutboundQueueEntry[] {
  return readEntries().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listOutboundQueueAsync(): Promise<OutboundQueueEntry[]> {
  if (resolveDataBackend() === 'json') {
    return listOutboundQueue();
  }

  const result = await getPostgresPool().query('SELECT * FROM outbound_queue ORDER BY created_at DESC');
  return result.rows.map(rowToOutboundEntry);
}

export function resetOutboundQueueForTest(): void {
  persistEntries([]);
}
