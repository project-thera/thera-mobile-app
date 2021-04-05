import React from 'react';
import {StyleSheet} from 'react-native';
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
} from '@ui-kitten/components';

import Exercises from '../components/exercises/ExerciseList';

import exercises from '../data/exercises.json';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

export default class ExerciseIntentScreen extends React.Component {
  constructor(props) {
    super(props);

    this.exercise = this.props.route.params.object;
    this.faceDetector = this.props.faceDetector;
    this.mobilenetDetector = this.props.mobilenetDetector;
  }

  getExercises = () => {
    return [this.exercise];
  }

  renderBackAction = () => (
    <TopNavigationAction
      icon={BackIcon}
      onPress={() => this.props.navigation.goBack()}
    />
  );

  render() {
    return (
      <React.Fragment>
        <TopNavigation
          title={this.exercise.title}
          subtitle={this.exercise.description}
          // alignment="center"
          accessoryLeft={this.renderBackAction}
        />
        <Text>{this.exercise.title}</Text>

        <Exercises
            exercises={this.getExercises()}
            faceDetector={this.faceDetector}
            mobilenetDetector={this.mobilenetDetector}
          />
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  layout: {
    backgroundColor: 'blueviolet',
    flex: 1,
    // padding: 15,
  },
});
