export default {
  powerCode: 'switch',
  fanSpeedCode: 'fan_speed_enum',
  modeCode: 'mode',
  airQualityCode: 'air_quality',
  airVolumeCode: 'air_volume',
  loopModeCode: 'loop_mode',
  pm25Code: 'pm25',
  tempIndoorCode: 'temp_indoor',
  tempOutdoorCode: 'temp_outdoor',
  humidityIndoorCode: 'humidity_indoor',
  humidityOutdoorCode: 'humidity_outdoor',
  eCO2Code: 'eco2',
  tvocCode: 'tvoc',
  hchoCode: 'ch2o_value',
  pm10Code: 'pm10',

  // 倒计时
  countdownSetCode: 'countdown', // 设置倒计时
  countdownLeftCode: 'countdown_left', // 倒计时剩余时间

  // 送风/排风系统功能
  freshAirValveCode: 'fresh_air_valve', // 新风阀
  supplyAirVolCode: 'supply_air_vol', // 送风风量
  supplyTempCode: 'supply_temp', // 送风温度
  supplyFanSpeedCode: 'supply_fan_speed', // 送风风速
  airExhaustFanCode: 'air_exhaust_fan', // 排风开关
  exhaustTempCode: 'exhaust_temp', // 排风温度
  exhaustAirVolCode: 'exhaust_air_vol', // 排风风量
  exhaustFanSpeedCode: 'exhaust_fan_speed', // 排风风速

  // 过滤系统
  primaryFilterLifeCode: 'primary_filter_life', // 初效滤网剩余/寿命
  primaryFilterResetCode: 'primary_filter_reset', // 初效滤网复位
  mediumFilterLifeCode: 'medium_filter_life', // 中效滤网剩余/寿命
  mediumFilterResetCode: 'medium_filter_reset', // 中效滤网滤芯复位
  highFilterLifeCode: 'high_filter_life', // 高效滤网剩余/寿命
  highFilterResetCode: 'high_filter_reset', // 高效滤网复位
  filterResetCode: 'filter_reset', // 滤芯复位
  filterLifeCode: 'filter_life', // 滤芯寿命

  // 消毒功能
  uvLightCode: 'uv_light',
  uvLiftCode: 'uv_life',

  // 杀菌功能
  sterilizeCode: 'sterilize', // 杀菌
  anionCode: 'anion', // 负离子

  // 预热/热交换功能
  bypassFunctionCode: 'bypass_function', // 旁通功能
  HeatCode: 'Heat', // 电辅热

  // 通用功能
  childLockCode: 'child_lock', // 童锁开关
  factoryResetCode: 'factory_reset', // 恢复出厂设置
  faultCode: 'fault', // 故障报警

  // 可设置参数新风系统
  pm25SetCode: 'pm25_set', // PM2.5参数设定
  eco2SetCode: 'eco2_set', // CO2参数设定
  temSetCode: 'temp_set', // 湿度设定
  humSetCode: 'humidity_set', // 温度设定
  tvocSetCode: 'tvoc_set', // TVOC参数设定
  pm10SetCode: 'pm10_set', // PM10参数设定
  hochSetCode: 'hcho_sensor_value', // HOCH参数设定

  // 其他功能
  airConditioningCode: 'air_conditioning', // 空调开关
  backLightCode: 'backlight', // 背光亮度
  purifyModeCode: 'purify_mode', // 净化模式
  purificationCode: 'purification', // 净化/除尘
  dehumidifierCode: 'dehumidifier', // 除湿
  defrostCode: 'defrost', // 化霜
};
