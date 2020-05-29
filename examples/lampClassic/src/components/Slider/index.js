import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, ViewPropTypes } from 'react-native';
import { Slider as SliderBase, IconFont, TYText, Utils } from 'tuya-panel-kit';

const { convertX, convertY } = Utils.RatioUtils;
const {
  ThemeUtils: { withTheme },
} = Utils;

class Slider extends React.Component {
  static propTypes = {
    icon: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
    value: PropTypes.number,
    style: ViewPropTypes.style,
    onGrant: PropTypes.func,
    onMove: PropTypes.func,
    onRelease: PropTypes.func,
    formatPercent: PropTypes.func,
    accessibilityLabel: PropTypes.string,
    theme: PropTypes.any.isRequired,
  };
  static defaultProps = {
    icon: '',
    min: 0,
    max: 1000,
    value: 500,
    style: {},
    onGrant() {},
    onMove() {},
    onRelease() {},
    formatPercent: null,
    accessibilityLabel: 'Slider',
  };
  constructor(props) {
    super(props);

    const value = this.formatValue(this.props.value);
    this.state = {
      value,
      percent: this.countPercent(value),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      const value = this.formatValue(nextProps.value);
      this.setState({ value, percent: this.countPercent(value) });
    }
  }

  formatValue(value) {
    const { min, max } = this.props;
    if (value < min) {
      return min;
    } else if (value > max) {
      return max;
    }
    return value;
  }
  countPercent(value) {
    if (this.props.formatPercent) {
      return this.props.formatPercent(value);
    }
    const { min, max } = this.props;
    const rate = (value - min) / (max - min);
    return Math.floor(rate * 100);
  }
  handleMove = value => {
    const newValue = this.formatValue(value);
    const percent = this.countPercent(newValue);
    this.percentRef.setText(`${percent}%`);
    this.props.onMove(newValue);
  };
  handleRelease = value => {
    const newValue = this.formatValue(value);
    const percent = this.countPercent(newValue);
    this.percentRef.setText(`${percent}%`);
    this.props.onRelease(newValue);
  };
  render() {
    const { icon, min, max, style, onGrant, accessibilityLabel, theme } = this.props;
    const { value, percent } = this.state;
    return (
      <View style={[styles.container, style]}>
        <IconFont d={icon} size={convertX(18)} color={theme.fontColor} />
        <SliderBase
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          stepValue={1}
          canTouchTrack={true}
          value={value}
          thumbStyle={{ width: convertX(18), height: convertX(18) }}
          trackStyle={{ height: convertX(2), borderRadius: convertX(1) }}
          onSlidingStart={onGrant}
          onValueChange={this.handleMove}
          onSlidingComplete={this.handleRelease}
          accessibilityLabel={accessibilityLabel}
        />
        <TYText ref={ref => (this.percentRef = ref)} style={[styles.percent]}>
          {percent}%
        </TYText>
      </View>
    );
  }
}

export default withTheme(Slider);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: convertX(44),
  },
  slider: {
    width: convertX(250),
    marginLeft: convertX(19),
    marginRight: convertX(8),
  },
  percent: {
    fontSize: convertX(10),
    color: '#fff',
    backgroundColor: 'transparent',
    textAlign: 'center',
    width: convertX(40),
  },
});
