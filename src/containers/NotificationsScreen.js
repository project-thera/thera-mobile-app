import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  Icon,
  TopNavigation,
  TopNavigationAction,
  Layout,
  Button,
  Text,
} from '@ui-kitten/components';

import DateTimePicker from '@react-native-community/datetimepicker';

import {SafeAreaView} from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';
import Database from '../storage/Database';

const TIME_FORMAT_OPTIONS = {
  hour: '2-digit',
  minute: '2-digit',
};

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

export default class NotificationsScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      showDateTimePicker: false,
      reminder: null,
    };

    this.defaultValue = new Date();
  }

  loadReminder = async () => {
    this.setState({
      reminder: await Database.getInstance().getReminder(),
    });
  };

  componentDidMount = () => {
    this.loadReminder();
  };

  renderBackAction = () => (
    <TopNavigationAction
      icon={BackIcon}
      onPress={() => this.props.navigation.goBack()}
    />
  );

  formattedReminder = () => {
    return this.state.reminder
      ? this.state.reminder.toLocaleTimeString('es-AR').slice(0, -3)
      : '';
  };

  showDateTimePicker = () => {
    this.setState({
      showDateTimePicker: true,
    });
  };

  removeReminder = async () => {
    this.setState({
      loading: true,
    });

    await Database.getInstance().removeReminder();

    this.setState({
      loading: false,
      reminder: null,
    });
  };

  updateReminder = async ({nativeEvent: {timestamp}}) => {
    this.setState({
      loading: true,
      showDateTimePicker: false,
    });

    const time = new Date(timestamp);
    time.setSeconds(0, 0);

    try {
      await Database.getInstance().updateReminder(time);

      this.setState({
        reminder: time,
      });

      Toast.show({
        type: 'success',
        position: 'bottom',
        text1: `Se ha fijado el recordatorio diario para la hora ${time}`,
      });
    } catch (error) {
      console.log(error);

      Toast.show({
        type: 'error',
        position: 'bottom',
        text1:
          'No se ha podido fijar el recordatorio, por favor intentelo de nuevo',
      });
    }

    this.setState({
      loading: false,
    });
  };

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <TopNavigation
          title="Thera Project"
          subtitle="Notificaciones"
          alignment="center"
          accessoryLeft={this.renderBackAction}
        />
        <Layout style={styles.container}>
          <Text category="h1">Notificación diaria</Text>

          <Text category="h2">{this.formattedReminder()}</Text>

          {!this.state.reminder && (
            <Button
              style={styles.button}
              onPress={this.showDateTimePicker}
              disabled={this.state.loading}>
              Agregar recordatorio
            </Button>
          )}
          {this.state.reminder && (
            <Button
              style={styles.button}
              onPress={this.removeReminder}
              disabled={this.state.loading}>
              Eliminar recordatorio
            </Button>
          )}
          {this.state.showDateTimePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={this.state.reminder || this.defaultValue}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={this.updateReminder}
            />
          )}
        </Layout>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingLeft: 20,
    paddingRight: 20,
  },
  button: {
    marginTop: 40,
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
