#!/usr/bin/env node
/**
 * Crawl jaquar.com search results and build a local product database.
 * Output: public/jaquar-products.json
 *
 * Usage:  node scripts/build-jaquar-db.js
 *
 * Jaquar shows prices only to Indian IPs, so we spoof via X-Forwarded-For.
 */

const fs = require('fs');
const path = require('path');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const INDIA_IP = '103.21.125.1';
const CONCURRENT = 5;

function parseProductsFromSearch(html) {
  const products = [];
  const blockRe = /class="product-item"[^>]*data-productid="(\d+)">([\s\S]*?)(?=class="product-item"|<div class="pager">|$)/g;
  let m;
  while ((m = blockRe.exec(html)) !== null) {
    const id = m[1];
    const block = m[2];

    const urlMatch = block.match(/class="product-title">\s*<a href="([^"]*)">/);
    const url = urlMatch ? urlMatch[1] : '';

    const nameMatch = block.match(/class="product-title">\s*<a[^>]*>\s*([\s\S]*?)\s*<\/a>/);
    const name = nameMatch ? nameMatch[1].replace(/<[^>]*>/g, '').trim() : '';

    const skuMatch = block.match(/<div class="sku">[\s\S]*?<\/span>\s*([\s\S]*?)\s*<\/div>/);
    const code = skuMatch ? skuMatch[1].trim() : '';

    const priceMatch = block.match(/actual-price">MRP\s*:\s*(?:&#x20B9;|₹)\s*([\d,]+(?:\.\d+)?)/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : null;

    const imgMatch = block.match(/<img[^>]*src="([^"]*_300\.jpeg)"/);
    const image = imgMatch ? imgMatch[1] : '';

    if (code || name) {
      products.push({ id, code, name, price, url, image });
    }
  }
  return products;
}

async function fetchPage(query, pageNumber) {
  const url = `https://www.jaquar.com/en/search?q=${encodeURIComponent(query)}&pagenumber=${pageNumber}`;
  const resp = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html',
      'Accept-Language': 'en-IN,hi;q=0.9,en;q=0.8',
      'X-Forwarded-For': INDIA_IP,
    },
  });
  return resp.text();
}

function getLastPage(html) {
  const matches = [...html.matchAll(/pagenumber=(\d+)/g)];
  if (matches.length === 0) return 1;
  return Math.max(...matches.map(m => parseInt(m[1], 10)));
}

async function crawlQuery(query) {
  process.stdout.write(`\nCrawling "${query}" page 1...`);
  const firstHtml = await fetchPage(query, 1);
  const lastPage = getLastPage(firstHtml);
  let products = parseProductsFromSearch(firstHtml);
  process.stdout.write(` found ${products.length} products, ${lastPage} pages total\n`);

  // Fetch remaining pages in parallel batches
  for (let batch = 2; batch <= lastPage; batch += CONCURRENT) {
    const pages = [];
    for (let p = batch; p < batch + CONCURRENT && p <= lastPage; p++) {
      pages.push(p);
    }
    process.stdout.write(`  pages ${pages[0]}-${pages[pages.length - 1]}...`);
    const results = await Promise.all(pages.map(p => fetchPage(query, p)));
    for (const html of results) {
      products = products.concat(parseProductsFromSearch(html));
    }
    process.stdout.write(` ${products.length} total\n`);
  }
  return products;
}

async function main() {
  console.log('=== Jaquar Product Database Builder ===\n');

  // Crawl with broad search terms to cover all products
  // CHR (Chrome) is the most common finish, covers most products
  // Then add other finishes
  const queries = ['CHR', 'BLK', 'GLD', 'GRF', 'SSF', 'ANT', 'COP', 'NKL', 'PVD', 'FGD'];
  const allProducts = new Map();

  for (const q of queries) {
    try {
      const products = await crawlQuery(q);
      let newCount = 0;
      for (const p of products) {
        const key = p.code || p.id;
        if (!allProducts.has(key)) {
          allProducts.set(key, p);
          newCount++;
        }
      }
      console.log(`  → ${newCount} new unique products from "${q}"\n`);
    } catch (err) {
      console.error(`  ✗ Error crawling "${q}": ${err.message}`);
    }
  }

  // Convert to sorted array
  const products = [...allProducts.values()]
    .sort((a, b) => (a.code || '').localeCompare(b.code || ''));

  // Write JSON
  const outPath = path.join(__dirname, '..', 'public', 'jaquar-products.json');
  fs.writeFileSync(outPath, JSON.stringify(products));

  const sizeMB = (Buffer.byteLength(JSON.stringify(products)) / 1024 / 1024).toFixed(2);
  console.log(`\n✅ Done! ${products.length} products saved to public/jaquar-products.json (${sizeMB} MB)`);
  console.log(`   Products with price: ${products.filter(p => p.price).length}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
