import React from 'react';
import {StyleSheet} from 'react-native';
import {Button, Card, Layout, Modal, Text} from '@ui-kitten/components';

export default class ShopModal extends React.Component {
  renderHeader = (headerProps) => (
    <Layout {...headerProps}>
      <Text category="h6">ShopModal</Text>
      <Text category="s1">by Alan Theralov</Text>
    </Layout>
  );

  renderFooter = (footerProps) => (
    <Layout {...footerProps}>
      <Button onPress={this.props.onBackdropPress}>Cerrar</Button>
    </Layout>
  );

  render() {
    return (
      <Modal {...this.props} backdropStyle={styles.backdrop}>
        <Card
          disabled={true}
          header={this.renderHeader}
          footer={this.renderFooter}>
          <Text>Here you buy stuff to complete your android!</Text>
        </Card>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
