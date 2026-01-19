const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

/**
 * Docusaurus Plugin: AI Documentation
 * 
 * This plugin implements the "Third Audience" pattern for AI agents:
 * 1. Copies markdown files to build output directory matching URL structure
 * 2. Injects meta tags in HTML to make markdown discoverable
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
      
      // Find all markdown files in the docs directory
      const markdownFiles = glob.sync('**/*.{md,mdx}', {
        cwd: docsPath,
        absolute: false,
      });

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

      // Copy each markdown file to match its URL structure
      for (const file of markdownFiles) {
        const sourcePath = path.join(docsPath, file);
        
        try {
          const content = await fs.readFile(sourcePath, 'utf-8');
          
          // Extract the doc ID from frontmatter
          const idMatch = content.match(/^---\s*\n[\s\S]*?id:\s*(.+?)\s*\n[\s\S]*?---/m);
          const docId = idMatch ? idMatch[1].trim() : path.basename(file, path.extname(file));
          
          // Determine the route
          let route = routeMap[docId];
          
          if (!route) {
            // Fallback: construct from file path
            const relativePath = file.replace(/\.(md|mdx)$/, '');
            route = `/docs/${relativePath}`;
          }

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
        } catch (error) {
          console.error(`[AI Docs Plugin] Error processing ${file}:`, error.message);
        }
      }

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
