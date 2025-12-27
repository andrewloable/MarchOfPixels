export class Input {
  constructor(container) {
    this.container = container;
    this.targetLane = 0; // -1 = left, 0 = center, 1 = right
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;

    // Lane positions in world space
    this.laneWidth = window.innerWidth / 3;

    // Touch events
    container.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    container.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    container.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });

    // Mouse events (for desktop testing)
    container.addEventListener('mousedown', this.onMouseDown.bind(this));
    container.addEventListener('mousemove', this.onMouseMove.bind(this));
    container.addEventListener('mouseup', this.onMouseUp.bind(this));

    // Update lane width on resize
    window.addEventListener('resize', () => {
      this.laneWidth = window.innerWidth / 3;
    });
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
    return this.targetLane;
  }
}
