import { Utils, TYText } from 'tuya-panel-kit';
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import NumberSlider from 'components/NumberSlider';

const { convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  theme?: any;
  style?: any;
  onChange: (v: number) => void;
}

class Item extends PureComponent<Props> {
  percentRef: TYText;
  handleChange = (v: number) => {
    this.percentRef && this.percentRef.setText(v);
  };
  render() {
    const { theme, style, label, value, unit, min, max, onChange, step } = this.props;
    const {
      global: { brand: themeColor },
    } = theme;
    return (
      <View style={[styles.box, style]}>
        <View style={styles.info}>
          <View style={styles.labelBox}>
            <View style={[styles.dot, { backgroundColor: themeColor }]} />
            <TYText style={styles.label}>{label}</TYText>
          </View>
          <View style={styles.valueBox}>
            <TYText
              style={[styles.value, { color: themeColor }]}
              ref={(ref: TYText) => (this.percentRef = ref)}
            >
              {value}
            </TYText>
            <TYText style={[styles.unit, { color: themeColor }]}>{unit}</TYText>
          </View>
        </View>
        <NumberSlider
          value={value}
          min={min}
          max={max}
          step={step}
          trackColor="#f7f7f7"
          tintColor={themeColor}
          thumbStyle={styles.thumb}
          trackStyle={styles.track}
          onRelease={onChange}
          onPress={onChange}
          onChange={this.handleChange}
        />
      </View>
    );
  }
}
export default withTheme(Item);

const styles = StyleSheet.create({
  box: {
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    paddingHorizontal: cx(20),
    paddingBottom: cx(24),
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 72,
  },
  labelBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dot: {
    width: cx(7),
    height: cx(7),
    borderRadius: cx(4),
  },
  label: {
    fontSize: 16,
    marginLeft: cx(12),
  },
  valueBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 14,
  },
  unit: {
    marginLeft: 4,
    fontSize: 14,
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  thumb: {
    width: cx(26),
    height: cx(26),
    borderRadius: cx(13),
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 3,
  },
});
