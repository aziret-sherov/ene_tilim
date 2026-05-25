import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Эне тилим — Кыргызский язык и культура'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#18181b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 32,
            }}
          >
            ene-tilim.online
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1,
              marginBottom: 24,
            }}
          >
            Эне тилим
          </div>
          <div
            style={{
              fontSize: 32,
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 400,
            }}
          >
            Кыргызский язык и культура
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          {['Макалдар', 'Лакаптар', 'Табышмактар', 'Ырлар', 'Жомоктор', 'Сөздүк'].map((item) => (
            <div
              key={item}
              style={{
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '8px 16px',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 16,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
