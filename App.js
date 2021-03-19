/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Fragment,
} from 'react-native';

import * as Permissions from 'expo-permissions';

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import {bundleResourceIO} from '@tensorflow/tfjs-react-native';

import * as mobilenet from './components/utils/Mobilenet';
const modelJson = require('./models/model.json');
const modelWeights = [
  require('./models/group1-shard1of1.bin'),
  //  require('./models/group1-shard2of2.bin'),
];

import * as blazeface from '@tensorflow-models/blazeface';

// import Exercises from './components/RealTimeBlazefaceTest';
// import Exercises from './components/RealTimeBlazefaceCustom';
// import RealTime from './components/BlowDetector';
// import RealTime from './components/SpeechRecognition';
import Exercises from './components/Exercises';

const BACKEND_TO_USE = 'rn-webgl';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      currentScreen: 'exercises',
    };
  }

  askForPermissions = async () => {
    let {status} = await Permissions.askAsync(
      Permissions.CAMERA,
      Permissions.AUDIO_RECORDING,
    );

    this.setState({hasPermissions: status === 'granted'});
  };

  loadDetectors = async () => {
    const [faceDetector, mobilenetDetector] = await Promise.all([
      blazeface.load({
        maxFaces: 1,
        inputWidth: 128,
        inputHeight: 128,
        iouThreshold: 0.3,
        scoreThreshold: 0.99,
      }),
      mobilenet.load({
        modelUrl: await bundleResourceIO(modelJson, modelWeights),
        version: 2.0,
        alpha: 1.0,
        inputRange: [0, 1],
      }),
    ]);

    this.setState({
      loading: false,
      faceDetector,
      mobilenetDetector,
    });
  };

  async componentDidMount() {
    await tf.setBackend(BACKEND_TO_USE);
    await tf.ready();

    this.askForPermissions();
    this.loadDetectors();
  }

  renderRealTime() {
    return <RealTime />;
  }

  renderExercises() {
    const {faceDetector, mobilenetDetector} = this.state;

    const exercises = [
      {
        type: 'classification',
        steps: [
          {
            time: 1000, // in ms
            label: 'lengua afuera',
          },
          {
            time: 1000, // in ms
            label: 'boca cerrada',
          },
        ],
      },
      {
        type: 'blow',
        steps: [
          {
            time: 1000, // in ms
            detected: false,
          },
        ],
      },
      {
        type: 'speech',
        steps: [
          {
            sentence: 'perro',
          },
        ],
      },
      {
        type: 'classification',
        steps: [
          {
            time: 1000, // in ms
            label: 'boca cerrada',
          },
          {
            time: 1000, // in ms
            label: 'lengua afuera',
          },
        ],
      },
    ];

    return (
      <Exercises
        exercises={exercises}
        faceDetector={faceDetector}
        mobilenetDetector={mobilenetDetector}
      />
    );
  }

  renderLoading() {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Loading</Text>
      </View>
    );
  }

  renderContent() {
    const {loading, currentScreen} = this.state;

    if (!loading) {
      switch (currentScreen) {
        case 'realtime':
          return this.renderRealTime();
        case 'exercises':
          return this.renderExercises();
        default:
          return this.renderRealTime();
      }
    } else {
      return this.renderLoading();
    }
  }

  render() {
    return (
      <View>
        <Text>App</Text>
        <SafeAreaView>
          <View style={styles.body}>{this.renderContent()}</View>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: 'white',
  },
  body: {
    backgroundColor: 'white',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'black',
    marginBottom: 6,
  },
});
