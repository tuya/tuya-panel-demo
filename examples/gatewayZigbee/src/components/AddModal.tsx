/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { FC } from 'react';
import { StyleSheet, View, FlatList, Image } from 'react-native';
import { Utils, TYSdk, TYText, Button, Popup, Divider } from 'tuya-panel-kit';

import Strings from '../i18n';
import Res from '../res';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;
const { sensor, socket, light } = Res;

const appUrl = {
  help: 'device_gw_sub_device_help_list',
  search: 'device_only_search_config_gw_sub',
};

const resetTipList = [
  {
    key: 'sensor',
    icon: sensor,
    name: Strings.getLang('resetSensorName'),
    desc: Strings.getLang('resetSensorDesc'),
  },
  {
    key: 'socket',
    icon: socket,
    name: Strings.getLang('resetSocketName'),
    desc: Strings.getLang('resetSocketDesc'),
  },
  {
    key: 'light',
    icon: light,
    name: Strings.getLang('resetLightName'),
    desc: Strings.getLang('resetLightDesc'),
  },
];

const AddModal: FC = () => {
  const gotoAddPage = url => {
    Popup.close();
    TYSdk.native.jumpTo(`tuyaSmart://${url}?gwId=${TYSdk.devInfo.devId}`);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.rowLine, styles.item]}>
        <Image style={{ width: cx(40), height: cx(40) }} source={item.icon} />
        <View style={styles.itemMain}>
          <TYText style={styles.itemTitle}>{item.name}</TYText>
          <TYText style={styles.itemDesc}>{item.desc}</TYText>
        </View>
      </View>
    );
  };

  const renderLoadingView = () => {
    return <View />;
  };

  return (
    <View style={styles.main}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <TYText style={styles.title}>{Strings.getLang('addTitle')}</TYText>
          <TYText style={styles.desc}>{Strings.getLang('addDesc')}</TYText>
          <View style={styles.listBox}>
            <FlatList
              style={styles.list}
              scrollEnabled={true}
              data={resetTipList}
              renderItem={renderItem}
              keyExtractor={data => data.key}
              ItemSeparatorComponent={() => <Divider color="#E8E8E8" height={1} />}
              ListEmptyComponent={renderLoadingView}
              ListFooterComponent={() => (
                <Button
                  text={Strings.getLang('toMoreSub')}
                  textStyle={styles.moreText}
                  style={{ marginTop: cy(16), width: cx(250) }}
                  activeOpacity={0.8}
                  onPress={() => gotoAddPage(appUrl.help)}
                />
              )}
            />
          </View>
        </View>
        <Divider color="#E8E8E8" height={1} />
        <Button
          text={Strings.getLang('toAdd')}
          textStyle={styles.addBtnText}
          style={styles.addBtn}
          wrapperStyle={styles.addBtnBox}
          activeOpacity={0.8}
          onPress={() => gotoAddPage(appUrl.search)}
        />
      </View>
      <Button
        icon="close"
        iconColor="#FFF"
        wrapperStyle={styles.closeBtn}
        iconSize={cx(12)}
        onPress={() => Popup.close()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    justifyContent: 'center',
    alignItems: 'center',
    width: cx(327),
    paddingTop: cy(50),
  },
  container: {
    height: cy(480),
    borderRadius: cy(16),
    alignSelf: 'center',
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: cx(34),
    height: cx(34),
    borderRadius: cx(17),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  titleContainer: {
    flex: 1,
    paddingTop: cx(36),
    paddingHorizontal: cx(26),
    backgroundColor: '#FFF',
  },
  title: {
    marginBottom: cy(10),
    fontSize: cx(18),
    lineHeight: cx(28),
    fontWeight: 'bold',
    color: '#22242C',
  },
  desc: {
    fontSize: cx(14),
    lineHeight: cx(20),
    color: '#495054',
  },
  listBox: {
    marginTop: cy(26),
  },
  list: {
    paddingHorizontal: cx(6),
  },
  item: {
    justifyContent: 'center',
    paddingVertical: cy(10),
  },
  rowLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    color: '#22242C',
    fontSize: cx(14),
    fontWeight: 'bold',
  },
  itemMain: {
    flex: 1,
    height: cy(36),
    marginLeft: cx(12),
    justifyContent: 'space-around',
  },
  itemDesc: {
    color: '#81828B',
    fontSize: cx(11),
  },
  moreText: {
    fontSize: cx(13),
    color: '#0091FF',
  },
  addBtnBox: {
    width: cx(327),
    height: cy(87),
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    width: cx(220),
    height: cy(40),
    borderRadius: cy(20),
    backgroundColor: '#FF5A28',
  },
  addBtnText: {
    fontSize: cx(14),
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default AddModal;
