import { useEffect, useMemo, useState } from 'react';
import { say } from '../../lib/speech';
import { clearDeck, grade, isDue, loadDeck, saveDeck, type CardState, type Grade } from '../../lib/srs';
import { POS_LABEL, wordKey, type Word } from '../../lib/vocab';
import { renderJa, speechText } from '../../../plugins/ja-text.mjs';

interface Props { words: Word[]; title: string; newLimit?: number }
type Mode = 'read' | 'listen';
type States = Record<string, Record<string, CardState>>; // deck → word → state

const shuffle = <T,>(a: T[]) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const GRADES: { g: Grade; label: string; hint: string; cls: string }[] = [
  { g: 0, label: '不会', hint: '10 分钟后再来', cls: 'border-bad text-bad' },
  { g: 1, label: '模糊', hint: '明天', cls: '' },
  { g: 2, label: '会了', hint: '几天后', cls: '' },
  { g: 3, label: '简单', hint: '很久以后', cls: 'border-ok text-ok' },
];

export default function Flashcards({ words, title, newLimit = 15 }: Props) {
  const decks = useMemo(() => [...new Set(words.map((w) => w.deck))], [words]);
  const [states, setStates] = useState<States>({});
  const [mode, setMode] = useState<Mode>('read');
  const [limit, setLimit] = useState(newLimit);
  const [phase, setPhase] = useState<'idle' | 'run' | 'done'>('idle');
  const [queue, setQueue] = useState<Word[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [seen, setSeen] = useState(0);
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const [confirmReset, setConfirmReset] = useState(false);

  const reload = () => setStates(Object.fromEntries(decks.map((d) => [d, loadDeck(d)])));
  useEffect(() => { reload(); try { const m = localStorage.getItem('fc-mode'); if (m === 'listen' || m === 'read') setMode(m); } catch {} }, [decks]);
  useEffect(() => { try { localStorage.setItem('fc-mode', mode); } catch {} }, [mode]);

  const stateOf = (w: Word) => states[w.deck]?.[w.word];
  const now = Date.now();
  const learned = words.filter((w) => stateOf(w)).length;
  const due = words.filter((w) => isDue(stateOf(w), now));
  const fresh = words.filter((w) => !stateOf(w));
  const cur = queue[0];

  const start = () => {
    const q = [...shuffle(due), ...fresh.slice(0, limit)];
    if (!q.length) return;
    setQueue(q); setSeen(0); setMissed(new Set()); setFlipped(false); setPhase('run');
  };
  const startMissed = () => {
    const q = words.filter((w) => missed.has(wordKey(w)));
    setQueue(shuffle(q)); setSeen(0); setMissed(new Set()); setFlipped(false); setPhase('run');
  };

  // 听力模式：翻开前自动播一遍读音
  useEffect(() => { if (phase === 'run' && cur && !flipped && mode === 'listen') say(cur.kana); }, [phase, cur, flipped, mode]);

  const answer = (g: Grade) => {
    if (!cur) return;
    const next = grade(stateOf(cur), g);
    const deckStates = { ...(states[cur.deck] ?? {}), [cur.word]: next };
    saveDeck(cur.deck, deckStates);
    setStates({ ...states, [cur.deck]: deckStates });
    const rest = queue.slice(1);
    if (g === 0) { setMissed(new Set(missed).add(wordKey(cur))); rest.splice(Math.min(3, rest.length), 0, cur); }
    else setSeen(seen + 1);
    setFlipped(false);
    if (rest.length === 0) setPhase('done'); else setQueue(rest);
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (phase !== 'run' || (e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!flipped) setFlipped(true); }
      if (flipped && /^[1-4]$/.test(e.key)) answer((Number(e.key) - 1) as Grade);
      if (e.key === 'p' && cur) say(cur.kana);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  if (phase === 'idle') {
    return (
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm tabular-nums">
          <span><b className="text-lg">{words.length}</b> <span className="text-muted">个词</span></span>
          <span><b className="text-lg">{learned}</b> <span className="text-muted">已学</span></span>
          <span><b className={`text-lg ${due.length ? 'text-kata' : ''}`}>{due.length}</b> <span className="text-muted">到期复习</span></span>
          <span><b className="text-lg">{fresh.length}</b> <span className="text-muted">没学过</span></span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-raised overflow-hidden"><div className="h-full bg-accent" style={{ width: `${words.length ? (learned / words.length) * 100 : 0}%` }} /></div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="seg" role="group" aria-label="模式">
            <button type="button" className={mode === 'read' ? 'on' : ''} onClick={() => setMode('read')}>看词</button>
            <button type="button" className={mode === 'listen' ? 'on' : ''} onClick={() => setMode('listen')}>听音</button>
          </span>
          <label className="chk">每轮新词
            <select id="fc-limit" className="ml-1 rounded-md border border-line bg-surface px-1.5 py-0.5 text-fg" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
              {[5, 10, 15, 20, 30, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </div>
        <p className="mt-2 text-xs text-muted">{mode === 'read' ? '先看词，想读音和意思，再翻开对答案。' : '先只听读音，想是哪个词、什么意思，再翻开。练听力用这个。'}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="button" className="btn primary" onClick={start} disabled={!due.length && !fresh.length}>
            {due.length ? `复习 ${due.length} 个到期的` : ''}{due.length && fresh.length ? '，再' : ''}{fresh.length ? `学 ${Math.min(limit, fresh.length)} 个新词` : ''}{!due.length && !fresh.length ? '都学过了，今天没有到期的' : ''}
          </button>
          {learned > 0 && (confirmReset
            ? <span className="text-sm">确定清空这组进度？<button type="button" className="btn sm ml-1" onClick={() => { decks.forEach(clearDeck); reload(); setConfirmReset(false); }}>清空</button><button type="button" className="btn sm ml-1" onClick={() => setConfirmReset(false)}>取消</button></span>
            : <button type="button" className="btn sm text-muted" onClick={() => setConfirmReset(true)}>重置进度</button>)}
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="rounded-2xl border border-line bg-surface p-5 text-center">
        <div className="text-3xl font-semibold tabular-nums">{seen} 个</div>
        <p className="mt-1 text-sm text-muted">{missed.size ? `这轮有 ${missed.size} 个标了"不会"，可以单独再过一遍。` : '这轮全部过关。进度已保存在这台设备上。'}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {missed.size > 0 && <button type="button" className="btn primary" onClick={startMissed}>再过不会的</button>}
          <button type="button" className="btn" onClick={() => { reload(); setPhase('idle'); }}>回到 {title}</button>
        </div>
      </div>
    );
  }

  const st = stateOf(cur);
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-center text-xs text-muted tabular-nums">
        <span>剩 {queue.length} 张</span>
        <span className="mx-2">·</span>
        <span>{st ? `第 ${st.n + 1} 次` : '新词'}</span>
        <button type="button" className="ml-auto hover:text-fg" onClick={() => { reload(); setPhase('idle'); }}>结束</button>
      </div>

      <div className="mt-3 min-h-[200px] flex flex-col items-center justify-center text-center">
        {!flipped ? (
          mode === 'read'
            ? <div className="ja text-5xl sm:text-6xl text-hira leading-tight" lang="ja">{cur.word}</div>
            : <button type="button" className="grid place-items-center w-24 h-24 rounded-full bg-hira-soft text-hira text-3xl" onClick={() => say(cur.kana)} aria-label="再听一遍">▶</button>
        ) : (
          <div className="w-full">
            <div className="ja text-4xl sm:text-5xl text-hira leading-tight" lang="ja">{cur.word}</div>
            <div className="ja text-xl text-muted mt-1" lang="ja">{cur.kana}</div>
            <div className="mt-2 text-lg"><span className="text-[11px] px-1.5 py-0.5 rounded bg-raised text-muted mr-2 align-middle">{POS_LABEL[cur.pos]}</span>{cur.meaning}</div>
            {cur.note && <p className="mt-1 text-sm text-kata">{cur.note}</p>}
            {cur.exJa && (
              <button type="button" className="mt-3 w-full text-left rounded-xl bg-raised px-3 py-2 hover:bg-hira-soft" onClick={() => say(speechText(cur.exJa!))}>
                <span className="ja text-lg leading-relaxed block" lang="ja" dangerouslySetInnerHTML={{ __html: renderJa(cur.exJa) }} />
                {cur.exZh && <span className="block text-sm text-muted">{cur.exZh} ▶</span>}
              </button>
            )}
          </div>
        )}
      </div>

      {!flipped ? (
        <div className="mt-3 flex justify-center gap-2">
          {mode === 'read' && <button type="button" className="btn" onClick={() => say(cur.kana)}>▶ 听</button>}
          <button type="button" className="btn primary" onClick={() => setFlipped(true)}>翻开</button>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {GRADES.map((x) => (
            <button key={x.g} type="button" onClick={() => answer(x.g)} className={`rounded-xl border border-line bg-surface py-2 hover:border-accent ${x.cls}`}>
              <div className="font-medium">{x.label}</div><div className="text-[11px] text-muted">{x.hint}</div>
            </button>
          ))}
          <button type="button" className="col-span-4 btn sm justify-center mt-1" onClick={() => say(cur.kana)}>▶ 再听一遍</button>
        </div>
      )}
      <p className="mt-2 text-center text-[11px] text-muted hidden sm:block">空格翻开 · 1 到 4 打分 · P 朗读</p>
    </div>
  );
}
