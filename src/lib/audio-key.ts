// 文本 → 音频文件名。生成脚本和浏览器用同一个函数，所以不需要清单文件。
export const normalizeSpeech = (t: string) => t.normalize('NFC').replace(/\s+/g, ' ').trim();

/** cyrb53：53 位字符串哈希，输出 16 位十六进制 */
export function audioKey(text: string): string {
  const s = normalizeSpeech(text);
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507); h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507); h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}
