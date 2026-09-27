import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** One MDX file per article per language: `src/content/lab/<locale>/<slug>.mdx`. */
const lab = defineCollection({
  loader: glob({ pattern: '*/*.mdx', base: './src/content/lab' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    emoji: z.string(),
    tags: z.array(z.string()),
  }),
});

export const collections = { lab };
