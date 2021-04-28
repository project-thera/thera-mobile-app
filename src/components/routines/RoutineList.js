import React from 'react';
import {StyleSheet} from 'react-native';
import {
  Button,
  Icon,
  Layout,
  List,
  ListItem,
  Spinner,
  Text,
} from '@ui-kitten/components';

const PlayCircleIcon = (props) => <Icon {...props} name="play-circle" />;

class RoutineList extends React.Component {
  renderItemAccessory = (info) => {
    return (
      <Button
        accessoryLeft={PlayCircleIcon}
        onPress={() =>
          this.props.navigation.navigate('routine-intent', {object: info.item})
        }
        size="small"
        status="primary">
        Iniciar
      </Button>
    );
  };

  renderItem = (info) => {
    return (
      <ListItem
        title={<Text style={styles.listItemTitle}>Rutina #{info.item.id}</Text>}
        description={`${info.item.created_at}`}
        accessoryRight={() => this.renderItemAccessory(info)}
      />
    );
  };

  render() {
    return (
      <Layout style={styles.container}>
        <List data={this.props.routines} renderItem={this.renderItem} />
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 18,
  },
});

export default RoutineList;
