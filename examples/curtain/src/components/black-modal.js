import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, ViewPropTypes } from 'react-native';
import { Utils } from 'tuya-panel-kit';

const { convertX: cx } = Utils.RatioUtils;

export default class BlackModal extends Component {
  static propTypes = {
    style: ViewPropTypes.style,
    disable: PropTypes.bool,
    children: PropTypes.node,
  };

  static defaultProps = {
    style: {},
    disable: false,
    children: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      visible: false,
    };

    this.showTimer = null;
  }

  onRequestClose = () => {
    this.hide();
  };

  setModalState = async flag => {
    await this.setState({ visible: flag });
  };

  show = () => {
    clearTimeout(this.showTimer);
    this.setModalState(true);
    this.showTimer = setTimeout(() => {
      this.hide();
    }, 2000);
  };

  hide = () => {
    this.setModalState(false);
  };

  render() {
    const { visible } = this.state;
    const { disable } = this.props;

    if (!(visible && !disable)) {
      return <View />;
    }

    return <View style={[styles.container, this.props.style]}>{this.props.children}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: cx(110),
    height: cx(110),
    backgroundColor: '#000',
    borderRadius: cx(7),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
