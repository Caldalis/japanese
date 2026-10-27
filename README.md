# 日语笔记

给中文母语者的日语学习站。从五十音的汉字字源开始：平假名是汉字草书，片假名是汉字偏旁，你已经认识全部原材料。

在线地址：https://caldalis.github.io/japanese/

## 现在有什么

- **五十音**：46 个清音的字源、读音、记法；浊音、拗音、长音、促音；14 组易混字对比；随机测验和错题重练。
- **朗读**：用手机系统自带的日语语音，不需要联网和音频文件。
- **语法**：按学习路线排列，第 1 到 3 单元共 10 条入门语法。每条有规则表、可朗读的例句（带振假名）、中国人易错点和练习。
- **笔记**：假名的来历、怎么练才快。
- 手机优先，支持深色模式，可加到主屏幕。

## 路线图

- [ ] 词汇：N5 词表按主题分，闪卡加间隔重复，进度存本机
- [x] 语法：一条语法一页 Markdown，带例句和朗读
- [ ] 语法：第 3 到 6 单元（形容词连接、动词变形、复句、授受）
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
| 加一条语法 | 在 `src/content/grammar/` 新建 `.md`，见下面的写法 |
| 语法单元的名字和规划 | `src/data/grammar.ts` |
| 加一篇笔记 | 在 `src/content/notes/` 新建 `.md`，写好 frontmatter（title、description、order、updated、tags） |
| 站名、口号、仓库地址 | `src/site.ts` |
| 颜色、字体 | `src/styles/global.css` 顶部的 token |

### 写一条语法

新建 `src/content/grammar/xxx.md`，文件名就是网址。开头的 frontmatter：

```yaml
---
title: を・に・へ・で：动作句的四个标签   # 页面标题
pattern: N を V / N に V                  # 句型，大字显示
description: 一句话说明这条讲什么
level: N5                                # N5 到 N1
stage: 2                                 # 属于第几单元，见 src/data/grammar.ts
order: 4                                 # 单元内的顺序
updated: 2026-10-27
tags: [助词を, 助词に]
---
```

正文是普通 Markdown，另外有三个约定：

1. **例句卡**：用 ```` ```ja ```` 代码块写，每个例句一组，组之间空一行。第一行日语，后面可以跟罗马字（纯英文字母）和中文翻译，顺序随意。构建时会变成带朗读按钮的卡片。
2. **振假名**：日语里写 `漢字(かな)`，比如 `学生(がくせい)`，显示成注音，朗读时按假名读。
3. **高亮语法点**：日语里用 `**〜**` 包住要强调的部分。

```` markdown
```ja
私(わたし)は 学生(がくせい)**です**。
watashi wa gakusei desu
我是学生。

田中(たなか)さんは 先生(せんせい)ですか。
田中先生是老师吗？
```
````

正文里的行内反引号 `` `は` `` 约定为日语词或语法点，会用假名字体和藍色底显示。练习答案放在 `<details><summary>答案</summary>` 里，前后各空一行。

内容有错或想补充，欢迎提 Issue 或 PR。

## 技术栈

Astro 7 静态站点，交互部分是 React 岛屿，样式用 Tailwind 4 加自定义设计 token，TypeScript。

## 许可

MIT
