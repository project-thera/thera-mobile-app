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

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

// import RealTime from './components/RealTimeBlazefaceTest';
// import RealTime from './components/RealTimeBlazefaceCustom';
// import RealTime from './components/BlowDetector';
import RealTime from './components/SpeechRecognition';

const BACKEND_TO_USE = 'rn-webgl';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isTfReady: false,
    };
  }

  async componentDidMount() {
    await tf.setBackend(BACKEND_TO_USE);
    await tf.ready();

    this.setState({
      currentScreen: 'realtime',
      isTfReady: true,
    });
  }

  renderRealTime() {
    return <RealTime />;
  }

  renderLoadingTF() {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Loading TF</Text>
      </View>
    );
  }

  renderContent() {
    const {isTfReady, currentScreen} = this.state;

    if (isTfReady) {
      switch (currentScreen) {
        case 'realtime':
          return this.renderRealTime();
        default:
          return this.renderRealTime();
      }
    } else {
      return this.renderLoadingTF();
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
