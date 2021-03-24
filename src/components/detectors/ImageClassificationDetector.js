import React from 'react';
import {View, StyleSheet} from 'react-native';

import {Text} from '@ui-kitten/components';

import {Camera} from 'expo-camera';

import * as tf from '@tensorflow/tfjs';
import {cameraWithTensors} from '@tensorflow/tfjs-react-native';

import {cropFaceRotateAndResize} from '../utils/cropAndResize';
import DetectorTimerConfidence from './DetectorTimerConfidence';

import {
  POINT_X,
  POINT_Y,
  SHAPE_HEIGHT,
  SHAPE_WIDTH,
  SHAPE_CHANNELS,
  RIGHT_EYE,
  LEFT_EYE,
  MOUTH,
  NOSE,
} from '../utils/constants';

const inputTensorWidth = 120; // 180; // 180 144 120
const inputTensorHeight = 214; // 320; // 320 256 214

const RATIO = '16:9';

const textureDims = {
  height: 720,
  width: 1280,
};

const AUTORENDER = true;
const MIN_BRIGHTNESS = 110;
const DETECTION_THRESHOLD = 0.11;
const NOSE_DISTANCE_THRESHOLD = 0.1;

// tslint:disable-next-line: variable-name
const TensorCamera = cameraWithTensors(Camera);
const CAMERA_TYPE = Camera.Constants.Type.front;

export default class ImageClassificationDetector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active: false,
      message: '',
    };

    this.time = performance.now();
  }

  componentWillUnmount() {
    if (this.rafID) {
      cancelAnimationFrame(this.rafID);
    }
  }

  setDetectorTimerConfidence = () => {
    this.detectorTimerConfidence = new DetectorTimerConfidence({
      params: this.props.currentStep,
      onProgress: this.onProgress,
      onStoppedDetection: this.onStoppedDetection,
      onCompleted: this.onCompleted,
    });
  };

  componentDidMount() {
    this.setDetectorTimerConfidence();
  }

  // Needed because access to props to set instance variable
  componentDidUpdate(prevProps) {
    if (prevProps.currentStep !== this.props.currentStep) {
      this.setDetectorTimerConfidence();
    }
  }

  start = () => {
    this.setState({
      active: true,
    });
  };

  resume = () => {
    this.setState({
      active: true,
    });
  };

  pause = () => {
    this.setState({
      active: false,
    });
  };

  stop = () => {
    this.setState({
      active: false,
    });
  };

  /**
   * @param {Object[]} predictions - The raw prediction of the detector.
   * @param {string} predictions[].className - The label of the class detected.
   * @param {float} predictions[].probability - The probability of the class.
   */
  detect = (predictions) => {
    this.setState({
      message: JSON.stringify(predictions),
    });

    this.detectorTimerConfidence.update(
      predictions[0].className === this.props.currentStep.label &&
        predictions[0].probability > DETECTION_THRESHOLD,
    );
  };

  onProgress = (percentage) => {
    this.props.onProgress(percentage);
  };

  onStoppedDetection = () => {
    this.props.onStoppedDetection();
  };

  onCompleted = () => {
    this.props.onStepCompleted();
  };

  /**
   * @param {Array} p1 Point 1 of the line
   * @param {Array} p2 Point 2 of the line
   * @param {Array} p0 Point to measure the distance between the rect
   *
   * @returns {number} Minimum distance between p0 and the line defined by p1 and p2
   */
  distance(p1, p2, p0) {
    return (
      Math.abs(
        (p2[POINT_X] - p1[POINT_X]) * (p1[POINT_Y] - p0[POINT_Y]) -
          (p1[POINT_X] - p0[POINT_X]) * (p2[POINT_Y] - p1[POINT_Y]),
      ) /
      Math.sqrt(
        (p2[POINT_X] - p1[POINT_X]) ** 2 + (p2[POINT_Y] - p1[POINT_Y]) ** 2,
      )
    );
  }

  isFrontFace = (face) => {
    const rightEye = face.landmarks[RIGHT_EYE];
    const leftEye = face.landmarks[LEFT_EYE];
    const mouth = face.landmarks[MOUTH];
    const nose = face.landmarks[NOSE];
    const {topLeft, bottomRight} = face;

    const eyesCenter = [
      (rightEye[POINT_X] + leftEye[POINT_X]) * 0.5,
      (rightEye[POINT_Y] + leftEye[POINT_Y]) * 0.5,
    ];

    const facingFront =
      this.distance(eyesCenter, mouth, nose) /
        (bottomRight[POINT_X] - topLeft[POINT_X]) <
      NOSE_DISTANCE_THRESHOLD;

    if (!facingFront) {
      this.setState({
        message: 'La cara debe de estar de frente a la camara',
      });
    }

    return facingFront;
  };

  ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  hasEnoughBrightness = (cropped) => {
    // value between 0 and 255
    const enough =
      cropped.sum().dataSync() /
        (cropped.shape[SHAPE_HEIGHT] *
          cropped.shape[SHAPE_WIDTH] *
          cropped.shape[SHAPE_CHANNELS]) >
      MIN_BRIGHTNESS;

    if (!enough) {
      this.setState({
        message: 'No hay suficiente luz',
      });
    }

    return enough;
  };

  detectFaces = (imageTensor) => {
    return this.props.faceDetector.estimateFaces(
      imageTensor,
      false, // return tensors
      false, // flip horizontal
      true, // annotate boxes
    );
  };

  classify = (cropped) => {
    return this.props.mobilenetDetector.classify(cropped);
  };

  countTime = (label = 'Tiempo') => {
    console.log(`${label}: ${performance.now() - this.time}`);

    this.time = performance.now();
  };

  handleImageTensorReady = async (images, updatePreview, gl) => {
    const loop = async () => {
      updatePreview();
      gl.endFrameEXP();

      if (this.state.active) {
        const imageTensor = images.next().value;

        this.countTime('Detect face 0');

        this.detectFaces(imageTensor).then(async (faces) => {
          if (faces.length > 0 && this.isFrontFace(faces[0])) {
            updatePreview();
            gl.endFrameEXP();

            this.countTime('Detect face 1');

            const cropped = cropFaceRotateAndResize(imageTensor, faces[0]);

            if (this.hasEnoughBrightness(cropped)) {
              this.classify(cropped).then((prediction) => {
                updatePreview();
                gl.endFrameEXP();

                this.countTime('Predict');

                this.detect(prediction);
              });
            }
          }

          tf.dispose(imageTensor);
        });

        updatePreview();
        gl.endFrameEXP();
      }

      this.rafID = requestAnimationFrame(loop);
    };

    loop();
  };

  detectorsLoaded = () => {
    return this.props.faceDetector && this.props.mobilenetDetector;
  };

  render() {
    if (this.detectorsLoaded()) {
      return (
        <>
          <Text category="h3" style={styles.centerText}>
            {this.ucfirst(this.props.currentStep.label)}
          </Text>
          <Text status="danger" style={styles.centerText}>
            {this.state.message}
          </Text>
          <View style={styles.cameraContainer}>
            <TensorCamera
              type={CAMERA_TYPE}
              zoom={0}
              ratio={RATIO}
              style={styles.camera}
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
          </View>
        </>
      );
    } else {
      return <Text>Cargando</Text>;
    }
  }
}

const styles = StyleSheet.create({
  loadingIndicator: {
    // position: 'absolute',
    // top: 20,
    // right: 20,
    // zIndex: 200,
  },
  centerText: {
    textAlign: 'center',
  },
  cameraContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  camera: {
    position: 'relative',
    width: '100%', // textureDims.height / 2.5
    height: textureDims.width / 2.5,
    zIndex: 1,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 0,
  },
});
