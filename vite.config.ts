import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

// Plugin to auto-generate SEO files on build
const seoPlugin = () => {
  return {
    name: 'seo-plugin',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }

      const buildTime = new Date().toISOString();
      const domain = 'https://fluxell.onrender.com';

      // 1. Generate robots.txt
      const robots = `User-agent: *\nAllow: /\nSitemap: ${domain}/sitemap.xml\n`;
      fs.writeFileSync(path.join(distDir, 'robots.txt'), robots);

      // 2. Generate updated sitemap.xml
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${domain}/</loc>\n    <lastmod>${buildTime}</lastmod>\n    <changefreq>always</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>${domain}/changelog</loc>\n    <lastmod>${buildTime}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`;
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap);

      // 3. Generate a static SEO-friendly changelog page
      const changelogHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Fluxel - Changelog</title>
  <meta name="description" content="Latest updates, deployments, and changes for Fluxel Deployment.">
  <link rel="canonical" href="${domain}/changelog" />
  <meta name="last-modified" content="${buildTime}" />
  <style>body { font-family: system-ui, sans-serif; background: #050505; color: #eee; padding: 2rem; } a { color: #10b981; } </style>
</head>
<body>
  <h1>Fluxel Changelog</h1>
  <p>Last Updated: <time datetime="${buildTime}">${buildTime}</time></p>
  <ul>
    <li>${new Date().toDateString()}: System core updated. Advanced SEO parameters injected. Dynamic sitemaps enabled.</li>
    <li>Added breadcrumb schema indexing rules.</li>
    <li>Implemented strict caching mechanisms with ETag and Last-Modified headers.</li>
  </ul>
  <a href="/">← Back to Deployment API</a>
</body>
</html>`;
      fs.writeFileSync(path.join(distDir, 'changelog.html'), changelogHtml);
    },
    transformIndexHtml(html: string) {
      // Inject Last-Modified meta tag and Breadcrumb structured data dynamically at build time
      const buildTime = new Date().toISOString();
      const breadcrumbSchema = {
         "@context": "https://schema.org",
         "@type": "BreadcrumbList",
         "itemListElement": [{
           "@type": "ListItem",
           "position": 1,
           "name": "Home",
           "item": "https://fluxell.onrender.com/"
         }]
      };

      let transformed = html.replace(
        '</head>',
        `  <meta name="last-modified" content="${buildTime}" />\n    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>\n  </head>`
      );
      
      // Update WebSite schema to include dateModified
      transformed = transformed.replace(
        /"name": "Fluxel Deployment",(\s*)"url": "https:\/\/fluxell\.onrender\.com\/"/g,
        `"name": "Fluxel Deployment",$1"url": "https://fluxell.onrender.com/",$1"dateModified": "${buildTime}"`
      );

      return transformed;
    }
  };
};

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), seoPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
