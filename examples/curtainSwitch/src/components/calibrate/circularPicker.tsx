import React, { PureComponent } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';
import { Utils } from 'tuya-panel-kit';

const { inMaxMin } = Utils.NumberUtils;

/**
 * 角度转弧度
 * @param {number} degreeInAngle 角度
 */
const degree2rad = degreeInAngle => {
  return (degreeInAngle * Math.PI) / 180;
};

interface CircularPickerProps {
  style: StyleProp<ViewStyle>;
  degree: number;
  startDegree: number;
  endDegree: number;
  radius: number;
  frontStrokeColor: string;
  strokeColor: string;
  strokeWidth: number;
  disabled: boolean;
  strokeLinecap: string;
}

export default class CircularPicker extends PureComponent<CircularPickerProps> {
  constructor(props) {
    super(props);
    const { radius } = props;
    this._thumbRadius = this.getThumbRadius(props);
    this._centerPoint = radius + this._thumbRadius;
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps) {
    const { radius, strokeWidth } = this.props;
    const { radius: nextRadius, strokeWidth: nextStrokeWidth } = nextProps;
    if (radius !== nextRadius || strokeWidth !== nextStrokeWidth) {
      this._thumbRadius = this.getThumbRadius(nextProps);
      this._centerPoint = radius + this._thumbRadius;
    }
  }

  getThumbRadius(props) {
    const { thumbStyle, strokeWidth } = props;
    const { width: thumbWidth } = StyleSheet.flatten([thumbStyle]);
    const thumbRadius = thumbWidth ? thumbWidth / 2 : strokeWidth * 0.5 + 2;
    return thumbRadius;
  }

  // 通过角度得到弧长
  getArcLengthByDegree(degree) {
    const { radius } = this.props;
    // 弧长 = 半径 * 弧度
    return degree2rad(degree) * radius;
  }

  _thumbRadius: number;

  _centerPoint: number;

  _renderTrack() {
    const {
      degree,
      radius,
      frontStrokeColor,
      strokeColor,
      strokeWidth,
      strokeLinecap,
      startDegree,
      endDegree,
    } = this.props;
    const size = this._centerPoint * 2;
    // strokeDashoffset从三点钟方向开始
    // 我们在这把他转为从底部六点钟开始
    const degreeOffset = -90 - startDegree;
    const endDegreeDiff = endDegree - startDegree;
    const degreeDiff = inMaxMin(startDegree, endDegree, degree) - startDegree;
    const commonCircleProps = {
      cx: this._centerPoint,
      cy: this._centerPoint,
      r: radius,
      fill: 'transparent',
      strokeWidth,
      strokeLinecap,
      strokeDashoffset: this.getArcLengthByDegree(degreeOffset),
    };
    return (
      <Svg width={size} height={size}>
        <G>
          <Circle
            {...commonCircleProps}
            stroke={strokeColor}
            strokeDasharray={[
              this.getArcLengthByDegree(endDegreeDiff),
              this.getArcLengthByDegree(360 - endDegreeDiff),
            ]}
          />
          {frontStrokeColor && (
            <Circle
              {...commonCircleProps}
              stroke={frontStrokeColor}
              strokeDasharray={[
                this.getArcLengthByDegree(degreeDiff),
                this.getArcLengthByDegree(360 - degreeDiff),
              ]}
            />
          )}
        </G>
      </Svg>
    );
  }

  render() {
    const { style } = this.props;
    return (
      <View
        style={[
          style,
          {
            width: this._centerPoint * 2,
            height: this._centerPoint * 2,
          },
        ]}
      >
        {/* 轨道 */}
        {this._renderTrack()}
      </View>
    );
  }
}
