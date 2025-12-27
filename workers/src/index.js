// Cloudflare Worker - API for March of Pixels leaderboard
// TODO: Implement API endpoints

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // GET /api/scores - Fetch top scores
      if (path === '/api/scores' && request.method === 'GET') {
        // TODO: Implement fetchScores(env.DB, url.searchParams)
        return new Response(JSON.stringify({ scores: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // POST /api/scores - Submit new score
      if (path === '/api/scores' && request.method === 'POST') {
        // TODO: Get country from CF-IPCountry header
        const country = request.headers.get('CF-IPCountry') || 'XX';
        // TODO: Implement submitScore(env.DB, body, country)
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // GET /api/scores/rank - Get rank for score
      if (path === '/api/scores/rank' && request.method === 'GET') {
        // TODO: Implement getRank(env.DB, url.searchParams.get('score'))
        return new Response(JSON.stringify({ rank: 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
