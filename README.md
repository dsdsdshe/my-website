MindQuantum Docs Website

This repository builds and publishes the MindQuantum documentation to GitHub Pages.

How it works
- GitHub Actions checks out the upstream MindSpore docs repo and MindQuantum repo.
- It builds the Sphinx docs for MindQuantum in English and Chinese.
- The generated static site is deployed to GitHub Pages via the official Pages action.

Getting started
- Enable Pages: Settings → Pages → Source → GitHub Actions.
- Push to `main` (or `master`) to trigger a build, or run the workflow manually.

Notes
- API pages are included if the MindQuantum repo provides `docs/api_python_en` and `docs/api_python` sources. The build gracefully skips copying those if unavailable.
- The site defaults to English at `/en/`. Chinese outputs to `/zh-cn/`.

