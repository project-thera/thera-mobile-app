import React from 'react';
import {TouchableWithoutFeedback, StyleSheet, View} from 'react-native';
import {Icon, Input, Button, Spinner} from '@ui-kitten/components';

import {SafeAreaView} from 'react-native-safe-area-context';

import {Formik} from 'formik';

import axios from 'axios';
import {LOGIN_URL} from '../../config/config';

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
        api_v1_user: values,
      },
    }).then(
      (response) => {
        if (response?.data?.success) {
          this.props.onLoggedIn(response);
        } else {
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
      <SafeAreaView style={{flex: 1}}>
        <Formik initialValues={{email: '', password: ''}} onSubmit={this.login}>
          {({handleChange, handleBlur, handleSubmit, values}) => (
            <View style={{padding: 20}}>
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
                // onChangeText={(nextValue) =>
                //   this.setState({password: nextValue})
                // }
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
            </View>
          )}
        </Formik>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    marginTop: 10,
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
