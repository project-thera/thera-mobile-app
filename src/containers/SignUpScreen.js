import React from 'react';
import {StyleSheet} from 'react-native';
import {Button, Layout, Text} from '@ui-kitten/components';

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'red',
    flex: 1,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  backgroundImage: {
    // alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    resizeMode: 'stretch',
    width: '100%',
  },
  layout: {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    flex: 1,
    padding: 40,
    textAlign: 'center',
  },
});

export default class SignUpScreen extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Layout style={styles.layout}>
          <Text>Create your Celsius Wallet</Text>
          <Text>How do you want to sign up?</Text>
        </Layout>
        <Layout style={styles.layout}>
          <Button>Sign up with Email</Button>
        </Layout>
        <Layout style={styles.layout}>
          <Text>Already have a Celsius Wallet? Log in</Text>
          <Text>App version 0.1.0</Text>
        </Layout>
      </React.Fragment>
    );
  }
}
