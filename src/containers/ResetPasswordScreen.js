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

  handleSubmit = (values, {setErrors}) => {
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
        console.log(response?.data);

        if (response?.data?.id) {
          Toast.show({
            type: 'success',
            position: 'bottom',
            text1: `Se ha enviado un mensaje a la dirección de correo ${response?.data?.email} para continuar`,
          });

          this.props.navigation.navigate('home');
        } else {
          setErrors(response?.data?.errors);

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
          title="Thera Project"
          alignment="center"
          accessoryLeft={BackAction}
        />
        <Divider />
        <Layout style={styles.container}>
          <Text category="h2">Recuperar Contraseña</Text>
          <Formik
            initialValues={{
              email: '',
            }}
            onSubmit={this.handleSubmit}>
            {({handleChange, handleBlur, handleSubmit, values, errors}) => (
              <View>
                <Input
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  placeholder="Dirección de correo electrónico"
                  {...errorField({error: errors.email})}
                />

                <Button
                  style={styles.button}
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
