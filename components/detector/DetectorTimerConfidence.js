import DetectorConfidence from './DetectorConfidence';
import DetectorTimer from './DetectorTimer';

export default class DetectorTimerConfidence {
  constructor({
    detectorTimerParams,
    detectorConfidenceParams,
    detectorStrategy,
  }) {
    this.detectorTimer = new DetectorTimer(detectorTimerParams);
    this.detectorConfidence = new DetectorConfidence(detectorConfidenceParams);
    // mDetectorTimeStatistic = detectorTimeStatistic;
    this.detectorStrategy = detectorStrategy;
  }

  update(detected) {
    // long detectionTime = mDetectorTimeStatistic.update();

    if (this.detectorConfidence.update(detected)) {
      if (this.detectorTimer.detected()) {
        this.detectorStrategy.complete();
      } else {
        this.detectorStrategy.detectionUpdated(
          this.detectorTimer.getProgress(),
        );
      }

      return true;
    } else {
      this.detectorTimer.reset();
      this.detectorStrategy.detectionStopped();
    }

    return false;
  }
}
