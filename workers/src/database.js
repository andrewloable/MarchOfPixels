// database.js - D1 database operations
// TODO: Implement database functions

/**
 * Initialize database schema
 * Run with: wrangler d1 execute march-of-pixels-scores --file=schema.sql
 */
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  strength INTEGER NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'XX',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at DESC);
`;

/**
 * Fetch top scores
 * @param {D1Database} db
 * @param {number} limit
 * @param {number} offset
 */
export async function fetchScores(db, limit = 20, offset = 0) {
  // TODO: Implement query
  const result = await db.prepare(
    'SELECT * FROM scores ORDER BY score DESC LIMIT ? OFFSET ?'
  ).bind(limit, offset).all();
  return result.results;
}

/**
 * Submit a new score
 * @param {D1Database} db
 * @param {string} playerName
 * @param {number} score
 * @param {number} strength
 * @param {string} countryCode
 */
export async function submitScore(db, playerName, score, strength, countryCode) {
  // TODO: Implement insert
  const result = await db.prepare(
    'INSERT INTO scores (player_name, score, strength, country_code) VALUES (?, ?, ?, ?)'
  ).bind(playerName, score, strength, countryCode).run();
  return result;
}

/**
 * Get rank for a specific score
 * @param {D1Database} db
 * @param {number} score
 */
export async function getRank(db, score) {
  // TODO: Implement rank query
  const result = await db.prepare(
    'SELECT COUNT(*) as rank FROM scores WHERE score > ?'
  ).bind(score).first();
  return (result?.rank || 0) + 1;
}
