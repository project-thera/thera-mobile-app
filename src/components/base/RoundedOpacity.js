import React from 'react';
import {Image, StyleSheet, TouchableOpacity} from 'react-native';
import {Text} from '@ui-kitten/components';

export default class RoundedOpacity extends React.Component {
  renderIcon() {
    if (this.props.icon) {
      return <Image style={styles.icon} source={this.props.icon} />;
    }
  }
  renderText() {
    if (this.props.text) {
      return <Text style={styles.text}>{this.props.text}</Text>;
    }
  }
  render() {
    return (
      <TouchableOpacity
        style={styles.touchable}
        onPress={() => this.props.action()}>
        {this.renderIcon()}
        {this.renderText()}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  touchable: {
    alignItems: 'center',
    backgroundColor: 'rgba(100, 200, 200, 0.4)',
    borderRadius: 120,
    height: 240,
    justifyContent: 'center',
    marginBottom: 2,
    padding: 40,
    width: 240,
  },
  icon: {
    flex: 1,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
