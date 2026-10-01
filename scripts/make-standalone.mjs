import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirectory = resolve(root, 'dist');
const outputDirectory = resolve(root, 'standalone');
const sourceHtmlPath = resolve(sourceDirectory, 'index.html');

let html = await readFile(sourceHtmlPath, 'utf8');

const stylesheetMatch = html.match(
  /<link\s+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/,
);
const scriptMatch = html.match(
  /<script\s+type="module"[^>]*src="([^"]+)"[^>]*><\/script>/,
);

if (!stylesheetMatch || !scriptMatch) {
  throw new Error('Не удалось найти CSS или JavaScript в production-сборке Vite.');
}

const assetPath = assetUrl => resolve(sourceDirectory, assetUrl.replace(/^\.\//, ''));
let css = await readFile(assetPath(stylesheetMatch[1]), 'utf8');
const javascript = await readFile(assetPath(scriptMatch[1]), 'utf8');

// The regular app may enhance typography from Google Fonts. The standalone
// file must not make network requests, so it uses the system font fallback.
css = css.replace(/@import\s*(?:url\([^)]*\)|["'][^"']*["'])\s*;?/g, '');

html = html
  .replace(stylesheetMatch[0], `<style>\n${css}\n</style>`)
  .replace(scriptMatch[0], '')
  // A callback prevents `$&` sequences in minified application code from
  // being interpreted as replacement-pattern tokens by String.replace().
  .replace('</body>', () => `<script>\n${javascript.replaceAll('</script>', '<\\/script>')}\n</script>\n  </body>`);

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await writeFile(resolve(outputDirectory, 'index.html'), html);

console.log(`Автономная версия создана: ${resolve(outputDirectory, 'index.html')}`);
