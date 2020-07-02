import React, { Component } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import _ from 'lodash';
import { TYText, Divider, Utils } from 'tuya-panel-kit';
import Strings from '../../i18n';
import TYSdk from '../../api';
import { analysisDate, checkIsToday } from '../../utils';

const { convertX: cx } = Utils.RatioUtils;
const pageSize = 10;

interface HistoryCode {
  id: string;
  code: string;
  values?: any[];
}

interface HistoryProps {
  logsConfig: HistoryCode[];
  devInfo: any;
}
interface HistoryState {
  list: any[];
  isRefreshing: boolean;
}
interface HistoryRowProps {
  text: string;
  time: string;
  timeStamp?: number;
}

export default class HistoryScene extends Component<HistoryProps, HistoryState> {
  static defaultProps = {
    logsConfig: [],
  };
  public offset = 0;
  public hasNextPage = false;
  public timer: any = null;
  public logs: any = {};
  constructor(props: HistoryProps) {
    super(props);
    this.state = {
      list: [],
      isRefreshing: false,
    };
  }
  componentDidMount() {
    this.getLogs();
  }
  componentWillUnmount() {
    clearTimeout(this.timer);
  }
  onRefresh = async () => {
    if (this.hasNextPage) {
      this.setState({ isRefreshing: true });
      this.getLogs();
      this.setState({
        isRefreshing: false,
      });
    }
  };

  getLogs = (offset?: number) => {
    const { devInfo } = this.props;
    const offsetPage = offset === 0 || offset ? offset : this.offset;
    const logsCodes = this.props.logsConfig.map(log => log.code);
    if (logsCodes.length === 0) return TYSdk.native.hideLoading();
    TYSdk.getLogs(devInfo.devId, logsCodes, offsetPage, pageSize).then(
      (d: any) => {
        if (typeof d.dps === 'undefined' || d.dps.length === 0) {
          TYSdk.native.hideLoading();
          return;
        }
        const cloudValueCheck = d.dps.some(
          (item: any) => this._inspectLegalValue(item.dpId, item.value).isLegal
        );
        if (!cloudValueCheck) {
          TYSdk.native.hideLoading();
          return;
        }

        _.forEach(d.dps, v => {
          const times = v.timeStr.split(' ');
          const date = times[0];
          const time = times[1];

          if (typeof this.logs[date] === 'undefined') {
            this.logs[date] = [];
          }
          const { isLegal, dpValue, code, type } = this._inspectLegalValue(v.dpId, v.value);
          if (isLegal && ((type === 'bitmap' && dpValue !== '0') || type !== 'bitmap')) {
            const data: HistoryRowProps = {
              time: '',
              text: '',
            };
            data.time = time;
            data.text =
              type !== 'bitmap'
                ? Strings.getDpLang(code, dpValue)
                : Strings.getFaultStrings(code, parseInt(dpValue, 10), false);
            data.timeStamp = v.timeStamp;
            !this.logs[date].some(
              (log: HistoryRowProps) => log.time === data.time && log.text === data.text
              // && log.text === data.text
            ) && this.logs[date].push(data);
            this.logs[date] = _.sortBy(this.logs[date], d => d.timeStamp).reverse();
          }
        });
        const keys = Object.keys(this.logs).map(date => checkIsToday(date, true));

        const values = Object.values(this.logs).map(data => analysisDate(data, false));
        const datas = values.map((data, index) => ({
          title: keys[index],
          data,
        }));
        this.setState(
          {
            list: datas,
          },
          () => {
            this.hasNextPage = d.hasNext;
            if (this.hasNextPage) this.offset += pageSize;
          }
        );
        TYSdk.native.hideLoading();
      },
      (e: any) => {
        TYSdk.native.hideLoading();
      }
    );
  };

  _getDpValueByType = (value: any, type: any) => {
    const stringTypes = ['enum', 'string', 'raw', 'bitmap'];
    if (type === 'bool') {
      if (_.isBoolean(value)) return value;
      return eval(value.toLowerCase());
    } else if (type === 'value') {
      if (_.isNumber(value)) return value;
      return Number(value);
    } else if (stringTypes.includes(type)) {
      if (typeof value === 'string') return value;
      return `${value}`;
    }
  };

  _inspectLegalValue = (id: number, value: any) => {
    const code = TYSdk.device.getDpCodeById(id);
    const { type } = TYSdk.device.getDpSchema(code);
    const dpValue = this._getDpValueByType(value, type);
    const isRaw = type === 'raw';
    const isLegal = this.props.logsConfig.some(
      log => Number(log.id) === id && (!log.values || (log.values && log.values.includes(dpValue)))
    );
    return { isLegal, dpValue, code, isRaw, type };
  };

  refreshData = () => {
    this.getLogs(0);
  };

  renderRow = (datas: any) => {
    const { item } = datas;
    const { title, data } = item;
    return (
      <TouchableOpacity activeOpacity={1}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Divider color="rgba(151,151,151, 0.1)" height={cx(1)} />
          <View style={styles.rowWrap}>
            {data.map((d: HistoryRowProps) => (
              <View key={`${d.time} ${d.text}`}>
                <View style={styles.row}>
                  <Text style={styles.text}>{d.time}</Text>
                  <Text style={styles.text}>{d.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  renderEmpty = () => (
    <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
      <TYText style={{ fontSize: 16, color: '#999', backgroundColor: 'transparent' }}>
        {Strings.getLang('noHistory')}
      </TYText>
    </View>
  );

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.list}>
            <FlatList
              data={this.state.list}
              renderItem={this.renderRow}
              onRefresh={this.onRefresh}
              refreshing={this.state.isRefreshing}
              onEndReached={this.onRefresh}
              onEndReachedThreshold={0.01}
              ListEmptyComponent={this.renderEmpty}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: cx(361),
    alignSelf: 'center',
    backgroundColor: 'transparent',
    borderTopLeftRadius: cx(14),
    borderTopRightRadius: cx(14),
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    paddingBottom: cx(100),
    paddingHorizontal: cx(8),
    backgroundColor: '#FFF',
  },
  list: {
    paddingTop: cx(15),
    paddingHorizontal: cx(20),
    backgroundColor: 'transparent',
  },
  title: {
    paddingVertical: cx(15),
    lineHeight: cx(20),
    color: '#3D3D3D',
    backgroundColor: 'transparent',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rowWrap: {
    paddingHorizontal: cx(17),
    backgroundColor: '#fff',
  },
  row: {
    height: cx(52),
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  text: {
    marginRight: cx(15),
    lineHeight: cx(20),
    color: '#000',
    fontSize: 15,
    backgroundColor: 'transparent',
  },
});
