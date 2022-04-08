import React from 'react';
import {Text} from '@ui-kitten/components';

export default function (props) {
  if (props.error) {
    return {
      caption: <Text status="danger">{props.error[0]}</Text>,
      status: 'danger',
    };
  } else {
    return {};
  }
}
