/* eslint-disable react/destructuring-assignment */
import React, { PureComponent } from 'react';
import colors from 'color';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Utils, IconFont } from 'tuya-panel-kit';
import Icons from '@res/icons';
import { getCircleColor } from '@utils';
import { ColorUnitsProps } from '@types';

const { convertX: cx } = Utils.RatioUtils;
const WHITE = '#FFFFFF';

class WeelCircles extends PureComponent<ColorUnitsProps> {
  render() {
    const {
      themeColor,
      isDark,
      circleArr,
      maxCircleNum = 8,
      minCircleNum = 2,
      selectCircle,
    } = this.props;
    const topColor = isDark ? WHITE : themeColor;
    const circleBg = colors(isDark ? '#222222' : themeColor)
      .alpha(isDark ? 1 : 0.1)
      // @ts-ignore
      .rgbaString();
    const circleData = [...circleArr, 'plus', 'delete']
      // eslint-disable-next-line array-callback-return
      .map((d: string) => {
        if (
          (d !== 'plus' && d !== 'delete') ||
          (d === 'plus' && circleArr.length < maxCircleNum) ||
          (d === 'delete' && circleArr.length > minCircleNum)
        )
          return d;
      })
      .filter(d => !!d);
    return (
      <View style={styles.content}>
        <View style={styles.colorCircle}>
          {circleData.map((c: any, idx: number) => {
            const circleColor = getCircleColor(c);
            return (
              <View
                key={`${c}_${idx + 1}`}
                style={[
                  styles.circleBorder,
                  {
                    borderColor: selectCircle === idx ? topColor : 'transparent',
                  },
                ]}
              >
                <TouchableOpacity
                  key={`${c}_${idx + 1}`}
                  style={[
                    styles.circleContent,
                    {
                      backgroundColor: c === 'plus' || c === 'delete' ? circleBg : circleColor,
                    },
                    selectCircle === idx
                      ? { width: cx(22), height: cx(22), borderRadius: cx(11) }
                      : {},
                  ]}
                  onPress={() => {
                    this.props.handleToSetCircle?.(c, idx);
                  }}
                >
                  {(c === 'plus' || c === 'delete') && (
                    <IconFont d={Icons[c]} size={c === 'plus' ? cx(14) : cx(28)} color={topColor} />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
  },
  colorCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: cx(6),
  },
  circleContent: {
    width: cx(28),
    height: cx(28),
    borderRadius: cx(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBorder: {
    width: cx(28),
    height: cx(28),
    borderRadius: cx(14),
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: cx(9),
    marginBottom: cx(9),
  },
});

export default WeelCircles;
