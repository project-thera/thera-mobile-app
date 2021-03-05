import React from 'react';
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  View,
  Platform,
  Text,
} from 'react-native';

import * as Permissions from 'expo-permissions';
import {Camera} from 'expo-camera';
// import {ExpoWebGLRenderingContext} from 'expo-gl';

import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import {cameraWithTensors} from '@tensorflow/tfjs-react-native';

const inputTensorWidth = 224;
const inputTensorHeight = 224;

const AUTORENDER = true;

// tslint:disable-next-line: variable-name
const TensorCamera = cameraWithTensors(Camera);

export default class RealTime extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      cameraType: Camera.Constants.Type.front,
      cameraRef: null,
    };

    this.handleImageTensorReady = this.handleImageTensorReady.bind(this);
    this.setTextureDims = this.setTextureDims.bind(this);
  }

  componentWillUnmount() {
    if (this.rafID) {
      cancelAnimationFrame(this.rafID);
    }
  }

  async componentDidMount() {
    const {status} = await Permissions.askAsync(Permissions.CAMERA);

    const model = await cocoSsd.load();

    this.setState({
      hasCameraPermission: status === 'granted',
      isLoading: false,
      model,
      prediction: '',
      imageTensor: '',
    });
  }

  async setTextureDims() {
    const pictureSizes = await this.cameraRef.camera.getAvailablePictureSizesAsync(
      '4:3',
    );
    // console.warn(pictureSizes);
  }

  async handleImageTensorReady(images, updatePreview, gl) {
    const loop = async () => {
      if (!AUTORENDER) {
        updatePreview();
      }

      if (this.state.model != null) {
        const imageTensor = images.next().value;

        const prediction = await this.state.model.detect(imageTensor);

        this.setState({
          prediction: JSON.stringify(prediction),
        });

        tf.dispose(imageTensor);
      }

      if (!AUTORENDER) {
        gl.endFrameEXP();
      }
      this.rafID = requestAnimationFrame(loop);
    };

    loop();
  }

  render() {
    const {isLoading} = this.state;

    // Caller will still need to account for orientation/phone rotation changes
    let textureDims = {};

    if (Platform.OS === 'ios') {
      textureDims = {
        height: 1920,
        width: 1080,
      };
    } else {
      // Test values
      // Original 1200x1600
      textureDims = {
        height: 480,
        width: 640,
      };
    }

    return (
      <View style={{width: '100%'}}>
        <View style={styles.sectionContainer}>
          <Button onPress={'this.props.returnToMain'} title="Back" />
          <Text>{this.state.prediction}</Text>
          <Text>{this.state.imageTensor}</Text>
        </View>
        {isLoading ? (
          <View style={[styles.loadingIndicator]}>
            <ActivityIndicator size="large" color="#FF0266" />
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            <TensorCamera
              // Standard Camera props
              ref={(ref) => {
                this.cameraRef = ref;
              }}
              style={styles.camera}
              type={this.state.cameraType}
              zoom={0}
              onCameraReady={this.setTextureDims}
              // tensor related props
              cameraTextureHeight={textureDims.height}
              cameraTextureWidth={textureDims.width}
              resizeHeight={inputTensorHeight}
              resizeWidth={inputTensorWidth}
              resizeDepth={3}
              onReady={this.handleImageTensorReady}
              autorender={AUTORENDER}
            />
            <View style={styles.modelResults} />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loadingIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 200,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  cameraContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  camera: {
    position: 'absolute',
    left: 50,
    top: 100,
    width: 600 / 2,
    height: 800 / 2,
    zIndex: 1,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 0,
  },
  modelResults: {
    position: 'absolute',
    left: 50,
    top: 100,
    width: 600 / 2,
    height: 800 / 2,
    zIndex: 20,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 0,
  },
});
