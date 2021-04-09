/* eslint-disable @typescript-eslint/ban-ts-comment */
import { connect } from 'react-redux';
import _throttle from 'lodash/throttle';
import React, { PureComponent } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { TYSdk, Utils, TopBar } from 'tuya-panel-kit';
import { electricianApi } from '@tuya/tuya-panel-api';
import RuleItem from './ruleItem';
import { getDeviceInfo, RequireType } from '../../utils';
import Strings from '../../i18n';

const { getSceneList, bindRule } = electricianApi.linkageApi;

const { convertX: cx } = Utils.RatioUtils;
interface SceneListProps {
  selectCode: string;
  selectValue: string;
  deviceData: RequireType;
  themeColor: string;
  isDefaultTheme: boolean;
}
interface SceneListState {
  data: RequireType[];
  selectIndex: number;
}

class SceneList extends PureComponent<SceneListProps, SceneListState> {
  constructor(props: SceneListProps) {
    super(props);
    this.state = {
      data: [],
      selectIndex: 0,
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    getSceneList({ devId: TYSdk.devInfo.devId })
      .then((d: RequireType[]) => {
        this.setState({ data: d.reverse() });
      })
      .catch();
  };

  bind = _throttle(() => {
    const { selectIndex, data } = this.state;
    const { selectValue, selectCode } = this.props;
    if (selectIndex === -1) {
      TYSdk.mobile.simpleTipDialog(Strings.getLang('chooseTip'), () => {});
      return;
    }
    const id = TYSdk.device.getDpIdByCode(selectCode);
    const ruleId = data[selectIndex].id;
    const options: any = {
      associativeEntityId: `${id}#${selectValue}`,
      ruleId,
      entitySubIds: id,
      expr: [[`$dp${id}`, '==', selectValue]],
      bizDomain: 'wirelessSwitchBindScene',
    };
    bindRule(options)
      .then(() => {
        TYSdk.Navigator.pop();
      })
      .catch(() => {
        TYSdk.mobile.simpleTipDialog(Strings.getLang('bindError'), () => {});
      });
  }, 5000);

  renderItem = ({ item, index }: { item: any; index: number }) => {
    const { deviceData, isDefaultTheme } = this.props;
    const { selectIndex } = this.state;
    const { name, displayColor, background = '' } = item;
    const { icon, devLength } = getDeviceInfo(deviceData, item);
    const showIcon = icon.slice(0, 3);
    const isSelect = selectIndex === index;
    return (
      <RuleItem
        themeColor={`#${displayColor}`}
        isSelect={isSelect}
        devLength={devLength}
        showIcon={showIcon}
        needBackground={background !== ''}
        background={background}
        name={name}
        onPress={() => {
          this.setState({ selectIndex: isSelect ? -1 : index });
        }}
        isNewApp={false}
        isDefaultTheme={isDefaultTheme}
      />
    );
  };

  render() {
    const { themeColor, isDefaultTheme } = this.props;
    const { data } = this.state;
    return (
      <View style={[styles.root, { backgroundColor: isDefaultTheme ? '#2E313A' : '#F5F5F5' }]}>
        <TopBar
          alignCenter={true}
          color={isDefaultTheme ? '#FFF' : '#000'}
          title={Strings.getLang('selectSmart')}
          background={isDefaultTheme ? '#2E313A' : '#F5F5F5'}
          isLeftBack={true}
          titleStyle={{ fontSize: 17, fontWeight: 'bold' }}
          actions={[
            {
              source: Strings.getLang('save'),
              // @ts-ignore
              contentStyle: { color: themeColor, fontSize: cx(16), fontWeight: 'bold' },
              onPress: this.bind,
            },
          ]}
          onBack={() => TYSdk.Navigator.pop()}
        />
        <FlatList
          data={data}
          keyExtractor={(item: any) => item.id}
          renderItem={item => this.renderItem(item)}
          style={{ paddingTop: 15 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 20,
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#F5F5F5',
  },
});

export default connect(({ selectState, selectValueState }: any) => ({
  selectCode: selectState.selectCode,
  selectValue: selectValueState.selectValue,
}))(SceneList);
