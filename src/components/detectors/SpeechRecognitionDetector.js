import React from 'react';
import {StyleSheet} from 'react-native';

import {Text, Button, Icon, Layout, Spinner} from '@ui-kitten/components';

import Toast from 'react-native-toast-message';

import Voice from '@react-native-voice/voice';
import Word from '../base/Word';

import Messages from '../base/Messages';

const LOCALE = 'es-AR';

// See options in https://github.com/react-native-voice/voice/blob/582027a906d1d908ce8cf88d8b827894dca5ea81/android/src/main/java/com/wenkesj/voice/VoiceModule.java#L81
const configuration = {
  EXTRA_MAX_RESULTS: 5,
};

export default class SpeechRecognition extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.defaultState();

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

  defaultState() {
    return {
      error: '',
      end: false,
      started: false,
      results: [],
      message: '',
      messageStatus: 'primary',
      showSpinner: false,
      showButton: true,
      showSkipButton: true,
    };
  }

  reset = () => {
    this.setState(this.defaultState());
  };

  componentDidUpdate(prevProps) {
    if (prevProps.currentStep !== this.props.currentStep) {
      this.reset();
    }
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
      showSpinner: false,
      showButton: true,
      message: 'No puedo oirte bien, intentalo de nuevo',
      messageStatus: 'danger',
    });

    Toast.show({
      position: 'bottom',
      type: 'error',
      text1: 'Eso no sonó bien.',
      text2: 'Por favor, intentalo de nuevo.',
    });
  };

  onSpeechStart = (e) => {
    this.setState({
      started: true,
      showSpinner: true,
      showButton: false,
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
    this.setState({
      message: 'Muy bien',
      messageStatus: 'success',
      showSpinner: false,
      showButton: false,
    });

    Toast.show({
      position: 'bottom',
      type: 'success',
      text1: Messages.successTitle(),
      text2: Messages.successSubtitle(),
      visibilityTime: 2000,
    });

    this.props.onStepCompleted();
  };

  _startRecognizing = async () => {
    Toast.hide();

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

  renderSpinner = () => {
    if (this.state.showSpinner) {
      return (
        <Layout style={{padding: 20}}>
          <Spinner size="galactic" 
          style={{width: 200, height: 200, borderRadius: 100, marginBottom: 16}}/>
        </Layout>
      );
    }
  };

  renderButton = () => {
    if (this.state.showButton) {
      return (
        <Button
          size="giant"
          accessibilityLabel="Empezar detección"
          onPress={this._startRecognizing}
          appearance="outline"
          style={{width: 200, height: 200, borderRadius: 100, marginBottom: 16}}
          accessoryLeft={(props) => {
            let recording = false
            if (!recording) return (
              <Icon
                {...props}
                animationConfig={{ cycles: Infinity }}
                animation='shake'
                style={[props.style, {width: 120, height: 120 }]}
                name="mic"
              />)
            if (recording) return (
            <Icon
              {...props}
              style={[props.style, {width: 120, height: 120 }]}
              name="mic"
            />
          )}}
        />
      );
    }
  };

  renderSkipButton = () => {
    if (this.state.showSkipButton) {
      return (
        <Button style={{width: '100%'}} appearance="ghost" status="basic">
          No puedo hablar en este momento
        </Button>
      );
    }
  };

  render() {
    return (
      <Layout style={styles.container}>
        <Text category="h2" style={styles.title}>
          Pronunciá la palabra
        </Text>
        <Word word={this.props.currentStep.sentence} />
        <Layout style={styles.controlContainer}>
          {this.renderSpinner()}
          {this.renderButton()}
          {this.renderSkipButton()}
        </Layout>

        {/* <Text
          style={styles.centerText}
          status={this.state.messageStatus}
          category="s1">
          {this.state.message}
        </Text> */}
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
    paddingHorizontal: 24,
  },
});
