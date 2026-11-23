import { speechKana } from '../../plugins/ja-text.mjs';

export type ReadingWord = [string, string, string, string, string];

export type SentenceSegment =
  | { type: 'text'; text: string }
  | { type: 'word'; text: string; wordIndex: number };

const HAS_KANJI = /[一-鿿々〆ヶ]/;
const PUNCT_OR_SPACE = /^[\s、。？！「」『』・,.?!（）()〜～…]*$/;

function findMatch(ja: string, word: ReadingWord, from: number): { idx: number; len: number } | null {
  const [surface, reading] = word;
  const exact = ja.indexOf(surface, from);
  if (exact !== -1) return { idx: exact, len: surface.length };

  // 兼容少数正文写假名、词表带汉字的情况（如 わかります vs 分(わ)かります）
  if (HAS_KANJI.test(surface)) {
    const candidates = [speechKana(surface), reading].filter((c) => c && c.length >= 2);
    for (const c of candidates) {
      const idx = ja.indexOf(c, from);
      if (idx !== -1) return { idx, len: c.length };
    }
  }
  return null;
}

/** 将带振假名的日语句子按词表切分为可点击的词块，保证拼接后与原文完全一致 */
export function tokenizeSentence(ja: string, words: ReadingWord[]): SentenceSegment[] {
  const segments: SentenceSegment[] = [];
  let pos = 0;

  for (let wi = 0; wi < words.length; wi++) {
    const m = findMatch(ja, words[wi], pos);
    if (!m) continue;

    // 防止跳词误匹配到句尾重复字：如果跳过区里有实质字符且后面的词能更早命中，则跳过当前词
    const gap = ja.slice(pos, m.idx);
    if (gap && !PUNCT_OR_SPACE.test(gap)) {
      let earlierNext = false;
      for (let nxt = wi + 1; nxt < words.length; nxt++) {
        const nm = findMatch(ja, words[nxt], pos);
        if (nm && nm.idx < m.idx) {
          earlierNext = true;
          break;
        }
      }
      if (earlierNext) continue;
    }

    if (m.idx > pos) segments.push({ type: 'text', text: ja.slice(pos, m.idx) });
    segments.push({ type: 'word', text: ja.slice(m.idx, m.idx + m.len), wordIndex: wi });
    pos = m.idx + m.len;
  }

  if (pos < ja.length) segments.push({ type: 'text', text: ja.slice(pos) });
  return segments;
}
