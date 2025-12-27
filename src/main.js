import { Game } from './core/Game.js';

const game = new Game();

// Start button
document.getElementById('start-btn').addEventListener('click', () => {
  game.start();
});

// Restart button
document.getElementById('restart-btn').addEventListener('click', () => {
  game.restart();
});
