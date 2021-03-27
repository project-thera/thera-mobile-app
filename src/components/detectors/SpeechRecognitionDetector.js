import React from 'react';
import {StyleSheet} from 'react-native';

import {Text, Button, Icon, Layout, Spinner} from '@ui-kitten/components';

import Voice from '@react-native-voice/voice';

const LOCALE = 'es-AR';

// See options in https://github.com/react-native-voice/voice/blob/582027a906d1d908ce8cf88d8b827894dca5ea81/android/src/main/java/com/wenkesj/voice/VoiceModule.java#L81
const configuration = {
  EXTRA_MAX_RESULTS: 5,
};

export default class SpeechRecognition extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: '',
      end: false,
      started: false,
      results: [],
      message: '',
    };

    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechError = this.onSpeechError;
    Voice.onSpeechResults = this.onSpeechResults;
    // Voice.onSpeechRecognized = this.onSpeechRecognized;
    // Voice.onSpeechPartialResults = this.onSpeechPartialResults;
    // Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged;
  }

  componentWillUnmount() {
    Voice.destroy().then(Voice.removeAllListeners);
  }

  start = () => {};

  resume = () => {};

  pause = () => {};

  stop = () => {
    // Voice.destroy().then(Voice.removeAllListeners);
  };

  detect = (prediction) => {
    if (
      prediction[0].toLowerCase() ===
      this.props.currentStep.sentence.toLowerCase()
    ) {
      this.onCompleted();
    } else {
      this.onFail();
    }
  };

  onFail = () => {
    this.setState({
      started: false,
      end: false,
      message: 'No puedo oirte bien, intentalo de nuevo',
    });
  };

  onSpeechStart = (e) => {
    this.setState({
      started: true,
      message: '',
    });
  };

  // onSpeechRecognized = (e) => {
  //   console.log('RECOGNIZED');
  //   this.setState({
  //     recognized: '√',
  //   });
  // };

  onSpeechEnd = (e) => {
    this.setState({
      end: true,
    });
  };

  onSpeechError = (e) => {
    this.setState({
      error: JSON.stringify(e.error),
    });
  };

  onSpeechResults = (e) => {
    this.setState({
      results: e.value,
    });

    this.detect(e.value);
  };

  // onSpeechPartialResults = (e) => {
  //   this.setState({
  //     partialResults: e.value,
  //   });
  // };

  // onSpeechVolumeChanged = (e) => {
  //   this.setState({
  //     pitch: e.value,
  //   });
  // };

  onCompleted = () => {
    this.props.onStepCompleted();
  };

  _startRecognizing = async () => {
    this.setState({
      error: '',
      end: false,
      started: false,
      results: [],
    });

    try {
      await Voice.start(LOCALE, configuration);
    } catch (e) {
      console.error(e);
    }
  };

  async _stopRecognizing() {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  }

  async _cancelRecognizing() {
    try {
      await Voice.cancel();
    } catch (e) {
      console.error(e);
    }
  }

  async _destroyRecognizer() {
    try {
      await Voice.destroy();
    } catch (e) {
      console.error(e);
    }
    this.setState({
      recognized: '',
      pitch: '',
      error: '',
      started: '',
      results: [],
      partialResults: [],
      end: '',
    });
  }

  render() {
    return (
      <Layout style={styles.container}>
        <Text style={styles.centerText} category="h2">
          Deci la frase:
        </Text>
        <Text style={styles.centerText} category="h1">
          {this.props.currentStep.sentence}
        </Text>
        <Text style={styles.centerText} category="s1">
          Presiona el boton y empieza a hablar.
        </Text>
        <Layout style={{paddingTop: 100}}>
          {this.state.started && (
            <Layout style={{padding: 20}}>
              <Spinner size="galactic" />
            </Layout>
          )}
          {!this.state.started && (
            <Button
              size="giant"
              accessibilityLabel="Empezar detección"
              onPress={this._startRecognizing}
              appearance="ghost"
              accessoryLeft={(props) => (
                <Icon
                  {...props}
                  style={[props.style, {width: 75, height: 75}]}
                  name="mic"
                />
              )}
            />
          )}
        </Layout>

        <Text style={styles.centerText} status="danger" category="s1">
          {this.state.message}
        </Text>
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  centerText: {
    textAlign: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: '100%',
  },
});
