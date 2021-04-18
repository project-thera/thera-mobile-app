import React from 'react';
import Toast from 'react-native-toast-message';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import HomeScreen from '../containers/HomeScreen';
import ExercisesScreen from '../containers/ExercisesScreen';

import ExerciseIntentScreen from '../containers/ExerciseIntentScreen';
import GlossaryScreen from '../containers/GlossaryScreen';
import RoutinesScreen from '../containers/RoutinesScreen';
import LoginScreen from '../containers/LoginScreen';
import SignUpScreen from '../containers/SignUpScreen';
import ResetPasswordScreen from '../containers/ResetPasswordScreen';
import ShopScreen from '../containers/ShopScreen';

const {Navigator, Screen} = createStackNavigator();

const HomeNavigator = (parentProps) => {
  return (
    <Navigator headerMode="none">
      {parentProps.currentUser ? (
        <>
          <Screen name="home" component={HomeScreen} />
          <Screen name="exercises">
            {(props) => <ExercisesScreen {...props} {...parentProps} />}
          </Screen>
          <Screen name="exercise-intent">
            {(props) => <ExerciseIntentScreen {...props} {...parentProps} />}
          </Screen>
          <Screen name="glossary">
            {(props) => <GlossaryScreen {...props} {...parentProps} />}
          </Screen>
          <Screen name="routines" component={RoutinesScreen} />
          <Screen name="shop" component={ShopScreen} />
          <Screen name="login">
            {(props) => <LoginScreen {...props} {...parentProps} />}
          </Screen>
          <Screen name="sign-up" component={SignUpScreen} />
          <Screen name="reset-password" component={ResetPasswordScreen} />
        </>
      ) : (
        <>
          <Screen name="login">
            {(props) => <LoginScreen {...props} {...parentProps} />}
          </Screen>
          <Screen name="sign-up" component={SignUpScreen} />
          <Screen name="reset-password" component={ResetPasswordScreen} />
        </>
      )}
    </Navigator>
  );
};

export const AppNavigator = (props) => {
  return (
    <NavigationContainer>
      <HomeNavigator {...props} />
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </NavigationContainer>
  );
};
