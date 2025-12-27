// Cloudflare Worker - API for March of Pixels leaderboard
import { validatePlayerName, sanitizeName } from './validation.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers - allow requests from game domain
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
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 100);
        const offset = parseInt(url.searchParams.get('offset') || '0');

        const scores = await fetchScores(env.DB, limit, offset);
        return jsonResponse(scores, corsHeaders);
      }

      // POST /api/scores - Submit new score
      if (path === '/api/scores' && request.method === 'POST') {
        const body = await request.json();
        const country = request.headers.get('CF-IPCountry') || 'XX';

        const result = await submitScore(env.DB, body, country);
        return jsonResponse(result, corsHeaders, result.success ? 200 : 400);
      }

      // GET /api/scores/rank - Get rank for a specific score
      if (path === '/api/scores/rank' && request.method === 'GET') {
        const score = parseInt(url.searchParams.get('score') || '0');
        const rank = await getRank(env.DB, score);
        return jsonResponse({ rank }, corsHeaders);
      }

      // GET /api/validate - Validate a player name
      if (path === '/api/validate' && request.method === 'GET') {
        const name = url.searchParams.get('name') || '';
        const validation = validatePlayerName(name);
        return jsonResponse(validation, corsHeaders);
      }

      // Health check
      if (path === '/api/health') {
        return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() }, corsHeaders);
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('API Error:', error);
      return jsonResponse({ error: error.message }, corsHeaders, 500);
    }
  }
};

/**
 * Create JSON response
 */
function jsonResponse(data, corsHeaders, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

/**
 * Fetch top scores from database
 */
async function fetchScores(db, limit, offset) {
  const result = await db.prepare(`
    SELECT
      id,
      player_name,
      score,
      strength,
      country_code,
      created_at
    FROM scores
    ORDER BY score DESC
    LIMIT ? OFFSET ?
  `).bind(limit, offset).all();

  return {
    scores: result.results.map(row => ({
      id: row.id,
      name: row.player_name,
      score: row.score,
      strength: row.strength,
      country: row.country_code,
      date: row.created_at
    })),
    total: result.results.length
  };
}

/**
 * Submit a new score
 */
async function submitScore(db, body, countryCode) {
  const { name, score, strength } = body;

  // Validate player name
  const validation = validatePlayerName(name);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Validate score and strength
  if (typeof score !== 'number' || score < 0 || score > 999999999) {
    return { success: false, error: 'Invalid score' };
  }
  if (typeof strength !== 'number' || strength < 0 || strength > 999999) {
    return { success: false, error: 'Invalid strength' };
  }

  // Sanitize name
  const sanitizedName = sanitizeName(name);

  // Insert score
  const result = await db.prepare(`
    INSERT INTO scores (player_name, score, strength, country_code)
    VALUES (?, ?, ?, ?)
  `).bind(sanitizedName, Math.floor(score), Math.floor(strength), countryCode).run();

  // Get the rank of this score
  const rank = await getRank(db, score);

  return {
    success: true,
    id: result.meta.last_row_id,
    rank
  };
}

/**
 * Get the rank for a given score
 */
async function getRank(db, score) {
  const result = await db.prepare(`
    SELECT COUNT(*) as count
    FROM scores
    WHERE score > ?
  `).bind(score).first();

  return (result?.count || 0) + 1;
}
