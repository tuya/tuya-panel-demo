import React, { FC, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { TYText, Utils, Dialog, TYSdk } from 'tuya-panel-kit';
import { useDispatch } from 'react-redux';
import { useSelector, actions } from '@models';
import Strings from '@i18n';

import SubDevItem from '../../components/SubDevItem';
import { bleSubDevChange, sigmeshSubDevChange } from '../../api';
import { isSigMeshGateway, isSigMesh } from '../../utils';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;
interface SubDevId {
  devId: string;
}

interface MainProps {
  devList: SubDevId[];
}

const Main: FC<MainProps> = ({ devList }) => {
  const dispatch = useDispatch();
  const roomInfo = useSelector(state => state.deviceStore.roomInfo);
  // 获取SIG Mesh设备的meshId
  const getDeleteMeshId = () => {
    const { meshId, sigmeshId, capability } = TYSdk.devInfo;
    const deleteMeshId = isSigMeshGateway(capability) ? sigmeshId : meshId;
    return deleteMeshId;
  };
  // 删除子设备
  const deleteDev = info => {
    const { capability, nodeId, uuid, devId } = info;
    const deleteMeshId = getDeleteMeshId();
    const deviceId = TYSdk.devInfo.devId;
    let deleteFetch;
    if (isSigMesh(capability)) {
      // SIG Mesh子设备的添加和删除
      deleteFetch = sigmeshSubDevChange(deviceId, [nodeId], deleteMeshId);
    } else {
      // 蓝牙子设备的添加和删除
      const params = [{ uuid, devId }];
      deleteFetch = bleSubDevChange(deviceId, params, null);
    }
    deleteFetch.then(() => {
      dispatch(actions.customize.getSubDevList(TYSdk.devInfo.devId));
    });
  };
  const deletePop = info => {
    Dialog.confirm({
      title: Strings.getLang('delete'),
      subTitle: Strings.getLang('deleteTip'),
      cancelText: Strings.getLang('cancel'),
      confirmText: Strings.getLang('confirm'),
      onConfirm: (_, { close }) => {
        deleteDev(info);
        close();
      },
    });
  };
  const renderItem = useCallback(data => {
    return <SubDevItem data={data} roomInfo={roomInfo} deleteHandle={() => deletePop(data.item)} />;
  }, []);
  return (
    <View style={styles.main}>
      <TYText style={styles.title} numberOfLines={1}>
        {Strings.getLang('subDevTitle')}
      </TYText>
      {devList.length > 0 ? (
        <FlatList
          data={devList}
          keyExtractor={(item: SubDevId) => item.devId}
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
    fontSize: cx(14),
    margin: cx(15),
  },
});

export default Main;
