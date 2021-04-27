import React from 'react';
import {Image, StyleSheet} from 'react-native';
import {
  Card,
  Divider,
  Icon,
  List,
  Layout,
  Modal,
  Spinner,
  Text,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';
import Toast from 'react-native-toast-message';
import {Avatar, Button, ListItem, withStyles} from '@ui-kitten/components';

import Database from '../storage/Database';

import icons from '../assets/images/icons';
import steps from '../assets/images/steps';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;
const ShoppingCartIcon = (props) => (
  <Icon {...props} name="shopping-cart-outline" />
);

const TOTAL_STEPS = 8;

class ShopScreen extends React.Component {
  constructor(props) {
    super(props);

    this.database = Database.getInstance();

    this.state = {
      credits: 0,
      current_robot: null,
      robots: 0,
      showModal: false,
    };
  }

  componentDidMount = async () => {
    let gameReward = await Database.getInstance().getGameReward();

    this.setState(gameReward);
  };

  currentStep = () => {
    return this.state.current_robot ? this.state.current_robot : 0;
  };

  _exchange = (step) => {
    Toast.hide();

    if (this.state.credits >= step.price) {
      this.setState(
        {
          credits: this.state.credits - step.price,
          current_robot: this.state.current_robot + 1,
          notEnoughCredit: false,
        },
        () => {
          this._showModal(true);

          this._updateDatabase();

          setTimeout(() => {
            this._showModal(false);

            Toast.show({
              duration: 2000,
              position: 'bottom',
              type: 'success',
              text1: '¡Excelente!',
              text2: 'Sigamos practicando para completar al androide.',
            });
          }, 3000);
        },
      );
    } else {
      this.setState(
        {
          notEnoughCredit: true,
        },
        () => this._showModal(true),
      );
    }
  };

  _showModal = (value) => {
    this.setState({
      showModal: value,
    });
  };

  _assemblyAndroid = () => {
    this.setState(
      {
        current_robot: 0,
        robots: this.state.robots + 1,
      },
      () => {
        this._updateDatabase();
      },
    );
  };

  _updateDatabase = () => {
    this.database.updateGameReward({
      credits: this.state.credits,
      current_robot: this.state.current_robot,
      robots: this.state.robots,
    });
  };

  renderBackAction = () => (
    <TopNavigationAction
      icon={BackIcon}
      onPress={() => this.props.navigation.goBack()}
    />
  );

  renderListItem = (info) => {
    let step = info.item;

    if (this.currentStep() < step.step) {
      return (
        <Layout style={styles.listItem}>
          <Avatar
            size="galactic"
            style={styles.listItemAvatar}
            source={step.image}
          />
          <Layout style={styles.listItemContent}>
            <Layout style={{flexDirection: 'row', alignItems: 'center'}}>
              <Avatar size="tiny" source={icons.microprocessor} />
              <Text style={{fontSize: 18, paddingHorizontal: 4}}>
                {step.price}
              </Text>
            </Layout>
            <Text style={styles.listItemTitle}>{info.item.name}</Text>
            <Text style={styles.listItemDescription}>{step.description}</Text>
          </Layout>
          <Button
            size="tiny"
            style={styles.listItemButton}
            accessoryLeft={ShoppingCartIcon}
            disabled={!(this.currentStep() + 1 == step.step)}
            onPress={() => this._exchange(step)}>
            CANJEAR
          </Button>
        </Layout>
      );
    }

    return null;
  };

  renderStatusItem = (text, image) => {
    return (
      <Layout style={{flex: 1, alignItems: 'center'}}>
        <Avatar source={image} />
        <Text style={{fontSize: 20}}>{text}</Text>
      </Layout>
    );
  };

  renderModalContent = () => {
    if (this.state.notEnoughCredit) {
      return (
        <Card disabled={true}>
          <Text style={{paddingBottom: 8}}>
            No tenés suficientes créditos para canjear esta pieza.
          </Text>
          <Text style={{paddingBottom: 8}}>
            Seguí practicando para acumular más.
          </Text>
          <Button onPress={() => this._showModal(false)}>¡Entendido!</Button>
        </Card>
      );
    } else {
      return (
        <Card disabled={true}>
          <Layout
            style={{
              flexDirection: 'column',
              alignItems: 'center',
            }}>
            <Spinner style={{paddingBottom: 16}} size="galactic" />
            <Text style={{paddingTop: 8}}>Ensamblando nueva pieza...</Text>
          </Layout>
        </Card>
      );
    }
  };

  renderList = () => {
    if (this.state.current_robot < TOTAL_STEPS) {
      return (
        <List
          data={steps}
          renderItem={this.renderListItem}
          ItemSeparatorComponent={Divider}
        />
      );
    } else {
      return (
        <Layout
          style={{
            // alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            padding: 24,
          }}>
          <Image
            source={icons.profTheralovJumping}
            style={{
              // backgroundColor: 'red',
              flex: 1,
              width: '100%',
              resizeMode: 'contain',
            }}
          />
          <Layout style={{flex: 1}}>
            <Text category="h3" style={{paddingBottom: 12}}>
              ¡Felicitaciones!
            </Text>
            <Text category="h6" style={{paddingBottom: 12}}>
              ¡Completaste una nueva unidad del androide Thera!
            </Text>
            <Text category="h6" style={{paddingBottom: 12}}>
              ¿Te gustaría ensamblarlo y comenzar uno nuevo?
            </Text>
            <Button onPress={this._assemblyAndroid}>
              ¡Ensamblar androide!
            </Button>
          </Layout>
        </Layout>
      );
    }
  };

  render() {
    return (
      <React.Fragment>
        <TopNavigation
          title="Proyecto Thera"
          subtitle="¡Construí tu androide!"
          accessoryLeft={this.renderBackAction}
        />
        <Layout style={styles.statusContainer}>
          {this.renderStatusItem(this.state.credits, icons.microprocessor)}
          {this.renderStatusItem(
            `${this.currentStep()} de 8`,
            icons.cogwheelRobot,
          )}
          {this.renderStatusItem(this.state.robots, icons.robot)}
        </Layout>
        <Divider />
        {this.renderList()}
        <Modal
          style={{width: '80%'}}
          visible={this.state.showModal}
          backdropStyle={styles.backdrop}>
          {this.renderModalContent()}
        </Modal>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 16,
  },
  statusItem: {
    fontSize: 24,
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    padding: 8,
  },
  listItemAvatar: {
    flex: 1,
    alignSelf: 'center',
  },
  listItemContent: {
    color: 'grey',
    flex: 3,
    paddingHorizontal: 8,
  },
  listItemTitle: {
    // paddingHorizontal: 8,
    fontSize: 14,
  },
  listItemDescription: {
    color: 'grey',
    fontSize: 12,
  },
  listItemButton: {
    flex: 1,
    alignSelf: 'center',
  },
});

export default withStyles(ShopScreen);
