export type Snapshot<T> = {
  state: T;
  ts: number;
};

const MAX_HISTORY = 50;

export function pushHistory<T>(prev: Snapshot<T>[], state: T): Snapshot<T>[] {
  const next = [...prev, { state, ts: Date.now() }];
  if (next.length > MAX_HISTORY) next.shift();
  return next;
}

export function popHistory<T>(prev: Snapshot<T>[]) {
  if (prev.length === 0) return { nextHistory: prev, last: null as T | null };
  const nextHistory = prev.slice(0, -1);
  const last = prev[prev.length - 1].state;
  return { nextHistory, last };
}
