// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';
import remarkJa from './plugins/remark-ja.mjs';

// 部署到 GitHub Pages 的项目站点：https://caldalis.github.io/japanese/
export default defineConfig({
  site: 'https://caldalis.github.io',
  base: '/japanese',
  trailingSlash: 'always',
  integrations: [react()],
  // Astro 7 默认用 Sätteri 处理 Markdown；要跑 remark 插件（例句卡）就换回 unified 流水线
  markdown: { processor: unified({ remarkPlugins: [remarkJa] }) },
  vite: { plugins: [tailwindcss()] },
});
