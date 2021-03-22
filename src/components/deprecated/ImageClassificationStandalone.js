import React from 'react';
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native';

// import * as FaceDetector from 'expo-face-detector';
import {activateKeepAwake} from 'expo-keep-awake';

import * as Permissions from 'expo-permissions';
import {Camera} from 'expo-camera';
// import {ExpoWebGLRenderingContext} from 'expo-gl';

import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import {
  cameraWithTensors,
  bundleResourceIO,
} from '@tensorflow/tfjs-react-native';

import * as mobilenet from '../utils/Mobilenet';
import {cropFaceRotateAndResize} from '../utils/cropAndResize';
import encodeJpeg from '../utils/encodeJpeg';

const modelJson = require('../../models/model.json');
const modelWeights = [
  require('../models/group1-shard1of1.bin'),
  //  require('../models/group1-shard2of2.bin'),
];

const inputTensorWidth = 180; // 180 144 120
const inputTensorHeight = 320; // 320 256 214

const AUTORENDER = true;
const MIN_BRIGHTNESS = 110;

// tslint:disable-next-line: variable-name
const TensorCamera = cameraWithTensors(Camera);

export default class ImageClassificationStandalone extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      cameraType: Camera.Constants.Type.front,
      cameraRef: null,
    };

    this.faceDetectionCount = 0;
    this.processing = false;

    this.handleImageTensorReady = this.handleImageTensorReady.bind(this);
    this.setTextureDims = this.setTextureDims.bind(this);
    this.handleFacesDetected = this.handleFacesDetected.bind(this);
  }

  componentWillUnmount() {
    if (this.rafID) {
      cancelAnimationFrame(this.rafID);
    }
  }

  async componentDidMount() {
    activateKeepAwake();
    //const inputImage = webcam.capture();

    const {status} = await Permissions.askAsync(Permissions.CAMERA);

    const [faceDetector, mobilenetDetector] = await Promise.all([
      blazeface.load({
        maxFaces: 1,
        inputWidth: 128,
        inputHeight: 128,
        iouThreshold: 0.3,
        scoreThreshold: 0.75,
      }),
      mobilenet.load({
        modelUrl: await bundleResourceIO(modelJson, modelWeights),
        version: 2.0,
        alpha: 1.0,
        inputRange: [0, 1],
      }),
    ]);

    this.setState({
      hasCameraPermission: status === 'granted',
      isLoading: false,
      faceDetector,
      mobilenetDetector,
      encodedData: '',
      message: '',
    });
  }

  async setTextureDims() {
    //console.warn(Object.getOwnPropertyNames(this.cameraRef.camera));
    const pictureSizes = await this.cameraRef.camera.getAvailablePictureSizesAsync(
      '4:3',
    );
    // console.warn(pictureSizes);
  }

  handleFacesDetected(faces) {
    console.log(faces[0]);
  }

  detectFaces = (imageTensor) => {
    return this.state.faceDetector.estimateFaces(
      imageTensor,
      false, // returnTensors
      false, // flip horizontal
      true, // annotateBoxes
    );
  };

  classify = (cropped) => {
    return this.state.mobilenetDetector.classify(cropped);
  };

  async handleImageTensorReady(images, updatePreview, gl) {
    //console.log(gl);
    const loop = async () => {
      updatePreview();
      gl.endFrameEXP();

      if (
        this.state.faceDetector != null &&
        this.state.mobilenetDetector != null
      ) {
        const imageTensor = images.next().value;

        let detectionTime = performance.now();

        // const SKIP_FACES = 2; // TODO move
        // if (this.faceDetectionCount > SKIP_FACES) {
        this.detectFaces(imageTensor).then(async (faces) => {
          if (faces.length > 0) {
            updatePreview();
            gl.endFrameEXP();

            // console.log(
            //   'Detection took ' +
            //     (performance.now() - detectionTime) +
            //     ' milliseconds.',
            // );
            detectionTime = performance.now();

            const cropped = cropFaceRotateAndResize(imageTensor, faces[0]);

            const brightness =
              cropped.sum().dataSync() /
              (cropped.shape[0] * cropped.shape[1] * 3);

            if (brightness > MIN_BRIGHTNESS) {
              updatePreview();
              gl.endFrameEXP();

              this.classify(cropped).then((prediction) => {
                updatePreview();
                gl.endFrameEXP();

                this.setState({
                  message: 'Detecting',
                  prediction: JSON.stringify(prediction),
                });

                console.log(
                  'Prediction took ' +
                    (performance.now() - detectionTime) +
                    ' milliseconds.',
                );
              });
            } else {
              this.setState({
                message: 'Not enough light',
                prediction: '',
              });
            }
          }

          tf.dispose(imageTensor);
        });

        updatePreview();
        gl.endFrameEXP();
      }

      updatePreview();
      gl.endFrameEXP();

      this.rafID = requestAnimationFrame(loop);
    };

    loop();
  }

  render() {
    const {isLoading} = this.state;

    const ratio = '16:9';

    const textureDims = {
      height: 720,
      width: 1280,
    };

    return (
      <View style={{width: '100%'}}>
        <View style={styles.sectionContainer}>
          <Button onPress={'this.props.returnToMain'} title="Back" />
          <Text>{this.state.message}</Text>
          <Text>{this.state.prediction}</Text>
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
              ratio={ratio}
              // onCameraReady={this.setTextureDims}
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
    left: 0,
    top: 0,
    zIndex: 20,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 0,
  },
});
