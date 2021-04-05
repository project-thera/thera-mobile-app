import React from 'react';
import {ImageBackground, StyleSheet} from 'react-native';
import {Button, Icon, Layout, Text, ViewPager} from '@ui-kitten/components';

export default class ViewPagerTab extends React.Component {
  render() {
    return (
      <Layout style={styles.tab}>
        <ImageBackground
          source={this.props.backgroundImage}
          style={styles.backgroundImage}>
          <Layout style={styles.innerLayout}>{this.props.children}</Layout>
        </ImageBackground>
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  tab: {
    height: '100%',
  },
  backgroundImage: {
    // alignItems: 'center',
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    resizeMode: 'stretch',
    width: '100%',
  },
  innerLayout: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 40,
    flex: 1,
  },
});
