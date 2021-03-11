import React from 'react';
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  View,
  Platform,
  Text,
  Image,
  PixelRatio,
} from 'react-native';
import Svg, {Circle, Rect, G} from 'react-native-svg';

import * as Permissions from 'expo-permissions';
import {Camera} from 'expo-camera';
// import {ExpoWebGLRenderingContext} from 'expo-gl';

import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import {cameraWithTensors} from '@tensorflow/tfjs-react-native';

import encodeJpeg from './utils/encodeJpeg';
import {cropAndResize, cropAndResize2} from './utils/cropAndResize';

// const inputTensorWidth = 4 * 2 * 10;
// const inputTensorHeight = 4 * 3 * 10;

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

    // const blazefaceModel = await blazeface.load({
    //   maxFaces: 1,
    //   inputWidth: 128,
    //   inputHeight: 128,
    //   iouThreshold: 0.3,
    //   scoreThreshold: 0.75,
    // });

    this.setState({
      hasCameraPermission: status === 'granted',
      isLoading: false,
      faceDetector: true,
      encodedData: '',
    });
  }

  async setTextureDims() {
    // const ratios = await this.cameraRef.camera.getSupportedRatiosAsync();
    // for (let ratio of ratios) {
    //   console.log('RATIO');
    //   console.log(ratio);
    //   console.log(
    //     await this.cameraRef.camera.getAvailablePictureSizesAsync(ratio),
    //   );
    // }
  }

  async handleImageTensorReady(images, updatePreview, gl) {
    const loop = async () => {
      if (!AUTORENDER) {
        updatePreview();
      }

      if (true) {
        const imageTensor = images.next().value;
        console.log(imageTensor.shape);
        let detectionTime = performance.now();

        // const faces = await this.state.faceDetector.estimateFaces(
        //   imageTensor,
        //   false, // returnTensors
        //   false, // Flip horizontal
        //   false, // annotateBoxes
        // );

        // console.log(
        //   'Detection took ' +
        //     (performance.now() - detectionTime) +
        //     ' milliseconds.',
        // );

        // console.log(faces);
        // if (faces.length > 0) {
        // const {topLeft, bottomRight} = faces[0];

        // const cropped = cropAndResize2(
        //   imageTensor,
        //   inputTensorWidth,
        //   inputTensorHeight,
        //   topLeft,
        //   bottomRight,
        // );

        this.setState({
          encodedData: await encodeJpeg(imageTensor),
        });
        // }

        // this.setState({faces});
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

    const inputTensorWidth = 180; // 360
    const inputTensorHeight = 320; // 203

    // 2:1
    // ["1280x640", "2592x1296"]
    // 3:2
    // ["720x480"]
    // 4:3
    // ["320x240", "640x480", "800x600", "1280x960", "1440x1080", "2048x1536", "2592x1944"]
    // 11:9
    // ["176x144", "352x288"]
    // 16:9
    // ["320x180", "640x360", "1280x720", "1920x1080", "2592x1458"]

    // 4:3 800x600 w160xh200
    // 16:9 1280x720 w180xh320

    const ratio = '16:9';

    let textureDims = {
      height: 720,
      width: 1280,
    };

    // textureDims = {
    //   height: PixelRatio.getPixelSizeForLayoutSize(textureDims.height),
    //   width: PixelRatio.getPixelSizeForLayoutSize(textureDims.width),
    // };

    console.log(textureDims);

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
              ratio={ratio}
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
    left: 0,
    top: 0,
    zIndex: 20,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 0,
  },
});
