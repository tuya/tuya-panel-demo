/* eslint-disable react/no-array-index-key */
import React, { FC, useMemo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/**
 * 计算圆周上点坐标
 * @param center 圆心坐标
 * @param radius 半径
 * @param center 顺时针偏角（弧度角）
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
  /** 圆半径 */
  radius: number;
  /** 起始偏角 */
  startRadian?: number;
  /** 颜色(数组或没有percent按等分处理) */
  colors: ColorsType;
}

const ColorCircle: FC<ColorCircleProps> = ({ style, radius = 0, startRadian = 0, colors = [] }) => {
  const colorDatas = useMemo(() => {
    const center = [radius, radius]; // 圆心坐标
    let cumulativeRadian = startRadian; // 偏角累加
    return colors.map(item => {
      const { color, percent } =
        typeof item === 'string' ? { color: item, percent: 1 / colors.length } : item;
      const radian = Math.PI * 2 * percent; // 当前part偏角
      const [startX, startY] = getCircleCoordinate(center, radius, cumulativeRadian); // 起始点坐标
      cumulativeRadian += radian;
      const [endX, endY] = getCircleCoordinate(center, radius, cumulativeRadian); // 结束点坐标
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

export default ColorCircle;
