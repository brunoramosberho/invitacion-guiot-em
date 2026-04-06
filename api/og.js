const React = require('react');
const { unstable_createNodejsStream } = require('@vercel/og');
const fs = require('fs');
const path = require('path');

const e = React.createElement;

function sanitizeGuest(raw) {
  let s = (raw || 'Invitado/a').normalize('NFKC').trim();
  if (!s) s = 'Invitado/a';
  s = s.replace(/[\x00-\x1f\x7f<>]/g, '').slice(0, 64);
  return s || 'Invitado/a';
}

function buildTree(guest, nameSize, nameMd) {
  return e(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#080706',
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
        {
          style: {
            marginTop: 10,
            fontSize: 14,
            letterSpacing: '0.06em',
            color: 'rgba(255,255,255,0.4)',
          },
        },
        'Solo con enlace nominal · SS26'
      ),
      e(
        'div',
        {
          style: {
            marginTop: 32,
            fontSize: nameSize,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.9)',
          },
        },
        guest
      ),
      e(
        'div',
        {
          style: {
            marginTop: 16,
            fontSize: 26,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.85)',
          },
        },
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
            null,
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
            null,
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
              {
                style: {
                  marginTop: 4,
                  fontSize: nameMd,
                  fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.78)',
                },
              },
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

function sendStaticPng(res) {
  const pngPath = path.join(process.cwd(), 'assets', 'og-preview.png');
  const png = fs.readFileSync(pngPath);
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.statusCode = 200;
  res.end(png);
}

module.exports = async (req, res) => {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const url = new URL(req.url || '/api/og', `http://${host}`);
  const guest = sanitizeGuest(url.searchParams.get('n'));
  const nameSize = guest.length <= 18 ? 68 : Math.max(36, 68 - (guest.length - 18) * 2);
  const nameMd = Math.max(20, Math.min(28, Math.round(nameSize * 0.45)));

  try {
    const stream = await unstable_createNodejsStream(buildTree(guest, nameSize, nameMd), {
      width: 1200,
      height: 630,
    });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.statusCode = 200;
    await new Promise((resolve, reject) => {
      stream.on('error', reject);
      res.on('error', reject);
      res.on('finish', resolve);
      stream.pipe(res);
    });
  } catch {
    try {
      sendStaticPng(res);
    } catch {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('og_error');
    }
  }
};
