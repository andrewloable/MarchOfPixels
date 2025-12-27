// NameInput.js - Player name entry on high score

export class NameInput {
  constructor() {
    this.modal = document.getElementById('name-input-modal');
    this.input = document.getElementById('player-name-input');
    this.submitBtn = document.getElementById('submit-name-btn');
    this.skipBtn = document.getElementById('skip-name-btn');
    this.errorEl = document.getElementById('name-error');
    this.charCount = document.getElementById('char-count');
    this.onSubmitCallback = null;
    this.onSkipCallback = null;

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.input || !this.submitBtn || !this.skipBtn) return;

    // Character count update and auto-uppercase
    this.input.addEventListener('input', () => {
      // Convert to uppercase as user types
      const cursorPos = this.input.selectionStart;
      this.input.value = this.input.value.toUpperCase();
      this.input.setSelectionRange(cursorPos, cursorPos);
      this.updateCharCount();
    });

    // Submit button
    this.submitBtn.addEventListener('click', () => this.handleSubmit());

    // Skip button
    this.skipBtn.addEventListener('click', () => this.handleSkip());

    // Enter key to submit
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.handleSubmit();
      }
    });
  }

  updateCharCount() {
    if (!this.charCount || !this.input) return;

    const count = Array.from(this.input.value.trim()).length;
    this.charCount.textContent = `${count}/5`;
    this.charCount.classList.toggle('over', count > 5);
  }

  validate(name) {
    // Check if name exists
    if (!name || typeof name !== 'string') {
      return { valid: false, error: 'Name is required' };
    }

    const trimmed = name.trim();
    const charCount = Array.from(trimmed).length;

    if (charCount === 0) {
      return { valid: false, error: 'Name cannot be empty' };
    }

    if (charCount > 5) {
      return { valid: false, error: 'Name must be 5 characters or less' };
    }

    return { valid: true };
  }

  handleSubmit() {
    if (!this.input) return;

    const name = this.input.value.trim();
    const validation = this.validate(name);

    if (!validation.valid) {
      this.showError(validation.error);
      return;
    }

    // Disable button during submission
    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.textContent = 'Submitting...';
    }

    if (this.onSubmitCallback) {
      this.onSubmitCallback(name);
    }
  }

  handleSkip() {
    this.hide();
    if (this.onSkipCallback) {
      this.onSkipCallback();
    }
  }

  showError(message) {
    if (this.errorEl) {
      this.errorEl.textContent = message;
      this.errorEl.classList.remove('hidden');
    }
  }

  hideError() {
    if (this.errorEl) {
      this.errorEl.classList.add('hidden');
    }
  }

  show(onSubmit, onSkip) {
    this.onSubmitCallback = onSubmit;
    this.onSkipCallback = onSkip;

    // Reset state
    if (this.input) {
      this.input.value = '';
      this.input.focus();
    }

    if (this.submitBtn) {
      this.submitBtn.disabled = false;
      this.submitBtn.textContent = 'SUBMIT';
    }

    this.hideError();
    this.updateCharCount();

    if (this.modal) {
      this.modal.classList.remove('hidden');
    }
  }

  hide() {
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
  }

  // Call after successful submission
  submissionComplete() {
    this.hide();
  }

  // Call after failed submission
  submissionFailed(error) {
    this.showError(error);
    if (this.submitBtn) {
      this.submitBtn.disabled = false;
      this.submitBtn.textContent = 'SUBMIT';
    }
  }
}
