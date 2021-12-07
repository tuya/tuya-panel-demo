import _ from 'lodash';

const nameCodeMap = {
  taskSW: 'switch_go',
  clearPower: 'pause',
  cleanSwitch: 'switch_go',
  pauseSwitch: 'pause',
  status: 'status',
  robotStatus: 'status',
  cleanTime: 'clean_time',
  cleanArea: 'clean_area',
  energy: 'battery_percentage',
  mode: 'mode',
  workMode: 'mode',
  moveCtrl: 'direction_control',
  suckMode: 'suction',
  mopMode: 'cistern',
  faultData: 'fault',
  commText: 'command_trans',
  commFlag: 'request',
  ResetMap: 'map_reset',
  pathData: 'path_data',
  chargeSwitch: 'switch_charge',
  location: 'seek',
  volume: 'volume_set',
  disturbSwitch: 'do_not_disturb',
  disturbTime: 'disturb_time_r',
  sideBshTm: 'edge_brush_life',
  mainBshTm: 'roll_brush_life',
  filterTm: 'filter_life',
  dusterCloth: 'rag_life',
  resetSideBshTm: 'edge_brush_life_reset',
  resetMainBshTm: 'roll_brush_life_reset',
  resetFilterTm: 'filter_reset',
  resetDusterCloth: 'rag_life_reset',

  breakClean: 'break_clean',
  voiceData: 'voice_data_r',
  deviceInfo: 'device_info_r',
  totalArea: 'clean_area_total',
  totalMinutes: 'clean_time_total',
  totalCount: 'clean_count_total',
  deviceTimer: 'device_timer_r', // 本地定时dp点
  customizeModeSwitch: 'customize_mode_switch',
  dustCollectionNum: 'dust_collection_num',
  dustCollectionSwitch: 'dust_collection_switch',
  language: 'language',

  modeValue: {
    smart: 'smart', // 自动清扫
    zone: 'zone', // 划区域清扫
    pose: 'pose', // 指哪扫哪
    wall: 'WALL', // 虚拟墙设置
    mop: 'MOP',
    sprial: 'part', // 局部清扫
    charge: 'chargego', // 回充
    selectRoom: 'selectroom', // 选择房间
  },
  commonFlagValues: {
    gmap: 'get_map',
    gpath: 'get_path',
    inmap: 'get_both', // old: in_map
  },

  nativeMapStatus: {
    normal: 0,
    pressToRun: 1,
    areaSet: 2,
    virtualArea: 3,
    virtualWall: 4,
    mapClick: 5,
    selectRoom: 6,
  },

  robotStatusEnum: {
    toCharge: 'goto_charge', // 回充的路上，去回充
    charging: 'charging', // 充电中
    fullCharge: 'charge_done', // 充满电
    pause: 'paused', // 暂停
    idle: 'standby', // 待机
    totaling: 'smart_clean', // 全局自动清扫中,
    totalingStandard: 'smart', // 全局自动清扫中,
    pointing: 'goto_pos', // 指哪扫哪
    areaing: 'zone_clean', // 划区清扫，
    parting: 'part_clean', // 局部清扫
    selectRoom: 'select_room', // 选区清扫
  },

  workModeEnum: {
    smart: 'smart', // 自动清扫
    zone: 'zone', // 区域清扫
    pose: 'pose', // 指哪扫哪
    part: 'part', // 局部
    backCharge: 'chargego', // 充电
    selectRoom: 'selectroom',
  },
};

function reverseKeyValue(data = {}) {
  return Object.entries(data).reduce((total, [key, value]) => total.set(value, key), new Map());
}

const codeNameMap = reverseKeyValue(nameCodeMap);

// 机器控制下发
const robotControlEnum = new Map([
  ['powerOff', 'power_off'], // 关机
  ['pause', 'do_pause'], // 暂停
  ['resume', 'do_resume'], // 暂停恢复
  ['partClean', 'part_clean'], // 局部清扫
  ['zoneClean', 'zone_clean'], // 区域清扫
  ['toCharge', 'goto_charge'], // 回充
]);

// 机器工作模式
const workModeEnum = new Map([
  ['smart', 'smart'], // 自动清扫
  ['backCharge', 'chargego'], // 回充模式
  ['pose', 'pose'], // 指哪扫哪
  ['zone', 'zone'], // 区域清扫
  ['part', 'part'], // 局部清扫
  ['standby', 'standby'], // 待机模式
  ['edge', 'wall_follow'], // 沿边清扫
  ['mop', 'mop'], // 拖地功能
  ['selectRoom', 'selectroom'], // 拖地功能
]);

// 机器工作状态
const robotStatusEnum = new Map([
  ['standby', 'standby'], // 待机
  ['auto', 'smart_clean'], // 自动清扫
  ['paused', 'paused'], // 暂停
  ['parting', 'part_clean'],
  ['pointing', 'goto_pos'], //
  ['pointArrived', 'pos_arrived'],
  ['pointUnarrived', 'pos_unarrive'],
  ['areaing', 'zone_clean'],
  ['toCharge', 'goto_charge'],
  ['charging', 'charging'],
  ['chargeDone', 'charge_done'],
  ['sleep', 'sleep'],
  ['fault', 'fault'],
  ['selectRoom', 'select_room'],
]);

const dpNameMapEnum = {
  robotStatus: robotStatusEnum,
  workMode: workModeEnum,
  robotControl: robotControlEnum,
};

function getEnum(dpCode, enumKey) {
  const dpName = codeNameMap.get(dpCode);
  const dpCodeEnum = dpNameMapEnum[dpName];
  return dpCodeEnum.get(enumKey);
}

export { getEnum };
export default nameCodeMap;
