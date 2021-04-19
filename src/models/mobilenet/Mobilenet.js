/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

// import * as tfconv from '@tensorflow/tfjs-converter';
import * as tf from '@tensorflow/tfjs-core';
import * as tfjs from '@tensorflow/tfjs';

/**
 * Mobilenet model loading configuration
 *
 * Users should provide a version and alpha *OR* a modelURL and inputRange.
 *
 * @param version The MobileNet version number. Use 1 for MobileNetV1, and 2
 * for MobileNetV2. Defaults to 1.
 * @param alpha Controls the width of the network, trading accuracy for
 * performance. A smaller alpha decreases accuracy and increases performance.
 * Defaults to 1.0.
 * @param modelUrl Optional param for specifying the custom model url or
 * an `tf.io.IOHandler` object.
 * @param inputRange The input range expected by the trained
 * model hosted at the modelUrl. This is typically [0, 1] or [-1, 1].
 */

import labels from './data/labels';

let CUSTOM_CLASSES = {};

for (const [i, label] of labels.entries()) {
  CUSTOM_CLASSES[i] = label;
}

const MODEL_INFO = {
  '1.00': {
    // eslint-disable-next-line prettier/prettier
    0.25: {
      url:
        'https://tfhub.dev/google/imagenet/mobilenet_v1_025_224/classification/1',
      inputRange: [0, 1],
    },
    '0.50': {
      url:
        'https://tfhub.dev/google/imagenet/mobilenet_v1_050_224/classification/1',
      inputRange: [0, 1],
    },
    // eslint-disable-next-line prettier/prettier
    0.75: {
      url:
        'https://tfhub.dev/google/imagenet/mobilenet_v1_075_224/classification/1',
      inputRange: [0, 1],
    },
    '1.00': {
      url:
        'https://tfhub.dev/google/imagenet/mobilenet_v1_100_224/classification/1',
      inputRange: [0, 1],
    },
  },
  '2.00': {
    '0.50': {
      url:
        'https://tfhub.dev/google/imagenet/mobilenet_v2_050_224/classification/2',
      inputRange: [0, 1],
    },
    // eslint-disable-next-line prettier/prettier
    0.75: {
      url:
        'https://tfhub.dev/google/imagenet/mobilenet_v2_075_224/classification/2',
      inputRange: [0, 1],
    },
    '1.00': {
      url:
        'https://tfhub.dev/google/imagenet/mobilenet_v2_100_224/classification/2',
      inputRange: [0, 1],
    },
  },
};

export const IMAGE_SIZE = 96;

// See ModelConfig documentation for expectations of provided fields.
export async function load(
  modelConfig = {
    version: 1,
    alpha: 1.0,
  },
) {
  if (tf == null) {
    throw new Error(
      'Cannot find TensorFlow.js. If you are using a <script> tag, please ' +
        'also include @tensorflow/tfjs on the page before using this model.',
    );
  }

  const versionStr = modelConfig.version
    ? modelConfig.version.toFixed(2)
    : '2.00';
  const alphaStr = modelConfig.alpha ? modelConfig.alpha.toFixed(2) : '';
  let inputMin = -1;
  let inputMax = 1;
  // User provides versionStr / alphaStr.
  if (modelConfig.modelUrl == null) {
    if (!(versionStr in MODEL_INFO)) {
      throw new Error(
        'Invalid version of MobileNet. Valid versions are: ' +
          `${Object.keys(MODEL_INFO)}`,
      );
    }
    if (!(alphaStr in MODEL_INFO[versionStr])) {
      throw new Error(
        `MobileNet constructed with invalid alpha ${modelConfig.alpha}. Valid ` +
          'multipliers for this version are: ' +
          `${Object.keys(MODEL_INFO[versionStr])}.`,
      );
    }
    [inputMin, inputMax] = MODEL_INFO[versionStr][alphaStr].inputRange;
  }
  // User provides modelUrl & optional<inputRange>.
  if (modelConfig.inputRange != null) {
    [inputMin, inputMax] = modelConfig.inputRange;
  }

  const mobilenet = new MobileNetImpl(
    versionStr,
    alphaStr,
    modelConfig.modelUrl,
    inputMin,
    inputMax,
  );
  await mobilenet.load();

  return mobilenet;
}

class MobileNetImpl {
  // Values read from images are in the range [0.0, 255.0], but they must
  // be normalized to [min, max] before passing to the mobilenet classifier.
  // Different implementations of mobilenet have different values of [min, max].
  // We store the appropriate normalization parameters using these two scalars
  // such that:
  // out = (in / 255.0) * (inputMax - inputMin) + inputMin;
  // normalizationConstant;

  constructor(version, alpha, modelUrl, inputMin = -1, inputMax = 1) {
    this.alpha = alpha;
    this.version = version;
    this.modelUrl = modelUrl;
    this.inputMin = inputMin;
    this.inputMax = inputMax;
    this.normalizationConstant = (inputMax - inputMin) / 255.0;
  }

  async load() {
    if (this.modelUrl) {
      this.model = await tfjs.loadGraphModel(this.modelUrl);
      // Expect that models loaded by URL should be normalized to [-1, 1]
    } else {
      const url = MODEL_INFO[this.version][this.alpha].url;
      this.model = await tfjs.loadGraphModel(url, {fromTFHub: true});
    }

    // Warmup the model.
    const result = tf.tidy(() =>
      this.model.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])),
    );

    await result.data();

    result.dispose();
  }

  /**
   * Computes the logits (or the embedding) for the provided image.
   *
   * @param img The image to classify. Can be a tensor or a DOM element image,
   *     video, or canvas.
   * @param embedding If true, it returns the embedding. Otherwise it returns
   *     the 1000-dim logits.
   */
  infer(img) {
    return tf.tidy(() => {
      if (!(img instanceof tf.Tensor)) {
        img = tf.browser.fromPixels(img);
      }

      // Normalize the image from [0, 255] to [inputMin, inputMax].
      const normalized = tf.add(
        tf.mul(tf.cast(img, 'float32'), this.normalizationConstant),
        this.inputMin,
      );

      const batched = tf.reshape(normalized, [-1, IMAGE_SIZE, IMAGE_SIZE, 3]);

      return this.model.predict(batched);
    });
  }

  /**
   * Classifies an image from the 1000 ImageNet classes returning a map of
   * the most likely class names to their probability.
   *
   * @param img The image to classify. Can be a tensor or a DOM element image,
   * video, or canvas.
   * @param topk How many top values to use. Defaults to 1.
   */
  async classify(img, updateView, topk = 1) {
    // 180 ms
    const logits = this.infer(img);

    updateView();

    // 90 ms
    const classes = await getTopKClasses(logits, topk);

    logits.dispose();

    return classes;
  }
}

async function getTopKClasses(logits, topK) {
  const softmax = tf.softmax(logits);
  const values = await softmax.data();
  softmax.dispose();

  const valuesAndIndices = [];
  for (let i = 0; i < values.length; i++) {
    valuesAndIndices.push({value: values[i], index: i});
  }
  valuesAndIndices.sort((a, b) => {
    return b.value - a.value;
  });
  const topkValues = new Float32Array(topK);
  const topkIndices = new Int32Array(topK);
  for (let i = 0; i < topK; i++) {
    topkValues[i] = valuesAndIndices[i].value;
    topkIndices[i] = valuesAndIndices[i].index;
  }

  const topClassesAndProbs = [];
  for (let i = 0; i < topkIndices.length; i++) {
    topClassesAndProbs.push({
      className: CUSTOM_CLASSES[topkIndices[i]],
      probability: topkValues[i],
    });
  }

  return topClassesAndProbs;
}
