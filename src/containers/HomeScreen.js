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

import ViewPagerTab from '../components/base/ViewPagerTab';

import ShopModal from './ShopModal';
import RoundedOpacity from '../components/base/RoundedOpacity';
import LabBackground from '../components/base/LabBackground';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;
const InfoIcon = (props) => <Icon {...props} name="info" />;
const LoginIcon = (props) => <Icon {...props} name="log-in" />;
const LogoutIcon = (props) => <Icon {...props} name="log-out" />;
const MenuIcon = (props) => <Icon {...props} name="more-vertical" />;

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

  componentDidMount() {
    const {navigation} = this.props;

    this.focusListener = navigation.addListener(
      'focus',
      () => {
        this.bg = new LabBackground(0);
        this.forceUpdate();
      },
      [navigation],
    );
  }

  // componentWillUnmount() {
  //   this.focusListener.remove();
  // }

  toggleMenu = () => {
    this.setState({menuVisible: !this.state.menuVisible});
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
        <MenuItem accessoryLeft={InfoIcon} title="About" />
        <MenuItem
          accessoryLeft={LoginIcon}
          title="Login"
          onPress={() => this.navigateTo('login')}
        />
        <MenuItem accessoryLeft={LogoutIcon} title="Logout" />
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
