import React from 'react';
import {Image, StyleSheet} from 'react-native';
import {Layout, Text} from '@ui-kitten/components';

export default class Word extends React.Component {
  constructor(props) {
    super(props);

    // interpolation doesn't work with require
    this.state = {
      images: {
        'assets/images/animals/dog.png': require("../../assets/images/animals/dog.png"),
        'assets/images/animals/cat.png': require("../../assets/images/animals/cat.png")
      }
    }
  }

  renderImage = () => {
    if (this.props.word) return (<Image style={styles.image} source={this.getSource()} />);
  }

  getSource = () => {
    if (this.isImageBase64()) return { uri: this.props.image };

    return this.state.images[this.props.image];
  }

  isImageBase64 = () => {
    return this.props.image.startsWith('data:image/');
  }

  renderText = () => {
    if (this.props.word) return (<Text style={[styles.text, this.props.textStyle]}>{this.props.word}</Text>);
  }

  render() {
    return (
      <Layout style={[styles.container, this.props.containerStyle]}>
        { this.renderImage() }
        { this.renderText() }
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  image: {
    height: 120,
    width: 120,
  },
  text: {
    fontSize: 32,
    textAlign: 'center',
  },
});
