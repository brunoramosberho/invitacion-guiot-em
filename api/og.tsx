import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

function sanitizeGuest(raw: string | null): string {
  let s = (raw || 'Invitado/a').normalize('NFKC').trim();
  if (!s) s = 'Invitado/a';
  s = s.replace(/[\x00-\x1f\x7f<>]/g, '').slice(0, 64);
  return s || 'Invitado/a';
}

/** Meta exige 200 + PNG en esta URL; un 302 a menudo se marca como imagen inválida. */
async function staticPngResponse(request: Request): Promise<Response> {
  const r = await fetch(new URL('/assets/og-preview.png', request.url));
  if (!r.ok) {
    return new Response('Unavailable', { status: 502, headers: { 'Content-Type': 'text/plain' } });
  }
  const buf = await r.arrayBuffer();
  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const guest = sanitizeGuest(searchParams.get('n'));
  const nameSize = guest.length <= 18 ? 68 : Math.max(36, 68 - (guest.length - 18) * 2);
  const nameMd = Math.max(20, Math.min(28, Math.round(nameSize * 0.45)));

  try {
    return new ImageResponse(
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
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
  } catch {
    return staticPngResponse(request);
  }
}
