import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { View, StyleSheet } from 'react-native';
import { Utils, TYSdk, TYFlatList } from 'tuya-panel-kit';
import Strings from '../../i18n';
import Res from '../../res';

const { isIphoneX, convertX: cx } = Utils.RatioUtils;
class HomeBottomView extends Component {
  static propTypes = {
    userCount: PropTypes.object,
    lastUnLock: PropTypes.object,
  };

  static defaultProps = {
    userCount: {},
    lastUnLock: {},
  };

  onToNextPaged = (id, title) => {
    const route = {
      id,
      title: Strings.getLang(title),
    };
    TYSdk.Navigator.push(route);
  };

  getData() {
    const commonProps = {
      activeOpacity: 0.8,
      style: { borderRadius: cx(20) },
      textStyle: { color: '#333333', fontSize: 12, marginTop: 4 },
      imageColor: '#333333',
      size: cx(24),
    };
    return [
      {
        key: 'records',
        text: Strings.getLang('records'),
        image: Res.records,
        onPress: () => this.onToNextPaged('records', 'records'),
      },
      {
        key: 'set',
        text: Strings.getLang('set'),
        image: Res.users,
        onPress: () => this.onToNextPaged('set', 'set'),
      },
    ].map(data => ({
      ...commonProps,
      ...data,
    }));
  }

  getListData = () => {
    const { lastUnLock } = this.props;
    const commonProps = {
      styles: {
        container: styles.listItem,
        title: styles.title,
        subTitle: styles.subTitle,
      },
      title: styles.title,
      subTitle: styles.subTitle,
      iconColor: '#333333',
      iconSize: cx(24),
    };
    const { unlockName, gmtCreate, dps } = lastUnLock;
    const unlockId = dps && Object.keys(dps[0])[0];
    let openText = Strings.formatValue('unlock', unlockName);
    if (unlockId === '15') {
      openText = Strings.getLang('openRemote');
    }
    const _time = Utils.TimeUtils.dateFormat('hh:mm', new Date(Number(gmtCreate)));
    const _date = Utils.TimeUtils.dateFormat('MM-dd hh:mm', new Date(Number(gmtCreate)));
    const date = Utils.TimeUtils.dateFormat('yyyy-MM-dd', new Date(Number(gmtCreate)));
    const today = Utils.TimeUtils.dateFormat('yyyy-MM-dd', new Date());
    const isToday = date === today;
    const time = isToday ? _time : _date;
    const recentRecord =
      Object.keys(lastUnLock).length > 0
        ? `${Strings.getLang(`code_${unlockId}`)} ${openText} ${time}`
        : Strings.getLang('noRecords');
    return [
      {
        key: 'records',
        title: Strings.getLang('records'),
        subTitle: recentRecord,
        Icon: Res.records,
        onPress: () => this.onToNextPaged('records', 'records'),
      },
    ].map(data => ({
      ...commonProps,
      ...data,
    }));
  };

  render() {
    const listData = this.getListData().filter(({ key }) => !!key);
    return (
      <View style={styles.container}>
        <TYFlatList
          scrollEnabled={false}
          style={styles.flatList}
          ItemSeparatorComponent={() => <View style={styles.separatorStyle} />}
          data={listData}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFF',
    alignSelf: 'stretch',
    paddingTop: 8,
    paddingBottom: isIphoneX ? 28 : 8,
  },

  flatList: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    marginHorizontal: 8,
    paddingBottom: 9,
    marginBottom: 2,
  },

  separatorStyle: {
    height: 6,
    backgroundColor: '#FFF',
  },

  listItem: {
    height: 56,
    backgroundColor: '#FFF',
  },

  title: {
    color: '#333',
    fontSize: 14,
    marginTop: 13,
  },

  subTitle: {
    color: '#666',
    fontSize: 12,
    marginTop: 7,
    maxWidth: 250,
  },
});

export default connect(state => ({
  userCount: state.userCount,
  lastUnLock: state.lastUnLock,
}))(HomeBottomView);
