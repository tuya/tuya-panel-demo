import React, { FC, useState } from 'react';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
import { View, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import {
  Utils,
  TYText,
  TopBar,
  TYSdk,
  Modal,
  Picker,
  DeprecatedNavigatorRoute,
} from 'tuya-panel-kit';
import { alertDialog, back } from '@utils';
import { actions, useSelector } from '@models';
import { theme, statementInfo, statements } from '@config';
import Strings from '@i18n';
import Res from '@res';
import { IVoiceSceneAction, EActionType } from '@interface';

const { convertX: cx, width, isIphoneX } = Utils.RatioUtils;
const background = '#FFF';
const { themeColor } = theme;

interface IAddActionProps extends DeprecatedNavigatorRoute {
  type?: string;
  method?: string;
  entityId?: string;
  desc?: string;
  index?: number;
  duration?: number;
}

const AddAction: FC<IAddActionProps> = ({
  type = '',
  method = 'add',
  entityId,
  desc,
  index,
  duration = 0,
}) => {
  const { voiceSceneState } = useSelector(state => state);
  const dispatch = useDispatch();

  const [content, setContent] = useState(desc || '');
  const [countdown, setCountdown] = useState(+duration || 300);
  const [showTimer, setShowTimer] = useState(false);
  const [beginMinute, setBeginMinute] = useState(`${Math.floor(countdown / 60)}`);
  const [beginSecond, setBeginSecond] = useState(`${countdown % 60}`);

  const save = () => {
    const newActions = _.cloneDeep(_.get(voiceSceneState, 'actions', []));
    const actionType = _.get(
      _.find(statements, v => v.id === type),
      'action',
      'tts' as EActionType
    );
    const entityName = TYSdk.devInfo.name;
    if (_.isEmpty(content.trim())) {
      alertDialog(Strings.getLang('broadcast_empty'));
      return;
    }
    const args: IVoiceSceneAction = {
      action: {
        [actionType === 'tts' ? 'ttsText' : 'commandText']: content,
        entityName,
      },
      desc: content,
      actionType,
      entityId: entityId || TYSdk.devInfo.devId,
    };
    if (_.get(statementInfo[type], 'showTimer', false)) {
      args.duration = countdown;
    }
    if (method === 'add') {
      if (newActions.length >= 20) {
        alertDialog(Strings.getLang('action_over'));
        return;
      }
      newActions.push(args);
    } else {
      newActions[index] = args;
    }
    dispatch(actions.voiceScene.saveActions(newActions));
    back();
  };

  const _renderStatement = () => {
    return statementInfo[type].data.map(item => (
      <TouchableOpacity
        onPress={() => setContent(item)}
        key={JSON.stringify(item)}
        style={styles.statementInfoView}
      >
        <TYText style={styles.statementText}>{item}</TYText>
      </TouchableOpacity>
    ));
  };

  const _handleChange = key => value => {
    const v = typeof value === 'number' ? _.padStart(value.toString(), 2, '0') : value;
    if (key === 'beginMinute') {
      setBeginMinute(v);
    } else if (key === 'beginSecond') {
      setBeginSecond(v);
    }
  };

  const _renderPicker = () => {
    return [
      {
        key: 'beginMinute',
        selectedValue: beginMinute,
        value: _.times(60, n => _.padStart(n.toString(), 2, '0')),
        pickerLocation: {
          width: cx(140),
        },
      },
      {
        key: 'beginSecond',
        selectedValue: beginSecond,
        value: _.times(60, n => _.padStart(n.toString(), 2, '0')),
        pickerLocation: {
          width: cx(140),
        },
      },
    ].map(item => (
      <Picker
        key={item.key}
        style={[styles.picker, item.pickerLocation]}
        itemStyle={styles.pickerItem}
        loop={false}
        selectedValue={_.padStart(item.selectedValue, 2, '0')}
        onValueChange={_handleChange(item.key)}
      >
        {item.value.map(value => (
          <Picker.Item key={value} value={value} label={value} />
        ))}
      </Picker>
    ));
  };

  const _renderModal = () => {
    return (
      <Modal style={{ flex: 1, width }} visible={showTimer} onMaskPress={() => setShowTimer(false)}>
        <View style={styles.modal}>
          <View style={styles.title}>
            <TYText style={styles.titleText}>{Strings.getLang('choiceDate')}</TYText>
          </View>
          <View style={styles.timeTip}>
            <TYText style={styles.timeBeginTip}>{Strings.getLang('minute')}</TYText>
            <TYText style={styles.timeEndTip}>{Strings.getLang('second')}</TYText>
          </View>
          <View style={styles.centerTime}>
            <View style={styles.pickerContainer}>{_renderPicker()}</View>
          </View>
          <TouchableOpacity
            style={styles.buttonBorder}
            onPress={() => {
              const minute = +beginMinute;
              const second = +beginSecond;
              setCountdown(minute * 60 + second);
              setShowTimer(false);
            }}
          >
            <TYText style={styles.buttonText}>{Strings.getLang('confirm')}</TYText>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  const renderTopBar = () => {
    return (
      <TopBar
        title={Strings.getLang(`action_${type}`)}
        background="transparent"
        onBack={back}
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

  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      {renderTopBar()}
      <ScrollView>
        {_.get(statementInfo[type], 'warning', null) && (
          <View style={styles.warningContainer}>
            <TYText style={{ color: '#22232C', fontSize: cx(13) }}>
              {_.get(statementInfo[type], 'warning', null)}
            </TYText>
          </View>
        )}
        <View style={styles.center}>
          <TYText style={styles.tip}>{Strings.getLang('play')}</TYText>
          <TextInput
            style={styles.input}
            onChangeText={val => setContent(val)}
            value={content}
            placeholderTextColor="#A2A3AA"
            underlineColorAndroid="transparent"
            placeholder={statementInfo[type].tip}
          />
          <TYText style={styles.tipTwo}>{Strings.getLang('example')}</TYText>
          <View style={styles.statementList}>{_renderStatement()}</View>
          {_.get(statementInfo[type], 'showTimer', false) && (
            <View style={styles.showTime}>
              <TYText style={[styles.tip, { marginBottom: cx(20) }]}>
                {Strings.getLang('playTime')}
              </TYText>
              <TouchableOpacity onPress={() => setShowTimer(true)}>
                <View style={styles.timeItem}>
                  <TYText style={styles.timeText}>
                    {Math.floor(countdown / 60) +
                      Strings.getLang('minute') +
                      (countdown % 60) +
                      Strings.getLang('second')}
                  </TYText>
                  <Image source={Res.arrow} />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      {_renderModal()}
    </View>
  );
};
AddAction.defaultProps = {
  type: '',
  method: 'add',
  entityId: '',
  desc: '',
  duration: 0,
  index: 0,
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: background,
    marginTop: cx(18),
    marginHorizontal: cx(18),
  },
  warningContainer: {
    height: cx(52),
    paddingHorizontal: cx(16),
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#FFF4CD',
  },
  input: {
    height: cx(56),
    borderRadius: cx(8),
    width: cx(327),
    backgroundColor: '#F8F8F8',
    color: '#000',
    fontSize: cx(16),
    paddingLeft: cx(16),
  },
  tip: {
    color: '#22242C',
    fontSize: cx(16),
    lineHeight: cx(22),
    marginBottom: cx(10),
    fontWeight: 'bold',
  },
  statementInfoView: {
    alignSelf: 'flex-start',
    height: cx(40),
    borderRadius: cx(20),
    backgroundColor: '#F8F8F8',
    paddingHorizontal: cx(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: cx(14),
    marginBottom: cx(10),
  },
  statementText: {
    fontSize: cx(14),
    color: '#22242C',
    lineHeight: cx(20),
  },
  statementList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tipTwo: {
    color: '#A2A3AA',
    fontSize: cx(14),
    marginTop: cx(20),
    marginBottom: cx(10),
  },
  timeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  showTime: {
    marginTop: cx(30),
    marginBottom: cx(20),
  },
  timeText: {
    color: '#22242C',
    fontSize: cx(16),
  },
  modal: {
    width,
    height: cx(354),
    backgroundColor: '#fff',
    borderRadius: cx(20),
    paddingTop: cx(20),
  },
  centerTime: {
    flex: 1,
    alignItems: 'center',
  },
  timeTip: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: cx(24),
  },
  pickerContainer: {
    flexDirection: 'row',
    height: 188,
    marginVertical: 24,
  },
  picker: {
    marginVertical: 0,
    height: 188,
  },
  title: {
    width,
    height: cx(30),
    borderTopLeftRadius: cx(20),
    borderTopRightRadius: cx(20),
  },
  titleText: {
    fontSize: cx(14),
    textAlign: 'center',
    color: '#000',
  },
  buttonBorder: {
    borderColor: '#E5EAF3',
    borderTopWidth: 1,
    width,
    height: isIphoneX ? cx(66) : cx(54),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: isIphoneX ? cx(12) : 0,
  },
  buttonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#000',
    backgroundColor: 'transparent',
  },
  pickerItem: {
    marginTop: -30,
  },
  timeBeginTip: {
    width: cx(140),
    color: '#000',
    textAlign: 'center',
  },
  timeEndTip: {
    width: cx(140),
    color: '#000',
    textAlign: 'center',
  },
});

export default AddAction;
