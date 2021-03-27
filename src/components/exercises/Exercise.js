import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Pie} from 'react-native-progress';

import {View as AnimatableView} from 'react-native-animatable';

import ImageClassificationDetector from '../detectors/ImageClassificationDetector';
import BlowDetector from '../detectors/BlowDetector';
import SpeechRecognitionDetector from '../detectors/SpeechRecognitionDetector';

import {RESET_TIMER} from '../detectors/DetectorTimerConfidence';

const STEP_ANIMATION_TIME = 500;

export default class Exercise extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stepIndex: 0,
      stepProgress: 0,
      remainingTime: this.props.steps[0].time,
    };
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

  onStepCompleted = async () => {
    this.pause();

    let result = await this.progressView.bounce(STEP_ANIMATION_TIME);

    if (result.finished) {
      if (this.state.stepIndex + 1 >= this.props.steps.length) {
        // Do this before onExerciseCompleted otherwise currentStep could have a old value of stepIndex
        this.setState({
          stepIndex: 0,
          remainingTime: this.props.steps[0].time,
          stepProgress: 0,
        });

        this.props.onExerciseCompleted();
      } else {
        this.setState({
          stepIndex: this.state.stepIndex + 1,
          stepProgress: 0,
          remainingTime: this.props.steps[this.state.stepIndex + 1].time,
        });

        this.resume();
      }
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

  formatProgress = (_) => {
    return `${(this.state.remainingTime / 1000).toFixed(3)}`;
  };

  render() {
    return (
      <>
        {/* <Text>
          Paso {this.state.stepIndex + 1}/{this.props.steps.length}
        </Text> */}
        {this.renderContent()}
        <SafeAreaView style={styles.floating}>
          <AnimatableView
            animation="bounceInRight"
            duration={500}
            useNativeDriver={true}
            ref={(ref) => (this.progressView = ref)}>
            <Pie
              animated={true}
              size={75}
              borderWidth={1}
              useNativeDriver={true}
              progress={
                (this.state.stepIndex + this.state.stepProgress) /
                this.props.steps.length
              }
            />
            {/* <Circle
              animated={true}
              size={75}
              borderWidth={1}
              thickness={10}
              showsText={true}
              formatText={this.formatProgress}
              strokeCap="butt"
              useNativeDriver={true}
              endAngle={0.99}
              progress={
                (this.state.stepIndex + this.state.stepProgress) /
                this.props.steps.length
              }
            /> */}
          </AnimatableView>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  floating: {
    position: 'absolute',
    zIndex: 1,
    flex: 1,
    width: '100%',
    height: '100%',
    alignContent: 'center',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingRight: 20,
  },
});
