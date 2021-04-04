import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import HomeScreen from '../containers/HomeScreen';
import ExercisesScreen from '../containers/ExercisesScreen';

// import LabScreen from '../containers/LabScreen';
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
      {/* <Screen name="lab">
        {(props) => <LabScreen {...props} {...parentProps} />}
      </Screen> */}
      <Screen name="glossary" component={GlossaryScreen} />
      <Screen name="routines" component={RoutinesScreen} />
      <Screen name="login" component={LoginScreen} />
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
