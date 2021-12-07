import DPCodes, { getEnum } from './dpCodes';
import { hex2ahex, hex2rgba } from '../../utils';

export default {
  dpCodes: DPCodes,
  getEnum,
  localUiConfig: {
    theme: 'default',
    global: {
      buttonGrayColor: 'rgba(255,255,255,0.05)',
      pointsColor: [
        hex2rgba('#3775BF'), // 清扫点(地图背景颜色)
        hex2rgba('#7BC8FA'), // 障碍点(地图描边边框)、
        hex2rgba('#FFFFFF', 0), // 未知区域（看不见的点）
        hex2rgba('#7ED321'), // 充电桩
      ],
      pathColor: '#FFFFFF',
      controlBarsBackground: '#FFFFFF', // 按钮组
    },
    mapConfig: {
      sweepRegionColor: hex2ahex('#000000', 0.2), // 划区清扫区域框
      virtualAreaColor: hex2ahex('#F81C1C', 0.2), // 禁区框颜色
      virtualWallColor: hex2ahex('#F81C1C'), // 虚拟墙
      markerIcon: '/smart/Oval2x.png',
      appointIcon: '/smart/Group6@2x.png',
      pointsColor: [
        '#ABD6FFFF', // 清扫点(地图背景颜色)
        '#646464FF', //  障碍点(地图描边边框)、
        '#FFFFFF00', // 未知区域（看不见的点）
        '#7ED321FF', // 充电桩
      ],
      pathWidth: 0.5,
      planPathWidth: 0.5,
      pathColor: '#FFFFFF',
      pointTypeColorMap: JSON.stringify({
        barrier: hex2ahex('#646464'), // 障碍类型
        battery: hex2ahex('#7ED321'), // 充电点类型
        unknown: hex2ahex('#FFFFFF', 0), // 未知区域
        sweep: hex2ahex('#ABD6FF'), // 清扫类型
      }),
      splitColor: '#F1A842',
    },
  },
};
