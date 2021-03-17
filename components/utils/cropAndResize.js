import * as tf from '@tensorflow/tfjs';
import {IMAGE_SIZE} from './Mobilenet';

const POINT_X = 0;
const POINT_Y = 1;

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

// function rotatePoint(radians, point) {
//   const sin = Math.sin(radians);
//   const cos = Math.cos(radians);

//   return [
//     point[POINT_X] * cos + point[POINT_Y] * sin,
//     -point[POINT_X] * sin + point[POINT_Y] * cos,
//   ];

//   // return [
//   //   point[POINT_X] * cos - point[POINT_Y] * sin,
//   //   point[POINT_X] * sin + point[POINT_Y] * cos,
//   // ];

//   // return {x: x * cos - y * sin, y: x * sin + y * cos};
// }
function rotatePoint(point, radians, pivot) {
  const sin = Math.sin(radians);
  const cos = Math.cos(radians);
  let outputPoint = [];

  outputPoint[POINT_X] = point[POINT_X] - pivot[POINT_X];
  outputPoint[POINT_Y] = point[POINT_Y] - pivot[POINT_Y];

  outputPoint[POINT_X] =
    outputPoint[POINT_X] * cos - outputPoint[POINT_Y] * sin;

  outputPoint[POINT_Y] =
    outputPoint[POINT_X] * sin + outputPoint[POINT_Y] * cos;

  outputPoint[POINT_X] += pivot[POINT_X];
  outputPoint[POINT_Y] += pivot[POINT_Y];

  return outputPoint;
}

// POINT rotate_point(float cx,float cy,float angle,POINT p)
// {
//   float s = sin(angle);
//   float c = cos(angle);

//   // translate point back to origin:
//   p.x -= cx;
//   p.y -= cy;

//   // rotate point
//   float xnew = p.x * c - p.y * s;
//   float ynew = p.x * s + p.y * c;

//   // translate point back:
//   p.x = xnew + cx;
//   p.y = ynew + cy;
//   return p;
// }

/**
 * Transform image to detector size declared in Mobilenet preserves aspect ratio.
 * Doing this avoids to resize the image again in the detector.
 */
export function cropAndResizeSquareForDetector2(
  imageTensor,
  inputTensorWidth,
  inputTensorHeight,
  face,
  growRatio = 0,
  displacement = 0,
) {
  const {topLeft, bottomRight} = face;

  const rightEye = face.landmarks[0];
  const leftEye = face.landmarks[1];

  const rotation =
    Math.PI + Math.atan2(rightEye[1] - leftEye[1], rightEye[0] - leftEye[0]);

  const center = [
    (bottomRight[0] + topLeft[0]) / 2 / inputTensorWidth,
    (bottomRight[1] + topLeft[1]) / 2 / inputTensorHeight,
  ];

  const rotated = tf.image.rotateWithOffset(
    tf.cast(
      imageTensor.reshape([1, inputTensorHeight, inputTensorWidth, 3]),
      'float32',
    ),
    rotation,
    0,
    center,
  );

  const centerPoint = [
    (bottomRight[POINT_X] + topLeft[POINT_X]) / 2,
    (bottomRight[POINT_Y] + topLeft[POINT_Y]) / 2,
  ];

  const bottomRightRotated = rotatePoint(bottomRight, rotation, centerPoint);
  const topLeftRotated = rotatePoint(topLeft, rotation, centerPoint);

  const boxWidthRaw = bottomRight[0] - topLeft[0]; // * (1 + growRatio * 2);
  //const boxHeight = ((bottomRight[1] - topLeft[1]) * 100) / inputTensorHeight;
  const boxHeight = (boxWidthRaw * 100) / inputTensorHeight;

  const y1 = topLeftRotated[1] / inputTensorHeight + boxHeight * displacement;

  const y2 =
    (topLeftRotated[1] + boxWidthRaw) / inputTensorHeight +
    boxHeight * displacement;

  const x1 =
    (topLeftRotated[0] - topLeftRotated[0] * growRatio) / inputTensorWidth;
  const x2 =
    (bottomRightRotated[0] + bottomRightRotated[0] * growRatio) /
    inputTensorWidth;

  return tf.image
    .cropAndResize(rotated, [[y1, x1, y2, x2]], [0], [IMAGE_SIZE, IMAGE_SIZE])
    .reshape([IMAGE_SIZE, IMAGE_SIZE, 3]);
}

/**
 * Transform image to detector size declared in Mobilenet preserves aspect ratio.
 * Doing this avoids to resize the image again in the detector.
 */
export function cropAndResizeSquareForDetector3(
  imageTensor,
  inputTensorWidth,
  inputTensorHeight,
  face,
  growRatio = 0.1,
  displacement = 0.0028,
) {
  const {topLeft, bottomRight} = face;

  const rightEye = face.landmarks[0];
  const leftEye = face.landmarks[1];

  const rotation =
    Math.PI + Math.atan2(rightEye[1] - leftEye[1], rightEye[0] - leftEye[0]);

  const boxWidthRaw = (bottomRight[0] - topLeft[0]) * (1 + growRatio * 2);
  const boxHeight = (boxWidthRaw * 100) / inputTensorHeight;

  const y1 = topLeft[1] / inputTensorHeight + boxHeight * displacement;

  const y2 =
    (topLeft[1] + boxWidthRaw) / inputTensorHeight + boxHeight * displacement;

  const x1 = (topLeft[0] - topLeft[0] * growRatio) / inputTensorWidth;
  const x2 = (bottomRight[0] + bottomRight[0] * growRatio) / inputTensorWidth;

  //const croppedCenter = [originalCenter[0] - cropWithLeft, originalCenter[1] - cropTopLeft];

  const originalCenter = [
    (bottomRight[0] + topLeft[0]) / 2 / inputTensorWidth,
    (bottomRight[1] + topLeft[1]) / 2 / inputTensorHeight,
  ];

  const croppedCenter = [originalCenter[0] - x1, originalCenter[1] - y1];

  const cropped = tf.image.cropAndResize(
    imageTensor.reshape([1, inputTensorHeight, inputTensorWidth, 3]),
    [[y1, x1, y2, x2]],
    [0],
    [IMAGE_SIZE, IMAGE_SIZE],
  );

  return tf.image
    .rotateWithOffset(cropped, rotation, 0, croppedCenter)
    .reshape([IMAGE_SIZE, IMAGE_SIZE, 3]);
}
