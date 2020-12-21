/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TopBar, TYSdk } from 'tuya-panel-kit';

const backIcon = 'backIos';
interface HeadBarProps {
  title: string;
  page: string;
  pan: boolean;
}
export default class HeadBar extends Component<HeadBarProps, any> {
  static propTypes = {
    page: PropTypes.string,
    title: PropTypes.string,
    onClick: PropTypes.func,
    pan: PropTypes.bool,
    onLeftClick: PropTypes.func,
    bgColor: PropTypes.string,
  };
  static defaultProps = {
    page: '',
    title: '',
    bgColor: '#fff',
    pan: false,
    onClick: () => {},
  };
  constructor(props: any) {
    super(props);
  }
  componentDidMount() {}
  getActionInfo() {
    let topBarConfig = [
      {
        name: 'pen',
        color: '#000',
        onPress: () => TYSdk.native.showDeviceMenu(),
      },
    ];

    topBarConfig = !this.props.pan ? topBarConfig : [];
    return topBarConfig;
  }
  getActionLeftInfo() {
    let topBarConfig = [
      {
        name: backIcon,
        onPress: () => TYSdk.Navigator.pop(),
      },
    ];
    return topBarConfig;
  }
  back = () => {
    if (this.props.page === 'home') {
      TYSdk.native.back();
    } else {
      TYSdk.Navigator.pop();
    }
  };

  render() {
    const data = this.getActionInfo();
    const leftData = this.getActionLeftInfo();
    return (
      <TopBar
        style={{ alignSelf: 'stretch' }}
        title={this.props.title === '' ? TYSdk.devInfo.name : this.props.title}
        color="#000"
        actions={data}
        leftActions={leftData}
        onBack={() => this.back()}
      />
    );
  }
}
