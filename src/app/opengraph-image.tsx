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
          fontSize: 128,
          background: 'linear-gradient(to bottom right, #0ea5a4, #0d9488)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui',
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 20 }}>Clément Chardine</div>
        <div style={{ fontSize: 48, opacity: 0.9 }}>Software Engineer</div>
      </div>
    ),
    {
      ...size,
    }
  );
}
