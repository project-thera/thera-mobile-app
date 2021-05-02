import React from 'react';
import {StyleSheet} from 'react-native';
import {
  Button,
  Icon,
  Layout,
  List,
  ListItem,
  Text,
} from '@ui-kitten/components';
import {format} from 'date-fns';
import {es} from 'date-fns/locale';

const PlayCircleIcon = (props) => <Icon {...props} name="play-circle" />;

class RoutineList extends React.Component {
  renderItemAccessory = (info) => {
    return (
      <Button
        accessoryLeft={PlayCircleIcon}
        onPress={() =>
          this.props.navigation.navigate('routine-intent', {
            object: info.item,
            shouldLog: true,
            shouldAddCredits: true,
          })
        }
        size="small"
        status="primary">
        Iniciar
      </Button>
    );
  };

  renderItem = (info) => {
    let lastRoutineIntent = this.props.routineIntents[info.item.id];
    let startedAt = lastRoutineIntent
      ? // ? new Date(lastRoutineIntent.started_at).toLocaleString('es-AR')
        `Última actividad: ${format(new Date(), 'dd/MM/yy HH:ii:ss', {
          locale: es,
        })}`
      : 'Última actividad: aún no se ha realizado.';

    return (
      <ListItem
        title={<Text style={styles.listItemTitle}>Rutina #{info.item.id}</Text>}
        description={`${startedAt}`}
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
