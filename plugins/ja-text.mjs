// Markdown 里日语文本的约定，remark 插件和音频生成脚本共用。
//   汉字(かな)  → 振假名；朗读文本保留汉字、去掉括号里的假名（神经网络语音读汉字更自然）
//   **文字**    → 高亮语法点
export const RUBY = /([一-鿿々〆ヶ]+)[（(]([぀-ゟ゠-ヿ]+)[）)]/g;
export const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const renderJa = (line) => esc(line).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(RUBY, '<ruby>$1<rt>$2</rt></ruby>');
export const speechText = (line) => line.replace(/\*\*/g, '').replace(RUBY, '$1').replace(/\s+/g, ' ').trim();

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
