import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Pie, Circle} from 'react-native-progress';
import {View as AnimatableView} from 'react-native-animatable';

import {Button, Layout, Text} from '@ui-kitten/components';
import {Audio} from 'expo-av';

import sounds from '../../assets/sounds';
import ImageClassificationDetector from '../detectors/ImageClassificationDetector';
import BlowDetector from '../detectors/BlowDetector';
import SpeechRecognitionDetector from '../detectors/SpeechRecognitionDetector';

import {RESET_TIMER} from '../detectors/DetectorTimerConfidence';

export default class Exercise2 extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.defaultState();

    Audio.Sound.createAsync(sounds.exerciseCompleted).then(({sound}) => {
      this.exerciseCompletedSound = sound;
    });

    Audio.Sound.createAsync(sounds.stepCompleted).then(({sound}) => {
      this.stepCompletedSound = sound;
    });
  }

  componentWillUnmount = () => {
    this.detector.stop();

    delete this.exerciseCompletedSound;
    delete this.stepCompletedSound;
    delete this.state;
  };

  defaultState = () => {
    return {
      repetitionIndex: 0,
      remainingTime: this.props.steps[0].time,
      stepIndex: 0,
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
      remainingTime,
    });
  };

  onStoppedDetection = () => {
    if (RESET_TIMER) {
      this.setState({
        remainingTime: this.props.steps[this.state.stepIndex].time,
      });
    }
  };

  // https://stackoverflow.com/questions/11796093/is-there-a-way-to-provide-named-parameters-in-a-function-call-in-javascript
  onStepCompleted = async ({shouldPlaySound = true} = {}) => {
    console.log('Exercise/onStepCompleted');

    this.stop();

    this.setState(
      {
        stepIndex: this.state.stepIndex + 1,
      },
      () => {
        if (this._hasMoreSteps()) {
          if (shouldPlaySound) this.stepCompletedSound?.replayAsync();

          this.resume();
        } else {
          this.setState({
            repetitionIndex: this.state.repetitionIndex + 1,
            stepIndex: 0,
          }, () => {
            if (this._hasMoreRepetitions()) {
              this.resume();
            } else {
              if (shouldPlaySound) this.exerciseCompletedSound?.replayAsync();

              this._nextExercise();
            }
          })
        }
      },
    );
  };

  _currentStep = () => {
    if (this._hasMoreSteps()) return this.props.steps[this.state.stepIndex];
  };

  _hasMoreSteps = () => {
    return this.state.stepIndex < this.props.steps.length;
  };

  _hasMoreRepetitions = () => {
    return this.state.repetitionIndex < this.props.repetitions;
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
        stepIndex: this.state.stepIndex + 1,
      },
      () => {
        this.resume();
      },
    );
  };

  renderContent() {
    const currentStep = this._currentStep();

    if (!currentStep) return;

    switch (this.props.exercise_type) {
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

  renderNextButton = () => {
    return (
      <Button onPress={this._nextExercise} disabled={this.state.buttonDisabled}>
        Continuar
      </Button>
    );
  };

  renderSkipButton = () => {
    return (
      <Button onPress={this.props.onExerciseSkipped} appearance="ghost">
        Omitir
      </Button>
    );
  };

  render() {
    return (
      <Layout style={styles.container}>
        <Layout style={styles.contentContainer}>{this.renderContent()}</Layout>
        <Layout style={{padding: 10}}>{this.renderSkipButton()}</Layout>
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
