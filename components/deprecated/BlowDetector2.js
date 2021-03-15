import React from 'react';
import {AppState, View, Text} from 'react-native';

import {PermissionsAndroid} from 'react-native';
import Recording from 'react-native-recording';

import {amplitudeSpectrum} from 'fftjs-supplements';

import DetectorConfidence from './detector/DetectorConfidence';

function frequencyToIndex(frequency, bufferSize, sampleRate) {
  return Math.ceil((frequency * bufferSize) / sampleRate);
}

const BUFFER_SIZE = 1024;
const MIN_FREQ = 1;
const MAX_FREQ = 600;
const AMPLITUDE_THRESHOLD = 2000;
const ENERGY_AVERAGE_THRESHOLD = 700;
const REQUIRED_INTEGRAL = 8;
// const FFT_SIZE = BUFFER_SIZE / 2;
const SAMPLE_RATE = 8000;
const MIN_FREQ_INDEX = frequencyToIndex(MIN_FREQ, BUFFER_SIZE, SAMPLE_RATE);
const MAX_FREQ_INDEX = frequencyToIndex(MAX_FREQ, BUFFER_SIZE, SAMPLE_RATE);

export default class BlowDetector extends React.Component {
  state = {
    appState: AppState.currentState,
  };

  constructor(props) {
    super(props);

    this.handleRecordingEvent = this.handleRecordingEvent.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.detectorConfidence = new DetectorConfidence({
      requiredConfidence: 2,
      penalizeStep: 2,
      maxConfidence: 5,
    });
  }

  handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground!');
    } else {
      console.log('background!');
    }

    this.setState({appState: nextAppState});
  };

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

    let amplitudes = amplitudeSpectrum(signal);
    let energy = 0.0;
    let maxAmplitude = 0.0;

    for (let bin = MIN_FREQ_INDEX; bin <= MAX_FREQ_INDEX; bin++) {
      maxAmplitude = Math.max(maxAmplitude, amplitudes[bin]);
      energy += amplitudes[bin];
    }

    let energyAverage = energy / (MAX_FREQ_INDEX - MIN_FREQ_INDEX);

    let energyNeeded =
      ((MAX_FREQ_INDEX - MIN_FREQ_INDEX) * maxAmplitude) / REQUIRED_INTEGRAL;

    let detected =
      energy > energyNeeded &&
      maxAmplitude > AMPLITUDE_THRESHOLD &&
      energyAverage > ENERGY_AVERAGE_THRESHOLD;

    this.updateDetectionTime();

    this.setState({
      detected: this.detectorConfidence.update(detected),
      energy,
      energyAverage,
      energyNeeded,
      energyOk: energy > energyNeeded,
      maxAmplitude,
    });
  }

  // AS stands for amplitude spectrum
  // fs stands for frequency of sampling
  addFrequecyOnAS(resultAS, sampleRate) {
    const N = resultAS.length * 2;
    const resolution = sampleRate / N;

    return resultAS.map((amp, index) => [resolution * index, amp]);
  }

  async componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);

    const permission = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);

    // TODO change for expo
    if (permission['android.permission.RECORD_AUDIO'] === 'granted') {
      Recording.init({
        bufferSize: BUFFER_SIZE,
        sampleRate: SAMPLE_RATE,
        bitsPerChannel: 16,
        channelsPerFrame: 1,
      });

      const listener = Recording.addRecordingEventListener(
        this.handleRecordingEvent,
      );

      this.setState({listener});

      Recording.start();
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
          <Text>detected: {this.state.detected ? 'true' : 'false'}</Text>
          <Text>energy: {this.state.energy}</Text>
          <Text>energyNeeded: {this.state.energyNeeded}</Text>
          <Text>energyAverage: {this.state.energyAverage}</Text>
          <Text>energyok: {this.state.energyOk ? 'true' : 'false'}</Text>
          <Text>maxAmplitude: {this.state.maxAmplitude}</Text>
          <Text>detectionTime: {this.state.detectionTime}</Text>
        </View>
      </View>
    );
  }
}
