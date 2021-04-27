import React from 'react';
import {Image, TouchableWithoutFeedback, StyleSheet, View} from 'react-native';
import {
  Icon,
  Input,
  Button,
  Spinner,
  Text,
  Layout,
} from '@ui-kitten/components';

import {SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {Formik} from 'formik';

import axios from 'axios';

import icons from '../assets/images/icons';
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
            text1: 'Acceso permitido.',
            text2: '¡Hoy es un gran día para practicar!',
          });

          const currentUser = {
            data: response.data,
            token: response.headers['x-csrf-token'],
          };

          await Database.getInstance().setCurrentUser(currentUser);

          this.props.onLoggedIn(currentUser, () => {
            // we need to reset the stack when the user is logged in
            this.props.navigation.reset({routes: [{name: 'home'}]});
          });
        } else {
          Toast.show({
            type: 'error',
            position: 'bottom',
            text1: 'Los datos ingresados son incorrectos.',
            text2: 'Por favor, revisalos y volvé a intentar.',
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
        <Layout style={styles.appLogoContainer}>
          <Image style={styles.appLogoImage} source={icons.projectTheraIcon} />
          <Text category="h1" style={styles.appLogoText}>
            Proyecto Thera
          </Text>
        </Layout>
        <Formik initialValues={{email: '', password: ''}} onSubmit={this.login}>
          {({handleChange, handleBlur, handleSubmit, values}) => (
            <Layout style={styles.loginContainer}>
              <Layout style={{backgroundColor: 'transparent'}}>
                <Input
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  placeholder="Dirección de correo electrónico"
                  autoCapitalize="none"
                />
                <Input
                  value={values.password}
                  placeholder="Contraseña"
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  accessoryRight={this.renderIcon}
                  secureTextEntry={this.state.secureTextEntry}
                />
                <Button
                  style={{marginTop: 8}}
                  onPress={handleSubmit}
                  disabled={this.state.loading}>
                  {!this.state.loading && 'Ingresar'}
                  {this.state.loading && (
                    <Spinner size="small" status="primary" />
                  )}
                </Button>
              </Layout>

              <Layout style={{backgroundColor: 'transparent'}}>
                <Button
                  appearance="ghost"
                  style={styles.ghostButton}
                  onPress={() => this.props.navigation.navigate('sign-up')}>
                  Creá tu cuenta
                </Button>
                <Button
                  appearance="ghost"
                  style={styles.ghostButton}
                  onPress={() =>
                    this.props.navigation.navigate('reset-password')
                  }>
                  ¿Olvidaste tu contraseña?
                </Button>
              </Layout>
            </Layout>
          )}
        </Formik>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    padding: 24,
  },
  appLogoContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flex: 1,
  },
  appLogoImage: {
    flex: 2,
    resizeMode: 'contain',
  },
  appLogoText: {
    flex: 1,
  },
  loginContainer: {
    backgroundColor: 'transparent',
    flex: 1,
    justifyContent: 'space-between',
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
