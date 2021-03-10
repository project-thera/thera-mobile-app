import React from 'react';
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  View,
  Platform,
  Text,
  Image,
} from 'react-native';
import Svg, {Circle, Rect, G} from 'react-native-svg';

import * as Permissions from 'expo-permissions';
import {Camera} from 'expo-camera';
// import {ExpoWebGLRenderingContext} from 'expo-gl';

import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import {
  cameraWithTensors,
  bundleResourceIO,
} from '@tensorflow/tfjs-react-native';

import * as mobilenet from './utils/Mobilenet';
import {cropAndResize2} from './utils/cropAndResize';
import encodeJpeg from './utils/encodeJpeg';

const modelJson = require('../models/model.json');
const modelWeights = [require('../models/group1-shard1of1.bin')];

const inputTensorWidth = 224;
const inputTensorHeight = 224;

const AUTORENDER = false;

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

    this.faceDetectionCount = 0;
    this.processing = false;

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
    });
  }

  async loadBlazefaceModel() {
    const model = await blazeface.load();

    return model;
  }

  async setTextureDims() {
    //console.warn(Object.getOwnPropertyNames(this.cameraRef.camera));
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

      if (
        this.state.faceDetector != null &&
        this.state.mobilenetDetector != null
      ) {
        const imageTensor = images.next().value;

        // let detectionTime = performance.now();

        const that = this;
        // const SKIP_FACES = 2; // TODO move
        // if (this.faceDetectionCount > SKIP_FACES) {
        this.state.faceDetector
          .estimateFaces(
            imageTensor,
            false, // returnTensors
            false, // flip horizontal
            false, // annotateBoxes
          )
          .then(function (faces) {
            if (faces.length > 0) {
              updatePreview();
              gl.endFrameEXP();

              // detectionTime = performance.now();

              const cropped = cropAndResize2(
                imageTensor,
                inputTensorWidth,
                inputTensorHeight,
                faces[0].topLeft,
                faces[0].bottomRight,
              );

              that.state.mobilenetDetector
                .classify(cropped)
                .then(function (prediction) {
                  that.setState({
                    prediction: JSON.stringify(prediction),
                  });
                });

              tf.dispose(imageTensor);
            } else {
              tf.dispose(imageTensor);
            }
          });

        updatePreview();
        gl.endFrameEXP();

        // console.log(
        //   'Detection took ' +
        //     (performance.now() - detectionTime) +
        //     ' milliseconds.',
        // );

        // console.log(faces);
      }

      if (!AUTORENDER) {
        gl.endFrameEXP();
      }
      this.rafID = requestAnimationFrame(loop);
    };

    loop();
  }

  renderFaces() {
    const {faces} = this.state;
    if (faces != null) {
      const faceBoxes = faces.map((f, fIndex) => {
        const topLeft = f.topLeft;
        const bottomRight = f.bottomRight;

        const landmarks = f.landmarks.map((l, lIndex) => {
          return (
            <Circle
              key={`landmark_${fIndex}_${lIndex}`}
              cx={l[0]}
              cy={l[1]}
              r="2"
              strokeWidth="0"
              fill="blue"
            />
          );
        });

        return (
          <G key={`facebox_${fIndex}`}>
            <Rect
              x={topLeft[0]}
              y={topLeft[1]}
              fill={'red'}
              fillOpacity={0.2}
              width={bottomRight[0] - topLeft[0]}
              height={bottomRight[1] - topLeft[1]}
            />
            {landmarks}
          </G>
        );
      });

      const flipHorizontal = Platform.OS === 'ios' ? 1 : -1;
      return (
        <Svg
          height="100%"
          width="100%"
          viewBox={`0 0 ${inputTensorWidth} ${inputTensorHeight}`}
          scaleX={flipHorizontal}>
          {faceBoxes}
        </Svg>
      );
    } else {
      return null;
    }
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
      // Original 800x1200
      textureDims = {
        height: 1200,
        width: 1600,
      };
    }

    return (
      <View style={{width: '100%'}}>
        <View style={styles.sectionContainer}>
          <Button onPress={'this.props.returnToMain'} title="Back" />
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
            {/* <View style={styles.modelResults}>{this.renderFaces()}</View> */}
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
