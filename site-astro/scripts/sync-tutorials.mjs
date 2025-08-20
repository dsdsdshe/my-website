#!/usr/bin/env node
/**
 * Sync tutorials from an external docs repo into Starlight content.
 *
 * Usage:
 *   node scripts/sync-tutorials.mjs --src /path/to/mindspore-docs/tutorials --lang zh
 *   MQ_TUTORIALS_SRC=/path/to/dir MQ_TUTORIALS_LANG=en node scripts/sync-tutorials.mjs
 *
 * Notes:
 * - Copies only Markdown files (.md, .mdx). reStructuredText (.rst) is skipped
 *   with a placeholder file that links to the source.
 * - You can run external conversion (e.g., pandoc) before this script if needed.
 */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

const CWD = new URL('..', import.meta.url).pathname; // site-astro/

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--src') out.src = args[++i];
    else if (a === '--lang') out.lang = args[++i];
    else if (a === '--clear') out.clear = true;
  }
  out.src ||= process.env.MQ_TUTORIALS_SRC;
  out.lang ||= process.env.MQ_TUTORIALS_LANG || 'en';
  if (!out.src) {
    console.error('Missing --src or MQ_TUTORIALS_SRC. Provide a source directory.');
    process.exit(1);
  }
  if (!fs.existsSync(out.src) || !fs.statSync(out.src).isDirectory()) {
    console.error('Source path does not exist or is not a directory:', out.src);
    process.exit(1);
  }
  if (!['en', 'zh'].includes(out.lang)) {
    console.error('Unsupported lang. Use en or zh.');
    process.exit(1);
  }
  return out;
}

function destDirForLang(lang) {
  return path.join(CWD, 'src', 'content', 'docs', lang === 'en' ? '' : lang, 'tutorials');
}

async function ensureDir(p) { await fsp.mkdir(p, { recursive: true }); }

async function* walk(dir) {
  for (const d of await fsp.readdir(dir, { withFileTypes: true })) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else yield entry;
  }
}

function toSlugName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function copyMarkdown(src, dest) {
  const content = await fsp.readFile(src, 'utf8');
  // Ensure frontmatter exists minimally
  const base = path.basename(src);
  const title = toTitle(base.replace(/\.(md|mdx)$/i, ''));
  const withFm = content.startsWith('---') ? content : `---\n# NOTE: synced from ${src}\ntitle: ${title}\n---\n\n` + content;
  await ensureDir(path.dirname(dest));
  await fsp.writeFile(dest, withFm, 'utf8');
}

function toTitle(slug) {
  const s = slug.replace(/[-_]/g, ' ').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

async function writePlaceholder(src, dest) {
  const base = path.basename(src);
  const title = toTitle(base.replace(/\.(rst)$/i, ''));
  const body = `---\ntitle: ${title}\n---\n\n> This tutorial is authored in reStructuredText and hasn't been converted yet.\n> Source: \`${src}\`\n\nIf you have \`pandoc\` installed, you can convert it manually:\n\n\n    pandoc -f rst -t gfm \'${base}\' -o \'${title}.md\'\n\n`;
  await ensureDir(path.dirname(dest));
  await fsp.writeFile(dest, body, 'utf8');
}

async function main() {
  const { src, lang, clear } = parseArgs();
  const outDir = destDirForLang(lang);
  await ensureDir(outDir);
  if (clear) {
    // Remove previously synced files (not the overview.md)
    const entries = await fsp.readdir(outDir).catch(() => []);
    for (const e of entries) {
      if (e === 'overview.md') continue;
      await fsp.rm(path.join(outDir, e), { recursive: true, force: true });
    }
  }

  let count = 0, skipped = 0;
  for await (const file of walk(src)) {
    const rel = path.relative(src, file);
    const ext = path.extname(file).toLowerCase();
    const name = toSlugName(path.basename(file, ext));
    const destBase = path.join(outDir, path.dirname(rel))
      .replace(/\\/g, '/');
    if (ext === '.md' || ext === '.mdx') {
      const dest = path.join(destBase, `${name}${ext}`);
      await copyMarkdown(file, dest);
      count++;
    } else if (ext === '.rst') {
      const dest = path.join(destBase, `${name}.md`);
      await writePlaceholder(file, dest);
      skipped++;
    }
  }
  console.log(`Synced ${count} markdown files to ${outDir}. Skipped ${skipped} rst files.`);
}

main().catch((e) => { console.error(e); process.exit(1); });

