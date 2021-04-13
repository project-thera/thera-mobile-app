import React from 'react';
import {StyleSheet} from 'react-native';
import {
  Icon,
  Image,
  List,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';
import {Avatar, Button, ListItem} from '@ui-kitten/components';

import exercises from '../data/exercises.json';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

export default class ShopScreen extends React.Component {
  renderInstallButton = () => <Button size="tiny">INSTALL</Button>;

  renderItemImage = () => (
    <Avatar
      // {...props}
      // style={[props.style, { tintColor: null }]}
      source={require('../assets/images/icons/chatbot.png')}
    />
  );

  renderBackAction = () => (
    <TopNavigationAction
      icon={BackIcon}
      onPress={() => this.props.navigation.goBack()}
    />
  );

  renderListItem = (info) => (
    <ListItem
      title="UI Kitten"
      description="A set of React Native components"
      accessoryLeft={this.renderItemImage}
      accessoryRight={this.renderInstallButton}
    />
  );

  render() {
    return (
      <React.Fragment>
        <TopNavigation
          title="Thera Project"
          subtitle="GlossaryScreen"
          accessoryLeft={this.renderBackAction}
        />
        <List
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          data={exercises}
          renderItem={this.renderListItem}
        />
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  item: {
    marginVertical: 4,
  },
  layout: {
    backgroundColor: 'blueviolet',
    // flex: 1,
    // padding: 15,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  footerControl: {
    marginHorizontal: 2,
  },
});
