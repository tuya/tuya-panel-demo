import React, { Component } from 'react';
import { StyleSheet, View, Text, SectionList, InteractionManager } from 'react-native';
import { Utils, Divider, UnitText, TYSdk } from 'tuya-panel-kit';

import Strings from '@i18n';
import { RecordInstance } from '../recordDataCollection';

import { ItemCell } from './components';
import HocSwipeOut from './hoc/hocSwipeoutCell';

const { convertY: cy, convertX: cx, width } = Utils.RatioUtils;
const SwipeoutItem = HocSwipeOut(ItemCell);

// 扫地机清扫记录

interface IProps {
  allArea: number;
  allAreaUnit: string;
  allAreaTitle: string;
  allCount: number;
  allCountUnit: string;
  allCountTitle: string;
  allTime: number;
  allTimeUnit: string;
  allTimeTitle: string;
  cleanTimeTitle: string;
  cleanTimeUnit: string;
  cleanAreaTitle: string;
  cleanAreaUnit: string;
  renderCellItem: () => React.ReactNode;
  is24Hour: boolean;

  allAreaCode: string;
  allCountCode: string;
  allTimeCode: string;
  mapRouteId: string;
  navigation: {
    navigate: (route: string, params) => void;
  };
}

interface IState {
  refreshing: boolean;
  dataSource: Array<any>;
}
export default class RecordsScene extends Component<IProps, IState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    allArea: 0,
    allAreaUnit: '㎡',
    allAreaTitle: '清扫总面积',
    allCount: 0,
    allCountUnit: '',
    allCountTitle: '清扫总次数',
    allTime: 0,
    allTimeUnit: '’',
    allTimeTitle: '清扫总时间',
    renderCellItem: undefined,
    mapRouteId: 'mapHistory',
    is24Hour: false,
    allAreaCode: '',
    allCountCode: '',
    allTimeCode: '',
  };

  constructor(props) {
    super(props);

    this.state = {
      dataSource: [],
      refreshing: false,
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      const time = setTimeout(() => {
        this.getRecord();
        time && clearInterval(time);
      }, 500);
    });
  }

  updateData = () => {
    const { logData, sectionListData } = RecordInstance.instance.getStore();
    this.setState({
      dataSource: sectionListData,
    });
  };

  getRecord = async () => {
    try {
      await RecordInstance.instance.fetch();
      this.updateData();
    } catch (e) {
      console.log('e???', e);
    }
  };

  checkDpExit = (code: string) => {
    if (code) {
      return true;
    }
    return TYSdk.device.checkDpExist(code);
  };

  getTopData() {
    const {
      allAreaCode,
      allArea,
      allAreaUnit,
      allAreaTitle,
      allCountCode,
      allCount,
      allCountUnit,
      allCountTitle,
      allTimeCode,
      allTime,
      allTimeUnit,
      allTimeTitle,
    } = this.props;
    const data = [
      {
        value: allArea,
        unit: allAreaUnit,
        title: allAreaTitle,
        visible: this.checkDpExit(allAreaCode),
      },
      {
        value: allCount,
        unit: allCountUnit,
        title: allCountTitle,
        visible: this.checkDpExit(allCountCode),
      },
      {
        value: allTime,
        unit: allTimeUnit,
        title: allTimeTitle,
        visible: this.checkDpExit(allTimeCode),
      },
    ];
    return data.filter(i => i.visible);
  }

  loadMore = () => {
    const { hasNextPage, isRequesting } = RecordInstance.instance.getStatus();

    if (hasNextPage && !isRequesting) {
      this.getRecord();
    }
  };

  onRefresh = () => {
    RecordInstance.instance.init();
    const { isRequesting } = RecordInstance.instance.getStatus();

    if (!isRequesting) {
      this.getRecord();
    }
  };

  renterTopItem(d, k) {
    const color = '#4D4D4D';
    return (
      <View key={k} style={styles.itemContainer}>
        <View style={styles.valueContainer}>
          <UnitText valueSize={cx(24)} valueColor={color} value={`${d.value}`} />
          <Text style={[styles.textUnit, { color }]}>{d.unit}</Text>
        </View>
        <Text style={[styles.textTitle, { color }]}>{d.title}</Text>
      </View>
    );
  }

  renderTop() {
    const datas = this.getTopData();
    return <View style={styles.top}>{datas.map((d, k) => this.renterTopItem(d, k))}</View>;
  }

  renderItem = params => {
    const {
      renderCellItem,
      cleanTimeTitle,
      cleanAreaTitle,
      cleanTimeUnit,
      cleanAreaUnit,
      mapRouteId,
      is24Hour,
      navigation,
    } = this.props;
    const { index, item } = params;
    const { id } = RecordInstance.instance.parseOneRecord(item);

    const prop = {
      cleanTimeTitle,
      cleanAreaTitle,
      cleanTimeUnit,
      cleanAreaUnit,
      mapRouteId,
      is24Hour,
      navigation,
    };

    if (renderCellItem) {
      return renderCellItem({ ...prop, ...params });
    }

    return (
      <SwipeoutItem
        key={`swipeout-${index}`}
        onItemDeletePress={async () => {
          await RecordInstance.instance.deleteRecordById(id);
          this.updateData();
        }}
        {...params}
        {...prop}
      />
    );
  };

  renderSeparator(sectionID, rowID) {
    return (
      <Divider
        key={rowID}
        style={styles.line}
        width={width - cx(44)}
        height={cy(0.5)}
        color="#f8f8f8"
      />
    );
  }

  renderEmpty() {
    return <Text style={styles.empty}>{Strings.getLang('noRecords')}</Text>;
  }

  renderSectionHeader = ({ section: { title } }) => (
    <View>
      <Text style={styles.sectionHeader}>{title}</Text>
      {this.renderSeparator()}
    </View>
  );

  /**
   * 记录汇总信息，有值则展示，没有不展示
   */
  showTop = () => {
    const { allArea, allCount, allTime } = this.props;
    return allArea || allCount || allTime;
  };

  render() {
    const { refreshing, dataSource } = this.state;
    return (
      <View style={styles.container}>
        {this.renderTop()}
        <SectionList
          style={styles.list}
          renderItem={this.renderItem}
          renderSectionHeader={this.renderSectionHeader}
          ListEmptyComponent={this.renderEmpty}
          ItemSeparatorComponent={this.renderSeparator}
          renderSectionFooter={this.renderSeparator}
          sections={dataSource}
          onRefresh={this.onRefresh}
          refreshing={refreshing}
          // onEndReached={this.loadMore}
          onEndReachedThreshold={20}
          initialNumToRender={10}
          keyExtractor={(item, index) => JSON.stringify(item)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  list: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },

  empty: {
    fontSize: cx(20),
    color: '#303030',
    textAlign: 'center',
    marginTop: cy(16),
  },

  line: {
    marginLeft: cx(44),
  },

  itemContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  top: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width,
    paddingHorizontal: cx(20),
    paddingVertical: cx(10),
  },

  textTitle: {
    fontSize: cx(10),
    color: 'rgba(255,255,255, 0.8)',
    marginTop: cy(6),
    backgroundColor: 'transparent',
  },

  textUnit: {
    fontSize: cx(10),
    color: 'rgba(255,255,255, 1)',
    marginTop: cy(2),
    marginLeft: cx(-3),
    backgroundColor: 'transparent',
  },

  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionHeader: {
    color: '#A2A3AA',
    fontSize: 14,
    paddingLeft: 20,
    paddingVertical: 10,
    width,
  },
});
