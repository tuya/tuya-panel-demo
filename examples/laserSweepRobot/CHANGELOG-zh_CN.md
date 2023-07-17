# Changelog

该项目的所有显着更改都将记录在该文件中。 请参阅 [standard-version](https://github.com/conventional-changelog/standard-version) 了解提交指南。


## [1.0.4] - 2023-07-17

- 将TYRCTLaserMap组件更改为跨端技术实现的IndoorMap组件

1. 添加ElementEvents回调，这些必须与IndoorMap一致，即使你不使用它。
  - onClickModel
  - onClickRoomMoreProperties
  - onClickRoomProperties
  - onContainerVisibilityChange
  - onGestureChange
  - onLoggerINfo
  - onMapLoadEnd
  - onModelLoadingProgress
  - onPosPoints
  - onRenderContextLost
  - onRenderContextRestored
  - onRobotPositionChange
  - onScreenSnapshot
  - onSplitLine
  - onVirtualInfoRendered

  详情请参见[@tuya/rn-robot-map](https://www.npmjs.com/package/@tuya/rn-robot-map)  

2. 添加ElementProps的参数注入IndoorMap组件
  - elementPropsSchema/d3BgColor/index.ts
  - elementPropsSchema/d3WallColor/index.ts
  - elementPropsSchema/d3EditWrapperParams/index.ts
  - elementPropsSchema/maxRoomPropertyLength/index.ts
  - elementPropsSchema/robotParams/index.ts
  - elementPropsSchema/selectParams/index.ts
  - elementPropsSchema/pilePosition/index.ts
  - elementPropsSchema/mergeRoomParams/index.ts
  
  详情请参见[@tuya/rn-robot-map](https://www.npmjs.com/package/@tuya/rn-robot-map) 


3. 更改地图数据和路径数据的解析方法
  - elementPropsSchema/decodePathFn/index.ts
  - elementPropsSchema/mapData/index.ts

4. 添加数据流目标
  - autoTask/realTimeOriginFullPathWithP2p
  - 更改 realTimeAutoTaskWithP2p、splitEditMapTaskWithP2p、splitEditMapTaskWithP2p 去适配数据流

5. 在非交互式地图组件中添加截图替换地图组件，减少性能损失
