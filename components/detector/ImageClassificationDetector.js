import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

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

const inputTensorWidth = 180; // 180 144 120
const inputTensorHeight = 320; // 320 256 214

const RATIO = '16:9';

const textureDims = {
  height: 720,
  width: 1280,
};

const AUTORENDER = true;
// const MAX_INCLINATION = 2.8; // in radians
const MIN_BRIGHTNESS = 110;
const DETECTION_THRESHOLD = 0.09;
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
    this.detectorTimerConfidence.update(
      predictions[0].className === this.props.currentStep.label &&
        predictions[0].probability > DETECTION_THRESHOLD,
    );
  };

  onProgress = (percentage) => {
    this.props.onProgress(percentage);
    console.log(`PROGRESS ${percentage}`); // TODO show something in the ui
  };

  onStoppedDetection = () => {
    this.props.onStoppedDetection();
    console.log('NOT DETECTING'); // TODO stop showing something in the ui
  };

  onCompleted = () => {
    this.props.onStepCompleted();
    console.log('COMPLETADO'); // TODO stop showing something in the ui
  };

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

  hasEnoughBrightness = (cropped) => {
    // value between 0 and 255
    const enough =
      (cropped.sum().dataSync() / cropped.shape[SHAPE_HEIGHT]) *
        cropped.shape[SHAPE_WIDTH] *
        cropped.shape[SHAPE_CHANNELS] >
      MIN_BRIGHTNESS;

    if (!enough) {
      this.setState({
        message: 'No hay suficiente luz',
      });
    }

    return true; //enough;
  };

  detectFaces = (imageTensor) => {
    return this.props.faceDetector.estimateFaces(
      imageTensor,
      false, // returnTensors
      false, // flip horizontal
      true, // annotateBoxes
    );
  };

  classify = (cropped) => {
    return this.props.mobilenetDetector.classify(cropped);
  };

  _handleImageTensorReady = async (images, updatePreview, gl) => {
    const loop = async () => {
      if (this.state.active) {
        updatePreview();
        gl.endFrameEXP();

        const imageTensor = images.next().value;

        this.detectFaces(imageTensor).then(async (faces) => {
          if (faces.length > 0 && this.isFrontFace(faces[0])) {
            updatePreview();
            gl.endFrameEXP();

            const cropped = cropFaceRotateAndResize(imageTensor, faces[0]);

            if (this.hasEnoughBrightness(cropped)) {
              this.classify(cropped).then((prediction) => {
                updatePreview();
                gl.endFrameEXP();

                this.detect(prediction);
              });
            }
          }

          tf.dispose(imageTensor);
        });

        updatePreview();
        gl.endFrameEXP();

        this.rafID = requestAnimationFrame(loop);
      }
    };

    loop();
  };

  render() {
    return (
      <View>
        <Text>{this.props.currentStep.label}</Text>
        <Text>{this.state.message}</Text>
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
            onReady={this._handleImageTensorReady}
            autorender={AUTORENDER}
          />
        </View>
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
