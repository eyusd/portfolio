import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Clément Chardine — Software Engineer';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#071618',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          gap: '48px',
        }}
      >
        {/* CC badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '112px',
            height: '112px',
            borderRadius: '20px',
            background: '#0F2A2D',
            border: '2px solid #1E4A50',
            fontSize: 44,
            fontWeight: 700,
            color: '#F0F8F9',
            letterSpacing: '-2px',
            flexShrink: 0,
          }}
        >
          CC
        </div>

        {/* Text block */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: '#F0F8F9',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Clement Chardine
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 400,
              color: '#6B9EA4',
              letterSpacing: '0.01em',
            }}
          >
            Software Engineer · Paris, France
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 400,
              color: '#3D6A70',
              marginTop: '4px',
            }}
          >
            chardine.fr
          </div>
        </div>
      </div>
    ),
    size
  );
}
