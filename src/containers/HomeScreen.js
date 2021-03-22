import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button, Divider, Layout, TopNavigation} from '@ui-kitten/components';

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  navigateExercises = () => {
    this.props.navigation.navigate('Exercises');
  };

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <TopNavigation title="MyApp" alignment="center" />
        <Divider />
        <Layout
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Button onPress={this.navigateExercises}>Ejercicios</Button>
        </Layout>
      </SafeAreaView>
    );
  }
}
