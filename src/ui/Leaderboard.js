// Leaderboard.js - High scores display with country flags
// TODO: Implement leaderboard UI

const API_BASE = '/api';

export class Leaderboard {
  constructor() {
    // TODO: Initialize leaderboard UI
  }

  async fetchScores(limit = 20) {
    // TODO: GET /api/scores
  }

  async submitScore(playerName, score, strength) {
    // TODO: POST /api/scores
    // TODO: Country detected server-side via CF-IPCountry
  }

  async getRank(score) {
    // TODO: GET /api/scores/rank?score=X
  }

  countryCodeToFlag(countryCode) {
    // TODO: Convert ISO code to flag emoji (e.g., "US" -> flag)
  }

  show() {
    // TODO: Display leaderboard screen
  }

  hide() {
    // TODO: Hide leaderboard screen
  }
}
