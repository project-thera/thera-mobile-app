import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Layout, Button, Text} from '@ui-kitten/components';

import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';

import Database from '../../storage/Database';

const database = Database.getInstance();

export default class ReminderSettings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      showDateTimePicker: false,
      reminder: null,
    };

    this.defaultValue = new Date();
  }

  componentDidMount = async () => {
    this.setState({
      reminder: await database.getReminder(),
    });
  };

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

    try {
      await database.removeReminder();

      Toast.show({
        type: 'success',
        position: 'bottom',
        text1: 'Se ha quitado el recordatorio diario',
      });
    } catch (error) {
      console.log(error);

      Toast.show({
        type: 'error',
        position: 'bottom',
        text1:
          'No se ha podido quitar el recordatorio, por favor intentelo de nuevo',
      });
    }

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
      await database.updateReminder(time);

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

  renderReminder = () => {
    if (this.state.reminder) {
      return <Text category="h2">{this.formattedReminder()}</Text>;
    }

    return <Text>Aún no has configurado ningún recordatorio.</Text>
  };

  render() {
    return (
      <Layout>
        {this.renderReminder()}

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
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    // paddingLeft: 20,
    // paddingRight: 20,
  },
  button: {
    // marginTop: 40,
  },
});
