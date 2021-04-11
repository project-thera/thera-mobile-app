import React from 'react';
import {ImageBackground, StyleSheet} from 'react-native';
import {Button, Icon, Layout, Text, ViewPager} from '@ui-kitten/components';

import TriptychBackground from './TriptychBackground';

export default class ViewPagerTab extends React.Component {
  render() {
    return (
      <Layout style={styles.tab}>
        <TriptychBackground backgroundImage={this.props.backgroundImage}>
          <Layout style={styles.innerLayout}>{this.props.children}</Layout>
        </TriptychBackground>
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
});
