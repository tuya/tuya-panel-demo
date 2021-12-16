import React, { FC, useState, useMemo, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  BackHandler,
} from 'react-native';
import _ from 'lodash';
import {
  Modal,
  TYSdk,
  TYText,
  Tabs,
  IconFont,
  Popup,
  Utils,
  Dialog,
  DeprecatedNavigatorRoute,
  TopBar,
} from 'tuya-panel-kit';
import { useSelector, actions } from '@models';
import { alertDialog, jumpToPage, objCompare, hexToRgb } from '@utils';
import { DragSortableView } from '@components';
import { saveVoiceScene, deleteScene } from '@api';
import { theme, statements, conditionsCfg, conditionType } from '@config';
import { ISaveVoiceScene } from '@interface';
import Strings from '@i18n';
import Res from '@res';

const { convertX: cx, width, isIphoneX } = Utils.RatioUtils;
const background = '#F9F9F9';
const CreateScene: FC<DeprecatedNavigatorRoute> = ({ id: routerId }) => {
  const { themeColor } = theme;
  const { voiceSceneState } = useSelector(state => state);
  const dispatch = useDispatch();

  const originData = voiceSceneState;
  const [showList, setShowList] = useState(false);
  const [type, setType] = useState('act');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const voiceSceneStateRef = useRef(voiceSceneState);

  const memoActions = useMemo(() => {
    return voiceSceneState.actions.map((v, k) => {
      const entityName = _.get(v, 'action.entityName', '');
      const txt = entityName ? `${entityName}: ${v.desc}` : v.desc;
      return {
        ...v,
        txt,
        key: `actions_${k}`,
      };
    });
  }, [voiceSceneState.actions]);

  useEffect(() => {
    // 安卓后退按钮兼容
    BackHandler.addEventListener('hardwareBackPress', () => {
      const router = TYSdk.Navigator.getCurrentRoutes();
      // 在当前页面返回时，是否有更改未保存
      if (_.get(_.last(router), 'id') === routerId) {
        clear();
        return true;
      }
    });
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', () => ({}));
    };
  }, []);

  useEffect(() => {
    voiceSceneStateRef.current = voiceSceneState;
  }, [voiceSceneState]);

  const getVoiceSceneList = () => {
    dispatch(actions.async.getVoiceSceneList());
  };

  const save = () => {
    const autoRules = _.get(voiceSceneState, 'autoRules', []);
    const voiceRules = _.get(voiceSceneState, 'voiceRules', []);
    const matchType = _.get(voiceSceneState, 'matchType', '1');
    const id = _.get(voiceSceneState, 'id', null);
    const _request: ISaveVoiceScene = {
      sourceDevId: TYSdk.devInfo.devId,
      name: _.get(voiceSceneState, 'name', ''),
      actions: _.get(voiceSceneState, 'actions', []),
      rules: [],
      scopeId: TYSdk.devInfo.homeId,
    };
    if (!_.isEmpty(autoRules)) {
      _request.rules.push({
        matchType,
        ruleTriggerConditions: autoRules.map(v => ({ condition: v })),
        triggerType: 'auto_condition',
      });
    }
    if (!_.isEmpty(voiceRules)) {
      _request.rules.push({
        ruleTriggerConditions: voiceRules,
        triggerType: 'voice',
      });
    } else {
      alertDialog(Strings.getLang('noVoice'));
      return;
    }
    if (id) {
      _request.id = id;
    }

    TYSdk.mobile.showLoading();
    saveVoiceScene(_request)
      .then(res => {
        TYSdk.mobile.hideLoading();
        if (res) {
          TYSdk.Navigator.pop();
          getVoiceSceneList();
        }
      })
      .catch(err => {
        TYSdk.mobile.hideLoading();
        const errText = _.get(err, 'message', Strings.getLang('error_unknow'));
        alertDialog(errText);
      });
  };

  const actionAdd = item => {
    setShowList(false);
    if (type === 'act') {
      switch (item.id) {
        case 'device':
          jumpToPage('chooseDevice', { type });
          break;
        case 'scene':
          jumpToPage('chooseScene');
          break;
        default:
          jumpToPage('addAction', { type: item.id });
      }
    } else {
      switch (item.id) {
        case 'say':
          jumpToPage('addStatement');
          break;
        case 'device':
          jumpToPage('chooseDevice', { type });
          break;
        default:
          break;
      }
    }
  };

  const _selectCondition = () => {
    const matchType = _.get(voiceSceneState, 'matchType', '1');
    Popup.picker({
      dataSource: conditionType,
      title: Strings.getLang('conditions_selected'),
      cancelText: Strings.getLang('cancel'),
      confirmText: Strings.getLang('confirm'),
      value: matchType,
      onConfirm: value => {
        dispatch(actions.voiceScene.saveScene({ matchType: value }));
        Popup.close();
      },
    });
  };

  const clear = () => {
    const diff = objCompare(originData, voiceSceneStateRef.current);
    if (_.isEmpty(diff)) {
      TYSdk.Navigator.pop();
      return false;
    }
    Dialog.confirm({
      title: Strings.getLang('clearTip'),
      confirmText: Strings.getLang('confirm'),
      cancelText: Strings.getLang('cancel'),
      onConfirm: (data, { close }) => {
        close();
        TYSdk.Navigator.pop();
      },
    });
  };

  const _deleteHandle = (item, index) => {
    const _item = item;
    _item.index = index;
    switch (item.type) {
      case 'voice':
        _deleteRule(_item);
        break;
      case 'auto':
        _deleteRule(_item);
        break;
      default:
        _deleteAction(_item);
    }
  };

  const _editHandle = (item, index) => {
    const itemType = item.actionType;
    switch (itemType) {
      case 'tts':
        jumpToPage('addAction', {
          type: 'response',
          method: 'edit',
          entityId: _.get(item, 'entityId', ''),
          desc: _.get(item, 'desc', ''),
          index,
        });
        break;
      case 'smart_home':
        jumpToPage('chooseDeviceDp', {
          type: itemType,
          method: 'edit',
          devName: _.get(item, 'action.entityName', ''),
          devId: _.get(item, 'entityId', ''),
          index,
        });
        break;
      case 'app_scene':
        jumpToPage('chooseScene', {
          entityId: _.get(item, 'entityId', ''),
          intelligentSceneId: _.get(item, 'action.intelligentSceneId', ''),
          index,
        });
        break;
      default:
        jumpToPage('addAction', {
          type: itemType,
          method: 'edit',
          entityId: _.get(item, 'entityId', ''),
          desc: _.get(item, 'desc', ''),
          duration: _.get(item, 'duration', '0'),
          index,
        });
    }
  };

  const _renderModal = () => {
    const activeCfg = type === 'act' ? _.cloneDeep(statements) : _.cloneDeep(conditionsCfg);
    const optionArray =
      activeCfg.length > 8 ? [activeCfg.slice(0, 8), activeCfg.slice(8)] : [activeCfg];

    const dotLeftBg = carouselIndex && optionArray.length > 1 ? 'rgba(0,0,0,0.2)' : '#FF5A28';
    const dotRightBg = carouselIndex ? '#FF5A28' : 'rgba(0,0,0,0.2)';

    return (
      <Modal style={{ flex: 1, width }} visible={showList} onMaskPress={() => setShowList(false)}>
        <View style={[styles.actionListModal]}>
          <TYText>{Strings.getLang('pleaseChoice')}</TYText>
          <View style={{ flex: 1, width }}>
            <Tabs.TabContent
              preload={false}
              activeIndex={carouselIndex}
              onRelease={(gestureState, index) => setCarouselIndex(index)}
            >
              {optionArray.map((v, idx) => (
                // eslint-disable-next-line react/no-array-index-key
                <View key={idx} style={styles.actionItem}>
                  {_renderActionItem(v)}
                </View>
              ))}
            </Tabs.TabContent>
          </View>
          {optionArray.length > 1 && (
            <View
              style={{
                height: cx(20),
                justifyContent: 'center',
                alignItems: 'center',
                width,
                flexDirection: 'row',
              }}
            >
              <View
                style={{
                  borderRadius: cx(3),
                  marginRight: cx(6),
                  width: cx(6),
                  height: cx(6),
                  backgroundColor: dotLeftBg,
                }}
              />
              <View
                style={{
                  borderRadius: cx(3),
                  width: cx(6),
                  height: cx(6),
                  backgroundColor: dotRightBg,
                }}
              />
            </View>
          )}
        </View>
      </Modal>
    );
  };

  const _renderActionItem = data => {
    if (_.isEmpty(data)) return null;
    return _.map(data, item => (
      <View
        key={item.id}
        style={{
          width: (width - cx(10)) / 3,
          height: cx(78),
          justifyContent: 'center',
          alignItems: 'center',
          marginVertical: cx(15),
        }}
      >
        <TouchableOpacity onPress={() => actionAdd(item)}>
          <View style={styles.actionButton}>
            <Image source={item.icon} style={{ height: cx(52), resizeMode: 'contain' }} />
          </View>
        </TouchableOpacity>
        <TYText text={item.text} numberOfLines={1} style={styles.text} />
      </View>
    ));
  };

  const _renderSceneName = () => {
    const sceneName = _.get(voiceSceneState, 'name', '');
    return (
      <View style={styles.sceneNameContainer}>
        <TYText style={styles.tip}>{Strings.getLang('scene_name')}</TYText>
        <TextInput
          numberOfLines={1}
          placeholderTextColor="#A2A3AA"
          style={styles.input}
          maxLength={10}
          onChangeText={name => dispatch(actions.voiceScene.saveScene({ name }))}
          value={sceneName}
          underlineColorAndroid="transparent"
          placeholder={Strings.getLang('scene_name_tip')}
        />
      </View>
    );
  };

  const _deleteRule = item => {
    const _rules = _.get(_.cloneDeep(voiceSceneState), `${item.type}Rules`, []);
    _rules.splice(item.index, 1);
    if (item.type === 'voice') {
      dispatch(actions.voiceScene.saveVoice(_rules));
      return;
    }
    dispatch(actions.voiceScene.saveAuto(_rules));
  };

  const _deleteAction = item => {
    const _action = _.get(_.cloneDeep(voiceSceneState), 'actions', []);
    _action.splice(item.index, 1);
    dispatch(actions.voiceScene.saveActions(_action));
  };

  const _renderRules = () => {
    const voiceRules = _.get(voiceSceneState, 'voiceRules', []);
    const autoRules = _.get(voiceSceneState, 'autoRules', []);
    const matchType = _.get(voiceSceneState, 'matchType', '1');
    const hasVoiceRules = voiceRules.length > 0;
    const hasAutoRules = autoRules.length > 0;
    return (
      <View style={styles.addStatement}>
        <TYText style={[styles.tip, { marginBottom: 0 }]}>
          {Strings.getLang('active_condition')}
        </TYText>
        <TYText style={[styles.tipDesc]}>{Strings.getLang('active_condition_tip')}</TYText>
        {hasVoiceRules &&
          voiceRules.map((v, k) =>
            renderStatement({ txt: v.condition, type: 'voice', key: k }, k, true)
          )}
        {hasVoiceRules && hasAutoRules && (
          <TYText style={[styles.tip, { marginBottom: cx(10) }]}>
            {Strings.getLang('autorule_or')}
          </TYText>
        )}
        {hasAutoRules && (
          <View>
            <TouchableOpacity
              onPress={() => _selectCondition()}
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignSelf: 'stretch',
              }}
            >
              <TYText style={styles.detailTip}>
                {_.get(
                  _.find(conditionType, v => v.value === matchType),
                  'label',
                  ' '
                )}
              </TYText>
            </TouchableOpacity>
            {autoRules.map((v, k) =>
              renderStatement(
                {
                  txt: `${v.entityName}:${v.exprDisplay}`,
                  type: 'auto',
                  key: k,
                },
                k,
                true
              )
            )}
          </View>
        )}
        <TouchableOpacity onPress={() => jumpToPage('addStatement')}>
          <View style={styles.addButton}>
            <IconFont
              style={[styles.addIcon, { borderColor: themeColor }]}
              color={themeColor}
              size={cx(15)}
              name="+"
            />
            <TYText style={[styles.addText, { color: themeColor }]}>
              {Strings.getLang('conditions_add')}
            </TYText>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const _renderActions = () => {
    return (
      <View style={{ alignItems: 'center' }}>
        <TYText style={styles.tip}>{Strings.getLang('actionTip')}</TYText>
        <TYText style={styles.tipDesc}>{Strings.getLang('actionTip_tips')}</TYText>
        <DragSortableView
          dataSource={memoActions}
          parentWidth={cx(339)}
          childrenWidth={cx(339)}
          childrenHeight={cx(56)}
          marginChildrenBottom={cx(10)}
          scaleStatus="scaleY"
          onDragStart={() => setScrollEnabled(false)}
          onDragEnd={() => setScrollEnabled(true)}
          onDataChange={data => {
            dispatch(actions.voiceScene.saveActions(data.map(v => _.omit(v, ['txt', 'key']))));
          }}
          keyExtractor={item => item.key}
          renderItem={renderStatement}
        />
        <TouchableOpacity
          onPress={() => {
            setShowList(true);
            setType('act');
            setCarouselIndex(0);
          }}
          style={{ marginBottom: cx(30) }}
        >
          <View style={styles.addButton}>
            <IconFont
              style={[styles.addIcon, { borderColor: themeColor }]}
              color={themeColor}
              size={cx(15)}
              name="+"
            />
            <TYText style={[styles.addText, { color: themeColor }]}>
              {Strings.getLang('addAction')}
            </TYText>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const deleteConfirm = () => {
    Dialog.confirm({
      title: Strings.getLang('confirm_delete'),
      confirmText: Strings.getLang('confirm'),
      cancelText: Strings.getLang('cancel'),
      onConfirm: (data, { close }) => {
        close();
        const id = _.get(voiceSceneState, 'id', '');
        if (id) {
          deleteScene(id).then(res => {
            if (res) {
              TYSdk.Navigator.pop();
              getVoiceSceneList();
            }
          });
        } else {
          TYSdk.Navigator.pop();
        }
      },
    });
  };

  const _renderDelete = () => {
    return (
      <TouchableOpacity onPress={deleteConfirm} style={styles.deleteBtn}>
        <TYText style={{ fontSize: cx(16), color: '#A2A3AA' }}>
          {Strings.getLang('scene_delete')}
        </TYText>
      </TouchableOpacity>
    );
  };

  const renderStatement = (item, index, hideEdit = false) => (
    <View
      style={[styles.actionList, { backgroundColor: hexToRgb(themeColor, 0.2) }]}
      key={JSON.stringify(item.txt + index)}
    >
      <TouchableOpacity
        onPress={() => _deleteHandle(item, index)}
        style={styles.removeButton}
        activeOpacity={0.8}
      >
        <IconFont
          style={[styles.subIcon, { backgroundColor: themeColor }]}
          color="#FFF"
          size={cx(20)}
          name="-"
        />
      </TouchableOpacity>
      <TYText style={styles.statementText} numberOfLines={1}>
        {item.txt}
      </TYText>
      {!hideEdit && (
        <TouchableOpacity onPress={() => _editHandle(item, index)} style={{ marginRight: cx(16) }}>
          <Image source={Res.onMove} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderTopBar = () => {
    return (
      <TopBar
        title={Strings.getLang('createScene')}
        background="transparent"
        onBack={clear}
        actions={[
          {
            source: Strings.getLang('save'),
            color: themeColor,
            onPress: save,
          },
        ]}
      />
    );
  };

  const id = _.get(voiceSceneState, 'id', '');
  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      {renderTopBar()}
      <ScrollView
        contentContainerStyle={{ paddingBottom: isIphoneX ? cx(20) : cx(40) }}
        scrollEnabled={scrollEnabled}
      >
        <View style={styles.center}>
          {_renderSceneName()}
          {_renderRules()}
          {_renderActions()}
        </View>
      </ScrollView>
      {!_.isEmpty(id) && _renderDelete()}
      {_renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: cx(18),
    paddingBottom: cx(60),
  },
  addButton: {
    height: cx(56),
    borderRadius: cx(8),
    width: cx(327),
    backgroundColor: '#F0EFF2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    color: '#FF6F3D',
    fontSize: cx(16),
    fontWeight: 'normal',
    marginRight: cx(10),
  },
  statementText: {
    color: '#000',
    fontSize: cx(16),
    fontWeight: 'normal',
    marginRight: cx(10),
    flex: 1,
  },
  tip: {
    color: '#22242C',
    fontSize: cx(16),
    marginBottom: cx(10),
    lineHeight: cx(22),
    fontWeight: 'bold',
    alignSelf: 'stretch',
    textAlign: 'left',
  },
  tipDesc: {
    marginBottom: cx(10),
    fontSize: 13,
    color: '#A2A3AA',
    lineHeight: cx(18),
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  detailTip: {
    color: '#A2A3AA',
    fontSize: cx(13),
    lineHeight: cx(18),
    marginBottom: cx(10),
    alignSelf: 'stretch',
    textAlign: 'left',
  },
  addStatement: {
    marginBottom: cx(40),
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  actionList: {
    height: cx(56),
    borderRadius: cx(8),
    width: cx(339),
    backgroundColor: '#F8F8F8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: cx(10),
  },
  removeButton: {
    width: cx(56),
    height: cx(56),
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionListModal: {
    width,
    height: cx(300),
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    paddingHorizontal: cx(5),
    paddingVertical: cx(20),
  },
  actionItem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: cx(10),
    width,
    height: cx(270),
  },
  actionButton: {
    width: cx(56),
    height: cx(56),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: cx(28),
    // borderWidth: 1,
    // borderColor: 'rgba(0,0,0,0.1)',
  },
  text: {
    marginTop: cx(10),
    fontSize: cx(12),
    color: '#495054',
  },
  sceneNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginBottom: cx(30),
    marginTop: cx(18),
  },
  input: {
    backgroundColor: 'transparent',
    height: cx(32),
    flex: 1,
    color: '#000',
    fontSize: cx(16),
    padding: 0,
    textAlign: 'right',
  },
  addIcon: {
    width: cx(20),
    height: cx(20),
    marginRight: cx(8),
    borderWidth: 1,
    borderRadius: cx(10),
    borderColor: '#FF6F3D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subIcon: {
    backgroundColor: '#FFA85C',
    width: cx(20),
    height: cx(20),
    borderRadius: cx(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    height: isIphoneX ? cx(72) : cx(60),
    paddingBottom: isIphoneX ? cx(12) : 0,
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#FFF',
  },
});

export default CreateScene;
