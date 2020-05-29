import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Text, ViewPropTypes, TouchableOpacity } from 'react-native';
import { Utils, IconFont } from 'tuya-panel-kit';
import icons from '../res/iconfont.json';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

export default class BlackModal extends Component {
  static propTypes = {
    style: ViewPropTypes.style,
    visible: PropTypes.any,
    faultText: Text.propTypes.style,
    textStyle: PropTypes.any,
    leftIcon: PropTypes.any,
    leftIconSize: PropTypes.number,
    rightIconSize: PropTypes.number,
    rightIcon: PropTypes.any,
  };

  static defaultProps = {
    style: {},
    visible: false,
    faultText: {},
    textStyle: {},
    leftIcon: icons.alarm,
    leftIconSize: cx(28),
    rightIconSize: cx(28),
    rightIcon: icons.close,
  };

  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {
      visible: props.visible || false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.visible !== nextProps.visible) {
      this.setState(
        {
          visible: nextProps.visible,
        },
        () => {
          nextProps.visible && this.show();
          !nextProps.visible && this.hide();
        }
      );
    }
  }

  onRequestClose = () => {
    this.hide();
  };

  setModalState = async flag => {
    await this.setState({ visible: flag });
  };

  show = () => {
    this.setModalState(true);
  };

  hide = () => {
    this.setModalState(false);
  };

  render() {
    const { visible } = this.state;
    const {
      style,
      faultText,
      textStyle,
      leftIcon,
      leftIconSize,
      rightIconSize,
      rightIcon,
    } = this.props;

    const FaultView = (
      <View style={[styles.faultContainer, style]}>
        <IconFont
          d={leftIcon || icons.alarm}
          color="#F56361"
          size={leftIconSize || cx(28)}
          // fill="#F56361"
          // stroke="#F56361"
        />
        <Text
          style={[
            styles.text,
            textStyle,
            {
              flex: 1,
              marginLeft: 6,
            },
          ]}
          numberOfLines={1}
        >
          {faultText}
        </Text>
        <TouchableOpacity activeOpacity={0.8} onPress={() => this.hide()}>
          <IconFont
            d={rightIcon || icons.close}
            size={rightIconSize || cx(28)}
            color="#B2ABA0"
            // fill="#fff"
            // stroke="#fff"
          />
        </TouchableOpacity>
      </View>
    );

    return visible ? FaultView : <View />;
  }
}

const styles = StyleSheet.create({
  faultContainer: {
    position: 'absolute',
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: cy(40),
    borderRadius: cx(8),
    width: cx(343),
    paddingHorizontal: cx(18),
    backgroundColor: '#FFF6E7',
  },

  text: {
    fontSize: cx(14),
    color: '#fff',
  },
});
