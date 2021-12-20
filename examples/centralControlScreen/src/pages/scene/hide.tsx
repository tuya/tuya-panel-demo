import React, { FC, useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Utils, TopBar, TYSdk } from 'tuya-panel-kit';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import Strings from '@i18n';
import Res from '@res';
import { theme } from '@config';
import { hideResource } from '@api';
import { EmptyView, SceneItem } from '@components';
import { useSelector, actions } from '@models';
import { ISceneItem, EResourceType } from '@interface';
import { alertDialog, back } from '@utils';

const { convertX: cx } = Utils.RatioUtils;

const SceneRestore: FC = () => {
  const { displayedSceneList } = useSelector(state => state);
  const dispatch = useDispatch();

  const [selectedSceneIds, setSelectedSceneIds] = useState<string[]>([]);

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    dispatch(actions.async.getSceneList());
  };

  const save = () => {
    if (!selectedSceneIds.length) {
      return alertDialog(Strings.getLang('noChooseScenes'));
    }
    TYSdk.mobile.hideLoading();
    hideResource(EResourceType.scene, selectedSceneIds)
      .then((res: any) => {
        getData();
        TYSdk.mobile.hideLoading();
        alertDialog(Strings.getLang('saveSuccess'), back);
      })
      .catch((err: any) => {
        console.log(err);
        TYSdk.mobile.hideLoading();
        alertDialog(Strings.getLang('saveFail'), back);
      });
  };

  const handleChoose = (id: string) => {
    let list = _.cloneDeep(selectedSceneIds);
    if (list.includes(id)) {
      list = list.filter(d => d !== id);
    } else {
      list.push(id);
    }
    setSelectedSceneIds(list);
  };

  const renderItem = ({ item }: { item: ISceneItem }) => {
    const { id } = item;
    return (
      <View style={styles.item}>
        <SceneItem
          {...item}
          isSelect={selectedSceneIds.includes(id)}
          onPress={() => handleChoose(id)}
        />
      </View>
    );
  };

  const renderTopBar = () => {
    return (
      <TopBar
        title={Strings.getLang('sceneHide')}
        background="transparent"
        onBack={back}
        actions={[
          {
            source: Strings.getLang('confirm'),
            color: theme.themeColor,
            onPress: save,
          },
        ]}
      />
    );
  };

  const renderList = () => {
    return (
      <FlatList
        data={displayedSceneList}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        disableVirtualization={false}
        initialNumToRender={8}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyView
            text={Strings.getLang('emptyHideScenes')}
            addText={Strings.getLang('add')}
            iconStyle={{ width: cx(160), height: cx(160) }}
            icon={Res.noneScenes}
            hideAddBtn={true}
          />
        }
        bounces={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderTopBar()}
      {renderList()}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    paddingHorizontal: cx(16),
    marginBottom: cx(12),
    backgroundColor: 'transparent',
  },
});
export default SceneRestore;
