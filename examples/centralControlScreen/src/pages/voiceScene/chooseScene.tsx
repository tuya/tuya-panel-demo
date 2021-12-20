import React, { FC, useState, useEffect } from 'react';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Utils, TYSdk, TopBar, TYText, DeprecatedNavigatorRoute } from 'tuya-panel-kit';
import { ButtonRadios } from '@components';
import { useSelector, actions } from '@models';
import { getIotSceneList } from '@api';
import { ISceneForVoiceItem } from '@interface';
import { alertDialog, back } from '@utils';
import Strings from '@i18n';
import { statements, theme } from '@config';

const { convertX: cx } = Utils.RatioUtils;
const background = '#FFF';
interface ISceneTouchProps extends DeprecatedNavigatorRoute {
  intelligentSceneId?: string;
  index?: number;
}

type ISceneTouchItem = {
  isClick: boolean;
} & ISceneForVoiceItem;

const SceneTouch: FC<ISceneTouchProps> = ({ intelligentSceneId, index = 0 }) => {
  const { voiceSceneState } = useSelector(state => state);
  const dispatch = useDispatch();

  const [data, setData] = useState<ISceneTouchItem[]>([]);
  const [selectedId, setSelectedId] = useState(intelligentSceneId);

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    TYSdk.mobile.showLoading();
    getIotSceneList()
      .then(d => {
        const needData = d.map(item => ({
          ...item,
          isClick: item.id === selectedId,
        }));
        setData(needData);
        TYSdk.mobile.hideLoading();
      })
      .catch(err => {
        console.log(err);
        TYSdk.mobile.hideLoading();
      });
  };
  const isClick = idx => {
    const need = data.map(item => ({
      ...item,
      isClick: false,
    }));
    need[idx].isClick = true;
    setData(need);
    setSelectedId(need[idx].id);
  };

  const save = () => {
    const actionState = _.cloneDeep(_.get(voiceSceneState, 'actions', []));
    const _selectedScene = _.find(data, v => v.isClick) || ({} as ISceneTouchItem);
    if (_.isEmpty(_selectedScene)) {
      alertDialog(Strings.getLang('scene_select'));
      return;
    }
    const args = {
      action: {
        intelligentSceneId: _selectedScene.id,
      },
      desc: _selectedScene.name,
      actionType: _.get(
        _.find(statements, v => v.id === 'scene'),
        'action',
        'app_scene'
      ),
      entityId: _selectedScene.id,
    };
    if (intelligentSceneId) {
      actionState[index] = args;
    } else {
      if (actionState.length >= 20) {
        alertDialog(Strings.getLang('action_over'));
        return;
      }
      actionState.push(args);
    }
    dispatch(actions.voiceScene.saveActions(actionState));
    back();
  };

  const renderItem = () => {
    return data.map((item, idx) => (
      <TouchableOpacity key={item.id} onPress={() => isClick(idx)} activeOpacity={0.8}>
        <View style={styles.timeItem}>
          <TYText style={[styles.timeText, { flex: 1 }]} numberOfLines={1}>
            {item.name}
          </TYText>
          <ButtonRadios active={item.isClick} />
        </View>
      </TouchableOpacity>
    ));
  };

  const renderTopBar = () => {
    return (
      <TopBar
        title={Strings.getLang('voiceScene')}
        background="transparent"
        onBack={back}
        actions={[
          {
            source: Strings.getLang('save'),
            color: theme.themeColor,
            onPress: save,
          },
        ]}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      {renderTopBar()}
      <ScrollView>
        <TYText
          style={[
            styles.timeText,
            {
              fontWeight: 'bold',
              marginBottom: cx(5),
              marginTop: cx(18),
              marginLeft: cx(16),
            },
          ]}
        >
          {Strings.getLang('choiceTouchScene')}
        </TYText>
        <View style={styles.center}>{renderItem()}</View>
      </ScrollView>
    </View>
  );
};
SceneTouch.defaultProps = {
  intelligentSceneId: '',
  index: -1,
};

const styles = StyleSheet.create({
  timeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: cx(17),
    marginHorizontal: cx(16),
  },
  timeText: {
    color: '#22242C',
    fontSize: cx(16),
    lineHeight: cx(22),
  },
  center: {
    flex: 1,
    backgroundColor: background,
  },
});

export default SceneTouch;
