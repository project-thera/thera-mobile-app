import React from 'react';
import {StyleSheet} from 'react-native';
import {Text} from '@ui-kitten/components';

import ExerciseList from '../components/ExerciseList';

export default class RoutinesScreen extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Text>RoutinesScreen</Text>
        <ExerciseList />
      </React.Fragment>
    );
  }
}
