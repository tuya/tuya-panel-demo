export interface ImapData {
  width: number;
  height: number;
  map: string;
  origin: { x: number; y: number };
  roomIdColorMap: string;
  roomInfo: string;
}

export interface IPathData {
  // ---路径信息
  id: number | undefined; // 路径Id
  pathId: number | undefined; // 路径Id
  pathData: { x: number; y: number; type: string }[] | [];
  totalCount: number;
  forceUpdate: boolean;
  type: string | number;
  startCount: number;
  isFull: boolean;
  hidden: false;
}

export interface IMapHeader {
  id: number;
  version?: number;
  roomEditable: boolean;
  type?: number;
  bgWidth: number;
  bgHeight: number;
  originData?: string;
}
export interface IStore extends ImapData {
  // OSS 通道信息
  bucket: string;

  // 地图信息
  mapHeader: IMapHeader;
  mapData: {
    width: number;
    height: number;
    map: string;
    origin: { x: number; y: number };
    roomIdColorMap: string;
    roomInfo: string;
    data: string;
  };
  pilePosition: { x?: number; y?: number };
  resolution: number;

  // -----区域信息
  appointData: { x?: number; y?: number }; // 指哪扫哪数据
  sweepRegionData: any[];
  virtualAreaData: any[];
  virtualWallData: any[];
  materialObjData: any[];
  virtualMopAreaData: any[];

  // ---路径信息
  pathId: number | undefined; // 路径Id
  pathData:
  | {
    x: number;
    y: number;
    type: string;
    hidden: boolean;
    rate: number;
    bgColor: string;
    duration: number;
    dataColors: {
      common: string;
      charge: string;
      transitions: string;
    };
  }[]
  | [];
  totalCount: number;
  forceUpdate: boolean;
  type: string | number;
  startCount: number;
  isFull: boolean;

  // ---导航路径信息
  planPathWidth?: number /** 规划路径宽度 */;
  planPathColor?: string /** 规划路径颜色 */;
  planPathData?: string /** 规划路径数据 */;
}

export interface IProps {
  mapDisplayMode: mapDisplayModeEnum | string; // 地图模式

  history?: {
    bucket: string;
    file: string;
    mapLen?: number;
    pathLen?: number;
  };
  uiInterFace?: {
    isEdit: boolean; // 当前地图是否可修改
    isShowPileRing: boolean; // 是否显示禁区ring
    isShowCurPosRing: boolean; // 当前点ring
    isShowAppoint: boolean; // 是否显示指哪扫哪点
    isShowAreaset: boolean; // 是否显示清扫区域
    isCustomizeMode: boolean;
    isSelectRoom: boolean; // 是否显示选区清扫
  };

  // laserMapPanelConfig?: any,
  onMapId?: (data: { mapId: string }) => void;
  onLongPressInAreaView?: (data: { id: string }) => void;
  onLaserMapPoints?: (data: any) => void;
  onClickSplitArea?: (data: any) => void;
  onClickRoom?: (data: any) => void;

  // dpCodes,
  DPCodes?: any;

  // 配置
  config?: any;
  laserMapPanelConfig?: any;

  // 房间属性临时数据
  // 修改房间属性后，把修改后数据保存到previewCustom中，等待机器上报，如果成功，数据存储到customConfig中，
  // 这样，就无须等待地图上报就可以展示修改后地图数据，修改前后地图不会闪烁
  preCustomConfig?: any;
  customConfig?: any;
  selectRoomData?: any; // 选区清扫房间数据，当isSelectRoom为true时生效
  foldableRoomIds?: Array<string>;
  fontColor?: string;
  iconColor?: string;
}

export enum mapDisplayModeEnum {
  immediateMap = 'immediateMap', // 实时地图
  history = 'history', // 历史地图
  splitMap = 'splitMap', // 地图分区
  multiFloor = 'multiFloor', // 地图管理
}

export type bitmapColorType = 'gray' | 'origin' | 'color' | string;

export interface IRoomIdColorMap {
  [index: string]: string;
}

export interface IRoomInfo {
  [index: string]: {
    normalColor: string;
    highlightColor: string;
    defaultSelected?: boolean;
    defaultOrder?: number;
    extend?: string;
    roomProperty?: { propertyType: string; value: string }[];
  };
}
export interface IDpData {
  [index: string]: string | number | boolean;
}

export interface IHistory {
  mapState: IDpData;
  pathState: IDpData;
  virtualState?: IDpData;
}

export interface IMultiFloor {
  mapState: IDpData;
  virtualState?: IDpData;
}
