import React from 'react';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  Divider,
  Layout,
  TopNavigation,
  TopNavigationAction,
  Icon,
} from '@ui-kitten/components';

import Exercises from '../components/exercises/ExerciseList';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

  getExercises() {
    return [
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
            time: 1000,
            detected: true,
            requiredConfidence: 2,
            penalizeStep: 2,
            maxConfidence: 5,
          },
        ],
      },
      {
        type: 'classification',
        steps: [
          {
            time: 1000,
            label: 'boca cerrada',
          },
          {
            time: 1000,
            label: 'inflar cachetes',
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

  navigateBack = () => {
    this.props.navigation.goBack(); // navigate('home');
  };

  render() {
    const {faceDetector, mobilenetDetector} = this.props;

    const BackAction = () => (
      <TopNavigationAction icon={BackIcon} onPress={this.navigateBack} />
    );

    return (
      <SafeAreaView style={{flex: 1}}>
        <TopNavigation
          title="Ejercicios"
          alignment="center"
          accessoryLeft={BackAction}
        />
        <Divider />
        <Layout
          style={{
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            flexDirection: 'column',
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
