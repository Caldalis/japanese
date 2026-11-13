import { useEffect, useMemo, useState } from 'react';
import { DAKU, YOON } from '../../data/kana';
import { say } from '../../lib/speech';

type Mode = 'both' | 'hira' | 'kata';
const MODES: { id: Mode; label: string }[] = [
  { id: 'both', label: '平+片' },
  { id: 'hira', label: '只看平假名' },
  { id: 'kata', label: '只看片假名' },
];

type Cell = { hira: string; kata: string; romaji: string };
type Row = { label: string; sub: string; cells: Cell[] };

const toRows = (raw: [string, string, string, string][], kind: 'daku' | 'yoon'): Row[] =>
  raw.map(([t, h, k, r]) => {
    const hs = h.includes(' ') ? h.split(' ') : [...h];
    const ks = k.includes(' ') ? k.split(' ') : [...k];
    const rs = r.split(' ');
    return {
      label: kind === 'daku' ? hs[0] : t,
      sub: kind === 'daku' ? t : '+ゃゅょ',
      cells: hs.map((c, i) => ({ hira: c, kata: ks[i], romaji: rs[i] })),
    };
  });

const DAKU_ROWS = toRows(DAKU, 'daku');
const YOON_ROWS = toRows(YOON, 'yoon');
const flatten = (rows: Row[]) => rows.flatMap((row) => row.cells);
const DAKU_CELLS = flatten(DAKU_ROWS);
const YOON_CELLS = flatten(YOON_ROWS);

const shuffle = <T,>(a: T[]) => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
};
const readBool = (k: string) => { try { return localStorage.getItem(k) === '1'; } catch { return false; } };
const writeBool = (k: string, v: boolean) => { try { localStorage.setItem(k, v ? '1' : '0'); } catch {} };

export default function DakuonGrid() {
  const [mode, setMode] = useState<Mode>('both');
  const [hideRoma, setHideRoma] = useState(false);
  const [random, setRandom] = useState(false);
  const [seed, setSeed] = useState(0);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const m = localStorage.getItem('kana-mode') as Mode | null;
      if (m && MODES.some((x) => x.id === m)) setMode(m);
    } catch {}
    setHideRoma(readBool('kana-hideroma'));
    setRandom(readBool('dakuon-random'));
    setSeed(Date.now());
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem('kana-mode', mode); } catch {}
    writeBool('kana-hideroma', hideRoma);
    writeBool('dakuon-random', random);
  }, [mode, hideRoma, random, ready]);
  useEffect(() => { setRevealed(null); }, [mode, hideRoma, random]);

  const dakuList = useMemo(() => (random ? shuffle(DAKU_CELLS) : DAKU_CELLS), [random, seed]);
  const yoonList = useMemo(() => (random ? shuffle(YOON_CELLS) : YOON_CELLS), [random, seed]);

  const tap = (c: Cell, key: string) => {
    say(c.kata);
    if (hideRoma) setRevealed(key);
  };

  const cell = (c: Cell, key: string) => (
    <button type="button" className={`kcell${revealed === key ? ' revealed' : ''}`} key={key}
      onClick={() => tap(c, key)} aria-label={`${c.hira} ${c.romaji}`}>
      <span className="h">{c.hira}</span>
      <span className="kt">{c.kata}</span>
      <span className="r">{c.romaji}</span>
    </button>
  );

  const rows = (list: Row[], section: string) =>
    list.map((row, i) => (
      <div className={`krow${section === 'yoon' ? ' y' : ''}`} key={`${section}-${i}`}>
        <div className="rl">
          <b>{row.label}</b>
          <span>{row.sub}</span>
          <button type="button" title="整行连读" aria-label={`连读 ${row.label}`}
            onClick={() => say(row.cells.map((x) => x.kata).join('、'))}>▶</button>
        </div>
        {row.cells.map((c, j) => cell(c, `${section}-${i}-${j}`))}
      </div>
    ));

  const flat = (list: Cell[], section: string) => (
    <div className="kgrid">{list.map((c, i) => cell(c, `${section}-flat-${i}`))}</div>
  );

  const cls = `mode-${mode}${hideRoma ? ' hideroma' : ''}`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 mt-3">
        <span className="seg" role="group" aria-label="显示方式">
          {MODES.map((m) => (
            <button key={m.id} type="button" className={mode === m.id ? 'on' : ''} onClick={() => setMode(m.id)}>{m.label}</button>
          ))}
        </span>
        <label className="chk"><input type="checkbox" checked={hideRoma} onChange={(e) => setHideRoma(e.target.checked)} /> 隐藏罗马音</label>
        <label className="chk"><input type="checkbox" checked={random} onChange={(e) => setRandom(e.target.checked)} /> 乱序显示</label>
        {random && <button type="button" className="btn sm" onClick={() => setSeed(Date.now())}>再打乱</button>}
      </div>
      {(hideRoma || random) && (
        <p className="text-xs text-muted mb-2">
          {hideRoma && random ? '自测模式：看字想读音，点格子听答案、看罗马音。' : hideRoma ? '看字想读音，点格子听答案、看罗马音。' : '打乱了行的顺序，脱离 あいうえお 的节奏认字。'}
        </p>
      )}

      <div className={cls}>
        {random ? flat(dakuList, 'daku') : rows(DAKU_ROWS, 'daku')}
        <div className="note">じ 和 ぢ、ず 和 づ 读音相同，现代日语几乎只用 じ ず。ぢ づ 只出现在少数复合词里，如 はなぢ 鼻血、つづく 继续。</div>

        <h1 className="text-xl font-semibold mt-8">拗音</h1>
        <p className="text-muted text-sm mt-1 mb-2">い段假名加小写的 ゃ ゅ ょ，两个字合读成一拍。写小写才是拗音：きや ki-ya 两拍，きゃ kya 一拍。</p>
        {random ? flat(yoonList, 'yoon') : rows(YOON_ROWS, 'yoon')}
        <div className="note">罗马字不规则的三组：しゃ sha、ちゃ cha、じゃ ja，不写 sya、tya、zya。常用词：おちゃ 茶、しゃしん 照片、きょう 今天、りょこう 旅行、じゅぎょう 课、ぎゅうにゅう 牛奶。</div>
      </div>
    </div>
  );
}
