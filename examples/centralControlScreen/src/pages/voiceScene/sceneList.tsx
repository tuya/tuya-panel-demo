/* eslint-disable react/destructuring-assignment */
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import {
  Utils,
  TYText,
  TYSdk,
  SwitchButton,
  TYFlatList,
  DeprecatedNavigatorRoute,
  TopBar,
} from 'tuya-panel-kit';
import { disableVoiceScene, enableVoiceScene } from '@api';
import { EmptyView } from '@components';
import { alertDialog, jumpToPage } from '@utils';
import { useSelector, actions } from '@models';
import { theme, statements, conditionsCfg } from '@config';
import Res from '@res';
import { IVoiceSceneItem } from '@interface';
import Strings from '@i18n';

const MAX_VOICE_SCENE_NUM = 20;
const { convertX: cx } = Utils.RatioUtils;

const SceneList: FC<DeprecatedNavigatorRoute> = ({ id }) => {
  const { voiceSceneListState } = useSelector(state => state);
  const dispatch = useDispatch();

  useEffect(() => {
    TYSdk.event.on('NAVIGATOR_ON_DID_FOCUS', data => {
      const routeId = _.get(data, 'id', '');
      // 作用是：每次进入场景列表时都重新获取场景数据，不管是返回还是跳转到的这个页面
      if (routeId === id) {
        getVoiceSceneData();
      }
    });
    return () => TYSdk.event.off('NAVIGATOR_ON_DID_FOCUS');
  }, []);

  const getVoiceSceneData = () => {
    dispatch(actions.async.getVoiceSceneList());
  };

  // 添加语音场景
  const add = () => {
    // 判断现有场景是否已经达到最大数量。最大数量的限制可根据需要自行调整
    if (voiceSceneListState.length >= MAX_VOICE_SCENE_NUM) {
      alertDialog(Strings.getLang('scene_over'));
      return;
    }
    dispatch(actions.voiceScene.resetScene());
    jumpToPage('createScene', { type: 'create' });
  };

  const _edit = (item: IVoiceSceneItem) => {
    const { actions: itemActions, rules, id, name } = item;
    const voiceRules = _.get(
      _.find(rules, v => v.triggerType === 'voice'),
      'ruleTriggerConditions',
      []
    );
    const autoRules = _.get(
      _.find(rules, v => v.triggerType === 'auto_condition'),
      'ruleTriggerConditions',
      []
    );
    dispatch(
      actions.voiceScene.saveScene({
        name,
        id,
        matchType: _.get(
          _.find(rules, v => v.triggerType === 'auto_condition'),
          'matchType',
          '1'
        ),
        voiceRules,
        autoRules: autoRules.map(av => _.get(av, 'autoCondition', [])),
        actions: itemActions,
      })
    );
    jumpToPage('createScene', { type: 'edit' });
  };

  const _renderAutoRules = (autoRules, matchType) => {
    return (
      <View style={styles.detailIcons}>
        {autoRules
          .map(av => _.get(av, 'autoCondition', []))
          .slice(0, 3)
          .map((v, k) => {
            const _rule = conditionsCfg.find(cv => cv.id === 'device');
            const _seq =
              matchType === '1'
                ? Strings.getLang('conditions_or')
                : Strings.getLang('conditions_and');
            const total = autoRules.map(av => _.get(av, 'autoCondition', [])).slice(0, 3).length;
            const showSep = k + 1 < total;
            const _key = `autoRules_${v.id}_${k}`;
            return (
              <View key={_key} style={styles.iconsView}>
                <Image style={styles.icons} source={_rule?.icon} />
                {showSep && (
                  <TYText
                    text={_seq}
                    color="#22242C"
                    size={cx(13)}
                    style={{
                      marginLeft: cx(8),
                    }}
                  />
                )}
                {k === 2 && autoRules.length > 3 && (
                  <TYText
                    text="..."
                    color="#22242C"
                    size={cx(13)}
                    style={{
                      marginLeft: cx(4),
                    }}
                  />
                )}
              </View>
            );
          })}
      </View>
    );
  };

  const renderItem = ({ item }: { item: IVoiceSceneItem }) => {
    const { actions: itemActions, rules, id: itemId, name, enabled } = item;
    const autoRules = _.get(
      _.find(rules, v => v.triggerType === 'auto_condition'),
      'ruleTriggerConditions',
      []
    );
    const voiceRules = _.get(
      _.find(rules, v => v.triggerType === 'voice'),
      'ruleTriggerConditions',
      []
    );
    const matchType = _.get(
      _.find(rules, v => v.triggerType === 'auto_condition'),
      'matchType',
      '1'
    );
    return (
      <View key={`items_${itemId}`} style={[styles.itemView]}>
        <TouchableOpacity onPress={() => _edit(item)} style={{ flex: 1, alignSelf: 'stretch' }}>
          <View style={styles.nameContainer}>
            <TYText
              text={name}
              color="#22242C"
              size={cx(16)}
              weight="500"
              style={{
                opacity: enabled ? 1 : 0.5,
              }}
            />
            <SwitchButton
              size={{ width: cx(38), height: cx(23), activeSize: cx(22) }}
              value={!!enabled}
              onTintColor={theme.themeColor || '#00CC99'}
              onValueChange={value => {
                if (value) {
                  enableVoiceScene(itemId)
                    .then(() => {
                      getVoiceSceneData();
                    })
                    .catch(err => console.log(err));
                } else {
                  disableVoiceScene(itemId)
                    .then(() => {
                      getVoiceSceneData();
                    })
                    .catch(err => console.log(err));
                }
              }}
            />
          </View>
          <View style={{ opacity: enabled ? 1 : 0.5 }}>
            <View style={styles.detailContainer}>
              <TYText text={Strings.getLang('scene_condition')} style={styles.detailBaseTitle} />
              {voiceRules.length > 0 && (
                <TYText
                  text={`${Strings.getLang('say_to_tuya')}${voiceRules[0].condition}`}
                  color="#495054"
                  size={cx(13)}
                  style={{ flex: 1 }}
                />
              )}
              {voiceRules.length === 0 &&
                autoRules.length > 0 &&
                _renderAutoRules(autoRules, matchType)}
            </View>
            {voiceRules.length > 0 && autoRules.length > 0 && (
              <View style={styles.detailContainer}>
                <TYText
                  text={Strings.getLang('autorule_or')}
                  style={[
                    styles.detailBaseTitle,
                    {
                      color: '#495054',
                      fontWeight: '100',
                    },
                  ]}
                />
                {_renderAutoRules(autoRules, matchType)}
              </View>
            )}
            <View style={styles.detailContainer}>
              <TYText text={Strings.getLang('action_execute')} style={styles.detailBaseTitle} />
              <View style={styles.detailIcons}>
                {itemActions.slice(0, 6).map((v, k) => {
                  const _actions =
                    _.find(statements, sv => sv.action === v.actionType) || statements[0];
                  return (
                    <View key={`actions_${v.id}`} style={styles.iconsView}>
                      <Image style={styles.icons} source={_actions.icon} />
                      {k === 5 && itemActions.length > 6 && (
                        <TYText
                          text="..."
                          size={cx(13)}
                          color="#22242C"
                          style={{ marginLeft: cx(4) }}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTopBar = () => {
    return (
      <TopBar
        title={Strings.getLang('voiceScene')}
        background="transparent"
        onBack={TYSdk.Navigator.pop}
        actions={[
          {
            name: 'plus',
            color: '#000',
            size: 16,
            onPress: add,
          },
        ]}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {renderTopBar()}
      <View style={styles.center}>
        {!_.isEmpty(voiceSceneListState) && (
          <TYFlatList
            style={styles.listStyle}
            ItemSeparatorComponent={null}
            scrollEnabled={true}
            data={voiceSceneListState.map((v, k) => ({ key: `voiceSceneList_${k}`, ...v }))}
            renderItem={renderItem}
          />
        )}
        {_.isEmpty(voiceSceneListState) && (
          <EmptyView
            text={Strings.getLang('scene_create_tip')}
            addText={Strings.getLang('add')}
            icon={Res.emptyVoice}
            style={{ flex: 1 }}
            onPress={() => add()}
          />
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  itemView: {
    marginBottom: cx(10),
    backgroundColor: '#FFF',
    marginHorizontal: cx(16),
    paddingVertical: cx(20),
    paddingBottom: cx(22),
    alignSelf: 'stretch',
    paddingHorizontal: cx(28),
  },
  listStyle: {
    flex: 1,
    marginTop: cx(20),
    alignSelf: 'stretch',
    paddingBottom: cx(20),
  },
  center: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
  },
  nameContainer: {
    height: cx(30),
    flexDirection: 'row',
    marginBottom: cx(20),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailContainer: {
    flexDirection: 'row',
    marginBottom: cx(10),
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  detailIcons: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    maxWidth: cx(260),
    overflow: 'hidden',
    paddingHorizontal: cx(16),
    paddingVertical: cx(6),
    borderRadius: cx(24),
    flexDirection: 'row',
  },
  iconsView: {
    flexDirection: 'row',
    marginHorizontal: cx(4),
    height: cx(30),
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  icons: {
    height: cx(20),
    width: cx(20),
    resizeMode: 'contain',
  },
  detailBaseTitle: {
    color: '#22242C',
    fontSize: cx(14),
    marginRight: cx(10),
    fontWeight: '500',
  },
});

export default SceneList;
