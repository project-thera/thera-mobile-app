import React from 'react';
import {Image, StyleSheet} from 'react-native';
import {Layout, Text} from '@ui-kitten/components';

export default class Word extends React.Component {

  // FIXME
  renderImage = () => {
    if (this.props.word) return (<Image style={styles.image} source={require("../../assets/images/animals/dog.png")} />);
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
