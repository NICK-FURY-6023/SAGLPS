const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');
const supabase = require('./supabase');

function buildLabelHTML(labelData) {
  const labels = Array.isArray(labelData) ? labelData : Array(12).fill(labelData);

  const labelItems = labels.slice(0, 12).map((label) => {
    const name = label.name || label.product_name || '';
    const price = label.price != null ? label.price : '______';
    const size = label.size || '______';
    const qty = label.qty != null ? label.qty : '______';
    const manufacturer = label.manufacturer || '';

    return `
      <div class="label">
        <div class="label-name">${escapeHtml(name)}</div>
        <div class="label-row">
          <span class="label-field"><span class="field-key">Price:</span> ${escapeHtml(String(price))}</span>
          <span class="label-field"><span class="field-key">Size:</span> ${escapeHtml(String(size))}</span>
          <span class="label-field"><span class="field-key">Qty:</span> ${escapeHtml(String(qty))}</span>
        </div>
        <div class="label-manufacturer">${escapeHtml(manufacturer)}</div>
      </div>`;
  });

  // Pad to 12 labels if fewer provided
  while (labelItems.length < 12) {
    labelItems.push('<div class="label"></div>');
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    @page {
      size: A4;
      margin: 0;
    }

    body {
      font-family: Arial, sans-serif;
      background: white;
    }

    .sheet {
      width: 210mm;
      height: 297mm;
      display: grid;
      grid-template-columns: repeat(2, 105mm);
      grid-template-rows: repeat(6, 48mm);
      padding-top: 4.5mm;
      padding-bottom: 4.5mm;
    }

    .label {
      width: 105mm;
      height: 48mm;
      border: 0.5px solid #ccc;
      padding: 4mm 5mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }

    .label-name {
      font-size: 13pt;
      font-weight: bold;
      line-height: 1.2;
      word-break: break-word;
    }

    .label-row {
      display: flex;
      gap: 6mm;
      font-size: 10pt;
      flex-wrap: wrap;
    }

    .label-field {
      white-space: nowrap;
    }

    .field-key {
      font-weight: bold;
    }

    .label-manufacturer {
      font-size: 9pt;
      color: #555;
      word-break: break-word;
    }
  </style>
</head>
<body>
  <div class="sheet">
    ${labelItems.join('\n')}
  </div>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function generateLabelPDF(labelData) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    const html = buildLabelHTML(labelData);

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    const filename = `templates/${uuidv4()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(filename, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Supabase storage upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage.from('pdfs').getPublicUrl(filename);

    return urlData.publicUrl;
  } finally {
    await browser.close();
  }
}

module.exports = { generateLabelPDF };
