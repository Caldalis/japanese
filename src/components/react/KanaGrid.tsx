import { useEffect, useMemo, useState } from 'react';
import { SEION, SEION_FLAT, type KanaItem } from '../../data/kana';
import { say } from '../../lib/speech';

type Mode = 'both' | 'hira' | 'kata';
const MODES: { id: Mode; label: string }[] = [
  { id: 'both', label: '平+片' },
  { id: 'hira', label: '只看平假名' },
  { id: 'kata', label: '只看片假名' },
];
const shuffle = <T,>(a: T[]) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const readBool = (k: string) => { try { return localStorage.getItem(k) === '1'; } catch { return false; } };
const writeBool = (k: string, v: boolean) => { try { localStorage.setItem(k, v ? '1' : '0'); } catch {} };

export default function KanaGrid() {
  const [mode, setMode] = useState<Mode>('both');
  const [showSrc, setShowSrc] = useState(false);
  const [hideRoma, setHideRoma] = useState(false);
  const [random, setRandom] = useState(false);
  const [seed, setSeed] = useState(0);
  const [cur, setCur] = useState<KanaItem | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const m = localStorage.getItem('kana-mode') as Mode | null;
      if (m && MODES.some((x) => x.id === m)) setMode(m);
    } catch {}
    setShowSrc(readBool('kana-src'));
    setHideRoma(readBool('kana-hideroma'));
    setRandom(readBool('kana-random'));
    setSeed(Date.now());
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem('kana-mode', mode); } catch {}
    writeBool('kana-src', showSrc); writeBool('kana-hideroma', hideRoma); writeBool('kana-random', random);
  }, [mode, showSrc, hideRoma, random, ready]);

  // 乱序时的顺序；换 seed 就重新打乱。字源卡的上一个下一个也按这个顺序走
  const list = useMemo(() => (random ? shuffle(SEION_FLAT) : SEION_FLAT), [random, seed]);
  const open = (it: KanaItem) => { setCur(it); say(it.kata); };
  const index = cur ? list.indexOf(cur) : -1;
  const step = (d: number) => { if (index < 0) return; open(list[(index + d + list.length) % list.length]); };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!cur) return;
      if (e.key === 'Escape') setCur(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const cell = (it: KanaItem) => (
    <button type="button" className="kcell" key={it.hira} onClick={() => open(it)} aria-label={`${it.hira} ${it.romaji}`}>
      <span className="h">{it.hira}</span>
      <span className="kt">{it.kata}</span>
      <span className="r">{it.romaji}</span>
      <span className="s">{it.hiraSrc}·{it.kataSrc}</span>
    </button>
  );
  const cls = `mode-${mode}${showSrc ? ' showsrc' : ''}${hideRoma ? ' hideroma' : ''}`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
        <span className="seg" role="group" aria-label="显示方式">
          {MODES.map((m) => (
            <button key={m.id} type="button" className={mode === m.id ? 'on' : ''} onClick={() => setMode(m.id)}>{m.label}</button>
          ))}
        </span>
        <label className="chk"><input id="show-src" type="checkbox" checked={showSrc} onChange={(e) => setShowSrc(e.target.checked)} /> 显示字源</label>
        <label className="chk"><input id="hide-roma" type="checkbox" checked={hideRoma} onChange={(e) => setHideRoma(e.target.checked)} /> 隐藏罗马音</label>
        <label className="chk"><input id="random-order" type="checkbox" checked={random} onChange={(e) => setRandom(e.target.checked)} /> 乱序显示</label>
        {random && <button type="button" className="btn sm" onClick={() => setSeed(Date.now())}>再打乱</button>}
      </div>
      {(hideRoma || random) && (
        <p className="text-xs text-muted mb-2">
          {hideRoma && random ? '自测模式：看字想读音，点格子听答案。' : hideRoma ? '看字想读音，点格子听答案、看罗马音。' : '打乱了行的顺序，脱离 あいうえお 的节奏认字。'}
        </p>
      )}

      <div className={cls}>
        {random ? (
          <div className="kgrid">{list.map(cell)}</div>
        ) : (
          SEION.map((row) => (
            <div className="krow" key={row.name}>
              <div className="rl">
                <b>{row.name}</b>
                <span>{row.consonant || ' '}</span>
                <button type="button" title="整行连读" aria-label={`连读 ${row.name}`}
                  onClick={() => say(row.items.filter((x): x is KanaItem => !!x).map((x) => x.kata).join('、'))}>▶</button>
              </div>
              {row.items.map((it, i) => (it ? cell(it) : <div className="kcell empty" key={`${row.name}-${i}`} aria-hidden="true" />))}
            </div>
          ))
        )}
      </div>

      {cur && <button type="button" className="fixed inset-0 z-40 bg-black/20 cursor-default" aria-label="关闭字源卡" onClick={() => setCur(null)} />}
      <div className={`sheet${cur ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="字源卡" aria-hidden={!cur}>
        {cur && (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <b className="text-base">{cur.romaji}</b>
              <span className="text-muted text-sm">{cur.row} · {index + 1} / {list.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className="half" onClick={() => say(cur.kata)}>
                <span className="big">{cur.hira}</span><span className="text-muted text-lg">←</span>
                <span><span className="src">{cur.hiraSrc}</span><small>草书</small></span>
              </button>
              <button type="button" className="half kata" onClick={() => say(cur.kata)}>
                <span className="big">{cur.kata}</span><span className="text-muted text-lg">←</span>
                <span><span className="src">{cur.kataSrc}</span><small>取{cur.kataPart}</small></span>
              </button>
            </div>
            <p className="my-3">{cur.tip}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn primary" onClick={() => say(cur.kata)}>▶ 再听一遍</button>
              <button type="button" className="btn" onClick={() => step(-1)} aria-label="上一个">←</button>
              <button type="button" className="btn" onClick={() => step(1)} aria-label="下一个">→</button>
              <button type="button" className="btn ml-auto" onClick={() => setCur(null)}>关闭</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
