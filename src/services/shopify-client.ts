export async function createShopifyProduct(payload: Record<string, unknown>) {
  return { status: 'queued', payload, note: 'Channel integration reserved for phase 2' };
}
