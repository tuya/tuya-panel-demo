import { observable, action, computed, toJS } from 'mobx';
import _ from 'lodash';
import { hex2ahex } from '../utils';

export default class PanelConfigStore {
  @observable
  data = {
    // 默认地图配置信息
    sweepRegionColor: hex2ahex('#000000', 0.2), // 划区清扫区域框
    virtualAreaColor: hex2ahex('#F81C1C', 0.2), // 禁区框颜色
    virtualWallColor: hex2ahex('#F81C1C'), // 虚拟墙
    markerIcon: '/smart/Oval2x.png',
    appointIcon: '/smart/Group6@2x.png',
    pointsColor: [
      '#ABD6FFFF', // 清扫点(地图背景颜色)
      '#646464FF', //  障碍点(地图描边边框)
      '#FFFFFF00', // 未知区域（看不见的点）
      '#7ED321FF', // 充电桩
    ],
    pathWidth: 0.5,
    planPathWidth: 0.5,
    pathColor: '#FFFFFF', // 路径颜色
    pointTypeColorMap: JSON.stringify({
      barrier: hex2ahex('#646464'), // 障碍类型
      battery: hex2ahex('#7ED321'), // 充电点类型
      unknown: hex2ahex('#FFFFFF', 0), // 未知区域
      sweep: hex2ahex('#ABD6FF'), // 清扫类型
    }),
    splitColor: '#F1A842',

    // 后台配置信息
    multiMapConfig: {
      multiMapAvailable: true,
    },
    recordConfig: {
      recordAvailable: true,
    },
    mapPartitionConfig: {
      partitionAvailable: true,
      partitionColorShow: true,
      partitionMergeAvailable: true,
      partitionResetAvailable: true,
      partitionSplitFunc: {
        partitionSplitAvaiable: true,
        partitionSplitColor: 'rgba(0,0,0,0.4)',
      },
    },

    attributesConfig: {
      attributesFan: {
        attributesFanSet: true,
        attributesFanShow: true,
        attributesFanEnum: ['0', '1', '2', '3', '4'],
        attributesFanIconEnum: [
          '/app/robot/png/Fan_1.png',
          '/app/robot/png/Fan_1.png',
          '/app/robot/png/Fan_2.png',
          '/app/robot/png/Fan_3.png',
          '/app/robot/png/Fan_4.png',
        ],
      },
      attributesOrder: {
        attributesOrderSet: true,
        attributesOrderShow: true,
      },
      attributesTimes: {
        attributesTimesMaxNum: 3,
        attributesTimesSet: true,
        attributesTimesShow: true,
      },
      attributesWater: {
        attributesWaterEnum: ['0', '1', '2', '3'],
        attributesWaterSet: true,
        attributesWaterShow: true,
        attributesWaterIconEnum: [
          '/app/robot/png/Water_close.png',
          '/app/robot/png/Water_1.png',
          '/app/robot/png/Water_3.png',
          '/app/robot/png/Water_5.png',
        ],
      },
    },

    nameConfig: {
      partitionNameShow: true,
      partitionRename: true,
      partitionNameEnum: [
        'bathroom',
        'kitchen',
        'study',
        'balcony',
        'babyroom',
        'corridor',
        'bedroom',
        'livingroom',
      ],
    },

    forbiddenAreaConfig: {
      mapForbiddenAvailable: true,
      mapForbiddenSmartAvailable: false,
      forbiddenAreaProtocolVersion: 'V1.0.0',
      mopForbiddenArea: {
        mopForbiddenAvailable: true,
        mopForbiddenLineColor: 'rgba(255,255,255,0.4)',
        mopForbiddenBgColor: 'rgba(70,133,255,0.5)',
        mopForbiddenMaxNum: 8,
        mopForbiddenMaxWidth: 10,
        mopForbiddenMinWidth: 0.5,
        mopForbiddenRotate: true,
      },
      pileConfig: {
        pileRingAvailable: true,
        ringBgColor: 'rgba(0,0,0,0.4)',
        ringBorderColor: '#ffffff',
        ringRadiusRealMeter: 1,
      },
      sweepForbiddenArea: {
        sweepForbiddenLineColor: 'rgba(255,255,255,1)',
        sweepForbiddenBgColor: 'rgba(248,28,28,0.5)',
        sweepForbiddenMaxNum: 8,
        sweepForbiddenMinWidth: 0.5,
        sweepForbiddenShowUnit: true,
        sweepForbiddenFactorColor: '#000000',
        sweepForbiddenRotate: true,
      },
      virtualWall: {
        virtualWallAvailable: true,
        virtualWallLineColor: 'rgba(248,28,28,1)',
        virtualWallLineWidth: 1,
        virtualWallMaxNum: 8,
      },
    },

    selectAreaConfig: {
      selectAreaAvailable: true,
      selectAreaProtocolVersion: 'V1.0.0',
      selectAreaCountAvailable: true,
      selectAreaLineColor: '#ffffff',
      selectAreaBgColor: 'rgba(70,133,255,0.5)',
      selectAreaMaxNum: 10,
      selectAreaTimesMaxNum: 3,
    },

    selectPointConfig: {
      selectPointAvailable: true,
      selectPointUrl: '/smart/Group6@2x.png',
    },
    selectRoomConfig: {
      selectRoomAvailable: true,
      selectRoomCountAvailable: true,
      selectRoomTimesMaxNum: 3,
    },
    scheduleConfig: {
      scheduleType: 'cloud',
      scheduleLocal: {
        scheduleLocalFan: {
          scheduleLocalFanAvailable: true,
          scheduleLocalFanDisableEnum: [],
          scheduleLocalFanEnum: ['0', '1', '2', '3'],
        },
        scheduleLocalLocationSet: true,
        scheduleLocalMaxNum: 10,
        scheduleLocalCount: {
          scheduleLocalCountAvailable: true,
          scheduleLocalOrderDisableEnum: [],
          scheduleLocalCountEnum: ['1', '2', '3'],
        },
        scheduleLocalWater: {
          scheduleLocalWaterAvailable: true,
          scheduleLocalWaterDisableEnum: [],
          scheduleLocalWaterEnum: ['0', '1', '2', '3'],
        },
        scheduleLocalMode: {
          scheduleLocalModeAvailable: true,
          scheduleLocalModeEnum: ['0', '1', '2'],
        },
      },
    },

    ringConfig: {
      ringAvailable: true,
      ringBgColor: 'rgba(0,0,0,0.5)',
      ringDuration: 1,
      ringMaxRate: 2,
    },

    pathConfig: {
      pathColor: {
        backCharge: 'rgba(0,0,0,0)',
        common: 'rgba(255,255,255,1)',
        reserved: 'rgba(255,255,255,1)',
        transitions: '#FFD700',
      },
      pathWidth: 0.5,
    },
    timeFormatConfig: {
      scheduleTimeIs24: true,
      recordTimeIs24: true,
    },
    materialObjConfig: {
      materialObjAvaiable: false,
      materialObjWidth: 20,
      materialObjHeight: 20,
      materialObjEnum: [
        '/app/robot/png/AI_ico/Wire.png',
        '/app/robot/png/AI_ico/Shoes.png',
        '/app/robot/png/AI_ico/Sock.png',
        '/app/robot/png/AI_ico/Toy.png',
        '/app/robot/png/AI_ico/Chair.png',
        '/app/robot/png/AI_ico/Table.png',
        '/app/robot/png/AI_ico/Ashcan.png',
        '/app/robot/png/AI_ico/Flowerpot.png',
      ],
    },
  };

  @computed
  get store() {
    return toJS(this.data);
  }

  @action
  updateData = (data: any) => {
    const mergedData = _.mergeWith(this.data, data);
    console.warn('test====mergedData', data);
    this.data = { ...mergedData };
  };
}
