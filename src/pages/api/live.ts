// Astro API endpoint for live status - used in local development
// In production, Cloudflare Pages Functions will handle this

const BILIBILI_UID = '3821157';
const REQUEST_TIMEOUT = 10000; // 10 seconds timeout

interface LiveStatusResponse {
  isLive: boolean;
  title: string;
  url: string;
  roomId: string;
  lastChecked: string;
  error?: string;
}

// Fetch with timeout helper
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function GET() {
  const lastChecked = new Date().toISOString();

  try {
    const response = await fetchWithTimeout(
      `https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid=${BILIBILI_UID}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://live.bilibili.com/',
          'Accept': 'application/json',
        },
      },
      REQUEST_TIMEOUT
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as {
      code: number;
      message?: string;
      data?: {
        liveStatus: number;
        title: string;
        roomid: number;
      };
    };

    // Handle Bilibili API error codes
    if (data.code !== 0) {
      console.error(`[Live API] Bilibili API error: ${data.code} - ${data.message || 'Unknown error'}`);
      throw new Error(`Bilibili API error: ${data.code}`);
    }

    if (data.data) {
      const { liveStatus, title, roomid } = data.data;
      const isLive = liveStatus === 1;

      const result: LiveStatusResponse = {
        isLive,
        title: isLive ? (title || '直播中') : '',
        url: isLive ? `https://live.bilibili.com/${roomid}` : '',
        roomId: roomid?.toString() || '',
        lastChecked,
      };

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=900, stale-while-revalidate=60', // 15 minutes cache, allow stale for 60s
          'Vary': 'Accept-Encoding',
        },
      });
    }

    throw new Error('Invalid API response structure');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Live API] Error:', errorMessage);
    
    // Return graceful degradation - assume offline
    const result: LiveStatusResponse = {
      isLive: false,
      title: '',
      url: '',
      roomId: '',
      lastChecked,
      error: errorMessage,
    };

    return new Response(JSON.stringify(result), {
      status: 200, // Return 200 to avoid client-side error handling complexity
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60', // Shorter cache on error
      },
    });
  }
}