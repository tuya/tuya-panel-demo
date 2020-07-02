import React from 'react';
import { View, StyleSheet, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { Utils, TYText, IconFont } from 'tuya-panel-kit';
import BrightSlider from 'components/BrightSlider';
import Strings from 'i18n/index';
import icons from 'icons/index';
import { isCapability, formatPercent } from 'utils/index';

const { convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

const defaultProps = {
  onPower() {},
  onLayout(e: LayoutChangeEvent) {},
  onChangeBright(v: number) {},
  onCompleteBright(v: number) {},
  bright: 500,
  minBright: 10,
  maxBright: 1000,
  power: false,
  brightEnabled: false,
};

type DefaultProps = Readonly<typeof defaultProps>;
type IProps = {
  style?: any;
  theme: any;
} & DefaultProps;

@withTheme
export default class TotalControl extends React.Component<IProps> {
  static defaultProps: DefaultProps = defaultProps;
  private percentRef: React.ReactNode;
  handleChangeBright = (v: number) => {
    // @ts-ignore
    this.percentRef.setText(
      Strings.formatValue('total_bright', formatPercent(v, { min: 10, max: 1000, minPercent: 1 }))
    );
    // signmesh 下不连续下发
    if (!isCapability(15)) {
      this.props.onChangeBright(v);
    }
  };
  handleChangeEnd = (v: number) => {
    // @ts-ignore
    this.percentRef.setText(
      Strings.formatValue('total_bright', formatPercent(v, { min: 10, max: 1000, minPercent: 1 }))
    );
    this.props.onCompleteBright(v);
  };
  render() {
    const {
      style,
      onPower,
      power,
      bright,
      onLayout,
      brightEnabled,
      minBright,
      maxBright,
      theme,
    } = this.props;
    const { fontColor, themeColor, boxBgColor, boxActiveBgColor, subFontColor } = theme.standard;
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: boxActiveBgColor,
          },
          style,
        ]}
        onLayout={onLayout}
      >
        <View style={styles.titleBar}>
          <TYText style={[styles.title, { color: fontColor }]}>
            {Strings.getLang('total_control')}
          </TYText>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPower}
            style={[styles.power, { backgroundColor: power ? themeColor : '#666' }]}
          >
            <IconFont d={icons.power} size={cx(18)} color={fontColor} />
          </TouchableOpacity>
        </View>
        <TYText
          ref={ref => (this.percentRef = ref)}
          style={[styles.bright, { color: subFontColor, opacity: power ? 1 : 0.4 }]}
        >
          {Strings.formatValue(
            'total_bright',
            formatPercent(bright, { min: 10, max: 1000, minPercent: 1 })
          )}
        </TYText>
        <BrightSlider
          // 很次重建节点，确保min,max的变化未能正常显示滑块
          key={minBright + maxBright}
          style={{ opacity: brightEnabled ? 1 : 0.4 }}
          disabled={!brightEnabled}
          width={cx(303)}
          value={bright}
          min={minBright}
          max={maxBright}
          onSlidingComplete={this.handleChangeEnd}
          onValueChange={this.handleChangeBright}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: cx(16),
    padding: cx(24),
    alignItems: 'flex-start',
  },
  titleBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginTop: cx(12),
    marginBottom: cx(8),
    fontSize: 14,
  },
});
