/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { SwitchButton } from 'tuya-panel-kit';

export default class BoolView extends Component {
  render() {
    return <SwitchButton {...this.props} />;
  }
}
