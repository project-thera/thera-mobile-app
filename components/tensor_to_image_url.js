import * as jpeg from 'jpeg-js';
import * as tf from '@tensorflow/tfjs';

export default async function tensorToImageUrl(imageTensor) {
  const [height, width] = imageTensor.shape;
  const buffer = await imageTensor.toInt().data();
  const frameData = new Uint8Array(width * height * 4);

  let offset = 0;
  for (let i = 0; i < frameData.length; i += 4) {
    frameData[i] = buffer[offset];
    frameData[i + 1] = buffer[offset + 1];
    frameData[i + 2] = buffer[offset + 2];
    frameData[i + 3] = 0xff;

    offset += 3;
  }

  const rawImageData = {
    data: frameData,
    width,
    height,
  };
  const jpegImageData = jpeg.encode(rawImageData, 75);
  const base64Encoding = tf.util.decodeString(jpegImageData.data, 'base64');

  console.log(base64Encoding);
  return base64Encoding;
}

// import * as tf from '@tensorflow/tfjs';
// import * as FileSystem from 'expo-file-system';
// import * as jpeg from 'jpeg-js';

// export default async function (tensor) {
//   const height = tensor.shape[0];
//   const width = tensor.shape[1];
//   const data = new Buffer(
//     // concat with an extra alpha channel and slice up to 4 channels to handle 3 and 4 channels tensors
//     tf
//       .concat([tensor, tf.ones([height, width, 1]).mul(255)], [-1])
//       .slice([0], [height, width, 4])
//       .dataSync(),
//   );

//   const rawImageData = {data, width, height};
//   const jpegImageData = jpeg.encode(rawImageData, 100);

//   const imgBase64 = tf.util.decodeString(jpegImageData.data, 'base64');
//   // const salt = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
//   // const uri = FileSystem.documentDirectory + `tensor-${salt}.jpg`;
//   // await FileSystem.writeAsStringAsync(uri, imgBase64, {
//   //   encoding: FileSystem.EncodingType.Base64,
//   // });
//   // console.log(imgBase64);
//   return imgBase64;
// }
