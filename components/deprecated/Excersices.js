import React from 'react';
import {AppState, View, Text} from 'react-native';

import handleAppStateChange from './utils/handleAppStateChange';

import Exercise from './detector/Exercise';

import ImageClassificationDetector from './detector/ImageClassificationDetector';

export default class Exercises extends React.Component {
  state = {
    appState: AppState.currentState,
  };

  constructor(props) {
    super(props);

    this.handleAppStateChange = handleAppStateChange.bind(this);

    this.exercises = Exercise.deserialize(props.exercises);
    let exerciseIndex = 0;
    let stepIndex = 0;

    this.setState({
      exercisesCount: this.exercises.length,
      // currentExercise: this.exercises[this.exerciseIndex],
      exerciseIndex,
      stepIndex,
    });

    this.currentExercise().addListener(this);
  }

  currentExercise = () => {
    return this.exercises[this.exerciseIndex];
  };

  currentExerciseStepsCount = () => {
    return this.exercises[this.exerciseIndex].stepsCount;
  };

  onExerciseComplete = () => {
    this.currentExercise().removeListener(this);
    this.currentExercise().stop();

    this.setState({
      exerciseIndex: this.state.exerciseIndex++,
      stepIndex: 0,
    });

    if (this.state.exerciseIndex >= this.state.exercisesCount) {
      console.log('FINISHED'); // TODO redirect
    } else {
      this.currentExercise().addListener(this);
      this.currentExercise().start();
    }
  };

  onStepComplete = () => {
    this.setState({stepIndex: this.exercises[this.exerciseIndex].currentStep});
  };

  onDetectionStart = () => {
    console.log('DETECTING'); // TODO show something in the ui
  };

  onProgress = (percentage) => {
    console.log(`PROGRESS ${percentage}`); // TODO show something in the ui
  };

  onDetectionStop = () => {
    console.log('NOT DETECTING'); // TODO stop showing something in the ui
  };

  onBackground = () => {
    this.currentExercise().pause();
  };

  onForeground = () => {
    this.currentExercise().resume();
  };

  async componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);

    this.currentExercise().start();
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);

    this.currentExercise().removeListener(this);
    this.currentExercise().stop();
  }

  renderContent() {
    const currentExercise = this.currentExercise();

    switch (currentExercise.type) {
      case 'classification':
        return this.renderImageClassificationDetector(currentExercise);
      case 'blow':
        return this.renderBlowDetector(currentExercise);
      case 'speech':
        return this.renderSpeech(currentExercise);
    }
  }

  renderImageClassificationDetector(currentExercise) {
    const {faceDetector, mobilenetDetector} = this.state;

    return (
      <ImageClassificationDetector
        ref={(ref) => (currentExercise.detector = ref)}
        {...{faceDetector, mobilenetDetector}}
      />
    );
  }

  renderBlowDetector(currentExercise) {
    return <BlowDetector ref={(ref) => (currentExercise.detector = ref)} />;
  }

  renderSpeechDetector(currentExercise) {
    return (
      <SpeechRecognitionDetector
        ref={(ref) => (currentExercise.detector = ref)}
      />
    );
  }

  render() {
    // const {isLoading} = this.state;

    return (
      <View style={{width: '100%'}}>
        <View>{this.renderContent()}</View>
      </View>
    );
  }
}
