import type { DomainEvent } from './events';

export function describeEvent(event: DomainEvent) {
  return `Handled event: ${event}`;
}
