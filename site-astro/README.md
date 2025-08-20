# MindQuantum Next-Gen Site (Astro + Starlight)

This is a fresh implementation of the MindQuantum website and docs with Astro + Starlight. It unifies the homepage and documentation under one design system and modern tooling, while allowing us to ingest tutorials from the MindSpore/docs repository.

## Why this approach
- Consistent styling and UX across home + docs (single theme).
- Markdown/MDX content with component slots for richer tutorials.
- Built-in i18n (English + Chinese) and clean URL structure: `/docs/` and `/docs/zh/`.
- Extensible for search, versioning, analytics, and previews.
- Lightweight, fast builds, easy customization.

## Structure
- `src/pages/`: custom pages (homepage at `/`).
- `src/content/docs/`: docs content powered by Starlight.
  - English root at `/docs/…`
  - Chinese under `/docs/zh/…`
- `src/styles/`: design tokens and Starlight tweaks.
- `scripts/sync-tutorials.mjs`: copy tutorials from the MindSpore/docs repo.

## Getting started
Prerequisites: Node.js 18+

Install and run:

```bash
npm install
npm run dev
```

Build and preview production:

```bash
npm run build
npm run preview
```

## Ingest tutorials from MindSpore/docs
Point the sync script at a local path containing tutorial sources. It copies Markdown as-is and creates placeholders for `.rst` files (convert with pandoc if needed):

```bash
# English
node scripts/sync-tutorials.mjs --src /path/to/docs/tutorials --lang en

# Chinese
node scripts/sync-tutorials.mjs --src /path/to/docs/tutorials_zh --lang zh
```

You can clear previously synced files (except the section overview) with `--clear`.

Environment variable form:

```bash
MQ_TUTORIALS_SRC=/path/to/dir MQ_TUTORIALS_LANG=zh npm run sync:tutorials
```

## Theming
Design tokens live in `src/styles/tokens.css` and are applied globally, including Starlight via `customCss`. The homepage uses the same variables for perfect visual alignment.

## Next steps
- Wire search (e.g., Pagefind) and analytics (privacy-friendly) if desired.
- Add versioning for docs if needed (can be handled by directory scheme or a plugin later).
- Enhance `sync-tutorials.mjs` to auto-convert `.rst` using pandoc when present.
- Port existing content from the Eleventy site into Astro or retire the old path when ready.

---

This path is self-contained and does not alter the current Eleventy + Sphinx build. Migrate incrementally and flip over when satisfied.
