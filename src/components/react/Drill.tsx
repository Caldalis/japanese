import { useEffect, useState } from 'react';
import { DAKU, MIX, ROMA, SEION_FLAT, YOON, isHira, originLine, toKata } from '../../data/kana';
import { say } from '../../lib/speech';

type SetId = 'hira' | 'kata' | 'daku' | 'yoon' | 'mix';
const SETS: { id: SetId; label: string }[] = [
  { id: 'hira', label: '平假名' },
  { id: 'kata', label: '片假名' },
  { id: 'daku', label: '浊音' },
  { id: 'yoon', label: '拗音' },
  { id: 'mix', label: '只练易混字' },
];
const MIXCH = [...new Set(MIX.map((m) => m[0]).join(''))];
const ALL_ROMA = [...new Set(Object.values(ROMA))];
const shuffle = <T,>(a: T[]) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

function buildPool(sel: Set<SetId>): string[] {
  if (sel.has('mix')) return MIXCH.slice();
  const p: string[] = [];
  if (sel.has('hira')) p.push(...SEION_FLAT.map((i) => i.hira));
  if (sel.has('kata')) p.push(...SEION_FLAT.map((i) => i.kata));
  if (sel.has('daku')) for (const [, h, k] of DAKU) p.push(...h, ...k);
  if (sel.has('yoon')) for (const [, h, k] of YOON) p.push(...h.split(' '), ...k.split(' '));
  return [...new Set(p)];
}

interface Q { kana: string; options: string[] }
const makeQ = (kana: string, pool: string[]): Q => {
  const ans = ROMA[kana];
  const others = shuffle([...new Set(pool.map((c) => ROMA[c]).filter((r) => r !== ans))]).slice(0, 3);
  while (others.length < 3) { const r = ALL_ROMA[Math.floor(Math.random() * ALL_ROMA.length)]; if (r !== ans && !others.includes(r)) others.push(r); }
  return { kana, options: shuffle([ans, ...others]) };
};

export default function Drill() {
  const [sel, setSel] = useState<Set<SetId>>(new Set(['hira']));
  const [pool, setPool] = useState<string[]>([]);
  const [i, setI] = useState(0);
  const [q, setQ] = useState<Q | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  useEffect(() => { try { setLast(localStorage.getItem('drill-last')); } catch {} }, []);

  const toggle = (id: SetId) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const start = (p: string[]) => {
    const sp = shuffle(p); setPool(sp); setI(0); setRight(0); setWrong([]); setDone(false); setPicked(null); setQ(makeQ(sp[0], sp));
  };
  const begin = () => { const p = buildPool(sel); if (p.length) start(p); };
  const answer = (opt: string) => {
    if (!q || picked) return;
    setPicked(opt);
    const ok = opt === ROMA[q.kana];
    if (ok) setRight((r) => r + 1); else setWrong((w) => [...w, q.kana]);
    say(toKata(q.kana));
  };
  const next = () => {
    if (!q) return;
    const n = i + 1;
    if (n >= pool.length) {
      setDone(true);
      const s = `${right} / ${pool.length}`;
      try { localStorage.setItem('drill-last', s); } catch {}
      setLast(s);
      return;
    }
    setI(n); setPicked(null); setQ(makeQ(pool[n], pool));
  };
  const empty = buildPool(sel).length === 0;

  return (
    <div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
        {SETS.map((s) => (
          <label key={s.id} className="chk"><input id={`set-${s.id}`} type="checkbox" checked={sel.has(s.id)} onChange={() => toggle(s.id)} /> {s.label}</label>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn primary" onClick={begin} disabled={empty}>{q ? '重新开始' : '开始'}</button>
        {done && wrong.length > 0 && <button type="button" className="btn" onClick={() => start(wrong)}>重练错题（{wrong.length}）</button>}
        {empty && <span className="text-muted text-sm">先勾选要练的范围</span>}
        {!q && last && <span className="text-muted text-sm">上次成绩 {last}</span>}
      </div>

      {q && !done && (
        <div className="mt-4 rounded-2xl border border-line bg-surface p-5 text-center">
          <div className="ja text-[76px] leading-[1.15] max-[420px]:text-[64px]" style={{ color: isHira(q.kana) ? 'var(--hira)' : 'var(--kata)' }}>{q.kana}</div>
          <div className="opts grid grid-cols-2 gap-2 mt-3">
            {q.options.map((o) => (
              <button key={o} type="button" onClick={() => answer(o)}
                className={picked ? (o === ROMA[q.kana] ? 'ok' : o === picked ? 'bad' : '') : ''}>{o}</button>
            ))}
          </div>
          <p className="min-h-[1.6em] mt-2 text-sm text-muted">
            {picked && (picked === ROMA[q.kana] ? '对。' : `错，读 ${ROMA[q.kana]}。`) + originLine(q.kana)}
          </p>
          <div className="flex justify-center gap-2 mt-2">
            <button type="button" className="btn" onClick={() => say(toKata(q.kana))}>▶ 再听一遍</button>
            {picked && <button type="button" className="btn primary" onClick={next}>{i + 1 >= pool.length ? '看结果' : '下一题'}</button>}
          </div>
          <div className="mt-3 text-xs text-muted tabular-nums">第 {i + 1} / {pool.length} 题 · 答对 {right}</div>
        </div>
      )}

      {done && (
        <div className="mt-4 rounded-2xl border border-line bg-surface p-5 text-center">
          <div className="text-4xl font-semibold tabular-nums">{right} / {pool.length}</div>
          <p className="mt-2 text-muted text-sm">
            {wrong.length ? <>错了 {wrong.length} 个：<span className="ja text-fg text-lg tracking-widest">{wrong.join(' ')}</span></> : '全对。换个范围再来一轮。'}
          </p>
        </div>
      )}
    </div>
  );
}
