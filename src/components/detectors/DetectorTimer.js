export default class DetectorTimer {
  constructor({time} = {}) {
    this.time = time;

    this.reset();
  }

  detected() {
    if (this.elapsedTime >= this.time) {
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
    return {
      progress: Math.min((100.0 / this.time) * this.elapsedTime, 100.0),
      remainingTime: Math.max(this.time - this.elapsedTime, 0),
    };
  }
}
