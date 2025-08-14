# MindQuantum Website

A minimal, maintainable static site for the MindQuantum project. It uses Eleventy (11ty) for the main site and pulls tutorials/documentation from the MindSpore `docs` repository using Sphinx, so you don’t have to maintain duplicate content.

## Structure
- `src/`: 11ty source (pages, layouts, data, styles)
- `public/`: static assets copied as-is (favicon, robots.txt)
- `dist/`: build output (generated)
- `scripts/build_docs.sh`: clones MindSpore/docs and builds MindQuantum docs via Sphinx
- `.github/workflows/deploy.yml`: GitHub Actions workflow for Pages deployment

## Local development
Prerequisites:
- Node.js 18+ and npm
- Python 3.9+ (only needed if you want to build docs locally)

Install and run the site (without docs):

```bash
npm install
npm run dev
```

Open http://localhost:8080 to preview. The “Docs” link will 404 locally until you build docs into `dist/docs`.

Build the site:
```bash
npm run build
```

## Build docs locally (optional)
If you want to include docs in your local preview/build, run the helper script. It clones the MindSpore docs repo and tries to auto-detect the MindQuantum Sphinx project. The script creates a Python virtualenv under `.tmp/docs/venv` and installs pinned dependencies.

```bash
# Build Eleventy first (creates dist/)
npm run build

# Then build docs into dist/docs
bash scripts/build_docs.sh
```

By default, the script uses:
- `DOCS_REPO_URL`: `https://gitee.com/mindspore/docs.git`
- `DOCS_LANG`: `zh_cn` (set `en` to build English)
- Auto-detection for the MindQuantum `conf.py` within the docs repo
- A minimal stub for `import mindquantum` so the build does not require compiling MindQuantum

If auto-detection fails, specify the path to the `conf.py` directory relative to the docs repo root, for example:

```bash
DOCS_SUBPATH="docs/mindquantum/docs/source_zh_cn" bash scripts/build_docs.sh
```

The built docs will be placed in `dist/docs/` so your site’s “Docs” link points to `/docs/` correctly.

Requirements for MindQuantum docs:
- `pandoc` must be installed on your system (macOS: `brew install pandoc`, Ubuntu: `sudo apt-get install -y pandoc`).
- The build copies API sources from the MindQuantum repo. If you have a local clone, set `MQ_PATH` to it. Otherwise, the script will clone it automatically:
  - `MQ_REPO_URL`: `https://gitee.com/mindspore/mindquantum.git`
  - `MQ_REF`: branch or tag (default `master`)
- To build English docs, use `DOCS_LANG=en`.

Examples:

```bash
# Build Chinese docs
DOCS_LANG=zh_cn bash scripts/build_docs.sh

# Build English docs
DOCS_LANG=en bash scripts/build_docs.sh

# Use an existing local MindQuantum repo
MQ_PATH=/path/to/mindquantum bash scripts/build_docs.sh
```

## Deploy to GitHub Pages
This repo includes a workflow that builds the site and docs and deploys to Pages.

Steps to enable:
1. Push to the `main` branch.
2. In your GitHub repository Settings → Pages, set “Build and deployment” Source to “GitHub Actions”.
3. The workflow will:
   - Install Node deps and build Eleventy to `dist/`
   - Install system deps (`pandoc`, `graphviz`)
   - Set up Python and build MindQuantum docs from `mindspore/docs` using Sphinx
   - Place docs at `dist/docs/`
   - Publish `dist/` to Pages

If the workflow cannot auto-detect the MindQuantum `conf.py`, set `DOCS_SUBPATH` in the workflow step to the correct directory.

## Customization
- Site title, description, nav: `src/_data/site.json`
- Layout and styles: `src/_includes/layouts/base.njk`, `src/styles.css`
- Landing content: `src/index.njk`
- Blog index placeholder: `src/blog.njk`

You can add more pages under `src/` as `.njk`, `.md`, or `.html` files. The default layout is `layouts/base.njk` when specified in the front matter.

## Notes
- The docs repo may require additional system packages for specific Sphinx extensions (e.g., Graphviz). If the build fails in CI, install the required packages in the workflow before running `build_docs.sh`.
- If you plan to support multiple languages, you can parameterize `build_docs.sh` to build multiple locales/variants into `dist/docs/<lang>/` and link accordingly.

## License
This repository’s website scaffolding can be used under the same license as your project. Ensure the content you pull from MindSpore/docs complies with its licensing terms.

—

Happy hacking! This setup aims to stay simple while making it easy to grow over time.
