import React from 'react';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  Divider,
  Layout,
  TopNavigation,
  TopNavigationAction,
  Icon,
} from '@ui-kitten/components';

import Exercises from '../components/exercises/Exercises';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

export default class App extends React.Component {
  getExercises() {
    return [
      {
        type: 'classification',
        steps: [
          {
            time: 1000, // in ms
            label: 'lengua afuera',
          },
          {
            time: 1000, // in ms
            label: 'boca cerrada',
          },
        ],
      },
      {
        type: 'speech',
        steps: [
          {
            sentence: 'perro',
          },
        ],
      },
      {
        type: 'blow',
        steps: [
          {
            time: 1000, // in ms
            detected: true,
          },
        ],
      },
      {
        type: 'classification',
        steps: [
          {
            time: 1000, // in ms
            label: 'boca cerrada',
          },
          {
            time: 1000, // in ms
            label: 'lengua afuera',
          },
        ],
      },
    ];
  }

  render() {
    const {faceDetector, mobilenetDetector} = this.props;

    const navigateBack = () => {
      this.navigation.goBack();
    };

    const BackAction = () => (
      <TopNavigationAction icon={BackIcon} onPress={navigateBack} />
    );

    return (
      <SafeAreaView style={{flex: 1}}>
        <TopNavigation
          title="MyApp"
          alignment="center"
          accessoryLeft={BackAction}
        />
        <Divider />
        <Layout
          style={{
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          }}>
          <Exercises
            exercises={this.getExercises()}
            faceDetector={faceDetector}
            mobilenetDetector={mobilenetDetector}
          />
        </Layout>
      </SafeAreaView>
    );
  }
}
