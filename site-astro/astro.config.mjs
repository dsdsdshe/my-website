import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';

// Mount Starlight (docs) at /docs, keep custom pages at /
export default defineConfig({
  site: 'https://mindquantum.org',
  integrations: [
    mdx(),
    starlight({
      title: 'MindQuantum',
      base: '/docs',
      // Load our custom tokens/styles for consistent theming
      customCss: [
        './src/styles/tokens.css',
        './src/styles/starlight.css'
      ],
      locales: {
        root: { label: 'English', lang: 'en' },
        zh: { label: '简体中文', lang: 'zh-CN' }
      },
      sidebar: {
        root: [
          { label: 'Introduction', link: '/intro' },
          { label: 'Tutorials', link: '/tutorials/overview' }
        ],
        zh: [
          { label: '简介', link: '/zh/intro' },
          { label: '教程', link: '/zh/tutorials/overview' }
        ]
      }
    })
  ]
});

