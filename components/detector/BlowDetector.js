import React from 'react';
import {View, Text} from 'react-native';

import Recording from 'react-native-recording';
import {amplitudeSpectrum} from 'fftjs-supplements';

import DetectorTimerConfidence from './DetectorTimerConfidence';

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

    this.state = {
      progress: 0,
    };
  }

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
    if (prevProps.currentStep !== this.props.currentStep) {
      this.setDetectorTimerConfidence();
    }
  }

  // TODO check if do this on unmount or in stop or both
  componentWillUnmount() {
    // Recording.stop();
    // this.listener.remove();
  }

  onProgress = (percentage) => {
    this.props.onProgress(percentage);

    this.setState({
      progress: percentage,
    });
    console.log(`PROGRESS ${percentage}`); // TODO show something in the ui
  };

  onStoppedDetection = () => {
    this.props.onStoppedDetection();
    console.log('NOT DETECTING'); // TODO stop showing something in the ui
  };

  onCompleted = () => {
    this.props.onStepCompleted();
    console.log('COMPLETADO'); // TODO stop showing something in the ui
  };

  start = () => {
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

  resume = () => {
    Recording.start();
  };

  pause = () => {
    Recording.stop();
  };

  // Call stop on component did unmount?
  stop = () => {
    Recording.stop();
    this.listener.remove();
  };

  detect = (prediction) => {
    this.detectorTimerConfidence.update(
      this.props.currentStep.detected === prediction,
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

  render() {
    return (
      <View style={{width: '100%'}}>
        <View>
          <Text>
            {this.props.currentStep.detected ? 'Sin soplar' : 'Soplar'}
          </Text>
          <Text>detected: {this.state.progress}</Text>
        </View>
      </View>
    );
  }
}
