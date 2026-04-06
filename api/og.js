const React = require('react');
const satori = require('satori').default;
const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const e = React.createElement;

function sanitizeGuest(raw) {
  let s = (raw || 'Invitado/a').normalize('NFKC').trim();
  if (!s) s = 'Invitado/a';
  s = s.replace(/[\x00-\x1f\x7f<>]/g, '').slice(0, 64);
  return s || 'Invitado/a';
}

function pathnameOnly(raw) {
  try {
    if (raw.startsWith('http')) return new URL(raw).pathname;
    return new URL(raw, 'https://placeholder.local').pathname;
  } catch {
    return String(raw).split('?')[0].split('#')[0] || '';
  }
}

function decodeOgToken(segment) {
  if (!segment || segment.length > 180) return null;
  const clean = segment.replace(/[^A-Za-z0-9+/=_-]/g, '');
  if (!clean) return null;
  let b64 = clean.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (b64.length % 4)) % 4;
  b64 += '='.repeat(pad);
  try {
    const s = Buffer.from(b64, 'base64').toString('utf8').normalize('NFKC').trim();
    return s || null;
  } catch {
    return null;
  }
}

function guestFromTokenPath(pathname) {
  const m = /\/api\/og\/s\/([^/?#]+)/.exec(pathname);
  if (!m) return null;
  let seg = m[1];
  try {
    seg = decodeURIComponent(seg);
  } catch {
    /* */
  }
  return decodeOgToken(seg);
}

function guestFromInvitePath(pathname) {
  const m = /\/api\/og\/i\/([^/?#]+)/.exec(pathname);
  if (!m) return null;
  try {
    const g = decodeURIComponent(m[1]);
    return g.normalize('NFKC').trim() || null;
  } catch {
    return null;
  }
}

function extractParamN(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const rel = req.url || '/';
  const absolute = `${proto}://${host}${rel.startsWith('/') ? rel : '/' + rel}`;

  const headerUrls = [
    req.headers['x-vercel-forwarded-url'],
    req.headers['x-forwarded-uri'],
    req.headers['x-original-url'],
    req.headers['x-invoke-path'],
    absolute,
    rel,
  ].filter(Boolean);

  for (const raw of headerUrls) {
    const pn = pathnameOnly(raw);
    const a = guestFromTokenPath(pn);
    if (a) return a;
    const b = guestFromInvitePath(pn);
    if (b) return b;
  }

  for (const raw of headerUrls) {
    const mt = /[?&]t=([^&]*)/.exec(raw);
    if (mt) {
      let seg = mt[1].replace(/\+/g, ' ');
      try {
        seg = decodeURIComponent(seg);
      } catch {
        /* */
      }
      const g = decodeOgToken(seg);
      if (g) return g;
    }
  }

  for (const raw of headerUrls) {
    const m = /[?&]n=([^&]*)/.exec(raw);
    if (m) {
      let v = m[1].replace(/\+/g, ' ');
      try {
        v = decodeURIComponent(v);
      } catch {
        /* */
      }
      const t = v.normalize('NFKC').trim();
      if (t) return t;
    }
  }

  for (const raw of headerUrls) {
    if (!raw.startsWith('http')) continue;
    try {
      const sp = new URL(raw).searchParams;
      const t = sp.get('t');
      if (t) {
        const g = decodeOgToken(t);
        if (g) return g;
      }
      const n = sp.get('n');
      if (n && n.trim()) return n.trim();
    } catch {
      /* */
    }
  }

  try {
    const u = new URL(rel, `http://${host}/`);
    const t = u.searchParams.get('t');
    if (t) {
      const g = decodeOgToken(t);
      if (g) return g;
    }
    const n = u.searchParams.get('n');
    if (n && n.trim()) return n.trim();
  } catch {
    /* */
  }

  return null;
}

function fontData() {
  const candidates = [
    path.join(process.cwd(), 'assets', 'fonts', 'IBMPlexMono-Medium.ttf'),
    path.join(__dirname, '..', 'assets', 'fonts', 'IBMPlexMono-Medium.ttf'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return fs.readFileSync(p);
  }
  throw new Error('missing_font_IBMPlexMono-Medium.ttf');
}

function buildTree(guest, nameSize, nameMd) {
  const mono = 'IBM Plex Mono';
  return e(
    'div',
    {
      style: {
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#080706',
        fontFamily: mono,
      },
    },
    e(
      'div',
      { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 44 } },
      e(
        'div',
        {
          style: {
            fontSize: 19,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)',
          },
        },
        'INVITACIÓN EXCLUSIVA'
      ),
      e(
        'div',
        { style: { marginTop: 10, fontSize: 14, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)' } },
        'Solo con enlace nominal · SS26'
      ),
      e(
        'div',
        { style: { marginTop: 32, fontSize: nameSize, color: 'rgba(255,255,255,0.92)' } },
        guest
      ),
      e(
        'div',
        { style: { marginTop: 16, fontSize: 26, color: 'rgba(255,255,255,0.85)' } },
        'Para ti · giot × Expresso Martínez'
      )
    ),
    e(
      'div',
      {
        style: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          width: '100%',
          paddingBottom: 24,
        },
      },
      e(
        'div',
        {
          style: {
            width: 620,
            height: 200,
            backgroundColor: '#151311',
            border: '1px solid rgba(255,240,190,0.15)',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: '24px 32px',
          },
        },
        e(
          'div',
          { style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } },
          e(
            'div',
            { style: { display: 'flex', flexDirection: 'column' } },
            e(
              'div',
              {
                style: {
                  fontSize: 13,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.45)',
                },
              },
              'DE PARTE DE'
            ),
            e(
              'div',
              { style: { marginTop: 6, fontSize: 20, color: 'rgba(255,255,255,0.7)' } },
              'giot × Expresso Martínez'
            )
          ),
          e(
            'div',
            { style: { display: 'flex', flexDirection: 'column' } },
            e(
              'div',
              {
                style: {
                  fontSize: 13,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.48)',
                },
              },
              'PARA'
            ),
            e(
              'div',
              { style: { marginTop: 4, fontSize: nameMd, color: 'rgba(255,255,255,0.78)' } },
              guest
            ),
            e(
              'div',
              {
                style: {
                  marginTop: 6,
                  fontSize: 13,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.38)',
                },
              },
              'Inauguración SS26 · Madrid'
            )
          )
        ),
        e(
          'div',
          {
            style: {
              width: 96,
              height: 96,
              borderRadius: 48,
              border: '3px solid #c8281e',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            },
          },
          e('div', { style: { fontSize: 17, color: '#c8281e', lineHeight: 1.1 } }, 'giot'),
          e('div', { style: { fontSize: 17, color: '#c8281e' } }, '× EM'),
          e(
            'div',
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                letterSpacing: '0.1em',
                color: 'rgba(200,40,30,0.9)',
              },
            },
            'JUN 2026'
          )
        )
      ),
      e(
        'div',
        {
          style: {
            marginTop: 18,
            fontSize: 14,
            letterSpacing: '0.05em',
            color: 'rgba(255,255,255,0.38)',
          },
        },
        '18 Jun 2026 · 20:00 h · Expresso Martínez · Chamberí'
      )
    )
  );
}

module.exports = async (req, res) => {
  const guest = sanitizeGuest(extractParamN(req));
  const nameSize = guest.length <= 18 ? 68 : Math.max(36, 68 - (guest.length - 18) * 2);
  const nameMd = Math.max(20, Math.min(28, Math.round(nameSize * 0.45)));

  try {
    const font = fontData();
    const fonts = [{ name: 'IBM Plex Mono', data: font, weight: 500, style: 'normal' }];
    const element = buildTree(guest, nameSize, nameMd);
    const svg = await satori(element, { width: 1200, height: 630, fonts });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'private, no-cache, max-age=0');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
    res.setHeader('X-OG-Guest', encodeURIComponent(guest));
    res.statusCode = 200;
    res.end(Buffer.from(png));
  } catch (err) {
    console.error('og_render_error', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('og_render_error');
  }
};
