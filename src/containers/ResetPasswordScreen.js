import React from 'react';
import {TouchableWithoutFeedback, StyleSheet, View} from 'react-native';
import {
  TopNavigationAction,
  TopNavigation,
  Icon,
  Input,
  Button,
  Spinner,
  Text,
  Divider,
  Layout,
} from '@ui-kitten/components';

import {SafeAreaView} from 'react-native-safe-area-context';

import {Formik} from 'formik';
import Toast from 'react-native-toast-message';

import axios from 'axios';
import {RESET_PASSWORD_URL} from '../../config/config';

import errorField from '../components/base/errorField';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

export default class ResetPasswordScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  navigateBack = () => {
    this.props.navigation.goBack();
  };

  toggleSecureEntry = () => {
    this.setState({secureTextEntry: !this.state.secureTextEntry});
  };

  renderIcon = (props) => (
    <TouchableWithoutFeedback onPress={this.toggleSecureEntry}>
      <Icon {...props} name={this.state.secureTextEntry ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );

  handleSubmit = (values) => {
    this.setState({
      loading: true,
    });

    axios({
      method: 'post',
      url: RESET_PASSWORD_URL,
      data: {
        api_v1_user: values,
      },
    }).then(
      (response) => {
        if (response?.status == 200) {
          Toast.show({
            type: 'success',
            position: 'bottom',
            text1: `Se ha enviado un mensaje a la dirección de correo para continuar`,
          });

          this.props.navigation.navigate('login');
        } else {
          Toast.show({
            type: 'error',
            position: 'bottom',
            text1: "Ha ocurrido un error al recuperar su contraseña, comuniquese con el administrador del sitio",
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
    const BackAction = () => (
      <TopNavigationAction icon={BackIcon} onPress={this.navigateBack} />
    );

    return (
      <SafeAreaView style={{flex: 1}}>
        <TopNavigation
          title="Proyecto Thera"
          subtitle="Recuperar contraseña"
          accessoryLeft={BackAction}
        />
        <Divider />
        <Layout style={styles.container}>
          <Text category="h2">Recuperar contraseña</Text>
          <Text style={{paddingBottom: 12}}>
            Ingresá tu dirección de correo electrónico para que podamos enviarte
            las instrucciones para reestablecer tu contraseña.
          </Text>
          <Formik
            initialValues={{
              email: '',
            }}
            onSubmit={this.handleSubmit}>
            {({handleChange, handleBlur, handleSubmit, values, errors}) => (
              <View>
                <Input
                  style={{marginTop: 8}}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  placeholder="Dirección de correo electrónico"
                  {...errorField({error: errors.email})}
                  autoCapitalize="none"
                />

                <Button
                  style={{marginTop: 8}}
                  onPress={handleSubmit}
                  disabled={this.state.loading}>
                  {!this.state.loading && 'Continuar'}
                  {this.state.loading && (
                    <Spinner size="small" status="primary" />
                  )}
                </Button>
              </View>
            )}
          </Formik>
        </Layout>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    flex: 1,
    padding: 24,
  },
});
