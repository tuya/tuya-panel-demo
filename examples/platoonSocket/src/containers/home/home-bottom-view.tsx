import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TYSdk, Utils, IconFont, TYText } from 'tuya-panel-kit';
import Strings from '../../i18n';
import icons from '../../res/iconfont.json';
import { getSettings } from '../../utils';

const { isIphoneX, convertX: cx, convertY: cy } = Utils.RatioUtils;
const TYDevice = TYSdk.device;

interface HomeBottomViewProps {
  dpState: any;
  schema: any;
  groupId: any;
  panelConfig: any;
}

class HomeBottomView extends Component<HomeBottomViewProps> {
  switchs: any;
  countdowns: any;
  settings: any;
  static propTypes = {
    dpState: PropTypes.object,
    schema: PropTypes.object,
    groupId: PropTypes.any,
    panelConfig: PropTypes.object,
  };

  static defaultProps = {
    dpState: {},
    schema: {},
    groupId: null,
    panelConfig: {},
  };

  constructor(props: HomeBottomViewProps) {
    super(props);
    const { schema } = this.props;
    const switchs = _.filter(schema, d => /^switch/.test(d.code));
    this.switchs = _.sortBy(switchs, d => _.parseInt(d.id));
    const countdowns = _.filter(schema, d => /^countdown/.test(d.code));
    this.countdowns = _.sortBy(countdowns, d => _.parseInt(d.id));
    this.settings = getSettings(schema);
  }

  getData() {
    const { groupId, panelConfig } = this.props;
    const isGroup = !!groupId;
    const hideGroupCountdown = !!_.get(panelConfig, 'fun.hideGroupCountdown');
    const allOn = true;
    const schedule = 'schedule';
    const countdown = 'countdown';
    const setting = 'setting';
    return [
      {
        key: 'allOn',
        label: Strings.getLang('allOn'),
        icon: icons.power,
        onPress: () => this._handleToTogglePower(allOn),
        hide: false,
        bgColor: '#00B294',
        tintColor: '#FFFFFF',
      },
      {
        key: 'timer',
        label: Strings.getLang('schedule'),
        icon: icons.timer,
        onPress: () => this._handleToGoRouter(schedule, this.switchs),
        hide: false,
      },
      {
        key: 'countdown',
        label: Strings.getLang('countdown'),
        icon: icons.countdown,
        onPress: () => this._handleToGoRouter(countdown, this.countdowns),
        hide: isGroup && hideGroupCountdown,
      },
      {
        key: 'setting',
        label: Strings.getLang('setting'),
        icon: icons.setting,
        onPress: () => this._handleToGoRouter(setting, this.settings),
        hide: this.settings.length === 0,
      },
      {
        key: 'allOff',
        label: Strings.getLang('allOff'),
        icon: icons.power,
        onPress: () => this._handleToTogglePower(!allOn),
        hide: false,
      },
    ].filter(({ hide }) => !hide);
  }

  _handleToTogglePower = (allOn: boolean) => {
    const power = _.pick(
      this.props.dpState,
      this.switchs.map((d: any) => d.code)
    );
    const powerCode = Object.keys(power);
    const codes = {};
    powerCode.forEach((code: string) => {
      codes[code] = allOn;
    });
    TYDevice.putDeviceData(codes);
  };

  _handleToGoRouter = (id: string, data: any) => {
    const TYNavigator = TYSdk.Navigator;
    TYNavigator.push({
      id,
      title: Strings.getLang(`${id}`),
      data,
    });
  };

  renderItem = () => {
    return this.getData().map(({ key, label, bgColor, tintColor, icon, onPress }) => (
      <TouchableOpacity style={styles.btnItem} key={key} onPress={onPress}>
        <View
          style={[
            styles.icon,
            {
              backgroundColor: bgColor || 'rgba(0, 178, 148, 0.1)',
            },
          ]}
        >
          <IconFont d={icon} size={cx(20)} color={tintColor || '#18B89D'} />
        </View>
        <TYText style={styles.label} numberofLines={1}>
          {label}
        </TYText>
      </TouchableOpacity>
    ));
  };

  render() {
    return <View style={styles.container}>{this.renderItem()}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    width: cx(375),
    paddingTop: cy(14),
    paddingBottom: isIphoneX ? cy(18) : cy(6),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  btnItem: {
    width: cx(75),
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: cx(40),
    height: cx(40),
    borderRadius: cx(20),
    marginBottom: cx(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    backgroundColor: 'transparent',
    fontSize: cx(10),
    color: 'rgba(56,58,60,6)',
  },
});

const mapStateToProps = (state: any) => {
  return {
    schema: state.devInfo.schema,
    dpState: state.dpState,
    groupId: state.devInfo.groupId,
    panelConfig: state.devInfo.panelConfig,
    switchName: state.socketState.socketNames,
  };
};

export default connect(mapStateToProps, null)(HomeBottomView);
