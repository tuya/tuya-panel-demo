/* eslint-disable new-cap */
import React, { Component } from 'react';
import Color from 'color';
import { Svg, Path, G } from 'react-native-svg';
import { Utils } from 'tuya-panel-kit';
import { IArrowProps, IArrowState, defaultArrowProps } from './interface';

const { convertX: cx } = Utils.RatioUtils;

const lineWidth = cx(38);
const lineHeight = 12;
const halfWidth = lineWidth / 2;

export default class Arrow extends Component<IArrowProps, IArrowState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps: IArrowProps = defaultArrowProps;

  constructor(props: IArrowProps) {
    super(props);
    const { deep = 0 } = this.props;
    this.state = { deep };
  }

  getColor() {
    const { deep } = this.state;
    const { color, tintColor } = this.props;
    const colorStart = Color(color).rgbArray();
    const colorEnd = Color(tintColor).rgbArray();
    const colorStartAlpha = Color(color).alpha();
    const colorEndAlpha = Color(tintColor).alpha();
    const colorR = colorStart[0] + (colorEnd[0] - colorStart[0]) * deep;
    const colorG = colorStart[1] + (colorEnd[1] - colorStart[1]) * deep;
    const colorB = colorStart[2] + (colorEnd[2] - colorStart[2]) * deep;
    const colorA = colorStartAlpha + (colorEndAlpha - colorStartAlpha) * deep;

    return Color('#000').rgb(colorR, colorG, colorB, colorA).rgbaString();
  }

  getPath() {
    const { deep } = this.state;
    const x1 = -cx(17);
    const x2 = -x1;
    const y = deep * 8;
    return `M${x1} 0 L0 ${y} L${x2} 0`;
  }

  update(deep: number) {
    this.setState({ deep });
  }

  render() {
    return (
      <Svg width={lineWidth} height={lineHeight} viewBox={`0 0 ${lineWidth} ${lineHeight}`}>
        <G x={halfWidth} y={2}>
          <Path
            d={this.getPath()}
            fill="transparent"
            strokeWidth={4}
            stroke={this.getColor()}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </Svg>
    );
  }
}
