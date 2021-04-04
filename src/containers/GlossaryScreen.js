import React from 'react';
import {StyleSheet} from 'react-native';
import {Layout, Text} from '@ui-kitten/components';

import ExerciseList from '../components/ExerciseList';

export default class GlossaryScreen extends React.Component {
  render() {
    return (
      <Layout style={styles.layout}>
        <Text category="h3">GlossaryScreen</Text>
        <ExerciseList />
      </Layout>
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
