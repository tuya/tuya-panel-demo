const store = {
  bucket: '',

  // 地图信息
  mapHeader: undefined,
  mapData: undefined,

  pilePosition: {},
  mapId: 0,
  width: 0,
  height: 0,
  resolution: 0,

  appointData: {},
  sweepRegionData: [],
  virtualAreaData: [],
  virtualAllAreaData: [],
  virtualMopAreaData: [],
  virtualAllWallData: [],

  pathId: undefined,
  pathData: [],
  hasPathInfo: false,
  startCount: 0,
  totalCount: 0,
};

export default store;
