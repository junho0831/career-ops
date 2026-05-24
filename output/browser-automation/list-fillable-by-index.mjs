import { getDefaultContext } from './_cdp.mjs';

async function main() {
  const pageIndex = Number(process.argv[2]);
  if (Number.isNaN(pageIndex)) {
    throw new Error('Usage: node list-fillable-by-index.mjs <pageIndex>');
  }

  const { browser, context } = await getDefaultContext();
  const page = context.pages()[pageIndex];
  if (!page) {
    throw new Error(`No page at index ${pageIndex}`);
  }

  const fields = await page.evaluate(() => {
    function nearbyText(el) {
      const parts = [];
      const labels = el.labels ? Array.from(el.labels) : [];
      for (const label of labels) {
        parts.push((label.textContent || '').trim());
      }

      const container = el.closest('li, dl, div, section, article, tr');
      if (container) {
        const heading = container.querySelector('label, strong, th, dt, h1, h2, h3, h4, .tit, .title');
        if (heading) {
          parts.push((heading.textContent || '').trim());
        }
      }

      const prev = el.previousElementSibling;
      if (prev) {
        parts.push((prev.textContent || '').trim());
      }

      return parts.join(' | ').replace(/\s+/g, ' ').trim().slice(0, 200);
    }

    return Array.from(document.querySelectorAll('input, textarea, [contenteditable="true"]'))
      .filter((el) => {
        const tag = el.tagName.toLowerCase();
        const type = (el.getAttribute('type') || '').toLowerCase();
        if (tag === 'textarea') return true;
        if (tag === 'input' && ['text', 'email', 'tel', 'search', 'number'].includes(type)) return true;
        return el.getAttribute('contenteditable') === 'true';
      })
      .map((el, index) => ({
        index,
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type') || '',
        id: el.id || '',
        name: el.getAttribute('name') || '',
        placeholder: el.getAttribute('placeholder') || '',
        label: nearbyText(el),
        value: ('value' in el ? String(el.value || '') : el.textContent || '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 500),
      }));
  });

  console.log(JSON.stringify({
    title: await page.title(),
    url: page.url(),
    fields,
  }, null, 2));

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
