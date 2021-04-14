const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

const sample = (array) => {
  return array[getRandomInt(0, array.length)];
};

export default class Messages {
  static successTitle() {
    let msg = [
      '¡Excelente!',
      '¡Muy bien!',
      '¡Genial!',
      '¡Magnífico!',
      '¡Estupendo!',
      '¡Fabuloso!',
    ];

    return sample(msg);
  }

  static successSubtitle() {
    let msg = [
      'Lo estás logrando.',
      'Sigamos trabajando.',
      'Continuemos practicando.',
      '¡Falta muy poco!',
    ];

    return sample(msg);
  }
}
