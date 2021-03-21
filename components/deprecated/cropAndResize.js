import * as tf from '@tensorflow/tfjs';
import {IMAGE_SIZE} from './Mobilenet';

/*
  imageTensor,
  inputTensorWidth,
  inputTensorHeight,
  topLeft[1] / inputTensorHeight + 0.08,
  topLeft[0] / inputTensorWidth,
  bottomRight[1] / inputTensorHeight + 0.07,
  bottomRight[0] / inputTensorWidth,
*/
export function cropAndResize(
  imageTensor,
  inputTensorWidth,
  inputTensorHeight,
  y1,
  x1,
  y2,
  x2,
) {
  const cropHeight = Math.floor((y2 - y1) * (inputTensorHeight - 1));
  const cropWidth = Math.floor((x2 - x1) * (inputTensorWidth - 1));

  return tf.image
    .cropAndResize(
      imageTensor.reshape([1, inputTensorHeight, inputTensorWidth, 3]),
      [[y1, x1, y2, x2]],
      [0],
      [cropHeight, cropWidth],
    )
    .reshape([cropHeight, cropWidth, 3]);
}

// Preserve crop size
export function cropAndResize2(
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

// Transform to detector size avoiding resize in Mobilenet file
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

  const cropHeight = Math.floor((y2 - y1) * (inputTensorHeight - 1));
  const cropWidth = Math.floor((x2 - x1) * (inputTensorWidth - 1));

  console.log(cropHeight, cropWidth);

  return tf.image
    .cropAndResize(
      imageTensor.reshape([1, inputTensorHeight, inputTensorWidth, 3]),
      [[y1, x1, y2, x2]],
      [0],
      [IMAGE_SIZE, IMAGE_SIZE],
    )
    .reshape([IMAGE_SIZE, IMAGE_SIZE, 3]);
}

export function cropAndResizeForDetectorSquare(
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

// const leftEye = face.landmarks[LEFT_EYE];
//const rightEar = face.landmarks[RIGHT_EAR];
//const leftEar = face.landmarks[LEFT_EAR];
// const {topLeft, bottomRight} = face;

// const rightValue =
//   (rightEye[POINT_X] - rightEar[POINT_X]) /
//   (bottomRight[POINT_X] - topLeft[POINT_X]);

// const leftValue =
//   (leftEar[POINT_X] - leftEye[POINT_X]) /
//   (bottomRight[POINT_X] - topLeft[POINT_X]);

// console.log(rightValue, leftValue);

// const facingFront =
//   rightValue > MIN_RIGHT_THRESHOLD &&
//   rightValue < MAX_RIGHT_THRESHOLD &&
//   leftValue > MIN_LEFT_THRESHOLD &&
//   leftValue < MAX_LEFT_THRESHOLD;
