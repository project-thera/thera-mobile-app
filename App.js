/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import './config/development';

import {AsyncStorage} from 'react-native';

import {SafeAreaProvider} from 'react-native-safe-area-context';

import * as eva from '@eva-design/eva';
import {
  ApplicationProvider,
  IconRegistry,
  Spinner,
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

import {ApiClient} from 'jsonapi-react-native';
import schema from './src/models/schema';

import {API_URL} from './config/config';

import PouchDB from 'pouchdb-core';
PouchDB.plugin(require('pouchdb-adapter-asyncstorage').default);

import RCTNetworking from 'react-native/Libraries/Network/RCTNetworking';

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

    this.db = new PouchDB('thera', {adapter: 'asyncstorage'});
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
        currentUser: await this.db.get('current'),
        loadingUser: false,
      });
    } catch (error) {
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
  }

  async getJsonApiCurrentUser() {
    const client = new ApiClient({
      url: API_URL,
      schema,
      // headers: {
      //   'X-CSRF-Token': token,
      // },
    });
    const {data, error} = await client.fetch(['users', 'current']);
    console.log(data, error);
  }

  logout = () => {
    // Clear cookies
    RCTNetworking.clearCookies(() => {});

    // This clears the async storage
    // AsyncStorage.clear().then(() => console.log('Cleared'));

    this.db.get('current').then((doc) => {
      return this.db.remove(doc);
    });
  };

  onLoggedIn = async (response) => {
    const currentUser = {
      _id: 'current',
      data: response.data,
      token: response.headers['x-csrf-token'],
    };

    await this.db.put(currentUser);

    this.setState({currentUser});
  };

  renderAppNavigator = () => {
    return (
      <AppNavigator
        faceDetector={this.state.faceDetector}
        mobilenetDetector={this.state.mobilenetDetector}
      />
    );
  };

  renderLoginScreen = () => {
    return <LoginScreen onLoggedIn={this.onLoggedIn} />;
  };

  renderBrand = () => {
    return (
      <Layout
        style={{
          flex: 1,
          flexDirection: 'column',
          alignContent: 'center',
          justifyContent: 'center',
        }}>
        <AnimatableView animation="fadeIn">
          <Text category="h1" style={{textAlign: 'center'}}>
            Thera Project
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
          {!this.state.loadingUser &&
            this.state.currentUser &&
            this.renderAppNavigator()}
          {!this.state.loadingUser &&
            !this.state.currentUser &&
            this.renderLoginScreen()}
          {this.state.loadingUser && this.renderBrand()}
        </ApplicationProvider>
      </SafeAreaProvider>
    );
  }
}
