import DashboardClient, {
  type DashboardCurrentPlan,
  type DashboardOrder,
} from "@/components/dashboard/DashboardClient";
import { requireCustomerSession } from "@/lib/auth/customer";
import { selectRowsByCustomerId } from "@/lib/customer-data";

export const dynamic = "force-dynamic";

function asRecord(row: unknown) {
  return row && typeof row === "object" ? (row as Record<string, unknown>) : null;
}

function getString(row: Record<string, unknown>, key: string, fallback = "") {
  const value = row[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function getNumber(row: Record<string, unknown>, key: string) {
  const value = row[key];
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) {
    return "-";
  }

  return value.slice(0, 10);
}

function getOrderPlan(row: Record<string, unknown>) {
  const items = row.items;
  if (!Array.isArray(items)) {
    return "Order";
  }

  const names = items
    .map((item) => asRecord(item))
    .map((item) => item ? getString(item, "name", getString(item, "slug")) : "")
    .filter(Boolean);

  return names.length > 0 ? names.join(" / ") : "Order";
}

function mapOrders(rows: unknown[]): DashboardOrder[] {
  return rows
    .map((row) => asRecord(row))
    .filter((row): row is Record<string, unknown> => Boolean(row))
    .map((row) => ({
      id: getString(row, "id", "RW-ORDER"),
      date: formatDate(row.created_at ?? row.createdAt),
      plan: getOrderPlan(row),
      amount: getNumber(row, "total"),
      status: getString(row, "status", "pending"),
    }));
}

function getDaysLeft(nextDelivery: string) {
  const nextTime = Date.parse(nextDelivery);
  if (!Number.isFinite(nextTime)) {
    return 0;
  }

  const diffMs = nextTime - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function mapCurrentPlan(rows: unknown[]): DashboardCurrentPlan | undefined {
  const subscriptions = rows
    .map((row) => asRecord(row))
    .filter((row): row is Record<string, unknown> => Boolean(row));
  const current = subscriptions.find((row) => getString(row, "status") === "active") ?? subscriptions[0];

  if (!current) {
    return undefined;
  }

  const planSlug = getString(current, "plan_slug", "subscription");
  const nextDelivery = formatDate(current.next_delivery);
  const daysLeft = getDaysLeft(nextDelivery);

  return {
    name: `${planSlug} subscription`,
    status: getString(current, "status", "active"),
    nextDelivery,
    progress: nextDelivery === "-" ? 0 : Math.max(0, Math.min(100, 100 - Math.round((daysLeft / 30) * 100))),
    daysLeft,
    products: [planSlug],
  };
}

async function getDashboardData(userId: string | undefined) {
  if (!userId) {
    return { currentPlan: undefined, recentOrders: [] as DashboardOrder[] };
  }

  try {
    const [ordersResult, subscriptionsResult] = await Promise.all([
      selectRowsByCustomerId("orders", userId),
      selectRowsByCustomerId("subscriptions", userId),
    ]);

    return {
      currentPlan: mapCurrentPlan(subscriptionsResult.data ?? []),
      recentOrders: mapOrders(ordersResult.data ?? []),
    };
  } catch {
    return { currentPlan: undefined, recentOrders: [] as DashboardOrder[] };
  }
}

export default async function DashboardPage() {
  const session = await requireCustomerSession("/dashboard");
  const dashboardData = await getDashboardData(session.user.id);

  return <DashboardClient customerEmail={session.user.email} {...dashboardData} />;
}
