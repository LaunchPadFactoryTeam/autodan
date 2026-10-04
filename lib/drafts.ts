import { randomUUID } from 'node:crypto';
import { mapTallySubmission } from './tally';
import { mutateDrafts } from './store';
import type { Draft } from './types';

/** Stores a Tally submission as a draft awaiting review. Idempotent on the submission id (webhook + embed both fire). */
export async function draftFromTally(payload: unknown): Promise<Draft> {
  const { externalId, car, unknown } = mapTallySubmission(payload);
  const draft: Draft = { id: randomUUID(), source: 'tally', externalId: externalId || undefined, createdAt: new Date().toISOString(), car, unknown };
  let result = draft;
  await mutateDrafts((list) => {
    const dup = externalId ? list.find((d) => d.externalId === externalId) : undefined;
    result = dup ?? draft;
    return dup ? list : [draft, ...list].slice(0, 50);
  });
  return result;
}
