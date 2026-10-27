// 站点常量：改名、改口号、换仓库地址都在这里
export const site = {
  name: '日语笔记',
  nameJa: 'にほんごノート',
  tagline: '给中文母语者的日语学习站',
  description: '从五十音的汉字字源开始学日语：读音、字源、浊音拗音长音、易混字对比和随机测验。',
  repo: 'https://github.com/Caldalis/japanese',
  author: 'Caldalis',
};

const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** 拼接带 base 前缀的站内链接：url('/kana/') → '/japanese/kana/' */
export const url = (path = '/') => `${base}/${path.replace(/^\/+/, '')}`;
