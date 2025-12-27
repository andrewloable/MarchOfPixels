// NameInput.js - Player name entry on high score
// TODO: Implement name input dialog

export class NameInput {
  constructor() {
    // TODO: Create name input dialog elements
  }

  show(onSubmit) {
    // TODO: Display name input dialog
    // TODO: Validate: max 5 chars, unicode allowed
    // TODO: Call onSubmit with validated name
  }

  hide() {
    // TODO: Hide name input dialog
  }

  validate(name) {
    // TODO: Check length <= 5 characters
    // TODO: Server will check profanity
    return name.length > 0 && name.length <= 5;
  }
}
