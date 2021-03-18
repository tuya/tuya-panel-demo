import color from 'color';
import React, { Component } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Slider, IconFont, Utils, TYText } from 'tuya-panel-kit';
import Strings from '@i18n';
import DpCodes from '../../config/dpCodes';
import icons from '../../res/iconfont';

const { convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;
const { sceneCode: sceneValueCode } = DpCodes;

interface SceneSpeedSelectorProps {
  style?: ViewStyle | ViewStyle[];
  isStatic: boolean;
  disabled: boolean;
  iconLeft?: string;
  iconRight?: string;
  value: number;
  onSlidingComplete: (value: number) => void;
  theme?: any;
}

interface SceneSpeedSelectorState {
  value: number;
}

class SceneSpeedSelector extends Component<SceneSpeedSelectorProps, SceneSpeedSelectorState> {
  constructor(props: SceneSpeedSelectorProps) {
    super(props);
    const { value } = this.props;
    this.state = {
      value,
    };
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps: SceneSpeedSelectorProps) {
    const { value } = this.props;
    if (value !== nextProps.value) {
      this.setState({ value: nextProps.value });
    }
  }

  shouldComponentUpdate(nextProps: SceneSpeedSelectorProps, nextState: SceneSpeedSelectorState) {
    const { disabled } = this.props;
    const { value } = this.state;
    return value !== nextState.value || disabled !== nextProps.disabled;
  }

  _handleValueChange = (value: number) => {
    this.setState({ value });
  };

  render() {
    const {
      style,
      disabled,
      iconLeft = icons.slow,
      iconRight = icons.fast,
      value,
      theme,
      onSlidingComplete,
      isStatic,
    } = this.props;
    const {
      global: { fontColor },
    } = theme;
    const dimColor = color(fontColor).alpha(0.3).rgbString();
    return (
      <View style={[styles.section, styles.section__flashSpeed, isStatic && { opacity: 0.3 }]}>
        <TYText style={[styles.text, { color: fontColor }]}>
          {Strings.getDpLang(sceneValueCode, 'flashSpeed')}
        </TYText>
        <View style={[styles.container, style]}>
          <View style={styles.iconfont__left}>
            <IconFont d={iconLeft} size={cx(28)} fill={fontColor} stroke={fontColor} />
          </View>
          <Slider
            accessibilityLabel="CustomScene_EditSpeed"
            style={styles.slider}
            // stepValue={20}
            disabled={disabled}
            canTouchTrack={true}
            minimumValue={40}
            maximumValue={100}
            maximumTrackTintColor={dimColor}
            minimumTrackTintColor={fontColor}
            thumbTintColor={fontColor}
            thumbStyle={styles.sliderThumb}
            trackStyle={styles.sliderTrack}
            onlyMaximumTrack={false}
            value={value}
            onValueChange={this._handleValueChange}
            onSlidingComplete={onSlidingComplete}
          />
          <View style={styles.iconfont__right}>
            <IconFont d={iconRight} size={cx(28)} fill={fontColor} stroke={fontColor} />
          </View>
        </View>
      </View>
    );
  }
}

export default withTheme(SceneSpeedSelector);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    fontSize: cx(14),
  },

  section: {
    marginTop: cx(20),
    backgroundColor: 'transparent',
  },

  section__flashSpeed: {
    marginHorizontal: cx(16),
  },

  iconfont__left: {
    flex: 1,
    alignItems: 'flex-start',
  },

  iconfont__right: {
    flex: 1,
    alignItems: 'flex-end',
  },

  slider: {
    width: cx(270),
    marginHorizontal: cx(8),
  },

  sliderTrack: {
    height: Math.max(3, cx(3)),
  },

  sliderThumb: {
    width: cx(28),
    height: cx(28),
    borderRadius: cx(14),
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
});
