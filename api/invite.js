const fs = require('fs');
const path = require('path');

function sanitizeGuest(raw) {
  let s = (raw || 'Invitado/a').normalize('NFKC').trim();
  if (!s) s = 'Invitado/a';
  s = s.replace(/[\x00-\x1f\x7f<>]/g, '').slice(0, 64);
  return s || 'Invitado/a';
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = async (req, res) => {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const base = `${proto}://${host}`;

  const url = new URL(req.url || '/', `http://${host}`);
  const guest = sanitizeGuest(url.searchParams.get('n'));

  const qs = url.searchParams.toString();
  const pageUrl = `${base}${qs ? `/?${qs}` : '/'}`;

  const pageTitle = `Invitación · ${guest} · giot × EM`;
  const ogTitle = `Invitación exclusiva para ${guest} · giot × Expresso Martínez`;
  const description = `${guest} — Inauguración SS26 · giot × Expresso Martínez · 18 Jun 2026, 20:00 h · Madrid. Solo con invitación.`;
  const ogAlt = `Invitación exclusiva para ${guest}: giot × Expresso Martínez, SS26, Madrid.`;
  const ogImage = `${base}/api/og/i/${encodeURIComponent(guest)}`;

  let htmlPath = path.join(__dirname, 'invite-template.html');
  if (!fs.existsSync(htmlPath)) {
    htmlPath = path.join(process.cwd(), 'api', 'invite-template.html');
  }
  let html = fs.readFileSync(htmlPath, 'utf8');

  html = html
    .replace(/__INVITE_PAGE_TITLE__/g, escapeHtml(pageTitle))
    .replace(/__INVITE_PAGE_URL__/g, escapeHtml(pageUrl))
    .replace(/__INVITE_META_DESCRIPTION__/g, escapeHtml(description))
    .replace(/__INVITE_OG_TITLE__/g, escapeHtml(ogTitle))
    .replace(/__INVITE_OG_DESCRIPTION__/g, escapeHtml(description))
    .replace(/__INVITE_OG_IMAGE__/g, ogImage)
    .replace(/__INVITE_OG_ALT__/g, escapeHtml(ogAlt))
    .replace(/__INVITE_TWITTER_TITLE__/g, escapeHtml(ogTitle))
    .replace(/__INVITE_TWITTER_DESCRIPTION__/g, escapeHtml(description))
    .replace(/__INVITE_TWITTER_IMAGE__/g, ogImage)
    .replace(/__INVITE_TWITTER_ALT__/g, escapeHtml(ogAlt));

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400');
  res.status(200).send(html);
};
