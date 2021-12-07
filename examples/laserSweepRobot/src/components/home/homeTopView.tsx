import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Image,
  TouchableOpacity,
  StyleProp,
} from 'react-native';
import { Utils, TYText, IconFont } from 'tuya-panel-kit';
import Strings from '@i18n';
import { alarmIcon, closeIcon } from '../../res/iconfont';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

interface IProps {
  style: StyleProp<ViewStyle>;
  icon: number;
  valueText: string;
  valueStyle: StyleProp<ViewStyle>;
  valueTextStyle: StyleProp<TextStyle>;
  fault: number;
  faultCode: string;
  faultIsValue: boolean;
  mapStatus: number;
}
interface IState {
  showFaultTip: boolean;
}
export default class HomeTopView extends Component<IProps, IState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    style: {},
    icon: 0,
    valueText: null,
    valueStyle: {},
    valueTextStyle: {},
    fault: 0,
    faultCode: '',
    faultIsValue: false,
    mapStatus: 0,
  };

  constructor(props) {
    super(props);
    this.state = {
      showFaultTip: true,
    };
  }

  _handleCloseFaultTip = () => {
    this.setState({ showFaultTip: false });
  };

  render = () => {
    const {
      valueText,
      fault,
      faultCode,
      faultIsValue,
      valueStyle,
      valueTextStyle,
      style,
      icon,
      mapStatus,
    } = this.props;
    const { showFaultTip } = this.state;

    return (
      <View style={[styles.container, style]}>
        {valueText && (
          <View style={[styles.section__value, valueStyle]}>
            {icon !== 0 && <Image source={icon} />}
            <TYText style={[styles.text, valueTextStyle]}>{valueText}</TYText>
          </View>
        )}

        {faultCode && fault && showFaultTip ? (
          <View style={styles.section__fault}>
            <IconFont d={alarmIcon} size={cx(28)} fill="#fff" stroke="#fff" />
            <TYText style={[styles.text, { flex: 1, marginLeft: 6 }]} numberOfLines={1}>
              {Strings.getFaultStrings(faultCode, fault)}
            </TYText>
            <TouchableOpacity activeOpacity={0.8} onPress={this._handleCloseFaultTip}>
              <IconFont d={closeIcon} size={cx(28)} fill="#fff" stroke="#fff" />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  section__value: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: cx(16),
    paddingVertical: cy(6),
    borderRadius: cx(15),
  },

  section__fault: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: cy(36),
    paddingHorizontal: cx(18),
    backgroundColor: '#FF813E',
  },

  text: {
    fontSize: cx(14),
    color: '#fff',
  },
});
