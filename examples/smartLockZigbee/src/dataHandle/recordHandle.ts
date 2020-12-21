import apiRequestHandle from '../api';
import moment from 'moment';
import Strings from '../i18n';
import dpCodeConfig from '../config/dpCodes';
import { TYSdk } from 'tuya-panel-kit';
import { getOpenListNeedDpId } from '../utils/configParamHandle';
interface OpenItem {
  avatar: string;
  time: number;
  textInfo: string;
  unlockId: any;
}

export const getWarnListInfo = async (action: any, limit: number, offset: number) => {
  try {
    const data = await apiRequestHandle.getAlarmList(offset, limit);
    const handleData = data.datas;
    const needData: { title: string; data: any }[] | undefined = [];
    const currentDateList: any | undefined = [];
    const historyList: any | undefined = [];
    if (handleData) {
      handleData.forEach((item: any) => {
        const time = moment(item.gmtCreate)
          .format('YYYY-MM-DD')
          .toString();
        if (
          time ===
          moment()
            .format('YYYY-MM-DD')
            .toString()
        ) {
          currentDateList.push(item);
        } else {
          historyList.push(item);
        }
      });
      if (currentDateList.length > 0) {
        needData.push({ title: 'current', data: currentDateList });
      }
      if (historyList.length > 0) {
        needData.push({ title: 'history', data: historyList });
      }
    }
    action({
      list: needData,
      totalCount: data.totalCount,
      hasNext: data.hasNext,
      response: true,
    });
  } catch (err) {
    console.log(err);
    action({
      list: [],
      totalCount: 0,
      hasNext: false,
      response: true,
    });
  }
};

export const getOpenListInfo = async (action: any, limit: number, offset: number, userId: any) => {
  try {
    const dpIds = getOpenListNeedDpId(dpCodeConfig);
    const data = await apiRequestHandle.getOpenList(limit, offset, dpIds);
    const handleData = data.datas ? data.datas : [];
    const needData: any[] = [];
    handleData.forEach((item: any) => {
      const time = moment(item.gmtCreate)
        .format('YYYY-MM-DD')
        .toString();
      let textInfo = '';

      const dp = Object.keys(item.dps[0])[0];

      const name =
        userId === item.userId ? Strings.getLang('my') : item.userName ? item.userName + ' ' : '';
      textInfo = name + item.unlockName + ' ' + Strings.getDpLang(TYSdk.native.getDpCodeById(dp));

      const openItem: OpenItem = {
        avatar: item.avatar,
        time: item.gmtCreate,
        textInfo,
        unlockId: dp + '-' + Object.values(item.dps[0])[0],
      };
      const flag = needData.findIndex(element => {
        return element.title === time;
      });
      if (flag !== -1) {
        needData[flag].data.push(openItem);
      } else {
        const data: OpenItem[] = [];
        data.push(openItem);
        needData.push({
          title: time,
          data,
        });
      }
    });
    action({
      list: needData,
      totalCount: data.totalCount,
      hasNext: data.hasNext,
      response: true,
    });
  } catch (err) {
    console.log(err);
    action({
      list: [],
      totalCount: 0,
      hasNext: false,
      response: true,
    });
  }
};
