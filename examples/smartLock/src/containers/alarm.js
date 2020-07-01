import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';
import _ from 'lodash';
import debounce from 'lodash/debounce';
import { Utils, TYSdk, TYSectionList, Dialog, IconFont } from 'tuya-panel-kit';
import { getAlarmText, getAlarmIcon } from '../utils';
import { getAlarmCount } from '../redux/modules/records';
import icons from '../res/iconfont.json';
import { alarmDpCodes } from '../code';
import { store } from '../main';
import Strings from '../i18n';
import TYNative from '../api';
import Res from '../res';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;
const TYDevice = TYSdk.device;
const pageSize = 50;

export class AlarmView extends Component {
  static propTypes = {
    dpData: PropTypes.object,
  };

  static defaultProps = {
    dpData: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      refreshing: false,
      startRender: false, // 是否开始渲染
    };
    this.hasNextPage = true;
    this.offset = 0;
    TYSdk.native.showLoading({ title: '' });
    this.alarmDpIds = _.map(this.props.dpData.schema, d => {
      if (alarmDpCodes.indexOf(d.code) > -1) {
        return +TYDevice.getDpIdByCode(d.code);
      }
    }).filter(i => !!i);
    this.getLogs();
  }

  getLogs = debounce(() => {
    TYNative.getDpHistory(this.alarmDpIds, pageSize, this.offset).then(
      d => {
        store.dispatch(getAlarmCount());
        // console.log(d, '=======告警记录==========');
        if (d === undefined || d.totalCount === 0) {
          TYSdk.native.hideLoading();
          return this.setState({ data: [], startRender: true });
        }
        // eslint-disable-next-line
        const logs = {
          [Strings.getLang('today')]: [],
          [Strings.getLang('history')]: [],
        };

        d.datas.map((item, index) => {
          const date = Utils.TimeUtils.dateFormat('yyyy-MM-dd', new Date(Number(item.gmtCreate)));
          const today = Utils.TimeUtils.dateFormat('yyyy-MM-dd', new Date());
          const isToday = date === today;
          const ds = {
            key: index,
            renderItem: () => this.renderCustomItem(item, isToday),
          };
          if (date === today) {
            logs[Strings.getLang('today')].push(ds);
          } else {
            logs[Strings.getLang('history')].push(ds);
          }
        });
        const keys = Object.keys(logs);
        const values = Object.values(logs);
        const dataS = values.map((data, index) => ({
          title: keys[index],
          data,
        }));
        this.setState({
          data: dataS.filter(i => i.data.length > 0),
          startRender: true,
        });
        this.hasNextPage = this.offset + pageSize < d.totalCount;
        if (this.hasNextPage) this.offset += pageSize;
        TYSdk.native.hideLoading();
        this.refreshing = false;
      },
      e => {
        store.dispatch(getAlarmCount());
        TYSdk.native.hideLoading();
        this.setState({
          startRender: true,
        });
        const err = typeof e === 'string' ? JSON.parse(e) : e;
        const _err = err.message || err.errorMsg || err;
        Dialog.alert({
          title: _err,
          confirmText: Strings.getLang('confirm'),
        });
      }
    );
  }, 500);

  loadMore = () => {
    if (this.hasNextPage) {
      this.getLogs();
    }
  };

  renderEmptyView() {
    return (
      <View style={styles.noContainer}>
        <Image style={styles.noneIcon} source={Res.none} />
        <Text style={styles.noSubtitle}>{Strings.getLang('noAlarmRecords')}</Text>
      </View>
    );
  }
  // 自定义每个Item
  renderCustomItem = (item, isToday) => {
    const { gmtCreate, dps } = item;
    const alarmText = getAlarmText(dps);
    const _time = Utils.TimeUtils.dateFormat('hh:mm', new Date(Number(gmtCreate)));
    const _date = Utils.TimeUtils.dateFormat('yyyy-MM-dd hh:mm', new Date(Number(gmtCreate)));
    const timeText = isToday ? _time : _date;
    const iconName = getAlarmIcon(dps) || 'default';
    return (
      <View style={styles.listItem}>
        <View style={{ flexDirection: 'row' }}>
          <View style={styles.iconBg}>
            <IconFont d={icons[iconName]} size={24} color="#999" />
          </View>
          <View>
            <Text style={styles.title}>{alarmText}</Text>
            <Text style={styles.subTitle}>{timeText}</Text>
          </View>
        </View>
      </View>
    );
  };

  render() {
    if (!this.state.startRender) {
      return <View style={styles.container} />;
    }
    if (Object.keys(this.state.data).length === 0) {
      return this.renderEmptyView();
    }
    return (
      <View style={styles.container}>
        <TYSectionList
          style={{ alignSelf: 'stretch' }}
          sections={this.state.data}
          refreshing={this.state.refreshing}
          enableEmptySections={true}
          onEndReachedThreshold={0.1}
          onEndReached={this.loadMore}
          ItemSeparatorComponent={null}
          showsVerticalScrollIndicator={false}
          onRefresh={async () => {
            this.setState({
              refreshing: true,
            });
            try {
              this.offset = 0;
              await this.getLogs();
              this.setState({
                refreshing: false,
              });
            } catch (e) {
              this.setState({
                refreshing: false,
              });
            }
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },

  noContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },

  noneIcon: {
    marginTop: cy(218),
  },

  noSubtitle: {
    color: '#999',
    fontSize: 14,
    marginTop: cy(2),
  },

  listItem: {
    backgroundColor: '#fff',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: cx(16),
  },
  iconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: cx(8),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#DBDBDB',
    borderWidth: 0.5,
  },
  title: {
    color: '#333',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  subTitle: {
    color: '#999',
    marginTop: cy(5),
    fontSize: 12,
    backgroundColor: 'transparent',
  },
});

export default AlarmView;
