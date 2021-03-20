import React from 'react';
import {View, Text} from 'react-native';

import ImageClassificationDetector from './detector/ImageClassificationDetector';
import BlowDetector from './detector/BlowDetector';
import SpeechRecognitionDetector from './detector/SpeechRecognitionDetector';

export default class Exercise extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stepIndex: 0,
    };
  }

  start() {
    console.log('EXERCISE DETECTOR START');

    this.detector.start();
  }

  stop() {
    console.log('EXERCISE DETECTOR STOP');

    this.detector.stop();
  }

  pause() {
    console.log('EXERCISE DETECTOR PAUSE');

    this.detector.pause();
  }

  resume() {
    console.log('EXERCISE DETECTOR RESUME');

    this.detector.resume();
  }

  onProgress = (percentage) => {
    console.log(`PROGRESS ${percentage}`); // TODO show something in the ui
  };

  onStoppedDetection = () => {
    console.log('NOT DETECTING'); // TODO stop showing something in the ui
  };

  onStepCompleted = () => {
    if (this.state.stepIndex + 1 >= this.props.steps.length) {
      console.log('EXERCISE COMPLETE');

      // Do this before onExerciseCompleted otherwise currentStep could have a old value of stepIndex
      this.setState({
        stepIndex: 0,
      });

      this.props.onExerciseCompleted();
    } else {
      this.setState({
        stepIndex: this.state.stepIndex + 1,
      });

      console.log('UPDATE STEP');
    }
  };

  renderContent() {
    const currentStep = this.props.steps[this.state.stepIndex];

    switch (this.props.type) {
      case 'classification':
        return this.renderImageClassificationDetector(currentStep);
      case 'blow':
        return this.renderBlowDetector(currentStep);
      case 'speech':
        return this.renderSpeechDetector(currentStep);
    }
  }

  renderImageClassificationDetector(currentStep) {
    const {faceDetector, mobilenetDetector} = this.props;

    return (
      <ImageClassificationDetector
        ref={(ref) => (this.detector = ref)}
        {...{faceDetector, mobilenetDetector}}
        currentStep={currentStep}
        onStepCompleted={this.onStepCompleted}
        onProgress={this.onProgress}
        onStoppedDetection={this.onStoppedDetection}
      />
    );
  }

  renderBlowDetector(currentStep) {
    return (
      <BlowDetector
        ref={(ref) => (this.detector = ref)}
        currentStep={currentStep}
        onStepCompleted={this.onStepCompleted}
        onProgress={this.onProgress}
        onStoppedDetection={this.onStoppedDetection}
      />
    );
  }

  renderSpeechDetector(currentStep) {
    return (
      <SpeechRecognitionDetector
        ref={(ref) => (this.detector = ref)}
        currentStep={currentStep}
        onStepCompleted={this.onStepCompleted}
      />
    );
  }

  render() {
    return (
      <View>
        <Text>
          Paso {this.state.stepIndex + 1}/{this.props.steps.length}
        </Text>
        {this.renderContent()}
      </View>
    );
  }
}
