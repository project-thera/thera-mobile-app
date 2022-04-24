import React from 'react';
import {Image, SafeAreaView, StyleSheet} from 'react-native';
import {
  Button,
  Card,
  Icon,
  Layout,
  Modal,
  Text,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';
import {Bar} from 'react-native-progress';

import icons from '../assets/images/icons';
import Exercise from '../components/exercises/Exercise';
import RoutineDecorator from '../decorators/RoutineDecorator';
import Database from '../storage/Database';

const database = Database.getInstance();

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

class RoutineIntentScreen extends React.Component {
  constructor(props) {
    super(props);

    let routine = this.props.route.params.object;

    this.rawRoutine = routine;
    this.routine = new RoutineDecorator(routine);
    this.routineIntent = database.getRoutineIntent(routine);

    this.shouldLog = this.props.route.params.shouldLog
      ? this.props.route.params.shouldLog
      : false;

    this.shouldAddCredits = this.props.route.params.shouldAddCredits
      ? this.props.route.params.shouldAddCredits
      : false;

    // this.handleAppStateChange = handleAppStateChange.bind(this);

    this.state = {
      // appState: AppState.currentState,
      credits: 0,
      exerciseIndex: 0,
      hasUnsavedChanges: true,
      loading: true,
      showModal: false,
    };
  }

  componentDidMount = async () => {
    this.blowConfig = await database.getBlowConfig();
    this.cameraResolution = await database.getCameraResolution();

    // AppState.addEventListener('change', this.handleAppStateChange);

    this.setState(
      {
        loading: false,
      },
      () => {
        if (this.exerciseRef) this.exerciseRef.start();
      },
    );
  };

  componentDidUpdate = () => {
    if (this.exerciseRef) this.exerciseRef.start();
  }

  componentWillUnmount = () => {
    database.addRoutineIntent(this.routineIntent);

    delete this.routine;
  };

  currentExercise = () => {
    return this.routine.exercises[this.state.exerciseIndex];
  };

  onRoutineCompleted = async () => {
    this._showModal(true);

    this.routineIntent.finished_at = new Date().toISOString();

    if (this.shouldAddCredits) {
      let gameReward = await database.getGameReward();

      gameReward.credits = gameReward.credits + this.state.credits;

      await database.updateGameReward(gameReward);
      await database.sync();
    }
  };

  onExerciseSkipped = () => {
    this.routineIntent.routine_intent_exercises_attributes.push({
      exercise_id: this.currentExercise().id,
      status: Database.ROUTINE_INTENT_EXERCISE_SKIPPED,
    });

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
    this.routineIntent.routine_intent_exercises_attributes.push({
      exercise_id: this.currentExercise().id,
      status: Database.ROUTINE_INTENT_EXERCISE_COMPLETED,
    });

    this.setState(
      {
        credits: this.state.credits + 10,
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

  _showModal = (value) => {
    this.setState({
      showModal: value,
    });
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
      color="#fcb040"
      unfilledColor="#eeeeee"
      useNativeDriver={true}
      borderWidth={0}
      borderRadius={100}
    />
  );

  renderExercise = () => {
    if (!this.state.loading && this._hasMoreExercises()) {
      const {faceDetector, mobilenetDetector} = this.props;

      const exerciseProps = {
        faceDetector,
        mobilenetDetector,
        ...this.currentExercise(),
      };

      return (
        <Exercise
          {...exerciseProps}
          onExerciseSkipped={this.onExerciseSkipped}
          onExerciseCompleted={this.onExerciseCompleted}
          blowConfig={this.blowConfig}
          cameraResolution={this.cameraResolution}
          ref={(ref) => (this.exerciseRef = ref)}
        />
      );
    }
  };

  renderModalContent = () => {
    let text = (
      <Text style={{paddingBottom: 8}}>
        Gracias a tu entrenamiento obtuviste{' '}
        <Text
          style={{
            fontWeight: 'bold',
          }}>{`${this.state.credits} créditos`}</Text>
        . ¡Seguí practicando!
      </Text>
    );

    if (!this.shouldAddCredits) {
      text = <Text style={{paddingBottom: 8}}>¡Sigamos practicando!</Text>;
    }

    return (
      <Card disabled={true}>
        <Image source={icons.projectTheraIcon} style={styles.modalImage} />
        <Text category="h4" style={{paddingBottom: 8}}>
          ¡Muy bien!
        </Text>
        {text}
        <Button
          onPress={() => {
            this._showModal(false);
            this.props.navigation.goBack();
          }}>
          Continuar
        </Button>
      </Card>
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <TopNavigation
          accessoryRight={this.renderBar}
          accessoryLeft={this.renderBackAction}
        />
        <Layout style={styles.controlContainer}>{this.renderExercise()}</Layout>
        <Modal
          style={{width: '80%'}}
          visible={this.state.showModal}
          backdropStyle={styles.backdrop}>
          {this.renderModalContent()}
        </Modal>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controlContainer: {
    flex: 1,
    padding: 24,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalImage: {
    alignSelf: 'center',
    resizeMode: 'contain',
    width: '70%',
    height: 200,
  },
});

export default RoutineIntentScreen;
