// 假名数据。改这里就能改网格、字源卡和测验。
export interface KanaItem {
  hira: string;
  kata: string;
  romaji: string;
  hiraSrc: string; // 平假名源字（草书）
  kataSrc: string; // 片假名源字
  kataPart: string; // 片假名取了源字哪一块
  tip: string; // 记法
  row: string;
}
export interface KanaRow {
  name: string;
  consonant: string;
  items: (KanaItem | null)[];
}

type T = [string, string, string, string, string, string, string];
const raw: [string, string, (T | null)[]][] = [
  ['あ行', '', [
    ['あ', 'ア', 'a', '安', '阿', '左耳旁 阝', '安：宀变成十字，女变成圈；ア 就是 阝'],
    ['い', 'イ', 'i', '以', '伊', '单人旁 亻', '以 的左右两半就是 い 的两笔；イ 就是 亻'],
    ['う', 'ウ', 'u', '宇', '宇', '宝盖头 宀', '宀 的那一点保留在 う ウ 头上'],
    ['え', 'エ', 'e', '衣', '江', '右边的 工', 'エ 就是工；江 训读 e，入江 irie'],
    ['お', 'オ', 'o', '於', '於', '左边的 方', 'お 左边竖加圈是方，右边一点是另一半'],
  ]],
  ['か行', 'k', [
    ['か', 'カ', 'ka', '加', '加', '左边的 力', '两个都是加：か 是力加一点，カ 就是力'],
    ['き', 'キ', 'ki', '幾', '幾', '中段', '两横一竖，都保留了幾的中段'],
    ['く', 'ク', 'ku', '久', '久', '左上一撇', '久 的第一撇'],
    ['け', 'ケ', 'ke', '計', '介', '整个 介', 'け 左竖是言，右边是十；介 吴音读 ke'],
    ['こ', 'コ', 'ko', '己', '己', '上半', '己 去掉最后一笔'],
  ]],
  ['さ行', 's', [
    ['さ', 'サ', 'sa', '左', '散', '艹 头', '左 快写'],
    ['し', 'シ', 'shi', '之', '之', '整个 之', '之 一笔到底是 し，之 的三个点是 シ'],
    ['す', 'ス', 'su', '寸', '須', '右半 頁 的省写', '寸 的竖钩带点，连笔成圈'],
    ['せ', 'セ', 'se', '世', '世', '整个 世', '两个都一眼是世'],
    ['そ', 'ソ', 'so', '曽', '曽', '顶上的 丷', 'ソ 是曽头上两点，所以点是竖的'],
  ]],
  ['た行', 't', [
    ['た', 'タ', 'ta', '太', '多', '上半的 夕', 'た 左边是大的横撇，右边是点；タ 就是夕'],
    ['ち', 'チ', 'chi', '知', '千', '整个 千', 'ち 的圈是知右边的口；千 训读 chi，千葉 Chiba'],
    ['つ', 'ツ', 'tsu', '川', '川', '三竖', '川 三竖连写是 つ；ツ 三个竖点就是川'],
    ['て', 'テ', 'te', '天', '天', '上半', '天 一笔写成 て；テ 保留天的两横'],
    ['と', 'ト', 'to', '止', '止', '右半的 卜', '止まる tomaru；ト 就是卜'],
  ]],
  ['な行', 'n', [
    ['な', 'ナ', 'na', '奈', '奈', '上面的 大', 'な 上面十字是大，下面圈是示；奈良 なら'],
    ['に', 'ニ', 'ni', '仁', '仁', '右边的 二', 'に 就是 亻 加二，一眼可见'],
    ['ぬ', 'ヌ', 'nu', '奴', '奴', '右边的 又', 'ぬ 是 め 加一个圈，圈就是又；ヌ 就是又'],
    ['ね', 'ネ', 'ne', '祢', '祢', '左边的 礻', 'ネ 就是 礻；ね 的圈是尔的下半'],
    ['の', 'ノ', 'no', '乃', '乃', '第一撇', '乃 草书就是 の；ノ 就是 丿'],
  ]],
  ['は行', 'h', [
    ['は', 'ハ', 'ha', '波', '八', '整个 八', 'は 左竖是氵，右边圈是皮；ハ 就是八'],
    ['ひ', 'ヒ', 'hi', '比', '比', '右边的 匕', '比 的两个匕连写；ヒ 就是匕'],
    ['ふ', 'フ', 'fu', '不', '不', '头两笔', '不 快写散成点'],
    ['へ', 'ヘ', 'he', '部', '部', '右边的 阝', '部屋 heya；へ ヘ 同形，白送一个'],
    ['ほ', 'ホ', 'ho', '保', '保', '下面的 木', 'ほ 比 は 多一横，是保的口；ホ 就是木'],
  ]],
  ['ま行', 'm', [
    ['ま', 'マ', 'ma', '末', '末', '上半', '末 两横一竖，竖带圈'],
    ['み', 'ミ', 'mi', '美', '三', '整个 三', 'ミ 是斜写的三，三つ mittsu'],
    ['む', 'ム', 'mu', '武', '牟', '上面的 厶', 'ム 就是 厶'],
    ['め', 'メ', 'me', '女', '女', '交叉的两笔', '女 草书就是 め，乙女 otome；メ 是女的叉'],
    ['も', 'モ', 'mo', '毛', '毛', '整个 毛', '两个都一眼是毛'],
  ]],
  ['や行', 'y', [
    ['や', 'ヤ', 'ya', '也', '也', '整个 也', '两个都一眼是也'], null,
    ['ゆ', 'ユ', 'yu', '由', '由', '一角', '由 快写'], null,
    ['よ', 'ヨ', 'yo', '与', '與', '右半', '与 快写，よ 很像'],
  ]],
  ['ら行', 'r', [
    ['ら', 'ラ', 'ra', '良', '良', '上两笔', 'ら 头上的点是良的点；奈良 なら'],
    ['り', 'リ', 'ri', '利', '利', '右边的 刂', '两个都是立刀旁'],
    ['る', 'ル', 'ru', '留', '流', '右下', 'る 末尾的圈是留的田'],
    ['れ', 'レ', 're', '礼', '礼', '右边的 乚', 'れ 是 礻 加 乚；レ 就是 乚'],
    ['ろ', 'ロ', 'ro', '呂', '呂', '上面的 口', 'ろ 是两个口连写，无圈；ロ 就是口'],
  ]],
  ['わ行', 'w', [
    ['わ', 'ワ', 'wa', '和', '和', '右边的 口', 'わ 左竖是禾，圈是口；ワ 比 ウ 少一点'], null, null, null,
    ['を', 'ヲ', 'o', '遠', '乎', '整个 乎', '只当助词用，读 o'],
  ]],
  ['ん', '', [
    ['ん', 'ン', 'n', '无', '尓', '说法不一', '无 mu 变 n；ン 最后一笔从下往上挑'], null, null, null, null,
  ]],
];

export const SEION: KanaRow[] = raw.map(([name, consonant, items]) => ({
  name,
  consonant,
  items: items.map((t) =>
    t ? { hira: t[0], kata: t[1], romaji: t[2], hiraSrc: t[3], kataSrc: t[4], kataPart: t[5], tip: t[6], row: name } : null,
  ),
}));

export const SEION_FLAT: KanaItem[] = SEION.flatMap((r) => r.items).filter((x): x is KanaItem => !!x);

/** 浊音、半浊音：[说明, 平假名, 片假名, 罗马字] */
export const DAKU: [string, string, string, string][] = [
  ['か→が', 'がぎぐげご', 'ガギグゲゴ', 'ga gi gu ge go'],
  ['さ→ざ', 'ざじずぜぞ', 'ザジズゼゾ', 'za ji zu ze zo'],
  ['た→だ', 'だぢづでど', 'ダヂヅデド', 'da ji zu de do'],
  ['は→ば', 'ばびぶべぼ', 'バビブベボ', 'ba bi bu be bo'],
  ['は→ぱ', 'ぱぴぷぺぽ', 'パピプペポ', 'pa pi pu pe po'],
];

/** 拗音：[行头, 平假名, 片假名, 罗马字]，空格分隔 */
export const YOON: [string, string, string, string][] = [
  ['き', 'きゃ きゅ きょ', 'キャ キュ キョ', 'kya kyu kyo'],
  ['し', 'しゃ しゅ しょ', 'シャ シュ ショ', 'sha shu sho'],
  ['ち', 'ちゃ ちゅ ちょ', 'チャ チュ チョ', 'cha chu cho'],
  ['に', 'にゃ にゅ にょ', 'ニャ ニュ ニョ', 'nya nyu nyo'],
  ['ひ', 'ひゃ ひゅ ひょ', 'ヒャ ヒュ ヒョ', 'hya hyu hyo'],
  ['み', 'みゃ みゅ みょ', 'ミャ ミュ ミョ', 'mya myu myo'],
  ['り', 'りゃ りゅ りょ', 'リャ リュ リョ', 'rya ryu ryo'],
  ['ぎ', 'ぎゃ ぎゅ ぎょ', 'ギャ ギュ ギョ', 'gya gyu gyo'],
  ['じ', 'じゃ じゅ じょ', 'ジャ ジュ ジョ', 'ja ju jo'],
  ['び', 'びゃ びゅ びょ', 'ビャ ビュ ビョ', 'bya byu byo'],
  ['ぴ', 'ぴゃ ぴゅ ぴょ', 'ピャ ピュ ピョ', 'pya pyu pyo'],
];

export interface Example { word: string; romaji: string; meaning: string }
export interface ChoonRule { title: string; note: string; examples: Example[] }
const ex = (s: string): Example[] =>
  s.split('|').map((e) => { const [word, romaji, meaning] = e.split(' '); return { word, romaji, meaning }; });

/** 长音、促音、长短对比 */
export const CHOON: ChoonRule[] = [
  { title: 'あ段 + あ', note: '拖长 a。', examples: ex('おかあさん okaasan 妈妈|おばあさん obaasan 奶奶') },
  { title: 'い段 + い', note: '拖长 i。', examples: ex('おにいさん oniisan 哥哥|ちいさい chiisai 小的') },
  { title: 'う段 + う', note: '拖长 u。', examples: ex('くうき kuuki 空气|ゆうき yuuki 勇气') },
  { title: 'え段 + い', note: '拖长 e，写 い 不写 え，最常见。少数词写 え。', examples: ex('せんせい sensei 老师|えいが eiga 电影|とけい tokei 钟表|おねえさん oneesan 姐姐') },
  { title: 'お段 + う', note: '拖长 o，写 う 不写 お，最常见。少数固有词写 お。', examples: ex('おとうさん otousan 爸爸|がっこう gakkou 学校|ありがとう arigatou 谢谢|おおきい ookii 大的|とおい tooi 远的|こおり koori 冰') },
  { title: '片假名一律用 ー', note: '横线就是拖长前一个元音。', examples: ex('コーヒー koohii 咖啡|ケーキ keeki 蛋糕|スーパー suupaa 超市|ノート nooto 笔记本|メール meeru 邮件') },
  { title: '促音 っ', note: '小写的 っ 不发音，停顿一拍，后面的辅音读得紧。', examples: ex('きって kitte 邮票|ざっし zasshi 杂志|きっぷ kippu 车票|カップ kappu 杯子|サッカー sakkaa 足球') },
  { title: '长短对比', note: '拍数不同，词就不同。', examples: ex('おばさん obasan 阿姨|おばあさん obaasan 奶奶|おじさん ojisan 叔叔|おじいさん ojiisan 爷爷|ゆき yuki 雪|ゆうき yuuki 勇气|きて kite 来|きって kitte 邮票|ここ koko 这里|こうこう koukou 高中') },
];

/** 易混组：[假名串, 说明] */
export const MIX: [string, string][] = [
  ['シツソン', 'ツ ソ 来自 川 和 曽，点是竖的，最后一笔从上往下撇。シ ン 来自 之 和 尓，点偏横，最后一笔从下往上挑。'],
  ['ぬめ', 'ぬ 来自奴，末尾多个圈，圈就是又。め 来自女，没圈。'],
  ['ねれわ', '都是左边一竖加右边。ね 的 礻 底下绕圈，れ 的 乚 向右甩出不绕圈，わ 的口收成大圆。'],
  ['はほ', 'ほ 来自保，多一横，是保的口。'],
  ['るろ', 'る 来自留，结尾有圈，是田。ろ 来自呂，没圈。'],
  ['さきち', 'き 来自幾，两横；さ 来自左，一横；ち 来自知，是 さ 的镜像，圈是知右边的口。'],
  ['クケタ', 'タ 是夕，里面有点。ク 是久的撇，无点。ケ 是介，多一横。'],
  ['チテ', 'チ 是千，一横。テ 是天，两横。'],
  ['ウワ', 'ウ 是 宀，有点。ワ 是口，无点。'],
  ['ナメ', 'ナ 是奈上面的大，横加撇。メ 是女的两笔交叉。'],
  ['スヌ', 'ヌ 是奴的又，比 ス 多一笔。'],
  ['コユ', 'コ 是己的上半。ユ 是由，底下一横出头。'],
  ['あお', 'あ 的圈从竖中间穿过。お 的圈在竖的底部，右上多一点。'],
  ['いり', 'い 来自以，两笔短而分开。り 来自利，右笔长长拖下。'],
];

/** 查表：任意假名 → 条目 / 罗马字 */
export const INFO: Record<string, KanaItem> = {};
export const ROMA: Record<string, string> = {};
for (const it of SEION_FLAT) { INFO[it.hira] = it; INFO[it.kata] = it; ROMA[it.hira] = it.romaji; ROMA[it.kata] = it.romaji; }
for (const [, h, k, r] of DAKU) { const rs = r.split(' '); [...h].forEach((c, i) => (ROMA[c] = rs[i])); [...k].forEach((c, i) => (ROMA[c] = rs[i])); }
for (const [, h, k, r] of YOON) { const rs = r.split(' '); h.split(' ').forEach((c, i) => (ROMA[c] = rs[i])); k.split(' ').forEach((c, i) => (ROMA[c] = rs[i])); }

export const isHira = (s: string) => /[぀-ゟ]/.test(s);
export const toKata = (s: string) => s.replace(/[ぁ-ゖ]/g, (x) => String.fromCharCode(x.charCodeAt(0) + 0x60));

/** 测验答错时显示的字源一句话 */
export function originLine(c: string): string {
  const o = INFO[c];
  if (o) return isHira(c) ? `${o.hira} ← ${o.hiraSrc} 的草书。${o.tip}` : `${o.kata} ← ${o.kataSrc} 的${o.kataPart}。${o.tip}`;
  if (c.length === 2) return `${c[0]} 加小写 ${c[1]}，合读一拍。`;
  const p = 'ぱぴぷぺぽパピプペポ'.includes(c);
  const b = String.fromCharCode(c.charCodeAt(0) - (p ? 2 : 1));
  const bo = INFO[b];
  return `${b} 加${p ? '半浊点 ゜' : '浊点 ゛'}。${b} ← ${bo ? (isHira(b) ? bo.hiraSrc : bo.kataSrc) : ''}`;
}
