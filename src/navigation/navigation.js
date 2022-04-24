import React from 'react';
import Toast from 'react-native-toast-message';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import GlossaryScreen from '../containers/GlossaryScreen';
import HomeScreen from '../containers/HomeScreen';
import LoginScreen from '../containers/LoginScreen';
import MyAccountScreen from '../containers/MyAccountScreen';
import ResetPasswordScreen from '../containers/ResetPasswordScreen';
import RoutinesScreen from '../containers/RoutinesScreen';
import RoutineIntentScreen from '../containers/RoutineIntentScreen';
import SettingsScreen from '../containers/SettingsScreen';
import ShopScreen from '../containers/ShopScreen';
import SignUpScreen from '../containers/SignUpScreen';
import RecordScreen from '../containers/RecordScreen';

const {Navigator, Screen} = createStackNavigator();

const HomeNavigator = (parentProps) => {
  return (
    <Navigator headerMode="none">
      {parentProps.currentUser ? (
        <>
          <Screen name="home" component={HomeScreen} />
          <Screen name="glossary">
            {(props) => <GlossaryScreen {...props} {...parentProps} />}
          </Screen>
          <Screen name="my-account">
            {(props) => <MyAccountScreen {...props} {...parentProps} />}
          </Screen>
          <Screen name="record" component={RecordScreen} />
          <Screen name="routines">
            {(props) => <RoutinesScreen {...props} {...parentProps} />}
          </Screen>
          <Screen name="routine-intent">
            {(props) => <RoutineIntentScreen {...props} {...parentProps} />}
          </Screen>
          <Screen name="settings">
            {(props) => <SettingsScreen {...props} {...parentProps} />}
          </Screen>
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
