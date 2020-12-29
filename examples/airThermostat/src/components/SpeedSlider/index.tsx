import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { Utils, TYText, IconFont, TYSdk } from 'tuya-panel-kit';
import Strings from 'i18n/index';
import icons from 'icons/index';
import NumberSlider from 'components/NumberSlider';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

interface IProp {
  code: string;
  speed: string;
  theme?: any;
  label?: string;
  onChange: (speed: string | undefined) => void;
}

interface State {
  speed: number;
  max: number;
}

class SpeedSlider extends PureComponent<IProp, State> {
  constructor(props: IProp) {
    super(props);
    let max = 0;
    let speed = 0;
    const { code, speed: sp } = this.props;
    const schema: any = TYSdk.device.getDpSchema(code);
    if (schema) {
      max = schema.range.length;
      schema.range.some((key: string, i: number) => {
        if (key === sp) {
          speed = i;
          return true;
        }
        return false;
      });
    }
    this.state = {
      speed,
      max,
    };
  }

  getEnumValue() {
    const { code } = this.props;
    const { speed } = this.state;
    const schema: any = TYSdk.device.getDpSchema(code);
    if (schema) {
      return schema?.range[speed];
    }
    return '';
  }

  handleChange = (v: number) => {
    this.setState({ speed: v - 1 });
    const { code, onChange } = this.props;
    const schema = TYSdk.device.getDpSchema(code);
    if (schema) {
      onChange(schema?.range[v - 1]);
    }
  };

  render() {
    const { theme, code, label } = this.props;
    const { speed, max } = this.state;
    const {
      global: { brand: themeColor, iconColor },
    } = theme;
    return (
      <View>
        <View style={styles.row}>
          <View style={styles.labelBox}>
            <IconFont d={icons.speed} size={14} color={iconColor} />
            <TYText style={styles.label}>{label || Strings.getDpLang(code)}</TYText>
          </View>
          <TYText style={[styles.value, { color: themeColor }]}>
            {Strings.getDpLang(code, this.getEnumValue())}
          </TYText>
        </View>
        <View style={styles.sliderBox}>
          <NumberSlider
            thumbLimitType="outer"
            trackSlideEnabled={true}
            clickEnabled={true}
            value={speed + 1}
            min={1}
            showMin={0}
            max={max}
            step={1}
            trackColor="#F7F7F7"
            tintColor={themeColor}
            style={styles.slider}
            trackStyle={styles.track}
            thumbStyle={styles.thumb}
            tintStyle={styles.trackTint}
            onRelease={this.handleChange}
            onPress={this.handleChange}
          >
            <View style={styles.scale}>
              {[...new Array(max + 1).keys()].map(i => {
                const isActive = i <= speed;
                return (
                  <View
                    key={i}
                    style={[
                      styles.line,
                      { backgroundColor: isActive ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.1)' },
                    ]}
                  />
                );
              })}
            </View>
          </NumberSlider>
        </View>
      </View>
    );
  }
}

export default withTheme(SpeedSlider);

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: cx(24),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 72,
  },
  labelBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: { fontSize: cx(15), marginLeft: cx(12) },
  value: { fontSize: cx(15) },
  scale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
  line: {
    height: 14,
    width: 1,
    backgroundColor: 'rgba(0,0,0,.05)',
  },
  sliderBox: {
    paddingHorizontal: cx(24),
    paddingBottom: cx(24),
  },
  slider: {
    height: 32,
  },
  track: {
    height: 32,
    borderRadius: 8,
  },
  trackTint: {
    height: 32,
    borderRadius: 8,
  },
  thumb: {
    width: cx(4),
    height: 16,
    borderRadius: 4,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,

    elevation: 20,
  },
});
