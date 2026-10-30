#!/usr/bin/env node

/**
 * Campus Arena — Automated Asset Fetcher CLI (Zero Dependencies)
 * Basado en el Master Playbook (Sección 6.1 & 6.2)
 *
 * Comandos disponibles:
 *   node scripts/asset-fetcher.js search "<query>" [--count 5] [--download ./public/assets]
 *   node scripts/asset-fetcher.js ai "<prompt>" [--output ./public/banner.jpg] [--width 1200] [--height 675]
 *   node scripts/asset-fetcher.js icon "<name>" [--prefix lucide] [--color E63946] [--size 24] [--download ./public/icons]
 *   node scripts/asset-fetcher.js logo "<brand>" [--color white] [--output ./public/brand.svg]
 *   node scripts/asset-fetcher.js products [--count 6]
 */

const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');
const http = require('node:http');

function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args[0] || 'help';
  const positional = [];
  const flags = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  return { command, query: positional.join(' '), flags };
}

function fetchBuffer(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) {
      return reject(new Error('Demasiadas redirecciones al descargar el recurso.'));
    }
    const client = url.startsWith('https') ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          'User-Agent': 'CampusArena-AssetFetcher/1.0 (https://campusarena.vercel.app)',
          Accept: '*/*',
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, url).toString();
          res.resume();
          return resolve(fetchBuffer(redirectUrl, maxRedirects - 1));
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode} al consultar ${url}`));
        }
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      }
    );
    req.on('error', reject);
    req.setTimeout(20000, () => {
      req.destroy(new Error(`Timeout agotado (20s) al consultar ${url}`));
    });
  });
}

async function fetchJson(url) {
  const buf = await fetchBuffer(url);
  return JSON.parse(buf.toString('utf8'));
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function sanitizeFilename(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'asset';
}

async function cmdSearch(query, flags) {
  if (!query) {
    console.error('Error: Especifica una palabra clave. Ejemplo: node scripts/asset-fetcher.js search "esports arena" --count 5');
    process.exit(1);
  }
  const count = Math.min(20, Math.max(1, Number(flags.count) || 5));
  const downloadDir = flags.download ? path.resolve(String(flags.download)) : null;

  console.log(`🔍 Buscando "${query}" en Openverse API (CC0 / Dominio Público)...`);
  const apiUrl = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=${count}`;

  let results = [];
  try {
    const data = await fetchJson(apiUrl);
    results = (data.results || []).slice(0, count).map((item, idx) => ({
      index: idx + 1,
      title: item.title || `${query}-${idx + 1}`,
      url: item.url,
      creator: item.creator || 'Openverse CC',
      license: item.license || 'cc0',
    }));
  } catch {
    // Fallback a Picsum Photos con semilla determinística
    console.warn('⚠️ Openverse ocupado; usando generador fotográfico Picsum con semilla...');
    results = Array.from({ length: count }, (_, idx) => {
      const seed = `${sanitizeFilename(query)}-${idx + 1}`;
      return {
        index: idx + 1,
        title: `${query} #${idx + 1}`,
        url: `https://picsum.photos/seed/${seed}/1200/800`,
        creator: 'Picsum Seed',
        license: 'CC0',
      };
    });
  }

  for (const item of results) {
    console.log(`  [${item.index}] ${item.title} (${item.license}) -> ${item.url}`);
    if (downloadDir) {
      ensureDir(downloadDir);
      const ext = path.extname(new URL(item.url).pathname) || '.jpg';
      const filePath = path.join(downloadDir, `${sanitizeFilename(query)}-${item.index}${ext}`);
      try {
        const buf = await fetchBuffer(item.url);
        fs.writeFileSync(filePath, buf);
        console.log(`      ✅ Guardado en: ${filePath} (${(buf.length / 1024).toFixed(1)} KB)`);
      } catch (err) {
        console.warn(`      ⚠️ No se pudo descargar [${item.index}]: ${err.message}`);
      }
    }
  }
}

async function cmdAi(prompt, flags) {
  if (!prompt) {
    console.error('Error: Especifica un prompt. Ejemplo: node scripts/asset-fetcher.js ai "cyberpunk esports trophy" --output ./public/trophy.jpg');
    process.exit(1);
  }
  const width = Number(flags.width) || 800;
  const height = Number(flags.height) || 800;
  const model = flags.model || 'flux';
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&model=${model}&nologo=true`;

  console.log(`🎨 Generando imagen con IA (${model}, ${width}x${height}): "${prompt}"`);
  console.log(`🔗 URL directa: ${url}`);

  if (flags.output) {
    const outPath = path.resolve(String(flags.output));
    ensureDir(path.dirname(outPath));
    const buf = await fetchBuffer(url);
    fs.writeFileSync(outPath, buf);
    console.log(`✅ Imagen guardada en: ${outPath} (${(buf.length / 1024).toFixed(1)} KB)`);
  }
}

async function cmdIcon(query, flags) {
  if (!query) {
    console.error('Error: Especifica el nombre del icono. Ejemplo: node scripts/asset-fetcher.js icon "trophy" --prefix lucide --download ./public/icons');
    process.exit(1);
  }
  const prefix = flags.prefix || 'lucide';
  const color = flags.color ? String(flags.color).replace('#', '%23') : '';
  const size = flags.size || flags.width || '24';

  const searchUrl = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&prefix=${encodeURIComponent(prefix)}&limit=5`;
  console.log(`🎯 Buscando icono "${query}" (prefijo: ${prefix}) en Iconify...`);

  let icons = [`${prefix}:${sanitizeFilename(query)}`];
  try {
    const data = await fetchJson(searchUrl);
    if (Array.isArray(data.icons) && data.icons.length > 0) {
      icons = data.icons.slice(0, 5);
    }
  } catch {
    // Usar el icono directo si la búsqueda falla
  }

  for (const iconId of icons) {
    const [iconPrefix, iconName] = iconId.split(':');
    const colorParam = color ? `&color=${color}` : '';
    const svgUrl = `https://api.iconify.design/${iconPrefix}/${iconName}.svg?width=${size}${colorParam}`;
    console.log(`  • ${iconId} -> ${svgUrl}`);

    if (flags.download) {
      const outDir = path.resolve(String(flags.download));
      ensureDir(outDir);
      const outFile = path.join(outDir, `${iconPrefix}-${iconName}.svg`);
      try {
        const buf = await fetchBuffer(svgUrl);
        fs.writeFileSync(outFile, buf);
        console.log(`    ✅ SVG guardado en: ${outFile}`);
      } catch (err) {
        console.warn(`    ⚠️ Error descargando ${iconId}: ${err.message}`);
      }
    }
  }
}

async function cmdLogo(brand, flags) {
  if (!brand) {
    console.error('Error: Especifica la marca. Ejemplo: node scripts/asset-fetcher.js logo "discord" --color white');
    process.exit(1);
  }
  const slug = sanitizeFilename(brand).replace(/-/g, '');
  const color = flags.color ? String(flags.color).replace('#', '') : 'white';
  const url = `https://cdn.simpleicons.org/${slug}/${color}`;

  console.log(`🏷️  Logo Simple Icons (${brand}): ${url}`);

  if (flags.output) {
    const outPath = path.resolve(String(flags.output));
    ensureDir(path.dirname(outPath));
    const buf = await fetchBuffer(url);
    fs.writeFileSync(outPath, buf);
    console.log(`✅ Logo SVG guardado en: ${outPath}`);
  }
}

async function cmdProducts(flags) {
  const count = Math.min(20, Math.max(1, Number(flags.count) || 6));
  const url = `https://dummyjson.com/products?limit=${count}`;
  console.log(`📦 Obteniendo ${count} registros de prueba desde DummyJSON...`);
  try {
    const data = await fetchJson(url);
    const items = (data.products || []).map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      category: p.category,
      thumbnail: p.thumbnail,
    }));
    console.log(JSON.stringify(items, null, 2));
  } catch (err) {
    console.error(`Error al consultar DummyJSON: ${err.message}`);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
🏟️  Campus Arena — Asset Fetcher CLI (Cero Dependencias)
=========================================================
Uso:
  node scripts/asset-fetcher.js <comando> [argumentos] [opciones]

Comandos:
  search "<query>"   Busca fotos libres (Openverse CC0 / Picsum)
                     Opciones: --count 5 --download ./carpeta
  ai "<prompt>"      Genera arte o banners con IA (Pollinations Flux)
                     Opciones: --width 1200 --height 675 --output ./archivo.jpg
  icon "<nombre>"    Busca y descarga iconos SVG (Iconify 200k+)
                     Opciones: --prefix lucide --color E63946 --size 24 --download ./icons
  logo "<marca>"     Descarga logotipos oficiales en SVG (Simple Icons)
                     Opciones: --color white --output ./logo.svg
  products           Genera mock data JSON para pruebas rápidas
                     Opciones: --count 6
`);
}

async function main() {
  const { command, query, flags } = parseArgs(process.argv);

  switch (command) {
    case 'search':
      await cmdSearch(query, flags);
      break;
    case 'ai':
      await cmdAi(query, flags);
      break;
    case 'icon':
      await cmdIcon(query, flags);
      break;
    case 'logo':
      await cmdLogo(query, flags);
      break;
    case 'products':
      await cmdProducts(flags);
      break;
    case 'help':
    case '--help':
    case '-h':
    default:
      printHelp();
      break;
  }
}

main().catch((err) => {
  console.error('❌ Error en asset-fetcher:', err.message);
  process.exit(1);
});

