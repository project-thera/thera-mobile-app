import React from 'react';
import {StyleSheet} from 'react-native';

import {
  TopNavigationAction,
  TopNavigation,
  Icon,
  Button,
  Spinner,
} from '@ui-kitten/components';

import {SafeAreaView} from 'react-native-safe-area-context';
import {Camera} from 'expo-camera';

import Toast from 'react-native-toast-message';

import {RNFFmpeg} from 'react-native-ffmpeg';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

const MAX_DURATION = 2; // in seconds
const CAMERA_QUALITY = Camera.Constants.VideoQuality['4:3']; // or '480p' ?

import RNFS from 'react-native-fs';
import Database from '../storage/Database';

export default class RecordScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      camera: null,
      video: null,
      recording: false,
      processing: false,
    };
  }

  convertedFilename(uri) {
    const indexOfExtension = uri.indexOf('.mp4');

    return [
      uri.slice(0, indexOfExtension),
      '_converted',
      uri.slice(indexOfExtension),
    ].join('');
  }

  send = async () => {
    this.setState({processing: true});

    const {
      video: {uri},
    } = this.state;

    const convertedFilename = this.convertedFilename(uri);

    const result = await RNFFmpeg.executeWithArguments([
      '-i',
      uri,
      '-vcodec',
      'libx264',
      '-crf',
      '28',
      '-preset',
      'ultrafast',
      '-y', // Overwrite
      convertedFilename,
    ]);

    if (result === 0) {
      const base64video = await RNFS.readFile(convertedFilename, 'base64');

      const {error, errors} = await Database.getInstance().addPatientVideo(
        base64video,
      );

      if (error || errors) {
        Toast.show({
          duration: 2000,
          position: 'bottom',
          type: 'error',
          text1: 'No se ha podido enviar el video, inténtalo de nuevo',
        });
      } else {
        this.cancel();

        Toast.show({
          duration: 2000,
          type: 'success',
          position: 'bottom',
          text1: 'Se ha enviado el video con éxito',
        });
      }
    } else {
      Toast.show({
        duration: 2000,
        position: 'bottom',
        type: 'error',
        text1: 'No se ha podido procesar el video, inténtalo de nuevo',
      });

      console.log('Error: ', result);
    }

    this.setState({processing: false});
  };

  stop = async () => {
    this.camera.stopRecording();
  };

  cancel = () => {
    this.setState({video: null});
  };

  start = async () => {
    if (this.camera) {
      this.setState({recording: true}, async () => {
        const video = await this.camera.recordAsync({
          maxDuration: MAX_DURATION,
          quality: CAMERA_QUALITY,
        });

        this.setState({
          video,
          recording: false,
        });
      });
    }
  };

  navigateBack = () => {
    this.props.navigation.goBack();
  };

  render() {
    const BackAction = () => (
      <TopNavigationAction icon={BackIcon} onPress={this.navigateBack} />
    );

    return (
      <SafeAreaView style={styles.container}>
        <TopNavigation
          title="Grabar video"
          accessoryLeft={BackAction}
          alignment="center"
        />
        <Camera
          ref={(camera) => (this.camera = camera)}
          style={styles.camera}
          type={Camera.Constants.Type.front}
        />
        {this.state.video && (
          <>
            <Button onPress={this.cancel} disabled={this.state.processing}>
              Cancelar
            </Button>
            <Button onPress={this.send} disabled={this.state.processing}>
              {!this.state.processing && 'Enviar'}
              {this.state.processing && (
                <Spinner size="small" status="primary" />
              )}{' '}
            </Button>
          </>
        )}
        {this.state.recording && (
          <Button onPress={this.stop} disabled={this.state.processing}>
            Detener
          </Button>
        )}
        {!this.state.recording && !this.state.video && (
          <Button onPress={this.start} disabled={this.state.processing}>
            Comenzar
          </Button>
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  camera: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
