import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Image, PanResponder, ViewPropTypes } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import resource from '../../res';
import Color from '../../utils/color';

const { convertX } = Utils.RatioUtils;

export default class HuePicker extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    radius: PropTypes.number,
    bgImg: PropTypes.any,
    innerRadius: PropTypes.number,
    thumbRadius: PropTypes.number,
    touchThumbRadius: PropTypes.number, // thumb 可点击范围
    touchOffset: PropTypes.number, // 可击点范围偏移，用于加大可点击范围
    hue: PropTypes.number,
    onChange: PropTypes.func,
    onGrant: PropTypes.func,
    onMove: PropTypes.func,
    onRelease: PropTypes.func,
    onPress: PropTypes.func,
    style: ViewPropTypes.style,
  };

  static defaultProps = {
    disabled: false,
    radius: convertX(130),
    innerRadius: convertX(115),
    thumbRadius: convertX(15),
    bgImg: resource.hueBg,
    touchThumbRadius: 0,
    touchOffset: 0,
    hue: 0,
    onChange() {},
    onGrant() {},
    onMove() {},
    onRelease() {},
    onPress() {},
    style: null,
  };

  constructor(props) {
    super(props);

    this.initData(this.props);
    this.locked = false;

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleSetResponder,
      onMoveShouldSetPanResponder: () => this.locked,
      onPanResponderGrant: this.handleGrant,
      onPanResponderMove: this.handleMove,
      onPanResponderRelease: this.handleRelease,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!this.locked) {
      this.initData(nextProps);
    }
  }

  shouldComponentUpdate() {
    return !this.locked;
  }

  getLocation(e) {
    const { radius, innerRadius, thumbRadius } = this.props;
    const maxRadius = (radius + innerRadius) / 2 + thumbRadius;
    const { locationX, locationY } = e.nativeEvent;

    return { locationX: locationX - maxRadius, locationY: locationY - maxRadius };
  }

  initData(props) {
    const { radius, innerRadius, hue } = props;
    this.middleRadius = (radius + innerRadius) / 2;
    this.hue = hue;

    this.coor = this.hueToCoor(hue);
  }

  hueToCoor(hue) {
    const angle = (hue * Math.PI) / 180;
    const x = Math.cos(angle) * this.middleRadius;
    const y = -Math.sin(angle) * this.middleRadius;

    return { x, y };
  }

  hueToColor(hue) {
    return Color.hsv2hex(hue, 1000, 1000);
  }

  handleSetResponder = e => {
    if (this.props.disabled) {
      return;
    }
    const { radius, innerRadius, thumbRadius, touchThumbRadius, touchOffset } = this.props;
    const { locationX, locationY } = this.getLocation(e);
    const length = Math.sqrt(locationX ** 2 + locationY ** 2);

    // 是否为按中滑块
    const { x, y } = this.coor;
    const distance = Math.sqrt((locationX - x) ** 2 + (locationY - y) ** 2);
    const thumbTouchRadius = touchThumbRadius || thumbRadius;
    if (distance <= thumbTouchRadius) {
      this.locked = true;
      return true;
    }
    return length >= innerRadius - touchOffset && length <= radius + touchOffset;
  };

  handleGrant = () => {
    this.locked && this.props.onGrant(this.hue);
  };

  handleMoveThumb(dx, dy, listener) {
    const { middleRadius, coor } = this;
    let { x, y } = coor;
    x += dx;
    y += dy;
    const length = Math.sqrt(x ** 2 + y ** 2);
    let angle = Math.round((Math.acos(x / length) * 180) / Math.PI);
    if (y > 0) {
      angle = 360 - angle;
    }
    // 使用角度算出位置，避免精度丢失问题
    const rad = (angle * Math.PI) / 180;
    const thumbX = middleRadius * Math.cos(rad);
    const thumbY = -middleRadius * Math.sin(rad);

    this.hue = angle;
    this.thumbRef.setNativeProps({
      style: {
        backgroundColor: this.hueToColor(angle),
        transform: [
          {
            translate: [thumbX, thumbY],
          },
        ],
      },
    });

    this.props.onChange(angle);
    listener(angle);
    return { x: thumbX, y: thumbY };
  }

  handleMove = (e, { dx, dy }) => {
    this.locked && this.handleMoveThumb(dx, dy, this.props.onMove);
  };
  handleRelease = (e, { dx, dy }) => {
    const { locationX, locationY } = this.getLocation(e);
    if (this.locked) {
      this.coor = this.handleMoveThumb(dx, dy, this.props.onRelease);
    } else if (Math.abs(dx) < 3 && Math.abs(dy) < 3) {
      const { x, y } = this.coor;
      this.coor = this.handleMoveThumb(locationX - x, locationY - y, this.props.onPress);
    }
    this.locked = false;
  };
  render() {
    const { bgImg, radius, innerRadius, thumbRadius, style } = this.props;
    const size = radius * 2;
    const thumbSize = thumbRadius * 2;
    const coor = this.hueToCoor(this.hue);
    const maxSize = ((radius + innerRadius) / 2 + thumbRadius) * 2;
    return (
      <View
        style={[
          {
            width: maxSize,
            height: maxSize,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
      >
        <View
          style={{
            width: size,
            height: size,
          }}
        >
          <Image
            source={bgImg}
            style={{
              width: size,
              height: size,
            }}
          />
        </View>
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: maxSize,
            height: maxSize,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            ref={ref => (this.thumbRef = ref)}
            style={{
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbRadius,
              borderWidth: convertX(1),
              borderColor: '#fff',
              backgroundColor: this.hueToColor(this.hue),
              transform: [{ translate: [coor.x, coor.y] }],
            }}
          />
        </View>
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: maxSize,
            height: maxSize,
          }}
          {...this._panResponder.panHandlers}
          pointerEvents="box-only"
          accessibilityLabel="Light_Setting_CircleSlider"
        />
      </View>
    );
  }
}
