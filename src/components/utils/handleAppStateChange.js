export default function (nextAppState) {
  if (
    this.state.appState.match(/inactive|background/) &&
    nextAppState === 'active'
  ) {
    this.onForeground(nextAppState);
  } else {
    this.onBackground(nextAppState);
  }

  this.setState({appState: nextAppState});
}
