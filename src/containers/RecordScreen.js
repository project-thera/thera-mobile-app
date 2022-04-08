import React from 'react';
import {StyleSheet} from 'react-native';

import {
  Button,
  Icon,
  Layout,
  Spinner,
  Text,
  TopNavigationAction,
  TopNavigation,
} from '@ui-kitten/components';
import {Bar} from 'react-native-progress';

import {SafeAreaView} from 'react-native-safe-area-context';
import {Camera} from 'expo-camera';

import Toast from 'react-native-toast-message';

import {RNFFmpeg} from 'react-native-ffmpeg';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

const MAX_DURATION = 10; // in seconds
// const CAMERA_QUALITY = Camera.Constants.VideoQuality['4:3']; // or '480p' ?
const CAMERA_QUALITY = Camera.Constants.VideoQuality['480p']; // or '480p' ?

import RNFS from 'react-native-fs';
import Database from '../storage/Database';

const database = Database.getInstance();

export default class RecordScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      camera: null,
      video: null,
      recording: false,
      processing: false,
      loading: true,
      progress: 0,
    };

    this.step = Math.floor(100 / MAX_DURATION);
  }

  componentDidMount = async () => {
    this.cameraResolution = await database.getCameraResolution();

    this.setState({
      loading: false,
    });
  };

  componentWillUnmount = () => {
    if (this.progressInterval) clearInterval(this.progressInterval);
  };

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

      const {error, errors} = await database.addPatientVideo(base64video);

      if (error || errors) {
        Toast.show({
          duration: 2000,
          position: 'bottom',
          type: 'error',
          text1: 'No se ha podido enviar el video.',
          text2: 'Intentalo de nuevo.',
        });
      } else {
        this.cancel();

        Toast.show({
          duration: 2000,
          type: 'success',
          position: 'bottom',
          text1: '¡Excelente!',
          text1: 'Se ha enviado el video con éxito',
        });
      }
    } else {
      Toast.show({
        duration: 2000,
        position: 'bottom',
        type: 'error',
        text1: 'No se ha podido procesar el video.',
        text2: 'Intentalo de nuevo.',
      });

      console.log('Error: ', result);
    }

    this.setState({processing: false});
  };

  stop = async () => {
    this.setState({
      progress: 100,
    });

    if (this.progressInterval) clearInterval(this.progressInterval);

    this.camera.stopRecording();
  };

  cancel = () => {
    this.setState({video: null, progress: 0}, () => {
      if (this.progressInterval) clearInterval(this.progressInterval);
    });
  };

  start = async () => {
    if (this.camera) {
      this.setState({recording: true}, async () => {
        this.progressInterval = setInterval(() => {
          if (this.state.progress + this.step <= 100) {
            this.setState({
              progress: this.state.progress + this.step,
            });
          }
        }, 1000);

        const video = await this.camera.recordAsync({
          maxDuration: MAX_DURATION,
          quality: CAMERA_QUALITY,
        });

        clearInterval(this.progressInterval);

        this.setState({
          video,
          recording: false,
        });
      });
    }
  };

  renderCamera = () => {
    if (!this.state.loading) {
      let cameraHeight = this.cameraResolution.height;
      let cameraWidth = this.cameraResolution.width;

      return (
        <Camera
          ref={(camera) => (this.camera = camera)}
          style={[
            styles.camera,
            {height: cameraWidth / 4, width: cameraHeight / 4},
          ]}
          type={Camera.Constants.Type.front}
          ratio="16:9"
        />
      );
    }
  };

  renderBar = () => (
    <Bar
      progress={this.state.progress / 100}
      height={12}
      style={{marginVertical: 8}}
      color="#fcb040"
      unfilledColor="#eeeeee"
      useNativeDriver={true}
      borderWidth={0}
      borderRadius={100}
    />
  );

  render() {
    const BackAction = () => (
      <TopNavigationAction
        icon={BackIcon}
        onPress={() => this.props.navigation.goBack()}
      />
    );

    return (
      <SafeAreaView style={styles.container}>
        <TopNavigation
          title="Proyecto Thera"
          subtitle="Enviar video"
          accessoryLeft={BackAction}
        />
        <Layout style={styles.controlContainer}>
          <Text category="h2" style={styles.title}>
            Enviá un video de 10 segundos
          </Text>
          {this.renderCamera()}
          {this.renderBar()}
          {this.state.video && (
            <Layout
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Button
                onPress={this.cancel}
                disabled={this.state.processing}
                style={{flex: 1}}>
                Cancelar
              </Button>
              <Button
                onPress={this.send}
                disabled={this.state.processing}
                style={{marginLeft: 12, flex: 1}}>
                {!this.state.processing && 'Enviar'}
                {this.state.processing && (
                  <Spinner size="small" status="primary" />
                )}{' '}
              </Button>
            </Layout>
          )}
          {this.state.recording && (
            <Button
              onPress={this.stop}
              disabled={this.state.processing}
              style={styles.button}>
              Detener
            </Button>
          )}
          {!this.state.recording && !this.state.video && (
            <Button
              onPress={this.start}
              disabled={this.state.processing}
              style={styles.button}>
              Comenzar
            </Button>
          )}
        </Layout>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  controlContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-evenly',
    padding: 24,
  },
  title: {
    fontWeight: 'bold',
  },
  camera: {
    alignSelf: 'center',
  },
  button: {
    width: '100%',
  },
});
