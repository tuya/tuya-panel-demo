import _ from 'lodash';
import { Rect } from 'react-native-svg';
import { connect } from 'react-redux';
import colors from 'color';
import React, { Component } from 'react';
import {
  Utils,
  TYSdk,
  TYText,
  Slider as OldSliderBase,
  UnitText,
  LinearGradient,
} from 'tuya-panel-kit';
import { View, StyleSheet, Image, ImageBackground } from 'react-native';
import Res from '../../res';
import Strings from '../../i18n';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;
const { calcPosition } = Utils.NumberUtils;
const TYDevice = TYSdk.device;
const TYEvent = TYSdk.event;

interface SlidersProps {
  themeColor: any;
  dpState: any;
  isDefault: boolean;
}

interface SlidersState {
  valueState: boolean;
}

class Sliders extends Component<SlidersProps, SlidersState> {
  constructor(props: SlidersProps) {
    super(props);
    const schema = TYDevice.getDpSchema();
    this.percents = _.filter(schema, d => /^percent_control/.test(d.code));
    this.state = {
      valueState: false,
    };
    TYEvent.on('deviceDataChange', this.dpDataChange);
  }

  componentWillUnmount() {
    TYEvent.off('deviceDataChange', this.dpDataChange);
  }

  percents: any;

  _handleToControl = (code: string, value: number) => {
    const data: any = { [code]: value };
    TYDevice.putDeviceData(data);
  };

  dpDataChange = (data: any) => {
    const { valueState } = this.state;
    const { type, payload } = data;
    if (type === 'dpData') {
      const arr = Object.keys(payload);
      if (arr.indexOf('percent_control') !== -1 || arr.indexOf('percent_control_2') !== -1) {
        this.setState({
          valueState: !valueState,
        });
      }
    }
  };

  renderItemControl = () => {
    const { themeColor, isDefault, dpState } = this.props;
    const color = colors(isDefault ? '#FFFFFF' : '#000000')
      .alpha(0.6)
      .rgbString();
    return this.percents.map((data: any, index: number) => {
      const { code } = data;
      const { step, min = 0, max = 100 } = TYDevice.getDpSchema(code);
      const values = dpState[code];
      const percent = calcPosition(values, min, max, 0, 100);
      const name = Strings.getLang(`precent_${index}`);
      return (
        <View style={styles.itemContent} key={code}>
          <View
            style={{
              paddingRight: cx(5),
              paddingLeft: cx(5),
              width: cx(60),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TYText style={[styles.controlTxt, { color }]} numberOfLines={2}>
              {name}
            </TYText>
          </View>
          <OldSliderBase
            // eslint-disable-next-line react/no-array-index-key
            key={`key_${values}_${index}`}
            style={styles.sliderStyle}
            maximumValue={max}
            minimumValue={min}
            maximumTrackTintColor={isDefault ? 'rgba(255,255,255,.15)' : 'rgba(148,162,169,.15)'}
            renderMinimumTrack={() => (
              <View style={{ width: cx(240), height: cx(8), backgroundColor: '#FFFFFF' }}>
                <LinearGradient
                  style={{ width: cx(240), height: cx(8), backgroundColor: 'transparent' }}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                  stops={{
                    '0%': colors(themeColor).alpha(0.6).rgbString(),
                    '100%': colors(themeColor).alpha(1).rgbString(),
                  }}
                >
                  <Rect width={cx(240)} height={cx(8)} />
                </LinearGradient>
              </View>
            )}
            thumbTintColor="transparent"
            thumbStyle={styles.sliderThumb}
            stepValue={step}
            onlyMaximumTrack={false}
            value={values}
            renderThumb={() => (
              <View style={styles.thumbStyle}>
                <ImageBackground source={Res.thumb} style={styles.thumbImg}>
                  <Image
                    style={[
                      styles.thumbImg2,
                      { tintColor: isDefault ? 'rgba(196,212,226,.2)' : themeColor },
                    ]}
                    source={Res.thumbImg}
                  />
                </ImageBackground>
              </View>
            )}
            onSlidingComplete={(value: number) => this._handleToControl(code, value)}
          />
          <UnitText
            style={styles.percent}
            valueColor={isDefault ? 'rgba(255,255,255,.5)' : '#495054'}
            size={cx(18)}
            value={`${percent}${Strings.getLang('unit')}`}
          />
        </View>
      );
    });
  };

  render() {
    return (
      <View
        style={[
          styles.container,
          {
            height: this.percents.length * cy(64),
          },
        ]}
      >
        {this.renderItemControl()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: cy(128),
    width: cx(375),
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: cx(12),
    width: cx(375),
  },
  controlTxt: {
    backgroundColor: 'transparent',
    color: 'rgba(0,0,0,.5)',
    fontSize: cx(12),
    maxWidth: cx(60),
  },
  thumbStyle: {
    width: cx(18),
    height: cx(32),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    backgroundColor: 'rgba(255,255,255,.3)',
  },
  thumbImg: {
    width: cx(18),
    height: cx(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImg2: {
    width: cx(9),
    height: cx(12),
  },
  percent: {
    width: cx(60),
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginLeft: cx(20),
  },
  sliderThumb: {
    width: cx(18),
    height: cx(32),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sliderStyle: {
    width: cx(210),
    height: cx(32),
    marginLeft: cx(10),
  },
});

export default connect(({ dpState }: any) => ({ dpState }))(Sliders);
