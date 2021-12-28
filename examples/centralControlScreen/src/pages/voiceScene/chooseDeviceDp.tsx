import React, { FC, useState, useEffect } from 'react';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import {
  Utils,
  Slider,
  TopBar,
  TYSdk,
  TYText,
  DeprecatedNavigatorRoute,
  DeprecatedNavigator,
} from 'tuya-panel-kit';
import { ButtonList } from '@components';
import { getDeviceDpLists } from '@api';
import { alertDialog, formatVal, back } from '@utils';
import { useSelector, actions } from '@models';
import { IDeviceDPInfo, IChooseDpItem, IDps } from '@interface';
import Strings from '@i18n';
import Res from '@res';
import { theme } from '@config';

const { convertX } = Utils.RatioUtils;
const background = '#FFF';
const TYNavigator = TYSdk.Navigator as DeprecatedNavigator;

interface IControlDevDpProps extends DeprecatedNavigatorRoute {
  devId?: string;
  devName?: string;
  method?: string;
  index?: number;
}

interface IControlDevDpItem extends IDeviceDPInfo {
  isClick: boolean;
}

const ChooseDeviceDp: FC<IControlDevDpProps> = ({ devId, devName, method, index }) => {
  const { voiceSceneState } = useSelector(state => state);
  const dispatch = useDispatch();

  const [deviceDpInfo, setDeviceDpInfo] = useState<IControlDevDpItem[]>([]);
  const [choiceList, setChoiceList] = useState<IChooseDpItem[]>([]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      TYSdk.mobile.showLoading();
      const newDeviceDpInfo = await getDeviceDpLists(devId);
      TYSdk.mobile.hideLoading();
      const newChoiceList: IChooseDpItem[] = [];
      const actionState = _.get(voiceSceneState, 'actions', []);
      const dps = _.get(
        _.find(actionState, v => v.entityId === devId),
        'action.dps',
        []
      );
      const data = newDeviceDpInfo.map(item => {
        const _selectedIndex = _.findIndex(dps, dv => +dv.dpId === +item.dpId);
        const _defaultValue = formatVal(
          _selectedIndex === -1
            ? item.defaultValue
            : _.get(dps[_selectedIndex], 'dpValue', '').toString(),
          item.defaultValue
        );
        if (!item.valueRangeJson) {
          const idx = item.valueRangeDisplay.indexOf(':');
          const needData = JSON.parse(item.valueRangeDisplay.substr(idx + 1));
          newChoiceList.push({
            id: item.dpId,
            chosenDpInfo: [_defaultValue, _defaultValue.toString() + needData.unit],
          });
        } else {
          const idx = item.valueRangeJson
            ? item.valueRangeJson.findIndex(element => element[0] === _defaultValue)
            : -1;
          newChoiceList.push({
            id: item.dpId,
            chosenDpInfo: idx === -1 ? [_defaultValue] : item.valueRangeJson[idx],
          });
        }
        return {
          ...item,
          isClick: _selectedIndex > -1,
        };
      });
      setDeviceDpInfo(data);
      setChoiceList(newChoiceList);
    } catch (err) {
      console.log(err);
    }
  };

  const choice = choiceItem => {
    const newChoiceList = _.cloneDeep(choiceList);
    const idx = choiceList.findIndex(item => item.id === choiceItem.id);
    if (idx === -1) {
      newChoiceList.push(choiceItem);
    } else {
      newChoiceList[idx] = choiceItem;
    }
    setChoiceList(newChoiceList);
  };

  const select = (item, idx) => {
    const newDeviceDpInfo = _.cloneDeep(deviceDpInfo);
    newDeviceDpInfo[idx].isClick = !newDeviceDpInfo[idx].isClick;
    setDeviceDpInfo(newDeviceDpInfo);
  };

  const save = () => {
    const actionState = _.cloneDeep(_.get(voiceSceneState, 'actions', []));
    let desc = '';
    const dps: IDps[] = [];
    deviceDpInfo.forEach(element => {
      if (element.isClick) {
        choiceList.forEach(item => {
          if (element.dpId === item.id) {
            desc = `${desc + element.name}:${item.chosenDpInfo[1]};`;
            dps.push({
              dpId: item.id,
              dpValue: item.chosenDpInfo[0],
            });
          }
        });
      }
    });
    const _args = {
      entityId: devId,
      desc,
      actionType: 'smart_home',
      action: {
        entityName: devName,
        dps,
      },
    };
    if (_.isEmpty(dps)) {
      alertDialog(Strings.getLang('choiceDeviceFunction'));
      return false;
    }
    if (method === 'add') {
      if (actionState.length >= 20) {
        alertDialog(Strings.getLang('action_over'));
        return;
      }
      actionState.push(_args);
      dispatch(actions.voiceScene.saveActions(actionState));
      TYNavigator.popN(2);
    } else {
      actionState[index] = _args;
      dispatch(actions.voiceScene.saveActions(actionState));
      back();
    }
  };

  const handleComplete = (value, id, idx) => {
    const newChoiceList = _.cloneDeep(choiceList);
    newChoiceList[idx].chosenDpInfo[0] = value;
    newChoiceList[idx].chosenDpInfo[1] = value;
    setChoiceList(newChoiceList);
  };

  const renderChildItem = item => {
    const choiceIndex = choiceList.findIndex(element => element.id === item.dpId);
    if (item.isClick) {
      if (item.valueRangeJson) {
        return (
          <ButtonList
            choiceItem={choiceList[choiceIndex]}
            data={item}
            valueChange={choiceItem => choice(choiceItem)}
            color="#FF5A28"
          />
        );
      }
      const idx = item.valueRangeDisplay.indexOf(':');
      const data = item.valueRangeDisplay.substr(idx + 1);
      const needData = JSON.parse(data);
      const indexElement = choiceList.findIndex(element => element.id === item.dpId);
      if (indexElement === -1) {
        return null;
      }
      return (
        <View style={styles.sliderView}>
          <Slider.Horizontal
            style={{ width: 295 }}
            stepValue={needData.step}
            maximumValue={needData.max}
            minimumValue={needData.min}
            value={Number(choiceList[indexElement].chosenDpInfo[0])}
            maximumTrackTintColor="rgba(86, 87, 104, 0.15)"
            minimumTrackTintColor="#FF5A28"
            thumbTintColor="#fff"
            trackStyle={{ height: 2 }}
            onValueChange={value => handleComplete(value, item.id, indexElement)}
          />
          <TYText style={styles.sliderText}>
            {choiceList[indexElement].chosenDpInfo[0] + needData.unit}
          </TYText>
        </View>
      );
    }
  };

  const renderItem = data => {
    return data.map((item, i) => (
      <View key={item.id}>
        <TouchableOpacity onPress={() => select(item, i)}>
          <View style={styles.timeItem}>
            <TYText style={styles.timeText}>{item.name}</TYText>
            <Image source={item.isClick ? Res.choice : Res.noneChoice} />
          </View>
        </TouchableOpacity>
        <View style={styles.childView}>{renderChildItem(item)}</View>
      </View>
    ));
  };

  const renderTopBar = () => {
    return (
      <TopBar
        title={devName}
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
              marginBottom: convertX(5),
              marginTop: convertX(18),
              marginLeft: convertX(16),
            },
          ]}
        >
          {Strings.getLang('pleaseChoice')}
        </TYText>
        <View style={styles.center}>{renderItem(deviceDpInfo)}</View>
      </ScrollView>
    </View>
  );
};

ChooseDeviceDp.defaultProps = {
  devId: '',
  devName: '',
  method: 'add',
  index: -1,
};

const styles = StyleSheet.create({
  timeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: convertX(17),
    marginHorizontal: convertX(16),
  },
  timeText: {
    color: '#22242C',
    fontSize: convertX(16),
    lineHeight: convertX(22),
  },
  center: {
    flex: 1,
    backgroundColor: background,
  },
  childView: {
    marginHorizontal: convertX(16),
    marginBottom: convertX(5),
  },
  sliderView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderText: {
    marginLeft: convertX(10),
  },
});

export default ChooseDeviceDp;
