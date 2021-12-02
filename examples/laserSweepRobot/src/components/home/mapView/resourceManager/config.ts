// // 返回RCT地图需要的Props对象
// import { IConfig } from './interface';

// const config: IConfig = {
//   //
//   store: {
//     bitmap: '',
//     dp: 0,
//   },
//   watch: {
//     bitmap: (store, oldStore, elementsConfig) => {
//       // todo
//     }
//   },
//   // 自执行任务
//   autoTask: {
//     ['taskName']: {
//       // 任务驱动动作
//       // @params nextData 来源为该动作的source提供
//       // @params store 指自身的store
//       action: (store, nextData) => {
//         // 返回值更新store
//         return {
//           dp: nextData,
//         };
//       },
//       // 任务驱动来源
//       source: (store, next) => {
//         let count = 0;
//         const timer = setInterval(() => {
//           count += 1;
//           next(count);
//         }, 2000);

//         return () => {
//           timer && clearInterval(timer)
//         }
//       },
//     },
//   },
//   // 组件配置，可以被elementPropsSchema、elementEventSchema接收
//   elementConfigs: {},
//   // RCT地图接收属性声明
//   elementPropsSchema: {
//     ['mapData']: {
//       // 格式化该属性的方法
//       // @params store 指自身的store
//       // @params configs 指自身的elementConfigs
//       format: (store, configs) => {
//         //
//         // 返回值传入 RCT地图组件
//         return {
//           data: store.dp,
//         };
//       },
//       // 值传入 UI Element 前的验证
//       validate: (value): boolean => {
//         return true;
//       },
//     },
//   },
//   // RCT地图 UI事件声明
//   elementEventSchema: {
//     ['onMapId']: {
//       // 事件产生时调用
//       // @params events 产生的事件
//       // @params store 指自身的store
//       // @params configs 指自身的elementConfigs
//       onEvent: (events, store, configs) => {},
//     },
//   },
// };

// export default config;
