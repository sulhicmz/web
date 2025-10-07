// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: import.meta.env.PUBLIC_SITE_URL || "https://astropro.digital",
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/portal') && !page.includes('/api'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    })
  ],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    imageService: "compile",
  }),
  vite: {
    define: {
      'import.meta.env.PUBLIC_SITE_URL': JSON.stringify(import.meta.env.PUBLIC_SITE_URL || 'https://astropro.digital'),
    },
    ssr: {
      external: ['@supabase/supabase-js', 'node:crypto'],
    },
  },
  output: 'server',
  build: {
    assets: '_astro',
  },
  server: {
    port: 4321,
    host: true,
  },
});
