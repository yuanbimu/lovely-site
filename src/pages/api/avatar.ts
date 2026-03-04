// Astro API endpoint for avatar - used in local development
// In production, Cloudflare Pages Functions will handle this

const BILIBILI_UID = '3821157';

interface AvatarResponse {
  avatarUrl: string;
  mid: string;
  lastChecked: string;
}

export async function GET() {
  const lastChecked = new Date().toISOString();

  try {
    const response = await fetch(
      `https://api.bilibili.com/x/web-interface/card?mid=${BILIBILI_UID}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://space.bilibili.com/',
        },
      }
    );

    const data = await response.json() as {
      code: number;
      data?: {
        card?: {
          face: string;
        };
      };
    };

    if (data.code === 0 && data.data?.card?.face) {
      const avatarUrl = data.data.card.face;

      const result: AvatarResponse = {
        avatarUrl,
        mid: BILIBILI_UID,
        lastChecked,
      };

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600', // 1 hour
        },
      });
    }

    throw new Error('API response error');
  } catch (error) {
    // Return fallback avatar on error
    const result: AvatarResponse = {
      avatarUrl: '/images/avatar.webp',
      mid: BILIBILI_UID,
      lastChecked,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }
}