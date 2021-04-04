const MIN_CONFIDENCE = 0;
const MAX_CONFIDENCE = 2;
const UPDATE_STEP = 1;
const PENALIZE_STEP = 1;
const REQUIRED_CONFIDENCE = 1;

export default class DetectorConfidence {
  constructor({
    minCofidence = MIN_CONFIDENCE,
    maxConfidence = MAX_CONFIDENCE,
    updateStep = UPDATE_STEP,
    penalizeStep = PENALIZE_STEP,
    requiredConfidence = REQUIRED_CONFIDENCE,
  } = {}) {
    Object.assign(this, {
      minCofidence,
      maxConfidence,
      updateStep,
      penalizeStep,
      requiredConfidence,
    });

    this.reset();
  }

  reset() {
    this.confidence = 0;
  }

  update(detected) {
    if (detected) {
      this._reward();
    } else {
      this._penalize();
    }

    return this.detected();
  }

  _reward() {
    if (this.confidence + this.updateStep > this.maxConfidence) {
      this.confidence = this.maxConfidence;

      return;
    }

    this.confidence += this.updateStep;
  }

  _penalize() {
    if (this.confidence - this.penalizeStep < this.minCofidence) {
      this.confidence = this.minCofidence;

      return;
    }

    this.confidence -= this.penalizeStep;
  }

  detected() {
    return this.confidence >= this.requiredConfidence;
  }
}
