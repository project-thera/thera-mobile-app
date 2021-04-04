import React from 'react';
import {StyleSheet} from 'react-native';
import {
  Icon,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';

import ExerciseList from '../components/ExerciseList';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

export default class GlossaryScreen extends React.Component {
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
          title="Thera Project"
          subtitle="GlossaryScreen"
          alignment="center"
          accessoryLeft={this.renderBackAction}
        />
        <ExerciseList />
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
