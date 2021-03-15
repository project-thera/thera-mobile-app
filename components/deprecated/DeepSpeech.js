import React from 'react';
import {AppState, View, Text} from 'react-native';

import {PermissionsAndroid} from 'react-native';
import Recording from 'react-native-recording';

import {amplitudeSpectrum} from 'fftjs-supplements';

import handleAppStateChange from '../utils/handleAppStateChange';

import {Asset} from 'expo-asset';

// import {Model} from 'deepspeech';

// const deepSpeech = require('../models/deep-speech.tflite');
// const scorer = require('../models/kenlm_es.scorer');

import RNFS from 'react-native-fs';

const BUFFER_SIZE = 4096;
const SAMPLE_RATE = 44100;

export default class BlowDetector extends React.Component {
  state = {
    appState: AppState.currentState,
  };

  constructor(props) {
    super(props);

    this.handleRecordingEvent = this.handleRecordingEvent.bind(this);
    this.handleAppStateChange = handleAppStateChange.bind(this);
  }

  onBackground() {}

  onForeground() {}

  updateDetectionTime() {
    const lastDetectionTimestamp = this.state.detectionTimestamp;
    const detectionTimestamp = performance.now();

    this.setState({
      detectionTimestamp: detectionTimestamp,
      detectionTime: detectionTimestamp - lastDetectionTimestamp,
    });
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);

    Recording.stop();
    this.state.listener.remove();
  }

  handleRecordingEvent(signal) {
    // Recording.stop();
    // listener.remove();
  }

  copyFiles() {
    // let filename = 'deep-speech.tflite';
    // let destPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
    // RNFS.copyFileAssets('deep-speech.tflite', destPath)
    //   .then((result) => console.log(result))
    //   .catch((error) => console.log(error));
  }

  async componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);

    // const deepSpeechAssets = Asset.fromModule(deepSpeech);
    // const scorerAssets = Asset.fromModule(scorer);

    const [{localUri}] = await Asset.loadAsync(
      require('../models/deep-speech.tflite'),
    );

    console.log(localUri);

    const permission = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);

    // TODO change for expo
    if (permission['android.permission.RECORD_AUDIO'] === 'granted') {
      this.copyFiles();

      Recording.init({
        bufferSize: BUFFER_SIZE,
        sampleRate: SAMPLE_RATE,
        bitsPerChannel: 16,
        channelsPerFrame: 2,
      });

      const listener = Recording.addRecordingEventListener(
        this.handleRecordingEvent,
      );

      this.setState({listener});

      // Recording.start();
    }

    // this.setState({
    //   hasPermissions: status === 'granted',
    //   listener,
    //   encodedData: '',
    // });
  }

  render() {
    // const {isLoading} = this.state;

    return (
      <View style={{width: '100%'}}>
        <View>
          <Text>hola</Text>
        </View>
      </View>
    );
  }
}
