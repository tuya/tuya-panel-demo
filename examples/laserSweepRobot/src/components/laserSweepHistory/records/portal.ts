import { Component } from 'react';
import { RecordInstance } from '../recordDataCollection';

const { RecordSeries } = RecordInstance;

export default class Portal {
  Component: Component;

  constructor(Component: Component) {
    this.Component = Component;
  }

  get [RecordSeries.LeiDong]() {
    RecordInstance.instanceRecordSeries = RecordSeries.LeiDong;
    return this.Component;
  }
}
