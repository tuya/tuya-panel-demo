import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { observer, inject } from 'mobx-react';
import { Utils } from 'tuya-panel-kit';
import { IndoorMapUtils, IndoorMapWebApi as LaserUIApi } from '@tuya/rn-robot-map';
import Strings from '@i18n';
import HomeTopView from '../components/home/homeTopView';
import HomeMapView from '../components/home/homeMapView';
import HomeBottomView from '../components/home/homeBottomView';
import HomeMapContral from '../components/home/homeMapContral';
import ControllerBar from '../components/home/controllerBar';
import { DPCodes } from '../config';
import { MapFunc } from '../components/mapFuncComponent';

const { convertX: cx, width, convert } = Utils.RatioUtils;
interface IMap {
  [index: string]: number;
}
interface IProps {
  dpState: IMap;
  devInfo: IMap;
  taskSW: boolean;
  fontColor: string;
  tipColor: string;
  mapId: string;
  navigation: {
    navigate: (route: string, params) => void;
  };
}
interface IState {
  mapStatus: number;
  origin?: { x: number; y: number };
}
@inject((state: any) => {
  const {
    devInfo,
    dpState,
    mapDataState: { getData: mapDataState = {} },
    theme: { getData: theme = {} },
  } = state;
  return {
    devInfo: devInfo.data,
    dpState: dpState.data,
    turnON: dpState.data[DPCodes.clearPower],
    taskSW: dpState.data[DPCodes.taskSW],
    commText: dpState.data[DPCodes.commText],
    mapId: mapDataState.mapId,
    fontColor: theme.fontColor,
    tipColor: theme.tipColor,
  };
})
@observer
export default class MainLayout extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      mapStatus: DPCodes.nativeMapStatus.normal,
    };
  }

  getTopText = () => {
    const { dpState } = this.props;
    const statusText = `${Strings.getDpLang(DPCodes.status, dpState[DPCodes.status])}`;
    const topText = `${statusText}`;
    return topText;
  };

  setMapStatus = async (status: number, edit?: boolean) => {
    const { mapId } = this.props;
    await LaserUIApi.setLaserMapStateAndEdit(IndoorMapUtils.getMapInstance(mapId), {
      state: status,
      mapId,
      edit: edit || false,
    });
    this.setState({
      mapStatus: status,
    });
  };

  visibleBottomView = (status: number) => {
    return status === DPCodes.nativeMapStatus.normal;
  };

  render = () => {
    const { dpState, taskSW, fontColor, tipColor, navigation } = this.props;
    const { mapStatus } = this.state;
    return (
      <View style={styles.container}>
        <HomeMapView mapStatus={mapStatus} />
        <View style={styles.main} pointerEvents="box-none">
          <HomeTopView
            style={{ width }}
            faultCode={DPCodes.faultData}
            fault={dpState[DPCodes.faultData]}
            faultIsValue={true}
            valueText={this.getTopText()}
            valueTextStyle={[styles.topText, { color: tipColor }]}
            mapStatus={mapStatus}
          />
          <HomeMapContral taskSW={taskSW} mapStatus={mapStatus} setMapStatus={this.setMapStatus} />
          {this.visibleBottomView(mapStatus) && (
            <View style={styles.boxView}>
              <MapFunc
                mapStatus={mapStatus}
                setMapStatus={this.setMapStatus}
                navigation={navigation}
              />
              <HomeBottomView
                style={styles.statusInfo}
                CleanArea={dpState[DPCodes.cleanArea]}
                ResidualElectricity={dpState[DPCodes.energy]}
                CleanTime={dpState[DPCodes.cleanTime]}
                color={fontColor}
              />
            </View>
          )}
        </View>
        <ControllerBar mapStatus={mapStatus} setMapStatus={this.setMapStatus} />
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  boxView: {
    alignSelf: 'stretch',
  },
  statusInfo: {
    height: convert(56),
    alignSelf: 'stretch',
  },

  main: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  topText: {
    fontSize: cx(12),
  },
});
