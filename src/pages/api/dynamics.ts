// Astro API endpoint for dynamics - used in local development
// In production, Cloudflare Pages Functions will handle this
// This version reads from local JSON file instead of D1 database

import dynamicsData from '../../data/dynamics.json';

interface Dynamic {
  id: string;
  type: string;
  content: string;
  images: string[];
  local_images?: string[];
  author: string;
  publish_time: number;
  likes: number;
  comments: number;
  reposts: number;
}

interface DynamicsResponse {
  data: Dynamic[];
  hasMore: boolean;
  total: number;
}

export async function GET({ url }: { url: URL }) {
  try {
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    
    // Limit max query
    const safeLimit = Math.min(limit, 50);
    
    // Get dynamics from local JSON
    const allDynamics = (dynamicsData as any[]).sort(
      (a, b) => b.publish_time - a.publish_time
    );
    
    const paginatedDynamics = allDynamics.slice(offset, offset + safeLimit);
    
    const response: DynamicsResponse = {
      data: paginatedDynamics,
      hasMore: offset + safeLimit < allDynamics.length,
      total: allDynamics.length
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // 5 minutes
      },
    });
  } catch (error) {
    console.error('[Dynamics API] Error:', error);
    
    return new Response(JSON.stringify({
      data: [],
      hasMore: false,
      total: 0,
      error: 'Failed to fetch dynamics'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}