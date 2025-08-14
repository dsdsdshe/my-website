#!/usr/bin/env bash
set -euo pipefail

# Build MindQuantum documentation from the MindSpore docs repo using Sphinx
# and place the generated HTML under dist/docs.
#
# This script aims to follow good practices:
# - Isolated Python virtualenv with pinned deps from the repo
# - Uses the docs-provided Makefile (runs pre-steps in _ext/)
# - Fetches the MindQuantum repo for API sources and sets MQ_PATH
# - Supports language selection (zh_cn or en)
# - Verifies system tools (pandoc) with helpful guidance
#
# Environment variables:
# - DOCS_REPO_URL: docs repo URL (default: https://gitee.com/mindspore/docs.git)
# - DOCS_REF: branch or tag to checkout (default: master)
# - DOCS_SUBPATH: optional path to the Sphinx conf.py directory, relative to repo root
# - OUTPUT_DIR: output directory for built docs (default: dist/docs/{zh|en})
# - WORK_DIR: temporary working directory (default: .tmp/docs)
# - DOCS_LANG: zh_cn or en (default: zh_cn)
# - MQ_REPO_URL: MindQuantum repo URL (default: https://gitee.com/mindspore/mindquantum.git)
# - MQ_REF: MindQuantum branch or tag (default: master)
# - MQ_PATH: If set, use this existing path instead of cloning MindQuantum

DOCS_REPO_URL="${DOCS_REPO_URL:-https://gitee.com/mindspore/docs.git}"
DOCS_REF="${DOCS_REF:-master}"
DOCS_SUBPATH="${DOCS_SUBPATH:-}"
WORK_DIR="${WORK_DIR:-.tmp/docs}"
DOCS_LANG="${DOCS_LANG:-zh_cn}"
MQ_REPO_URL="${MQ_REPO_URL:-https://gitee.com/mindspore/mindquantum.git}"
MQ_REF="${MQ_REF:-master}"

mkdir -p "$WORK_DIR"

# Work out constraints file path for pip
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONSTRAINTS_FILE="$SCRIPT_DIR/constraints-mindquantum.txt"

if [[ -d "$WORK_DIR/src/.git" ]]; then
  echo "Using existing docs repo at $WORK_DIR/src"
else
  echo "Cloning docs repository: $DOCS_REPO_URL@${DOCS_REF}"
  git clone --depth 1 --branch "$DOCS_REF" "$DOCS_REPO_URL" "$WORK_DIR/src"
fi

# Detect Sphinx project root and conf.py for MindQuantum
pushd "$WORK_DIR/src" >/dev/null
if [[ -n "$DOCS_SUBPATH" ]]; then
  CONFDIR="$DOCS_SUBPATH"
else
  echo "Attempting to auto-detect MindQuantum docs conf.py"
  FOUND=$(find . -type f -name conf.py -ipath "*docs/mindquantum/docs/source_*" -print -quit || true)
  if [[ -n "$FOUND" ]]; then
    CONFDIR=$(dirname "$FOUND")
  else
    CONFDIR="docs/mindquantum/docs/source_zh_cn"
  fi
fi

if [[ -z "$CONFDIR" ]] || [[ ! -f "$CONFDIR/conf.py" ]]; then
  echo "Error: Could not locate Sphinx conf.py for MindQuantum docs (looked for $CONFDIR)." >&2
  echo "Set DOCS_SUBPATH to the directory containing conf.py (e.g., docs/mindquantum/docs/source_zh_cn)." >&2
  exit 1
fi

SPHINX_ROOT=$(cd "$(dirname "$CONFDIR")" && pwd)
popd >/dev/null

echo "Sphinx root: $SPHINX_ROOT"
echo "Language: $DOCS_LANG"

# Ensure pandoc is available (required by README)
if ! command -v pandoc >/dev/null 2>&1; then
  echo "Error: pandoc is not installed but is required to build MindQuantum docs." >&2
  echo "Install pandoc (e.g., macOS: 'brew install pandoc', Ubuntu: 'sudo apt-get update && sudo apt-get install -y pandoc')." >&2
  exit 2
fi

# Prepare Python virtual environment
VENV_DIR="$WORK_DIR/venv"
if [[ ! -d "$VENV_DIR" ]]; then
  echo "Creating Python virtual environment: $VENV_DIR"
  python3 -m venv "$VENV_DIR"
fi
source "$VENV_DIR/bin/activate"
python -m pip install --upgrade pip wheel setuptools

if [[ -f "$SPHINX_ROOT/requirements.txt" ]]; then
  echo "Installing MindQuantum docs requirements (constrained)"
  pip install -c "$CONSTRAINTS_FILE" -r "$SPHINX_ROOT/requirements.txt"
fi

# Ensure extras present, constrained
pip install -c "$CONSTRAINTS_FILE" nbsphinx ipython mindquantum mindspore

# Prepare MindQuantum repo (for MQ_PATH and API sources copy in conf.py)
if [[ -z "${MQ_PATH:-}" ]]; then
  MQ_DIR="$WORK_DIR/deps/mindquantum"
  if [[ -d "$MQ_DIR/.git" ]]; then
    echo "Using existing MindQuantum repo at $MQ_DIR"
  else
    echo "Cloning MindQuantum repository: $MQ_REPO_URL@${MQ_REF}"
    git clone --depth 1 --branch "$MQ_REF" "$MQ_REPO_URL" "$MQ_DIR"
  fi
  # Resolve to absolute path
  MQ_ABS=$(cd "$MQ_DIR" && pwd)
  export MQ_PATH="$MQ_ABS"
else
  # Normalize provided MQ_PATH to absolute path so conf.py can locate files reliably
  if [[ -d "$MQ_PATH" ]]; then
    MQ_ABS=$(cd "$MQ_PATH" && pwd)
    export MQ_PATH="$MQ_ABS"
  fi
  echo "Using provided MQ_PATH: $MQ_PATH"
fi

# Build via Makefile to run pre-steps in _ext/
echo "Building Sphinx docs via Makefile"
pushd "$SPHINX_ROOT" >/dev/null
make clean >/dev/null 2>&1 || true
if [[ "$DOCS_LANG" == "en" ]]; then
  make html SPHINXOPTS="" SPHINXBUILD="$(command -v sphinx-build)" SOURCEDIR=source_en BUILDDIR=build_en
else
  make html SPHINXOPTS="" SPHINXBUILD="$(command -v sphinx-build)" SOURCEDIR=source_zh_cn BUILDDIR=build_zh_cn
fi
popd >/dev/null

# Determine OUTPUT_DIR default based on language if not set
if [[ -z "${OUTPUT_DIR:-}" ]]; then
  if [[ "$DOCS_LANG" == "en" ]]; then
    OUTPUT_DIR="dist/docs/en"
  else
    OUTPUT_DIR="dist/docs/zh"
  fi
fi

# Copy built HTML to output directory
mkdir -p "$OUTPUT_DIR"
  if [[ "$DOCS_LANG" == "en" ]]; then
    rsync -a --delete "$SPHINX_ROOT/build_en/html/" "$OUTPUT_DIR/"
  else
    rsync -a --delete "$SPHINX_ROOT/build_zh_cn/html/" "$OUTPUT_DIR/"
  fi

  echo "Docs built to $OUTPUT_DIR"

  # --- Bridge CSS injection (no changes to conf.py) ---
  # Copy our site CSS bridge into the docs' _static folder, then inject a
  # <link> tag into each HTML file with a correct relative path.
  BRIDGE_SRC_REL="public/assets/css/docs-bridge.css"
  if [[ -f "$BRIDGE_SRC_REL" ]]; then
    mkdir -p "$OUTPUT_DIR/_static"
    cp -f "$BRIDGE_SRC_REL" "$OUTPUT_DIR/_static/mq-bridge.css"
    echo "Injected bridge CSS file to $OUTPUT_DIR/_static/mq-bridge.css"

    # Walk all HTML files and insert the link before </head>
    while IFS= read -r -d '' html; do
      # Skip if already injected
      if grep -q "mq-bridge.css" "$html"; then
        continue
      fi
      rel_path="${html#"$OUTPUT_DIR/"}"
      dir_rel=$(dirname "$rel_path")
      if [[ "$dir_rel" == "." ]]; then
        prefix=""
      else
        # Count directory depth and build ../ prefix
        depth=$(awk -F/ '{print NF}' <<< "$dir_rel")
        prefix=""
        for ((i=0; i<depth; i++)); do prefix="../$prefix"; done
      fi
      link_tag="<link rel=\"stylesheet\" href=\"${prefix}_static/mq-bridge.css\">"
      awk -v link="$link_tag" '
        BEGIN{done=0}
        /<\/head>/ && !done { print "  " link; done=1 }
        { print }
      ' "$html" > "$html.__tmp" && mv "$html.__tmp" "$html"
    done < <(find "$OUTPUT_DIR" -type f -name "*.html" -print0)
    echo "Bridge CSS link injected into docs HTML."
  else
    echo "Warning: Bridge CSS $BRIDGE_SRC_REL not found; skipping visual alignment." >&2
  fi
