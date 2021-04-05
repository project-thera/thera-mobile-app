import React from 'react';
import {
  Button,
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

import {SafeAreaView} from 'react-native-safe-area-context';

import ViewPagerTab from '../components/base/ViewPagerTab';

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
          selectedIndex={this.state.selectedIndex}
          onSelect={(index) => {
            this.setState({selectedIndex: index});
          }}>
          <ViewPagerTab
            backgroundImage={require('../assets/images/lab2-bg0.jpg')}>
            <Button onPress={() => this.props.navigation.navigate('glossary')}>
              GlossaryScreen
            </Button>
          </ViewPagerTab>
          <ViewPagerTab
            backgroundImage={require('../assets/images/lab2-bg1.jpg')}>
            <Text>my Progress</Text>
            <Button
              style={{marginBottom: 8}}
              onPress={() => this.props.navigation.navigate('exercises')}>
              ExercisesScreen
            </Button>
            <Button
              style={{marginBottom: 8}}
              onPress={() => this.props.navigation.navigate('shop')}>
              ShopScreen
            </Button>
          </ViewPagerTab>
          <ViewPagerTab
            backgroundImage={require('../assets/images/lab2-bg2.jpg')}>
            <Button onPress={() => this.props.navigation.navigate('routines')}>
              RoutinesScreen
            </Button>
          </ViewPagerTab>
        </ViewPager>
      </SafeAreaView>
    );
  }
}
