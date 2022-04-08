const balloons = {
  purpleBalloon: require('./purple-balloon.png'),
  darkGreenBalloon: require('./dark-green-balloon.png'),
  limeGreenBalloon: require('./lime-green-balloon.png'),
  lightBlueBalloon: require('./light-blue-balloon.png'),
  orangeBalloon: require('./orange-balloon.png'),
};

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export default class BalloonLib {
  static getPoppedBalloon() {
    return require('./popped-balloon.png');
  }

  static getBalloon(key) {
    return balloons[key];
  }

  static getRandomBalloon() {
    let keys = Object.keys(balloons);
    let key = keys[getRandomInt(0, keys.length)];

    return balloons[key];
  }
}
