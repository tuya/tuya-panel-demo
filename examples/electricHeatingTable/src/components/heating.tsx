import React, { PureComponent } from 'react';
import { View, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import _ from 'lodash';
import { connect } from 'react-redux';
import styles from '../config/styles';
import { updateDp } from '../redux/modules/common';
import { DpState, ImgType } from '../config/interface';
import Strings from '../i18n';
import { i18n } from '../utils';
import { getHeatingDirection } from '../config/boxConfig';
import imgs from '../res';
import { ReduxType } from '../redux/combine';

interface MainProps {
  heating: string[];
  ifShowContent: boolean;
  updateDp: (obj: { [key: string]: any }) => void;
  devInfo: { [key: string]: any };
  dpState: DpState;
}

class Heating extends PureComponent<MainProps> {
  timerHandle: number;
  imgType: ImgType[];
  state = {
    limitAction: false,
  };
  componentWillUnmount = () => {
    clearTimeout(this.timerHandle);
  };
  componentWillMount = () => {
    this.imgType = getHeatingDirection(this.props.heating);
  };
  getDpRange = (dp: string) => {
    const range = this.props.devInfo.schema[dp].range;
    return range.indexOf(this.props.dpState[dp]) === range.length - 1
      ? range[0]
      : range[range.indexOf(this.props.dpState[dp]) + 1];
  };
  render() {
    if (!this.props.ifShowContent) return null;
    const { dpState, heating } = this.props;
    const ifUseAllWarm =
      _.get(this.props.devInfo, 'panelConfig.fun.ifUseAllWarm') !== undefined
        ? _.get(this.props.devInfo, 'panelConfig.fun.ifUseAllWarm')
        : true;
    const myopacity = !dpState.switch || dpState.child_lock ? 0.5 : 1;
    return (
      <View style={[styles.flex1, this.imgType.length !== 0 && styles.incline]}>
        <View style={styles.boxTitle}>
          <TYText style={styles.titleText}>{i18n('heating')}</TYText>
          {heating.includes('status') && (
            <TYText style={[styles.tipsText]}>
              {i18n('state')}: {Strings.getDpLang('status', dpState.status)}
            </TYText>
          )}
        </View>
        {this.imgType.length !== 0 && (
          <View style={[styles.heatingImgBox, styles.incline]}>
            <View style={[styles.heatingImgBox, { position: 'absolute' }]}>
              {this.imgType.map((item: ImgType) => {
                return (
                  <TouchableOpacity
                    key={item.name}
                    disabled={!dpState.switch || dpState.child_lock}
                    onPress={() => {
                      this.props.updateDp({
                        [item.name]: this.getDpRange(item.name),
                      });
                    }}
                    style={[item.imgWH, item.style as {}]}
                  >
                    <ImageBackground
                      source={item.img}
                      style={[
                        item.imgWH,
                        { transform: [{ rotate: `${item.rotate}deg` }] },
                        styles.incline,
                        { opacity: myopacity },
                      ]}
                      resizeMode="stretch"
                    >
                      <TYText
                        style={[
                          styles.heatingText,
                          styles.whiteText,
                          { transform: [{ rotate: `${-item.rotate}deg` }] },
                          item.textStyle,
                        ]}
                      >
                        {i18n(`${dpState[item.name]}_short`)}
                      </TYText>
                    </ImageBackground>
                  </TouchableOpacity>
                );
              })}
            </View>
            {heating.includes('all_warm') && ifUseAllWarm && (
              <TouchableOpacity
                disabled={!dpState.switch}
                style={[{ position: 'absolute' }, styles.incline]}
                onPress={() => {
                  this.props.updateDp({
                    all_warm: this.getDpRange('all_warm'),
                  });
                }}
              >
                <View style={[styles.allControl, { opacity: myopacity }]}>
                  <TYText style={[styles.heatingText, styles.whiteText]}>
                    {i18n(`${dpState.all_warm}_short`)}
                  </TYText>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
        {(heating.includes('add') || heating.includes('minus')) && (
          <View style={[styles.incline, styles.flex1]}>
            <View style={[styles.allControlBotton, { opacity: myopacity }]}>
              {heating.includes('minus') && (
                <TouchableOpacity
                  style={styles.addTouch}
                  disabled={!dpState.switch || this.state.limitAction || dpState.child_lock}
                  onPress={() => {
                    this.setState({ limitAction: true });
                    this.props.updateDp({ minus: true });
                    this.timerHandle = setTimeout(() => {
                      this.setState({ limitAction: false });
                    }, 200);
                  }}
                >
                  <Image source={imgs.sub} resizeMode="stretch" />
                </TouchableOpacity>
              )}
              <TYText style={styles.whiteText}>{i18n('allControl')}</TYText>
              {heating.includes('add') && (
                <TouchableOpacity
                  style={styles.addTouch}
                  disabled={!dpState.switch || this.state.limitAction || dpState.child_lock}
                  onPress={() => {
                    this.setState({ limitAction: true });
                    this.props.updateDp({ add: true });
                    this.timerHandle = setTimeout(() => {
                      this.setState({ limitAction: false });
                    }, 200);
                  }}
                >
                  <Image source={imgs.add} resizeMode="stretch" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  }
}

export default connect(
  ({ dpState, devInfo }: ReduxType) => ({
    dpState,
    devInfo,
  }),
  {
    updateDp,
  }
)(Heating);
