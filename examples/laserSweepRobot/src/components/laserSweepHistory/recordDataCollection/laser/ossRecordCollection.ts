/**  激光扫地机清扫记录 */

import { Utils, TYSdk } from 'tuya-panel-kit';

export default class OSSRecordCollection {
  status = {
    hasNextPage: false,
    offset: 0,
    isRequesting: false,
    pageSize: 10,
  };

  store = {
    logData: [], // 原始数据
    sectionListData: [], // SectionList 类型数据
    totalCount: 0,
  };

  setStatus = newStatus => {
    this.status = {
      ...this.status,
      ...newStatus,
    };
  };

  setStore = newStore => {
    this.store = {
      ...this.store,
      ...newStore,
    };
  };

  init = () => {
    this.setStatus({
      hasNextPage: false,
      offset: 0,
      isRequesting: false,
      pageSize: 10,
    });
    this.setStore({
      logData: [],
      sectionListData: [],
      totalCount: 0,
    });
  };

  getStatus = () => {
    return { ...this.status };
  };

  getStore = () => {
    return { ...this.store };
  };

  fetch = async (): Promise<void> => {
    const { isRequesting, offset, pageSize } = this.getStatus();

    if (isRequesting) return;

    this.setStatus({ isRequesting: true });
    // TYNative.showLoading();

    try {
      const d = await this.fetchData();
      const isNext = offset < d.totalCount;

      this.setStatus({
        hasNextPage: isNext,
        offset: isNext ? offset + pageSize : offset,
      });
    } catch (e) {
      console.log('fetch==', e);
    }

    TYSdk.mobile.hideLoading();
    this.setStatus({ isRequesting: false });
  };

  deleteLocalDataById = (id: number) => {
    const { logData } = this.getStore();
    const deleteIndex = logData.findIndex(item => item.id === id);
    const newLogData = [...logData];
    newLogData.splice(deleteIndex, 1);
    const dataSource = this.getSectionList(newLogData);
    this.setStore({ sectionListData: dataSource, logData: newLogData });
  };

  deleteRecordById = (id: number) => {
    return new Promise((resolve, reject) => {
      TYSdk.apiRequest(
        'tuya.m.common.file.delete',
        {
          devId: TYSdk.devInfo.devId,
          fileIds: id,
        },
        '1.0'
      )
        .then(d => {
          this.deleteLocalDataById(id);
          resolve(d);
        })
        .catch(e => {
          reject(e);
        });
    });
  };

  deleteRecordByIds = (ids: number[] = []) => {
    return new Promise((resolve, reject) => {
      TYSdk.apiRequest(
        'tuya.m.common.file.delete',
        {
          devId: TYSdk.devInfo.devId,
          fileIds: ids,
        },
        '1.0'
      )
        .then(d => {
          ids.forEach(id => this.deleteLocalDataById(id));
          resolve(d);
        })
        .catch(e => {
          reject(e);
        });
    });
  };

  getSectionList(data) {
    const titleList: { [index: string]: string } = {};
    const sectionList = [];
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const date: string = Utils.TimeUtils.dateFormat(
        'yyyy-MM-dd',
        new Date(parseInt(`${d.time}000`, 10))
      );

      if (!titleList[date]) {
        sectionList.push({
          title: date,
          data: [d],
        });
        titleList[date] = date;
      } else {
        for (let j = 0; j < sectionList.length; j++) {
          const dj = sectionList[j];
          const dateDj = dj.title;
          if (date === dateDj) {
            dj.data.push(d);
            break;
          }
        }
      }
    }
    return sectionList;
  }

  fetchData() {
    const { offset, pageSize } = this.getStatus();
    const { logData, sectionListData = [] } = this.getStore();

    return new Promise((resolve, reject) => {
      TYSdk.apiRequest(
        'tuya.m.dev.common.file.list',
        {
          devId: TYSdk.devInfo.devId,
          fileType: 'pic',
          offset,
          limit: pageSize,
          startTime: undefined,
          endTime: undefined,
        },
        '1.0'
      )
        .then(d => {
          const curD: any = Utils.JsonUtils.parseJSON(d);
          if (typeof curD.datas === 'undefined' || curD.datas.length === 0) {
            resolve(d);
          } else {
            const newData = this.getSectionList(curD.datas);

            this.setStore({
              logData: [...logData, ...curD.datas],
              sectionListData: [...sectionListData, ...newData],
              totalCount: curD.totalCount,
            });

            resolve(d);
          }
        })
        .catch(e => reject(e));
    });
  }

  parseOneRecord(item) {}
}
