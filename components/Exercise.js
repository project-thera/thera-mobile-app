import React from 'react';
import {View, Text} from 'react-native';

import ImageClassificationDetector from './detector/ImageClassificationDetector';
import BlowDetector from './detector/BlowDetector';

import DetectorTimerConfidence from './detector/DetectorTimerConfidence';

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

      this.props.onExerciseCompleted();

      this.setState({
        stepIndex: 0,
      });
    } else {
      this.setState({
        stepIndex: this.state.stepIndex + 1,
      });

      console.log('UPDATE STEP');
    }
  };

  renderContent() {
    switch (this.props.type) {
      case 'classification':
        return this.renderImageClassificationDetector();
      case 'blow':
        return this.renderBlowDetector();
      // case 'speech':
      //   return this.renderSpeech();
    }
  }

  renderImageClassificationDetector() {
    const {faceDetector, mobilenetDetector} = this.props;
    const currentStep = this.props.steps[this.state.stepIndex];

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

  renderBlowDetector() {
    return <BlowDetector ref={(ref) => (this.detector = ref)} />;
  }

  // renderSpeechDetector() {
  //   return <SpeechRecognitionDetector ref={(ref) => (this.detector = ref)} />;
  // }

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
