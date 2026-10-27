// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// 部署到 GitHub Pages 的项目站点：https://caldalis.github.io/japanese/
export default defineConfig({
  site: 'https://caldalis.github.io',
  base: '/japanese',
  trailingSlash: 'always',
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
