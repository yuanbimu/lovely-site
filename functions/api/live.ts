import { Hono } from 'hono';

const app = new Hono();

const BILIBILI_UID = '3821157';

interface LiveStatusResponse {
  isLive: boolean;
  title: string;
  url: string;
  roomId: string;
  lastChecked: string;
}

app.get('/', async (c) => {
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
        live_status: number;
        title: string;
        room_id: number;
      };
    };

    if (data.code === 0 && data.data) {
      const { live_status, title, room_id } = data.data;
      const isLive = live_status === 1;

      const result: LiveStatusResponse = {
        isLive,
        title: isLive ? title : '',
        url: isLive ? `https://live.bilibili.com/${room_id}` : '',
        roomId: room_id?.toString() || '',
        lastChecked,
      };

      return c.json(result, 200, {
        'Cache-Control': 'public, max-age=900',
        'Content-Type': 'application/json',
      });
    }

    throw new Error('API response error');
  } catch (error) {
    const result: LiveStatusResponse = {
      isLive: false,
      title: '',
      url: '',
      roomId: '',
      lastChecked,
    };

    return c.json(result, 200, {
      'Cache-Control': 'public, max-age=60',
      'Content-Type': 'application/json',
    });
  }
});

export default app;