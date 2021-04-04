import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button, Divider, Layout, TopNavigation} from '@ui-kitten/components';

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <TopNavigation title="Thera Project" alignment="center" />
        <Divider />
        <Layout
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Button onPress={() => this.props.navigation.navigate('exercises')}>Ejercicios</Button>
          <Button onPress={() => this.props.navigation.navigate('lab')}>Enter the lab!</Button>
        </Layout>
      </SafeAreaView>
    );
  }
}
