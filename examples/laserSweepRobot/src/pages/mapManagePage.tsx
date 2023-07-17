/* eslint-disable */
import React, { PureComponent, Component } from 'react';
import { View, StyleSheet, ScrollView, Text, InteractionManager } from 'react-native';
import _ from 'lodash';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { observer, inject } from 'mobx-react';
import { of } from 'rxjs/observable/of';
import { merge } from 'rxjs/observable/merge';
import moment from 'moment';
import { Utils, TYSdk } from 'tuya-panel-kit';
import { getMultipleMapFiles } from '../api';
import { handleError, createDpValue$ } from '../protocol/utils';
import { isRobotQuiet } from '../utils/robotStatus';
import { Button, Toast } from '../components';
import i18n from '@i18n';
import { DPCodes } from '../config';
import { IPanelConfig } from '../config/interface';
import { encodeSaveMap, encodeUseMap, encodeDeleteMap } from '../utils';
import MapView from '../components/home/mapView';
import { Api } from '../components/home/mapView/resourceManager';
import { IndoorMapUtils, IndoorMapWebApi as LaserUIApi } from '@tuya/rn-robot-map';


const {
  RatioUtils: { convert, convertX },
} = Utils;

interface IMapManangeProps {
  robotStatus: string;
  panelConfig: IPanelConfig;
  roomEditable: boolean;
}
interface IMapManageState {
  dataSource: ICardProps[];
  saveSucess: number;
}

@inject(
  ({
    dpState,
    panelConfig: { store: panelConfig = {} },
    mapDataState: { getData: mapDataState = { roomEditable: false } },
  }) => {
    const { data } = dpState;
    return {
      robotStatus: data[DPCodes.robotStatus],
      panelConfig,
      roomEditable: mapDataState.roomEditable,
    };
  }
)
@observer
export default class MapManage extends PureComponent<IMapManangeProps, IMapManageState> {
  subscriptionSaveMap: Subscription;

  subscriptionUseMap: Subscription;

  subscriptionDeleteMap: Subscription;

  constructor(props: any) {
    super(props);
    this.state = {
      dataSource: [
        {
          title: i18n.getLang('mapManage_currentMap'),
          isCurrent: true,
          onReset: this.handelResetMap,
          onSave: this.handleSaveMap,
          time: moment().format('YYYY.MM.DD HH:mm'),
          fetch: this.requestMapInfo,
        } as ICardProps,
      ],
      saveSucess: 1,
    };
    InteractionManager.runAfterInteractions(this.requestMapInfo);
  }

  createCmdMsg$(cmd: string) {
    return createDpValue$<string>(DPCodes.commText, false).pipe<
      string,
      { cmd: string; success: boolean; value: string }
    >(
      filter<string>(value => value.slice(12, 14) === `${cmd}`),
      map((value: string) => {
        const res = value.slice(14, 16);
        const success = !!parseInt(res, 16);
        return { cmd, success, value };
      })
    );
  }

  requestMapInfo = async () => {
    const { saveSucess, dataSource } = this.state
    try {
      const { datas } = await getMultipleMapFiles();
      const floorData = datas.map(({ file, bucket, time, id, extend }, idx) => {
        const [robotUseFile, appUseFile] = file.split(',');
        const mapId = parseInt(extend.replace(/(.*_)(\d*)(_.*)/, '$2'), 10);

        return {
          id,
          isCurrent: false,
          file: appUseFile,
          robotUseFile,
          bucket,
          title: i18n.getLang(`mapManage_floor_${idx + 1}`),
          time: moment(time * 1000).format('YYYY.MM.DD HH:mm'),
          onUse: this.handleUseMap(mapId),
          onDelete: this.handelDeleteMap(id),
          fetch: this.requestMapInfo,
        };
      });

      const curData = [...dataSource];
      curData.splice(1, curData.length - 1, ...floorData);
      this.setState({ dataSource: curData, saveSucess: saveSucess + 1 }, () => {
        this.forceUpdate();
      });

      // console.warn('MapManage data', dataSource);
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  handelResetMap = () => {
    TYSdk.device.putDeviceData({ [DPCodes.ResetMap]: true });
  };

  handleSaveMap = () => {
    const value = encodeSaveMap();
    TYSdk.device.putDeviceData({ [DPCodes.commText]: value });
  };

  handleUseMap = (mapId: number) => (url: string) => {
    const { robotStatus } = this.props
    return new Promise<void>((resolve, reject) => {
      const value = encodeUseMap(mapId, url);
      if (!isRobotQuiet(robotStatus)) {
        TYSdk.mobile.simpleConfirmDialog(
          '',
          i18n.getLang('mapManage_saveMapTip'),
          () => {
            TYSdk.device.putDeviceData({
              [DPCodes.commText]: value,
              [DPCodes.pauseSwitch]: false,
            });
            resolve();
          },
          reject
        );
      } else {
        TYSdk.device.putDeviceData({ [DPCodes.commText]: value });
        resolve();
      }
    });
  };

  handelDeleteMap = (id: number) => () => {
    const value = encodeDeleteMap(id);
    TYSdk.device.putDeviceData({ [DPCodes.commText]: value });
  };

  render() {
    const { panelConfig, roomEditable } = this.props;
    const { dataSource, saveSucess } = this.state;
    return (
      <View style={styles.flex1}>
        <ScrollView>
          {
            dataSource.map(data => {
              return (
                <Card
                  key={`${data.id + saveSucess}`}
                  {...data}
                  panelConfig={panelConfig}
                  curDataLen={dataSource.length}
                  roomEditable={roomEditable}
                />
              )
            })
          }
        </ScrollView>
      </View>
    );
  }
}

interface ICardProps {
  id: number;
  bucket: string;
  file: string;
  robotUseFile: string;
  title: string;
  time: string;
  isCurrent?: boolean;
  mapId?: number;
  roomEditable: boolean;

  onUse?: (url: string) => () => void;
  onDelete?: () => void;
  onReset?: () => void;
  onSave?: () => void;
  fetch: () => Promise<any>;
  panelConfig: {};
  curDataLen: number;
}

interface ICardState {
  loading: boolean;
  mapLoadEnd: boolean;
  [index: string]: boolean;
}

type CardMapType = 'save' | 'delete' | 'use';
// tslint:disable-next-line: max-classes-per-file
class Card extends Component<ICardProps, ICardState> {
  mapId = '';
  static defaultProps = {
    isCurrent: false,
    panelConfig: {},
    curDataLen: 0,
  };

  state = {
    loading: false,
    saveLoading: false,
    deleteLoading: false,
    useLoading: false,
    mapLoadEnd: false,
    snapshotImage: undefined,
  };

  onMapId = (data: { mapId: string, dataMapId: string }) => {
    this.mapId = data.mapId;
  }

  onMapLoadEnd = (success: boolean) => {
    this.setState({ mapLoadEnd: success });
  }

  onVirtualInfoRendered = (data: {rendered: boolean,  data: { areaInfoList: any }}) => {
    const { rendered } = data;
    console.log('onVirtualInfoRendered interval', this.mapId, data);
    setTimeout(() => {
      if (rendered && this.mapId) {
        LaserUIApi.getCurrentScreenSnapshot(IndoorMapUtils.getMapInstance(this.mapId)).then((snapshotImage: any) => {
          console.log('onVirtualInfoRendered snapshotImage', snapshotImage);
          if (snapshotImage && snapshotImage.image) {
            this.setState({ snapshotImage, mapLoadEnd: true });
          }
        }).catch(e => {
          console.log('onVirtualInfoRendered error', e);
          this.setState({ mapLoadEnd: true });
        });
      }
    }, 1000);
  };

  showLoading = (type: CardMapType) => {
    this.setState({ [`${type}Loading`]: true });
  };

  hideLoading = (type: CardMapType) => {
    this.setState({
      [`${type}Loading`]: false,
    });
  };

  responseTimeout = (type: CardMapType) => () => {
    Toast.info(i18n.getLang('mapManage_robotResponseTimeout'));
    this.hideLoading(type);
  };

  handleCmdMsg = (type: CardMapType) => (success: boolean) => {
    const { fetch } = this.props
    Toast.info(i18n.getLang(`mapManage_${type}Map_${success}`));
    this.hideLoading(type);
    if (type !== 'use') {
      fetch();
    }
  };

  handleUseMap = (cb: any, robotPath: string) => {
    return async () => {
      const { bucket } = this.props;
      const url = await Api.OSSAPI.getCloudFileUrl(bucket, robotPath);

      if (url && cb) {
        await cb(url);
        this.showLoading('use');
        this.subscribeCmdMsg('use', this.handleCmdMsg('use'), this.responseTimeout('use'));
      }
    };
  };

  handleMapAction = (type: CardMapType, cb: any) => () => {
    const { curDataLen, roomEditable } = this.props;
    if (curDataLen > 5 && type === 'save') {
      TYSdk.mobile.simpleConfirmDialog(
        '',
        i18n.getLang('saveMapCountLimit'),
        () => {
          this.showLoading(type);
          cb && cb();
          this.subscribeCmdMsg(type, this.handleCmdMsg(type), this.responseTimeout(type));
        },
        () => { }
      );
      return;
    }
    if (type === 'save' && !roomEditable) {
      TYSdk.mobile.simpleTipDialog(i18n.getLang('mapManage_saveMap_disable'), () => { });
    } else {
      this.showLoading(type);
      cb && cb();
      this.subscribeCmdMsg(type, this.handleCmdMsg(type), this.responseTimeout(type));
    }
  };

  subscribeCmdMsg(type: CardMapType, next: (success: boolean) => void, timeoutCb: () => void) {
    const cmdMap = {
      save: '2b',
      delete: '2d',
      use: '2f',
    };
    const cmd = cmdMap[type];
    return merge(
      createDpValue$<string>(DPCodes.commText, false).pipe<
        string,
        { cmd: string; success: boolean; value: string } // ab00000000022d012e
      >(
        filter<string>(value => value.slice(12, 14) === `${cmd}`),
        map((value: string) => {
          const res = value.slice(14, 16);
          const success = !!parseInt(res, 16);
          return { cmd, success, value };
        })
      ),
      of({ timeout: true }).delay(20000)
    )
      .first()
      .subscribe(({ success, timeout }: any) => {
        if (timeout) {
          timeoutCb();
          return;
        }
        next(success);
      }, handleError);
  }

  renderAction = () => {
    const { isCurrent, onUse, onDelete, onReset, onSave, robotUseFile } = this.props;
    const { useLoading, deleteLoading, saveLoading } = this.state;
    if (!isCurrent) {
      return (
        <View style={styles.cardAction}>
          <Button
            style={styles.btnConfirm}
            text={i18n.getLang('mapManage_useMap')}
            textStyle={styles.btnConfirmText}
            onPress={this.handleUseMap(onUse, robotUseFile)}
            textDirection="right"
            loading={useLoading}
            loadingColor="#FFFFFF"
          />
          <Button
            style={styles.btnDelete}
            text={i18n.getLang('mapManage_deleteMap')}
            textStyle={styles.btnDeleteText}
            onPress={this.handleMapAction('delete', onDelete)}
            textDirection="right"
            loading={deleteLoading}
          />
        </View>
      );
    }

    return (
      <View
        style={[
          styles.cardAction,
          { justifyContent: 'space-between', marginHorizontal: convertX(36) },
        ]}
      >
        <Button
          style={styles.btnConfirmLarge}
          text={i18n.getLang('mapManage_resetMap')}
          textStyle={styles.btnConfirmText}
          onPress={onReset}
        />
        <Button
          style={styles.btnConfirmLarge}
          text={i18n.getLang('mapManage_saveMap')}
          textStyle={styles.btnConfirmText}
          onPress={this.handleMapAction('save', onSave)}
          textDirection="right"
          loading={saveLoading}
          loadingColor="#FFFFFF"
        />
      </View>
    );
  };

  render() {
    const { bucket, file, title, time, isCurrent, panelConfig } = this.props;
    const { mapLoadEnd, snapshotImage } = this.state;

    return (
      <View style={styles.card}>
        <View style={styles.cardHader}>
          <Text style={styles.cardHeaderTitle}>{title}</Text>
          <Text style={styles.cardHeaderSubTitle}>{time}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.cardMap} pointerEvents="none">
          {isCurrent ? (
            <MapView uiInterFace={{ isCustomizeMode: true, isShowAppoint: false }} pathVisible={false}  mapDisplayMode="splitMap" config={panelConfig} onMapLoadEnd={this.onMapLoadEnd} mapLoadEnd={mapLoadEnd}  />
          ) : (
            <MapView
              mapDisplayMode="multiFloor"
              config={panelConfig}
              pathVisible={false}  
              uiInterFace={{ isCustomizeMode: true, isShowAppoint: false }}
              onMapId={this.onMapId} 
              mapLoadEnd={mapLoadEnd}
              snapshotImage={snapshotImage}
              history={{
                bucket,
                file,
              }}
            />
          )}
        </View>
        {this.renderAction()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginTop: convert(10),
    marginHorizontal: convert(18),
    height: convert(289),
    borderRadius: convert(23),
    backgroundColor: '#ffffff',
  },
  divider: {
    marginHorizontal: convert(7),
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5E5',
  },
  cardHader: {
    height: convert(42),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: convert(13),
  },
  cardHeaderTitle: {
    color: '#333333',
    fontWeight: 'bold',
    fontSize: convert(17),
  },
  cardHeaderSubTitle: {
    color: '#999999',
    fontSize: convert(15),
  },
  cardMap: {
    alignSelf: 'center',
    flex: 1,
    width: '80%',
  },
  cardAction: {
    height: convert(50),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnConfirm: {
    height: convert(30),
    paddingHorizontal: convert(15),
    borderRadius: convert(15),
    backgroundColor: '#0065FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnConfirmLarge: {
    height: convert(30),
    width: convertX(120),
    borderRadius: convert(15),
    backgroundColor: '#0065FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnConfirmText: {
    fontSize: convert(17),
    fontWeight: 'bold',
    color: '#333333',
  },
  btnDelete: {
    position: 'absolute',
    right: 0,
    top: 10,
    height: convert(30),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: convert(15),
    marginRight: convert(15),
  },
  btnDeleteText: {
    fontSize: convert(14),
    color: '#FF0000',
  },
});
