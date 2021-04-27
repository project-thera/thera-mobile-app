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
const RecordingIcon = (props) => <Icon {...props} name="recording" />;

class RoutinesScreen extends React.Component {
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

  renderBackAction = () => (
    <TopNavigationAction
      icon={BackIcon}
      onPress={() => this.props.navigation.goBack()}
    />
  );

  renderStatusItem = (text, image) => {
    return (
      <Layout style={{flex: 1, alignItems: 'flex-end'}}>
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
