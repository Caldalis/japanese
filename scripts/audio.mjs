// 扫描站内所有要朗读的日语，为还没有音频的文本生成 mp3 到 public/audio/。
//   pnpm audio          生成缺的
//   pnpm audio --check  只列出缺的，不生成
//   pnpm audio --prune  顺便删掉已经没人用的音频
// 文件名是文本的哈希（src/lib/audio-key.ts），浏览器用同一函数定位文件，不需要清单。
import fs from 'node:fs';
import path from 'node:path';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { audioKey, normalizeSpeech } from '../src/lib/audio-key.ts';
import { CHOON, DAKU, SEION, YOON } from '../src/data/kana.ts';
import { isJaChip, parseJaBlock, speechKana, speechText } from '../plugins/ja-text.mjs';

const VOICE = 'ja-JP-NanamiNeural';
const RATE = '-10%';
const OUT = path.resolve('public/audio');
const args = new Set(process.argv.slice(2));

// 1. 收集文本
const texts = new Map(); // key → text
const add = (t) => { const n = normalizeSpeech(t); if (n) texts.set(audioKey(n), n); };

for (const row of SEION) {
  const items = row.items.filter(Boolean);
  items.forEach((it) => add(it.kata));
  add(items.map((it) => it.kata).join('、'));
}
for (const [, , k] of DAKU) { [...k].forEach(add); add([...k].join('、')); }
for (const [, , k] of YOON) { const ks = k.split(' '); ks.forEach(add); add(ks.join('、')); }
for (const rule of CHOON) rule.examples.forEach((e) => add(e.word));

// 词汇：每个词的读音和例句
const vocabDir = 'src/data/vocab';
if (fs.existsSync(vocabDir)) for (const f of fs.readdirSync(vocabDir).filter((f) => f.endsWith('.json'))) {
  const deck = JSON.parse(fs.readFileSync(path.join(vocabDir, f), 'utf8'));
  for (const [, kana, , , example] of deck.words) { add(kana); if (example) add(speechText(example.split('|')[0])); }
}

const mdFiles = ['src/content/grammar', 'src/content/notes'].flatMap((dir) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => path.join(dir, f)) : []);
for (const file of mdFiles) {
  const body = fs.readFileSync(file, 'utf8').replace(/^---[\s\S]*?---/, '');
  for (const m of body.matchAll(/```ja\n([\s\S]*?)```/g)) parseJaBlock(m[1]).forEach(({ ja }) => add(speechText(ja)));
  const noBlocks = body.replace(/```[\s\S]*?```/g, '');
  for (const m of noBlocks.matchAll(/`([^`\n]+)`/g)) if (isJaChip(m[1])) add(speechKana(m[1]));
}

// 2. 对比已有文件
fs.mkdirSync(OUT, { recursive: true });
const have = new Set(fs.readdirSync(OUT).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)));
const missing = [...texts].filter(([k]) => !have.has(k));
const stale = [...have].filter((k) => !texts.has(k));
console.log(`文本 ${texts.size} 条，已有 ${have.size} 个，缺 ${missing.length} 个，多余 ${stale.length} 个`);

if (args.has('--prune')) for (const k of stale) fs.unlinkSync(path.join(OUT, k + '.mp3'));
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(Object.fromEntries([...texts].sort()), null, 1) + '\n');
if (args.has('--check') || missing.length === 0) process.exit(0);

// 3. 生成
const tts = new MsEdgeTTS({ connectionTimeoutMs: 15000, synthesisTimeoutMs: 30000 });
await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
const escXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let ok = 0, failed = 0;
for (const [key, text] of missing) {
  const target = path.join(OUT, key + '.mp3');
  const tmp = target + '.part';
  try {
    await new Promise((resolve, reject) => {
      const { audioStream } = tts.toStream(escXml(text), { rate: RATE });
      const out = fs.createWriteStream(tmp);
      audioStream.on('error', reject);
      out.on('error', reject);
      out.on('finish', resolve);
      audioStream.pipe(out);
    });
    if (fs.statSync(tmp).size < 1000) throw new Error('empty audio');
    fs.renameSync(tmp, target);
    ok++;
    process.stdout.write(`\r生成 ${ok}/${missing.length}  ${text.slice(0, 24)}`.padEnd(60));
  } catch (e) {
    failed++;
    try { fs.unlinkSync(tmp); } catch {}
    console.error(`\n失败：${text}  ${e.message}`);
  }
}
tts.close();
console.log(`\n完成：生成 ${ok} 个，失败 ${failed} 个`);
