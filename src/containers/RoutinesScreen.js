import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {Icon, TopNavigation, TopNavigationAction} from '@ui-kitten/components';

import RoutineList from '../components/routines/RoutineList';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

class RoutinesScreen extends React.Component {
  renderBackAction = () => (
    <TopNavigationAction
      icon={BackIcon}
      onPress={() => this.props.navigation.goBack()}
    />
  );

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <TopNavigation
          title="Proyecto Thera"
          subtitle="Rutinas"
          accessoryLeft={this.renderBackAction}
        />
        <RoutineList {...this.props} />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default RoutinesScreen;
