// Leaderboard.js - High scores UI and API integration

// API base URL - use custom domain in production
const API_BASE = import.meta.env.PROD
  ? 'https://march-of-pixels-api.repetitive.games'
  : '/api';

// Country code to flag emoji mapping
function countryToFlag(countryCode) {
  if (!countryCode || countryCode === 'XX' || countryCode.length !== 2) {
    return '🌍'; // Globe for unknown
  }

  // Convert country code to regional indicator symbols
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
}

// Format score with commas
function formatScore(score) {
  return score.toLocaleString();
}

// Format date to relative time
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export class Leaderboard {
  constructor() {
    this.scores = [];
    this.isLoading = false;
    this.currentPlayerScore = null;
    this.currentPlayerRank = null;
  }

  async fetchScores(limit = 20) {
    this.isLoading = true;

    try {
      const response = await fetch(`${API_BASE}/scores?limit=${limit}`);
      const data = await response.json();
      this.scores = data.scores || [];
      return this.scores;
    } catch (error) {
      console.error('Failed to fetch scores:', error);
      return [];
    } finally {
      this.isLoading = false;
    }
  }

  async submitScore(name, score, strength) {
    try {
      const response = await fetch(`${API_BASE}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score, strength })
      });

      const data = await response.json();

      if (data.success) {
        this.currentPlayerScore = score;
        this.currentPlayerRank = data.rank;
        return { success: true, rank: data.rank };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
      return { success: false, error: 'Network error' };
    }
  }

  async getRank(score) {
    try {
      const response = await fetch(`${API_BASE}/scores/rank?score=${score}`);
      const data = await response.json();
      return data.rank || 0;
    } catch (error) {
      console.error('Failed to get rank:', error);
      return 0;
    }
  }

  async validateName(name) {
    try {
      const response = await fetch(`${API_BASE}/validate?name=${encodeURIComponent(name)}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to validate name:', error);
      return { valid: false, error: 'Network error' };
    }
  }

  countryCodeToFlag(countryCode) {
    return countryToFlag(countryCode);
  }

  renderScoresList(container) {
    if (this.isLoading) {
      container.innerHTML = '<div class="loading">Loading scores...</div>';
      return;
    }

    if (this.scores.length === 0) {
      container.innerHTML = '<div class="empty">No scores yet. Be the first!</div>';
      return;
    }

    const html = this.scores.map((score, index) => {
      const rank = index + 1;
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
      const flag = countryToFlag(score.country);
      const isCurrentPlayer = score.score === this.currentPlayerScore;

      return `
        <div class="score-row ${isCurrentPlayer ? 'current-player' : ''}">
          <span class="rank">${medal}</span>
          <span class="flag">${flag}</span>
          <span class="name">${this.escapeHtml(score.name)}</span>
          <span class="score">${formatScore(score.score)}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  show() {
    const screen = document.getElementById('leaderboard-screen');
    if (screen) {
      screen.classList.remove('hidden');
      this.fetchScores().then(() => {
        const container = document.getElementById('scores-list');
        if (container) {
          this.renderScoresList(container);
        }
      });
    }
  }

  hide() {
    const screen = document.getElementById('leaderboard-screen');
    if (screen) {
      screen.classList.add('hidden');
    }
  }
}
