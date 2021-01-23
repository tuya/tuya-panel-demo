import React, { FC, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { TYSdk, TYText, Utils } from 'tuya-panel-kit';

import Strings from '@i18n';

import SubDevItem from '../components/SubDevItem';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;
interface SubDevItem {
  devId: string;
}

interface MainProps {
  devList: SubDevItem[];
}

const Main: FC<MainProps> = ({ devList }) => {
  const [roomInfo, setRoomInfo] = useState({});
  useEffect(() => {
    TYSdk.native.getRoomsInCurrentHome(
      d => {
        const data = {};
        d.forEach(item => {
          data[item.roomId] = item.name;
        });
        setRoomInfo(data);
      },
      e => console.log(e)
    );
  }, []);

  const renderItem = useCallback(devInfo => {
    return <SubDevItem devInfo={devInfo} roomInfo={roomInfo} />;
  }, []);
  return (
    <View style={styles.main}>
      <TYText style={styles.title} numberOfLines={1}>
        {Strings.getLang('subDevTitle')}
      </TYText>
      {devList.length > 0 ? (
        <FlatList
          data={devList}
          keyExtractor={(item: SubDevItem) => item.devId}
          extraData={devList}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: cy(60) }}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  title: {
    color: '#81828B',
    fontSize: cx(15),
    margin: cx(15),
  },
});

export default Main;
