export const START_TIME = 250;

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
    this.stop();

    this.elapsedTime = START_TIME;
  }

  // If dont want to reset the time
  stop() {
    this.startTime = null;
    this.firstTime = true;
  }

  updateCounter() {
    const timeDiff = performance.now() - this.startTime;

    if (this.firstTime) {
      this.firstTime = false;

      this.elapsedTime += timeDiff * 2;
    } else {
      this.elapsedTime += timeDiff;
    }

    this.startTime = performance.now();
  }

  getProgress() {
    return {
      progress: Math.min((100.0 / this.time) * this.elapsedTime, 100.0),
      remainingTime: Math.max(this.time - this.elapsedTime, 0),
      detectionTime: this.timeStatistic,
    };
  }
}
