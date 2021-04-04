import React from 'react';
import {ImageBackground, StyleSheet} from 'react-native';
import {
  Button,
  Icon,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
  ViewPager,
} from '@ui-kitten/components';

import {SafeAreaView} from 'react-native-safe-area-context';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedIndex: 1,
    };
  }

  renderBackAction = () => (
    <TopNavigationAction
      icon={BackIcon}
      onPress={() => this.props.navigation.goBack()}
    />
  );

  render() {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* <Navigation /> */}
        <TopNavigation
          title="Thera Project"
          subtitle="HomeScreen"
          alignment="center"
          // accessoryLeft={this.renderBackAction}
        />
        <ViewPager
          selectedIndex={this.state.selectedIndex}
          onSelect={(index) => {
            this.setState({selectedIndex: index});
          }}>
          <Layout style={styles.tab}>
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
          </Layout>
          <Layout style={styles.tab}>
            <ImageBackground
              source={require('../assets/images/lab2-bg1.jpg')}
              style={styles.backgroundImage}>
              <Layout style={styles.layout}>
                <Text>my Progress</Text>
                <Button
                  onPress={() => this.props.navigation.navigate('exercises')}>
                  ExercisesScreen
                </Button>
                <Button
                  onPress={() => this.props.navigation.navigate('login')}>
                  LoginScreen
                </Button>
              </Layout>
            </ImageBackground>
          </Layout>
          <Layout style={styles.tab}>
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
          </Layout>
        </ViewPager>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'red',
    flex: 1,
  },
  tab: {
    height: '100%',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  backgroundImage: {
    // alignItems: 'center',
    height: '100%',
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
