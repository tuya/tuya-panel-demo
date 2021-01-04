import React, { PureComponent } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import createColor from 'color';
import { Utils, TYText, IconFont, Popup } from 'tuya-panel-kit';
import { connect } from 'react-redux';
import dpCodes from 'config/default/dpCodes';
import Strings from 'i18n/index';
import icons from 'icons/index';
import SpeedSetting from './SpeedSetting';

const { convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

const { powerCode, fanSpeedCode } = dpCodes;

interface IProp {
  power: boolean;
  speed: string;
  theme?: any;
}

class Speed extends PureComponent<IProp> {
  handleChange = () => {
    Popup.custom(
      {
        content: <SpeedSetting />,
        footer: <View />,
        title: <View />,
      },
      { mask: true }
    );
  };

  render() {
    const { speed, power, theme } = this.props;
    const {
      global: { brand: themeColor },
    } = theme;
    return (
      <View
        style={[
          styles.box,
          {
            opacity: power ? 1 : 0.4,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.btn,
            {
              borderColor: themeColor,
              backgroundColor: createColor(themeColor).alpha(0.1).rgbaString(),
            },
          ]}
          disabled={!power}
          onPress={this.handleChange}
          activeOpacity={0.5}
        >
          <TYText style={styles.label}>{Strings.getDpLang(fanSpeedCode)}</TYText>
          <TYText style={[styles.value, { color: themeColor }]}>
            {`·${Strings.getDpLang(fanSpeedCode, speed)}`}
          </TYText>
          <IconFont d={icons.arrow} size={14} color={themeColor} />
        </TouchableOpacity>
      </View>
    );
  }
}

export default connect(({ dpState, devInfo }: any) => ({
  power: dpState[powerCode],
  speed: dpState[fanSpeedCode],
}))(withTheme(Speed));

const styles = StyleSheet.create({
  box: {
    marginTop: cx(28),
    alignSelf: 'flex-start',
  },
  btn: {
    paddingHorizontal: cx(20),
    paddingVertical: cx(8),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderRadius: cx(30),
  },
  label: { fontSize: cx(14), marginRight: cx(4) },
  value: { fontSize: cx(14), marginRight: cx(6) },
});
