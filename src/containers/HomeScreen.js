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

import {View as AnimatableView} from 'react-native-animatable';

import Toast from 'react-native-toast-message';

import ViewPagerTab from '../components/base/ViewPagerTab';

import RoundedOpacity from '../components/base/RoundedOpacity';
import LabBackground from '../components/base/LabBackground';

import RCTNetworking from 'react-native/Libraries/Network/RCTNetworking';
import Database from '../storage/Database';

import icons from '../assets/images/icons';

const database = Database.getInstance();

const BackIcon = (props) => <Icon {...props} style={{ width: 48, height: 48, color: '#123123' }} name="arrow-back" />;
const InfoIcon = (props) => <Icon {...props} name="info" />;
const LogoutIcon = (props) => <Icon {...props} name="log-out" />;
const MenuIcon = (props) => <Icon {...props} name="more-vertical" />;
const PersonIcon = (props) => <Icon {...props} name="person" />;
const SettingsIcon = (props) => <Icon {...props} name="settings" />;
const SyncIcon = (props) => <Icon {...props} name="sync" />;

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedIndex: 1,
      menuVisible: false,
      showSyncModal: false,
    };

    this.bg = new LabBackground(0);
  }

  componentDidMount = () => {
    const {navigation} = this.props;

    this.focusListener = navigation.addListener(
      'focus',
      async () => await this._updateBackground(),
      [navigation],
    );
  };

  componentWillUnmount = () => {
    if (this.focusListener && this.focusListener.remove) {
      this.focusListener.remove();
    }
  };

  _updateBackground = async () => {
    let gameReward = await database.getGameReward();
    let step = gameReward.current_robot ? gameReward.current_robot : 0;

    this.bg.refresh(step);

    this.forceUpdate();
  };

  toggleMenu = () => {
    this.setState({menuVisible: !this.state.menuVisible});
  };

  logout = () => {
    // Clear cookies
    RCTNetworking.clearCookies(() => {});

    // This clears the async storage
    // AsyncStorage.clear().then(() => console.log('Cleared'));

    database.removeCurrentUser();

    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: '¡Hasta luego!',
      text2: 'Te esperamos pronto para seguir practicando.',
    });

    this.props.navigation.reset({routes: [{name: 'login'}]});
  };

  _sync = async () => {
    this.toggleMenu();

    this.setState(
      {
        showSyncModal: true,
      },
      async () => {
        await database.sync();

        this.setState(
          {
            showSyncModal: false,
          },
          () => {
            this._updateBackground();
          },
        );
      },
    );
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

  renderAvatar = () => (
    <Image style={styles.avatar} source={icons.projectTheraIcon} />
  );

  renderRightActions = () => (
    <OverflowMenu
      anchor={this.renderMenuAction}
      visible={this.state.menuVisible}
      onBackdropPress={this.toggleMenu}>
      <MenuItem accessoryLeft={PersonIcon} title="Mi cuenta" />
      <MenuItem
        accessoryLeft={SettingsIcon}
        title="Configuración"
        onPress={() => {
          this.toggleMenu();
          this.props.navigation.navigate('settings');
        }}
      />
      <MenuItem
        accessoryLeft={SyncIcon}
        title="Sincronizar"
        onPress={() => this._sync()}
      />
      <MenuItem accessoryLeft={InfoIcon} title="Acerca del Proyecto Thera" />
      <MenuItem
        accessoryLeft={LogoutIcon}
        title="Cerrar sesión"
        onPress={this.logout}
      />
    </OverflowMenu>
  );

  renderSyncModal = () => {
    return (
      <Modal
        style={{width: '80%'}}
        visible={this.state.showSyncModal}
        backdropStyle={styles.backdrop}>
        <Card disabled={true}>
          <AnimatableView
            animation="pulse"
            iterationCount="infinite"
            iterationDelay={1000}
            useNativeDriver={true}>
            <Image source={icons.process} style={styles.syncModalImage} />
          </AnimatableView>
          <Text category="h6" style={{alignSelf: 'center', paddingBottom: 8}}>
            Sincronizando...
          </Text>
        </Card>
      </Modal>
    );
  };

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <TopNavigation
          style={{
            fontSize: 48
          }}
          title="Proyecto Thera"
          subtitle="Inicio"
          accessoryLeft={this.renderAvatar}
          accessoryRight={this.renderRightActions}
        />
        <ViewPager
          style={{flex: 1}}
          selectedIndex={this.state.selectedIndex}
          onSelect={(index) => {
            this.setState({selectedIndex: index});
          }}>
          <ViewPagerTab
            backgroundImage={this.bg.getImage(0)}
            withRightArrow={true}>
            <RoundedOpacity
              action={() => this.props.navigation.navigate('glossary')}
              icon={require('../assets/images/icons/computer.png')}
              text="Base de Conocimiento"
            />
          </ViewPagerTab>
          <ViewPagerTab
            backgroundImage={this.bg.getImage(1)}
            withLeftArrow={true}
            withRightArrow={true}>
            <RoundedOpacity
              action={() => this.props.navigation.navigate('shop')}
              // icon={require('../assets/images/icons/robot.png')}
              text="¡Presioná aquí para ingresar al taller!"
            />
          </ViewPagerTab>
          <ViewPagerTab
            backgroundImage={this.bg.getImage(2)}
            withLeftArrow={true}>
            <RoundedOpacity
              action={() => this.props.navigation.navigate('routines')}
              icon={require('../assets/images/icons/chatbot.png')}
              text="Mis Rutinas"
            />
          </ViewPagerTab>
        </ViewPager>
        {this.renderSyncModal()}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  avatar: {
    height: 40,
    width: 40,
    marginRight: 8,
    resizeMode: 'contain',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  syncModalImage: {
    alignSelf: 'center',
    height: 180,
    marginVertical: 24,
    resizeMode: 'contain',
    width: '70%',
  },
});
