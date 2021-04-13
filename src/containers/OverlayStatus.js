import React from 'react';
import {StyleSheet} from 'react-native';
import {
  Icon,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

export default class OverlayStatus extends React.Component {
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
          subtitle="RoutinesScreen"
          alignment="center"
          accessoryLeft={this.renderBackAction}
        />
      </React.Fragment>
    );
  }
}
