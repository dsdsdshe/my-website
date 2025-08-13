# MindQuantum Documentation

This repository hosts the documentation website for MindQuantum, powered by GitHub Pages.

## Repository Structure

```
.
├── docs/                  # Documentation source files
│   ├── source_en/        # English documentation
│   ├── source_zh_cn/     # Chinese documentation
│   ├── _ext/             # Sphinx extensions
│   ├── Makefile          # Build configuration
│   └── requirements.txt  # Python dependencies
├── .github/
│   └── workflows/
│       └── build-docs.yml # GitHub Actions workflow
└── README.md
```

## Local Development

### Prerequisites

1. Python 3.8+
2. Pandoc (for notebook conversion)
3. Graphviz (for diagrams)

### Setup

```bash
# Install system dependencies (Ubuntu/Debian)
sudo apt-get install pandoc graphviz

# Install Python dependencies
pip install -r docs/requirements.txt
```

### Building Documentation Locally

To build the English documentation:
```bash
cd docs
make -f Makefile.en html
```

To build the Chinese documentation:
```bash
cd docs
make -f Makefile.zh_cn html
```

The built documentation will be available in `docs/build_en/html/` and `docs/build_zh_cn/html/` respectively.

## Automatic Deployment

The documentation is automatically built and deployed to GitHub Pages when changes are pushed to the `main` branch. The GitHub Actions workflow handles:

1. Building both English and Chinese documentation
2. Organizing the output files
3. Deploying to GitHub Pages

## GitHub Pages Configuration

To enable GitHub Pages for this repository:

1. Go to Settings → Pages
2. Under "Source", select "GitHub Actions"
3. The site will be available at `https://[username].github.io/[repository-name]/`

## Contributing

When contributing documentation:

1. Edit the source files in `docs/source_en/` or `docs/source_zh_cn/`
2. Test your changes locally using the build commands above
3. Submit a pull request
4. The CI/CD pipeline will automatically build and preview your changes

## License

The documentation follows the same license as the MindQuantum project.