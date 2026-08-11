/**
 * IndexNow utility for notifying search engines of content changes.
 * Implemented as a stub - replace with your IndexNow API key and endpoint.
 */

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '';

/**
 * Submit a single URL to IndexNow for immediate reindexing.
 * Supports both Bing (default) and Yandex.
 */
export async function submitUrlToIndexNow(url: string): Promise<boolean> {
  if (!INDEXNOW_KEY) {
    // No key configured - silently skip
    return false;
  }

  const indexNowUrl = `https://www.bing.com/indexnow?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}`;

  try {
    const res = await fetch(indexNowUrl, { method: 'GET' });
    return res.ok;
  } catch {
    console.error('[IndexNow] Failed to submit URL:', url);
    return false;
  }
}

/**
 * Notify IndexNow that a product has been created or updated.
 */
export async function submitProductToIndexNow(productSlug: string): Promise<boolean> {
  const baseUrl = process.env.SITE_URL || 'https://cansansolutions.shop';
  const productUrl = `${baseUrl}/products/${productSlug}`;
  return submitUrlToIndexNow(productUrl);
}
