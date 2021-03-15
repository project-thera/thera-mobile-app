import {AppState} from 'react-native';

export default (Superclass) =>
  class extends Superclass {
    state = {
      appState: AppState.currentState,
    };

    constructor(props) {
      super(props);
      console.log('HOLA');
      this._handleAppStateChange = this._handleAppStateChange.bind(this);
    }

    onBackground() {
      console.info('Background');
    }

    onForeground() {
      console.info('Foreground');
    }

    componentWillUnmount() {
      AppState.removeEventListener('change', this._handleAppStateChange);
    }

    componentDidMount() {
      console.log('MOUNTED');
      AppState.addEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
      console.log('HANDLE');
      if (
        this.state.appState.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        this.onBackground();
      } else {
        this.onForeground();
      }

      this.setState({appState: nextAppState});
    };
  };
