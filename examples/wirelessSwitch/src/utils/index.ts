/* eslint-disable import/prefer-default-export */
import { Utils } from 'tuya-panel-kit';
import { store } from '../models';
import Strings from '../i18n';

const { convertX: cx } = Utils.RatioUtils;

export const getFaultStrings = (faultCode: string, faultValue: number, onlyPrior = true) => {
  const { devInfo } = store.getState();
  if (!faultValue) return '';
  const { label } = devInfo.schema[faultCode];
  const labels: string[] = [];
  for (let i = 0; i < label!.length; i++) {
    const value = label![i];
    const isExist = Utils.NumberUtils.getBitValue(faultValue, i);
    if (isExist) {
      labels.push(Strings.getDpLang(faultCode, value));
      if (onlyPrior) break;
    }
  }
  return onlyPrior ? labels[0] : labels.join(', ');
};

export const getTxt = (ele: number) => {
  let txt = '';
  let color = '#FF4444';
  if (ele >= 0 && ele < 20) {
    txt = Strings.getLang('lowEle');
    color = '#FF4444';
  } else if (ele >= 20 && ele < 70) {
    txt = Strings.getLang('mediumEle');
    color = '#F5A623';
  } else {
    txt = Strings.getLang('highEle');
    color = '#70CF98';
  }
  return { eleTxt: txt, color };
};

export interface GetTxt {
  eleTxt: string;
  color: string;
}

export const getDeviceInfo = (deviceData: any, item: any) => {
  const icon: any = [];
  if (item.actions) {
    item.actions.forEach((d: any) => {
      deviceData.forEach((dev: any) => {
        if (dev.devId === d.entityId) {
          icon.push(typeof dev.iconUrl === 'string' ? { uri: dev.iconUrl } : dev.iconUrl);
        }
      });
    });
  }
  return { icon, devLength: icon.length };
};

export const notDevice = [
  'dpIssue',
  'irIssue',
  'alarmIssue',
  'toggle',
  'dpStep',
  'irIssueVii',
  'delay',
  'ruleEnable',
];

export const getIconList = (item: any, devList: any) => {
  const list: any = [];
  if (item.actions) {
    const devArr = devList.map(d => d.devId);
    item.actions.forEach((d: any) => {
      const devIndex = devArr.indexOf(d.entityId);
      const isDev = devIndex !== -1;
      const dev = devList[devIndex];
      const actions = Object.values(d.actionDisplayNew);
      const actionStr: string[] = [];
      actions.forEach((dt: string[]) => {
        actionStr.push(dt.join(':'));
      });
      const iconUrl = typeof dev.iconUrl === 'string' ? { uri: dev.iconUrl } : dev.iconUrl;
      const defaultUrl =
        typeof d.defaultIconUrl === 'string' ? { uri: d.defaultIconUrl } : d.defaultIconUrl;
      list.push({
        image: isDev ? iconUrl : defaultUrl,
        devName: isDev ? dev.name : Strings.getLang(`${d.actionExecutor}_action`),
        actionDisplay: isDev ? actionStr.join(',') : Strings.getLang(`${d.actionExecutor}_display`),
      });
    });
  }
  return list;
};

export const getLength = (item: RequireType[], devList: RequireType[]) => {
  let length = 0;
  const devArr = devList.map((d: RequireType) => d.devId);
  item.forEach((it: any) => {
    if (it.actions) {
      const actIds = it.actions.map((d: RequireType) => d.entityId);
      let isDev = false;
      actIds.forEach((d: string) => {
        if (devArr.indexOf(d) !== -1) {
          isDev = true;
        }
      });
      length += isDev ? cx(134) : cx(106);
    } else {
      length += cx(106);
    }
  });
  return length;
};

export interface RequireType {
  [key: string]: string | number | boolean | any[];
}
