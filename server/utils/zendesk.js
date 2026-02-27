const CACHE_TTL_MS = 300_000;
const cache = new Map();

function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

function cacheSet(key, value) {
  cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
}

function getConfig() {
  const subdomain = process.env.ZD_SUBDOMAIN;
  const email = process.env.ZD_EMAIL;
  const token = process.env.ZD_API_TOKEN;

  if (!subdomain || !email || !token) {
    throw new Error('Zendesk configuration missing. Set ZD_SUBDOMAIN, ZD_EMAIL, and ZD_API_TOKEN.');
  }

  return { subdomain, email, token };
}

function buildAuthHeader(email, token) {
  return 'Basic ' + Buffer.from(`${email}/token:${token}`).toString('base64');
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchZendeskArticles(query, opts = {}) {
  const {
    perPage = 50,
    maxPages = 4,
    multibrand = true,
    locale = '*',
  } = opts;

  if (!query || typeof query !== 'string') {
    return { query: '', count: 0, results: [] };
  }

  const cacheKey = `zd.search.v1|${query}|${perPage}|${maxPages}|${multibrand}|${locale}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const { subdomain, email, token } = getConfig();
  const authHeader = buildAuthHeader(email, token);
  const fetch = (await import('node-fetch')).default;

  const endpoints = [
    `https://${subdomain}.zendesk.com/api/v2/help_center/articles/search.json`,
    `https://${subdomain}.zendesk.com/api/v2/help_center/search.json`,
  ];

  let page = 1;
  let results = [];
  let endpointIndex = 0;

  while (page <= maxPages) {
    const params = new URLSearchParams({
      query,
      multibrand: multibrand ? 'true' : 'false',
      page: page.toString(),
      per_page: perPage.toString(),
      sort_by: 'relevance',
      sort_order: 'desc',
    });
    if (locale !== '*') params.set('locale', locale);

    const url = `${endpoints[endpointIndex]}?${params}`;

    let response;
    try {
      response = await fetch(url, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404 && endpointIndex === 0) {
        endpointIndex = 1;
        continue;
      }

      if (response.status === 429) {
        await sleep(800);
        continue;
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Zendesk search failed (${response.status}): ${text}`);
      }
    } catch (err) {
      await sleep(500);
      response = await fetch(url, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw err;
    }

    const json = await response.json();
    const pageItems = (json.results || []).map((a) => ({
      id: a.id,
      title: a.title,
      snippetHtml: a.snippet || '',
      html_url: a.html_url,
      updated_at: a.updated_at,
      locale: a.locale,
      section_id: a.section_id,
      brand_id: a.brand_id,
      is_internal: Boolean(a.user_segment_id || (a.user_segment_ids && a.user_segment_ids.length)),
    }));

    results = results.concat(pageItems);

    if (!json.results || json.results.length < perPage) break;
    page += 1;
    await sleep(120);
  }

  const payload = { query, count: results.length, results };
  cacheSet(cacheKey, payload);
  return payload;
}

function createSearchHandler() {
  return async function handleSearch(req, res) {
    try {
      const { query, perPage, maxPages, multibrand, locale } = req.body;

      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({ error: 'query string is required' });
      }

      const result = await searchZendeskArticles(query.trim(), {
        perPage,
        maxPages,
        multibrand,
        locale,
      });

      res.json(result);
    } catch (error) {
      console.error('Zendesk search error:', error);
      res.status(500).json({ error: error.message });
    }
  };
}

module.exports = {
  createSearchHandler,
  stripHtml,
};
