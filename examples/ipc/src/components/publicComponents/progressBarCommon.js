/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Image } from 'react-native';
import { TYText, Slider } from 'tuya-panel-kit';
import Config from '../../config';
import { numberToPecent } from '../../utils';

const { cx } = Config;

class ProgressBarCommon extends React.Component {
  static propTypes = {
    barData: PropTypes.object.isRequired,
    handleLightValue: PropTypes.func.isRequired,
    dragLightValue: PropTypes.func.isRequired,
    onLayout: PropTypes.func,
    theme: PropTypes.shape({
      fontColor: PropTypes.string,
    }),
  };
  static defaultProps = {
    // eslint-disable-next-line react/default-props-match-prop-types
    barData: {},
    theme: {
      fontColor: '#fff',
    },
    onLayout: e => {},
  };
  constructor(props) {
    super(props);
    this.state = {};
  }
  onSliderValueChange = (value, dpCode) => {
    this.props.dragLightValue(Math.round(value), dpCode);
    this.getPercent();
  };
  onSliderComplete = (value, dpCode) => {
    this.props.handleLightValue(Math.round(value), dpCode);
    this.getPercent();
  };
  getPercent = (value, min, max) => {
    return `${numberToPecent(value, min, max)}%`;
  };
  render() {
    const { barData } = this.props;
    return (
      <View style={styles.progressBarCommonPage}>
        <View style={styles.container}>
          <View style={styles.iconTitle}>
            {barData.iconTitle !== undefined ? (
              <TYText style={{ fontSize: cx(12), color: barData.disabled ? '#aeaeae' : '#333' }}>
                {barData.iconTitle}
              </TYText>
            ) : (
              <Image
                source={barData.iconImage}
                style={[styles.iconImage, { tintColor: barData.disabled ? '#aeaeae' : '#333' }]}
              />
            )}
          </View>
          <Slider
            onLayout={e => {
              this.props.onLayout(e);
            }}
            style={styles.slider}
            canTouchTrack={true}
            maximumValue={barData.max}
            minimumValue={barData.min}
            stepValue={barData.stepValue}
            disabled={barData.disabled}
            onlyMaximumTrack={barData.onlyMaximumTrack}
            maximumTrackTintColor={barData.disabled ? '#eee' : barData.maxColor}
            minimumTrackTintColor={barData.disabled ? '#eee' : barData.minColor}
            renderMaximumTrack={barData.renderMaximumTrack}
            // renderThumb={barData.renderThumb}
            // thumbTintColor={'#fff' || barData.thumbTintColor}
            thumbStyle={[styles.sliderThumb, barData.thumbStyle]}
            trackStyle={barData.trackStyle}
            value={barData.dpValue}
            onValueChange={value => this.onSliderValueChange(value, barData.key)}
            onSlidingComplete={value => this.onSliderComplete(value, barData.key)}
          />
          {barData.hasUnit && (
            <View style={styles.percentBox}>
              <TYText
                numberOfLines={1}
                style={(styles.percent, { color: barData.disabled ? '#aeaeae' : '#333' })}
              >
                {numberToPecent(barData.dpValue, barData.min, barData.max)}
              </TYText>
            </View>
          )}
          {!barData.hasUnit && !barData.noPercent && barData.rightImage && (
            <View style={styles.rightImageBox}>
              <Image
                source={barData.rightImage}
                style={[styles.iconImage, { tintColor: barData.disabled ? '#aeaeae' : undefined }]}
              />
            </View>
          )}
          {barData.noPercent && (
            <View style={styles.noPercentBox}>
              <TYText
                numberOfLines={1}
                style={(styles.percent, { color: barData.disabled ? '#aeaeae' : '#333' })}
              >
                {barData.dpValue}
              </TYText>
            </View>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  progressBarCommonPage: {
    height: cx(56),
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTitle: {
    width: cx(40),
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  slider: {
    flex: 1,
    marginLeft: cx(8),
    marginRight: cx(5),
  },
  sliderThumb: {
    backgroundColor: '#fff',
    width: cx(30),
    height: cx(30),
    borderRadius: cx(15),
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: {
      width: 3,
      height: 5,
    },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  percentBox: {
    minWidth: cx(40),
  },
  rightImageBox: {
    minWidth: cx(40),
    marginLeft: cx(3),
  },
  noPercentBox: {
    minWidth: cx(20),
  },
  percent: {
    fontSize: cx(12),
  },
});

export default ProgressBarCommon;
