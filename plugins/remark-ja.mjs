// 把 Markdown 里的 ```ja 代码块变成带朗读按钮的例句卡。
// 写法：每个例句一组，组之间空一行。第一行日语，之后可选罗马字（纯 ASCII）和中文翻译。
//   汉字(かな)  → 注音（振り仮名），朗读时按假名读
//   **文字**    → 高亮语法点
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const RUBY = /([一-鿿々〆ヶ]+)[（(]([぀-ゟ゠-ヿ]+)[）)]/g;

const renderJa = (line) => esc(line).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(RUBY, '<ruby>$1<rt>$2</rt></ruby>');
const speech = (line) => line.replace(/\*\*/g, '').replace(RUBY, '$2');

function walk(node, fn) {
  if (!node.children) return;
  node.children.forEach((child, i) => { fn(child, i, node); walk(child, fn); });
}

export default function remarkJa() {
  return (tree) => {
    walk(tree, (node, index, parent) => {
      if (node.type !== 'code' || node.lang !== 'ja') return;
      const groups = node.value.split(/\n\s*\n/).map((g) => g.split('\n').map((l) => l.trim()).filter(Boolean)).filter((g) => g.length);
      const items = groups.map((lines) => {
        const [ja, ...rest] = lines;
        const ro = rest.find((l) => /^[\x20-\x7e]+$/.test(l));
        const zh = rest.find((l) => l !== ro);
        return `<div class="it"><div><div class="ja" lang="ja">${renderJa(ja)}</div>` +
          (ro ? `<div class="ro">${esc(ro)}</div>` : '') + (zh ? `<div class="zh">${esc(zh)}</div>` : '') +
          `</div><button type="button" class="play" data-say="${esc(speech(ja))}" aria-label="朗读">▶</button></div>`;
      });
      parent.children[index] = { type: 'html', value: `<div class="jex">${items.join('')}</div>` };
    });
  };
}
