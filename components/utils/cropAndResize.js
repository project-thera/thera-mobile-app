import * as tf from '@tensorflow/tfjs';
import {IMAGE_SIZE} from './Mobilenet';

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
