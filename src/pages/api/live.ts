// Astro API endpoint for live status - used in local development
// In production, Cloudflare Pages Functions will handle this

const BILIBILI_UID = '3821157';

interface LiveStatusResponse {
  isLive: boolean;
  title: string;
  url: string;
  roomId: string;
  lastChecked: string;
}

export async function GET() {
  const lastChecked = new Date().toISOString();

  try {
    const response = await fetch(
      `https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid=${BILIBILI_UID}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://live.bilibili.com/',
        },
      }
    );

    const data = await response.json() as {
      code: number;
      data?: {
        liveStatus: number;
        title: string;
        roomid: number;
      };
    };

    if (data.code === 0 && data.data) {
      const { liveStatus, title, roomid } = data.data;
      const isLive = liveStatus === 1;

      const result: LiveStatusResponse = {
        isLive,
        title: isLive ? title : '',
        url: isLive ? `https://live.bilibili.com/${roomid}` : '',
        roomId: roomid?.toString() || '',
        lastChecked,
      };

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=900', // 15 minutes
        },
      });
    }

    throw new Error('API response error');
  } catch (error) {
    console.error('[Live API] Error:', error);
    
    const result: LiveStatusResponse = {
      isLive: false,
      title: '',
      url: '',
      roomId: '',
      lastChecked,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
    });
  }
}