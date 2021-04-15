import React from 'react';
import {Image, StyleSheet} from 'react-native';
import {Layout, Text} from '@ui-kitten/components';
import Recording from 'react-native-recording';
import {amplitudeSpectrum} from 'fftjs-supplements';

import DetectorTimerConfidence from './DetectorTimerConfidence';
import Balloon from '../base/Balloon';

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
// const SAMPLE_RATE = 8000;
const SAMPLE_RATE = 14000;
const MIN_FREQ_INDEX = _frequencyToIndex(MIN_FREQ, BUFFER_SIZE, SAMPLE_RATE);
const MAX_FREQ_INDEX = _frequencyToIndex(MAX_FREQ, BUFFER_SIZE, SAMPLE_RATE);

export default class BlowDetector extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.defaultState();
  }

  defaultState = () => {
    return {
      progress: 0,
      remainingTime: this.props.currentStep.time,
    };
  };

  reset = () => {
    this.setState(this.defaultState());
  };

  setDetectorTimerConfidence = () => {
    this.detectorTimerConfidence = new DetectorTimerConfidence({
      params: this.props.currentStep,
      onProgress: this.onProgress,
      onStoppedDetection: this.onStoppedDetection,
      onCompleted: this.onCompleted,
    });
  };

  componentDidMount() {
    this.setDetectorTimerConfidence();
  }

  // Needed because access to props to set instance variable
  componentDidUpdate(prevProps) {
    // console.log('BlowDetector/componentDidUpdate');

    if (prevProps.currentStep !== this.props.currentStep) {
      this.setDetectorTimerConfidence();
      this.reset();
    }
  }

  // TODO check if do this on unmount or in stop or both
  componentWillUnmount() {
    Recording.stop();

    if (this.listener) this.listener.remove();
  }

  onProgress = (data) => {
    this.setState({
      progress: data.progress,
      remainingTime: data.remainingTime,
    });

    this.props.onProgress(data);
  };

  onStoppedDetection = () => {
    // console.log('BlowDetector/onStoppedDetection');

    this.props.onStoppedDetection();
  };

  onCompleted = () => {
    console.log('BlowDetector/onCompleted');

    this.props.onStepCompleted({
      shouldPlaySound: !this._shouldBlow(),
    });
  };

  _start = async () => {
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
  };

  _stop = () => {
    Recording.stop();

    if (this.listener) this.listener.remove();
  };

  start = () => {
    this._start();
  };

  resume = () => {
    this._start();
  };

  pause = () => {
    this._stop();
  };

  stop = () => {
    this._stop();
  };

  /**
   * @param {boolean} isBlowing - If the users is blowing on microphone.
   */
  detect = (isBlowing) => {
    this.detectorTimerConfidence.update(
      this.props.currentStep.detected === isBlowing,
    );
  };

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

    this.detect(
      energy > energyNeeded &&
        maxAmplitude > AMPLITUDE_THRESHOLD &&
        energyAverage > ENERGY_AVERAGE_THRESHOLD,
    );
  };

  _shouldBlow = () => this.props.currentStep.detected;

  render() {
    return (
      <Layout style={styles.container}>
        <Text category="h2" style={styles.title}>
          Soplá tu pantalla
        </Text>
        <Layout style={styles.controlContainer}>
          <Balloon
            popped={!this._shouldBlow()}
            progress={this.state.progress}
          />
        </Layout>
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: 'bold',
    paddingHorizontal: 24,
  },
  controlContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-around',
    paddingHorizontal: 24,
  },
});
