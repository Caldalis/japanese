# 日语笔记

给中文母语者的日语学习站。从五十音的汉字字源开始：平假名是汉字草书，片假名是汉字偏旁，你已经认识全部原材料。

在线地址：https://caldalis.github.io/japanese/

## 现在有什么

- **五十音**：46 个清音的字源、读音、记法；浊音、拗音、长音、促音；14 组易混字对比；随机测验和错题重练。
- **朗读**：用手机系统自带的日语语音，不需要联网和音频文件。
- **笔记**：假名的来历、怎么练才快。
- 手机优先，支持深色模式，可加到主屏幕。

## 路线图

- [ ] 词汇：N5 词表按主题分，闪卡加间隔重复，进度存本机
- [ ] 语法：一条语法一页 Markdown，带例句和朗读
- [ ] 汉字对照：中日同形词的意思差异
- [ ] PWA 离线使用

## 本地开发

需要 Node 22 以上和 pnpm。

```bash
pnpm install
pnpm dev        # http://localhost:4321/japanese/
pnpm build      # 输出到 dist/
pnpm check      # 类型检查
```

推到 `main` 分支后，GitHub Actions 自动构建并发布到 GitHub Pages。

## 怎么改内容

| 想改什么 | 改哪里 |
|---|---|
| 假名、字源、记法、易混组、长音例词 | `src/data/kana.ts` |
| 加一篇笔记 | 在 `src/content/notes/` 新建 `.md`，写好 frontmatter（title、description、order、updated、tags） |
| 站名、口号、仓库地址 | `src/site.ts` |
| 颜色、字体 | `src/styles/global.css` 顶部的 token |

内容有错或想补充，欢迎提 Issue 或 PR。

## 技术栈

Astro 7 静态站点，交互部分是 React 岛屿，样式用 Tailwind 4 加自定义设计 token，TypeScript。

## 许可

MIT
