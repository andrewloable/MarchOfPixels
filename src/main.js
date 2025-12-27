import { Game } from './core/Game.js';

const game = new Game();

// Helper to add both click and touch support
function addButtonHandler(elementId, handler) {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Click for desktop
  element.addEventListener('click', handler);

  // Touch for mobile (with prevention of double-firing)
  let touchHandled = false;
  element.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!touchHandled) {
      touchHandled = true;
      handler();
      setTimeout(() => { touchHandled = false; }, 300);
    }
  }, { passive: false });
}

// Start button
addButtonHandler('start-btn', () => game.start());

// Restart button
addButtonHandler('restart-btn', () => game.restart());

// Menu button (from game over screen)
addButtonHandler('menu-btn', () => game.goToMenu());

// Leaderboard button
addButtonHandler('leaderboard-btn', () => game.showLeaderboard());

// Close leaderboard button
addButtonHandler('close-leaderboard-btn', () => game.hideLeaderboard());

// Upgrade button (from start screen)
addButtonHandler('upgrade-btn', () => game.showUpgradeMenu());

// Close upgrade button
addButtonHandler('close-upgrade-btn', () => game.hideUpgradeMenu());

// Shop button (from start screen)
addButtonHandler('shop-btn', () => game.showIAPStore());

// Close shop button
addButtonHandler('close-iap-btn', () => game.hideIAPStore());
