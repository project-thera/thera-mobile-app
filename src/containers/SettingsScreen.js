import React from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import {
  Button,
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

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

const blowSettings = [
  'Configuración #1',
  'Configuración #2',
  'Configuración #3',
];
const cameraResolutions = ['720p', '1080p'];

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

  _getBlowSettings = () => {
    return <Text>{blowSettings[this.state.blowSettings.row]}</Text>;
  };

  _setBlowSettings = (index) => {
    this.setState({
      blowSettings: index,
    });
  };

  _getCameraResolution = () => {
    return <Text>{cameraResolutions[this.state.cameraResolution.row]}</Text>;
  };

  _setCameraResolution = (index) => {
    this.setState({
      cameraResolution: index,
    });
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <TopNavigation
          title="Proyecto Thera"
          subtitle="Configuración"
          accessoryLeft={this.renderBackAction}
        />
        <Layout style={styles.contentContainer} level="1">
          <Text category="h1">Configuración</Text>
          <Text>Configuración del soplido</Text>
          <Select
            selectedIndex={this.state.blowSettings}
            onSelect={this._setBlowSettings}
            value={this._getBlowSettings}>
            {blowSettings.map((renderOption, key) => (
              <SelectItem title={renderOption} key={key} />
            ))}
          </Select>
          <Text>Resolución de la cámara frontal</Text>
          <Select
            selectedIndex={this.state.cameraResolution}
            onSelect={this._setCameraResolution}
            value={this._getCameraResolution}>
            {cameraResolutions.map((renderOption, key) => (
              <SelectItem title={renderOption} key={key} />
            ))}
          </Select>
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
