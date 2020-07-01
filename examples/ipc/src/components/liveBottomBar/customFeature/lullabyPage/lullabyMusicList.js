/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable react/require-default-props */
import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Image, TouchableOpacity, StatusBar } from 'react-native';
import { TYText, TYSdk, TYFlatList } from 'tuya-panel-kit';
import _ from 'lodash';
import { connect } from 'react-redux';
import TopHeader from '../../../publicComponents/topHeader';
import Strings from '../../../../i18n';
import Res from '../../../../res';
import Config from '../../../../config';
import { backNavigatorLivePlay, backLivePlayWillUnmount } from '../../../../config/click';

const { cx, isIOS, statusBarHeight } = Config;
const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

class LullabyMusicList extends React.Component {
  static propTypes = {
    schema: PropTypes.object,
    ipc_lullaby_list: PropTypes.string,
  };
  constructor(props) {
    super(props);
    this.state = {
      dataList: [],
      currentSong: '0',
    };
  }
  componentDidMount() {
    const { schema, ipc_lullaby_list } = this.props;
    const dpSchema = schema.ipc_lullaby_list;
    const currentSong = ipc_lullaby_list;
    const { range } = dpSchema;
    const dataList = [];
    range.forEach(item => {
      dataList.push({
        key: item,
        renderItem: this.renderCustomItem,
      });
    });
    this.setState({
      dataList,
      currentSong,
    });
    TYEvent.on('deviceDataChange', this.dpDataChange);
  }
  componentWillUnmount() {
    TYEvent.off('deviceDataChange', this.dpDataChange);
    backLivePlayWillUnmount();
  }
  dpDataChange = data => {
    const changedp = data.payload;
    if (changedp.ipc_lullaby_list !== undefined) {
      this.setState({
        currentSong: data.ipc_lullaby_list,
      });
    }
  };
  handleItemPress = item => {
    TYDevice.putDeviceData({
      ipc_lullaby_list: item,
    });
  };
  backLivePage = () => {
    backNavigatorLivePlay();
  };
  renderCustomItem = ({ item, index }) => {
    const { currentSong } = this.state;
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.7}
        onPress={_.throttle(() => this.handleItemPress(item.key), 1000)}
      >
        {currentSong === item.key ? (
          <View style={styles.iconBox}>
            <Image source={Res.lullaby.lullabyPlayVoice} style={styles.iconImg} />
          </View>
        ) : (
          <TYText style={styles.listSerial} numberOfLines={1}>{`${index + 1}`}</TYText>
        )}
        <View style={styles.songBox}>
          <TYText
            numberOfLines={1}
            style={[styles.songName, { color: currentSong === item.key ? '#FFB000' : '#333' }]}
          >
            {Strings.getLang(`ipc_lullaby_song_${item.key}`)}
          </TYText>
        </View>
      </TouchableOpacity>
    );
  };
  render() {
    const { dataList } = this.state;
    return (
      <View style={styles.lullabuMusicListPage}>
        <StatusBar
          barStyle={isIOS ? 'dark-content' : 'light-content'}
          translucent={true}
          backgroundColor="transparent"
        />
        <View style={{ paddingTop: isIOS ? 0 : statusBarHeight, backgroundColor: '#000000' }}>
          <TopHeader
            hasRight={false}
            contentTitle={Strings.getLang('ipc_lullaby_music_list')}
            leftPress={this.backLivePage}
          />
        </View>
        <TYFlatList
          separatorStyle={{ height: 0 }}
          contentContainerStyle={{ paddingTop: 16 }}
          data={dataList}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  lullabuMusicListPage: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  itemContainer: {
    paddingLeft: cx(15),
    flexDirection: 'row',
    height: cx(50),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listSerial: {
    width: cx(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: cx(5),
    fontSize: cx(16),
  },
  songBox: {
    height: '100%',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  songName: {
    fontSize: cx(16),
  },
  iconBox: {
    width: cx(25),
    justifyContent: 'center',
  },
  iconImg: {
    width: '100%',
    resizeMode: 'contain',
    left: -cx(5),
  },
});
const mapStateToProps = state => {
  const { devInfo, dpState } = state;
  const { schema } = devInfo;

  const { ipc_lullaby_list } = dpState;
  return {
    schema,
    ipc_lullaby_list,
  };
};
export default connect(mapStateToProps, null)(LullabyMusicList);
