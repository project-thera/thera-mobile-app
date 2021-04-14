import React from 'react';
import {AppState, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Button,
  Divider,
  Icon,
  Layout,
  List,
  ListItem,
  Text,
  TopNavigation,
  TopNavigationAction,
  withStyles,
} from '@ui-kitten/components';

import {Bar} from 'react-native-progress';

import Exercises from '../components/exercises/ExerciseList';
import Exercise from '../components/exercises/Exercise';

import exercises from '../data/exercises.json';

import sounds from '../assets/sounds';

import handleAppStateChange from '../components/utils/handleAppStateChange';
import {Audio} from 'expo-av';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;
const CloseIcon = (props) => <Icon {...props} name="close" />;

class ExerciseIntentScreen extends React.Component {
  constructor(props) {
    super(props);

    this.exercise = this.props.route.params.object;
    // this.faceDetector = this.props.faceDetector;
    // this.mobilenetDetector = this.props.mobilenetDetector;

    this.handleAppStateChange = handleAppStateChange.bind(this);

    this.state = {
      appState: AppState.currentState,
      exerciseIndex: 0,
      exerciseCompleteSound: null,
      currentStep: 0,
    };
  }

  onExerciseCompleted = () => {
    console.log('ExerciseIntentScreen/onExerciseCompleted');

    this.currentExercise.stop();

    this.props.navigation.goBack();

    // if (this.state.exerciseIndex + 1 >= this.props.exercises.length) {
    //   console.log('FINISHED ALL'); // TODO redirect
    // } else {
    //   // Set state is asyncronimous
    //   this.setState(
    //     {
    //       exerciseIndex: this.state.exerciseIndex + 1,
    //     },
    //     () => {
    //       this.currentExercise.start();
    //     },
    //   );
    // }
  };

  onStepCompleted = () => {
    console.log('ExerciseIntentScreen/onStepCompleted');

    this.setState({
      currentStep: this.state.currentStep + 1,
    });
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
      // require('../../assets/sounds/exercise_completed.wav'),
      sounds.exerciseCompleted,
    ).then(({sound}) => {
      this.setState({exerciseCompletedSound: sound});
    });

    Audio.Sound.createAsync(
      // require('../../assets/sounds/step_completed.wav'),
      sounds.stepCompleted,
    ).then(({sound}) => {
      this.setState({stepCompletedSound: sound});
    });
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);

    this.currentExercise.stop();
  }

  // getExercises = () => {
  //   return [this.exercise];
  // };

  renderBackAction = () => (
    <TopNavigationAction
      icon={CloseIcon}
      onPress={() => this.props.navigation.goBack()}
    />
  );

  renderBar = () => (
    <Bar
      progress={this.state.currentStep / this.exercise.steps.length}
      width={null}
      height={12}
      style={{flex: 1, marginRight: 18}}
      color={this.props.eva.theme['color-primary-default']}
      unfilledColor="#eeeeee"
      useNativeDriver={true}
      borderWidth={0}
      borderRadius={100}
    />
  );

  render() {
    const {faceDetector, mobilenetDetector} = this.props;

    const exerciseProps = {
      faceDetector,
      mobilenetDetector,
      // ...this.props.exercises[this.state.exerciseIndex],
      ...this.exercise,
    };

    return (
      <SafeAreaView style={styles.container}>
        <TopNavigation
          accessoryLeft={this.renderBackAction}
          accessoryRight={this.renderBar}
        />
        <Exercise
          {...exerciseProps}
          onExerciseCompleted={this.onExerciseCompleted}
          onStepCompleted={this.onStepCompleted}
          exerciseCompletedSound={this.state.exerciseCompletedSound}
          stepCompletedSound={this.state.stepCompletedSound}
          ref={(ref) => (this.currentExercise = ref)}
        />
        {/* <Exercises
          exercises={this.getExercises()}
          faceDetector={this.faceDetector}
          mobilenetDetector={this.mobilenetDetector}
        /> */}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default withStyles(ExerciseIntentScreen);
