/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {StyleSheet} from 'react-native';

import './config/development';

import {SafeAreaProvider} from 'react-native-safe-area-context';

import * as eva from '@eva-design/eva';
import {
  ApplicationProvider,
  IconRegistry,
  Layout,
  Text,
} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import {AppNavigator} from './src/navigation/navigation';
import {View as AnimatableView} from 'react-native-animatable';
// Use https://colors.eva.design/?utm_campaign=eva_colors%20-%20home%20-%20kitten_docs&utm_source=ui_kitten&utm_medium=referral&utm_content=branding_article_link
// Export as json
import {default as theme} from './src/themes/custom-theme.json';
import {default as mapping} from './src/themes/mapping.json';

import * as Permissions from 'expo-permissions';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import {bundleResourceIO} from '@tensorflow/tfjs-react-native';
import * as mobilenet from './src/models/mobilenet/Mobilenet';
import * as blazeface from './src/models/blazeface';

const modelJson = require('./src/models/mobilenet/data/model.json');
const modelWeights = require('./src/models/mobilenet/data/group1-shard1of1.bin');

const blazefaceModelJson = require('./src/models/blazeface/data/model.json');
const blazefaceModelWeights = require('./src/models/blazeface/data/group1-shard1of1.bin');

const BACKEND_TO_USE = 'rn-webgl';

import LoginScreen from './src/containers/LoginScreen';

import Database from './src/storage/Database';

import {createReminderChannel} from './src/notifications';

const IGNORE_LOGIN = false;

export default class App extends React.Component {
  constructor(props) {
    super(props);

    if (IGNORE_LOGIN) {
      this.state = {
        hasPermissions: false,
        loadingUser: false,
        currentUser: {email: 'mail@example.com'},
      };
    } else {
      this.state = {
        hasPermissions: false,
        loadingUser: true,
        currentUser: null,
      };
    }
  }

  askForPermissions = async () => {
    let {status} = await Permissions.askAsync(
      Permissions.CAMERA,
      Permissions.AUDIO_RECORDING,
    );

    this.setState({hasPermissions: status === 'granted'});
  };

  loadDetectors = () => {
    mobilenet
      .load({
        modelUrl: bundleResourceIO(modelJson, modelWeights),
        version: 2.0,
        alpha: 1.0,
        inputRange: [0, 1],
      })
      .then((mobilenetDetector) => {
        this.setState({
          mobilenetDetector,
        });
      });

    blazeface
      .load({
        modelUrl: bundleResourceIO(blazefaceModelJson, blazefaceModelWeights),
        maxFaces: 1,
        inputWidth: 128,
        inputHeight: 128,
        iouThreshold: 0.3,
        scoreThreshold: 0.99,
      })
      .then((faceDetector) => {
        this.setState({
          faceDetector,
        });
      });
  };

  setCurrentUser = async () => {
    try {
      this.setState({
        currentUser: await Database.getInstance().getCurrentUser(),
        loadingUser: false,
      });
    } catch (error) {
      console.log(error);

      this.setState({loadingUser: false});
    }
  };

  async componentDidMount() {
    tf.setBackend(BACKEND_TO_USE);
    await tf.ready();

    this.loadDetectors();
    // this.logout();
    !IGNORE_LOGIN && this.setCurrentUser();
    this.askForPermissions();

    createReminderChannel();
  }

  onLoggedIn = (currentUser, callback) => {
    this.setState({currentUser}, callback);
  };

  renderAppNavigator = () => {
    return (
      <AppNavigator
        faceDetector={this.state.faceDetector}
        mobilenetDetector={this.state.mobilenetDetector}
        onLoggedIn={this.onLoggedIn}
        currentUser={this.state.currentUser}
      />
    );
  };

  renderLoginScreen = () => {
    return <LoginScreen onLoggedIn={this.onLoggedIn} />;
  };

  renderBrand = () => {
    return (
      <Layout style={styles.brandContainer}>
        <AnimatableView animation="fadeIn">
          <Text category="h1" style={styles.centeredText}>
            Proyecto Thera
          </Text>
        </AnimatableView>
      </Layout>
    );
  };

  render() {
    return (
      <SafeAreaProvider>
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider
          {...eva}
          customMapping={mapping}
          theme={{...eva.light, ...theme}}>
          {!this.state.loadingUser && this.renderAppNavigator()}
          {this.state.loadingUser && this.renderBrand()}
        </ApplicationProvider>
      </SafeAreaProvider>
    );
  }
}

const styles = StyleSheet.create({
  brandContainer: {
    height: 40,
    width: 40,
    marginRight: 8,
    resizeMode: 'contain',
  },
  centeredText: {
    textAlign: 'center',
  },
});
