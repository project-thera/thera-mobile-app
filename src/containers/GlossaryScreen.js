import React from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import {
  Button,
  Divider,
  Icon,
  Layout,
  List,
  ListItem,
  Text,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';

import ExerciseHelper from '../helpers/ExerciseHelper';

import exercises from '../data/exercises.json';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;
const PlayCircleIcon = (props) => <Icon {...props} name="play-circle" />;
const QuestionMarkCircleIcon = (props) => (
  <Icon {...props} name="question-mark-circle" />
);

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

  _showHelp = (exercise) => {
    console.log('GlossaryScreen/_showHelp');
  };

  _playExercise = (exercise) => {
    let routine = ExerciseHelper.asRoutine(exercise);

    this.props.navigation.navigate('routine-intent', {object: routine})
  };

  renderItemAccessory = (info) => (
    <Layout style={{flexDirection: 'row'}}>
      <Button
        accessoryLeft={QuestionMarkCircleIcon}
        appearance="ghost"
        status="basic"
        size="small"
        onPress={() => this._showHelp(info.item)}></Button>
      <Button
        accessoryLeft={PlayCircleIcon}
        size="small"
        style={{marginLeft: 8}}
        onPress={() => this._playExercise(info.item)}>
        Iniciar
      </Button>
    </Layout>
  );

  renderItem = (info) => {
    return (
      <ListItem
        title={() => (
          <Text style={styles.listItemTitle}>{info.item.name}</Text>
        )}
        description={() => (
          <Text style={styles.listItemDescription}>
            {info.item.description}
          </Text>
        )}
        accessoryRight={() => this.renderItemAccessory(info)}
      />
    );
  };

  renderList = () => {
    return <List data={exercises} renderItem={this.renderItem} />;
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <TopNavigation
          title="Proyecto Thera"
          subtitle="Base de conocimiento"
          accessoryLeft={this.renderBackAction}
        />
        <Layout style={styles.contentContainer}>
          <List
            data={exercises}
            renderItem={this.renderItem}
            ItemSeparatorComponent={Divider}
          />
        </Layout>
      </SafeAreaView>
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
  listItemTitle: {
    fontSize: 16,
    paddingHorizontal: 8,
  },
  listItemDescription: {
    color: 'grey',
    fontSize: 12,
    paddingHorizontal: 8,
  },
});
