import * as tf from '@tensorflow/tfjs';

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
      imageTensor.reshape([1, inputTensorWidth, inputTensorHeight, 3]),
      [[y1, x1, y2, x2]],
      [0],
      [cropHeight, cropWidth],
    )
    .reshape([cropHeight, cropWidth, 3]);
}

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

  return tf.image
    .cropAndResize(
      imageTensor.reshape([1, inputTensorWidth, inputTensorHeight, 3]),
      [[y1, x1, y2, x2]],
      [0],
      [cropHeight, cropWidth],
    )
    .reshape([cropHeight, cropWidth, 3]);
}

// const normTopLeft = topLeft.div(imageTensor.shape.slice(-3, -2));
// const normBottomRight = bottomRight.div(
//   imageTensor.shape.slice(-3, -2),
// );
// const width = Math.floor(
//   bottomRight.dataSync()[0] -
//     topLeft.dataSync()[0] * inputTensorWidth,
// );
// const height = Math.floor(
//   bottomRight.dataSync()[1] -
//     topLeft.dataSync()[1] * inputTensorHeight,
// );
// const boxes = tf
//   .concat([normTopLeft.dataSync(), normBottomRight.dataSync()])
//   .reshape([-1, 4]);

// const cropped = tf.image.cropAndResize(
//   imageTensor.reshape([1, 224, 224, 3]),
//   boxes,
//   [0],
//   [height, width],
// );
