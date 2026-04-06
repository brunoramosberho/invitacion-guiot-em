import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

function sanitizeGuest(raw: string | null): string {
  let s = (raw || 'Invitado/a').normalize('NFKC').trim();
  if (!s) s = 'Invitado/a';
  s = s.replace(/[\x00-\x1f\x7f<>]/g, '').slice(0, 64);
  return s || 'Invitado/a';
}

/** Vercel Edge a veces entrega `request.url` sin query; otras cabeceras conservan ?n=. */
function extractParamN(request: Request): string | null {
  const headerUrls = [
    request.headers.get('x-vercel-forwarded-url'),
    request.headers.get('x-forwarded-uri'),
    request.headers.get('x-original-url'),
    request.headers.get('x-invoke-path'),
    request.url,
  ].filter(Boolean) as string[];

  for (const raw of headerUrls) {
    const m = /[?&]n=([^&]*)/.exec(raw);
    if (m) {
      let v = m[1].replace(/\+/g, ' ');
      try {
        v = decodeURIComponent(v);
      } catch {
        /* valor ya plano */
      }
      const t = v.normalize('NFKC').trim();
      if (t) return t;
    }
  }

  for (const raw of headerUrls) {
    if (!raw.startsWith('http')) continue;
    try {
      const n = new URL(raw).searchParams.get('n');
      if (n && n.trim()) return n.trim();
    } catch {
      /* ignore */
    }
  }

  try {
    const u = new URL(
      request.url,
      `https://${request.headers.get('host') || 'localhost'}/`
    );
    const n = u.searchParams.get('n');
    if (n && n.trim()) return n.trim();
  } catch {
    /* ignore */
  }

  return null;
}

function requestOrigin(request: Request): string {
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  if (host) return `${proto}://${host}`;
  try {
    return new URL(request.url).origin;
  } catch {
    return 'https://localhost';
  }
}

export default async function handler(request: Request) {
  const guest = sanitizeGuest(extractParamN(request));
  const nameSize = guest.length <= 18 ? 68 : Math.max(36, 68 - (guest.length - 18) * 2);
  const nameMd = Math.max(20, Math.min(28, Math.round(nameSize * 0.45)));

  try {
    const image = new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#080706',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: 44,
            }}
          >
            <div
              style={{
                fontSize: 19,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.55)',
              }}
            >
              INVITACIÓN EXCLUSIVA
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 14,
                letterSpacing: '0.06em',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              Solo con enlace nominal · SS26
            </div>
            <div
              style={{
                marginTop: 32,
                fontSize: nameSize,
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              {guest}
            </div>
            <div
              style={{
                marginTop: 16,
                fontSize: 26,
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              Para ti · giot × Expresso Martínez
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              width: '100%',
              paddingBottom: 24,
            }}
          >
            <div
              style={{
                width: 620,
                height: 200,
                backgroundColor: '#151311',
                border: '1px solid rgba(255,240,190,0.15)',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: '24px 32px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.45)',
                    }}
                  >
                    DE PARTE DE
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 20,
                      color: 'rgba(255,255,255,0.7)',
                    }}
                  >
                    giot × Expresso Martínez
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.48)',
                    }}
                  >
                    PARA
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: nameMd,
                      fontStyle: 'italic',
                      color: 'rgba(255,255,255,0.78)',
                    }}
                  >
                    {guest}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 13,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.38)',
                    }}
                  >
                    Inauguración SS26 · Madrid
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  border: '3px solid #c8281e',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontSize: 17, color: '#c8281e', lineHeight: 1.1 }}>giot</div>
                <div style={{ fontSize: 17, color: '#c8281e' }}>× EM</div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    color: 'rgba(200,40,30,0.9)',
                  }}
                >
                  JUN 2026
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: 18,
                fontSize: 14,
                letterSpacing: '0.05em',
                color: 'rgba(255,255,255,0.38)',
              }}
            >
              18 Jun 2026 · 20:00 h · Expresso Martínez · Chamberí
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    );

    const buf = await image.arrayBuffer();
    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'private, no-cache, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      },
    });
  } catch {
    const r = await fetch(`${requestOrigin(request)}/assets/og-preview.png`);
    if (!r.ok) {
      return new Response('og_fallback_failed', { status: 502 });
    }
    const buf = await r.arrayBuffer();
    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'private, no-cache, max-age=0',
        'CDN-Cache-Control': 'no-store',
      },
    });
  }
}
