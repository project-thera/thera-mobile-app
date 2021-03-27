import DetectorConfidence from './DetectorConfidence';
import DetectorTimer, {START_TIME} from './DetectorTimer';

export const RESET_TIMER = false;
const QUEUE_SIZE = 3;

export default class DetectorTimerConfidence {
  constructor({params, onCompleted, onProgress, onStoppedDetection}) {
    this.detectorTimer = new DetectorTimer(params);
    this.detectorConfidence = new DetectorConfidence(params);

    this.onCompleted = onCompleted;
    this.onProgress = onProgress;
    this.onStoppedDetection = onStoppedDetection;

    // this.queue = [];
    // this.startTime = null;
  }

  // getTimeStatistic() {
  //   let timeDiff;

  //   if (this.startTime == null) {
  //     this.startTime = performance.now();
  //     timeDiff = START_TIME;
  //   } else {
  //     timeDiff = performance.now() - this.startTime;
  //     this.startTime = performance.now();
  //   }

  //   if (this.queue.length >= QUEUE_SIZE) {
  //     this.queue.shift();
  //   }

  //   this.queue.push(timeDiff);

  //   return this.queue.reduce((a, b) => a + b, 0) / this.queue.length;
  // }

  update(detected) {
    // const detectionTime = this.getTimeStatistic();

    if (this.detectorConfidence.update(detected)) {
      if (this.detectorTimer.detected()) {
        this.onCompleted();
      } else {
        this.onProgress(this.detectorTimer.getProgress());
      }

      return true;
    } else {
      if (RESET_TIMER) {
        this.detectorTimer.reset(); // Should we reset the timer?
      } else {
        this.detectorTimer.stop();
      }

      this.onStoppedDetection();
    }

    return false;
  }
}
