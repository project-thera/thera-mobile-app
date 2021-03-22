import React from 'react';
import {AppState} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {Text} from '@ui-kitten/components';

import handleAppStateChange from '../utils/handleAppStateChange';

import Exercise from './Exercise';

export default class Exercises extends React.Component {
  constructor(props) {
    super(props);

    this.handleAppStateChange = handleAppStateChange.bind(this);

    this.state = {
      appState: AppState.currentState,
      exerciseIndex: 0,
    };
  }

  onExerciseCompleted = () => {
    this.currentExercise.stop();

    if (this.state.exerciseIndex + 1 >= this.props.exercises.length) {
      console.log('FINISHED ALLLLL'); // TODO redirect
    } else {
      this.setState({
        exerciseIndex: this.state.exerciseIndex + 1,
      });

      this.currentExercise.start();
    }
  };

  onBackground = () => {
    this.currentExercise.pause();
  };

  onForeground = () => {
    this.currentExercise.resume();
  };

  async componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);

    this.currentExercise.start();
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);

    this.currentExercise.stop();
  }

  render() {
    const {faceDetector, mobilenetDetector} = this.props;

    const exerciseProps = {
      faceDetector,
      mobilenetDetector,
      ...this.props.exercises[this.state.exerciseIndex],
    };

    return (
      <>
        <Text>
          Ejercicio {this.state.exerciseIndex + 1}/{this.props.exercises.length}
        </Text>
        <Exercise
          {...exerciseProps}
          onExerciseCompleted={this.onExerciseCompleted}
          ref={(ref) => (this.currentExercise = ref)}
        />
      </>
    );
  }
}
