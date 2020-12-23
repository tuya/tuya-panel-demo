import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  StyleSheet,
  Text,
  Image,
  SectionList,
  Dimensions,
  TouchableOpacity,
  DeviceEventEmitter,
} from 'react-native';
import { bindActionCreators } from 'redux';
import { TYSdk, Utils } from 'tuya-panel-kit';
import moment from 'moment';
import Strings from '../i18n';
import { getOpenList, getOpenListOne } from '../models/modules/recordList';
import { getOpenListInfo } from '../dataHandle/recordHandle';
import HeadTop from '../components/headBar';
import Loading from '../components/loading';
import Res from '../res';

const { convertX } = Utils.RatioUtils;
const { width } = Dimensions.get('window');

type openListType = {
  list: { title: string; data: any }[];
  totalCount: number;
  hasNext: boolean;
  response: boolean;
};

interface OpenListProps {
  getOpenListOne: any;
  getOpenList: any;
  user: UserType;
  openList: openListType;
}

const pageSize = 50;
class OpenList extends Component<OpenListProps, any> {
  static defaultProps = {
    openList: {
      list: [{ title: '', data: [] }],
      totalCount: 0,
      hasNext: false,
      response: true,
    },
  };

  offset: number;

  isShowLoading: boolean;

  listen: any;

  time: any;

  constructor(props: any) {
    super(props);
    this.offset = 0;
    this.isShowLoading = true;
  }

  getData() {
    const { userId } = this.props.user;
    getOpenListInfo(this.props.getOpenListOne, pageSize, 0, userId);
  }

  componentDidMount() {
    this.getData();
    this.listen = DeviceEventEmitter.addListener('openListChange', () => this.getData());
  }

  componentWillUnmount() {
    this.listen.remove();
  }

  loadMore() {
    const { userId } = this.props.user;
    this.isShowLoading = false;
    this.offset += pageSize;
    if (this.props.openList.hasNext) {
      getOpenListInfo(this.props.getOpenList, pageSize, this.offset, userId);
    }
  }

  renderItem = (data: any) => {
    const { item } = data;
    return (
      <View key={data.index} style={[styles.innerView, { justifyContent: 'space-between' }]}>
        <View style={[styles.innerView, { paddingHorizontal: 0 }]}>
          <View style={styles.iconWarp}>
            <Image style={styles.headImage} source={{ uri: item.avatar }} />
          </View>
          <View>
            <Text style={[styles.openWay, item.unbindUser ? { width: 180 } : {}]} numberOfLines={2}>
              {item.textInfo}
            </Text>
            <Text style={styles.time}>{moment(item.time).format('HH:mm')}</Text>
          </View>
        </View>
        {item.unbindUser && (
          <TouchableOpacity
            onPress={() => {
              TYSdk.Navigator.push({
                id: 'userList',
                isClickList: true,
                isClickValue: [item.unlockId],
                type: 'open',
              });
            }}
          >
            <View style={styles.unbindView}>
              <Text style={styles.unbindText} numberOfLines={1}>
                {Strings.getLang('linkUser')}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  render() {
    const { openList } = this.props;
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
        <HeadTop page="setting" title={Strings.getLang('titleHandleRecord')} pan={true} />
        {!openList.response && this.isShowLoading && <Loading />}
        {openList.response && openList.list && openList.list.length <= 0 && (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image style={styles.noneIcon} source={Res.none} />
            <Text style={styles.noSubtitle}>{Strings.getLang('noOpenRecord')}</Text>
          </View>
        )}
        {openList.list && openList.list.length > 0 && (
          <SectionList
            renderItem={item => this.renderItem(item)}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.headTop}>
                <Text style={styles.headTopText}>
                  {title === moment().format('YYYY-MM-DD').toString()
                    ? Strings.getLang('today')
                    : title}
                </Text>
              </View>
            )}
            sections={this.props.openList.list}
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
    height: convertX(80),
    paddingHorizontal: convertX(16),
  },
  iconWarp: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderColor: '#999999',
    backgroundColor: '#DBDBDB',
  },
  openWay: {
    fontSize: convertX(16),
    lineHeight: convertX(24),
    color: '#333333',
    width: convertX(270),
    marginBottom: convertX(6),
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
  headImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  unbindText: {
    fontSize: 10,
    color: '#0076FF',
    maxWidth: 70,
  },
  unbindView: {
    height: 26,
    borderRadius: 14,
    borderColor: '#0076FF',
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
});

export default connect(
  ({ openList, user }: { openList: openListType; user: UserType }) => ({
    openList,
    user,
  }),
  dispatch =>
    bindActionCreators(
      {
        getOpenList,
        getOpenListOne,
      },
      dispatch
    )
)(OpenList);
