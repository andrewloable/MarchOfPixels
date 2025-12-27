export class Input {
  constructor(container) {
    this.container = container;
    this.targetLane = 0; // -1 = left, 0 = center, 1 = right
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;

    // Lane positions in world space
    this.laneWidth = window.innerWidth / 3;

    // Keyboard state
    this.keys = {
      left: false,
      right: false
    };

    // Gamepad state
    this.gamepadIndex = null;
    this.gamepadDeadzone = 0.3;
    this.lastGamepadLane = 0;

    // Touch events
    container.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    container.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    container.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });

    // Mouse events (for desktop testing)
    container.addEventListener('mousedown', this.onMouseDown.bind(this));
    container.addEventListener('mousemove', this.onMouseMove.bind(this));
    container.addEventListener('mouseup', this.onMouseUp.bind(this));

    // Keyboard events
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));

    // Gamepad events
    window.addEventListener('gamepadconnected', this.onGamepadConnected.bind(this));
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected.bind(this));

    // Update lane width on resize
    window.addEventListener('resize', () => {
      this.laneWidth = window.innerWidth / 3;
    });
  }

  // Keyboard handlers
  onKeyDown(e) {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.keys.left = true;
        this.updateLaneFromKeyboard();
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.keys.right = true;
        this.updateLaneFromKeyboard();
        e.preventDefault();
        break;
    }
  }

  onKeyUp(e) {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.keys.left = false;
        this.updateLaneFromKeyboard();
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.keys.right = false;
        this.updateLaneFromKeyboard();
        break;
    }
  }

  updateLaneFromKeyboard() {
    if (this.keys.left && !this.keys.right) {
      this.targetLane = -1;
    } else if (this.keys.right && !this.keys.left) {
      this.targetLane = 1;
    } else {
      this.targetLane = 0;
    }
  }

  // Gamepad handlers
  onGamepadConnected(e) {
    console.log(`Gamepad connected: ${e.gamepad.id}`);
    this.gamepadIndex = e.gamepad.index;
  }

  onGamepadDisconnected(e) {
    console.log(`Gamepad disconnected: ${e.gamepad.id}`);
    if (this.gamepadIndex === e.gamepad.index) {
      this.gamepadIndex = null;
    }
  }

  updateGamepad() {
    if (this.gamepadIndex === null) return;

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[this.gamepadIndex];

    if (!gamepad) return;

    // Left stick X axis (axis 0) or D-pad
    const leftStickX = gamepad.axes[0] || 0;

    // D-pad buttons (standard mapping)
    // Button 14 = D-pad left, Button 15 = D-pad right
    const dpadLeft = gamepad.buttons[14]?.pressed || false;
    const dpadRight = gamepad.buttons[15]?.pressed || false;

    // Left/Right bumpers (LB = 4, RB = 5)
    const lbPressed = gamepad.buttons[4]?.pressed || false;
    const rbPressed = gamepad.buttons[5]?.pressed || false;

    // Determine lane from gamepad input
    let newLane = 0;

    if (dpadLeft || lbPressed || leftStickX < -this.gamepadDeadzone) {
      newLane = -1;
    } else if (dpadRight || rbPressed || leftStickX > this.gamepadDeadzone) {
      newLane = 1;
    }

    // Only update if gamepad has priority (no mouse/touch dragging)
    if (!this.isDragging) {
      this.targetLane = newLane;
    }
  }

  onTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.isDragging = true;
    this.startX = touch.clientX;
    this.currentX = touch.clientX;
    this.updateLaneFromPosition(touch.clientX);
  }

  onTouchMove(e) {
    e.preventDefault();
    if (!this.isDragging) return;
    const touch = e.touches[0];
    this.currentX = touch.clientX;
    this.updateLaneFromPosition(touch.clientX);
  }

  onTouchEnd(e) {
    e.preventDefault();
    this.isDragging = false;
  }

  onMouseDown(e) {
    this.isDragging = true;
    this.startX = e.clientX;
    this.currentX = e.clientX;
    this.updateLaneFromPosition(e.clientX);
  }

  onMouseMove(e) {
    if (!this.isDragging) return;
    this.currentX = e.clientX;
    this.updateLaneFromPosition(e.clientX);
  }

  onMouseUp(e) {
    this.isDragging = false;
  }

  updateLaneFromPosition(x) {
    const screenWidth = window.innerWidth;
    const third = screenWidth / 3;

    if (x < third) {
      this.targetLane = -1; // Left lane
    } else if (x > third * 2) {
      this.targetLane = 1; // Right lane
    } else {
      this.targetLane = 0; // Center lane
    }
  }

  getTargetLane() {
    // Poll gamepad state each frame
    this.updateGamepad();
    return this.targetLane;
  }

  // Check if any start/action button is pressed (for menu navigation)
  isStartPressed() {
    if (this.gamepadIndex === null) return false;

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[this.gamepadIndex];

    if (!gamepad) return false;

    // A button (0), Start button (9)
    return gamepad.buttons[0]?.pressed || gamepad.buttons[9]?.pressed;
  }
}
