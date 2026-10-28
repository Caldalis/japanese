// 朗读：优先播放预生成的 mp3（public/audio/，由 pnpm audio 生成），没有文件时退回系统语音。
import { audioKey, normalizeSpeech } from './audio-key';

const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
let player: HTMLAudioElement | null = null;
let seq = 0;

export function say(text: string) {
  if (typeof window === 'undefined') return;
  const t = normalizeSpeech(text);
  if (!t) return;
  const id = ++seq;
  let fell = false;
  const fallback = () => { if (fell || id !== seq) return; fell = true; speakWithSystemVoice(t); };

  if (!player) { player = new Audio(); player.preload = 'auto'; }
  const p = player;
  try { p.pause(); } catch {}
  try { speechSynthesis.cancel(); } catch {}
  p.onerror = fallback;
  p.src = `${base}/audio/${audioKey(t)}.mp3`;
  p.play().catch(fallback);
}

// 退路：Web Speech API。国产安卓和微信内置浏览器经常没有日语语音，所以只当备用。
let voice: SpeechSynthesisVoice | null = null;
let warned = false;
function pickVoice() {
  try { voice = speechSynthesis.getVoices().find((v) => /^ja/i.test(v.lang)) ?? null; } catch { voice = null; }
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.addEventListener('voiceschanged', pickVoice);
}
function speakWithSystemVoice(t: string) {
  if (!('speechSynthesis' in window)) { toast('这段还没有音频，浏览器也不支持朗读'); return; }
  if (!voice) pickVoice();
  try {
    const u = new SpeechSynthesisUtterance(t);
    u.lang = 'ja-JP';
    if (voice) u.voice = voice;
    u.rate = 0.85;
    speechSynthesis.speak(u);
  } catch {}
  if (!voice && !warned) { warned = true; toast('这段还没有生成音频，系统也没有日语语音'); }
}

let timer: ReturnType<typeof setTimeout> | undefined;
export function toast(message: string) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('on');
  clearTimeout(timer);
  timer = setTimeout(() => el!.classList.remove('on'), 2600);
}
