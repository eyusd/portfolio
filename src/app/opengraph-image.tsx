import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Clément Chardine Portfolio';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#071618', // Dark theme background: hsl(191 58.5% 3.84%)
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
          }}
        >
          {/* Gear emoji favicon */}
          <div style={{ fontSize: 120 }}>⚙️</div>
          
          {/* Name */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: '#F0F8F9', // Foreground: hsl(191 9% 97.4%)
                letterSpacing: '-0.02em',
              }}
            >
              Chardine
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
