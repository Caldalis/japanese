// 扫描站内所有要朗读的日语，为还没有音频的文本生成 mp3 到 public/audio/。
//   pnpm audio          生成缺的
//   pnpm audio --check  只列出缺的，不生成
//   pnpm audio --prune  顺便删掉已经没人用的音频
//   pnpm audio --kana   重新生成全部单个假名和整行连读（单字从整行里切出来，见下）
// 文件名是文本的哈希（src/lib/audio-key.ts），浏览器用同一函数定位文件，不需要清单。
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
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

// 假名行：单个假名的音频从整行连读里切出来。单独合成一个假名时语音引擎会用感叹的语调读，
// 音高和长度都不对；放在一行里读就自然，切出来的单字和整行听到的也完全一致。
const KANA_ROWS = [];
for (const row of SEION) KANA_ROWS.push(row.items.filter(Boolean).map((it) => it.kata));
for (const [, , k] of DAKU) KANA_ROWS.push([...k]);
for (const [, , k] of YOON) KANA_ROWS.push(k.split(' '));
const KANA_SINGLES = new Set(KANA_ROWS.flat());
for (const members of KANA_ROWS) { members.forEach(add); add(members.join('、')); }
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
if (args.has('--kana')) for (const members of KANA_ROWS) for (const t of [...members, members.join('、')]) have.delete(audioKey(t));
const missing = [...texts].filter(([k]) => !have.has(k));
const stale = [...have].filter((k) => !texts.has(k));
console.log(`文本 ${texts.size} 条，已有 ${have.size} 个，缺 ${missing.length} 个，多余 ${stale.length} 个`);

if (args.has('--prune')) for (const k of stale) fs.unlinkSync(path.join(OUT, k + '.mp3'));
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(Object.fromEntries([...texts].sort()), null, 1) + '\n');
if (args.has('--check') || missing.length === 0) process.exit(0);

// 3. 生成
const tts = new MsEdgeTTS({ connectionTimeoutMs: 15000, synthesisTimeoutMs: 30000 });
await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3, { wordBoundaryEnabled: true });
const escXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let ok = 0, failed = 0;

const hasFfmpeg = (() => { try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; } })();
const missingKeys = new Set(missing.map(([k]) => k));

/** 合成一段并同时拿到每个“词”的时间边界 */
function synth(text) {
  return new Promise((resolve, reject) => {
    const { audioStream, metadataStream } = tts.toStream(escXml(text), { rate: RATE });
    const chunks = [], meta = [];
    metadataStream?.on('data', (d) => meta.push(d.toString()));
    audioStream.on('error', reject);
    audioStream.on('data', (c) => chunks.push(c));
    audioStream.on('end', () => {
      const words = meta.flatMap((m) => { try { return JSON.parse(m).Metadata; } catch { return []; } })
        .filter((x) => x.Type === 'WordBoundary')
        .map((x) => ({ text: x.Data.text.Text, start: x.Data.Offset / 1e7, dur: x.Data.Duration / 1e7 }));
      resolve({ audio: Buffer.concat(chunks), words });
    });
  });
}

// 3a. 假名行：整行合成一次，再把每个字切出来
if (hasFfmpeg) {
  for (const members of KANA_ROWS) {
    const rowText = members.join('、');
    const needRow = missingKeys.has(audioKey(rowText));
    const needSingles = members.filter((m) => missingKeys.has(audioKey(m)));
    if (!needRow && needSingles.length === 0) continue;
    try {
      const { audio, words } = await synth(rowText);
      const rowFile = path.join(OUT, audioKey(rowText) + '.mp3');
      fs.writeFileSync(rowFile, audio);
      if (members.length === 1) { missingKeys.delete(audioKey(rowText)); ok++; continue; } // 只有一个字的行（ン），整行就是单字
      if (words.length !== members.length || words.some((w, i) => w.text !== members[i])) throw new Error(`字边界不匹配：${rowText} → ${words.map((w) => w.text).join(' ')}`);
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kana-'));
      for (let i = 0; i < members.length; i++) {
        const w = words[i], next = words[i + 1];
        const start = Math.max(0, w.start - 0.1);
        const end = next ? Math.min(w.start + w.dur + 0.25, next.start - 0.03) : w.start + w.dur + 0.3;
        const len = end - start;
        const out = path.join(OUT, audioKey(members[i]) + '.mp3');
        // 用 atrim 截取并把时间戳归零，再淡入淡出。不能用 -ss，否则淡出滤镜按原文件的时间算，后面的字会被淡成静音
        execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', rowFile,
          '-af', `atrim=start=${start.toFixed(3)}:end=${end.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st=${(len - 0.04).toFixed(3)}:d=0.04`,
          '-codec:a', 'libmp3lame', '-b:a', '48k', '-ar', '24000', out]);
      }
      fs.rmSync(tmp, { recursive: true, force: true });
      for (const t of [rowText, ...members]) missingKeys.delete(audioKey(t));
      ok += 1 + needSingles.length;
      process.stdout.write(`\r假名行 ${rowText}`.padEnd(60));
    } catch (e) {
      console.error(`\n假名行失败，退回逐字合成：${rowText}  ${e.message}`);
    }
  }
} else if (missing.some(([k, t]) => KANA_SINGLES.has(t))) {
  console.warn('没有 ffmpeg，单个假名将逐字合成，语调可能不自然');
}

for (const [key, text] of missing) {
  if (!missingKeys.has(key)) continue;
  const target = path.join(OUT, key + '.mp3');
  const tmp = target + '.part';
  try {
    const { audio } = await synth(text);
    fs.writeFileSync(tmp, audio);
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
