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
import * as posenet from '@tensorflow-models/posenet';
import {cameraWithTensors} from '@tensorflow/tfjs-react-native';

import {cropAndResize} from '../utils/cropAndResize';
import encodeJpeg from '../utils/encodeJpeg';

const inputTensorWidth = 160;
const inputTensorHeight = 160;

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

    // const posenetModel = await posenet.load();
    const posenetModel = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: {width: inputTensorWidth, height: inputTensorHeight},
      multiplier: 0.5,
      quantBytes: 1,
    });

    this.setState({
      hasCameraPermission: status === 'granted',
      isLoading: false,
      model: posenetModel,
      prediction: '',
      imageTensor: '',
      encodedData: '',
    });
  }

  async setTextureDims() {
    //console.warn(Object.getOwnPropertyNames(this.cameraRef.camera));
    const pictureSizes = await this.cameraRef.camera.getAvailablePictureSizesAsync(
      '4:3',
    );
    //console.warn(pictureSizes);
  }

  async handleImageTensorReady(images, updatePreview, gl) {
    const loop = async () => {
      if (!AUTORENDER) {
        updatePreview();
      }

      if (this.state.model != null) {
        const imageTensor = images.next().value;

        const detectionTime = performance.now();

        const flipHorizontal = true; // Platform.OS === 'ios' ? false : true

        const pose = await this.state.model.estimateSinglePose(imageTensor, {
          flipHorizontal,
        });

        if (
          pose.keypoints &&
          pose.keypoints[3].score > 0.0007 &&
          pose.keypoints[4].score > 0.0007
        ) {
          // console.log('DETECTADO');

          if (
            pose.keypoints[3].position.x > 0 &&
            pose.keypoints[4].position.x
          ) {
            const cropped = cropAndResize(
              imageTensor,
              inputTensorWidth,
              inputTensorHeight,
              0 / inputTensorHeight, // Calculate from nose
              pose.keypoints[3].position.x / inputTensorWidth, // leftEar
              100 / inputTensorHeight, // Calculate from nose
              pose.keypoints[4].position.x / inputTensorWidth,
            );

            this.setState({
              encodedData: await encodeJpeg(cropped),
            });
          }
          // this.setState({
          //   prediction: JSON.stringify(pose),
          // });
        }

        console.log(
          'Detection took ' +
            (performance.now() - detectionTime) +
            ' milliseconds.',
        );

        tf.dispose(imageTensor);
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
