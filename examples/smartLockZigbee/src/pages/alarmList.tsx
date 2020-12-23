import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet, Text, Image, SectionList, Dimensions } from 'react-native';
import { TYSdk, Utils, IconFont } from 'tuya-panel-kit';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import icons from '../icons/index';
import Strings from '../i18n';
import { getWarnList, getWarnListOne } from '../models/modules/recordList';
import { getWarnListInfo } from '../dataHandle/recordHandle';
import Loading from '../components/loading';
import HeadTop from '../components/headBar';
import Res from '../res';

const { convertX } = Utils.RatioUtils;
const { width } = Dimensions.get('window');

const pageSize = 50;
type warnListType = {
  list: { title: string; data: any }[];
  totalCount: number;
  hasNext: boolean;
  response: boolean;
};
interface AlarmListProps {
  getWarnListOne: any;
  getWarnList: any;
  warnList: warnListType;
}
class AlarmList extends Component<AlarmListProps, any> {
  static defaultProps = {
    warnList: {
      list: [{ title: '', data: [] }],
      totalCount: 0,
      hasNext: false,
      response: true,
    },
  };

  isShowLoading: boolean;

  timerId: string;

  offset: number;

  constructor(props: any) {
    super(props);
    this.timerId = '';
    this.offset = 0;
    this.isShowLoading = true;
  }

  componentDidMount() {
    getWarnListInfo(this.props.getWarnListOne, pageSize, this.offset);
  }

  componentWillUnmount() {
    // setAlarmNum(this.props.dispatch);
  }

  loadMore() {
    this.offset += pageSize;
    this.isShowLoading = false;
    if (this.props.warnList.hasNext) getWarnListInfo(this.props.getWarnList, pageSize, this.offset);
  }

  renderItem = (data: any) => {
    const { item, section } = data;
    let alarm = '';
    let image = '';
    const time =
      section.title === 'history'
        ? moment(item.gmtCreate).format('YYYY-MM-DD HH:mm')
        : moment(data.item.gmtCreate).format('HH:mm');
    Object.keys(item.dps[0]).forEach(element => {
      if (element.toString() === TYSdk.native.getDpIdByCode('doorbell')) {
        alarm = Strings.getLang('doorbell');
        image = icons.doorbell;
      } else if (element.toString() === TYSdk.native.getDpIdByCode('hijack')) {
        alarm = Strings.getLang('hijack');
        image = icons.hijack;
      } else {
        alarm += Strings.getDpLang(`alarm_lock_${item.dps[0][element]}`);
        image = icons[item.dps[0][element]];
      }
    });
    return (
      <View key={data.index} style={styles.innerView}>
        <View style={styles.iconWarp}>
          <IconFont d={image} color="#999999" size={24} />
        </View>
        <View>
          <Text style={styles.openWay} numberOfLines={1}>
            {alarm}
          </Text>
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>
    );
  };

  render() {
    const { warnList } = this.props;
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
        <HeadTop page="setting" title={Strings.getLang('titleWarnRecord')} pan={true} />
        {!warnList.response && this.isShowLoading && <Loading />}
        {warnList.list && warnList.list.length <= 0 && (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image style={styles.noneIcon} source={Res.none} />
            <Text style={styles.noSubtitle}>{Strings.getLang('noAlarmRecord')}</Text>
          </View>
        )}
        {warnList.list && warnList.list.length > 0 && (
          <SectionList
            renderItem={item => this.renderItem(item)}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.headTop}>
                <Text style={styles.headTopText}>{Strings.getLang(title)}</Text>
              </View>
            )}
            sections={this.props.warnList.list}
            onEndReached={() => this.loadMore()}
            keyExtractor={(item: any, index) => item + index}
            stickySectionHeadersEnabled={true}
            onEndReachedThreshold={0.1}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={{ marginBottom: 32 }} />}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  innerView: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: convertX(66),
    paddingHorizontal: convertX(16),
  },
  iconWarp: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderColor: '#999999',
  },
  openWay: {
    fontSize: convertX(14),
    lineHeight: convertX(24),
    color: '#333333',
    width: convertX(270),
  },
  time: {
    fontSize: convertX(12),
    lineHeight: convertX(20),
    color: '#9B9B9B',
  },
  noSubtitle: {
    color: '#9B9B9B',
    fontSize: 12,
    textAlign: 'center',
  },
  headTop: {
    // height: convertX(40),
    width,
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  headTopText: {
    color: '#666666',
    fontSize: convertX(12),
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
    textAlignVertical: 'auto',
    paddingHorizontal: convertX(16),
  },
  noneIcon: {
    marginBottom: 12,
  },
});

export default connect(
  ({ warnList }: { warnList: warnListType }) => ({
    warnList,
  }),
  dispatch =>
    bindActionCreators(
      {
        getWarnList,
        getWarnListOne,
      },
      dispatch
    )
)(AlarmList);
