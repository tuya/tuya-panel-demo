import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { TYText, UnitText, Divider, Utils, TopBar } from 'tuya-panel-kit';
import moment from 'moment';
import _ from 'lodash';
import { connect } from 'react-redux';
import styles from '../config/styles';
import { ReduxType } from '../redux/combine';
import { InterfaceData, DpState } from '../config/interface';
import { getElecList, TYDevice } from '../api';
import { mapData, toFixedData } from '../utils';
import Bar from '../components/bar';
import Strings from '../i18n';
import { defaultThemeColor } from '../config/boxConfig';

const i18n = (name: string) => Strings.getLang(name);
const { convertX: cx } = Utils.RatioUtils;

interface MainProps {
  dpState: DpState;
  devInfo: { [key: string]: any };
  route: { [key: string]: any };
  navigator: {
    pop: () => void;
    back: () => void;
    getCurrentRoutes: () => { length: number };
  };
}
class Power extends PureComponent<MainProps, any> {
  state = {
    curvData: [],
    total: 0,
    _key: {},
  };
  componentDidMount = () => {
    this._getElecList();
  };
  _getElecList = () => {
    const startTime = moment()
      .startOf('month')
      .format('YYYYMMDD');
    const endTime = moment()
      .endOf('month')
      .format('YYYYMMDD');
    getElecList(this.props.devInfo.devId, 'power_consumption', startTime, endTime)
      .then((data: InterfaceData) => {
        const mapResult = mapData(
          data,
          'power_consumption',
          _.get(this.props.devInfo, 'schema.power_consumption.scale')
        );
        const { curvData, total } = mapResult;
        this.setState({ curvData, total, _key: new Date() });
      })
      .catch(e => console.log(e));
  };
  _handleTabChange = (tab: string) => {
    const _navigator = this.props.navigator;
    if (tab === 'right') {
      TYDevice.showDeviceMenu();
    } else if (_navigator && _navigator.getCurrentRoutes().length > 1) {
      _navigator.pop();
    } else {
      _navigator.back();
    }
  };
  render() {
    const { total, curvData } = this.state;
    const unit = _.get(this.props.devInfo, 'schema.power_consumption.unit');
    return (
      <View>
        <TopBar
          background="transparent"
          title={Strings.getLang(
            `TYElements_month_${
              +moment().format('MM') < 10
                ? moment()
                    .format('MM')
                    .slice(1)
                : moment().format('MM')
            }`
          )}
          color="#fff"
          onBack={this._handleTabChange}
        />
        <View style={styles.usePower}>
          <View style={styles.powerBox}>
            <View style={styles.powerText}>
              <UnitText value={`${0 || toFixedData(total, 1)}`} valueSize={cx(40)} />
              <TYText style={styles.powerUnit}>{unit}</TYText>
            </View>
            <TYText style={styles.pwerName}>{i18n('monthElecUse')}</TYText>
          </View>
          <View style={styles.dividerBox}>
            <Divider flexDirection="column" color="rgba(255,255,255,0.23)" height={cx(40)} />
          </View>
          <View style={styles.powerBox}>
            <View style={styles.powerText}>
              <UnitText
                value={
                  0 ||
                  toFixedData(
                    this.props.dpState.power_consumption /
                      Math.pow(10, this.props.devInfo.schema.power_consumption.scale),
                    1
                  )
                }
                valueSize={cx(40)}
              />
              <TYText style={styles.powerUnit}>{unit}</TYText>
            </View>
            <TYText style={styles.pwerName}>{i18n('dayElecUse')}</TYText>
          </View>
        </View>
        <View style={styles.barBox}>
          <Bar
            width={cx(375)}
            height={cx(380)}
            curvData={curvData}
            unit={unit}
            mykey={this.state._key}
            themeColor={defaultThemeColor}
          />
        </View>
      </View>
    );
  }
}

export default connect(({ dpState, devInfo }: ReduxType) => ({
  dpState,
  devInfo,
}))(Power);
