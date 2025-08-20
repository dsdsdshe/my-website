import { defineCollection } from 'astro:content';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
  // Starlight docs collection
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  // Optional: UI translations via content files
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};

