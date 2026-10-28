// 间隔复习：简化的 SM-2。每组词一个 localStorage 条目，键是词本身。
export interface CardState { i: number; e: number; d: number; n: number } // 间隔(天)、难度系数、到期时间(ms)、复习次数
export type Grade = 0 | 1 | 2 | 3; // 不会、模糊、会了、简单
const DAY = 86400000;

export function loadDeck(deck: string): Record<string, CardState> {
  try { return JSON.parse(localStorage.getItem(`srs:${deck}`) || '{}'); } catch { return {}; }
}
export function saveDeck(deck: string, states: Record<string, CardState>) {
  try { localStorage.setItem(`srs:${deck}`, JSON.stringify(states)); } catch {}
}
export function clearDeck(deck: string) {
  try { localStorage.removeItem(`srs:${deck}`); } catch {}
}

export function grade(prev: CardState | undefined, g: Grade, now = Date.now()): CardState {
  const s = prev ?? { i: 0, e: 2.5, d: now, n: 0 };
  let { i, e } = s;
  if (g === 0) { i = 0; e = Math.max(1.3, e - 0.2); }
  else if (g === 1) { i = Math.max(1, Math.round(i * 1.2)); e = Math.max(1.3, e - 0.15); }
  else if (g === 2) { i = i === 0 ? 1 : Math.round(i * e); }
  else { i = i === 0 ? 3 : Math.round(i * e * 1.3); e += 0.15; }
  const d = g === 0 ? now + 10 * 60000 : now + i * DAY;
  return { i, e, d, n: s.n + 1 };
}

export const isDue = (s: CardState | undefined, now = Date.now()) => !!s && s.d <= now;
