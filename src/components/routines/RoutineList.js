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

import Database from '../../storage/Database';

const database = Database.getInstance();

const PlayCircleIcon = (props) => <Icon {...props} name="play-circle" />;

class RoutineList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      routines: null,
    };
  }

  componentDidMount = async () => {
    this.setState({
      loading: false,
      routines: await database.getRoutines(),
    });
  };

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

  renderList = () => {
    if (this.state.loading) {
      return (
        <Layout style={styles.loading}>
          <Spinner size="galactic" />
          <Text style={styles.loadingText}>Cargando rutinas...</Text>
        </Layout>
      );
    } else {
      return <List data={this.state.routines} renderItem={this.renderItem} />;
    }
  };

  render() {
    return <Layout style={styles.container}>{this.renderList()}</Layout>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    paddingTop: 32,
  },
  listItemTitle: {
    fontSize: 18,
  },
});

export default RoutineList;
