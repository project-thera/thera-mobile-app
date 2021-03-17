import React from 'react';
import {View, Text} from 'react-native';

import Recording from 'react-native-recording';
import {amplitudeSpectrum} from 'fftjs-supplements';

// import DetectorConfidence from './DetectorConfidence';

function _frequencyToIndex(frequency, bufferSize, sampleRate) {
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
const MIN_FREQ_INDEX = _frequencyToIndex(MIN_FREQ, BUFFER_SIZE, SAMPLE_RATE);
const MAX_FREQ_INDEX = _frequencyToIndex(MAX_FREQ, BUFFER_SIZE, SAMPLE_RATE);

export default class BlowDetector extends React.Component {
  constructor(props) {
    super(props);
  }

  start() {
    Recording.init({
      bufferSize: BUFFER_SIZE,
      sampleRate: SAMPLE_RATE,
      bitsPerChannel: 16,
      channelsPerFrame: 1,
    });

    this.listener = Recording.addRecordingEventListener(
      this._handleRecordingEvent,
    );

    Recording.start();
  }

  resume() {
    Recording.start();
  }

  pause() {
    Recording.stop();
  }

  stop() {
    Recording.stop();
    this.state.listener.remove();
  }

  _handleRecordingEvent = (signal) => {
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

    this.setState({
      detected,
    });
  };

  render() {
    return (
      <View style={{width: '100%'}}>
        <View>
          <Text>detected: {this.state.detected ? 'true' : 'false'}</Text>
        </View>
      </View>
    );
  }
}
