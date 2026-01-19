# Docusaurus Plugin: AI Documentation (Third Audience)

This plugin implements the "Third Audience" pattern for AI agents and LLM crawlers, as described by Dries Buytaert.

## What It Does

1. **Markdown Availability**: Copies raw Markdown source files to the build output directory, making them accessible at URLs that match the HTML pages with a `.md` extension.
   - Example: If the page is at `https://temba.bouwe.io/docs/intro`, the raw Markdown is at `https://temba.bouwe.io/docs/intro.md`

2. **Auto-Discovery**: Injects `<link>` tags in every HTML page's `<head>` pointing to the corresponding Markdown file.
   - Example: `<link rel="alternate" type="text/markdown" href="/docs/intro.md">`

## How It Works

The plugin uses two key mechanisms:

### 1. Post-Build Processing
During the `postBuild` lifecycle hook, the plugin:
- Scans the `docs/` directory for all `.md` and `.mdx` files
- Extracts document IDs from frontmatter to determine URL routes
- Copies each Markdown file to the build output directory at the correct path
- Injects `<link>` tags directly into the generated HTML files

### 2. URL Matching
The plugin ensures that Markdown files match the URL structure of the HTML pages:
- Reads document IDs from frontmatter (e.g., `id: documentation`)
- Maps IDs to routes (e.g., `/docs/documentation`)
- Creates `.md` files at matching paths (e.g., `docs/documentation.md`)

## Installation

The plugin is already configured in `docusaurus.config.ts`:

```typescript
plugins: [
  // ... other plugins
  './plugins/docusaurus-plugin-ai-docs',
],
```

## Testing

After building the site, you can verify the plugin works:

```bash
# Build the site
npm run build

# Start a local server
python3 -m http.server 8000 --directory dist

# Test markdown accessibility
curl http://localhost:8000/docs/documentation.md

# Test meta tag injection
curl http://localhost:8000/docs/documentation.html | grep "text/markdown"
```

## Benefits

- **AI-Friendly**: LLMs and AI agents can easily discover and consume raw Markdown content
- **Static-Site Compatible**: Works with static hosting (GitHub Pages, Vercel, etc.) without server-side logic
- **Zero Configuration**: No additional setup required beyond adding the plugin
- **Standards-Based**: Uses standard HTML `<link>` tags for discovery

## References

- [The Third Audience](https://dri.es/the-third-audience) - Dries Buytaert's article on AI-optimized content
- [Docusaurus Plugin API](https://docusaurus.io/docs/api/plugin-methods)
