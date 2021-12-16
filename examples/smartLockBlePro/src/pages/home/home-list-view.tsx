import React, { useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Utils, ControllerBar, TYText, IconFont } from 'tuya-panel-kit';
import Res from '@res';
import { useNav, useGetState } from '@hooks';
import Strings from '@i18n';
import { StatusData } from '@interface';

const { convertX: cx, width } = Utils.RatioUtils;
interface IProps {
  showEle: boolean;
  statusData: StatusData[];
}
type PageId = 'family' | 'set';

const HomeListView = (props: IProps) => {
  const { navigationPush } = useNav();
  const { fontColor, themeColor, devInfo } = useGetState();
  const { devId } = devInfo;
  const commonProps = useRef({
    style: { borderRadius: 0 },
    textStyle: { color: '#666', fontSize: 12 },
    size: cx(32),
  }).current;

  const { showEle, statusData } = props;

  const goToNextPage = (id: PageId) => {
    navigationPush(id, {
      title: Strings.getLang(id),
    });
  };

  const getData = () => {
    const listCommonProps = {
      activeOpacity: 0.8,
      style: { width: cx(32), height: cx(32) },
      textStyle: { marginTop: 0, color: fontColor },
      iconColor: fontColor,
    };
    return [
      {
        key: 'family',
        image: Res.temp,
        text: Strings.getLang('family'),
        onPress: () => goToNextPage('family'),
      },
      {
        key: 'set',
        image: Res.temp,
        text: Strings.getLang('set'),
        onPress: () => goToNextPage('set'),
      },
    ]
      .map(data => ({
        ...listCommonProps,
        ...data,
      }))
      .filter(i => !!i.key);
  };

  const data = useMemo(() => getData(), [devId]);

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      {showEle ? (
        <ControllerBar
          style={styles.controllerBar}
          button={statusData.map((_data: StatusData) => ({
            ..._data,
            ...commonProps,
          }))}
          backgroundColor="transparent"
        />
      ) : (
        <View />
      )}
      <View style={{ borderRadius: 8, overflow: 'hidden' }}>
        {data.map((item, index) => {
          return (
            <TouchableOpacity
              key={item.key as string}
              activeOpacity={1}
              style={styles.itemWarp}
              onPress={item.onPress}
            >
              <View style={[styles.itemContent, { backgroundColor: themeColor }]}>
                <Image source={item.image} style={styles.itemImage} resizeMode="contain" />
              </View>
              <View style={[styles.content, data.length - 1 === index && { borderBottomWidth: 0 }]}>
                <TYText color="#333" size={cx(16)} text={item.text} />
                <IconFont
                  style={{ marginRight: cx(36) }}
                  name="arrow"
                  size={14}
                  color="rgba(0, 0, 0, 0.3)"
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
export default HomeListView;

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    marginHorizontal: cx(12),
    borderRadius: 8,
  },
  controllerBar: {
    height: 72,
    justifyContent: 'center',
  },
  itemWarp: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: cx(64),
    alignItems: 'center',
    paddingHorizontal: cx(16),
  },
  itemContent: {
    width: cx(40),
    height: cx(40),
    borderRadius: cx(20),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: cx(40),
    height: cx(40),
  },
  content: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: cx(64),
    marginLeft: cx(12),
    alignItems: 'center',
    width: width - cx(68),
    borderColor: '#e6e6e6',
    justifyContent: 'space-between',
  },
});
