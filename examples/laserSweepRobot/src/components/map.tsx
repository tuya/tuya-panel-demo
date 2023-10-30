import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Utils, TYFlatList, IconFont, TYText } from 'tuya-panel-kit';
import { IndoorMapUtils, IndoorMapWebApi as LaserUIApi } from '@tuya/rn-robot-map';
import { nativeMapStatusEnum } from '@tuya/rn-robot-map/lib/indoor-map-webview/api';
import Strings from '@i18n';
import Store from '@store';
import MapView from './home/mapView';
import { parseRoomId } from '../utils';
import { DECNumberToHex } from 'protocol/utils/robotUtil';
import { bitmapTypeMap, bitmapTypeMapV2 } from 'protocol/constant';

const { convertY: cy, convertX: cx, width } = Utils.RatioUtils;

const checkIconPath =
  'M288.67 374.37l18.69 25.26a5.217 5.217 0 0 0 7.29 1.09c0.02-0.01 0.04-0.03 0.06-0.04l113.01-86.01a5.216 5.216 0 0 1 6.48 0.13l275.9 228.25a5.22 5.22 0 0 0 6.97-0.29l17.32-16.98a5.212 5.212 0 0 0 0.07-7.37l-0.08-0.08-299.65-292.84a5.221 5.221 0 0 0-7.37 0.08l-0.01 0.01-138.22 142.06a5.206 5.206 0 0 0-0.46 6.73z';

interface IProps {
  fontColor: string;
  iconColor: string;
  laserMapConfig?: any;
  disabled?: boolean;
  selectTags?: string[];
  mode?: 'selectedRoom' | 'smart';
}
interface IState {
  mapId: string;
  disabled: boolean | undefined;
  mode: string | undefined;
  mapRoomData: any;
  selected?: number;
  mapLoadEnd: boolean;
}

interface IroomState {
  id: string; // id
  active: boolean; // 是否选定
  name: string; // 名称
  water: number; // 水箱
  fan: number; // 吸力
  order: number; // 顺序
  tag: string; // 标签
}

export default class MapPartition extends Component<IProps, IState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    laserMapConfig: {},
    disabled: false,
    selectTags: [],
    mode: 'smart',
  };

  constructor(props: IProps) {
    super(props);
    this.state = {
      mapId: '',
      disabled: props.disabled,
      mode: props.mode,
      mapRoomData: new Map(),
      mapLoadEnd: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { disabled } = this.state;
    if (nextProps.disabled !== disabled) {
      this.setState({ disabled: nextProps.disabled });
    }
  }

  onMapId = ({ mapId }: { mapId: string }) => {
    LaserUIApi.setLaserMapStateAndEdit(IndoorMapUtils.getMapInstance(mapId), {
      mapId,
      state: nativeMapStatusEnum.mapSelect,
      edit: true,
    }).then(() => {
      this.setState({ mapId });
    });
  };

  onMapLoadEnd = (success: boolean) => {
    this.setState({ mapLoadEnd: success });
  };

  get data() {
    return [
      {
        value: 'smart',
        title: Strings.getLang(`smart`),
      },
      {
        value: 'selectedRoom',
        title: Strings.getLang(`selectedRoom`),
        subTitle: Strings.getLang(`selectedRoom_subTitle`),
      },
    ];
  }

  getValue = async () => {
    const { mapId, mode } = this.state;
    const { data = [] } = await LaserUIApi.getLaserMapPointsInfo(
      IndoorMapUtils.getMapInstance(mapId),
      {
        mapId,
      }
    );
    if (!data.length) {
      return {
        mode: 'smart',
        roomTags: [],
      };
    }
    const roomTags: Array<number | string> = [];
    data
      .sort((pre, cur) => {
        // 如果返回有排序
        if (typeof pre.order === 'number' && typeof cur.order === 'number') {
          return pre.order - cur.order;
        }
        return 0;
      })
      .forEach((item: { pixel: string }) => {
        const { pixel } = item;
        if (pixel) {
          roomTags.push(parseRoomId(pixel));
        }
      });
    return {
      mode,
      roomTags,
    };
  };

  render() {
    const { laserMapConfig, selectTags = [], fontColor, iconColor } = this.props;
    const { disabled, mapRoomData, selected, mode, mapLoadEnd } = this.state;
    const roomStateList: Array<IroomState> = [];

    const data = Store.mapDataState.getData;
    const { version: v } = data as any;

    const selectRoomData = selectTags.map(tag => {
      let type = bitmapTypeMap.sweep;
      if (v === 2) {
        type = bitmapTypeMapV2.sweep;
      }
      // eslint-disable-next-line new-cap
      return DECNumberToHex(tag, type) || '00';
    });

    mapRoomData.forEach((value, key) => {
      if (value) {
        const { id, tag, water, fan, name } = value;
        // const active = selectTags.includes(tag);
        const order = selectTags.indexOf(tag) + 1; // 没有的情况下+1后为0
        const active = !!order;
        roomStateList.push({
          id, // id
          active, // 是否选定
          name, // 名称
          water, // 水箱
          fan, // 吸力
          order, // 顺序
          tag, // 标签
        });
      }
    });

    return (
      <View style={styles.container}>
        <View
          style={[styles.mapContainer, disabled && { opacity: 0.5 }]}
          pointerEvents={disabled ? 'none' : 'auto'}
        >
          <MapView
            mapDisplayMode="splitMap"
            config={laserMapConfig}
            uiInterFace={{ isCustomizeMode: true, isShowAppoint: false }}
            onMapId={this.onMapId}
            onMapLoadEnd={this.onMapLoadEnd}
            mapLoadEnd={mapLoadEnd}
            selectRoomData={selectRoomData}
            fontColor={fontColor}
            iconColor={iconColor}
            pathVisible={false}
          />
        </View>
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <TYFlatList
            contentContainerStyle={{
              marginTop: cx(16),
              backgroundColor: '#f8f8f8',
            }}
            scrollEnabled={false}
            data={this.data}
            keyExtractor={(item: any) => item.value}
            extraData={selected}
            renderItem={({ item, index }: { item: any; index: number }) => {
              const inUnSelect = item.value !== mode;
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  accessibilityLabel={`Timer_Repeat_Row${index}`}
                  onPress={() => {
                    this.setState({ disabled: item.value === 'smart', mode: item.value });
                  }}
                >
                  <View style={styles.cell}>
                    <View style={{ flex: 1 }}>
                      <TYText style={styles.title}>{item.title}</TYText>
                      {item.subTitle && <TYText style={styles.subTitle}>{item.subTitle}</TYText>}
                    </View>

                    <IconFont
                      style={[inUnSelect && { opacity: 0 }]}
                      d={checkIconPath}
                      color="#44DB5E"
                      size={28}
                      useART={true}
                    />
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
  },

  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent',
    width,
    height: cy(255),
  },

  cell: {
    paddingVertical: cx(10),
    paddingHorizontal: cx(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: cx(48),
  },

  title: {
    fontSize: cx(16),
    backgroundColor: 'transparent',
  },
  subTitle: {
    textAlign: 'left',
    marginTop: 6,
    fontSize: cx(14),
  },
});
