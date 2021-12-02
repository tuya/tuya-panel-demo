import { Interface } from '../../../resourceManager';
import { IStore, IProps } from '../../interface';
import { ForbidTypeEnum } from '../../../../../../protocol/constant';
import {
  decodeToRCTArea,
  decodeToRCTWall,
  decodeToRCTCleanArea,
  decodeToRCTPoint,
} from '../../../../../../protocol/area';

// 虚拟信息整合
const format = (store: IStore, configs: IProps) => {
  const { uiInterFace, laserMapPanelConfig } = configs;

  const {
    forbiddenAreaConfig: { sweepForbiddenArea, virtualWall, mopForbiddenArea },
    selectAreaConfig: { selectAreaBgColor, selectAreaLineColor },
  } = laserMapPanelConfig;

  const { isShowAppoint, isShowAreaset } = uiInterFace || {};
  const {
    sweepRegionData,
    virtualAreaData,
    appointData,
    virtualMopAreaData,
    virtualWallData,
  } = store;
  const data: any = [];

  if (!!virtualAreaData && !!virtualAreaData.length) {
    data.push(
      ...decodeToRCTArea(virtualAreaData, [], data, {
        forbidType: ForbidTypeEnum.sweep,
        bgColor: sweepForbiddenArea.sweepForbiddenBgColor,
        borderColor: sweepForbiddenArea.sweepForbiddenLineColor,
      })
    );
  }

  if (!!virtualMopAreaData && !!virtualMopAreaData.length) {
    data.push(
      ...decodeToRCTArea(virtualMopAreaData, [], data, {
        forbidType: ForbidTypeEnum.mop,
        bgColor: mopForbiddenArea.mopForbiddenBgColor,
        borderColor: mopForbiddenArea.mopForbiddenLineColor,
      })
    );
  }
  if (!!virtualWallData && !!virtualWallData.length) {
    data.push(
      ...decodeToRCTWall(virtualWallData, [], data, {
        forbidType: ForbidTypeEnum.sweep,
        bgColor: virtualWall.virtualWallLineColor,
        lineWidth: virtualWall.virtualWallLineWidth,
      })
    );
  }
  if (isShowAreaset && !!sweepRegionData && !!sweepRegionData.length) {
    data.push(
      ...decodeToRCTCleanArea(sweepRegionData, [], data, {
        bgColor: selectAreaBgColor,
        borderColor: selectAreaLineColor,
      })
    );
  }
  if (isShowAppoint && !!appointData) {
    data.push(decodeToRCTPoint(appointData, [], data));
  }
  return JSON.stringify(data);
};

const validate = (value: any) => {
  return true;
};

const areaInfoList: Interface.IElementProps = {
  format,
  validate,
};

export default areaInfoList;
