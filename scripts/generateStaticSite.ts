import fs from 'fs';
import path from 'path';
import { generateSitemapXml, updateSitemapFiles } from '../src/seo/sitemapGenerator';
import { transformHTMLForRoute } from '../src/seo/serverSEO';

/**
 * FEVIQO Static Site Generator & SEO Pre-Renderer
 * Pre-renders static HTML pages for 100% of sitemap routes into dist/
 * Ensures Cloudflare Pages, Vercel, Netlify, & static CDNs serve complete
 * SSR HTML with titles, meta tags, schema.org, and internal links without SPA soft 404s.
 */

async function main() {
  console.log('🚀 Starting FEVIQO Static Site & Sitemap Pre-Renderer...');

  const rootDir = process.cwd();
  const publicDir = path.join(rootDir, 'public');
  const distDir = path.join(rootDir, 'dist');

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // 1. Regenerate master sitemaps & robots.txt on disk
  updateSitemapFiles();

  const masterSitemapXml = generateSitemapXml();

  // Write master sitemaps directly into dist/ for static hosts (Cloudflare Pages, Vercel, Netlify)
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), masterSitemapXml, 'utf-8');
  fs.writeFileSync(path.join(distDir, 'google-index-fetch.xml'), masterSitemapXml, 'utf-8');
  fs.writeFileSync(path.join(distDir, 'sitemap-index.xml'), masterSitemapXml, 'utf-8');

  // Generate clean robots.txt in dist/
  const robotsTxt = [
    'User-agent: *',
    'Allow: /',
    '',
    'User-agent: Googlebot',
    'Allow: /',
    '',
    'User-agent: Googlebot-Image',
    'Allow: /',
    '',
    'User-agent: Googlebot-Video',
    'Allow: /',
    '',
    'User-agent: Mediapartners-Google',
    'Allow: /',
    '',
    'Sitemap: https://feviqo.com/sitemap.xml',
    'Sitemap: https://feviqo.com/google-index-fetch.xml',
  ].join('\r\n');

  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf-8');

  // 2. Read compiled dist/index.html
  const distIndexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(distIndexPath)) {
    console.error('❌ dist/index.html not found! Run vite build before static generation.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(distIndexPath, 'utf-8');

  // 3. Extract all URLs from sitemap
  const urlMatches = masterSitemapXml.match(/<loc>(.*?)<\/loc>/g) || [];
  const routePaths: string[] = [];

  urlMatches.forEach(match => {
    const loc = match.replace('<loc>', '').replace('</loc>', '').trim();
    try {
      const url = new URL(loc);
      let routePath = url.pathname;
      if (!routePath.startsWith('/')) routePath = '/' + routePath;
      if (!routePaths.includes(routePath)) {
        routePaths.push(routePath);
      }
    } catch {
      // Ignore invalid URL
    }
  });

  console.log(`📄 Extracted ${routePaths.length} unique route URLs for static HTML pre-rendering.`);

  let renderedCount = 0;

  for (const routePath of routePaths) {
    if (routePath === '/admin') continue; // Skip admin panel static export

    const routeSeoHtml = transformHTMLForRoute(baseHtml, routePath);

    if (routePath === '/') {
      fs.writeFileSync(distIndexPath, routeSeoHtml, 'utf-8');
      renderedCount++;
      continue;
    }

    // Strip leading/trailing slashes for directory path creation
    const cleanRouteDir = routePath.replace(/^\/+|\/+$/g, '');
    const targetDir = path.join(distDir, cleanRouteDir);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetHtmlPath = path.join(targetDir, 'index.html');
    fs.writeFileSync(targetHtmlPath, routeSeoHtml, 'utf-8');
    renderedCount++;
  }

  console.log(`✅ Pre-rendered ${renderedCount} static HTML pages into dist/ for instant Googlebot discovery & Cloudflare Pages hosting!`);
}

main().catch(err => {
  console.error('❌ Static generation failed:', err);
  process.exit(1);
});
