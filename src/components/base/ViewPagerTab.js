import React from 'react';
import {StyleSheet} from 'react-native';
import {Avatar, Icon, Layout} from '@ui-kitten/components';

import {View as AnimatableView} from 'react-native-animatable';

import TriptychBackground from './TriptychBackground';

import icons from '../../assets/images/icons';

export default class ViewPagerTab extends React.Component {
  renderLeftArrow = () => {
    if (this.props.withLeftArrow) {
      return (
        <Layout style={[styles.overlay, {left: 0}]}>
          <AnimatableView
            animation="rubberBand"
            iterationCount="infinite"
            iterationDelay={1000}
            useNativeDriver={true}>
            <Avatar source={icons.arrowheadLeft} />
          </AnimatableView>
        </Layout>
      );
    }
  };

  renderRightArrow = () => {
    if (this.props.withRightArrow) {
      return (
        <Layout style={[styles.overlay, {right: 0}]}>
          <AnimatableView
            animation="rubberBand"
            iterationCount="infinite"
            iterationDelay={1000}
            useNativeDriver={true}>
            <Avatar source={icons.arrowheadRight} />
          </AnimatableView>
        </Layout>
      );
    }
  };
  render() {
    return (
      <Layout style={styles.tab}>
        <TriptychBackground backgroundImage={this.props.backgroundImage}>
          <Layout style={styles.innerLayout}>{this.props.children}</Layout>
        </TriptychBackground>
        {this.renderLeftArrow()}
        {this.renderRightArrow()}
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
  },
  innerLayout: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  overlay: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    width: 50,
    top: 0,
    bottom: 0,
    color: 'red',
    position: 'absolute',
  },
});
