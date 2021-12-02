import { observable, action, computed, toJS } from 'mobx';

class MapDataStore {
  @observable.shallow
  data = {
    mapId: undefined, // native map ID，主页地图
    RCTAreaList: [], // 区域框
    tempAreaList: [], // 编辑时的临时区域数据
    selectRoomData: [],
    sweepRegionData: [],
    sweepCount: 1,
    roomEditable: false,
    bgWidth: 0,
    bgHeight: 0,
    origin: { x: 0, y: 0 },
    roomInfo: '',
    isEmptyMap: true,
    pilePosition: { x: 0, y: 0 },
    pathData: [],
    mapSize: {
      width: 0,
      height: 0,
    },
    curPos: { x: 0, y: 0 },
    foldableRoomIds: [], // 房间属性折叠数组
  };

  @action
  setData = newData => {
    const s = { ...this.data, ...newData };
    this.data = s;
  };

  @computed
  get getData() {
    return toJS(this.data);
  }
}

export default MapDataStore;
