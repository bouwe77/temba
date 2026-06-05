const fs = require('fs-extra');
const path = require('path');

async function findMarkdownFiles(directory, rootDirectory = directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await findMarkdownFiles(entryPath, rootDirectory));
      continue;
    }

    if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
      files.push(path.relative(rootDirectory, entryPath));
    }
  }

  return files.sort();
}

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);

  if (!match) {
    return { data: {}, body: content };
  }

  const data = {};
  const frontmatter = match[1];

  for (const line of frontmatter.split('\n')) {
    const fieldMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);

    if (fieldMatch) {
      data[fieldMatch[1]] = fieldMatch[2].trim();
    }
  }

  return {
    data,
    body: content.slice(match[0].length),
  };
}

function stripQuotes(value) {
  return value.replace(/^['"]|['"]$/g, '');
}

function parseKeywords(value) {
  if (!value) {
    return [];
  }

  const trimmedValue = value.trim();

  if (trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) {
    return trimmedValue
      .slice(1, -1)
      .split(',')
      .map(keyword => stripQuotes(keyword.trim()))
      .filter(Boolean);
  }

  return [stripQuotes(trimmedValue)].filter(Boolean);
}

function deriveTitle(file, body, frontmatterTitle) {
  if (frontmatterTitle) {
    return stripQuotes(frontmatterTitle);
  }

  const headingMatch = body.match(/^#\s+(.+)$/m);

  if (headingMatch) {
    return headingMatch[1].trim();
  }

  const basename = path.basename(file, path.extname(file));

  return basename
    .split(/[-_]/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function resolveRoute(file, docId, routeMap) {
  const route = routeMap[docId];

  if (route) {
    return route;
  }

  const relativePath = file.replace(/\.(md|mdx)$/, '').replace(/\/index$/, '');

  return `/docs/${relativePath}`;
}

/**
 * Docusaurus Plugin: AI Documentation
 * 
 * This plugin implements the "Third Audience" pattern for AI agents:
 * 1. Copies markdown files to build output directory matching URL structure
 * 2. Injects meta tags in HTML to make markdown discoverable
 * 3. Generates a static search_index.json for the full documentation
 */
module.exports = function (context, options) {
  return {
    name: 'docusaurus-plugin-ai-docs',

    /**
     * Post-build hook: Copy markdown files and inject meta tags
     */
    async postBuild({ siteConfig, routesPaths = [], outDir }) {
      console.log('[AI Docs Plugin] Starting post-build processing...');
      
      const docsPath = path.join(context.siteDir, 'docs');
      
      const markdownFiles = (await findMarkdownFiles(docsPath))
        .filter(file => file !== 'api/index.md');

      console.log(`[AI Docs Plugin] Found ${markdownFiles.length} markdown files`);

      // Build a map of routes to determine URL structure
      const routeMap = {};
      if (routesPaths && Array.isArray(routesPaths)) {
        routesPaths.forEach(route => {
          // Routes are in format like "/docs/documentation"
          if (route.startsWith('/docs/')) {
            const docName = route.substring('/docs/'.length);
            routeMap[docName] = route;
          }
        });
      }

      // Map to store doc routes for HTML injection
      const docRoutes = [];
      const searchIndex = [];

      // Copy each markdown file to match its URL structure
      for (const file of markdownFiles) {
        const sourcePath = path.join(docsPath, file);
        
        try {
          const content = await fs.readFile(sourcePath, 'utf-8');
          const { data: frontmatter, body } = parseFrontmatter(content);
          
          const docId = frontmatter.id || path.basename(file, path.extname(file));
          const route = resolveRoute(file, docId, routeMap);

          // Remove leading slash and create the destination path
          const routePath = route.replace(/^\//, '');
          const destPath = path.join(outDir, `${routePath}.md`);
          
          // Ensure the destination directory exists
          await fs.ensureDir(path.dirname(destPath));
          
          // Copy the file
          await fs.copyFile(sourcePath, destPath);
          console.log(`[AI Docs Plugin] Copied: ${file} -> ${routePath}.md`);
          
          // Store route for HTML injection
          docRoutes.push({ route, routePath });
          searchIndex.push({
            title: deriveTitle(file, body, frontmatter.title),
            url: route,
            keywords: parseKeywords(frontmatter.keywords || frontmatter.tags),
            content: body.trim(),
          });
        } catch (error) {
          console.error(`[AI Docs Plugin] Error processing ${file}:`, error.message);
        }
      }

      searchIndex.sort((first, second) => first.url.localeCompare(second.url));

      const searchIndexPath = path.join(outDir, 'search_index.json');
      await fs.writeFile(searchIndexPath, `${JSON.stringify(searchIndex, null, 2)}\n`, 'utf-8');
      console.log(`[AI Docs Plugin] Generated search index: search_index.json (${searchIndex.length} entries)`);

      // Now inject meta tags into HTML files
      console.log('[AI Docs Plugin] Injecting meta tags into HTML files...');
      
      for (const { route, routePath } of docRoutes) {
        const htmlPath = path.join(outDir, `${routePath}.html`);
        
        if (await fs.pathExists(htmlPath)) {
          try {
            let html = await fs.readFile(htmlPath, 'utf-8');
            
            // Create the link tag
            const linkTag = `<link rel="alternate" type="text/markdown" href="${route}.md">`;
            
            // Insert the link tag in the <head> section, right before </head>
            // Note: This is safe for Docusaurus-generated HTML which is well-formed
            // and doesn't have </head> in comments or scripts
            html = html.replace('</head>', `${linkTag}\n</head>`);
            
            // Write back the modified HTML
            await fs.writeFile(htmlPath, html, 'utf-8');
            console.log(`[AI Docs Plugin] Injected meta tag into: ${routePath}.html`);
          } catch (error) {
            console.error(`[AI Docs Plugin] Error injecting meta tag into ${htmlPath}:`, error.message);
          }
        }
      }

      console.log('[AI Docs Plugin] Post-build processing completed');
    },
  };
};
