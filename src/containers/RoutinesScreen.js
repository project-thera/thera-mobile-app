import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {
  Avatar,
  Button,
  Divider,
  Icon,
  Layout,
  Spinner,
  Text,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';

import Database from '../storage/Database';
import RoutineList from '../components/routines/RoutineList';

const database = Database.getInstance();

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;
const CloudUploadIcon = (props) => <Icon {...props} name="cloud-upload" />;
const SyncIcon = (props) => <Icon {...props} name="sync" />;

class RoutinesScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      routines: null,
    };
  }

  componentDidMount = async () => {
    let routines = await database.getRoutines();

    this.setState({
      loading: false,
      routines: routines,
    });
  };

  _updateRoutines = async () => {
    this.setState(
      {
        loading: true,
      },
      async () => {
        await database.sync();

        let routines = await database.getRoutines();

        this.setState({
          loading: false,
          routines: routines,
        });
      },
    );
  };

  renderBackAction = () => (
    <TopNavigationAction
      icon={BackIcon}
      onPress={() => this.props.navigation.goBack()}
    />
  );

  renderStatusItem = (text, image) => {
    return (
      <Layout
        style={{
          alignItems: 'flex-end',
          justifyContent: 'space-around',
          flex: 1,
          flexDirection: 'row',
        }}>
        <Button
          accessoryLeft={SyncIcon}
          onPress={() => this._updateRoutines()}
          size="small">
          Actualizar
        </Button>
        <Button
          accessoryLeft={CloudUploadIcon}
          onPress={() => this.navigateTo('record')}
          size="small">
          Enviar video
        </Button>
      </Layout>
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
      if (this.state.routines && this.state.routines.length > 0) {
        return <RoutineList {...this.props} routines={this.state.routines} />;
      } else {
        return (
          <Layout style={{padding: 24}}>
            <Text>Aún no tenés rutinas asignadas.</Text>
            <Text>Por favor, comunicate con tu supervisor.</Text>
          </Layout>
        );
      }
    }
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <TopNavigation
          title="Proyecto Thera"
          subtitle="Mis Rutinas"
          accessoryLeft={this.renderBackAction}
        />
        <Layout style={styles.controlContainer}>
          {this.renderStatusItem('asd', 'asd')}
        </Layout>
        <Divider />
        {this.renderList()}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controlContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 16,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    paddingTop: 32,
  },
});

export default RoutinesScreen;
