import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Utils, TYText, IconFont } from 'tuya-panel-kit';
import gateway from 'gateway';
import Strings from 'i18n/index';
import icons from 'icons/index';
import { formatPercent, getLedTypeIcon, getDpCodesByType, devInfo } from 'utils/index';

const { convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;
const defaultProps = {
  style: null,
  bright: 500,
  ledType: 'led',
  name: '',
  power: false,
  powerAll: true,
  controllType: 0,
  disabled: false,
};

type DefaultProps = {
  theme: any;
} & Readonly<typeof defaultProps>;
type IProps = {
  navigator: any;
} & DefaultProps;

@withTheme
export default class ItemButton extends React.Component<IProps> {
  static defaultProps: DefaultProps = defaultProps;
  handleClick = () => {
    const { power, controllType } = this.props;
    const { powerCode } = getDpCodesByType(controllType, devInfo.schema);
    gateway.putDpData({ [powerCode]: !power });
  };
  handleToPage = () => {
    this.props.navigator.push({
      id: 'dimmer',
      controllType: this.props.controllType,
    });
  };
  render() {
    const { style, powerAll, power, bright, name, ledType, theme } = this.props;
    const { fontColor, themeColor, boxBgColor, boxActiveBgColor, subFontColor } = theme.standard;
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: boxActiveBgColor,
            opacity: powerAll ? 1 : 0.4,
          },
          style,
        ]}
      >
        <TouchableOpacity activeOpacity={0.8} style={styles.titleBar} onPress={this.handleToPage}>
          <Image
            source={getLedTypeIcon(ledType, true)}
            style={[styles.icon, { opacity: power ? 1 : 0.4 }]}
          />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: cx(180) }}>
              <TYText numberOfLines={1} style={[styles.title, { color: fontColor }]}>
                {name}{' '}
              </TYText>
              <IconFont name="arrow" size={14} color={fontColor} />
            </View>
            <TYText style={[styles.bright, { color: subFontColor }]}>
              {Strings.formatValue(
                'bright_percent',
                formatPercent(bright, { min: 10, max: 1000, minPercent: 1 })
              )}
            </TYText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={this.handleClick}
          style={[styles.power, { backgroundColor: power ? themeColor : '#666' }]}
        >
          <IconFont d={icons.power} size={cx(18)} color={fontColor} />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: cx(16),
    paddingHorizontal: cx(24),
    paddingVertical: cx(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  titleBar: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  icon: {
    width: cx(32),
    height: cx(32),
    marginRight: cx(16),
  },
  title: {
    fontSize: 17,
  },
  power: {
    width: cx(40),
    height: cx(40),
    borderRadius: cx(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  bright: {
    fontSize: 14,
  },
});
