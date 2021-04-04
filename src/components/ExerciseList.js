import React from 'react';
import {StyleSheet} from 'react-native';
import {
  Button,
  Divider,
  Layout,
  List,
  ListItem,
  Text,
} from '@ui-kitten/components';

const data = new Array(16).fill({
  title: 'Exercise #',
  description: 'a Description for Exercise #',
});

export default class ExerciseList extends React.Component {
  renderItem = ({item, index}) => (
    <ListItem
      title={`${item.title}${index + 1}`}
      description={`${item.description}${index + 1}`}
      accessoryRight={this.renderItemAccessory}
    />
  );

  renderItemAccessory = (props) => (
    <Button size='tiny'>TRY!</Button>
  );

  render() {
    return (
      <Layout style={styles.container}>
        <List
          style={styles.container}
          data={data}
          ItemSeparatorComponent={Divider}
          renderItem={this.renderItem}
        />
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
