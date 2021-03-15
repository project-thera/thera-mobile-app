import React from 'react';
import {View, Text} from 'react-native';

import {PermissionsAndroid} from 'react-native';
import Recording from 'react-native-recording';
import {fft, util} from 'fft-js';

import FFT2 from 'fft.js';

export default class BlowDetector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      prediction: '',
    };

    //this.handleImageTensorReady = this.handleImageTensorReady.bind(this);
    // this.setTextureDims = this.setTextureDims.bind(this);
  }

  componentWillUnmount() {
    Recording.stop();
    this.state.listener.remove();
  }

  frequencyToIndex(frequency, bufferSize, sampleRate) {
    return Math.round((frequency * bufferSize) / sampleRate);
  }

  async componentDidMount() {
    const BUFFER_SIZE = 4096;
    const MIN_FREQ = 1;
    const MAX_FREQ = 600; // 500
    const AMPLITUDE_THRESHOLD = 2000; // 60
    const REQUIRED_INTEGRAL = 3.6; // 3.6 3.2
    const FFT_SIZE = BUFFER_SIZE / 2;
    const SAMPLE_RATE = 44100;
    const MIN_FREQ_INDEX = this.frequencyToIndex(
      MIN_FREQ,
      BUFFER_SIZE,
      SAMPLE_RATE,
    );
    const MAX_FREQ_INDEX = this.frequencyToIndex(
      MAX_FREQ,
      BUFFER_SIZE,
      SAMPLE_RATE,
    );

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

      let detectionTime = performance.now();

      const listener = Recording.addRecordingEventListener(
        function (signal) {
          // Recording.stop();
          // listener.remove();

          //let phasors = fft(signal);

          // let frequencies = util.fftFreq(phasors, SAMPLE_RATE); // Sample rate and coef is just used for length, and frequency step
          // let magnitudes = util.fftMag(phasors);
          // let amplitudes = magnitudes.map((magnitude) => {
          //   return Math.abs(magnitude) / BUFFER_SIZE;
          // });

          const f = new FFT2(BUFFER_SIZE);
          let magnitudes = new Array(f.size / 2);
          f.realTransform(magnitudes, signal);

          let amplitudes = magnitudes.map((magnitude) => {
            return Math.abs(magnitude) / BUFFER_SIZE;
          });

          console.log(amplitudes);
          console.log(magnitudes.length);

          // console.log('frequencies');
          // console.log(frequencies);
          //console.log(amplitudes.slice(MIN_FREQ_INDEX, MAX_FREQ_INDEX));
          // console.log(amplitudes.slice(MIN_FREQ_INDEX, MAX_FREQ_INDEX));

          //console.log(signal);
          //console.log(magnitudes);
          // console.log(Math.sqrt(amplitudes[0]), Math.sqrt(amplitudes[1]));

          // let both = frequencies.map(function (f, ix) {
          //   return {[f]: amplitudes[ix]};
          // });
          // console.log(both);

          let energy = 0.0;
          let maxAmplitude = 0.0;

          // console.log(MIN_FREQ_INDEX, MAX_FREQ_INDEX);

          for (let bin = MIN_FREQ_INDEX; bin <= MAX_FREQ_INDEX; bin++) {
            maxAmplitude = Math.max(maxAmplitude, amplitudes[bin]);
            energy += amplitudes[bin];
          }

          console.log(maxAmplitude);

          let energyNeeded =
            ((MAX_FREQ_INDEX - MIN_FREQ_INDEX) * maxAmplitude) /
            REQUIRED_INTEGRAL;

          console.log('energy');
          console.log(energy);
          console.log('needed');
          console.log(energyNeeded);

          // console.log('ENERGY');
          // console.log(energy);
          // console.log(energyNeeded);
          // console.log(maxAmplitude);

          let detected =
            energy > energyNeeded && maxAmplitude > AMPLITUDE_THRESHOLD;

          console.log(
            'Detection took ' +
              (performance.now() - detectionTime) +
              ' milliseconds.',
          );
          detectionTime = performance.now();

          // console.log(amplitudes);

          this.setState({
            prediction: JSON.stringify({
              detected,
              energy,
              energyNeeded,
              maxAmplitude,
            }), // JSON.stringify(amplitudes.length),
            listener,
          });
        }.bind(this),
      );

      Recording.start();

      // this.setState({
      //   hasPermissions: status === 'granted',
      //   listener,
      //   encodedData: '',
      // });
    }
  }

  render() {
    // const {isLoading} = this.state;

    return (
      <View style={{width: '100%'}}>
        <View>
          <Text>{this.state.prediction}</Text>
        </View>
      </View>
    );
  }
}
