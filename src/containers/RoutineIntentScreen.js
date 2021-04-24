import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {
  Icon,
  Text,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';
import {Bar} from 'react-native-progress';
import {Audio} from 'expo-av';

import sounds from '../assets/sounds';
import Exercise2 from '../components/exercises/Exercise2';
import handleAppStateChange from '../components/utils/handleAppStateChange';
import RoutineDecorator from '../decorators/RoutineDecorator';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

class RoutineIntentScreen extends React.Component {
  constructor(props) {
    super(props);

    this.routine = new RoutineDecorator(this.props.route.params.object);

    // this.handleAppStateChange = handleAppStateChange.bind(this);

    this.state = {
      // appState: AppState.currentState,
      exerciseIndex: 0,
      hasUnsavedChanges: true,
    };
  }

  componentDidMount = () => {
    // AppState.addEventListener('change', this.handleAppStateChange);

    if (this.exerciseRef) this.exerciseRef.start();
  };

  componentWillUnmount = () => {
    delete this.routine;
    delete this.state;
  };

  currentExercise = () => {
    return this.routine.exercises[this.state.exerciseIndex];
  };

  onRoutineCompleted = () => {
    console.log('RoutineIntentScreen/onRoutineCompleted');
  }

  onExerciseSkipped = () => {
    console.log('RoutineIntentScreen/onExerciseSkipped');

    this.setState(
      {
        exerciseIndex: this.state.exerciseIndex + 1,
      },
      () => {
        if (!this._hasMoreExercises()) this.onRoutineCompleted();
      },
    );
  };

  onExerciseCompleted = () => {
    console.log('RoutineIntentScreen/onExerciseCompleted');

    this.setState(
      {
        exerciseIndex: this.state.exerciseIndex + 1,
      },
      () => {
        if (!this._hasMoreExercises()) this.onRoutineCompleted();
      },
    );
  };

  _hasMoreExercises = () => {
    return this.state.exerciseIndex < this.routine.exercises.length;
  };

  renderBackAction = () => (
    <TopNavigationAction
      icon={BackIcon}
      onPress={() => this.props.navigation.goBack()}
    />
  );

  renderBar = () => (
    <Bar
      progress={this.state.exerciseIndex / this.routine.exercises.length}
      width={null}
      height={12}
      style={{flex: 1, marginRight: 18}}
      color="#000000"
      // color={this.props.eva.theme['color-primary-default']}
      unfilledColor="#eeeeee"
      useNativeDriver={true}
      borderWidth={0}
      borderRadius={100}
    />
  );

  renderExercise = () => {
    if (this._hasMoreExercises()) {
      const {faceDetector, mobilenetDetector} = this.props;

      const exerciseProps = {
        faceDetector,
        mobilenetDetector,
        ...this.currentExercise(),
      };

      return (
        <Exercise2
          {...exerciseProps}
          onExerciseSkipped={this.onExerciseSkipped}
          onExerciseCompleted={this.onExerciseCompleted}
          // onStepCompleted={this.onStepCompleted}
          // exerciseCompletedSound={this.state.exerciseCompletedSound}
          // stepCompletedSound={this.state.stepCompletedSound}
          ref={(ref) => (this.exerciseRef = ref)}
        />
      );
    }
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <TopNavigation
          accessoryRight={this.renderBar}
          // title="Proyecto Thera"
          // subtitle={`Rutina #${this.routine.id}`}
          accessoryLeft={this.renderBackAction}
          appearance="inverted"
        />
        {this.renderExercise()}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default RoutineIntentScreen;
