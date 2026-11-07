import fs from 'fs';
import path from 'path';
import { generateSitemapXml } from '../src/seo/sitemapGenerator';
import { transformHTMLForRoute } from '../src/seo/serverSEO';

/**
 * FEVIQO Static Site Generator & SEO Pre-Renderer
 * Generates the sitemap from the same route source used by the application,
 * then pre-renders every canonical sitemap route into dist/.
 */
async function main() {
  console.log('Starting FEVIQO static site and sitemap pre-renderer...');

  const rootDir = process.cwd();
  const publicDir = path.join(rootDir, 'public');
  const distDir = path.join(rootDir, 'dist');

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Generate the sitemap from the live SEO route and episode data.
  // Do not copy a manually maintained sitemap that can fall behind new episodes.
  const sitemapXml = generateSitemapXml();
  const robotsTxt = fs.readFileSync(path.join(publicDir, 'robots.txt'), 'utf-8');

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf-8');
  fs.writeFileSync(path.join(rootDir, 'robots.txt'), robotsTxt, 'utf-8');

  // Copy optional discovery files.
  for (const file of ['llms.txt', 'ai-catalog.json']) {
    const source = path.join(publicDir, file);
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, path.join(distDir, file));
    }
  }

  const distIndexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(distIndexPath)) {
    throw new Error('dist/index.html not found. Run vite build before static generation.');
  }

  const baseHtml = fs.readFileSync(distIndexPath, 'utf-8');
  const urlMatches = sitemapXml.match(/<loc>(.*?)<\/loc>/g) || [];
  const routePaths: string[] = [];

  for (const match of urlMatches) {
    const loc = match.replace('<loc>', '').replace('</loc>', '').trim();
    try {
      const url = new URL(loc);
      if (url.origin !== 'https://feviqo.com') continue;
      const routePath = url.pathname.startsWith('/') ? url.pathname : `/${url.pathname}`;
      if (!routePaths.includes(routePath)) routePaths.push(routePath);
    } catch {
      // Ignore malformed sitemap locations.
    }
  }

  console.log(`Pre-rendering ${routePaths.length} canonical routes from sitemap.xml...`);
  let renderedCount = 0;

  for (const routePath of routePaths) {
    if (routePath === '/admin' || routePath === '/admin/') continue;

    const routeSeoHtml = transformHTMLForRoute(baseHtml, routePath);
    if (routePath === '/') {
      fs.writeFileSync(distIndexPath, routeSeoHtml, 'utf-8');
      renderedCount++;
      continue;
    }

    const cleanRouteDir = routePath.replace(/^\/+|\/+$/g, '');
    const targetDir = path.join(distDir, cleanRouteDir);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'index.html'), routeSeoHtml, 'utf-8');
    renderedCount++;


  }

  console.log(`Pre-rendered ${renderedCount} routes into dist/.`);
}

main().catch((err) => {
  console.error('Static generation failed:', err);
  process.exit(1);
});
