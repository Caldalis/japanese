// 朗读：用系统自带的日语语音合成，无需联网也无需音频文件
let voice: SpeechSynthesisVoice | null = null;
let warned = false;

function pickVoice() {
  try {
    voice = speechSynthesis.getVoices().find((v) => /^ja/i.test(v.lang)) ?? null;
  } catch {
    voice = null;
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.addEventListener('voiceschanged', pickVoice);
}

export function say(text: string, rate = 0.85) {
  if (typeof window === 'undefined') return;
  if (!('speechSynthesis' in window)) {
    toast('这个浏览器不支持朗读，请看罗马字');
    return;
  }
  if (!voice) pickVoice();
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    if (voice) u.voice = voice;
    u.rate = rate;
    speechSynthesis.speak(u);
  } catch {
    /* 某些内嵌浏览器会抛错，忽略 */
  }
  if (!voice && !warned) {
    warned = true;
    toast('没找到日语语音，读音可能不准。安装方法见“笔记”里的学习方法');
  }
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
