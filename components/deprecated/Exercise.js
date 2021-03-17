import React from 'react';

export default class Exercise extends React.Component {
  constructor(data) {
    Object.assign(this, data);

    this.currentStep = 0;
    this.detector = detector;
  }

  static deserialize(json = {}) {
    const excercisesArray = [
      {
        type: 'classification',
        steps: [
          {
            time: 5000, // in ms
            label: 'boca abierta',
          },
          {
            time: 5000, // in ms
            label: 'boca cerrada',
          },
        ],
      },
      {
        type: 'blow',
        steps: [
          {
            time: 5000, // in ms
            detected: true,
          },
          {
            time: 5000, // in ms
            detected: false,
          },
        ],
      },
      {
        type: 'speech',
        steps: [
          {
            word: 'perro',
          },
        ],
      },
    ];

    return excercisesArray.map((data) => {
      return new Exercise(data);
    });
  }

  addListener(listener) {
    this.addEventListener('onExerciseComplete', listener.onExerciseComplete);
    this.addEventListener('onStepComplete', listener.onStepComplete);
    this.addEventListener('onDetectionStart', listener.onDetectionStart);
    this.addEventListener('onProgress', listener.onProgress);
    this.addEventListener('onDetectionStop', listener.onDetectionStop);
    this.addEventListener('onBackground', listener.onBackground);
    this.addEventListener('onForeground', listener.onForeground);
  }

  removeListener(listener) {
    this.removeEventListener('onExerciseComplete', listener.onExerciseComplete);
    this.removeEventListener('onStepComplete', listener.onStepComplete);
    this.removeEventListener('onDetectionStart', listener.onDetectionStart);
    this.removeEventListener('onProgress', listener.onProgress);
    this.removeEventListener('onDetectionStop', listener.onDetectionStop);
    this.removeEventListener('onBackground', listener.onBackground);
    this.removeEventListener('onForeground', listener.onForeground);
  }

  start() {
    this.detector.start();
  }

  stop() {
    this.detector.stop();
  }

  pause() {
    this.detector.pause();
  }

  resume() {
    this.detector.resume();
  }
}
