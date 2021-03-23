import React from 'react';
import {StyleSheet, Text, View, Button} from 'react-native';

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
      recognized: '',
      pitch: '',
      error: '',
      end: '',
      started: '',
      results: [],
      partialResults: [],
    };

    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechRecognized = this.onSpeechRecognized;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechError = this.onSpeechError;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechPartialResults = this.onSpeechPartialResults;
    Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged;
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
    }
  };

  onSpeechStart = (e) => {
    this.setState({
      started: '√',
    });
  };

  onSpeechRecognized = (e) => {
    this.setState({
      recognized: '√',
    });
  };

  onSpeechEnd = (e) => {
    this.setState({
      end: '√',
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

  onSpeechPartialResults = (e) => {
    this.setState({
      partialResults: e.value,
    });
  };

  onSpeechVolumeChanged = (e) => {
    this.setState({
      pitch: e.value,
    });
  };

  onCompleted = () => {
    this.props.onStepCompleted();
  };

  _startRecognizing = async () => {
    this.setState({
      recognized: '',
      pitch: '',
      error: '',
      started: '',
      results: [],
      partialResults: [],
      end: '',
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
      <View>
        <Text style={styles.welcome}>
          Deci la frase: {this.props.currentStep.sentence}
        </Text>
        <Text style={styles.instructions}>
          Press the button and start speaking.
        </Text>
        <Text style={styles.stat}>{`Started: ${this.state.started}`}</Text>
        <Text
          style={styles.stat}>{`Recognized: ${this.state.recognized}`}</Text>
        <Text style={styles.stat}>{`Pitch: ${this.state.pitch}`}</Text>
        <Text style={styles.stat}>{`Error: ${this.state.error}`}</Text>
        <Text style={styles.stat}>Results</Text>
        {this.state.results.map((result, index) => {
          return (
            <Text key={`result-${index}`} style={styles.stat}>
              {result}
            </Text>
          );
        })}
        <Text style={styles.stat}>Partial Results</Text>
        {this.state.partialResults.map((result, index) => {
          return (
            <Text key={`partial-result-${index}`} style={styles.stat}>
              {result}
            </Text>
          );
        })}
        <Text style={styles.stat}>{`End: ${this.state.end}`}</Text>
        <Button
          onPress={this._startRecognizing}
          title="Empezar deteccion"
          accessibilityLabel="Learn more about this purple button"
        />
        <Button
          onPress={this._stopRecognizing}
          title="Detener"
          accessibilityLabel="Learn more about this purple button"
        />
        <Button
          onPress={this._cancelRecognizing}
          title="Cancelar"
          accessibilityLabel="Learn more about this purple button"
        />
        <Button
          onPress={this._destroyRecognizer}
          title="Destruir"
          accessibilityLabel="Learn more about this purple button"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  action: {
    textAlign: 'center',
    color: '#0000FF',
    marginVertical: 5,
    fontWeight: 'bold',
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  stat: {
    textAlign: 'center',
    color: '#B0171F',
    marginBottom: 1,
  },
});
