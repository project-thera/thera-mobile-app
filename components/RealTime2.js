import React from 'react';
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native';

import * as Permissions from 'expo-permissions';
import {Camera} from 'expo-camera';
// import {ExpoWebGLRenderingContext} from 'expo-gl';

import * as tf from '@tensorflow/tfjs';
// import * as mobilenet from '@tensorflow-models/mobilenet';
import * as mobilenet from './utils/Mobilenet';

import encodeJpeg from './utils/encodeJpeg';

import {
  cameraWithTensors,
  bundleResourceIO,
} from '@tensorflow/tfjs-react-native';

const inputTensorWidth = 160;
const inputTensorHeight = 160;

// const y1 = 0.3,
//   x1 = 0.05,
//   y2 = 0.7,
//   x2 = 0.7;

const y1 = 0.2,
  x1 = 0.25,
  y2 = 0.8,
  x2 = 0.85;

const cropHeight = Math.floor((y2 - y1) * (inputTensorHeight - 1));
const cropWidth = Math.floor((x2 - x1) * (inputTensorWidth - 1));

console.log(cropHeight, cropWidth);

// ["320x240", "640x480", "800x600", "1280x960", "1440x1080", "2048x1536", "2592x1944"]
const textureDims = {
  height: 1080,
  width: 1440,
};

const AUTORENDER = true;

const modelJson = require('../models/model.json');
const modelWeights = [
  require('../models/group1-shard1of1.bin'),
  // require('../models/group1-shard2of3.bin'),
  // require('../models/group1-shard3of3.bin'),
];

let t1, t0;

// tslint:disable-next-line: variable-name
const TensorCamera = cameraWithTensors(Camera);

export default class RealTime extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      cameraType: Camera.Constants.Type.front,
      cameraRef: null,
      encodedData: '',
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

    const model = await mobilenet.load({
      modelUrl: await bundleResourceIO(modelJson, modelWeights),
      version: 2.0,
      alpha: 1.0,
      inputRange: [0, 1],
    });
    // await model.classify(tf.zeros([1, inputTensorWidth, inputTensorHeight, 3]));

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
    // ["320x240", "640x480", "800x600", "1280x960", "1440x1080", "2048x1536", "2592x1944"]
    //console.log(pictureSizes);
  }

  async handleImageTensorReady(images, updatePreview, gl) {
    const loop = async () => {
      if (!AUTORENDER) {
        updatePreview();
      }

      console.log(
        'Call to doSomething took ' +
          (t0 - performance.now()) +
          ' milliseconds.',
      );
      t0 = performance.now();

      if (this.state.model != null) {
        const imageTensor = images.next().value;

        const cropTime = performance.now();

        // const converted = tf.image
        //   .cropAndResize(
        //     imageTensor.reshape([1, inputTensorWidth, inputTensorHeight, 3]),
        //     [[y1, x1, y2, x2]],
        //     [0],
        //     [cropHeight, cropWidth],
        //   )
        //   .reshape([cropHeight, cropWidth, 3]);

        // console.log(
        //   'Detection took ' + (cropTime - performance.now()) + ' milliseconds.',
        // );
        this.setState({
          encodedData: await encodeJpeg(imageTensor),
        });

        const detectionTime = performance.now();
        const prediction = await this.state.model.classify(imageTensor);
        // console.log(
        //   'Detection took ' +
        //     (detectionTime - performance.now()) +
        //     ' milliseconds.',
        // );

        this.setState({
          prediction: JSON.stringify(prediction),
        });

        tf.dispose(imageTensor);
        //   //tf.dispose(converted);
        //   let t1 = performance.now();
        //   console.log('Call to doSomething took ' + (t1 - t0) + ' milliseconds.');
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
            <View style={styles.modelResults}>
              <Image
                style={styles.camera}
                source={{
                  uri: `data:image/jpeg;base64,${this.state.encodedData}`,
                }}
              />
            </View>
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
