import React from 'react';
import {ImageBackground, StyleSheet} from 'react-native';
import {Button, Layout, Text, TopNavigation} from '@ui-kitten/components';

import {SafeAreaView} from 'react-native-safe-area-context';

import SwipeableViews from 'react-swipeable-views-native';

// import Navigation from '../components/Navigation';

export default class LabScreen extends React.Component {
  constructor(props) {
    super(props);

    console.log(props);
  }

  render() {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* <Navigation /> */}
        <TopNavigation title="Thera Project" alignment="center" />
        <SwipeableViews
          style={styles.slideContainer}
          index={1}
          useNativeDriver={true}>
          <ImageBackground
            source={require('../assets/images/lab2-bg0.jpg')}
            style={styles.backgroundImage}>
            <Layout style={styles.layout}>
              <Button
                onPress={() => this.props.navigation.navigate('glossary')}>
                GlossaryScreen
              </Button>
            </Layout>
          </ImageBackground>
          <ImageBackground
            source={require('../assets/images/lab2-bg1.jpg')}
            style={styles.backgroundImage}>
            <Layout style={styles.layout}>
              <Text>my Progress</Text>
            </Layout>
          </ImageBackground>
          <ImageBackground
            source={require('../assets/images/lab2-bg2.jpg')}
            style={styles.backgroundImage}>
            <Layout style={styles.layout}>
              <Button
                onPress={() => this.props.navigation.navigate('routines')}>
                RoutinesScreen
              </Button>
            </Layout>
          </ImageBackground>
        </SwipeableViews>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'red',
    flex: 1,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  backgroundImage: {
    // alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    resizeMode: 'stretch',
    width: '100%',
  },
  layout: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 40,
    flex: 1,
  },
});
