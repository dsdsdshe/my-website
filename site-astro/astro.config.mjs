import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://mindquantum.org',
  integrations: [
    starlight({
      title: 'MindQuantum',
      // Load our custom tokens/styles for consistent theming
      customCss: [
        './src/styles/tokens.css',
        './src/styles/starlight.css'
      ],
      locales: {
        root: { label: 'English', lang: 'en' },
        zh: { label: '简体中文', lang: 'zh-CN' }
      },
      sidebar: [
        { label: 'Introduction', translations: { zh: '简介' }, slug: 'intro' },
        { label: 'Tutorials', translations: { zh: '教程' }, slug: 'tutorials/overview' }
      ]
    })
  ]
});
