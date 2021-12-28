import React, { FC, useCallback, useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, Image, FlatList } from 'react-native';
import { Utils, TYSdk, Dialog, TopBar } from 'tuya-panel-kit';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import Strings from '@i18n';
import Res from '@res';
import { theme } from '@config';
import { SceneItem, EmptyView, Swipeout } from '@components';
import { hideResource } from '@api';
import { useSelector, actions } from '@models';
import { EResourceType, ISceneItem } from '@interface';
import { jumpToPage, back, showToast } from '@utils';

const { convertX: cx } = Utils.RatioUtils;

const Scene: FC = () => {
  const { displayedSceneList } = useSelector(state => state);
  const dispatch = useDispatch();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectSceneId, setSelectSceneId] = useState('');

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    dispatch(actions.async.getSceneList());
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await getData();
    setIsRefreshing(false);
  };

  const selectItem = (sceneId: string) => {
    setSelectSceneId(selectSceneId && selectSceneId === sceneId ? '' : sceneId);
  };

  const deleteChoose = (id: string) => {
    Dialog.confirm({
      title: Strings.getLang('tips'),
      subTitle: Strings.getLang('hideSceneTips'),
      confirmText: Strings.getLang('confirm'),
      cancelText: Strings.getLang('cancel'),
      onConfirm: (data, { close }) => {
        close();
        hideResource(EResourceType.scene, [id])
          .then(async (res: any) => {
            await getData();
            showToast(Strings.getLang('hideSuccess'));
          })
          .catch((err: any) => {
            console.log(err);
            showToast(Strings.getLang('hideFail'));
          });
      },
    });
  };

  const renderItem = ({ item }: { item: ISceneItem }) => {
    const { id } = item;
    return (
      <Swipeout
        autoClose={true}
        style={styles.swipe}
        buttonWidth={cx(60)}
        rowID={id}
        close={selectSceneId !== id}
        onClose={() => setSelectSceneId('')}
        right={[
          {
            text: Strings.getLang('delete'),
            onPress: () => deleteChoose(id),
            backgroundColor: 'transparent',
            content: (
              <View style={[styles.row, styles.delete]}>
                <Image source={Res.hide} style={{ tintColor: '#FFF' }} />
              </View>
            ),
          },
        ]}
      >
        <SceneItem
          {...item}
          onPress={() => selectItem(id)}
          onLongPress={() => {
            jumpToPage('sceneHide');
          }}
        />
      </Swipeout>
    );
  };

  const renderTopBar = () => {
    return (
      <TopBar
        title={Strings.getLang('scenes')}
        background="transparent"
        onBack={back}
        actions={[
          {
            source: Res.hide,
            color: theme.fontColor,
            onPress: () => jumpToPage('sceneRestore'),
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
        style={styles.list}
        onRefresh={onRefresh}
        refreshing={isRefreshing}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyView
            text={Strings.getLang('addScenesTitle')}
            addText={Strings.getLang('add')}
            icon={Res.emptyScenes}
            hideAddBtn={true}
            onPress={() => jumpToPage('sceneRestore')}
          />
        }
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
const styles = StyleSheet.create<any>({
  container: {
    flex: 1,
  },
  row: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingVertical: cx(20),
  },
  swipe: {
    paddingHorizontal: cx(16),
    marginBottom: cx(12),
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
  },
  delete: {
    width: cx(52),
    height: cx(74),
    backgroundColor: '#FF4C4C',
    borderRadius: cx(12),
    marginLeft: cx(8),
  },
});
export default Scene;
