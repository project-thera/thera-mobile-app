export default class DetectorStrategy {
  start() {}

  stop() {}

  pause() {}

  resume() {}

  complete() {}

  detectionUpdated(progress, detectionTime) {
    // mDetectorChangeListener.onDetectionUpdated(progress, detectionTime);
  }

  detectionStopped() {
    // mDetectorChangeListener.onDetectionStopped();
  }
}
