import OSSRecord from './laser';

enum RecordSeries {
  LeiDong = 'LeiDong',
}

export default class RecordInstance {
  private static RecordInstance: any;

  static RecordCollectionMap = {
    [RecordSeries.LeiDong]: OSSRecord.LaserLeDongRecord,
  };

  static RecordSeries = RecordSeries;

  static set instanceRecordSeries(type: RecordSeries) {
    if (type === '') {
      console.error('type must be RecordSeries, but ""');
      return;
    }
    const Record = RecordInstance.RecordCollectionMap[type];
    if (!Record) {
      console.error('no record');
      return;
    }
    RecordInstance.RecordInstance = new Record();
  }

  static get instance() {
    return RecordInstance.RecordInstance;
  }
}
