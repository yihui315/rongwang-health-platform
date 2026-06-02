"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, isAdminTokenValid } from "@/lib/auth/admin";
import {
  recordOutboundQueueReviewDecision,
  type OutboundQueueReviewAction,
} from "@/lib/marketing/outbound-queue";

const allowedReviewActions = new Set<OutboundQueueReviewAction>(["reviewed_blocked", "cancelled"]);

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function recordOutboundQueueReviewFormDecision(formData: FormData) {
  const id = getStringValue(formData, "id");
  const action = getStringValue(formData, "action") as OutboundQueueReviewAction;
  const note = getStringValue(formData, "note");
  const actor = getStringValue(formData, "actor") || "admin-ui";

  if (!id || !allowedReviewActions.has(action) || note.length < 3) {
    throw new Error("invalid_outbound_queue_review");
  }

  const result = await recordOutboundQueueReviewDecision({
    id,
    action,
    note,
    actor,
  });

  if (result.error) {
    throw new Error(`outbound_queue_review_${result.error}`);
  }
}

export async function reviewOutboundQueueEntryAction(formData: FormData) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!isAdminTokenValid(adminToken)) {
    throw new Error("unauthorized_admin_review");
  }

  await recordOutboundQueueReviewFormDecision(formData);
  revalidatePath("/admin/outbound-queue");
}
