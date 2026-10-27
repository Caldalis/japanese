import { useEffect, useMemo, useState } from 'react';
import { SEION, SEION_FLAT, type KanaItem } from '../../data/kana';
import { say } from '../../lib/speech';

type Mode = 'both' | 'hira' | 'kata';
const MODES: { id: Mode; label: string }[] = [
  { id: 'both', label: '平+片' },
  { id: 'hira', label: '只看平假名' },
  { id: 'kata', label: '只看片假名' },
];

export default function KanaGrid() {
  const [mode, setMode] = useState<Mode>('both');
  const [showSrc, setShowSrc] = useState(false);
  const [cur, setCur] = useState<KanaItem | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const m = localStorage.getItem('kana-mode') as Mode | null;
      if (m && MODES.some((x) => x.id === m)) setMode(m);
      setShowSrc(localStorage.getItem('kana-src') === '1');
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem('kana-mode', mode); localStorage.setItem('kana-src', showSrc ? '1' : '0'); } catch {}
  }, [mode, showSrc, ready]);

  const open = (it: KanaItem) => { setCur(it); say(it.kata); };
  const index = useMemo(() => (cur ? SEION_FLAT.indexOf(cur) : -1), [cur]);
  const step = (d: number) => { if (index < 0) return; open(SEION_FLAT[(index + d + SEION_FLAT.length) % SEION_FLAT.length]); };

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

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <span className="seg" role="group" aria-label="显示方式">
          {MODES.map((m) => (
            <button key={m.id} type="button" className={mode === m.id ? 'on' : ''} onClick={() => setMode(m.id)}>{m.label}</button>
          ))}
        </span>
        <label className="chk"><input id="show-src" type="checkbox" checked={showSrc} onChange={(e) => setShowSrc(e.target.checked)} /> 显示字源</label>
      </div>

      <div className={`mode-${mode}${showSrc ? ' showsrc' : ''}`}>
        {SEION.map((row) => (
          <div className="krow" key={row.name}>
            <div className="rl">
              <b>{row.name}</b>
              <span>{row.consonant || ' '}</span>
              <button type="button" title="整行连读" aria-label={`连读 ${row.name}`}
                onClick={() => say(row.items.filter((x): x is KanaItem => !!x).map((x) => x.kata).join('、'))}>▶</button>
            </div>
            {row.items.map((it, i) =>
              it ? (
                <button type="button" className="kcell" key={it.hira} onClick={() => open(it)} aria-label={`${it.hira} ${it.romaji}`}>
                  <span className="h">{it.hira}</span>
                  <span className="kt">{it.kata}</span>
                  <span className="r">{it.romaji}</span>
                  <span className="s">{it.hiraSrc}·{it.kataSrc}</span>
                </button>
              ) : (
                <div className="kcell empty" key={`${row.name}-${i}`} aria-hidden="true" />
              ),
            )}
          </div>
        ))}
      </div>

      {cur && <button type="button" className="fixed inset-0 z-40 bg-black/20 cursor-default" aria-label="关闭字源卡" onClick={() => setCur(null)} />}
      <div className={`sheet${cur ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="字源卡" aria-hidden={!cur}>
        {cur && (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <b className="text-base">{cur.romaji}</b>
              <span className="text-muted text-sm">{cur.row} · {index + 1} / {SEION_FLAT.length}</span>
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
