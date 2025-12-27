-- D1 Database Schema for March of Pixels
-- Run with: wrangler d1 execute march-of-pixels-scores --file=schema.sql

CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  strength INTEGER NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'XX',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for leaderboard queries (top scores)
CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);

-- Index for recent scores
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at DESC);
