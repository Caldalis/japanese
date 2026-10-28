// 把 Markdown 里的 ```ja 代码块变成带朗读按钮的例句卡，把含日语的行内反引号变成可点读的词块。
import { esc, isJaChip, parseJaBlock, renderJa, speechKana, speechText } from './ja-text.mjs';

function walk(node, fn) {
  if (!node.children) return;
  node.children.forEach((child, i) => { fn(child, i, node); walk(child, fn); });
}

export default function remarkJa() {
  return (tree) => {
    walk(tree, (node, index, parent) => {
      if (node.type === 'code' && node.lang === 'ja') {
        const items = parseJaBlock(node.value).map(({ ja, ro, zh }) =>
          `<div class="it"><div><div class="ja" lang="ja">${renderJa(ja)}</div>` +
          (ro ? `<div class="ro">${esc(ro)}</div>` : '') + (zh ? `<div class="zh">${esc(zh)}</div>` : '') +
          `</div><button type="button" class="play" data-say="${esc(speechText(ja))}" aria-label="朗读">▶</button></div>`);
        parent.children[index] = { type: 'html', value: `<div class="jex">${items.join('')}</div>` };
      } else if (node.type === 'inlineCode' && isJaChip(node.value)) {
        parent.children[index] = { type: 'html', value: `<button type="button" class="jw" lang="ja" data-say="${esc(speechKana(node.value))}">${renderJa(node.value)}</button>` };
      }
    });
  };
}
