import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

function sanitizeGuest(raw: string | null): string {
  let s = (raw || 'Invitado/a').normalize('NFKC').trim();
  if (!s) s = 'Invitado/a';
  s = s.replace(/[\x00-\x1f\x7f<>]/g, '').slice(0, 64);
  return s || 'Invitado/a';
}

async function loadFonts(origin: string) {
  const base = `${origin}/assets/fonts`;
  const [italicRes, romanRes, monoRes] = await Promise.all([
    fetch(`${base}/IMFeENit28P.ttf`),
    fetch(`${base}/IMFeENrm28P.ttf`),
    fetch(`${base}/IBMPlexMono-Medium.ttf`),
  ]);
  if (!italicRes.ok || !romanRes.ok || !monoRes.ok) {
    throw new Error('fonts_unavailable');
  }
  return Promise.all([italicRes.arrayBuffer(), romanRes.arrayBuffer(), monoRes.arrayBuffer()]);
}

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const guest = sanitizeGuest(searchParams.get('n'));
  const nameSize = guest.length <= 18 ? 72 : Math.max(38, 72 - (guest.length - 18) * 2);
  const nameMd = Math.max(22, Math.min(30, Math.round(nameSize * 0.48)));

  const origin = new URL(request.url).origin;

  let italicData: ArrayBuffer;
  let romanData: ArrayBuffer;
  let monoData: ArrayBuffer;
  try {
    [italicData, romanData, monoData] = await loadFonts(origin);
  } catch {
    return Response.redirect(new URL('/assets/og-preview.png', request.url), 302);
  }

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
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 1400,
            height: 900,
            left: -100,
            top: -120,
            background: 'radial-gradient(ellipse at 50% 45%, rgba(245,230,190,0.09), transparent 55%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 48,
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 20,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.58)',
              fontFamily: 'IBM Plex Mono',
            }}
          >
            INVITACIÓN EXCLUSIVA
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 15,
              letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.42)',
              fontFamily: 'IBM Plex Mono',
            }}
          >
            Solo con enlace nominal · SS26
          </div>
          <div
            style={{
              marginTop: 36,
              fontSize: nameSize,
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.92)',
              fontFamily: 'IM Fell English',
            }}
          >
            {guest}
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: 28,
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.9)',
              fontFamily: 'IM Fell English',
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
            paddingBottom: 28,
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 680,
              height: 320,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                marginLeft: -340,
                width: 0,
                height: 0,
                borderLeft: '340px solid transparent',
                borderRight: '340px solid transparent',
                borderTop: '120px solid #1e1c17',
              }}
            />
            <div
              style={{
                marginTop: 96,
                marginLeft: 'auto',
                marginRight: 'auto',
                width: 620,
                height: 224,
                backgroundColor: '#151311',
                border: '1px solid rgba(255,240,190,0.13)',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: '28px 36px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: 14,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.48)',
                    fontFamily: 'IBM Plex Mono',
                  }}
                >
                  DE PARTE DE
                </span>
                <span
                  style={{
                    marginTop: 6,
                    fontSize: 22,
                    color: 'rgba(255,255,255,0.72)',
                    fontFamily: 'IM Fell English',
                  }}
                >
                  giot × Expresso Martínez
                </span>
                <div style={{ marginTop: 'auto' }}>
                  <span
                    style={{
                      fontSize: 14,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.52)',
                      fontFamily: 'IBM Plex Mono',
                    }}
                  >
                    PARA
                  </span>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: nameMd,
                      fontStyle: 'italic',
                      color: 'rgba(255,255,255,0.78)',
                      fontFamily: 'IM Fell English',
                    }}
                  >
                    {guest}
                  </div>
                  <span
                    style={{
                      marginTop: 8,
                      fontSize: 14,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.42)',
                      fontFamily: 'IBM Plex Mono',
                    }}
                  >
                    Inauguración SS26 · Madrid
                  </span>
                </div>
              </div>
              <div
                style={{
                  width: 104,
                  height: 104,
                  borderRadius: 999,
                  border: '3px solid #c8281e',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    color: '#c8281e',
                    fontFamily: 'IM Fell English',
                    lineHeight: 1.1,
                  }}
                >
                  giot
                </span>
                <span style={{ fontSize: 18, color: '#c8281e', fontFamily: 'IM Fell English' }}>× EM</span>
                <span
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    letterSpacing: '0.12em',
                    color: 'rgba(200,40,30,0.85)',
                    fontFamily: 'IBM Plex Mono',
                  }}
                >
                  JUN 2026
                </span>
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 15,
              letterSpacing: '0.06em',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'IBM Plex Mono',
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
      fonts: [
        { name: 'IM Fell English', data: italicData, style: 'italic', weight: 400 },
        { name: 'IM Fell English', data: romanData, style: 'normal', weight: 400 },
        { name: 'IBM Plex Mono', data: monoData, style: 'normal', weight: 500 },
      ],
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    }
  );
  } catch {
    return Response.redirect(new URL('/assets/og-preview.png', request.url), 302);
  }
}
