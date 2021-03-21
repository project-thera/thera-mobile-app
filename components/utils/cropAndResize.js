import * as tf from '@tensorflow/tfjs';
import {IMAGE_SIZE} from './Mobilenet';

import {
  POINT_X,
  POINT_Y,
  BLACK,
  RIGHT_EYE,
  LEFT_EYE,
  NOSE,
  MOUTH,
  RIGHT_EAR,
  LEFT_EAR,
} from './constants';

/**
 * Crops image between topLeft and bottomRight and preserve aspect ratio.
 *
 * @deprecated
 */
export function cropAndResizePreserveRatio(
  imageTensor,
  inputTensorWidth,
  inputTensorHeight,
  topLeft,
  bottomRight,
  displacementTop = 0.0029,
  displacementBottom = 0.0025,
) {
  const boxHeight = ((bottomRight[1] - topLeft[1]) * 100) / inputTensorHeight;

  const y1 = topLeft[1] / inputTensorHeight + boxHeight * displacementTop;

  const y2 =
    bottomRight[1] / inputTensorHeight + boxHeight * displacementBottom;

  const x1 = topLeft[0] / inputTensorWidth;
  const x2 = bottomRight[0] / inputTensorWidth;

  const cropHeight = Math.floor((y2 - y1) * (inputTensorHeight - 1));
  const cropWidth = Math.floor((x2 - x1) * (inputTensorWidth - 1));

  console.log(cropHeight, cropWidth);

  return tf.image
    .cropAndResize(
      imageTensor.reshape([1, inputTensorHeight, inputTensorWidth, 3]),
      [[y1, x1, y2, x2]],
      [0],
      [cropHeight, cropWidth],
    )
    .reshape([cropHeight, cropWidth, 3]);
}

/**
 * Transform image to detector size declared in Mobilenet, dont preserve aspect ratio.
 * Doing this avoids to resize the image again in the detector.
 *
 * @deprecated
 */
export function cropAndResizeForDetector(
  imageTensor,
  inputTensorWidth,
  inputTensorHeight,
  topLeft,
  bottomRight,
  displacementTop = 0.002,
  displacementBottom = 0.001,
) {
  const boxHeight = ((bottomRight[1] - topLeft[1]) * 100) / inputTensorHeight;

  const y1 = topLeft[1] / inputTensorHeight + boxHeight * displacementTop;

  const y2 =
    bottomRight[1] / inputTensorHeight + boxHeight * displacementBottom;

  const x1 = topLeft[0] / inputTensorWidth;
  const x2 = bottomRight[0] / inputTensorWidth;

  //const cropHeight = Math.floor((y2 - y1) * (inputTensorHeight - 1));
  //const cropWidth = Math.floor((x2 - x1) * (inputTensorWidth - 1));

  // console.log(cropHeight, cropWidth);

  return tf.image
    .cropAndResize(
      imageTensor.reshape([1, inputTensorHeight, inputTensorWidth, 3]),
      [[y1, x1, y2, x2]],
      [0],
      [IMAGE_SIZE, IMAGE_SIZE],
    )
    .reshape([IMAGE_SIZE, IMAGE_SIZE, 3]);
}

/**
 * Transform image to detector size declared in Mobilenet preserves aspect ratio.
 * Doing this avoids to resize the image again in the detector.
 */
export function cropAndResizeSquareForDetector(
  imageTensor,
  inputTensorWidth,
  inputTensorHeight,
  topLeft,
  bottomRight,
  growRatio = 0.1,
  displacement = 0.0028,
) {
  const boxWidthRaw = (bottomRight[0] - topLeft[0]) * (1 + growRatio * 2);
  //const boxHeight = ((bottomRight[1] - topLeft[1]) * 100) / inputTensorHeight;
  const boxHeight = (boxWidthRaw * 100) / inputTensorHeight;

  const y1 = topLeft[1] / inputTensorHeight + boxHeight * displacement;

  const y2 =
    (topLeft[1] + boxWidthRaw) / inputTensorHeight + boxHeight * displacement;

  const x1 = (topLeft[0] - topLeft[0] * growRatio) / inputTensorWidth;
  const x2 = (bottomRight[0] + bottomRight[0] * growRatio) / inputTensorWidth;

  return tf.image
    .cropAndResize(
      imageTensor.reshape([1, inputTensorHeight, inputTensorWidth, 3]),
      [[y1, x1, y2, x2]],
      [0],
      [IMAGE_SIZE, IMAGE_SIZE],
    )
    .reshape([IMAGE_SIZE, IMAGE_SIZE, 3]);
}

/**
 * Transform and rotate the image to detector size declared in Mobilenet preserves aspect ratio.
 * Doing this avoids to resize the image again in the detector.
 */
export function cropMouthRotateAndResize(
  imageTensor,
  face,
  growRatio = 1.4,
  displacement = 0.001,
) {
  const {topLeft, bottomRight} = face;
  const inputTensorHeight = imageTensor.shape[0];
  const inputTensorWidth = imageTensor.shape[1];
  const channelNumbers = imageTensor.shape[2];

  const rightEye = face.landmarks[RIGHT_EYE];
  const leftEye = face.landmarks[LEFT_EYE];
  const eyesCenter = [
    (rightEye[POINT_X] + leftEye[POINT_X]) / 2,
    (rightEye[POINT_Y] + leftEye[POINT_Y]) / 2,
  ];
  //const nose = face.landmarks[NOSE];
  const mouth = face.landmarks[MOUTH];

  // The mouth and the center of the eyes are more precise you can check:
  // https://storage.googleapis.com/tfjs-models/demos/blazeface/index.html for experiment
  // Math.atan2(nose[POINT_Y] - mouth[POINT_Y], nose[POINT_X] - mouth[POINT_X])
  const rotation =
    Math.atan2(
      eyesCenter[POINT_Y] - mouth[POINT_Y],
      eyesCenter[POINT_X] - mouth[POINT_X],
    ) +
    0.5 * Math.PI;

  // Center mouth
  const center = [
    mouth[POINT_X] / inputTensorWidth,
    mouth[POINT_Y] / inputTensorHeight,
  ];

  const rotated = tf.image.rotateWithOffset(
    tf.cast(imageTensor.reshape([1, ...imageTensor.shape]), 'float32'),
    rotation,
    BLACK,
    center,
  );

  const boxWidthRaw = (bottomRight[POINT_X] - topLeft[POINT_X]) * growRatio;
  const boxHeightRaw = boxWidthRaw;

  const y1 =
    (mouth[POINT_Y] - boxWidthRaw * 0.5 + boxHeightRaw * displacement) /
    inputTensorHeight;
  const y2 =
    (mouth[POINT_Y] + boxWidthRaw * 0.5 + boxHeightRaw * displacement) /
    inputTensorHeight;

  const x1 = (mouth[POINT_X] - boxWidthRaw * 0.5) / inputTensorWidth;
  const x2 = (mouth[POINT_X] + boxWidthRaw * 0.5) / inputTensorWidth;

  return tf.image
    .cropAndResize(rotated, [[y1, x1, y2, x2]], [0], [IMAGE_SIZE, IMAGE_SIZE])
    .reshape([IMAGE_SIZE, IMAGE_SIZE, channelNumbers]);
}

export function cropFaceRotateAndResize(
  imageTensor,
  face,
  growRatio = 1.6,
  displacement = 0.02,
) {
  const {topLeft, bottomRight} = face;
  const inputTensorHeight = imageTensor.shape[0];
  const inputTensorWidth = imageTensor.shape[1];
  const channelNumbers = imageTensor.shape[2];

  const rightEye = face.landmarks[RIGHT_EYE];
  const leftEye = face.landmarks[LEFT_EYE];
  const eyesCenter = [
    (rightEye[POINT_X] + leftEye[POINT_X]) / 2,
    (rightEye[POINT_Y] + leftEye[POINT_Y]) / 2,
  ];
  // const nose = face.landmarks[NOSE];
  const mouth = face.landmarks[MOUTH];

  // The mouth and the center of the eyes are more precise you can check:
  // https://storage.googleapis.com/tfjs-models/demos/blazeface/index.html for experiment
  // Math.atan2(nose[POINT_Y] - mouth[POINT_Y], nose[POINT_X] - mouth[POINT_X])
  const rotation =
    Math.atan2(
      eyesCenter[POINT_Y] - mouth[POINT_Y],
      eyesCenter[POINT_X] - mouth[POINT_X],
    ) +
    0.5 * Math.PI;

  const centerPoint = [
    (mouth[POINT_X] + eyesCenter[POINT_X]) * 0.5,
    (mouth[POINT_Y] + eyesCenter[POINT_Y]) * 0.5,
  ];

  const center = [
    centerPoint[POINT_X] / inputTensorWidth,
    centerPoint[POINT_Y] / inputTensorHeight,
  ];

  const rotated = tf.image.rotateWithOffset(
    tf.cast(imageTensor.reshape([1, ...imageTensor.shape]), 'float32'),
    rotation,
    BLACK,
    center,
  );

  const boxWidthRaw = (bottomRight[POINT_X] - topLeft[POINT_X]) * growRatio;
  const boxHeightRaw = boxWidthRaw;

  const y1 =
    (centerPoint[POINT_Y] - boxWidthRaw * 0.5 + boxHeightRaw * displacement) /
    inputTensorHeight;
  const y2 =
    (centerPoint[POINT_Y] + boxWidthRaw * 0.5 + boxHeightRaw * displacement) /
    inputTensorHeight;

  const x1 = (centerPoint[POINT_X] - boxWidthRaw * 0.5) / inputTensorWidth;
  const x2 = (centerPoint[POINT_X] + boxWidthRaw * 0.5) / inputTensorWidth;

  return tf.image
    .cropAndResize(rotated, [[y1, x1, y2, x2]], [0], [IMAGE_SIZE, IMAGE_SIZE])
    .reshape([IMAGE_SIZE, IMAGE_SIZE, channelNumbers]);
}
