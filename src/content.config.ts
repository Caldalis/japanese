import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 笔记：src/content/notes/ 下每个 .md 文件是一页，文件名就是网址
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().default(99),
    updated: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});

// 语法：src/content/grammar/ 下每个 .md 文件是一条语法，按 stage 和 order 排成学习路线
const grammar = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/grammar' }),
  schema: z.object({
    title: z.string(),
    pattern: z.string(),
    description: z.string(),
    level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).default('N5'),
    stage: z.number(),
    order: z.number(),
    updated: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { notes, grammar };
