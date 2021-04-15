import React from 'react';
import {StyleSheet} from 'react-native';
import {Button, Icon, Layout, Text} from '@ui-kitten/components';
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
  }

  componentWillUnmount() {
    Voice.destroy().then(Voice.removeAllListeners);
  }

  defaultState() {
    return {
      errorMessage: '',
      isRecognizing: false,
      speakButtonAppearance: 'filled',
      speakButtonStatus: 'primary',
      results: [],
      showSpeakButton: true,
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
    console.log('SpeechRecognitionDetector/detect');

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
    console.log('SpeechRecognitionDetector/onFail');

    this.setState({
      showSpeakButton: true,
    });

    Toast.show({
      duration: 2000,
      position: 'bottom',
      type: 'error',
      text1: 'Eso no sonó bien.',
      text2: 'Por favor, intentalo de nuevo.',
    });
  };

  onSpeechStart = (e) => {
    console.log('SpeechRecognitionDetector/onSpeechStart');

    this.speakIconRef.startAnimation();

    this.setState({
      isRecognizing: true,
      speakButtonAppearance: 'outline',
      speakButtonStatus: 'danger',
      // showSpeakButton: false,
    });
  };

  onSpeechEnd = (e) => {
    console.log('SpeechRecognitionDetector/onSpeechEnd');

    this.speakIconRef.stopAnimation();

    this.setState({
      isRecognizing: false,
      speakButtonAppearance: 'filled',
      speakButtonStatus: 'primary',
      end: true,
    });
  };

  onSpeechError = (e) => {
    console.log('SpeechRecognitionDetector/onSpeechError');

    this.setState({
      errorMessage: JSON.stringify(e.error),
    });
  };

  onSpeechResults = (e) => {
    console.log('SpeechRecognitionDetector/onSpeechResults');

    this.setState({
      results: e.value,
    });

    this.detect(e.value);
  };

  onCompleted = () => {
    console.log('SpeechRecognitionDetector/onCompleted');

    this.setState({
      showSpeakButton: false,
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

  onSpeakButtonPressed = () => {
    console.log('SpeechRecognitionDetector/onPressSpeakButton');

    if (this.state.isRecognizing) {
      this._cancelRecognizing();
    } else {
      this._startRecognizing();
    }
  };

  _startRecognizing = async () => {
    console.log('SpeechRecognitionDetector/_startRecognizing');

    Toast.hide();

    this.setState({
      errorMessage: '',
      results: [],
      speakButtonAppearance: 'outline',
      speakButtonStatus: 'danger',
    });

    try {
      await Voice.start(LOCALE, configuration);
    } catch (e) {
      console.error(e);
    }
  };

  _stopRecognizing = async () =>  {
    console.log('SpeechRecognitionDetector/_stopRecognizing');

    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  }

  _cancelRecognizing = async () =>  {
    console.log('SpeechRecognitionDetector/_cancelRecognizing');

    this.speakIconRef.stopAnimation();

    this.setState({
      isRecognizing: false,
      speakButtonAppearance: 'filled',
      speakButtonStatus: 'primary',
    });

    try {
      await Voice.cancel();
    } catch (e) {
      console.error(e);
    }
  }

  _destroyRecognizer = async () => {
    try {
      await Voice.destroy();
    } catch (e) {
      console.error(e);
    }
    this.setState({
      recognized: '',
      pitch: '',
      errorMessage: '',
      started: '',
      results: [],
      partialResults: [],
      end: '',
    });
  }

  renderSpeakButtonIcon = (props) => {
    return (
      <Icon
        {...props}
        animationConfig={{cycles: Infinity}}
        animation="pulse"
        style={[props.style, styles.speakButtonIcon]}
        ref={(ref) => (this.speakIconRef = ref)}
        name="mic"
      />
    );
  };

  renderSpeakButton = () => {
    if (this.state.showSpeakButton) {
      return (
        <Button
          size="giant"
          accessibilityLabel="Empezar detección"
          onPress={this.onSpeakButtonPressed}
          appearance={this.state.speakButtonAppearance}
          status={this.state.speakButtonStatus}
          style={styles.speakButton}
          accessoryLeft={this.renderSpeakButtonIcon}
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
          {this.renderSpeakButton()}
          {this.renderSkipButton()}
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
    paddingHorizontal: 24,
  },
  speakButton: {
    borderRadius: 100,
    marginBottom: 16,
    height: 200,
    width: 200,
  },
  speakButtonIcon: {
    height: 120,
    width: 120,
  },
});
