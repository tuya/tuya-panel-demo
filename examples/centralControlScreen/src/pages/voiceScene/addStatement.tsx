import React, { FC, useState } from 'react';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
import { View, StyleSheet, TextInput } from 'react-native';
import { Utils, TYSdk, TYText, TopBar } from 'tuya-panel-kit';
import { alertDialog } from '@utils';
import { useSelector, actions } from '@models';
import Strings from '@i18n';
import { theme } from '@config';

const { convertX: cx } = Utils.RatioUtils;
const MAX_WORD_LEN = 20;

const background = '#FFF';

const AddStatement: FC = () => {
  const { voiceSceneState } = useSelector(state => state);
  const dispatch = useDispatch();

  const [sceneName, setSceneName] = useState('');

  const save = () => {
    // console.log('sceneName: ', sceneName, sceneName);
    if (sceneName.length > MAX_WORD_LEN) {
      alertDialog(Strings.getLang('tooLong'));
      return;
    }
    if (_.isEmpty(sceneName.trim())) {
      alertDialog(Strings.getLang('saying_empty'));
      return;
    }

    // 校验输入内容是否为中文
    if (sceneName.replace(/[\u4e00-\u9fa5]/g, '').length !== 0) {
      alertDialog(Strings.getLang('languageTip'));
      return;
    }
    const _autoRules = _.cloneDeep(voiceSceneState.autoRules);
    const _voiceRules = _.cloneDeep(voiceSceneState.voiceRules);
    const _exist = _.find(_voiceRules, v => v.condition === sceneName);
    if (_exist) {
      alertDialog(Strings.getLang('say_exist'));
      return;
    }
    if (_autoRules.length + _voiceRules.length >= 10) {
      alertDialog(Strings.getLang('rule_over'));
      return;
    }
    _voiceRules.push({ condition: sceneName });

    dispatch(actions.voiceScene.saveVoice(_voiceRules));
    TYSdk.Navigator.pop();
  };

  const _onChangeText = name => {
    setSceneName(name);
  };

  const renderTopBar = () => {
    return (
      <TopBar
        title={Strings.getLang('addStatement')}
        background="transparent"
        onBack={TYSdk.Navigator.pop}
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
    <View style={{ flex: 1 }}>
      {renderTopBar()}
      <View style={styles.center}>
        <TYText style={styles.tip}>{Strings.getLang('saying')}</TYText>
        <View>
          <TextInput
            style={styles.input}
            onChangeText={_onChangeText}
            value={sceneName}
            placeholderTextColor="#A2A3AA"
            underlineColorAndroid="transparent"
            multiline={true}
            placeholder={Strings.getLang('inputTip')}
          />
          <View style={styles.numTipsMain}>
            <TYText
              text={`${sceneName.length}`}
              style={[
                styles.numTips,
                { color: sceneName.length > MAX_WORD_LEN ? 'red' : '#CBCCD3' },
              ]}
            />
            <TYText text={`/${MAX_WORD_LEN}`} style={styles.numTips} />
          </View>
        </View>
        <TYText text={Strings.getLang('numberTip')} style={styles.detailTip} />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: background,
    paddingTop: cx(30),
    paddingHorizontal: cx(18),
  },
  input: {
    width: cx(339),
    height: cx(104),
    borderRadius: cx(8),
    backgroundColor: '#F8F8F8',
    color: '#000',
    fontSize: cx(14),
    padding: cx(16),
    lineHeight: cx(22),
    paddingTop: cx(16),
  },
  tip: {
    color: '#22242C',
    fontSize: cx(16),
    lineHeight: cx(22),
    marginBottom: cx(10),
    fontWeight: 'bold',
  },
  detailTip: {
    color: '#A2A3AA',
    fontSize: cx(13),
    lineHeight: cx(18),
    marginBottom: cx(10),
    marginTop: cx(20),
  },
  numTips: {
    color: '#CBCCD3',
    fontSize: 12,
  },
  numTipsMain: {
    position: 'absolute',
    right: cx(10),
    bottom: cx(10),
    flexDirection: 'row',
  },
});

export default AddStatement;
