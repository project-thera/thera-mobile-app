import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Pie, Circle} from 'react-native-progress';
import {View as AnimatableView} from 'react-native-animatable';

import {Button, Layout} from '@ui-kitten/components';

import ImageClassificationDetector from '../detectors/ImageClassificationDetector';
import BlowDetector from '../detectors/BlowDetector';
import SpeechRecognitionDetector from '../detectors/SpeechRecognitionDetector';

import {RESET_TIMER} from '../detectors/DetectorTimerConfidence';

export default class Exercise extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.defaultState();
  }

  componentWillUnmount = () => {
    this.detector.stop();
  }

  defaultState = () => {
    return {
      buttonDisabled: true,
      remainingTime: this.props.steps[0].time,
      stepIndex: 0,
      stepProgress: 0,
    };
  };

  start() {
    this.detector.start();
  }

  stop() {
    this.detector.stop();
  }

  pause() {
    if (this.detector) this.detector.pause();
  }

  resume() {
    this.detector.resume();
  }

  onProgress = ({progress, remainingTime}) => {
    this.setState({
      stepProgress: progress / 100,
      remainingTime,
    });
  };

  onStoppedDetection = () => {
    if (RESET_TIMER) {
      this.setState({
        stepProgress: 0,
        remainingTime: this.props.steps[this.state.stepIndex].time,
      });
    }
  };

  // https://stackoverflow.com/questions/11796093/is-there-a-way-to-provide-named-parameters-in-a-function-call-in-javascript
  onStepCompleted = async ({shouldPlaySound = true} = {}) => {
    console.log('Exercise/onStepCompleted');

    this.stop();

    if (this._hasMoreSteps()) {
      if (shouldPlaySound) this.props.stepCompletedSound?.replayAsync();

      this._nextStep();
    } else {
      if (shouldPlaySound) this.props.exerciseCompletedSound?.replayAsync();

      this.setState({
        buttonDisabled: false,
        stepProgress: 100,
      });
    }

    this.props.onStepCompleted();
  };

  renderContent() {
    const currentStep = this._currentStep();

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
        {...{faceDetector, mobilenetDetector, currentStep}}
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

  _currentStep = () => {
    return this.props.steps[this.state.stepIndex];
  };

  _hasMoreSteps = () => {
    return this.state.stepIndex + 1 < this.props.steps.length;
  };

  _nextExercise = () => {
    console.log('Exercise/_nextExercise');

    this.setState(this.defaultState());

    this.props.onExerciseCompleted();
  };

  _nextStep = () => {
    console.log('Exercise/_nextStep');

    this.setState(
      {
        buttonDisabled: true,
        stepIndex: this.state.stepIndex + 1,
        stepProgress: 0,
        remainingTime: this.props.steps[this.state.stepIndex + 1].time,
      },
      () => {
        this.resume();
      },
    );
  };

  renderNextButton = () => {
    return (
      <Button onPress={this._nextExercise} disabled={this.state.buttonDisabled}>
        Continuar
      </Button>
    );
  };

  render() {
    return (
      <Layout style={styles.container}>
        <Layout style={styles.contentContainer}>{this.renderContent()}</Layout>
        <Layout style={{padding: 10}}>{this.renderNextButton()}</Layout>
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
  },
});
