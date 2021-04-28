import React from 'react';
import {Image, StyleSheet, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Button,
  Card,
  Icon,
  Layout,
  MenuItem,
  Modal,
  OverflowMenu,
  Text,
  TopNavigation,
  TopNavigationAction,
  ViewPager,
} from '@ui-kitten/components';

import Toast from 'react-native-toast-message';

import ViewPagerTab from '../components/base/ViewPagerTab';

import ShopModal from './ShopModal';
import RoundedOpacity from '../components/base/RoundedOpacity';
import LabBackground from '../components/base/LabBackground';

import RCTNetworking from 'react-native/Libraries/Network/RCTNetworking';
import Database from '../storage/Database';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;
const InfoIcon = (props) => <Icon {...props} name="info" />;
const LoginIcon = (props) => <Icon {...props} name="log-in" />;
const LogoutIcon = (props) => <Icon {...props} name="log-out" />;
const MenuIcon = (props) => <Icon {...props} name="more-vertical" />;

import {createReminderChannel} from '../notifications';

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedIndex: 1,
      menuVisible: false,
      shopVisible: false,
    };

    this.bg = new LabBackground(0);
  }

  async componentDidMount() {
    const {navigation} = this.props;

    this.focusListener = navigation.addListener(
      'focus',
      () => {
        this.bg = new LabBackground(0);
        this.forceUpdate();
      },
      [navigation],
    );

    createReminderChannel();
  }

  // componentWillUnmount() {
  //   this.focusListener.remove();
  // }

  toggleMenu = () => {
    this.setState({menuVisible: !this.state.menuVisible});
  };

  logout = () => {
    // Clear cookies
    RCTNetworking.clearCookies(() => {});

    // This clears the async storage
    // AsyncStorage.clear().then(() => console.log('Cleared'));

    Database.getInstance().removeCurrentUser();

    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: 'Vuelve pronto',
    });
  };

  showShopModal = (value) => {
    this.setState({shopVisible: value});
  };

  navigateTo = (route) => {
    this.toggleMenu();
    this.props.navigation.navigate(route);
  };

  renderBackAction = () => (
    <TopNavigationAction
      icon={BackIcon}
      onPress={() => this.props.navigation.goBack()}
    />
  );

  renderMenuAction = () => (
    <TopNavigationAction icon={MenuIcon} onPress={this.toggleMenu} />
  );

  renderRightActions = () => (
    <React.Fragment>
      <OverflowMenu
        anchor={this.renderMenuAction}
        visible={this.state.menuVisible}
        onBackdropPress={this.toggleMenu}>
        <MenuItem
          title="Grabar video"
          onPress={() => this.navigateTo('record')}
        />
        <MenuItem
          title="Notificaciones"
          onPress={() => this.navigateTo('notifications')}
        />
        <MenuItem accessoryLeft={InfoIcon} title="About" />
        <MenuItem
          accessoryLeft={LoginIcon}
          title="Login"
          onPress={() => this.navigateTo('login')}
        />
        <MenuItem
          accessoryLeft={LogoutIcon}
          title="Logout"
          onPress={this.logout}
        />
      </OverflowMenu>
    </React.Fragment>
  );

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        {/* <Navigation /> */}
        <TopNavigation
          title="Thera Project"
          subtitle="HomeScreen"
          alignment="center"
          accessoryRight={this.renderRightActions}
          // accessoryLeft={this.renderBackAction}
        />
        <ViewPager
          style={{flex: 1}}
          selectedIndex={this.state.selectedIndex}
          onSelect={(index) => {
            this.setState({selectedIndex: index});
          }}>
          <ViewPagerTab backgroundImage={this.bg.getImage(0)}>
            <RoundedOpacity
              action={() => this.props.navigation.navigate('glossary')}
              icon={require('../assets/images/icons/computer.png')}
              text="GlossaryScreen"
            />
          </ViewPagerTab>
          <ViewPagerTab backgroundImage={this.bg.getImage(1)}>
            <RoundedOpacity
              action={() => this.props.navigation.navigate('routines')}
              icon={require('../assets/images/icons/chatbot.png')}
              text="RoutinesScreen"
            />
          </ViewPagerTab>
          <ViewPagerTab backgroundImage={this.bg.getImage(2)}>
            <RoundedOpacity
              action={() => this.props.navigation.navigate('shop')}
              icon={require('../assets/images/icons/robot.png')}
              text="ShopScreen2"
            />
          </ViewPagerTab>
        </ViewPager>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({});
