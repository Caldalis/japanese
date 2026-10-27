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

export const collections = { notes };
