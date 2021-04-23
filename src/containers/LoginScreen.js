import React from 'react';
import {TouchableWithoutFeedback, StyleSheet, View} from 'react-native';
import {Icon, Input, Button, Spinner, Text} from '@ui-kitten/components';

import {SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {Formik} from 'formik';

import axios from 'axios';
import {LOGIN_URL} from '../../config/config';

import Database from '../storage/Database';

export default class LoginScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      secureTextEntry: true,
      loading: false,
    };
  }

  toggleSecureEntry = () => {
    this.setState({secureTextEntry: !this.state.secureTextEntry});
  };

  renderIcon = (props) => (
    <TouchableWithoutFeedback onPress={this.toggleSecureEntry}>
      <Icon {...props} name={this.state.secureTextEntry ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );

  navigateToSignUp = () => {
    this.props.navigation.navigate('sign-up');
  };

  navigateToResetPassword = () => {
    this.props.navigation.navigate('reset-password');
  };

  login = (values) => {
    this.setState({
      loading: true,
    });

    axios({
      method: 'post',
      url: LOGIN_URL,
      data: {
        user: values,
      },
    }).then(
      async (response) => {
        if (response?.data?.id) {
          Toast.show({
            type: 'success',
            position: 'bottom',
            text1: 'Te damos la bienvenida',
          });

          const currentUser = {
            data: response.data,
            token: response.headers['x-csrf-token'],
          };

          await Database.getInstance().setCurrentUser(currentUser);

          this.props.onLoggedIn(currentUser, () =>
            this.props.navigation.navigate('home'),
          );
        } else {
          Toast.show({
            type: 'error',
            position: 'bottom',
            text1: 'Los datos son incorrectos.',
          });

          this.setState({
            loading: false,
          });
        }
      },
      (error) => {
        console.log(JSON.stringify(error));

        this.setState({
          loading: false,
        });
      },
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Text category="h1">Thera Project</Text>
        <Formik initialValues={{email: '', password: ''}} onSubmit={this.login}>
          {({handleChange, handleBlur, handleSubmit, values}) => (
            <View>
              <Input
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                placeholder="Dirección de correo electrónico"
              />
              <Input
                value={values.password}
                placeholder="Contraseña"
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                // caption="Should contain at least 8 symbols"
                accessoryRight={this.renderIcon}
                secureTextEntry={this.state.secureTextEntry}
              />
              <Button
                style={styles.button}
                onPress={handleSubmit}
                disabled={this.state.loading}>
                {!this.state.loading && 'Ingresar'}
                {this.state.loading && (
                  <Spinner size="small" status="primary" />
                )}
              </Button>

              <Button appearance="ghost" onPress={this.navigateToSignUp}>
                Registrarse
              </Button>
              <Button appearance="ghost" onPress={this.navigateToResetPassword}>
                ¿Olvidaste tu contraseña?
              </Button>
            </View>
          )}
        </Formik>
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
  },
  button: {
    marginTop: 40,
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
