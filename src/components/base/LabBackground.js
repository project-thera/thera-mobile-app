// no way to do this dynamically
// https://stackoverflow.com/questions/30854232/react-native-image-require-module-using-dynamic-names

const images = {
  'bg-lab0-prof0': require('../../assets/images/bg/bg-lab0-prof0.jpg'),
  'bg-lab0-prof1': require('../../assets/images/bg/bg-lab0-prof1.jpg'),
  'bg-lab0-prof2': require('../../assets/images/bg/bg-lab0-prof2.jpg'),
  'bg-lab1-step0-prof0': require('../../assets/images/bg/bg-lab1-step0-prof0.jpg'),
  'bg-lab1-step0-prof1': require('../../assets/images/bg/bg-lab1-step0-prof1.jpg'),
  'bg-lab1-step0-prof2': require('../../assets/images/bg/bg-lab1-step0-prof2.jpg'),
  'bg-lab1-step1-prof0': require('../../assets/images/bg/bg-lab1-step1-prof0.jpg'),
  'bg-lab1-step1-prof1': require('../../assets/images/bg/bg-lab1-step1-prof1.jpg'),
  'bg-lab1-step1-prof2': require('../../assets/images/bg/bg-lab1-step1-prof2.jpg'),
  'bg-lab1-step2-prof0': require('../../assets/images/bg/bg-lab1-step2-prof0.jpg'),
  'bg-lab1-step2-prof1': require('../../assets/images/bg/bg-lab1-step2-prof1.jpg'),
  'bg-lab1-step2-prof2': require('../../assets/images/bg/bg-lab1-step2-prof2.jpg'),
  'bg-lab1-step3-prof0': require('../../assets/images/bg/bg-lab1-step3-prof0.jpg'),
  'bg-lab1-step3-prof1': require('../../assets/images/bg/bg-lab1-step3-prof1.jpg'),
  'bg-lab1-step3-prof2': require('../../assets/images/bg/bg-lab1-step3-prof2.jpg'),
  'bg-lab1-step4-prof0': require('../../assets/images/bg/bg-lab1-step4-prof0.jpg'),
  'bg-lab1-step4-prof1': require('../../assets/images/bg/bg-lab1-step4-prof1.jpg'),
  'bg-lab1-step4-prof2': require('../../assets/images/bg/bg-lab1-step4-prof2.jpg'),
  'bg-lab1-step5-prof0': require('../../assets/images/bg/bg-lab1-step5-prof0.jpg'),
  'bg-lab1-step5-prof1': require('../../assets/images/bg/bg-lab1-step5-prof1.jpg'),
  'bg-lab1-step5-prof2': require('../../assets/images/bg/bg-lab1-step5-prof2.jpg'),
  'bg-lab1-step5-prof0': require('../../assets/images/bg/bg-lab1-step5-prof0.jpg'),
  'bg-lab1-step5-prof1': require('../../assets/images/bg/bg-lab1-step5-prof1.jpg'),
  'bg-lab1-step5-prof2': require('../../assets/images/bg/bg-lab1-step5-prof2.jpg'),
  'bg-lab1-step6-prof0': require('../../assets/images/bg/bg-lab1-step6-prof0.jpg'),
  'bg-lab1-step6-prof1': require('../../assets/images/bg/bg-lab1-step6-prof1.jpg'),
  'bg-lab1-step6-prof2': require('../../assets/images/bg/bg-lab1-step6-prof2.jpg'),
  'bg-lab1-step7-prof0': require('../../assets/images/bg/bg-lab1-step7-prof0.jpg'),
  'bg-lab1-step7-prof1': require('../../assets/images/bg/bg-lab1-step7-prof1.jpg'),
  'bg-lab1-step7-prof2': require('../../assets/images/bg/bg-lab1-step7-prof2.jpg'),
  'bg-lab1-step8-prof0': require('../../assets/images/bg/bg-lab1-step8-prof0.jpg'),
  'bg-lab1-step8-prof1': require('../../assets/images/bg/bg-lab1-step8-prof1.jpg'),
  'bg-lab1-step8-prof2': require('../../assets/images/bg/bg-lab1-step8-prof2.jpg'),
  'bg-lab2-prof0': require('../../assets/images/bg/bg-lab2-prof0.jpg'),
  'bg-lab2-prof1': require('../../assets/images/bg/bg-lab2-prof1.jpg'),
  'bg-lab2-prof2': require('../../assets/images/bg/bg-lab2-prof2.jpg'),
  'bg-lab2-prof3': require('../../assets/images/bg/bg-lab2-prof1.jpg'),
  'bg-lab2-prof4': require('../../assets/images/bg/bg-lab2-prof2.jpg'),
};

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

const positions = 2;
const modes = {0: 3, 1: 3, 2: 5};

export default class LabBackground {
  constructor(step) {
    this.refresh(step);
  }

  getImage = (frame) => {
    return images[this.getFrame(frame)];
  };

  getFrame = (frame) => {
    let step = frame == 1 ? `-step${this.step}` : '';
    let mode = frame == this.pos ? this.mode : 0;

    return `bg-lab${frame}${step}-prof${mode}`;
  };

  refresh = (step) => {
    this.step = step;
    this.present = getRandomInt(0, 10) > 0;

    this.pos = 0;
    this.mode = 0;

    if (this.present > 0) {
      this.pos = getRandomInt(0, positions + 1);
      this.mode = getRandomInt(1, modes[this.pos]);
    }
  }
}
