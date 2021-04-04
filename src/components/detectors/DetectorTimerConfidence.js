import DetectorConfidence from './DetectorConfidence';
import DetectorTimer from './DetectorTimer';

export const RESET_TIMER = false;

export default class DetectorTimerConfidence {
  constructor({params, onCompleted, onProgress, onStoppedDetection}) {
    this.detectorTimer = new DetectorTimer(params);
    this.detectorConfidence = new DetectorConfidence(params);

    this.onCompleted = onCompleted;
    this.onProgress = onProgress;
    this.onStoppedDetection = onStoppedDetection;
  }

  update(detected) {
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
