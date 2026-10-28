import { useEffect, useState } from 'react';
import { isDue, loadDeck } from '../../lib/srs';

/** 首页和词汇目录上的小提示：今天有几个词到期 */
export default function DueCount({ decks }: { decks: { id: string; words: string[] }[] }) {
  const [n, setN] = useState<number | null>(null);
  const [learned, setLearned] = useState(0);
  useEffect(() => {
    const now = Date.now();
    let due = 0, l = 0;
    for (const d of decks) { const s = loadDeck(d.id); for (const w of d.words) { if (s[w]) l++; if (isDue(s[w], now)) due++; } }
    setN(due); setLearned(l);
  }, [decks]);
  if (n === null) return <span className="text-muted text-sm">读取进度…</span>;
  if (!learned) return <span className="text-muted text-sm">还没开始，挑一组词点进去学。</span>;
  return <span className="text-sm">{n ? <><b className="text-kata">{n}</b> 个到期待复习</> : '今天没有到期的词'} · 已学 {learned} 个</span>;
}
