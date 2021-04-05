import React from 'react';
import {StyleSheet} from 'react-native';
import {
  Icon,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';

export default class ShopScreen extends React.Component {
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
          subtitle="ShopScreen"
          alignment="center"
          accessoryLeft={this.renderBackAction}
        />
        {/* <ExerciseList /> */}
      </React.Fragment>
    );
  }
}