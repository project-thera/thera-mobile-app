import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import HomeScreen from '../containers/HomeScreen';
import ExercisesScreen from '../containers/ExercisesScreen';

import ExerciseIntentScreen from '../containers/ExerciseIntentScreen';
import GlossaryScreen from '../containers/GlossaryScreen';
import RoutinesScreen from '../containers/RoutinesScreen';
import LoginScreen from '../containers/LoginScreen';

const {Navigator, Screen} = createStackNavigator();

const HomeNavigator = (parentProps) => {
  return (
    <Navigator headerMode="none">
      <Screen name="home" component={HomeScreen} />
      <Screen name="exercises">
        {(props) => <ExercisesScreen {...props} {...parentProps} />}
      </Screen>
      <Screen name="exercise-intent">
        {(props) => <ExerciseIntentScreen {...props} {...parentProps} />}
      </Screen>
      <Screen name="glossary" component={GlossaryScreen} />
      <Screen name="login" component={LoginScreen} />
      <Screen name="routines" component={RoutinesScreen} />
    </Navigator>
  );
};

export const AppNavigator = (props) => {
  return (
    <NavigationContainer>
      <HomeNavigator {...props} />
    </NavigationContainer>
  );
};
