import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title') || 'SkillScrolls';
    const category = searchParams.get('category') || 'Technical Archive';
    const image = searchParams.get('image');

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            backgroundColor: '#000',
            backgroundImage: image ? `url(${image})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '80px',
          }}
        >
          {/* Overlay sombre */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#71717a',
                textTransform: 'uppercase',
                letterSpacing: '0.4em',
                marginBottom: '20px',
              }}
            >
              Archive Node / {category}
            </div>
            <div
              style={{
                fontSize: 80,
                fontWeight: 'black',
                color: 'white',
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              {title}
            </div>
            <div
              style={{
                marginTop: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              <div style={{ width: 40, height: 2, backgroundColor: '#3f3f46' }} />
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#a1a1aa',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                }}
              >
                SkillScrolls Technical Intelligence
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
