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
  totalCount: number;
  compressBeforeLength: number;
  compressAfterLength: number;
  originData?: string;
}
export interface IStore extends ImapData {
  dataMapId: number;
  staticPrefix: string;
  // OSS 通道信息
  bucket: string;

  // 地图信息
  mapHeader: IMapHeader;
  mapData: {
    width: number;
    height: number;
    map: string;
    originMap?: string;
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
  originPathData?: string; // 原始路径数据
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
    isFoldable?: boolean; // 是否是折叠样式
    isEdit?: boolean; // 当前地图是否可修改
    isShowPileRing?: boolean; // 是否显示禁区ring
    isShowCurPosRing?: boolean; // 当前点ring
    isShowAppoint?: boolean; // 是否显示指哪扫哪点
    isShowAreaset?: boolean; // 是否显示清扫区域
    isCustomizeMode?: boolean;
    isSelectRoom?: boolean; // 是否显示选区清扫
  };

  // laserMapPanelConfig?: any,
  onMapId?: (data: { mapId: string }) => void;
  onLongPressInAreaView?: (data: { id: string }) => void;
  onLaserMapPoints?: (data: any) => void;
  onClickSplitArea?: (data: any) => void;
  onClickRoom?: (data: any) => void;
  onLoggerInfo?: (info: string | any) => void;
  onClickModel?: (data: {
    info: any;
    infoKey: string;
    scale: number;
    rotate: number;
    target: number;
    point: { x: number; y: number; z: number };
  }) => void;
  onModelLoadingProgress?: (data: { key: string; progress: number }) => void;
  onMapLoadEnd?: (success: boolean) => void;
  onClickRoomMoreProperties?: (properties: any) => void;
  onGestureChange?: (start: boolean) => void;
  onClickRoomProperties?: (data: any) => void;
  onPosPoints?: (data: { data: any; type: string }) => void;
  onClickMapView?: (data: { data: any; eventType: string }) => void;
  onSplitLine?: (data: { data: any; type: string }) => void;
  onScreenSnapshot?: (data: { image: string; width: number; height: number; step: string }) => void;
  onVirtualInfoRendered?: (data: { rendered: boolean; data: { areaInfoList: any } }) => void;
  onRenderContextLost?: (data: { info: string; timestamp: number }) => void;
  onRenderContextRestored?: (data: { info: string; timestamp: number }) => void;
  onContainerVisibilityChange?: (data: { info: string; timestamp: number }) => void;
  onRobotPositionChange?: (data: {
    position: { x: number; y: number };
    originPosition: { x: number; y: number };
  }) => void;
  onVirtualInfoOutOfBoundingBox?: (data: {
    target: number;
    type: number;
    isOutOfBoundingBox: boolean;
    data: {
      id: number;
      extend: any;
      areaType: number;
      content: any;
      points: { x: number; y: number }[];
    }}) => void;
  onClickMaterial?: (data: {
    operation: 'remove' | 'rotate' | 'resize' | 'edit' | 'move' | 'add' | 'click';
    target: number;
    type: number;
    data: {
      extends: { x: number; y: number; type: number };
      uri: string;
    };
  }) => void;

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

  mapLoadEnd?: boolean;
  isFreezeMap?: boolean;
  is3d?: boolean;
  snapshotImage?: { image: string; width: number; height: number } | undefined;
  pathVisible?: boolean;
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
  originPathData?: string; // 原始路径数据
}

export interface IMultiFloor {
  mapState: IDpData;
  virtualState?: IDpData;
}
