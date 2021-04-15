import React from 'react';
import {Image, StyleSheet} from 'react-native';
import {Layout, Text} from '@ui-kitten/components';
import {Audio} from 'expo-av';

import balloons from '../../assets/images/balloons';
import sounds from '../../assets/sounds';

export default class Balloon extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.defaultState();
  }

  defaultState = () => {
    return {
      balloonPoppingSound: null,
    };
  };

  async componentDidMount() {
    Audio.Sound.createAsync(sounds.balloonPopping).then(({sound}) => {
      this.setState({balloonPoppingSound: sound});
    });
  }

  componentDidUpdate = (prevProps) => {
    console.log('update')
    if (!this.props.popped && (this.props.progress == 100)) {
      this.state.balloonPoppingSound?.replayAsync();
    }
  };

  balloonPopped = () => this.props.popped || (this.props.progress == 100)

  balloonWidth = () => {
    return 40 + Math.floor(2.8 * this.props.progress);
  };

  renderImage = () => {
    if (this.balloonPopped()) {
      return <Image style={[styles.image]} source={balloons.poppedBalloon} />;
    } else {
      return (
        <Image
          style={[styles.image, {width: this.balloonWidth()}]}
          source={balloons.purpleBalloon}
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
