import React from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import {
  Button,
  Card,
  Divider,
  Icon,
  IndexPath,
  Layout,
  Select,
  SelectItem,
  Text,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';

import BlowSettings from '../components/settings/BlowSettings';
import CameraSettings from '../components/settings/CameraSettings';
import ReminderSettings from '../components/settings/ReminderSettings';
import Database from '../storage/Database';

const database = Database.getInstance();

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

const blowSettings = [
  'Configuración #1',
  'Configuración #2',
  'Configuración #3',
];

export default class SettingsScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      blowSettings: new IndexPath(0),
      cameraResolution: new IndexPath(0),
    };
  }

  renderBackAction = () => (
    <TopNavigationAction
      icon={BackIcon}
      onPress={() => this.props.navigation.goBack()}
    />
  );

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <TopNavigation
          title="Proyecto Thera"
          subtitle="Configuración"
          accessoryLeft={this.renderBackAction}
        />
        <Layout style={styles.contentContainer} level="1">
          <Text category="h1" style={{paddingBottom: 12}}>Configuración</Text>
          <Text category="h6">Configuración del soplido</Text>
          <BlowSettings database={database} selectStyle={{paddingBottom: 12}}/>
          <Text category="h6">Resolución de la cámara frontal</Text>
          <CameraSettings database={database}  selectStyle={{paddingBottom: 12}}/>
          <Text category="h6">Recordatorio</Text>
          <ReminderSettings />
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
    flex: 1,
    padding: 24,
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
