import React from 'react';
import {ImageBackground} from 'react-native';

export default class TriptychBackground extends React.Component {
  render() {
    return (
      <ImageBackground
        source={this.props.backgroundImage}
        style={[this.props.style, {flex: 1}]}>
        {this.props.children}
      </ImageBackground>
    );
  }
}
