import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import HomeScreen from '../containers/HomeScreen';
import ExercisesScreen from '../containers/ExercisesScreen';

const {Navigator, Screen} = createStackNavigator();

const HomeNavigator = (props) => {
  return (
    <Navigator headerMode="none">
      <Screen name="Home" component={HomeScreen} {...props} />
      <Screen name="Exercises">{(_) => <ExercisesScreen {...props} />}</Screen>
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
