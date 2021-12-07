export enum mapProtocolVersion {
  v100 = 'V1.0.0',
  v110 = 'V1.1.0',
}

export enum scheduleVersion {
  local = 'local',
  cloud = 'cloud',
}

export interface IPanelConfig {
  // 后台配置信息
  multiMapConfig: {
    multiMapAvailable: boolean;
  };
  recordConfig: {
    recordAvailable: boolean;
  };
  mapPartitionConfig: {
    partitionAvailable: boolean;
    partitionColorShow: boolean;
    partitionMergeAvailable: boolean;
    partitionResetAvailable: boolean;
    partitionSplitFunc: {
      partitionSplitAvaiable: boolean;
      partitionSplitColor: string;
    };
  };
  attributesConfig: {
    attributesFan: {
      attributesFanSet: boolean;
      attributesFanShow: boolean;
      attributesFanEnum: Array<string>;
      attributesFanIconEnum: Array<string>;
    };
    attributesOrder: {
      attributesOrderSet: boolean;
      attributesOrderShow: boolean;
    };
    attributesTimes: {
      attributesTimesMaxNum: number;
      attributesTimesSet: boolean;
      attributesTimesShow: boolean;
    };
    attributesWater: {
      attributesWaterEnum: Array<string>;
      attributesWaterSet: boolean;
      attributesWaterShow: boolean;
      attributesWaterIconEnum: Array<string>;
    };
  };
  nameConfig: {
    partitionNameShow: boolean;
    partitionRename: boolean;
    partitionNameEnum: Array<string>;
  };
  forbiddenAreaConfig: {
    mapForbiddenAvailable: boolean;
    mapForbiddenSmartAvailable: boolean;
    forbiddenAreaProtocolVersion: mapProtocolVersion;
    mopForbiddenArea: {
      mopForbiddenAvailable: boolean;
      mopForbiddenLineColor: string;
      mopForbiddenBgColor: string;
      mopForbiddenMaxNum: number;
      mopForbiddenMaxWidth: number;
      mopForbiddenMinWidth: number;
      mopForbiddenRotate: boolean;
    };
    pileConfig: {
      pileRingAvailable: boolean;
      ringBgColor: string;
      ringBorderColor: string;
      ringRadiusRealMeter: number;
    };
    sweepForbiddenArea: {
      sweepForbiddenLineColor: string;
      sweepForbiddenBgColor: string;
      sweepForbiddenMaxNum: number;
      sweepForbiddenMinWidth: number;
      sweepForbiddenShowUnit: boolean;
      sweepForbiddenFactorColor: string;
      sweepForbiddenRotate: boolean;
    };
    virtualWall: {
      virtualWallAvailable: boolean;
      virtualWallLineColor: string;
      virtualWallLineWidth: number;
      virtualWallMaxNum: number;
    };
  };
  selectAreaConfig: {
    selectAreaAvailable: boolean;
    selectAreaProtocolVersion: mapProtocolVersion;
    selectAreaCountAvailable: boolean;
    selectAreaLineColor: string;
    selectAreaBgColor: string;
    selectAreaMaxNum: number;
    selectAreaTimesMaxNum: number;
  };
  selectPointConfig: {
    selectPointAvailable: boolean;
    selectPointUrl: string;
  };
  selectRoomConfig: {
    selectRoomAvailable: boolean;
    selectRoomCountAvailable: boolean;
    selectRoomTimesMaxNum: number;
  };
  scheduleConfig: {
    scheduleType: scheduleVersion;
    scheduleLocal: {
      scheduleLocalFan: {
        scheduleLocalFanAvailable: boolean;
        scheduleLocalFanDisableEnum: Array<string>;
        scheduleLocalFanEnum: Array<string>;
      };
      scheduleLocalLocationSet: boolean;
      scheduleLocalMaxNum: number;
      scheduleLocalCount: {
        scheduleLocalCountAvailable: boolean;
        scheduleLocalOrderDisableEnum: Array<string>;
        scheduleLocalCountEnum: Array<string>;
      };
      scheduleLocalWater: {
        scheduleLocalWaterAvailable: boolean;
        scheduleLocalWaterDisableEnum: Array<string>;
        scheduleLocalWaterEnum: Array<string>;
      };
      scheduleLocalMode: {
        scheduleLocalModeAvailable: boolean;
        scheduleLocalModeEnum: Array<string>;
      };
    };
  };
  ringConfig: {
    ringAvailable: boolean;
    ringBgColor: string;
    ringDuration: number;
    ringMaxRate: number;
  };
  pathConfig: {
    pathColor: {
      backCharge: string;
      common: string;
      reserved: string;
      transitions: string;
    };
    pathWidth: number;
  };
  timeFormatConfig: {
    scheduleTimeIs24: boolean;
    recordTimeIs24: boolean;
  };
  materialObjConfig: {
    materialObjAvaiable: boolean;
    materialObjWidth: number;
    materialObjHeight: number;
    materialObjEnum: Array<string>;
  };
}

export interface IDpData {
  [index: string]: string | number | boolean;
}
