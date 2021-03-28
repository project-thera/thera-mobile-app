import React from 'react';
import {AppState} from 'react-native';
import {Audio} from 'expo-av';
import {View as AnimatableView} from 'react-native-animatable';

import {Bar} from 'react-native-progress';

import {withStyles, Button} from '@ui-kitten/components';

import handleAppStateChange from '../utils/handleAppStateChange';

import Exercise from './Exercise';

class ExerciseList extends React.Component {
  constructor(props) {
    super(props);

    this.handleAppStateChange = handleAppStateChange.bind(this);

    this.state = {
      appState: AppState.currentState,
      exerciseIndex: 0,
      exerciseCompleteSound: null,
    };
  }

  onExerciseCompleted = () => {
    this.currentExercise.stop();

    if (this.state.exerciseIndex + 1 >= this.props.exercises.length) {
      console.log('FINISHED ALL'); // TODO redirect
    } else {
      // Set state is asyncronimous
      this.setState(
        {
          exerciseIndex: this.state.exerciseIndex + 1,
        },
        () => {
          this.currentExercise.start();
        },
      );
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

    Audio.Sound.createAsync(
      require('../../assets/sounds/exercise_complete.wav'),
    ).then(({sound}) => {
      this.setState({exerciseCompleteSound: sound});
    });
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
        {/* <Text>
          Ejercicio {this.state.exerciseIndex + 1}/{this.props.exercises.length}
        </Text> */}
        <AnimatableView
          animation="zoomIn"
          duration={1000}
          useNativeDriver={true}>
          <Bar
            progress={this.state.exerciseIndex / this.props.exercises.length}
            animationConfig={{speed: 5, bounciness: 10}}
            animationType={'spring'}
            width={null}
            height={15}
            useNativeDriver={true}
            borderWidth={0}
            borderRadius={100}
            style={{margin: 25}}
            color={this.props.eva.theme['color-primary-default']}
            unfilledColor="#d6d6d6"
          />
        </AnimatableView>
        <Exercise
          {...exerciseProps}
          onExerciseCompleted={this.onExerciseCompleted}
          exerciseCompleteSound={this.state.exerciseCompleteSound}
          ref={(ref) => (this.currentExercise = ref)}
        />
      </>
    );
  }
}

export default withStyles(ExerciseList);
