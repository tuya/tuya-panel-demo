/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { ColorPropType } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import Battery from './battery';

const { getTheme, ThemeConsumer } = Utils.ThemeUtils;

const ThemedBattery = props => {
  const { theme: localTheme, ...rest } = props;
  return (
    <ThemeConsumer>
      {globalTheme => {
        const theme = {
          battery: { ...globalTheme.battery, ...localTheme },
        };
        const propsWithTheme = { theme, ...rest };
        const themedProps = { batteryColor: getTheme(propsWithTheme, `battery.batteryColor`) };
        return <Battery {...themedProps} {...rest} />;
      }}
    </ThemeConsumer>
  );
};

ThemedBattery.propTypes = {
  ...Battery.propTypes,
  theme: PropTypes.shape({
    batteryColor: ColorPropType,
  }),
};

ThemedBattery.defaultProps = {
  theme: null,
};
export default ThemedBattery;
