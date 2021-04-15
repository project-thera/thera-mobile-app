import React from 'react';
import {AppState, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Icon,
  TopNavigation,
  TopNavigationAction,
  withStyles,
} from '@ui-kitten/components';
import {Bar} from 'react-native-progress';
import {Audio} from 'expo-av';

import sounds from '../assets/sounds';
import Exercise from '../components/exercises/Exercise';
import handleAppStateChange from '../components/utils/handleAppStateChange';

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
      currentStep: 0,
      exerciseIndex: 0,
      exerciseCompletedSound: null,
      hasUnsavedChanges: true,
      stepCompletedSound: null,
    };
  }

  onExerciseCompleted = () => {
    console.log('ExerciseIntentScreen/onExerciseCompleted');

    // this.currentExercise.stop();

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

    Audio.Sound.createAsync(sounds.exerciseCompleted).then(({sound}) => {
      this.setState({exerciseCompletedSound: sound});
    });

    Audio.Sound.createAsync(sounds.stepCompleted).then(({sound}) => {
      this.setState({stepCompletedSound: sound});
    });

    // const {navigation} = this.props;

    // this.beforeRemoveListener = navigation.addListener(
    //   'beforeRemove',
    //   (e) => {
    //     if (!this.state.hasUnsavedChanges) {
    //       // If we don't have unsaved changes, then we don't need to do anything
    //       return;
    //     }

    //     // Prevent default behavior of leaving the screen
    //     e.preventDefault();

    //     // Prompt the user before leaving the screen
    //     Alert.alert(
    //       'Discard changes?',
    //       'You have unsaved changes. Are you sure to discard them and leave the screen?',
    //       [
    //         {text: "Don't leave", style: 'cancel', onPress: () => {}},
    //         {
    //           text: 'Discard',
    //           style: 'destructive',
    //           // If the user confirmed, then we dispatch the action we blocked earlier
    //           // This will continue the action that had triggered the removal of the screen
    //           onPress: () => navigation.dispatch(e.data.action),
    //         },
    //       ],
    //     );
    //   },
    //   [navigation, hasUnsavedChanges],
    // );
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);

    this.currentExercise.stop();
  }

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
