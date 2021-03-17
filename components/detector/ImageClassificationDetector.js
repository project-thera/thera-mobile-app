import React from 'react';
import {View, StyleSheet} from 'react-native';

import {Camera} from 'expo-camera';

import * as tf from '@tensorflow/tfjs';
import {cameraWithTensors} from '@tensorflow/tfjs-react-native';

import {cropAndResizeSquareForDetector} from '../utils/cropAndResize';
import DetectorTimerConfidence from './DetectorTimerConfidence';

const inputTensorWidth = 180; // 180 144 120
const inputTensorHeight = 320; // 320 256 214

const RATIO = '16:9';

const textureDims = {
  height: 720,
  width: 1280,
};

const AUTORENDER = true;

// tslint:disable-next-line: variable-name
const TensorCamera = cameraWithTensors(Camera);
const CAMERA_TYPE = Camera.Constants.Type.front;

export default class ImageClassificationDetector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active: false,
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

  _handleImageTensorReady = async (images, updatePreview, gl) => {
    const loop = async () => {
      if (this.state.active) {
        updatePreview();
        gl.endFrameEXP();

        const imageTensor = images.next().value;

        const that = this;

        this.props.faceDetector
          .estimateFaces(
            imageTensor,
            false, // returnTensors
            false, // flip horizontal
            false, // annotateBoxes
          )
          .then(async function (faces) {
            if (faces.length > 0) {
              updatePreview();
              gl.endFrameEXP();

              const cropped = cropAndResizeSquareForDetector(
                imageTensor,
                inputTensorWidth,
                inputTensorHeight,
                faces[0].topLeft,
                faces[0].bottomRight,
              );

              that.props.mobilenetDetector
                .classify(cropped)
                .then(function (prediction) {
                  updatePreview();
                  gl.endFrameEXP();

                  // that.detectorTimerConfidence.update(
                  //   prediction[0].className === that.props.currentStep.label,
                  // );

                  that.detectorTimerConfidence.update(true);
                });

              tf.dispose(imageTensor);
            } else {
              tf.dispose(imageTensor);
            }
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
