import React from 'react';
import {
  Icon,
  Text,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';
import {useNavigation} from '@react-navigation/native';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

// const navigation = useNavigation();

export default class Navigation extends React.Component {
  renderBackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={() => console.log('todo!')} />
  );

  render() {
    return (
      <TopNavigation
        alignment="center"
        title="Thera project"
        subtitle="Glossary"
        accessoryLeft={this.renderBackAction}>
        <Text>Navigation</Text>
      </TopNavigation>
    );
  }
}
