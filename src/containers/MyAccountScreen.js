import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {
  Icon,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';

import Database from '../storage/Database';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

export default class MyAccountScreen extends React.Component {
  renderBackAction = () => (
    <TopNavigationAction
      icon={BackIcon}
      onPress={() => this.props.navigation.goBack()}
    />
  );
  
  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <TopNavigation
          title="Thera Project"
          subtitle="RoutinesScreen"
          alignment="center"
          accessoryLeft={this.renderBackAction}
        />
      </SafeAreaView>
    );
  }
}
