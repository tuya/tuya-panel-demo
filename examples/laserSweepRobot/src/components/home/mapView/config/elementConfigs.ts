/* eslint-disable @typescript-eslint/no-empty-function */
import { mapDisplayModeEnum } from './interface';
import { DPCodes } from '../../../../config';

const defaultUiInterFace = {
  isEdit: false, // 是否编辑
  isShowAppoint: true, // 是否显示指拿扫哪
  isShowPileRing: false,
  isShowCurPosRing: false,
  isShowAreaset: false,
  isCustomizeMode: false,
  isSelectRoom: false,
};

const elementConfigs = {
  uiInterFace: defaultUiInterFace,
  history: {
    bucket: '',
    file: '',
  },
  DPCodes,
  mapDisplayMode: mapDisplayModeEnum.immediateMap,
  onMapId: data => { },
  onLongPressInAreaView: (data: { id: string }) => { },
  onLaserMapPoints: (data: any) => { },
  onClickSplitArea: () => { },
};

export default elementConfigs;
