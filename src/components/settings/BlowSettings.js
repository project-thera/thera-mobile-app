import React from 'react';
import {IndexPath, Select, SelectItem, Text} from '@ui-kitten/components';

const blowConfigs = {
  '8KHz': {
    sampleRate: 8,
  },
  '12KHz': {
    sampleRate: 12,
  },
  '16KHz': {
    sampleRate: 16,
  },
};

export default class BlowSettings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      blowConfig: new IndexPath(0),
      loading: true,
    };
  }

  componentDidMount = async () => {
    let blowConfig = await this.props.database.getBlowConfig();

    let index = 0;

    if (blowConfig) {
      let key = `${blowConfig.sampleRate}KHz`;

      index = Object.keys(blowConfigs).indexOf(key);
    }

    this.setState({
      loading: false,
      blowConfig: new IndexPath(index),
    });
  };

  _setBlowConfig = (index) => {
    this.setState(
      {
        blowConfig: index,
      },
      async () => {
        await this.props.database.updateBlowConfig(this._getBlowConfig());
      },
    );
  };

  _getBlowConfig = () => {
    let key = Object.keys(blowConfigs)[this.state.blowConfig.row];

    return blowConfigs[key];
  };

  _renderBlowConfig = () => {
    return <Text>{Object.keys(blowConfigs)[this.state.blowConfig.row]}</Text>;
  };

  render() {
    return (
      <Select
        style={this.props.selectStyle}
        selectedIndex={this.state.blowConfig}
        onSelect={this._setBlowConfig}
        value={this._renderBlowConfig}>
        {Object.keys(blowConfigs).map((renderOption, key) => (
          <SelectItem title={renderOption} key={key} />
        ))}
      </Select>
    );
  }
}
