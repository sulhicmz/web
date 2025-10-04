// Folder Structure
// src/content/
//   blog/
//     yyyy-mm-dd-slug.mdx
//   docs/
//     getting-started.mdx
//   case-studies/
//     brandname-success.mdx
//   tutorials/
//     onboarding-video.mdx

import { defineCollection, z } from 'astro:content';

const seoFields = {
  title: z.string(),
  description: z.string().min(50),
  ogImage: z.string().optional(),
  tags: z.array(z.string()).default([])
};

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    ...seoFields,
    publishDate: z.string().transform((str) => new Date(str)),
    author: z.string(),
    readingTime: z.number().optional(),
    status: z.enum(['draft','published']).default('published')
  })
});

const docs = defineCollection({
  type: 'content',
  schema: z.object({
    ...seoFields,
    order: z.number().default(0),
    category: z.string(),
    audience: z.enum(['developer','client']).default('client'),
    toc: z.boolean().default(true)
  })
});

const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    ...seoFields,
    client: z.string(),
    industry: z.string(),
    metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    launchDate: z.string().optional()
  })
});

const tutorials = defineCollection({
  type: 'content',
  schema: z.object({
    ...seoFields,
    difficulty: z.enum(['beginner','intermediate','advanced']).default('beginner'),
    durationMinutes: z.number().optional(),
    videoUrl: z.string().url().optional(),
    steps: z.array(z.object({ title: z.string(), body: z.string() })).default([])
  })
});

export const collections = { blog, docs, 'case-studies': caseStudies, tutorials };

// Konvensi Penamaan
// - Gunakan slug lowercase dengan kata dipisah '-', sertakan tanggal utk blog.
// - MDX frontmatter wajib mengikuti schema; `toc` memicu generasi daftar isi otomatis.
// - Pagefind: jalankan `pnpm run pagefind` pasca build, index folder `dist`.
