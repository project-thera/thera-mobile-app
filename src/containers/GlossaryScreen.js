import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  Button,
  Card,
  Divider,
  Icon,
  Layout,
  List,
  ListItem,
  Text,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';

import exercises from '../data/exercises.json';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;
const FilmIcon = (props) => <Icon {...props} name="film" />;
const FlashIcon = (props) => <Icon {...props} name="flash" />;

export default class GlossaryScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedExercise: 'pepe',
    };
  }

  renderBackAction = () => (
    <TopNavigationAction
      icon={BackIcon}
      onPress={() => this.props.navigation.goBack()}
    />
  );

  renderItemHeader = (headerProps, info) => (
    <View {...headerProps}>
      <Text category="h6">{info.item.title}</Text>
    </View>
  );

  renderItemFooter = (footerProps, info) => (
    <View {...footerProps} style={[footerProps.style, styles.footerContainer]}>
      <Button style={styles.footerControl} size="small" status="basic" accessoryLeft={FilmIcon}>
        Watch!
      </Button>
      <Button
        style={styles.footerControl}
        size="small"
        accessoryLeft={FlashIcon}
        onPress={() =>
          this.props.navigation.navigate('exercise-intent', {object: info.item})
        }>
        Play!
      </Button>
    </View>
  );

  renderItem = (info) => {
    return (
      <Card
        style={styles.item}
        status="primary"
        header={(headerProps) => this.renderItemHeader(headerProps, info)}
        footer={(footerProps) => this.renderItemFooter(footerProps, info)}>
        <Text>{info.item.description}</Text>
      </Card>
    );
  };

  renderItemAccessory = (props) => (
    <Button
      size="tiny"
      onPress={() => this.setState({selectedExercise: 'Button'})}>
      TRY!
    </Button>
  );

  render() {
    let text;
    if (this.state.selectedExercise) {
      text = <Text>{this.state.selectedExercise}</Text>;
    } else {
      text = <Text>null</Text>;
    }

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
          renderItem={this.renderItem}
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