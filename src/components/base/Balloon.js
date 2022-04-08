import React from 'react';
import {Image, StyleSheet} from 'react-native';
import {Layout, Text} from '@ui-kitten/components';
import {Audio} from 'expo-av';

import BalloonLib from '../../assets/images/balloons';
import sounds from '../../assets/sounds';

export default class Balloon extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      balloon: BalloonLib.getRandomBalloon(),
      isPopped: false,
    };

    Audio.Sound.createAsync(sounds.balloonPopping).then(({sound}) => {
      this.balloonPoppingSound = sound;
    });
  }

  componentWillUnmount = async () => {
    if (this.balloonPoppingSound) await this.balloonPoppingSound.unloadAsync();
  };

  pop = () => {
    this.balloonPoppingSound?.replayAsync();

    this.setState({
      isPopped: true,
    });
  };

  reset = () => {
    this.setState({
      balloon: BalloonLib.getRandomBalloon(),
      isPopped: false,
    });
  };

  balloonWidth = () => {
    return 40 + Math.floor(2.8 * this.props.progress);
  };

  renderImage = () => {
    if (this.state.isPopped) {
      return (
        <Image style={[styles.image]} source={BalloonLib.getPoppedBalloon()} />
      );
    } else {
      return (
        <Image
          style={[styles.image, {width: this.balloonWidth()}]}
          source={this.state.balloon}
        />
      );
    }
  };

  render() {
    return (
      <Layout style={[styles.container, this.props.containerStyle]}>
        {this.renderImage()}
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  image: {
    backgroundColor: 'rgba(255, 255, 255, 0)',
    flex: 1,
    resizeMode: 'contain',
    width: 320,
  },
  text: {
    fontSize: 32,
    textAlign: 'center',
  },
});
