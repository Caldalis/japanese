// Markdown 里日语文本的约定，remark 插件、词汇页和音频生成脚本共用。
//   汉字(かな)      → 振假名，例：食(た)べます
//   汉字送假名(かな) → 也支持，例：食べる(たべる)，送假名会自动从注音里去掉
//   **文字**        → 高亮语法点
export const RUBY = /([一-鿿々〆ヶ]+)([ぁ-ゖ]*)[（(]([぀-ゟ゠-ヿ]+)[）)]/g;
export const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const rubyHtml = (_, kanji, okuri, yomi) =>
  okuri && yomi.length > okuri.length && yomi.endsWith(okuri)
    ? `<ruby>${kanji}<rt>${yomi.slice(0, -okuri.length)}</rt></ruby>${okuri}`
    : `<ruby>${kanji}${okuri}<rt>${yomi}</rt></ruby>`;

export const renderJa = (line) => esc(line).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(RUBY, rubyHtml);
/** 整句朗读文本：保留汉字，去掉注音。语音引擎按上下文读汉字更自然 */
export const speechText = (line) => line.replace(/\*\*/g, '').replace(RUBY, '$1$2').replace(/\s+/g, ' ').trim();
/** 词块按注音朗读：短语没有上下文，一日 这类多音词让语音引擎自己猜会错 */
export const speechKana = (line) => line.replace(/\*\*/g, '').replace(RUBY, '$3').replace(/\s+/g, ' ').trim();

/** 行内反引号里是不是一个可朗读的日语词：含假名或汉字，且没有拉丁字母（N1、V 这类句型骨架不读） */
export const isJaChip = (s) => /[぀-ヿ一-鿿]/.test(s) && !/[A-Za-z]/.test(s);

/** 解析 ```ja 代码块：每组一个例句，返回 { ja, ro, zh } */
export function parseJaBlock(value) {
  return value.split(/\n\s*\n/).map((g) => g.split('\n').map((l) => l.trim()).filter(Boolean)).filter((g) => g.length).map((lines) => {
    const [ja, ...rest] = lines;
    const ro = rest.find((l) => /^[\x20-\x7e]+$/.test(l));
    const zh = rest.find((l) => l !== ro);
    return { ja, ro, zh };
  });
}
