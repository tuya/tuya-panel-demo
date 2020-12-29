import { Utils, TYText, TYSdk, IconFont } from 'tuya-panel-kit';
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import NumberSlider from 'components/NumberSlider';
import Strings from 'i18n/index';

const { convertY: cy, convertX: cx } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

interface Props {
  icon: string;
  code: string;
  value: number;
  theme?: any;
  style?: any;
  editDisabled?: boolean;
  onChange?: (v: number) => void;
}

class ValueSlider extends PureComponent<Props> {
  percentRef: TYText;

  handleChange = (v: number) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.percentRef && this.percentRef.setText(v);
  };

  render() {
    const { icon, theme, style, code, value, onChange, editDisabled } = this.props;
    const {
      global: { brand: themeColor, fontColor },
    } = theme;
    const schema = TYSdk.device.getDpSchema(code);
    return (
      <View style={[styles.box, style]}>
        <View style={styles.info}>
          <View style={styles.labelBox}>
            <IconFont d={icon} size={14} color={fontColor} />
            <TYText style={styles.label}>{Strings.getDpLang(code)}</TYText>
          </View>
          <View style={styles.valueBox}>
            <TYText
              style={[styles.value, { color: themeColor }]}
              ref={(ref: TYText) => (this.percentRef = ref)}
            >
              {value}
            </TYText>
            <TYText style={[styles.unit, { color: themeColor }]}>{schema.unit}</TYText>
          </View>
        </View>
        {!editDisabled && (
          <NumberSlider
            value={value}
            min={schema.min}
            max={schema.max}
            step={schema.step}
            style={styles.slider}
            trackColor="#f7f7f7"
            tintColor={themeColor}
            thumbStyle={styles.thumb}
            trackStyle={styles.track}
            onRelease={onChange}
            onPress={onChange}
          />
        )}
      </View>
    );
  }
}
export default withTheme(ValueSlider);

const styles = StyleSheet.create({
  box: {
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    paddingHorizontal: cx(24),
  },
  slider: {
    marginBottom: cx(24),
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
