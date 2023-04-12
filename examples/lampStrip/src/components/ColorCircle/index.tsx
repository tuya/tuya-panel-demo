/* eslint-disable max-len */

/* eslint-disable react/no-array-index-key */
import React, { FC, useMemo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/**
 * Calculate the coordinates of points on the circumference
 * @param center Center coordinates
 * @param radius radius
 * @param angle Clockwise deviation angle (radian)
 */
function getCircleCoordinate(center: number[], radius: number, angle: number) {
  const [x, y] = center;
  return [x + radius * Math.sin(angle), y - radius * Math.cos(angle)];
}

export interface ColorDataType {
  color: string;
  percent: number;
}

export type ColorsType = string[] | ColorDataType[];

export interface ColorCircleProps {
  style?: StyleProp<ViewStyle>;
  /** Circle radius */
  radius: number;
  /** Starting deviation angle */
  startRadian?: number;
  /** Color (array or no percent is treated as equal parts) */
  colors: ColorsType;
}

const ColorCircle: FC<ColorCircleProps> = ({ style, radius = 0, startRadian = 0, colors = [] }) => {
  const colorDatas = useMemo(() => {
    const center = [radius, radius]; // Center coordinates
    let cumulativeRadian: number = startRadian; // Accumulated deviation angle
    return colors.map(item => {
      const { color, percent } =
        typeof item === 'string' ? { color: item, percent: 1 / colors.length } : item;
      const radian = Math.PI * 2 * percent; // Current part deviation angle
      const [startX, startY] = getCircleCoordinate(center, radius, cumulativeRadian); // Starting point coordinates
      cumulativeRadian += radian;
      const [endX, endY] = getCircleCoordinate(center, radius, cumulativeRadian); // End point coordinates
      return {
        color,
        center,
        startX,
        startY,
        endX,
        endY,
      };
    });
  }, [radius, startRadian, colors]);

  return (
    <Svg style={style} height={radius * 2} width={radius * 2}>
      {colorDatas.map(({ color, center, startX, startY, endX, endY }, index) => (
        <Path
          key={index}
          d={`M ${center[0]} ${center[1]} L ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY} Z`}
          stroke="none"
          strokeWidth={0}
          fill={color}
        />
      ))}
    </Svg>
  );
};
ColorCircle.defaultProps = {
  style: {},
  startRadian: 0,
};
export default ColorCircle;
