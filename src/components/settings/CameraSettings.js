import React from 'react';
import {IndexPath, Select, SelectItem, Text} from '@ui-kitten/components';

const cameraResolutions = {
  '720p': {
    height: 720,
    width: 1280,
  },
  '1080p': {
    height: 1080,
    width: 1920,
  },
};

export default class CameraSettings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cameraResolution: new IndexPath(0),
      loading: true,
    };
  }

  componentDidMount = async () => {
    let cameraResolution = await this.props.database.getCameraResolution();

    let index = 0;

    if (cameraResolution) {
      let key = `${cameraResolution.height}p`;

      index = Object.keys(cameraResolutions).indexOf(key);
    }

    this.setState({
      loading: false,
      cameraResolution: new IndexPath(index),
    });
  };

  _setCameraResolution = (index) => {
    this.setState(
      {
        cameraResolution: index,
      },
      async () => {
        await this.props.database.updateCameraResolution(
          this._getCameraResolution(),
        );
      },
    );
  };

  _getCameraResolution = () => {
    let key = Object.keys(cameraResolutions)[this.state.cameraResolution.row];

    return cameraResolutions[key];
  };

  _renderCameraResolution = () => {
    return (
      <Text>
        {Object.keys(cameraResolutions)[this.state.cameraResolution.row]}
      </Text>
    );
  };

  render() {
    return (
      <Select
        style={this.props.selectStyle}
        selectedIndex={this.state.cameraResolution}
        onSelect={this._setCameraResolution}
        value={this._renderCameraResolution}>
        {Object.keys(cameraResolutions).map((renderOption, key) => (
          <SelectItem title={renderOption} key={key} />
        ))}
      </Select>
    );
  }
}
