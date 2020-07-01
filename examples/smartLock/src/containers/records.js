import PropTypes from 'prop-types';
import React, { Component } from 'react';
import _ from 'lodash';
import debounce from 'lodash/debounce';
import { Text, View, Image, StyleSheet } from 'react-native';
import { Utils, TYSdk, TYSectionList, Dialog, Button } from 'tuya-panel-kit';
import { openDoorDpCodes } from '../code';
import { getWeek } from '../utils';
import Strings from '../i18n';
import TYNative from '../api';
import Res from '../res';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;
const TYDevice = TYSdk.device;
const pageSize = 50;

export class RecordsView extends Component {
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
      startRender: false, // 是否开始渲染
    };
    this.hasNextPage = true;
    this.offset = 0;
    TYSdk.native.showLoading({ title: '' });
    this.openDoorDpIds = _.map(this.props.dpData.schema, d => {
      if (openDoorDpCodes.indexOf(d.code) > -1) {
        return +TYDevice.getDpIdByCode(d.code);
      }
    }).filter(i => !!i);
    this.getLogs(false);
    this.isLoading = false; // 判断是否在加载中
  }

  getLogs = debounce(isRefresh => {
    this.isLoading = true;
    const params = {
      dpIds: this.openDoorDpIds,
      limit: pageSize,
      offset: this.offset,
    };
    TYNative.getRecordLits(params).then(
      d => {
        this.isLoading = false;
        if (d === undefined || d.totalCount === 0) {
          TYSdk.native.hideLoading();
          return this.setState({ data: [], startRender: true });
        }
        // eslint-disable-next-line
        this.setState({
          data: isRefresh ? _.uniq([...this.state.data, ...d.datas]) : d.datas,
          startRender: true,
        });
        this.hasNextPage = this.offset + pageSize < d.totalCount;
        if (this.hasNextPage) {
          this.offset += pageSize;
        }

        TYSdk.native.hideLoading();
        this.refreshing = false;
      },
      e => {
        this.isLoading = false;
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

  formateData = data => {
    const logs = {};
    data.map((item, index) => {
      const date = Utils.TimeUtils.dateFormat('yyyy-MM-dd', new Date(Number(item.gmtCreate)));
      const today = Utils.TimeUtils.dateFormat('yyyy-MM-dd', new Date());
      const isToday = date === today;
      if (typeof logs[date] === 'undefined') {
        logs[date] = [];
      }
      const ds = {
        key: index,
        renderItem: () => this.renderCustomItem(item, isToday),
      };
      logs[date].push(ds);
    });

    const keys = Object.keys(logs);
    const values = Object.values(logs);
    const today = Utils.TimeUtils.dateFormat('yyyy-MM-dd', new Date());
    const dataS = values.map((data, index) => ({
      title:
        keys[index] === today
          ? Strings.getLang('today')
          : `${keys[index]} (${getWeek(keys[index])})`,
      data,
    }));
    return dataS;
  };

  loadMore = () => {
    if (this.isLoading) return;
    if (this.hasNextPage) {
      this.getLogs(true);
    }
  };

  goToBindView = (unlockName, bindUnlocks) => {
    TYSdk.Navigator.push({
      id: 'bindUnlockIds',
      hideTopbar: true,
      title: Strings.getLang('bindUnlockIds'),
      bindUnlocks,
      bindUnlockNames: unlockName,
      isRecordBind: true,
      recordBindHandle: this.getLogs,
    });
  };

  renderEmptyView() {
    return (
      <View style={styles.noContainer}>
        <Image style={styles.noneIcon} source={Res.none} />
        <Text style={styles.noSubtitle}>{Strings.getLang('noRecords')}</Text>
      </View>
    );
  }
  // 自定义每个Item
  renderCustomItem = (item, isToday) => {
    const { unlockName, gmtCreate, userName, userId, dps } = item;
    const _time = isToday
      ? Utils.TimeUtils.dateFormat('hh:mm', new Date(Number(gmtCreate)))
      : Utils.TimeUtils.dateFormat('yyyy-MM-dd hh:mm', new Date(Number(gmtCreate)));
    const bindUnlocks = [`${Object.keys(dps[0])}-${Object.values(dps[0])}`];
    const unlockId = Object.keys(dps[0])[0];
    let openText =
      unlockId !== '3' || unlockId !== '32'
        ? userId === '0'
          ? `${unlockName} ${Strings.getLang('unBindUnlock')}`
          : Strings.formatValue('unlock', unlockName)
        : Strings.getLang(`tempPswUnlock_${unlockId}`);
    if (unlockId === '15') {
      openText = Strings.getLang('openRemote');
    }
    return (
      <View style={styles.listItem}>
        <View style={{ flexDirection: 'row' }}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.title} numberOfLines={1}>
                {userName}
              </Text>
              <Text style={[styles.title, { maxWidth: cx(150) }]}>
                {`${Strings.getLang(`code_${unlockId}`)}${openText}`}
              </Text>
            </View>
            <Text style={styles.subTitle}>{_time}</Text>
            {userId === '0' && unlockId !== '3' && unlockId !== '32' && unlockId !== '15' && (
              <Text style={styles.unlockText}>{Strings.getLang('unbindUserTip')}</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  render() {
    const { data } = this.state;
    const groupedData = this.formateData(data);
    if (!this.state.startRender) {
      return <View style={styles.container} />;
    }
    if (Object.keys(groupedData).length === 0) {
      return this.renderEmptyView();
    }
    return (
      <View style={styles.container}>
        <TYSectionList
          style={{ alignSelf: 'stretch' }}
          sections={groupedData}
          enableEmptySections={true}
          onEndReachedThreshold={0.1}
          onEndReached={this.loadMore}
          ItemSeparatorComponent={null}
          showsVerticalScrollIndicator={false}
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

  avatar: {
    marginRight: cx(8),
    width: cx(32),
    height: cx(32),
    borderRadius: cx(16),
  },

  title: {
    maxWidth: cx(100),
    color: '#333',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  subTitle: {
    color: '#999',
    marginTop: cy(6),
    fontSize: 12,
    backgroundColor: 'transparent',
  },
  unlockText: {
    color: '#999',
    marginTop: cy(11),
    fontSize: 12,
    backgroundColor: 'transparent',
  },
  bindBtn: {
    paddingHorizontal: 8,
    height: 26,
    borderColor: '#0076FF',
    borderWidth: 1,
    borderRadius: 14.5,
  },
  bindText: {
    color: '#0076FF',
    fontSize: 12,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
});

export default RecordsView;
