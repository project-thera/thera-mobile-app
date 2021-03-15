export default class DetectorTimer {
  constructor({requiredTime} = {}) {
    this.requiredTime = requiredTime;

    this.reset();
  }

  detected() {
    if (this.elapsedTime >= this.requiredTime) {
      return true;
    }
    if (this.startTime == null) {
      this.startTime = performance.now();
    } else {
      this.updateCounter();
    }

    return false;
  }

  reset() {
    this.elapsedTime = 1;
    this.startTime = null;
  }

  updateCounter() {
    this.elapsedTime += performance.now() - this.startTime;
    this.startTime = performance.now();
  }

  getProgress() {
    return (100.0 / this.requiredTime) * this.elapsedTime;
  }
}
