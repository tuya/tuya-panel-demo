# RecordDataCollection 清扫记录数据合集

解决多种协议的扫地机清扫记录的获取方式不同，处理数据方式不同。

## 如何接入？

1. 实现新的方案商解析类

- 激光扫地机方案商

继承`OSSRecordCollection`类，并实现`parseOneRecord`方法，就好了。具体参考`laser/laser-yiwei.ts`。


2. 将新的类简单加入`./RecordInstance.ts`的`RecordCollectionMap`中。

3. `RecordsScene`组件中`Props.type`,对应`RecordCollectionMap`的`key`，在跳转路由时需要传递。
