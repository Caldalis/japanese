// 词汇数据：src/data/vocab/*.json，每个文件一组词。
// 每个词是一行数组：[词, 读音, 词性, 中文, 例句, 提示]，例句写成 "日语|中文"，后两项可留空字符串。
export type Pos = 'n' | 'v5' | 'v1' | 'vs' | 'vk' | 'adj-i' | 'adj-na' | 'adv' | 'expr' | 'num' | 'pron' | 'conj' | 'other';
export const POS_LABEL: Record<Pos, string> = {
  n: '名', v5: '动Ⅰ', v1: '动Ⅱ', vs: '动Ⅲ', vk: '动Ⅲ', 'adj-i': 'い形', 'adj-na': 'な形', adv: '副', expr: '表达', num: '数', pron: '代', conj: '连', other: '其他',
};
export const POS_LIST = Object.keys(POS_LABEL) as Pos[];

export interface Word {
  deck: string;
  word: string;
  kana: string;
  pos: Pos;
  meaning: string;
  exJa?: string;
  exZh?: string;
  note?: string;
}

export function toWords(deck: string, rows: string[][]): Word[] {
  return rows.map(([word, kana, pos, meaning, example = '', note = '']) => {
    const [exJa, exZh] = example ? example.split('|') : [];
    return { deck, word, kana, pos: pos as Pos, meaning, exJa: exJa || undefined, exZh: exZh || undefined, note: note || undefined };
  });
}

export const wordKey = (w: Word) => `${w.deck}/${w.word}`;
