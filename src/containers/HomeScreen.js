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
  }

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
          <ViewPagerTab
            backgroundImage={require('../assets/images/lab2-bg0.jpg')}>
            <RoundedOpacity
              action={() => this.props.navigation.navigate('glossary')}
              icon={require('../assets/images/icons/computer.png')}
              text="GlossaryScreen"
            />
          </ViewPagerTab>
          <ViewPagerTab
            backgroundImage={require('../assets/images/lab2-bg1.jpg')}>
            <RoundedOpacity
              action={() => this.props.navigation.navigate('exercises')}
              icon={require('../assets/images/icons/robot.png')}
              text="ExercisesScreen"
            />
            <Button
              style={{marginBottom: 8}}
              onPress={() => this.showShopModal(true)}>
              ShopScreen
            </Button>
          </ViewPagerTab>
          <ViewPagerTab
            backgroundImage={require('../assets/images/lab2-bg2.jpg')}>
            <RoundedOpacity
              action={() => this.props.navigation.navigate('routines')}
              icon={require('../assets/images/icons/chatbot.png')}
              text="RoutinesScreen"
            />
          </ViewPagerTab>
        </ViewPager>

        <ShopModal
          visible={this.state.shopVisible}
          onBackdropPress={() => this.showShopModal(false)}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({});
