import React from 'react';
import PropTypes from 'prop-types';
import { ColorPropType } from 'react-native';
import { TopBar as outTopBar, Utils, TYSdk } from 'tuya-panel-kit';
import exConnectTopbar from './ex-connect-topbar';
import Strings from '../../i18n';

const { isIos, convertX: cx } = Utils.RatioUtils;
const ExTopbar = exConnectTopbar(outTopBar);

// eslint-disable-next-line max-len
const TopBar = ({ title, color, barStyle, background, onBack, showBack, ...others } = {}) => {
  const leftActions = [
    {
      color: color || '#fff',
      name: isIos ? 'backIos' : 'backAndroid',
      onPress: onBack || TYSdk.native.back,
      spacing: 0,
      style: {
        left: 12,
      },
    },
  ];
  showBack &&
    leftActions.push({
      source: Strings.getLang('back'),
      onPress: onBack || TYSdk.native.back,
      contentStyle: { fontSize: cx(16), color: color || '#fff' },
    });
  return (
    <ExTopbar
      title={title}
      titleStyle={{ color, fontSize: cx(17), fontWeight: '500' }}
      color={color}
      background={background}
      barStyle={barStyle || (isIos ? 'light-content' : 'default')}
      {...others}
    />
  );
};

TopBar.propTypes = {
  title: PropTypes.string,
  barStyle: PropTypes.string,
  color: ColorPropType,
  background: ColorPropType,
  showBack: PropTypes.bool,
  onBack: PropTypes.func,
};

TopBar.defaultProps = {
  title: null,
  color: '#fff',
  barStyle: '',
  background: 'transparent',
  showBack: false,
  onBack: () => {},
};

TopBar.height = outTopBar.height;

export default TopBar;
