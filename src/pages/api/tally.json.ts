import type { APIRoute } from 'astro';
import { loadTallySubmissions, getTallyStatistics } from '../../lib/loaders/tallyLoader';
import { tallyAPI } from '../../lib/tally-cached';

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const getAll = searchParams.get('getAll') === 'true';
    const type = searchParams.get('type') || 'submissions';
    const bypassCache = searchParams.get('bypassCache') === 'true';

    let data;

    switch (type) {
      case 'statistics':
        data = await getTallyStatistics({ page, limit, getAll });
        break;
      case 'submissions':
      default:
        data = await loadTallySubmissions({ page, limit, getAll });
        break;
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch Tally data',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

export const POST: APIRoute = async ({ url }) => {
  try {
    const searchParams = url.searchParams;
    const action = searchParams.get('action');

    if (action === 'clearCache') {
      tallyAPI.clearCache();
      return new Response(JSON.stringify({ success: true, message: 'Cache cleared' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to perform action',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
