// Currency.js - In-game currency system
// TODO: Implement currency system

const STORAGE_KEY = 'marchofpixels_currency';

export class Currency {
  constructor() {
    // TODO: Load balance from localStorage
  }

  getBalance() {
    // TODO: Return current balance
  }

  add(amount) {
    // TODO: Add to balance
    // TODO: Save to localStorage
  }

  spend(amount) {
    // TODO: Subtract from balance if sufficient
    // TODO: Return success/failure
  }

  save() {
    // TODO: Save to localStorage
  }

  load() {
    // TODO: Load from localStorage
  }
}
